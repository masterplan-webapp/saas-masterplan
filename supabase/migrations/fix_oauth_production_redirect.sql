-- Configurações OAuth para corrigir redirecionamento em produção
-- Este arquivo documenta as configurações necessárias no dashboard do Supabase

-- CONFIGURAÇÕES OBRIGATÓRIAS NO DASHBOARD DO SUPABASE:
-- Acesse: https://supabase.com/dashboard/project/oibdqytxyeauwbsfuxun/auth/providers

-- 1. Authentication > Providers > Google OAuth
-- 2. Site URL (URL principal do site):
--    https://traesaas-masterplan1t5t-fabio-zacaris-projects-2521886a.vercel.app

-- 3. Redirect URLs (URLs permitidas para redirecionamento após login):
--    https://traesaas-masterplan1t5t-fabio-zacaris-projects-2521886a.vercel.app/auth/callback
--    http://localhost:3001/auth/callback
--    http://localhost:3000/auth/callback

-- IMPORTANTE: 
-- - Remover qualquer referência a localhost nas configurações de produção
-- - Garantir que a URL da Vercel seja a principal
-- - Verificar se o Google OAuth está habilitado

-- VERIFICAÇÃO DAS CONFIGURAÇÕES ATUAIS:
SELECT 
    key,
    value
FROM auth.config
WHERE key IN ('SITE_URL', 'EXTERNAL_GOOGLE_REDIRECT_URI', 'EXTERNAL_GOOGLE_ENABLED');

-- LOGS PARA DEBUG:
-- Verificar se há erros de redirecionamento nos logs do Supabase
-- Dashboard > Logs > Auth logs

-- NOTA: As configurações OAuth devem ser feitas MANUALMENTE no dashboard
-- Este arquivo serve para documentação e verificação das configurações