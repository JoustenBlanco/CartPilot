"use client";

import { useAuth } from "@/hooks/useAuth";
import GradientText from "@/TextAnimations/GradientText/GradientText";

export default function Dashboard() {
  const { user, profile, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-8 w-8 mx-auto"
            style={{ color: "var(--primary)" }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
            Cargando...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--background)" }}
    >
      <nav
        className="shadow-sm border-b"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-2">
              <img
                src="/images/logo.png"
                alt="CartPilot Logo"
                className="w-7 h-7"
              />
              <GradientText
                colors={["#ff8e01", "#ffb03f", "#d47300", "#ffb03f", "#ff8e01"]}
                animationSpeed={10}
                showBorder={false}
                className="custom-class text-2xl font-bold"
              >
                CartPilot
              </GradientText>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {profile?.avatar_url && (
                  <img
                    src={profile.avatar_url}
                    alt={`Avatar de ${profile.full_name || user?.email}`}
                    className="w-8 h-8 rounded-full object-cover border-2"
                    style={{ borderColor: 'var(--primary)' }}
                    onError={(e) => {
                      // Si la imagen falla al cargar, ocultarla
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <span
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Hola, {profile?.full_name || user?.email}
                </span>
              </div>
              <button
                onClick={signOut}
                className="px-4 py-2 rounded-md text-sm font-medium transition-colors text-white"
                style={{ backgroundColor: "var(--error)" }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#c11e2e")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "var(--error)")
                }
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div
            className="overflow-hidden shadow rounded-lg"
            style={{ backgroundColor: "var(--surface)" }}
          >
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center">
                <div
                  className="mx-auto flex items-center justify-center h-12 w-12 rounded-full"
                  style={{ backgroundColor: "#f0fdf4" }}
                >
                  <svg
                    className="h-6 w-6"
                    style={{ color: "var(--success)" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <h3
                  className="mt-2 text-lg font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  ¡Autenticación exitosa!
                </h3>
                <p
                  className="mt-1 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Has iniciado sesión correctamente en CartPilot
                </p>
              </div>

              <div
                className="mt-6 rounded-lg p-4"
                style={{ backgroundColor: "var(--background-secondary)" }}
              >
                <h4
                  className="text-sm font-medium mb-2"
                  style={{ color: "var(--foreground)" }}
                >
                  Información del usuario:
                </h4>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                  {profile?.avatar_url && (
                    <div className="col-span-full">
                      <dt
                        className="text-xs font-medium"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Avatar:
                      </dt>
                      <dd className="mt-1">
                        <img
                          src={profile.avatar_url}
                          alt={`Avatar de ${profile.full_name || user?.email}`}
                          className="w-16 h-16 rounded-full object-cover border-4"
                          style={{ borderColor: 'var(--primary)' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </dd>
                    </div>
                  )}
                  {profile?.full_name && (
                    <div>
                      <dt
                        className="text-xs font-medium"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Nombre:
                      </dt>
                      <dd
                        className="text-sm"
                        style={{ color: "var(--foreground)" }}
                      >
                        {profile.full_name}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt
                      className="text-xs font-medium"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Email:
                    </dt>
                    <dd
                      className="text-sm"
                      style={{ color: "var(--foreground)" }}
                    >
                      {user?.email}
                    </dd>
                  </div>
                  <div>
                    <dt
                      className="text-xs font-medium"
                      style={{ color: "var(--text-muted)" }}
                    >
                      ID de usuario:
                    </dt>
                    <dd
                      className="text-sm font-mono"
                      style={{ color: "var(--foreground)" }}
                    >
                      {user?.id}
                    </dd>
                  </div>
                  <div>
                    <dt
                      className="text-xs font-medium"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Email confirmado:
                    </dt>
                    <dd className="text-sm">
                      {user?.email_confirmed_at ? (
                        <span style={{ color: "var(--success)" }}>
                          ✓ Confirmado
                        </span>
                      ) : (
                        <span style={{ color: "var(--warning)" }}>
                          ⚠ Pendiente
                        </span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt
                      className="text-xs font-medium"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Último acceso:
                    </dt>
                    <dd
                      className="text-sm"
                      style={{ color: "var(--foreground)" }}
                    >
                      {user?.last_sign_in_at
                        ? new Date(user.last_sign_in_at).toLocaleString()
                        : "Primera vez"}
                    </dd>
                  </div>
                  {profile?.created_at && (
                    <div>
                      <dt
                        className="text-xs font-medium"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Perfil creado:
                      </dt>
                      <dd
                        className="text-sm"
                        style={{ color: "var(--foreground)" }}
                      >
                        {new Date(profile.created_at).toLocaleString()}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="mt-6 text-center">
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  🎉 ¡Tu integración con Supabase está funcionando
                  perfectamente!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
