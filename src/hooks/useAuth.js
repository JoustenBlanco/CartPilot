'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '@/lib/supabase'
import { handleAuthError, withAuthErrorHandling, clearAllAuthData } from '@/lib/auth-error-handler'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// Función auxiliar para obtener el perfil del usuario
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Función para cargar el perfil del usuario
  const loadUserProfile = async (userId) => {
    if (!userId) {
      setProfile(null)
      return
    }

    try {
      const { data, error } = await getUserProfile(userId)
      if (!error && data) {
        setProfile(data)
      } else {
        console.warn('Error loading user profile:', error)
        setProfile(null)
      }
    } catch (error) {
      console.error('Exception loading user profile:', error)
      setProfile(null)
    }
  }

  useEffect(() => {
    let timeoutId

    // Get initial session
    const getSession = async () => {
      try {
        setLoading(true)
        
        // Timeout de seguridad - si tarda más de 10 segundos, terminar loading
        timeoutId = setTimeout(() => {
          console.warn('Session loading timeout, setting loading to false')
          setLoading(false)
        }, 10000)
        
        // Obtener sesión directamente sin wrapper para evitar problemas
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error.message)
          // Manejar el error pero no bloquear
          await handleAuthError(error)
          setUser(null)
          setProfile(null)
          setLoading(false)
          clearTimeout(timeoutId)
          return
        }
        
        if (session?.user) {
          setUser(session.user)
          // Esperar a que termine de cargar el perfil antes de quitar el loading
          await loadUserProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
        
        clearTimeout(timeoutId)
        setLoading(false)
      } catch (error) {
        console.error('Error in getSession:', error.message)
        setUser(null)
        setProfile(null)
        clearTimeout(timeoutId)
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session ? 'has session' : 'no session')
        
        // Manejar eventos específicos de error de token
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.warn('Token refresh failed, clearing session')
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }

        // Manejar evento de logout
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }

        // Para otros eventos, actualizar el estado
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await loadUserProfile(session.user.id)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      subscription?.unsubscribe()
    }
  }, []) // loadUserProfile es estable, no necesita dependencias

  const signUp = async (email, password, fullName) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error

      // Si el usuario se creó exitosamente, usar upsert para crear/actualizar el perfil
      if (data.user && fullName) {
        // Usar upsert (insert or update) para evitar conflictos
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(
            {
              id: data.user.id,
              full_name: fullName,
              // No incluir avatar_url ya que la tabla no tiene esa columna
            },
            {
              onConflict: 'id'
            }
          )
        
        if (profileError) {
          console.error('Error upserting profile:', profileError)
        } else {
          console.log('Profile created/updated successfully for:', fullName)
        }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      
      // Intentar cerrar sesión con Supabase
      const { error } = await supabase.auth.signOut({
        scope: 'local' // Solo cerrar sesión local, no global
      })
      
      // Si hay un error, lo loggeamos pero no impedimos la limpieza local
      if (error) {
        console.warn('Error cerrando sesión en servidor:', error.message)
        
        // Si es un error de sesión faltante, intentar con signOut sin parámetros
        if (error.message.includes('Auth session missing')) {
          try {
            await supabase.auth.signOut()
          } catch (retryError) {
            console.warn('Retry signOut también falló:', retryError.message)
          }
        }
      }
      
    } catch (error) {
      console.error('Error signing out:', error.message)
    } finally {
      // Siempre limpiar el estado local, independientemente de si hubo errores
      setUser(null)
      setProfile(null)
      setLoading(false)
      
      // Limpiar datos del localStorage si existen
      try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.includes('supabase') || key.includes('sb-')) {
            localStorage.removeItem(key);
          }
        });
        
        const sessionKeys = Object.keys(sessionStorage);
        sessionKeys.forEach(key => {
          if (key.includes('supabase') || key.includes('sb-')) {
            sessionStorage.removeItem(key);
          }
        });
      } catch (e) {
        console.warn('Error limpiando storage:', e.message);
      }
      
      // Redirigir a la página de inicio
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    loadUserProfile,
    clearAllAuthData, // Función de emergencia para limpiar tokens
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
