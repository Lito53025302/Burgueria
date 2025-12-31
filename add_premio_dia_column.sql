-- Adiciona o campo de prêmio do dia na tabela loja_info
ALTER TABLE loja_info ADD COLUMN premio_dia VARCHAR(255) DEFAULT 'Nenhum prêmio definido';
