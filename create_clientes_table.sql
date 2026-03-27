create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  celular text not null unique,
  cpf text,
  endereco jsonb,
  criado_em timestamp with time zone default timezone('utc'::text, now())
);
