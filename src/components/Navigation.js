import { useState } from 'react';
import Image from 'next/image';
import GradientText from '../TextAnimations/GradientText/GradientText';
import Avatar from './Avatar';

export default function Navigation({ profile, user, onSettingsClick, onSignOut }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav
      className="shadow-sm border-b"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y nombre - siempre visible */}
          <div className="flex items-center space-x-2 min-w-0">
            <Image
              src="/images/logo.png"
              alt="CartPilot Logo"
              width={28}
              height={28}
              className="w-7 h-7 flex-shrink-0"
            />
            <GradientText
              colors={["#ff8e01", "#ffb03f", "#d47300", "#ffb03f", "#ff8e01"]}
              animationSpeed={10}
              showBorder={false}
              className="text-xl sm:text-2xl font-bold truncate"
            >
              CartPilot
            </GradientText>
          </div>

          {/* Navegación desktop - oculto en móvil */}
          <div className="hidden sm:flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {/* Botón de configuración */}
              <button
                onClick={onSettingsClick}
                className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                style={{ color: "var(--text-secondary)" }}
                title="Configuración"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </button>

              {/* Avatar */}
              <Avatar 
                user={user}
                profile={profile}
                size="w-8 h-8"
                textSize="text-xs"
              />

              <span
                className="text-sm hidden md:block"
                style={{ color: "var(--text-secondary)" }}
              >
                Hola, {profile?.full_name || user?.email}
              </span>
            </div>

            <button
              onClick={onSignOut}
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

          {/* Botón menú móvil - solo visible en móvil */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              style={{ color: "var(--text-secondary)" }}
              aria-expanded={isMenuOpen}
              aria-label="Abrir menú de navegación"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menú móvil desplegable */}
        {isMenuOpen && (
          <div className="sm:hidden border-t" style={{ borderColor: "var(--border)" }}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Info del usuario */}
              <div className="flex items-center space-x-3 px-3 py-2">
                <Avatar 
                  user={user}
                  profile={profile}
                  size="w-8 h-8"
                  textSize="text-xs"
                />
                <div>
                  <div className="text-sm font-medium" style={{ color: "var(--text)" }}>
                    {profile?.full_name || user?.email}
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {user?.email}
                  </div>
                </div>
              </div>

              {/* Botón de configuración */}
              <button
                onClick={() => {
                  onSettingsClick();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-left"
                style={{ color: "var(--text-secondary)" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span className="text-sm">Configuración</span>
              </button>

              {/* Botón cerrar sesión */}
              <button
                onClick={() => {
                  onSignOut();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors text-left text-white"
                style={{ backgroundColor: "var(--error)" }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#c11e2e")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "var(--error)")
                }
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-sm">Cerrar sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
