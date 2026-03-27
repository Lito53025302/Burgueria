CREATE TABLE loja_info (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    horario_funcionamento VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inserir dados iniciais
INSERT INTO loja_info (nome, endereco, horario_funcionamento) VALUES
('Burgueria Gourmet', 'Av. Principal, 1000 - Centro', 'Ter-Dom: 18h às 23h');
