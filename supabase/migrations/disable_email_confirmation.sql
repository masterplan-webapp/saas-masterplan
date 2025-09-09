-- Desabilitar confirmação de email para desenvolvimento
-- ATENÇÃO: Isso deve ser usado apenas em desenvolvimento!

-- Função para confirmar automaticamente emails de novos usuários
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS trigger AS $$
BEGIN
  -- Confirmar automaticamente o email do usuário
  UPDATE auth.users 
  SET email_confirmed_at = now()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger para confirmar automaticamente novos usuários
DROP TRIGGER IF EXISTS auto_confirm_new_users ON auth.users;
CREATE TRIGGER auto_confirm_new_users
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  WHEN (NEW.email_confirmed_at IS NULL)
  EXECUTE FUNCTION public.auto_confirm_user();

-- Confirmar usuários existentes que ainda não foram confirmados
UPDATE auth.users 
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;