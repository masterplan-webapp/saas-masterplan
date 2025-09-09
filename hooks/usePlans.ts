import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { planService } from '../supabase/config'
import { PlanData } from '../types'

export function usePlans() {
  const { user } = useAuth()
  const [plans, setPlans] = useState<PlanData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load plans from Supabase
  const loadPlans = async () => {
    if (!user) {
      setPlans([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const { data: userPlans, error: plansError } = await planService.getUserPlans(user.id)
      if (plansError) throw plansError
      
      // Convert database plans to PlanData format
      const formattedPlans = userPlans?.map(plan => plan.data) || []
      setPlans(formattedPlans)
    } catch (err: any) {
      console.error('Error loading plans:', err)
      setError(err.message || 'Erro ao carregar planos')
      
      // Fallback to localStorage if Supabase fails
      try {
        const localPlans = JSON.parse(localStorage.getItem('masterplan_plans') || '[]')
        setPlans(localPlans)
      } catch {
        setPlans([])
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Save plan to Supabase
  const savePlan = async (plan: PlanData) => {
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    try {
      const { error: saveError } = await planService.createPlan(user.id, plan.campaignName || 'Plano sem nome', plan)
      if (saveError) throw saveError
      
      // Update local state
      setPlans(prev => {
        const existingIndex = prev.findIndex(p => p.id === plan.id)
        if (existingIndex >= 0) {
          const updated = [...prev]
          updated[existingIndex] = plan
          return updated
        } else {
          return [...prev, plan]
        }
      })
      
      // Also save to localStorage as backup
      const updatedPlans = plans.some(p => p.id === plan.id) 
        ? plans.map(p => p.id === plan.id ? plan : p)
        : [...plans, plan]
      localStorage.setItem('masterplan_plans', JSON.stringify(updatedPlans))
      
    } catch (err: any) {
      console.error('Error saving plan:', err)
      
      // Fallback to localStorage
      const updatedPlans = plans.some(p => p.id === plan.id) 
        ? plans.map(p => p.id === plan.id ? plan : p)
        : [...plans, plan]
      localStorage.setItem('masterplan_plans', JSON.stringify(updatedPlans))
      setPlans(updatedPlans)
      
      throw new Error('Erro ao salvar plano. Salvo localmente como backup.')
    }
  }

  // Delete plan from Supabase
  const deletePlan = async (planId: string) => {
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    try {
      const { error: deleteError } = await planService.deletePlan(planId)
      if (deleteError) throw deleteError
      
      // Update local state
      setPlans(prev => prev.filter(p => p.id !== planId))
      
      // Also remove from localStorage
      const updatedPlans = plans.filter(p => p.id !== planId)
      localStorage.setItem('masterplan_plans', JSON.stringify(updatedPlans))
      
    } catch (err: any) {
      console.error('Error deleting plan:', err)
      
      // Fallback to localStorage
      const updatedPlans = plans.filter(p => p.id !== planId)
      localStorage.setItem('masterplan_plans', JSON.stringify(updatedPlans))
      setPlans(updatedPlans)
      
      throw new Error('Erro ao deletar plano. Removido localmente.')
    }
  }

  // Migrate localStorage plans to Supabase
  const migrateLocalPlans = async () => {
    if (!user) return

    try {
      const localPlans = JSON.parse(localStorage.getItem('masterplan_plans') || '[]')
      if (localPlans.length === 0) return

      console.log('Migrating', localPlans.length, 'plans to Supabase...')
      
      for (const plan of localPlans) {
        try {
          const { error: migrationError } = await planService.createPlan(user.id, plan.campaignName || 'Plano sem nome', plan)
          if (migrationError) throw migrationError
        } catch (err) {
          console.error('Error migrating plan:', plan.id, err)
        }
      }
      
      // Reload plans from Supabase
      await loadPlans()
      
      console.log('Migration completed')
    } catch (err) {
      console.error('Error during migration:', err)
    }
  }

  // Load plans when user changes
  useEffect(() => {
    loadPlans()
  }, [user])

  // Auto-migrate localStorage plans when user logs in
  useEffect(() => {
    if (user && plans.length === 0) {
      migrateLocalPlans()
    }
  }, [user, plans.length])

  return {
    plans,
    isLoading,
    error,
    savePlan,
    deletePlan,
    loadPlans,
    migrateLocalPlans
  }
}