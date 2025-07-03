'use client'

import { useEffect } from 'react'

/**
 * Hook personalizado que recarga la página cuando el usuario vuelve a la pestaña
 * después de haberla dejado
 */
export function usePageVisibility() {
  useEffect(() => {
    let wasHidden = false
    let isInitialized = false

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // El usuario salió de la pestaña
        wasHidden = true
      } else if (wasHidden && isInitialized) {
        // El usuario volvió a la pestaña después de haberla dejado
        window.location.reload()
      }
    }

    // Esperar un poco para que la página se inicialice completamente
    const initTimer = setTimeout(() => {
      isInitialized = true
    }, 2000)

    // Verificar si la API de Page Visibility está disponible
    if (typeof document !== 'undefined' && 'hidden' in document) {
      document.addEventListener('visibilitychange', handleVisibilityChange)

      // Cleanup al desmontar el componente
      return () => {
        clearTimeout(initTimer)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    } else {
      // Si no hay soporte para la API, limpiar el timer
      return () => {
        clearTimeout(initTimer)
      }
    }
  }, [])
}
