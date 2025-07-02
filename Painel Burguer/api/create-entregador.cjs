// API para cadastro de entregadores usando a service key do Supabase
// Instale as dependências: npm install express cors @supabase/supabase-js dotenv

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? process.env.SUPABASE_SERVICE_KEY.substring(0, 10) + '...' : undefined);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Use a service key, nunca a anon key!
);

app.post('/create-entregador', async (req, res) => {
  console.log('Body recebido:', req.body); // <-- Adicione esta linha
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Dados obrigatórios faltando.' });
  }
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });
    if (error) {
      console.error('Erro do Supabase:', error);
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json({ user: data.user });
  } catch (e) {
    console.error('Erro inesperado:', e);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`API de cadastro rodando na porta ${PORT}`);
});
