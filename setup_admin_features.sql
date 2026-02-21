-- ===========================================
-- EXECUTE ESTE SCRIPT NO EDITOR SQL DO SUPABASE
-- Dashboard -> SQL Editor -> New Query -> Cole e execute
-- ===========================================

-- 1. TABELA: app_settings (Status do App: ATIVO / BLOQUEADO)
CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insere o status padrão como 'active'
INSERT INTO app_settings (key, value) VALUES ('app_status', 'active')
ON CONFLICT (key) DO NOTHING;

-- Habilita leitura pública (qualquer um pode checar se o app está ativo)
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read app_settings" ON app_settings FOR SELECT USING (true);
-- Apenas usuários autenticados com role master podem atualizar
CREATE POLICY "Master can update app_settings" ON app_settings FOR UPDATE USING (auth.email() = 'araucariainforma@gmail.com');


-- 2. TABELA: payment_requests (Aprovações de acesso dos clientes)
CREATE TABLE IF NOT EXISTS payment_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT,
    user_name TEXT,
    user_phone TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT now(),
    approved_at TIMESTAMPTZ,
    UNIQUE(user_id)
);

ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;

-- Usuário pode ver e inserir o próprio pedido
CREATE POLICY "User can insert own request" ON payment_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User can read own request" ON payment_requests FOR SELECT USING (auth.uid() = user_id);

-- Admin/Master pode ver todos e atualizar
CREATE POLICY "Admin can read all requests" ON payment_requests FOR SELECT USING (
    auth.email() IN ('araucariainforma@gmail.com', 'wagner.oliveira.mendes@escola.pr.gov.br')
);
CREATE POLICY "Admin can update requests" ON payment_requests FOR UPDATE USING (
    auth.email() IN ('araucariainforma@gmail.com', 'wagner.oliveira.mendes@escola.pr.gov.br')
);


-- 3. TABELA: profiles (Clientes Reais - sincronizada com auth.users)
-- Pode já existir. Se existir, este bloco pode ser ignorado.
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    email TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. FUNÇÃO: auto-cria perfil quando novo usuário se cadastra via Google
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    avatar_url = EXCLUDED.avatar_url;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que dispara ao criar novo usuário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
