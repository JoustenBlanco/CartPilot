"use client";

// Función de emergencia para limpiar completamente la sesión
export const emergencySignOut = () => {
  try {
    console.log('🚨 Ejecutando cierre de sesión de emergencia...');
    
    // Limpiar localStorage
    const localKeys = Object.keys(localStorage);
    localKeys.forEach(key => {
      if (key.includes('supabase') || key.includes('sb-') || key.includes('auth')) {
        console.log('Eliminando localStorage:', key);
        localStorage.removeItem(key);
      }
    });
    
    // Limpiar sessionStorage
    const sessionKeys = Object.keys(sessionStorage);
    sessionKeys.forEach(key => {
      if (key.includes('supabase') || key.includes('sb-') || key.includes('auth')) {
        console.log('Eliminando sessionStorage:', key);
        sessionStorage.removeItem(key);
      }
    });
    
    // Limpiar cookies si las hay
    document.cookie.split(";").forEach(c => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos) : c;
      if (name.trim().includes('supabase') || name.trim().includes('sb-')) {
        console.log('Eliminando cookie:', name.trim());
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      }
    });
    
    console.log('✅ Limpieza de emergencia completada');
    
    // Redirigir a home
    window.location.href = '/';
    
  } catch (error) {
    console.error('Error en cierre de emergencia:', error);
    // Como última opción
    window.location.reload();
  }
};

// Componente visual para debugging (solo en desarrollo)
export default function EmergencySignOut() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={emergencySignOut}
        className="px-3 py-2 bg-red-600 text-white text-xs rounded-md shadow-lg hover:bg-red-700 transition-colors"
        title="Cierre de sesión de emergencia (solo desarrollo)"
      >
        🚨 Emergency Logout
      </button>
    </div>
  );
}

// Exponer función globalmente para debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.emergencySignOut = emergencySignOut;
}
