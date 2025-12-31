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

    // Verifica se o usuário é admin (você pode adicionar uma coluna role na tabela profiles)
    // Por enquanto, qualquer usuário autenticado pode criar entregadores
    // TODO: Adicionar verificação de role admin

    req.user = user;
    next();
  } catch (error) {
    console.error('Erro na verificação de autenticação:', error);
    return res.status(500).json({
      error: 'Erro ao verificar autenticação'
    });
  }
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
      // Log de auditoria
      console.log(`[AUDIT] Admin ${req.user.email} criando entregador: ${email}`);

      // Cria o usuário usando admin API
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name,
          role: 'entregador',
          created_by: req.user.id,
          created_at: new Date().toISOString()
        },
      });

      if (error) {
        console.error('Erro do Supabase:', error);
        return res.status(400).json({
          error: error.message
        });
      }

      // Retorna apenas dados necessários (sem expor informações sensíveis)
      return res.status(201).json({
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: name
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
