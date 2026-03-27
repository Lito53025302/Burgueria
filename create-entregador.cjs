// API para cadastro de entregadores com vínculo automático ao tenant do admin.
// Dependências: npm install express cors @supabase/supabase-js dotenv express-rate-limit

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5174',
      'http://localhost:5173',
      'http://localhost:3000'
    ];

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Acesso negado por política CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

const createEntregadorLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Muitas tentativas. Aguarde 1 minuto e tente novamente.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const supabaseAnon = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function verifyAdminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabaseAnon.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Erro na verificação de autenticação:', error);
    return res.status(500).json({ error: 'Erro ao verificar autenticação' });
  }
}

async function getRequesterTenantId(requesterUserId, requesterAppMetadata) {
  const { data: profileData, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('tenant_id')
    .eq('id', requesterUserId)
    .maybeSingle();

  if (!profileError && profileData?.tenant_id) {
    return profileData.tenant_id;
  }

  return requesterAppMetadata?.tenant_id || null;
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/create-entregador', createEntregadorLimiter, verifyAdminAuth, async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Campos obrigatórios: email, password, name' });
  }

  try {
    const tenantId = await getRequesterTenantId(req.user.id, req.user.app_metadata);
    if (!tenantId) {
      return res.status(400).json({ error: 'Não foi possível identificar a loja do usuário autenticado.' });
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: 'deliverer',
        created_by: req.user.id,
        created_at: new Date().toISOString(),
        tenant_id: tenantId
      },
      app_metadata: {
        role: 'deliverer'
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const { error: profileUpsertError } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          id: data.user.id,
          email,
          name,
          role: 'deliverer',
          tenant_id: null
        },
        { onConflict: 'id' }
      );

    if (profileUpsertError) {
      await supabaseAdmin.auth.admin.deleteUser(data.user.id);
      return res.status(400).json({ error: 'Falha ao criar profile do entregador.' });
    }

    const { error: tenantLinkError } = await supabaseAdmin
      .from('deliverer_tenants')
      .upsert(
        {
          deliverer_id: data.user.id,
          tenant_id: tenantId,
          is_active: true
        },
        { onConflict: 'deliverer_id,tenant_id' }
      );

    if (tenantLinkError) {
      await supabaseAdmin.auth.admin.deleteUser(data.user.id);
      return res.status(400).json({ error: 'Falha ao vincular entregador à loja.' });
    }

    return res.status(201).json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name,
        tenant_id: tenantId
      }
    });
  } catch (e) {
    console.error('Erro inesperado:', e);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`API de cadastro rodando na porta ${PORT}`);
});
