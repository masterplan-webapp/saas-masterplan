import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService, userService, type User, type Subscription } from '../supabase/config'
import type { Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  subscription: Subscription | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>
  signInWithGoogle: () => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  updateProfile: (updates: Partial<User>) => Promise<{ error: any }>
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  // Carregar dados do usuário
  const loadUserData = async (userId: string) => {
    try {
      // Carregar perfil do usuário
      const { data: userData, error: userError } = await userService.getUserProfile(userId)
      if (userError) {
        console.error('Erro ao carregar perfil do usuário:', userError)
      } else {
        setUser(userData)
      }

      // Carregar assinatura do usuário
      const { data: subscriptionData, error: subscriptionError } = await userService.getUserSubscription(userId)
      if (subscriptionError) {
        console.error('Erro ao carregar assinatura:', subscriptionError)
      } else {
        setSubscription(subscriptionData)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error)
    }
  }

  // Função para atualizar dados do usuário
  const refreshUserData = async () => {
    if (session?.user?.id) {
      await loadUserData(session.user.id)
    }
  }

  // Inicializar autenticação
  useEffect(() => {
    let mounted = true

    // Verificar sessão atual
    const initializeAuth = async () => {
      try {
        const { session: currentSession } = await authService.getCurrentSession()
        
        if (mounted) {
          setSession(currentSession)
          
          if (currentSession?.user?.id) {
            await loadUserData(currentSession.user.id)
          }
          
          setLoading(false)
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Escutar mudanças de autenticação
    const { data: { subscription: authSubscription } } = authService.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log('Auth state changed:', event, session)
        setSession(session)

        if (session?.user?.id) {
          await loadUserData(session.user.id)
        } else {
          setUser(null)
          setSubscription(null)
        }

        setLoading(false)
      }
    )

    return () => {
      mounted = false
      authSubscription?.unsubscribe()
    }
  }, [])

  // Função de login
  const signIn = async (email: string, password: string) => {
    setLoading(true)
    const { error } = await authService.signInWithEmail(email, password)
    if (error) {
      setLoading(false)
    }
    return { error }
  }

  // Função de registro
  const signUp = async (email: string, password: string, displayName?: string) => {
    setLoading(true)
    const { error } = await authService.signUpWithEmail(email, password, displayName)
    if (error) {
      setLoading(false)
    }
    return { error }
  }

  // Função de login com Google
  const signInWithGoogle = async () => {
    setLoading(true)
    const { error } = await authService.signInWithGoogle()
    if (error) {
      setLoading(false)
    }
    return { error }
  }

  // Função de logout
  const signOut = async () => {
    setLoading(true)
    const { error } = await authService.signOut()
    setUser(null)
    setSession(null)
    setSubscription(null)
    setLoading(false)
    return { error }
  }

  // Função para atualizar perfil
  const updateProfile = async (updates: Partial<User>) => {
    if (!user?.id) {
      return { error: { message: 'Usuário não autenticado' } }
    }

    const { data, error } = await userService.updateUserProfile(user.id, updates)
    if (!error && data) {
      setUser(data)
    }
    return { error }
  }

  const value: AuthContextType = {
    user,
    session,
    subscription,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateProfile,
    refreshUserData
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook para verificar se o usuário tem uma assinatura específica
export function useSubscription() {
  const { subscription } = useAuth()
  
  const hasFeature = (feature: string): boolean => {
    if (!subscription) return false
    
    const planFeatures = {
      free: ['basic_planning', 'export_pdf'],
      pro: ['basic_planning', 'export_pdf', 'advanced_analytics', 'priority_support', 'custom_templates'],
      ai: ['basic_planning', 'export_pdf', 'advanced_analytics', 'priority_support', 'custom_templates', 'ai_suggestions', 'ai_optimization', 'ai_insights']
    }
    
    const features = planFeatures[subscription.plan_type] || []
    return features.includes(feature)
  }
  
  const canCreatePlans = (): boolean => {
    if (!subscription) return false
    
    const planLimits = {
      free: 3,
      pro: 50,
      ai: -1 // ilimitado
    }
    
    return planLimits[subscription.plan_type] === -1
  }
  
  return {
    subscription,
    hasFeature,
    canCreatePlans,
    isPro: subscription?.plan_type === 'pro',
    isAI: subscription?.plan_type === 'ai',
    isFree: subscription?.plan_type === 'free'
  }
}