import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://oibdqytxyeauwbsfuxun.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pYmRxeXR4eWVhdXdic2Z1eHVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNjM3MjQsImV4cCI6MjA3MjczOTcyNH0.iI1hLY1iLb6dY9IwVrYhjNnpBJ5w4FuInvt8qDizA_U'

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

// Tipos para autenticação
export interface User {
  id: string
  email: string
  display_name?: string
  photo_url?: string
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  plan_type: 'free' | 'pro' | 'ai'
  status: 'active' | 'canceled' | 'past_due' | 'incomplete'
  current_period_start?: string
  current_period_end?: string
  created_at: string
  updated_at: string
}

export interface Plan {
  id: string
  user_id: string
  name: string
  data: any
  created_at: string
  updated_at: string
}

export interface SharedLink {
  id: string
  plan_id: string
  share_token: string
  is_active: boolean
  expires_at?: string
  created_at: string
}

export interface PlanUsage {
  id: string
  user_id: string
  action_type: string
  metadata: any
  created_at: string
}

// Funções de autenticação
export const authService = {
  // Login com email e senha
  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Registro com email e senha
  async signUpWithEmail(email: string, password: string, displayName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split('@')[0]
        }
      }
    })
    return { data, error }
  },

  // Login com Google
  async signInWithGoogle() {
    // Detectar ambiente de produção de forma mais robusta
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    const isVercel = window.location.hostname.includes('vercel.app')
    const currentOrigin = window.location.origin
    
    // Forçar URL de produção se estivermos no Vercel
    let redirectTo: string
    if (isVercel) {
      // Garantir que usamos a URL correta do Vercel
      redirectTo = `${currentOrigin}/auth/callback`
    } else if (isLocalhost) {
      redirectTo = `${currentOrigin}/auth/callback`
    } else {
      // Fallback para qualquer outro ambiente
      redirectTo = `${currentOrigin}/auth/callback`
    }
    
    console.log('🔐 AuthService: Iniciando login com Google')
    console.log('🌐 AuthService: hostname:', window.location.hostname)
    console.log('🏠 AuthService: isLocalhost:', isLocalhost)
    console.log('☁️ AuthService: isVercel:', isVercel)
    console.log('🔗 AuthService: currentOrigin:', currentOrigin)
    console.log('↩️ AuthService: redirectTo:', redirectTo)
    console.log('🔧 AuthService: VITE_PRODUCTION_URL:', import.meta.env.VITE_PRODUCTION_URL)
    console.log('🌍 AuthService: window.location.href:', window.location.href)
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })
    
    console.log('✅ AuthService: Resultado do login Google:', { data, error })
    return { data, error }
  },

  // Logout
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' })
      return { error }
    } catch (error) {
      console.error('Erro durante signOut:', error)
      return { error }
    }
  },

  // Salvar plano do usuário
  async savePlan(userId: string, planData: any) {
    const { data, error } = await supabase
      .from('plans')
      .upsert({
        id: planData.id,
        user_id: userId,
        name: planData.campaignName || 'Plano sem nome',
        data: planData,
        updated_at: new Date().toISOString()
      })
      .select()
    
    if (error) throw error
    return data
  },

  // Buscar planos do usuário
  async getUserPlans(userId: string) {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    
    if (error) throw error
    return data?.map(plan => plan.data) || []
  },

  // Deletar plano
  async deletePlan(userId: string, planId: string) {
    const { error } = await supabase
      .from('plans')
      .delete()
      .eq('id', planId)
      .eq('user_id', userId)
    
    if (error) throw error
  },

  // Criar link compartilhado
  async createSharedLink(userId: string, planId: string, planData: any) {
    const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const { data, error } = await supabase
      .from('shared_links')
      .insert({
        id: shareId,
        user_id: userId,
        plan_id: planId,
        plan_data: planData,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      })
      .select()
    
    if (error) throw error
    return shareId
  },

  // Buscar plano compartilhado
  async getSharedPlan(shareId: string) {
    const { data, error } = await supabase
      .from('shared_links')
      .select('*')
      .eq('id', shareId)
      .gt('expires_at', new Date().toISOString())
      .single()
    
    if (error) throw error
    return data
  },

  // Obter usuário atual
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Obter sessão atual
  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // Escutar mudanças de autenticação
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      console.log('AuthService: Mudança de estado de autenticação:', { event, session: session ? 'presente' : 'ausente' })
      callback(event, session)
    })
  }
}



// Funções para gerenciar dados do usuário
export const userService = {
  // Obter perfil do usuário
  async getUserProfile(userId: string): Promise<{ data: User | null, error: any }> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  // Atualizar perfil do usuário
  async updateUserProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  // Obter assinatura do usuário
  async getUserSubscription(userId: string): Promise<{ data: Subscription | null, error: any }> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()
    return { data, error }
  }
}

// Funções para gerenciar planos
export const planService = {
  // Obter planos do usuário
  async getUserPlans(userId: string): Promise<{ data: Plan[] | null, error: any }> {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Criar novo plano
  async createPlan(userId: string, name: string, planData: any): Promise<{ data: Plan | null, error: any }> {
    const { data, error } = await supabase
      .from('plans')
      .insert({
        user_id: userId,
        name,
        data: planData
      })
      .select()
      .single()
    return { data, error }
  },

  // Atualizar plano
  async updatePlan(planId: string, updates: Partial<Plan>): Promise<{ data: Plan | null, error: any }> {
    const { data, error } = await supabase
      .from('plans')
      .update(updates)
      .eq('id', planId)
      .select()
      .single()
    return { data, error }
  },

  // Deletar plano
  async deletePlan(planId: string) {
    const { error } = await supabase
      .from('plans')
      .delete()
      .eq('id', planId)
    return { error }
  },

  // Obter plano por ID
  async getPlanById(planId: string): Promise<{ data: Plan | null, error: any }> {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single()
    return { data, error }
  }
}

// Funções para links compartilhados
export const shareService = {
  // Criar link compartilhado
  async createShareLink(planId: string, expiresAt?: string): Promise<{ data: SharedLink | null, error: any }> {
    const { data, error } = await supabase
      .from('shared_links')
      .insert({
        plan_id: planId,
        expires_at: expiresAt
      })
      .select()
      .single()
    return { data, error }
  },

  // Obter plano por token de compartilhamento
  async getPlanByShareToken(shareToken: string) {
    const { data, error } = await supabase
      .from('shared_links')
      .select(`
        *,
        plans!inner(*)
      `)
      .eq('share_token', shareToken)
      .eq('is_active', true)
      .single()
    return { data, error }
  },

  // Desativar link compartilhado
  async deactivateShareLink(shareToken: string) {
    const { error } = await supabase
      .from('shared_links')
      .update({ is_active: false })
      .eq('share_token', shareToken)
    return { error }
  }
}