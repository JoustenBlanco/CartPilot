"use client";

import { useAlertHelpers } from '@/hooks/useAlertHelpers';

/**
 * Componente de demostración para mostrar todas las funcionalidades
 * del sistema de alertas y confirmaciones
 */
export default function AlertDemo() {
  const alerts = useAlertHelpers();

  const demoButtons = [
    {
      label: 'Alerta de Éxito',
      action: () => alerts.success('¡Producto agregado correctamente!'),
      className: 'bg-green-500 hover:bg-green-600'
    },
    {
      label: 'Alerta de Error',
      action: () => alerts.error('No se pudo conectar con el servidor'),
      className: 'bg-red-500 hover:bg-red-600'
    },
    {
      label: 'Alerta de Advertencia',
      action: () => alerts.warning('El producto está por vencer'),
      className: 'bg-yellow-500 hover:bg-yellow-600'
    },
    {
      label: 'Alerta de Información',
      action: () => alerts.info('Nueva actualización disponible'),
      className: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      label: 'Confirmación Simple',
      action: () => alerts.confirm(
        '¿Estás seguro de continuar?',
        () => alerts.success('¡Acción confirmada!')
      ),
      className: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      label: 'Confirmar Eliminación',
      action: () => alerts.confirmDelete(
        'Producto ejemplo',
        () => alerts.success('Producto eliminado correctamente')
      ),
      className: 'bg-red-600 hover:bg-red-700'
    },
    {
      label: 'Confirmar Cerrar Sesión',
      action: () => alerts.confirmLogout(
        () => alerts.info('Sesión cerrada')
      ),
      className: 'bg-gray-500 hover:bg-gray-600'
    },
    {
      label: 'Confirmar Guardar',
      action: () => alerts.confirmSave(
        () => alerts.success('Cambios guardados')
      ),
      className: 'bg-indigo-500 hover:bg-indigo-600'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Sistema de Alertas - Demo
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Prueba todos los tipos de alertas y confirmaciones disponibles en CartPilot
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {demoButtons.map((button, index) => (
            <button
              key={index}
              onClick={button.action}
              className={`
                ${button.className}
                text-white font-medium py-3 px-4 rounded-lg
                transition-all duration-200 ease-in-out
                transform hover:scale-105 active:scale-95
                shadow-md hover:shadow-lg
                text-sm
              `}
            >
              {button.label}
            </button>
          ))}
        </div>

        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Cómo usar el sistema de alertas:
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <p><strong>1.</strong> Importa el hook: <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">import {`{ useAlertHelpers }`} from &apos;@/hooks/useAlertHelpers&apos;;</code></p>
            <p><strong>2.</strong> Úsalo en tu componente: <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">const alerts = useAlertHelpers();</code></p>
            <p><strong>3.</strong> Llama los métodos: <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">alerts.success(&apos;Mensaje&apos;)</code></p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <h4 className="text-md font-semibold text-orange-800 dark:text-orange-200 mb-2">
            Métodos disponibles:
          </h4>
          <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
            <li>• <code>alerts.success(message)</code> - Alerta de éxito</li>
            <li>• <code>alerts.error(message)</code> - Alerta de error</li>
            <li>• <code>alerts.warning(message)</code> - Alerta de advertencia</li>
            <li>• <code>alerts.info(message)</code> - Alerta informativa</li>
            <li>• <code>alerts.confirm(message, onConfirm)</code> - Confirmación simple</li>
            <li>• <code>alerts.confirmDelete(itemName, onConfirm)</code> - Confirmar eliminación</li>
            <li>• <code>alerts.confirmLogout(onConfirm)</code> - Confirmar cerrar sesión</li>
            <li>• <code>alerts.confirmSave(onConfirm)</code> - Confirmar guardar cambios</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
