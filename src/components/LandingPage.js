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
              CartPilot te ayuda a organizar, comparar y optimizar tus compras.
              Nunca más olvides un producto o pagues de más.
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
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4" style={styles.foreground}>
                Comparación de Precios
              </h3>
              <p style={styles.textSecondary}>
                Compara precios entre diferentes tiendas y encuentra las mejores
                ofertas para ahorrar dinero.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-8 rounded-2xl transition-transform hover:scale-105" style={styles.surface}>
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6" style={styles.primaryColor}>
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4" style={styles.foreground}>
                Historial y Análisis
              </h3>
              <p style={styles.textSecondary}>
                Revisa tu historial de compras y obtén insights sobre tus
                patrones de consumo.
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
      <footer className="py-12" style={styles.backgroundSecondary}>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <p className="text-sm" style={styles.textMuted}>
            © 2025 CartPilot. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
