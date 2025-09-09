import React, { useState } from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import { useLanguage } from '../../contexts';
import { Check, Crown, X, CreditCard, Calendar, AlertCircle } from 'lucide-react';

interface SubscriptionManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const {
    subscription,
    currentPlan,
    availablePlans,
    isLoading,
    error,
    upgradeSubscription,
    cancelSubscription
  } = useSubscription();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free') return;
    
    setIsUpgrading(true);
    setSelectedPlanId(planId);
    
    try {
      await upgradeSubscription(planId);
      alert('Assinatura atualizada com sucesso!');
    } catch (error) {
      console.error('Error upgrading:', error);
      alert('Erro ao atualizar assinatura. Tente novamente.');
    } finally {
      setIsUpgrading(false);
      setSelectedPlanId(null);
    }
  };

  const handleCancel = async () => {
    if (!subscription) return;
    
    const confirmed = window.confirm('Tem certeza que deseja cancelar sua assinatura? Ela permanecerá ativa até o final do período atual.');
    if (!confirmed) return;
    
    try {
      await cancelSubscription();
      alert('Assinatura cancelada. Permanecerá ativa até o final do período atual.');
    } catch (error) {
      console.error('Error canceling:', error);
      alert('Erro ao cancelar assinatura. Tente novamente.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'canceled': return 'text-orange-600';
      case 'past_due': return 'text-red-600';
      case 'trialing': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa';
      case 'canceled': return 'Cancelada';
      case 'past_due': return 'Em atraso';
      case 'trialing': return 'Período de teste';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-500" />
              Gerenciar Assinatura
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando informações da assinatura...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Current Subscription Status */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Assinatura Atual
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Plano</p>
                    <p className="font-semibold text-gray-900">{currentPlan.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Preço</p>
                    <p className="font-semibold text-gray-900">
                      {currentPlan.price === 0 ? 'Gratuito' : `R$ ${currentPlan.price.toFixed(2)}/${currentPlan.interval === 'month' ? 'mês' : 'ano'}`}
                    </p>
                  </div>
                  {subscription && (
                    <>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <p className={`font-semibold ${getStatusColor(subscription.status)}`}>
                          {getStatusText(subscription.status)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Próxima cobrança</p>
                        <p className="font-semibold text-gray-900 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(subscription.currentPeriodEnd)}
                        </p>
                      </div>
                      {subscription.cancelAtPeriodEnd && (
                        <div className="md:col-span-2">
                          <div className="bg-orange-100 border border-orange-200 rounded-lg p-3">
                            <p className="text-orange-800 text-sm">
                              <AlertCircle className="w-4 h-4 inline mr-1" />
                              Sua assinatura será cancelada em {formatDate(subscription.currentPeriodEnd)}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Available Plans */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Planos Disponíveis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {availablePlans.map((plan) => {
                    const isCurrentPlan = plan.id === currentPlan.id;
                    const isPro = plan.id !== 'free';
                    
                    return (
                      <div
                        key={plan.id}
                        className={`border rounded-lg p-6 relative ${
                          isCurrentPlan
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        } transition-colors`}
                      >
                        {isPro && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                              PRO
                            </span>
                          </div>
                        )}
                        
                        <div className="text-center mb-4">
                          <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
                          <div className="mt-2">
                            {plan.price === 0 ? (
                              <span className="text-2xl font-bold text-gray-900">Gratuito</span>
                            ) : (
                              <div>
                                <span className="text-3xl font-bold text-gray-900">R$ {plan.price.toFixed(2)}</span>
                                <span className="text-gray-600">/{plan.interval === 'month' ? 'mês' : 'ano'}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <ul className="space-y-3 mb-6">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-auto">
                          {isCurrentPlan ? (
                            <div className="text-center">
                              <span className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                                Plano Atual
                              </span>
                              {subscription && subscription.status === 'active' && !subscription.cancelAtPeriodEnd && plan.id !== 'free' && (
                                <button
                                  onClick={handleCancel}
                                  className="block w-full mt-3 px-4 py-2 text-sm text-red-600 hover:text-red-800 transition-colors"
                                >
                                  Cancelar Assinatura
                                </button>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleUpgrade(plan.id)}
                              disabled={isUpgrading || plan.id === 'free'}
                              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                                plan.id === 'free'
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : isUpgrading && selectedPlanId === plan.id
                                  ? 'bg-blue-400 text-white cursor-not-allowed'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {isUpgrading && selectedPlanId === plan.id
                                ? 'Processando...'
                                : plan.id === 'free'
                                ? 'Plano Gratuito'
                                : 'Assinar Agora'
                              }
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};