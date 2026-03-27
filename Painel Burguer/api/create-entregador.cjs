// API SEGURA para cadastro de entregadores
// Dependências: npm install express cors @supabase/supabase-js dotenv express-rate-limit

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// ============================================
// CONFIGURAÇÃO DE SEGURANÇA
// ============================================

// 1. CORS Restrito - apenas localhost em desenvolvimento
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5174', // Painel Admin
      'http://localhost:5173', // App Principal
      'http://localhost:3000'  // Alternativa
    ];

    // Permite requisições sem origin (Postman, curl, etc) apenas em dev
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

// 2. Rate Limiting - máximo 5 requisições por minuto por IP
const createEntregadorLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5, // máximo 5 requisições
  message: { error: 'Muitas tentativas. Aguarde 1 minuto e tente novamente.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 3. Cliente Supabase com service key (admin)
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

// Cliente Supabase com anon key (para validar JWT)
const supabaseAnon = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

// ============================================
// MIDDLEWARE DE AUTENTICAÇÃO
// ============================================

async function verifyAdminAuth(req, res, next) {
  try {
    // Pega o token do header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token de autenticação não fornecido'
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    // Verifica o token com Supabase
    const { data: { user }, error } = await supabaseAnon.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'Token inválido ou expirado'
      });
    }

    // Verificar se o usuário é admin
    const { data: profile, error: profileError } = await supabaseAnon
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(403).json({
        error: 'Perfil de usuário não encontrado'
      });
    }

    if (profile.role !== 'admin') {
      logger.error('Tentativa de acesso não autorizado', null, {
        userId: user.id,
        email: user.email,
        role: profile.role
      });
      return res.status(403).json({
        error: 'Acesso negado. Apenas administradores podem criar entregadores.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    // Não usar logger aqui pois é Node.js, não browser
    console.error('Erro na verificação de autenticação:', errorMessage);
    return res.status(500).json({
      error: 'Erro ao verificar autenticação'
    });
  }
}

async function getRequesterTenantId(requesterUser) {
  // Prioriza profiles (fonte mais confiável no painel atual)
  const { data: profileData, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('tenant_id')
    .eq('id', requesterUser.id)
    .maybeSingle();

  if (!profileError && profileData?.tenant_id) {
    return profileData.tenant_id;
  }

  const metadataTenantId = requesterUser.app_metadata?.tenant_id || requesterUser.user_metadata?.tenant_id || null;
  if (metadataTenantId) {
    return metadataTenantId;
  }

  if (requesterUser.email) {
    const { data: ownerTenantData } = await supabaseAdmin
      .from('tenants')
      .select('id')
      .eq('owner_email', requesterUser.email)
      .maybeSingle();

    if (ownerTenantData?.id) {
      return ownerTenantData.id;
    }
  }

  return null;
}

// ============================================
// ROTAS
// ============================================

// Health check (sem autenticação)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Criar entregador (COM autenticação + rate limiting)
app.post('/create-entregador',
  createEntregadorLimiter,
  verifyAdminAuth,
  async (req, res) => {
    const { email, password, name } = req.body;

    // Validação de entrada
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Campos obrigatórios: email, password, name'
      });
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Email inválido'
      });
    }

    // Validação de senha (mínimo 6 caracteres)
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Senha deve ter no mínimo 6 caracteres'
      });
    }

    try {
      const tenantId = await getRequesterTenantId(req.user);
      if (!tenantId) {
        return res.status(400).json({
          error: 'Não foi possível identificar a loja do usuário autenticado.'
        });
      }

      // Log de auditoria
      console.log(`[AUDIT] Admin ${req.user.email} criando entregador: ${email}`);

      // Cria o usuário usando admin API
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
        console.error('Erro do Supabase:', error);
        return res.status(400).json({
          error: error.message
        });
      }

      // Garante profile do entregador
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
        console.error('Erro ao criar profile do entregador:', profileUpsertError);
        await supabaseAdmin.auth.admin.deleteUser(data.user.id);
        return res.status(400).json({
          error: 'Falha ao criar profile do entregador.'
        });
      }

      // Vincula entregador na loja do admin (modelo híbrido: 1..N lojas por entregador)
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
        console.error('Erro ao vincular entregador ao tenant:', tenantLinkError);
        await supabaseAdmin.auth.admin.deleteUser(data.user.id);
        return res.status(400).json({
          error: 'Falha ao vincular entregador à loja.'
        });
      }

      // Retorna apenas dados necessários (sem expor informações sensíveis)
      return res.status(201).json({
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: name,
          tenant_id: tenantId
        }
      });
    } catch (e) {
      console.error('Erro inesperado:', e);
      return res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }
);

// ============================================
// INICIALIZAÇÃO
// ============================================

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`✅ API segura de cadastro rodando na porta ${PORT}`);
  console.log(`🔒 CORS restrito a: localhost`);
  console.log(`⏱️  Rate limit: 5 requisições/minuto`);
  console.log(`🔐 Autenticação: JWT obrigatório`);
});
