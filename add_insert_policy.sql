-- Adicionar política para permitir inserção de perfis
create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

-- Permitir que o serviço de autenticação insira perfis
create policy "Service role can insert profiles"
  on profiles for insert
  with check ( auth.role() = 'service_role' );
