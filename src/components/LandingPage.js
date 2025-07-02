"use client";

import { useState } from "react";
import Image from "next/image";
import AuthForm from "./AuthForm";
import GradientText from "@/TextAnimations/GradientText/GradientText";
import Aurora from "@/Backgrounds/Aurora/Aurora";

export default function LandingPage() {
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  // Estilos centralizados
  const styles = {
    headerButton: {
      borderColor: "rgba(255, 255, 255, 0.2)",
      color: "white",
      backgroundColor: "rgba(0, 0, 0, 0.2)",
      textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)"
    },
    headerButtonHover: {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderColor: "rgba(255, 255, 255, 0.3)"
    },
    primaryButton: {
      backgroundColor: "var(--primary)",
      boxShadow: "0 4px 12px rgba(255, 142, 1, 0.3)"
    },
    primaryButtonHover: {
      backgroundColor: "var(--primary-hover)",
      boxShadow: "0 6px 16px rgba(255, 142, 1, 0.4)"
    },
    heroTitle: {
      color: "var(--foreground)"
    },
    heroSubtitle: {
      color: "var(--text-secondary)"
    },
    heroGradientText: {
      backgroundSize: "200% 200%",
      animation: "gradient 3s ease infinite"
    },
    ctaButtonHover: {
      backgroundColor: "var(--primary-hover)",
      boxShadow: "0 20px 25px -5px rgba(255, 142, 1, 0.3), 0 10px 10px -5px rgba(255, 142, 1, 0.2)"
    },
    ctaButtonDefault: {
      backgroundColor: "var(--primary)",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
    },
    secondaryButton: {
      borderColor: "var(--border)",
      color: "var(--foreground)",
      backgroundColor: "transparent"
    },
    secondaryButtonHover: {
      backgroundColor: "var(--surface-hover)",
      borderColor: "var(--primary)"
    },
    primaryColor: {
      backgroundColor: "var(--primary)"
    },
    backgroundSecondary: {
      backgroundColor: "var(--background-secondary)"
    },
    background: {
      backgroundColor: "var(--background)"
    },
    foreground: {
      color: "var(--foreground)"
    },
    textSecondary: {
      color: "var(--text-secondary)"
    },
    surface: {
      backgroundColor: "var(--surface)"
    },
    textMuted: {
      color: "var(--text-muted)"
    }
  };

  // Handlers de eventos
  const handleButtonHover = (e, hoverStyle) => {
    Object.assign(e.target.style, hoverStyle);
  };

  const handleButtonLeave = (e, defaultStyle) => {
    Object.assign(e.target.style, defaultStyle);
  };

  if (showAuthForm) {
    return (
      <AuthForm initialMode={authMode} onBack={() => setShowAuthForm(false)} />
    );
  }

  const handleLogin = () => {
    setAuthMode("login");
    setShowAuthForm(true);
  };

  const handleSignup = () => {
    setAuthMode("signup");
    setShowAuthForm(true);
  };

  return (
    <div className="min-h-screen relative" style={styles.background}>
      {/* Hero Section */}
      <div className="relative overflow-hidden z-10">
        {/* Aurora Background */}
        <div className="absolute inset-0 z-0">
          <Aurora
            colorStops={["#ff8e01", "#ffab33", "#cc7001"]}
            blend={2}
            amplitude={1.5}
            speed={0.3}
          />
        </div>
        
        {/* Header */}
        <header className="relative z-50 px-4 sm:px-6 lg:px-8 py-6">
          <style jsx>{`
            .header-gradient-override {
              background: transparent !important;
              backdrop-filter: none !important;
            }
            .header-gradient-override > div {
              background: transparent !important;
              backdrop-filter: none !important;
            }
          `}</style>
          
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-1 sm:space-x-2 bg-black/20 backdrop-blur-sm rounded-full px-2 py-1 sm:px-4 sm:py-2 border border-white/10">
              <Image
                src="/images/logo.png"
                alt="CartPilot Logo"
                width={32}
                height={32}
                className="w-6 h-6 sm:w-8 sm:h-8 drop-shadow-lg"
              />
              <div className="drop-shadow-lg header-gradient-override">
                <GradientText
                  colors={["#ff8e01", "#ffb03f", "#d47300", "#ffb03f", "#ff8e01"]}
                  animationSpeed={10}
                  showBorder={false}
                  className="text-lg sm:text-2xl font-bold header-gradient-override"
                >
                  CartPilot
                </GradientText>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex space-x-2 sm:space-x-4 relative z-50">
              <button
                onClick={handleLogin}
                className="px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-lg border transition-colors backdrop-blur-sm"
                style={styles.headerButton}
                onMouseEnter={(e) => handleButtonHover(e, styles.headerButtonHover)}
                onMouseLeave={(e) => handleButtonLeave(e, styles.headerButton)}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={handleSignup}
                className="px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-lg text-white transition-colors backdrop-blur-sm shadow-lg"
                style={styles.primaryButton}
                onMouseEnter={(e) => handleButtonHover(e, styles.primaryButtonHover)}
                onMouseLeave={(e) => handleButtonLeave(e, styles.primaryButton)}
              >
                Registrarse
              </button>
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight" style={styles.heroTitle}>
              Tu asistente de{" "}
              <span
                className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent animate-gradient"
                style={styles.heroGradientText}
              >
                compras
              </span>{" "}
              inteligente
            </h1>
            
            <p className="mt-6 text-xl sm:text-2xl max-w-3xl mx-auto leading-relaxed" style={styles.heroSubtitle}>
              CartPilot te ayuda a organizar y optimizar tus compras.
              Nunca más olvides un producto o te pierdas buscando uno.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleSignup}
                className="w-full sm:w-auto px-8 py-4 text-lg font-semibold rounded-xl text-white transition-all duration-200 transform hover:scale-105 shadow-lg"
                style={styles.primaryColor}
                onMouseEnter={(e) => handleButtonHover(e, styles.ctaButtonHover)}
                onMouseLeave={(e) => handleButtonLeave(e, styles.ctaButtonDefault)}
              >
                Comenzar Gratis
              </button>
              <button
                onClick={handleLogin}
                className="w-full sm:w-auto px-8 py-4 text-lg font-semibold rounded-xl border-2 transition-all duration-200"
                style={styles.secondaryButton}
                onMouseEnter={(e) => handleButtonHover(e, styles.secondaryButtonHover)}
                onMouseLeave={(e) => handleButtonLeave(e, styles.secondaryButton)}
              >
                Ya tengo cuenta
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24" style={styles.backgroundSecondary}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold" style={styles.foreground}>
              ¿Por qué elegir CartPilot?
            </h2>
            <p className="mt-4 text-xl" style={styles.textSecondary}>
              Características que hacen que tus compras sean más inteligentes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-8 rounded-2xl transition-transform hover:scale-105" style={styles.surface}>
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6" style={styles.primaryColor}>
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4" style={styles.foreground}>
                Organización Inteligente
              </h3>
              <p style={styles.textSecondary}>
                Organiza tus listas de compras por categorías, tiendas o fechas.
                Nunca más olvides lo que necesitas.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-8 rounded-2xl transition-transform hover:scale-105" style={styles.surface}>
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6" style={styles.primaryColor}>
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-5.14-4.03-9-9-9zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4" style={styles.foreground}>
                Interfaz Intuitiva
              </h3>
              <p style={styles.textSecondary}>
                Diseño moderno y fácil de usar. Crea listas, marca productos como 
                comprados y navega sin complicaciones.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-8 rounded-2xl transition-transform hover:scale-105" style={styles.surface}>
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6" style={styles.primaryColor}>
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4" style={styles.foreground}>
                Recordatorios por Email
              </h3>
              <p style={styles.textSecondary}>
                Recibe notificaciones de tus listas para que nunca olvides 
                hacer tus compras importantes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24" style={styles.background}>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6" style={styles.foreground}>
            Comienza tu experiencia de compras inteligente
          </h2>
          <p className="text-xl mb-10" style={styles.textSecondary}>
            Únete a miles de usuarios que ya optimizan sus compras con CartPilot
          </p>
          <button
            onClick={handleSignup}
            className="px-10 py-4 text-xl font-semibold rounded-xl text-white transition-all duration-200 transform hover:scale-105 shadow-lg"
            style={styles.primaryColor}
            onMouseEnter={(e) => handleButtonHover(e, styles.ctaButtonHover)}
            onMouseLeave={(e) => handleButtonLeave(e, styles.ctaButtonDefault)}
          >
            Registrarse Gratis
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-16" style={styles.backgroundSecondary}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Brand Section */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start mb-4">
                <Image
                  src="/images/logo.png"
                  alt="CartPilot Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <GradientText
                  colors={["#ff8e01", "#ffb03f", "#d47300", "#ffb03f", "#ff8e01"]}
                  animationSpeed={10}
                  showBorder={false}
                  className="text-xl font-bold ml-1"
                >
                  CartPilot
                </GradientText>
              </div>
              <p className="text-sm leading-relaxed max-w-sm mx-auto md:mx-0" style={styles.textSecondary}>
                Tu asistente inteligente para compras organizadas. Simplificamos la manera 
                en que planificas y realizas tus compras diarias.
              </p>
            </div>

            {/* Quick Links */}
            <div className="text-center">
              <h4 className="text-lg font-semibold mb-4" style={styles.foreground}>
                Enlaces Rápidos
              </h4>
              <div className="space-y-3">
                <button 
                  onClick={handleLogin}
                  className="block w-full text-sm transition-colors hover:text-orange-400"
                  style={styles.textSecondary}
                >
                  Iniciar Sesión
                </button>
                <button 
                  onClick={handleSignup}
                  className="block w-full text-sm transition-colors hover:text-orange-400"
                  style={styles.textSecondary}
                >
                  Crear Cuenta
                </button>
                <a 
                  href="#features" 
                  className="block w-full text-sm transition-colors hover:text-orange-400"
                  style={styles.textSecondary}
                >
                  Características
                </a>
              </div>
            </div>

            {/* Developer & Contact */}
            <div className="text-center md:text-right">
              <h4 className="text-lg font-semibold mb-4" style={styles.foreground}>
                Desarrollador
              </h4>
              <p className="text-sm mb-4" style={styles.textSecondary}>
                Desarrollado por{" "}
                <span className="font-medium text-orange-400">Jousten Blanco</span>
              </p>
              
              {/* Social Links */}
              <div className="flex justify-center md:justify-end space-x-4">
                <a
                  href="https://github.com/JoustenBlanco"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full transition-all hover:scale-110"
                  style={{
                    backgroundColor: "var(--surface)",
                    color: "var(--text-secondary)"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "var(--primary)";
                    e.target.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "var(--surface)";
                    e.target.style.color = "var(--text-secondary)";
                  }}
                  title="GitHub"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                
                <a
                  href="https://www.linkedin.com/in/jousten-blanco-409ab8301/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full transition-all hover:scale-110"
                  style={{
                    backgroundColor: "var(--surface)",
                    color: "var(--text-secondary)"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "var(--primary)";
                    e.target.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "var(--surface)";
                    e.target.style.color = "var(--text-secondary)";
                  }}
                  title="LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="pt-8 border-t" style={{ borderColor: "var(--border)" }}>
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-sm" style={styles.textMuted}>
                © 2025 CartPilot. Todos los derechos reservados.
              </p>
              <div className="flex space-x-6 text-sm">
                <a href="#" className="transition-colors hover:text-orange-400" style={styles.textMuted}>
                  Privacidad
                </a>
                <a href="#" className="transition-colors hover:text-orange-400" style={styles.textMuted}>
                  Términos
                </a>
                <a href="#" className="transition-colors hover:text-orange-400" style={styles.textMuted}>
                  Soporte
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
