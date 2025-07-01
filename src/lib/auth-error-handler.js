import { supabase } from './supabase'

/**
 * Maneja errores de autenticación de Supabase
 * @param {Error} error - El error de Supabase
 * @returns {boolean} - True si el error fue manejado, false si debe ser relanzado
 */
export const handleAuthError = async (error) => {
  if (!error) return false

  const errorMessage = error.message?.toLowerCase() || ''
  
  // Errores relacionados con tokens que requieren limpiar la sesión
  const tokenErrors = [
    'invalid refresh token',
    'refresh token not found',
    'jwt expired',
    'invalid jwt',
    'token refresh failed'
  ]

  const isTokenError = tokenErrors.some(tokenError => 
    errorMessage.includes(tokenError)
  )

  if (isTokenError) {
    console.warn('Token error detected, clearing session:', error.message)
    
    try {
      // Limpiar la sesión local
      await supabase.auth.signOut()
      
      // Limpiar localStorage manualmente si es necesario
      if (typeof window !== 'undefined') {
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith('sb-') && key.includes('auth-token')) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
      }
      
      return true // Error manejado
    } catch (signOutError) {
      console.error('Error during session cleanup:', signOutError)
      return false
    }
  }

  return false // Error no manejado
}

/**
 * Wrapper para ejecutar operaciones de Supabase con manejo de errores
 * @param {Function} operation - La operación a ejecutar
 * @returns {Promise} - El resultado de la operación
 */
export const withAuthErrorHandling = async (operation) => {
  try {
    return await operation()
  } catch (error) {
    const wasHandled = await handleAuthError(error)
    if (!wasHandled) {
      throw error
    }
    // Si el error fue manejado, retornar un resultado neutral
    return { data: null, error: null }
  }
}

/**
 * Verifica si la sesión actual es válida
 * @returns {Promise<boolean>} - True si la sesión es válida
 */
export const isSessionValid = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      await handleAuthError(error)
      return false
    }
    
    return !!session
  } catch (error) {
    await handleAuthError(error)
    return false
  }
}

/**
 * Limpia manualmente todos los datos de autenticación
 * Útil como método de emergencia cuando hay problemas persistentes
 */
export const clearAllAuthData = async () => {
  try {
    console.log('Clearing all authentication data...')
    
    // Hacer sign out en Supabase
    await supabase.auth.signOut()
    
    // Limpiar localStorage completamente de datos de Supabase
    if (typeof window !== 'undefined') {
      const allKeys = Object.keys(localStorage)
      const supabaseKeys = allKeys.filter(key => 
        key.startsWith('sb-') || 
        key.includes('supabase') || 
        key.includes('auth-token')
      )
      
      supabaseKeys.forEach(key => {
        console.log('Removing key:', key)
        localStorage.removeItem(key)
      })
      
      // También limpiar sessionStorage por si acaso
      const sessionKeys = Object.keys(sessionStorage)
      const supabaseSessionKeys = sessionKeys.filter(key => 
        key.startsWith('sb-') || 
        key.includes('supabase') || 
        key.includes('auth-token')
      )
      
      supabaseSessionKeys.forEach(key => {
        console.log('Removing session key:', key)
        sessionStorage.removeItem(key)
      })
    }
    
    console.log('Authentication data cleared successfully')
    return true
  } catch (error) {
    console.error('Error clearing auth data:', error)
    return false
  }
}

// Exponer función globalmente para debugging (solo en desarrollo)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.clearAllAuthData = clearAllAuthData
}
