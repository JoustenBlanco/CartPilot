'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useAlert } from '@/components/AlertSystem'

export default function AuthForm({ initialMode = 'login', onBack = null }) {
  const router = useRouter()
  const { showAlert } = useAlert()
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [showGoogleSuggestion, setShowGoogleSuggestion] = useState(false)
  const [debugInfo, setDebugInfo] = useState('')
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0)
  
  const { signIn, signUp, signInWithGoogle, loading } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setIsError(false)
    setDebugInfo('Iniciando proceso de login...')

    // Verificar si el usuario está bloqueado temporalmente
    if (isBlocked) {
      const blockedMessage = `Demasiados intentos fallidos. Inténtalo de nuevo en ${blockTimeRemaining} segundos.`
      showAlert(
        `Tu cuenta está temporalmente bloqueada por seguridad. Espera ${blockTimeRemaining} segundos antes de intentar nuevamente.`,
        'warning',
        { 
          title: 'Cuenta bloqueada',
          duration: 5000 
        }
      )
      setMessage(blockedMessage)
      setIsError(true)
      setDebugInfo('Usuario bloqueado temporalmente')
      return
    }

    if (!email || !password) {
      setMessage('Por favor, completa todos los campos')
      setIsError(true)
      setDebugInfo('')
      return
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setMessage('Por favor, ingresa un email válido')
      setIsError(true)
      setDebugInfo('Error: Formato de email inválido')
      return
    }

    if (isSignUp && !fullName.trim()) {
      setMessage('Por favor, ingresa tu nombre completo')
      setIsError(true)
      setDebugInfo('')
      return
    }

    if (password.length < 6) {
      setMessage('La contraseña debe tener al menos 6 caracteres')
      setIsError(true)
      setDebugInfo('')
      return
    }

    // Validación adicional de contraseña para registro
    if (isSignUp) {
      if (password.length < 8) {
        setMessage('Para mayor seguridad, usa al menos 8 caracteres en tu contraseña')
        setIsError(true)
        setDebugInfo('Error: Contraseña muy corta para registro')
        return
      }
      
      // Verificar que la contraseña tenga al menos una letra y un número
      const hasLetter = /[a-zA-Z]/.test(password)
      const hasNumber = /\d/.test(password)
      
      if (!hasLetter || !hasNumber) {
        setMessage('La contraseña debe contener al menos una letra y un número')
        setIsError(true)
        setDebugInfo('Error: Contraseña no cumple criterios de seguridad')
        return
      }
    }

    setDebugInfo('Intentando autenticación...')
    const { data, error } = isSignUp 
      ? await signUp(email, password, fullName.trim())
      : await signIn(email, password)

    setDebugInfo(`Resultado: data=${!!data}, error=${!!error}`)

    if (error) {
      console.log('Error completo:', error)
      console.log('Error message:', error.toLowerCase())
      
      const errorMessage = error.toLowerCase()
      
      // Validaciones específicas para diferentes tipos de errores de credenciales
      if (errorMessage.includes('invalid login credentials') || 
          errorMessage.includes('invalid credentials') ||
          errorMessage.includes('wrong password') ||
          errorMessage.includes('incorrect password')) {
        
        // Incrementar contador de intentos fallidos
        const newFailedAttempts = failedAttempts + 1
        setFailedAttempts(newFailedAttempts)
        
        if (newFailedAttempts >= 3) {
          setIsBlocked(true)
          setBlockTimeRemaining(30) // 30 segundos de bloqueo
          
          // Timer para reducir el tiempo de bloqueo
          const timer = setInterval(() => {
            setBlockTimeRemaining(prev => {
              if (prev <= 1) {
                setIsBlocked(false)
                setFailedAttempts(0)
                clearInterval(timer)
                return 0
              }
              return prev - 1
            })
          }, 1000)
          
          setMessage('Demasiados intentos fallidos. Cuenta bloqueada temporalmente por 30 segundos.')
          showAlert(
            'Demasiados intentos fallidos. Tu cuenta ha sido bloqueada temporalmente por 30 segundos por seguridad.',
            'warning',
            { 
              title: 'Cuenta bloqueada temporalmente',
              duration: 10000 
            }
          )
        } else {
          if (!isSignUp) {
            const alertMessage = `Email o contraseña incorrectos. Si te registraste con Google, usa el botón de abajo.`
            showAlert(
              alertMessage,
              'error',
              { 
                title: 'Credenciales incorrectas',
                duration: 8000 
              }
            )
            setMessage(alertMessage)
            setShowGoogleSuggestion(true)
          } else {
            setMessage('Error en el registro. Verifica tus datos.')
            setShowGoogleSuggestion(false)
          }
        }
        
        setDebugInfo('Error: Credenciales inválidas detectadas')
      } 
      else if (errorMessage.includes('user not found') || 
               errorMessage.includes('email not found')) {
        
        if (!isSignUp) {
          showAlert(
            'No encontramos una cuenta con este email. Si te registraste con Google, usa el botón de abajo, o crea una cuenta nueva.',
            'info',
            { 
              title: 'Usuario no encontrado',
              duration: 8000 
            }
          )
          setMessage('No encontramos una cuenta con este email. Si te registraste con Google, usa el botón de abajo, o crea una cuenta nueva.')
          setShowGoogleSuggestion(true)
          setDebugInfo('Error: Usuario no encontrado')
        } else {
          setMessage('Error en el registro. Inténtalo de nuevo.')
          setShowGoogleSuggestion(false)
        }
      }
      else if (errorMessage.includes('email not confirmed') || 
               errorMessage.includes('email confirmation')) {
        
        showAlert(
          'Tu cuenta existe pero necesitas confirmar tu email. Revisa tu bandeja de entrada y haz clic en el enlace de confirmación.',
          'info',
          { 
            title: 'Email no confirmado',
            duration: 10000 
          }
        )
        setMessage('Tu cuenta existe pero necesitas confirmar tu email. Revisa tu bandeja de entrada.')
        setShowGoogleSuggestion(false)
        setDebugInfo('Error: Email no confirmado')
      }
      else if (errorMessage.includes('too many requests') || 
               errorMessage.includes('rate limit')) {
        
        setMessage('Demasiados intentos. Espera unos minutos antes de intentar de nuevo.')
        setShowGoogleSuggestion(false)
        setDebugInfo('Error: Límite de intentos excedido')
      }
      else if (errorMessage.includes('weak password') || 
               errorMessage.includes('password should be')) {
        
        setMessage('La contraseña es muy débil. Usa al menos 8 caracteres con mayúsculas, minúsculas y números.')
        setShowGoogleSuggestion(false)
        setDebugInfo('Error: Contraseña débil')
      }
      else if (errorMessage.includes('signup requires a valid password')) {
        
        setMessage('La contraseña no cumple los requisitos. Debe tener al menos 6 caracteres.')
        setShowGoogleSuggestion(false)
        setDebugInfo('Error: Contraseña inválida para registro')
      }
      else if (errorMessage.includes('user already registered') || 
               errorMessage.includes('email already exists')) {
        
        showAlert(
          'Esta cuenta ya existe. Si te registraste con Google, usa el botón "Continuar con Google" para acceder.',
          'warning',
          { 
            title: 'Cuenta existente',
            duration: 8000 
          }
        )
        setMessage('Esta cuenta ya existe. Si te registraste con Google, usa el botón "Continuar con Google" para acceder.')
        setShowGoogleSuggestion(true)
        setDebugInfo('Error: Email ya registrado')
      }
      else if (errorMessage.includes('network') || 
               errorMessage.includes('connection')) {
        
        setMessage('Error de conexión. Verifica tu internet e inténtalo de nuevo.')
        setShowGoogleSuggestion(false)
        setDebugInfo('Error: Problema de red')
      }
      else {
        // Error genérico o no reconocido
        console.log('Error no reconocido, mostrando mensaje específico')
        setMessage('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.')
        setShowGoogleSuggestion(false)
        setDebugInfo(`Error no categorizado: ${error}`)
      }
      
      setIsError(true)
      // NO redirigir cuando hay error - mantener el formulario visible
    } else {
      // Reset failed attempts on successful login
      setFailedAttempts(0)
      setIsBlocked(false)
      setBlockTimeRemaining(0)
      
      setDebugInfo('Login exitoso')
      if (isSignUp) {
        showAlert(
          '¡Cuenta creada exitosamente! Revisa tu email para confirmar tu cuenta antes de iniciar sesión.',
          'success',
          { 
            title: '¡Registro exitoso!',
            duration: 8000 
          }
        )
        setMessage('¡Cuenta creada! Revisa tu email para confirmar tu cuenta.')
        setIsError(false)
        setShowGoogleSuggestion(false)
      } else {
        showAlert(
          '¡Bienvenido de vuelta! Redirigiendo al dashboard...',
          'success',
          { 
            title: '¡Inicio de sesión exitoso!',
            duration: 3000 
          }
        )
        setMessage('¡Bienvenido! Redirigiendo...')
        setIsError(false)
        setShowGoogleSuggestion(false)
        // Solo redirigir en caso de éxito
        setTimeout(() => {
          router.push('/')
        }, 1000)
      }
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setMessage('')
    setIsError(false)
    setShowGoogleSuggestion(false)
    setDebugInfo('')
    setEmail('')
    setPassword('')
    setFullName('')
    setFailedAttempts(0)
    setIsBlocked(false)
    setBlockTimeRemaining(0)
  }

  const handleGoogleSignIn = async () => {
    setMessage('')
    setIsError(false)
    
    const { data, error } = await signInWithGoogle()
    
    if (error) {
      setMessage('Error al iniciar sesión con Google: ' + error)
      setIsError(true)
    } else {
      setMessage('Redirigiendo a Google...')
      setIsError(false)
    }
    // La redirección se maneja automáticamente por OAuth o por el callback
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-md w-full space-y-8">
        {onBack ? (
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
        ) : (
          <button
            onClick={() => router.push('/')}
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
        
        {/* Debug info - solo para desarrollo */}
        {debugInfo && (
          <div className="text-xs text-center p-2 rounded bg-gray-100 border">
            <strong>Debug:</strong> {debugInfo}
          </div>
        )}
        
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
              {/* Botón especial para Google cuando se detecta que el usuario ya existe con OAuth */}
              {showGoogleSuggestion && (
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="mt-3 w-full flex justify-center py-2 px-4 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  style={{ 
                    borderColor: 'var(--border)',
                    backgroundColor: '#4285F4',
                    color: 'white',
                    '--tw-ring-color': '#4285F4'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#3367D6'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#4285F4'
                  }}
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {loading ? 'Procesando...' : 'Continuar con Google'}
                </button>
              )}
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

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'var(--border)' }}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2" style={{ backgroundColor: 'var(--background)', color: 'var(--text-secondary)' }}>
                O continúa con
              </span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ 
                borderColor: 'var(--border)',
                backgroundColor: 'var(--surface)',
                color: 'var(--foreground)',
                '--tw-ring-color': 'var(--primary)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--surface-hover)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'var(--surface)'
              }}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Procesando...' : 'Continuar con Google'}
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
