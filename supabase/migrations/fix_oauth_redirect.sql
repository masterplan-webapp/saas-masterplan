-- Verificar e corrigir configurações OAuth do Google
-- Este arquivo serve para documentar as configurações necessárias

-- CONFIGURAÇÕES NECESSÁRIAS NO DASHBOARD DO SUPABASE:
-- 1. Authentication > Providers > Google
-- 2. Site URL: https://traesaas-masterplan1t5t-fabio-zacaris-projects-2521886a.vercel.app
-- 3. Redirect URLs:
--    - https://traesaas-masterplan1t5t-fabio-zacaris-projects-2521886a.vercel.app/auth/callback
--    - http://localhost:3001/auth/callback (para desenvolvimento)

-- VERIFICAR SE AS CONFIGURAÇÕES ESTÃO CORRETAS:
SELECT 
    key,
    value
FROM auth.config
WHERE key IN ('SITE_URL', 'EXTERNAL_GOOGLE_REDIRECT_URI');

-- NOTA: As configurações OAuth devem ser feitas manualmente no dashboard
-- Este arquivo serve apenas para documentação e verificação