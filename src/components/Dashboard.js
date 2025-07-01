'use client'

import { useAuth } from '@/hooks/useAuth'

export default function Dashboard() {
  const { user, profile, signOut, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                CartPilot Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Hola, {profile?.full_name || user?.email}
              </span>
              <button
                onClick={signOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  ¡Autenticación exitosa!
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Has iniciado sesión correctamente en CartPilot
                </p>
              </div>

              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Información del usuario:</h4>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                  {profile?.full_name && (
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Nombre:</dt>
                      <dd className="text-sm text-gray-900">{profile.full_name}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Email:</dt>
                    <dd className="text-sm text-gray-900">{user?.email}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500">ID de usuario:</dt>
                    <dd className="text-sm text-gray-900 font-mono">{user?.id}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Email confirmado:</dt>
                    <dd className="text-sm text-gray-900">
                      {user?.email_confirmed_at ? (
                        <span className="text-green-600">✓ Confirmado</span>
                      ) : (
                        <span className="text-orange-600">⚠ Pendiente</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Último acceso:</dt>
                    <dd className="text-sm text-gray-900">
                      {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Primera vez'}
                    </dd>
                  </div>
                  {profile?.created_at && (
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Perfil creado:</dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(profile.created_at).toLocaleString()}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  🎉 ¡Tu integración con Supabase está funcionando perfectamente!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
