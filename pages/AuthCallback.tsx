import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LoaderIcon, AlertCircle } from 'lucide-react'

export function AuthCallback() {
  const { loading, session, user } = useAuth()
  const [redirectTimer, setRedirectTimer] = useState<NodeJS.Timeout | null>(null)
  const [authTimeout, setAuthTimeout] = useState<NodeJS.Timeout | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  // Função para adicionar logs de debug
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `[${timestamp}] ${message}`
    console.log('AuthCallback:', logMessage)
    setDebugInfo(prev => [...prev.slice(-4), logMessage]) // Manter apenas os últimos 5 logs
  }

  useEffect(() => {
    // Logs detalhados para debug do OAuth
    addDebugLog(`Estado inicial - loading: ${loading}, session: ${!!session}, user: ${!!user}`)
    addDebugLog(`URL atual: ${window.location.href}`)
    addDebugLog(`Origin: ${window.location.origin}`)
    addDebugLog(`Hostname: ${window.location.hostname}`)
    addDebugLog(`Search params: ${window.location.search}`)
    addDebugLog(`Hash: ${window.location.hash}`)
    
    // Limpar timers anteriores
    if (redirectTimer) {
      clearTimeout(redirectTimer)
      setRedirectTimer(null)
    }
    if (authTimeout) {
      clearTimeout(authTimeout)
      setAuthTimeout(null)
    }

    // Timeout de segurança para evitar loader infinito (15 segundos)
    const safetyTimeout = setTimeout(() => {
      addDebugLog('Timeout de segurança atingido - forçando redirecionamento')
      setError('Timeout na autenticação')
      window.location.replace(window.location.origin)
    }, 15000)
    setAuthTimeout(safetyTimeout)

    // Se não está carregando e temos uma sessão válida
    if (!loading && session) {
      addDebugLog('Sessão válida encontrada - preparando redirecionamento')
      
      // Verificar se o usuário foi carregado corretamente
      if (user) {
        addDebugLog('Dados do usuário carregados com sucesso')
        const timer = setTimeout(() => {
          addDebugLog('Redirecionando para página inicial')
          window.location.replace(window.location.origin)
        }, 1500)
        setRedirectTimer(timer)
      } else {
        addDebugLog('Aguardando carregamento dos dados do usuário...')
        // Aguardar um pouco mais para os dados do usuário carregarem
        const timer = setTimeout(() => {
          addDebugLog('Redirecionando mesmo sem dados completos do usuário')
          window.location.replace(window.location.origin)
        }, 3000)
        setRedirectTimer(timer)
      }
    }
    
    // Se não está carregando e não temos sessão
    else if (!loading && !session) {
      addDebugLog('Nenhuma sessão encontrada - erro na autenticação')
      setError('Falha na autenticação')
      
      const timer = setTimeout(() => {
        addDebugLog('Redirecionando para página inicial após erro')
        window.location.replace(window.location.origin)
      }, 3000)
      setRedirectTimer(timer)
    }
    
    // Se ainda está carregando
    else if (loading) {
      addDebugLog('Ainda processando autenticação...')
    }

    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer)
      }
      if (authTimeout) {
        clearTimeout(authTimeout)
      }
    }
  }, [loading, session, user])

  // Função para tentar novamente
  const handleRetry = () => {
    addDebugLog('Tentativa manual de redirecionamento')
    window.location.replace(window.location.origin)
  }

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-900 p-8">
      {error ? (
        <>
          <AlertCircle className="text-red-500 mb-4" size={48} />
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </>
      ) : (
        <>
          <LoaderIcon className="animate-spin text-blue-600 mb-4" size={48} />
          <p className="text-gray-300 text-lg mb-4">
            {loading ? 'Processando autenticação...' : 
             session ? 'Login realizado com sucesso! Redirecionando...' : 
             'Finalizando autenticação...'}
          </p>
        </>
      )}
      
      {/* Debug info - apenas em desenvolvimento */}
      {import.meta.env.DEV && (
        <div className="mt-8 p-4 bg-gray-800 rounded-lg max-w-md w-full">
          <h3 className="text-gray-400 text-sm font-semibold mb-2">Debug Info:</h3>
          <div className="text-xs text-gray-500 space-y-1">
            {debugInfo.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            <div>Loading: {loading.toString()}</div>
            <div>Session: {session ? 'presente' : 'ausente'}</div>
            <div>User: {user ? 'carregado' : 'não carregado'}</div>
          </div>
        </div>
      )}
    </div>
  )
}