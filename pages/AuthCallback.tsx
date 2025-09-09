import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LoaderIcon } from 'lucide-react'

export function AuthCallback() {
  const { loading, session, user } = useAuth()
  const [redirectTimer, setRedirectTimer] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Limpar timer anterior se existir
    if (redirectTimer) {
      clearTimeout(redirectTimer)
    }

    // Se não está carregando e temos uma sessão válida, redirecionar
    if (!loading && session) {
      const timer = setTimeout(() => {
        window.location.href = '/'
      }, 1000) // Reduzir o tempo para 1 segundo
      
      setRedirectTimer(timer)
    }
    
    // Se não está carregando e não temos sessão, algo deu errado
    if (!loading && !session) {
      const timer = setTimeout(() => {
        window.location.href = '/'
      }, 3000) // Aguardar mais tempo em caso de erro
      
      setRedirectTimer(timer)
    }

    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer)
      }
    }
  }, [loading, session, user])

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-900">
      <LoaderIcon className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-gray-300 text-lg">
        {loading ? 'Processando autenticação...' : 
         session ? 'Login realizado com sucesso! Redirecionando...' : 
         'Erro na autenticação. Redirecionando...'}
      </p>
    </div>
  )
}