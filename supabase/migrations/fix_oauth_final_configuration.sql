-- Correção definitiva das configurações OAuth do Google
-- Este arquivo documenta as configurações necessárias no dashboard do Supabase

-- =====================================================
-- CONFIGURAÇÕES OBRIGATÓRIAS NO DASHBOARD SUPABASE
-- =====================================================

-- 1. AUTHENTICATION > PROVIDERS > GOOGLE
-- Habilitar: ✅ Enable sign in with Google
-- Client ID: [Seu Google Client ID]
-- Client Secret: [Seu Google Client Secret]

-- 2. AUTHENTICATION > URL CONFIGURATION
-- Site URL: https://traesaas-masterplan1t5t-fabio-zacaris-projects-2521886a.vercel.app
-- Redirect URLs (adicionar TODAS as seguintes):
-- https://traesaas-masterplan1t5t-fabio-zacaris-projects-2521886a.vercel.app/auth/callback
-- https://traesaas-masterplan1t5t-fabio-zacaris-projects-2521886a.vercel.app/**
-- http://localhost:5173/auth/callback (para desenvolvimento)
-- http://localhost:3000/auth/callback (para desenvolvimento)

-- 3. GOOGLE CLOUD CONSOLE - OAuth 2.0 Client IDs
-- Authorized JavaScript origins:
-- https://traesaas-masterplan1t5t-fabio-zacaris-projects-2521886a.vercel.app
-- https://oibdqytxyeauwbsfuxun.supabase.co
-- http://localhost:5173 (para desenvolvimento)
-- http://localhost:3000 (para desenvolvimento)

-- Authorized redirect URIs:
-- https://oibdqytxyeauwbsfuxun.supabase.co/auth/v1/callback
-- https://traesaas-masterplan1t5t-fabio-zacaris-projects-2521886a.vercel.app/auth/callback

-- =====================================================
-- VERIFICAÇÕES DE DIAGNÓSTICO
-- =====================================================

-- Verificar se as configurações estão corretas
SELECT 
    'Verificação de configuração OAuth' as status,
    'Site URL deve ser: https://traesaas-masterplan1t5t-fabio-zacaris-projects-2521886a.vercel.app' as site_url_required,
    'Redirect URL deve incluir: /auth/callback' as redirect_url_required,
    'Google Client deve estar configurado no dashboard' as google_config_required;

-- =====================================================
-- INSTRUÇÕES PARA CORREÇÃO MANUAL
-- =====================================================

-- PASSOS PARA CORRIGIR O ERRO net::ERR_ABORTED:
-- 1. Acesse o dashboard do Supabase: https://supabase.com/dashboard
-- 2. Selecione o projeto: oibdqytxyeauwbsfuxun
-- 3. Vá para Authentication > Providers
-- 4. Configure o Google OAuth:
--    - Enable sign in with Google: ✅
--    - Client ID: [Seu Google Client ID do Google Cloud Console]
--    - Client Secret: [Seu Google Client Secret do Google Cloud Console]
-- 5. Vá para Authentication > URL Configuration
-- 6. Configure:
--    - Site URL: https://traesaas-masterplan1t5t-fabio-zacaris-projects-2521886a.vercel.app
--    - Redirect URLs: 
--      * https://traesaas-masterplan1t5t-fabio-zacaris-projects-2521886a.vercel.app/auth/callback
--      * https://traesaas-masterplan1t5t-fabio-zacaris-projects-2521886a.vercel.app/**
--      * http://localhost:5173/auth/callback
-- 7. No Google Cloud Console (https://console.cloud.google.com):
--    - Vá para APIs & Services > Credentials
--    - Edite o OAuth 2.0 Client ID
--    - Authorized JavaScript origins:
--      * https://traesaas-masterplan1t5t-fabio-zacaris-projects-2521886a.vercel.app
--      * https://oibdqytxyeauwbsfuxun.supabase.co
--    - Authorized redirect URIs:
--      * https://oibdqytxyeauwbsfuxun.supabase.co/auth/v1/callback
-- 8. Salve todas as configurações
-- 9. Aguarde alguns minutos para propagação
-- 10. Teste o login novamente
-- 
-- O erro net::ERR_ABORTED geralmente indica que:
-- - As URLs de redirecionamento não estão configuradas corretamente
-- - O Google Client ID/Secret não estão configurados
-- - Há incompatibilidade entre as URLs configuradas no Supabase e no Google Cloud Console

-- =====================================================
-- LOGS PARA DEBUG
-- =====================================================

-- Esta query pode ser usada para verificar tentativas de login
-- (executar após configurar tudo)
SELECT 
    'OAuth Debug Info' as info,
    'Verifique os logs do browser console após tentar fazer login' as instruction,
    'URL do projeto: https://traesaas-masterplan1t5t-fabio-zacaris-projects-2521886a.vercel.app' as project_url,
    'URL do Supabase: https://oibdqytxyeauwbsfuxun.supabase.co' as supabase_url;