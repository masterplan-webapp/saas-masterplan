-- Verificar e corrigir problemas de autenticação

-- 1. Verificar se existe trigger para criar usuário automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  
  -- Criar assinatura gratuita padrão
  INSERT INTO public.subscriptions (user_id, plan_type, status)
  VALUES (new.id, 'free', 'active');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Verificar e corrigir políticas RLS

-- Políticas para tabela users
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para tabela subscriptions
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;
CREATE POLICY "Users can update own subscription" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para tabela plans
DROP POLICY IF EXISTS "Users can manage own plans" ON public.plans;
CREATE POLICY "Users can manage own plans" ON public.plans
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para tabela shared_links
DROP POLICY IF EXISTS "Users can manage own shared links" ON public.shared_links;
CREATE POLICY "Users can manage own shared links" ON public.shared_links
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM public.plans WHERE id = plan_id
    )
  );

DROP POLICY IF EXISTS "Anyone can view active shared links" ON public.shared_links;
CREATE POLICY "Anyone can view active shared links" ON public.shared_links
  FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Políticas para tabela plan_usage
DROP POLICY IF EXISTS "Users can view own usage" ON public.plan_usage;
CREATE POLICY "Users can view own usage" ON public.plan_usage
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own usage" ON public.plan_usage;
CREATE POLICY "Users can insert own usage" ON public.plan_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Garantir permissões para roles anon e authenticated
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.subscriptions TO authenticated;
GRANT ALL ON public.plans TO authenticated;
GRANT ALL ON public.shared_links TO authenticated;
GRANT ALL ON public.plan_usage TO authenticated;

-- Permitir que anon role veja shared_links públicos
GRANT SELECT ON public.shared_links TO anon;
GRANT SELECT ON public.plans TO anon;

-- 4. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de updated_at em todas as tabelas relevantes
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_plans_updated_at ON public.plans;
CREATE TRIGGER update_plans_updated_at
    BEFORE UPDATE ON public.plans
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();