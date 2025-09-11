-- Correção definitiva para redirecionamento OAuth em produção
-- Data: 2025-01-16
-- Objetivo: Garantir que o OAuth redirecione corretamente para a URL da Vercel

-- IMPORTANTE: Este arquivo documenta as configurações que devem ser aplicadas
-- manualmente no dashboard do Supabase em Authentication > URL Configuration

/*
CONFIGURAÇÕES OBRIGATÓRIAS NO DASHBOARD SUPABASE:

1. Site URL:
   https://traesaas-masterplan1t5t-fabio-zacaris-projects-2521886a.vercel.app

2. Redirect URLs (adicionar TODAS as seguintes):
   https://traesaas-masterplan1t5t-fabio-zacaris-projects-2521886a.vercel.app/auth/callback
   https://traesaas-masterplan1t5t-fabio-zacaris-projects-2521886a.vercel.app/**
   http://localhost:3000/auth/callback
   http://localhost:3001/auth/callback

3. Verificar se NÃO há configurações antigas com:
   - http://localhost:3000 (sem /auth/callback)
   - URLs incorretas ou desatualizadas

PASSOS PARA APLICAR:
1. Acesse o dashboard do Supabase
2. Vá em Authentication > URL Configuration
3. Configure Site URL com a URL da Vercel
4. Adicione todas as Redirect URLs listadas acima
5. Remova qualquer URL incorreta ou desatualizada
6. Salve as configurações
7. Aguarde alguns minutos para propagação

VERIFICAÇÃO:
- Teste o login com Google na URL de produção
- Verifique se redireciona para a URL da Vercel
- Confirme que não há redirecionamento para localhost:3000
*/

-- Verificar configurações atuais (apenas para referência)
SELECT 
    'Site URL deve ser: https://traesaas-masterplan1t5t-fabio-zacaris-projects-2521886a.vercel.app' as configuracao_necessaria
UNION ALL
SELECT 
    'Redirect URLs devem incluir: https://traesaas-masterplan1t5t-fabio-zacaris-projects-2521886a.vercel.app/auth/callback' as configuracao_necessaria
UNION ALL
SELECT 
    'Verificar se não há URLs localhost:3000 sem /auth/callback' as configuracao_necessaria;

-- Log de aplicação desta correção
INSERT INTO public.system_logs (message, created_at) 
VALUES (
    'Aplicada correção de OAuth para produção Vercel - configurações manuais necessárias no dashboard',
    NOW()
) ON CONFLICT DO NOTHING;