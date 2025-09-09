import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService, userService } from '../supabase/config';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  maxPlans: number;
  maxSharedLinks: number;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Gratuito',
    price: 0,
    interval: 'month',
    features: [
      'Até 3 planos de marketing',
      'Exportação em PDF',
      'Suporte básico'
    ],
    maxPlans: 3,
    maxSharedLinks: 1
  },
  {
    id: 'pro',
    name: 'Profissional',
    price: 29.90,
    interval: 'month',
    features: [
      'Planos ilimitados',
      'Geração com IA',
      'Links compartilhados ilimitados',
      'Suporte prioritário',
      'Análises avançadas'
    ],
    maxPlans: -1, // unlimited
    maxSharedLinks: -1 // unlimited
  },
  {
    id: 'pro-yearly',
    name: 'Profissional Anual',
    price: 299.90,
    interval: 'year',
    features: [
      'Planos ilimitados',
      'Geração com IA',
      'Links compartilhados ilimitados',
      'Suporte prioritário',
      'Análises avançadas',
      '2 meses grátis'
    ],
    maxPlans: -1, // unlimited
    maxSharedLinks: -1 // unlimited
  }
];

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCurrentPlan = (): SubscriptionPlan => {
    if (!subscription || subscription.status !== 'active') {
      return SUBSCRIPTION_PLANS[0]; // free plan
    }
    return SUBSCRIPTION_PLANS.find(plan => plan.id === subscription.planId) || SUBSCRIPTION_PLANS[0];
  };

  const loadSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await userService.getUserSubscription(user.id);

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw fetchError;
      }

      setSubscription(data);
    } catch (err) {
      console.error('Error loading subscription:', err);
      setError('Erro ao carregar assinatura');
    } finally {
      setIsLoading(false);
    }
  };

  const canCreatePlan = (currentPlanCount: number): boolean => {
    const plan = getCurrentPlan();
    return plan.maxPlans === -1 || currentPlanCount < plan.maxPlans;
  };

  const canCreateSharedLink = (currentLinkCount: number): boolean => {
    const plan = getCurrentPlan();
    return plan.maxSharedLinks === -1 || currentLinkCount < plan.maxSharedLinks;
  };

  const upgradeSubscription = async (planId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    // In a real implementation, this would integrate with Stripe
    // For now, we'll just create a mock subscription
    const newSubscription: Omit<UserSubscription, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: user.id,
      planId,
      status: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      cancelAtPeriodEnd: false
    };

    try {
      // Note: This would integrate with Stripe in a real implementation
      // For now, we'll simulate the subscription creation
      const mockSubscription = {
        id: `sub_${Date.now()}`,
        ...newSubscription,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as UserSubscription;
      
      setSubscription(mockSubscription);
      return mockSubscription;
    } catch (err) {
      console.error('Error upgrading subscription:', err);
      throw new Error('Erro ao atualizar assinatura');
    }
  };

  const cancelSubscription = async () => {
    if (!subscription) throw new Error('No active subscription');

    try {
      // Note: This would integrate with Stripe in a real implementation
      const updatedSubscription = {
        ...subscription,
        cancelAtPeriodEnd: true,
        updatedAt: new Date().toISOString()
      };
      
      setSubscription(updatedSubscription);
      return updatedSubscription;
    } catch (err) {
      console.error('Error canceling subscription:', err);
      throw new Error('Erro ao cancelar assinatura');
    }
  };

  useEffect(() => {
    loadSubscription();
  }, [user]);

  return {
    subscription,
    currentPlan: getCurrentPlan(),
    availablePlans: SUBSCRIPTION_PLANS,
    isLoading,
    error,
    canCreatePlan,
    canCreateSharedLink,
    upgradeSubscription,
    cancelSubscription,
    reloadSubscription: loadSubscription
  };
};