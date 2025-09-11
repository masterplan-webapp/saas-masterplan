# 🔐 Teste OAuth Google em Produção

## Problema Identificado
O usuário relata que após fazer login com Google na URL de produção do Vercel, o site é redirecionado para localhost em vez de permanecer na URL da Vercel.

## URLs para Teste

### 1. Página de Teste OAuth (Produção)
```
https://traesaas-masterplan1t5t-fabio-zacaris-projects-2521886a.vercel.app/test-oauth.html
```

### 2. Aplicação Principal (Produção)
```
https://traesaas-masterplan1t5t-fabio-zacaris-projects-2521886a.vercel.app/
```

## Passos para Testar

### Teste 1: Página de Debug OAuth
1. Acesse: `https://traesaas-masterplan1t5t-fabio-zacaris-projects-2521886a.vercel.app/test-oauth.html`
2. Verifique as informações do ambiente mostradas na página
3. Clique em "🚀 Testar Login com Google"
4. **OBSERVAR**: Para onde o Google redireciona após o login
5. Verificar os logs de debug na página

### Teste 2: Aplicação Principal
1. Acesse: `https://traesaas-masterplan1t5t-fabio-zacaris-projects-2521886a.vercel.app/`
2. Clique em "Entrar com Google"
3. **OBSERVAR**: Para onde o Google redireciona após o login
4. Abrir DevTools (F12) e verificar logs no Console

## Logs Esperados (Produção)

Quando clicar em "Testar Login com Google" na página de debug, deve aparecer:

```
🔐 AuthService: Iniciando login com Google
🌐 AuthService: hostname: traesaas-masterplan1t5t-fabio-zacaris-projects-2521886a.vercel.app
🏠 AuthService: isLocalhost: false
☁️ AuthService: isVercel: true
🔗 AuthService: currentOrigin: https://traesaas-masterplan1t5t-fabio-zacaris-projects-2521886a.vercel.app
↩️ AuthService: redirectTo: https://traesaas-masterplan1t5t-fabio-zacaris-projects-2521886a.vercel.app/auth/callback
```

## Configurações do Supabase que Devem Estar Corretas

### Site URL
```
https://traesaas-masterplan1t5t-fabio-zacaris-projects-2521886a.vercel.app
```

### Redirect URLs (Authentication > URL Configuration)
```
https://traesaas-masterplan1t5t-fabio-zacaris-projects-2521886a.vercel.app/auth/callback
http://localhost:3000/auth/callback
http://localhost:3001/auth/callback
```

### Google OAuth Provider (Authentication > Providers > Google)
- ✅ Enabled: true
- ✅ Client ID: configurado
- ✅ Client Secret: configurado

## Possíveis Causas do Problema

1. **Configuração incorreta no Supabase Dashboard**
   - Site URL apontando para localhost
   - Redirect URLs não incluindo a URL do Vercel

2. **Configuração do Google OAuth**
   - Authorized redirect URIs no Google Console não incluindo a URL do Vercel

3. **Cache do navegador**
   - Limpar cache e cookies do navegador

4. **Variáveis de ambiente**
   - VITE_PRODUCTION_URL não sendo lida corretamente em produção

## Próximos Passos

1. **Testar manualmente** seguindo os passos acima
2. **Capturar logs** do console do navegador
3. **Verificar configurações** no Supabase Dashboard
4. **Verificar configurações** no Google Cloud Console
5. **Implementar correções** baseadas nos resultados

## Comandos Úteis para Debug

### Limpar cache do navegador (Console)
```javascript
// Limpar localStorage
localStorage.clear()

// Limpar sessionStorage
sessionStorage.clear()

// Recarregar página
location.reload()
```

### Verificar variáveis de ambiente (Console)
```javascript
// No ambiente de desenvolvimento
console.log('VITE_PRODUCTION_URL:', import.meta.env.VITE_PRODUCTION_URL)
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)

// Informações do ambiente atual
console.log('hostname:', window.location.hostname)
console.log('origin:', window.location.origin)
console.log('href:', window.location.href)
```

---

**Última atualização:** $(date)
**Status:** Aguardando teste manual