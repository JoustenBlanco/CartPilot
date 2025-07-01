'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error during auth callback:', error.message)
          router.push('/auth?error=oauth_error')
          return
        }

        if (data.session) {
          const user = data.session.user
          console.log('User authenticated successfully:', user.id)
          
          // Intentar crear/actualizar perfil solo si tenemos metadata
          if (user.user_metadata?.full_name || user.user_metadata?.name) {
            const fullName = user.user_metadata.full_name || user.user_metadata.name
            console.log('Attempting to create/update profile for:', fullName)
            
            try {
              // Verificar si la tabla existe primero
              const { data: tableExists } = await supabase
                .from('profiles')
                .select('id')
                .limit(1)
              
              console.log('Profiles table check result:', tableExists)
              
              // Solo intentar upsert si la tabla existe
              const { data: upsertData, error: profileError } = await supabase
                .from('profiles')
                .upsert(
                  {
                    id: user.id,
                    full_name: fullName,
                    avatar_url: user.user_metadata.avatar_url || user.user_metadata.picture,
                  },
                  {
                    onConflict: 'id'
                  }
                )
              
              if (profileError) {
                console.error('Profile upsert error details:', {
                  error: profileError,
                  message: profileError.message,
                  details: profileError.details,
                  hint: profileError.hint,
                  code: profileError.code
                })
              } else {
                console.log('Profile upsert successful:', upsertData)
              }
            } catch (profileErr) {
              console.error('Exception during profile operations:', profileErr)
            }
          } else {
            console.log('No user metadata available for profile creation')
          }
          
          // Siempre redirigir independientemente del resultado del perfil
          console.log('Redirecting to home page...')
          router.push('/')
        } else {
          // No hay sesión, redirigir al login
          router.push('/auth')
        }
      } catch (error) {
        console.error('Error in auth callback:', error)
        router.push('/auth?error=callback_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--primary)' }}></div>
        <p style={{ color: 'var(--foreground)' }}>Procesando autenticación...</p>
      </div>
    </div>
  )
}
