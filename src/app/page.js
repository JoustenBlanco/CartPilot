'use client'

import { useAuth } from '@/hooks/useAuth'
import AuthForm from '@/components/AuthForm'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 mx-auto" style={{ color: 'var(--primary)' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h2 className="mt-4 text-xl font-medium" style={{ color: 'var(--foreground)' }}>CartPilot</h2>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Cargando aplicación...</p>
        </div>
      </div>
    )
  }

  return user ? <Dashboard /> : <AuthForm />
}
