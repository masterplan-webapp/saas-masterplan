-- Verificar e corrigir configurações OAuth para produção Vercel
-- Data: 2025-01-16
-- Objetivo: Garantir que o redirecionamento OAuth funcione corretamente em produção

-- 1. Verificar configurações atuais de autenticação
SELECT 
    key,
    value,
    description
FROM auth.config 
WHERE key IN (
    'SITE_URL',
    'URI_ALLOW_LIST',
    'EXTERNAL_GOOGLE_ENABLED',
    'EXTERNAL_GOOGLE_CLIENT_ID',
    'EXTERNAL_GOOGLE_REDIRECT_URI'
)
ORDER BY key;

-- 2. Atualizar SITE_URL para produção se necessário
-- Comentado para verificação manual primeiro
-- UPDATE auth.config 
-- SET value = 'https://traesaas-masterplan1t5t-fabio-zacaris-projects-2521886a.vercel.app'
-- WHERE key = 'SITE_URL';

-- 3. Atualizar URI_ALLOW_LIST para incluir URLs de produção e desenvolvimento
-- Comentado para verificação manual primeiro
-- UPDATE auth.config 
-- SET value = 'https://traesaas-masterplan1t5t-fabio-zacaris-projects-2521886a.vercel.app/auth/callback,http://localhost:3000/auth/callback,http://localhost:3001/auth/callback,http://localhost:5173/auth/callback'
-- WHERE key = 'URI_ALLOW_LIST';

-- 4. Verificar se Google OAuth está habilitado
-- UPDATE auth.config 
-- SET value = 'true'
-- WHERE key = 'EXTERNAL_GOOGLE_ENABLED';

-- 5. Verificar configurações após as mudanças
SELECT 
    'Configurações OAuth após verificação' as status,
    key,
    value
FROM auth.config 
WHERE key IN (
    'SITE_URL',
    'URI_ALLOW_LIST',
    'EXTERNAL_GOOGLE_ENABLED'
)
ORDER BY key;

-- 6. Verificar se existem sessões ativas que podem estar causando problemas
SELECT 
    COUNT(*) as total_sessions,
    COUNT(CASE WHEN expires_at > NOW() THEN 1 END) as active_sessions,
    COUNT(CASE WHEN expires_at <= NOW() THEN 1 END) as expired_sessions
FROM auth.sessions;

-- 7. Verificar usuários com problemas de autenticação recentes
SELECT 
    u.email,
    u.created_at,
    u.last_sign_in_at,
    u.email_confirmed_at,
    COUNT(s.id) as session_count
FROM auth.users u
LEFT JOIN auth.sessions s ON u.id = s.user_id
WHERE u.last_sign_in_at > NOW() - INTERVAL '24 hours'
GROUP BY u.id, u.email, u.created_at, u.last_sign_in_at, u.email_confirmed_at
ORDER BY u.last_sign_in_at DESC;

-- Comentários para próximos passos:
-- 1. Execute esta migração para verificar as configurações atuais
-- 2. Se necessário, descomente e execute os UPDATEs
-- 3. Teste o OAuth em produção
-- 4. Verifique os logs de autenticação no