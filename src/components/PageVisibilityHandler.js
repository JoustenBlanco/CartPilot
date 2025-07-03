'use client'

import { usePageVisibility } from '@/hooks/usePageVisibility'

/**
 * Componente que maneja la recarga automática de la página
 * cuando el usuario vuelve a la pestaña después de haberla dejado
 */
export default function PageVisibilityHandler({ children }) {
  usePageVisibility()
  
  return children
}
