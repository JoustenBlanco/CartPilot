'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import AuthForm from '@/components/AuthForm'
import LoadingScreen from '@/components/LoadingScreen'

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Si el usuario ya está autenticado, redirigir al dashboard
    if (user && !loading) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return <LoadingScreen />
  }

  // Si el usuario ya está autenticado, no mostrar el formulario
  if (user) {
    return <LoadingScreen />
  }

  return <AuthForm initialMode="login" />
}
