-- Permitir SELECT para todos na tabela clientes
create policy "Public Select Clientes" on clientes
  for select using (true);

-- Permitir INSERT para todos na tabela clientes
create policy "Public Insert Clientes" on clientes
  for insert with check (true);

-- Ativar Row Level Security (RLS) se ainda não estiver ativo
alter table clientes enable row level security;
