'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function AuthForm({ initialMode = 'login', onBack = null }) {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  
  const { signIn, signUp, loading } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setIsError(false)

    if (!email || !password) {
      setMessage('Por favor, completa todos los campos')
      setIsError(true)
      return
    }

    if (isSignUp && !fullName.trim()) {
      setMessage('Por favor, ingresa tu nombre completo')
      setIsError(true)
      return
    }

    if (password.length < 6) {
      setMessage('La contraseña debe tener al menos 6 caracteres')
      setIsError(true)
      return
    }

    const { data, error } = isSignUp 
      ? await signUp(email, password, fullName.trim())
      : await signIn(email, password)

    if (error) {
      setMessage(error)
      setIsError(true)
    } else {
      if (isSignUp) {
        setMessage('¡Cuenta creada! Revisa tu email para confirmar tu cuenta.')
        setIsError(false)
      } else {
        setMessage('¡Bienvenido!')
        setIsError(false)
      }
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setMessage('')
    setIsError(false)
    setEmail('')
    setPassword('')
    setFullName('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-md w-full space-y-8">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center text-sm font-medium mb-4 transition-colors"
            style={{ color: 'var(--primary)' }}
            onMouseEnter={(e) => {
              e.target.style.color = 'var(--primary-hover)'
            }}
            onMouseLeave={(e) => {
              e.target.style.color = 'var(--primary)'
            }}
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            Volver al inicio
          </button>
        )}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold" style={{ color: 'var(--foreground)' }}>
            {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
          </h2>
          <p className="mt-2 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            CartPilot - Tu asistente de compras
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {isSignUp && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  Nombre completo
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required={isSignUp}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:z-10 sm:text-sm"
                  style={{ 
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--foreground)',
                    '--tw-ring-color': 'var(--primary)'
                  }}
                  placeholder="Tu nombre completo"
                />
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:z-10 sm:text-sm"
                style={{ 
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--foreground)',
                  '--tw-ring-color': 'var(--primary)'
                }}
                placeholder="tu@email.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:z-10 sm:text-sm"
                style={{ 
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--foreground)',
                  '--tw-ring-color': 'var(--primary)'
                }}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>

          {message && (
            <div className={`text-sm text-center p-3 rounded-md border ${
              isError 
                ? 'border-red-300' 
                : 'border-green-300'
            }`}
            style={{ 
              backgroundColor: isError ? '#fef2f2' : '#f0fdf4',
              color: isError ? 'var(--error)' : 'var(--success)'
            }}>
              {message}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: 'var(--primary)',
                '--tw-ring-color': 'var(--primary-dark)'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--primary-hover)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--primary)'}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </span>
              ) : (
                isSignUp ? 'Crear cuenta' : 'Iniciar sesión'
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm hover:underline"
              style={{ color: 'var(--primary)' }}
            >
              {isSignUp 
                ? '¿Ya tienes cuenta? Inicia sesión' 
                : '¿No tienes cuenta? Regístrate'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
