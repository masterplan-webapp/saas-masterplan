// Export all contexts from a centralized location
export { AuthProvider, useAuth } from './AuthContext'

// Re-export existing contexts from the main contexts.tsx file
export { LanguageProvider, useLanguage } from '../contexts'
export { ThemeProvider, useTheme } from '../contexts'