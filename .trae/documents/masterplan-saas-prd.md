# Documento de Requisitos do Produto - MasterPlan SaaS

## 1. Visão Geral do Produto

O MasterPlan AI é uma plataforma SaaS de planejamento de mídia inteligente que utiliza IA para ajudar profissionais de marketing a criar, analisar e otimizar campanhas publicitárias. A transformação do MVP atual em um SaaS completo permitirá que usuários criem contas, salvem seus planos e acessem funcionalidades premium através de assinaturas escalonadas.

O produto resolve o problema da complexidade no planejamento de mídia digital, oferecendo automação inteligente e ferramentas integradas para criação de campanhas eficazes. O mercado-alvo são agências de marketing, freelancers e empresas que precisam de soluções profissionais para planejamento de mídia.

## 2. Funcionalidades Principais

### 2.1 Papéis de Usuário

| Papel        | Método de Registro    | Permissões Principais                                       |
| ------------ | --------------------- | ----------------------------------------------------------- |
| Usuário Free | Email ou Google OAuth | Criar 1 plano, ferramentas básicas, compartilhamento PDF    |
| Usuário Pro  | Upgrade via Stripe    | Planos ilimitados, modelos, compartilhamento avançado       |
| Usuário AI   | Upgrade via Stripe    | Todas as funcionalidades + IA completa, ferramentas futuras |

### 2.2 Módulos de Funcionalidades

Nossa plataforma SaaS consiste nas seguintes páginas principais:

1. **Página de Login/Registro**: autenticação via email/Google, recuperação de senha
2. **Dashboard Principal**: visão geral dos planos, estatísticas de uso, gestão de assinatura
3. **Editor de Planos**: criação manual, por modelo ou IA, análise inteligente
4. **Ferramentas Auxiliares**: UTM Builder, Keyword Builder, Copy Builder, Creative Builder
5. **Configurações de Conta**: perfil do usuário, billing, preferências
6. **Página de Assinaturas**: planos disponíveis, upgrade/downgrade, histórico de pagamentos

### 2.3 Detalhes das Páginas

| Nome da Página | Nome do Módulo   | Descrição da Funcionalidade                                                                                        |
| -------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------ |
| Login/Registro | Autenticação     | Implementar login via email/senha e Google OAuth. Incluir recuperação de senha e verificação de email              |
| Dashboard      | Visão Geral      | Exibir lista de planos salvos, estatísticas de uso do plano atual, botões de upgrade, acesso rápido às ferramentas |
| Dashboard      | Gestão de Planos | Criar novo plano (manual/                                                                                          |

