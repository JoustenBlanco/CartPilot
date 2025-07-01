'use client'

import { useAuth } from '@/hooks/useAuth'
import LandingPage from '@/components/LandingPage'
import Dashboard from '@/components/Dashboard'
import LoadingScreen from '@/components/LoadingScreen'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  return user ? <Dashboard /> : <LandingPage />
}
