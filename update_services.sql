-- RODE ESTE SCRIPT NO EDITOR SQL DO SUPABASE

-- Limpa os serviços existentes (opcional, para garantir que só fiquem os novos)
DELETE FROM services;

-- Insere os novos serviços e preços
INSERT INTO services (name, price) VALUES
('Cabelo', 30.00),
('Barba', 20.00),
('Barba + Cabelo + Sobrancelha', 50.00),
('Sobrancelha', 10.00),
('Luzes', 130.00),
('Platinado', 130.00),
('Reflexo Alinhado', 130.00);
