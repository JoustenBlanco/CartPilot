'use client'

import { useEffect, useState } from 'react'

export default function LoadingScreen() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Background subtle animation */}
      <div className="hidden md:block absolute inset-0 opacity-5">
        <div 
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full animate-pulse"
          style={{ backgroundColor: 'var(--primary)' }}
        ></div>
        <div 
          className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full animate-pulse delay-1000"
          style={{ backgroundColor: 'var(--primary)' }}
        ></div>
      </div>

      {/* Main loading content */}
      <div className="relative z-10 flex flex-col items-center space-y-6">
        {/* Animated Logo */}
        <div className="relative">
          <img
            src="/images/logo.png"
            alt="CartPilot Logo"
            className={`
              transition-all duration-1000 ease-in-out
              ${mounted ? 'animate-logo-pulse' : 'opacity-0 scale-50'}
            `}
            style={{
              width: '80px',
              height: '80px',
              filter: 'drop-shadow(0 10px 15px rgba(255, 142, 1, 0.3))'
            }}
          />
          
          {/* Pulsing ring around logo */}
          <div 
            className="absolute inset-0 rounded-full animate-ping opacity-30"
            style={{ 
              backgroundColor: 'var(--primary)',
              animationDuration: '2s'
            }}
          ></div>
        </div>

        {/* Brand name with gradient animation */}
        <div className="text-center space-y-2">
          <h1 
            className="text-3xl font-bold tracking-wide animate-fade-in-up"
            style={{ 
              color: 'var(--foreground)',
              animationDelay: '0.3s',
              animationFillMode: 'both'
            }}
          >
            CartPilot
          </h1>
          <p 
            className="text-sm animate-fade-in-up opacity-70"
            style={{ 
              color: 'var(--text-secondary)',
              animationDelay: '0.6s',
              animationFillMode: 'both'
            }}
          >
            Preparando tu experiencia de compras...
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex space-x-2 animate-fade-in-up" style={{ animationDelay: '0.9s', animationFillMode: 'both' }}>
          <div 
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ 
              backgroundColor: 'var(--primary)',
              animationDelay: '0s'
            }}
          ></div>
          <div 
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ 
              backgroundColor: 'var(--primary)',
              animationDelay: '0.1s'
            }}
          ></div>
          <div 
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ 
              backgroundColor: 'var(--primary)',
              animationDelay: '0.2s'
            }}
          ></div>
        </div>
      </div>
    </div>
  )
}
