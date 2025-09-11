import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos
export interface User {
  id: string
  email: string
  display_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'canceled' | 'past_due'
  current_period_start: string
  current_period_end: string
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

// Funções de autenticação
export const authService = {
  // Login com email e senha
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Registro com email e senha
  async signUp(email: string, password: string, displayName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName
        }
      }
    })
    return { data, error }
  },

  // Login com Google
  async signInWithGoogle() {
    // Detectar ambiente de forma mais robusta
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    const isVercel = window.location.hostname.includes('vercel.app')
    const currentOrigin = window.location.origin
    const productionUrl = import.meta.env.VITE_PRODUCTION_URL
    
    // Determinar URL de redirecionamento baseada no ambiente
    let redirectTo: string
    
    if (isLocalhost) {
      // Desenvolvimento local
      redirectTo = `${currentOrigin}/auth/callback`
    } else if (isVercel && productionUrl) {
      // Produção no Vercel - usar URL de produção configurada
      redirectTo = `${productionUrl}/auth/callback`
    } else if (isVercel) {
      // Fallback para Vercel sem URL de produção configurada
      redirectTo = `${currentOrigin}/auth/callback`
    } else {
      // Outros ambientes
      redirectTo = `${currentOrigin}/auth/callback`
    }
    
    console.log('🔐 AuthService: Iniciando login com Google')
    console.log('🌐 AuthService: hostname:', window.location.hostname)
    console.log('🏠 AuthService: isLocalhost:', isLocalhost)
    console.log('☁️ AuthService: isVercel:', isVercel)
    console.log('🔗 AuthService: currentOrigin:', currentOrigin)
    console.log('🏭 AuthService: productionUrl:', productionUrl)
    console.log('↩️ AuthService: redirectTo:', redirectTo)
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
  }
}