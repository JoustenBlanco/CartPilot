import { useAlert } from '@/components/AlertSystem';

/**
 * Hook personalizado para usar alertas de manera más sencilla
 * Proporciona métodos útiles para mostrar diferentes tipos de alertas
 */
export const useAlertHelpers = () => {
  const { showAlert, showConfirmation } = useAlert();

  // Métodos de conveniencia para diferentes tipos de alertas
  const success = (message, options = {}) => {
    return showAlert(message, 'success', {
      title: 'Éxito',
      duration: 4000,
      ...options
    });
  };

  const error = (message, options = {}) => {
    return showAlert(message, 'error', {
      title: 'Error',
      duration: 6000,
      ...options
    });
  };

  const warning = (message, options = {}) => {
    return showAlert(message, 'warning', {
      title: 'Advertencia',
      duration: 5000,
      ...options
    });
  };

  const info = (message, options = {}) => {
    return showAlert(message, 'info', {
      title: 'Información',
      duration: 4000,
      ...options
    });
  };

  // Método para confirmaciones comunes que devuelve una promesa
  const confirm = (message, options = {}) => {
    return new Promise((resolve) => {
      showConfirmation(message, () => resolve(true), {
        title: '¿Estás seguro?',
        confirmText: 'Sí, continuar',
        cancelText: 'Cancelar',
        onCancel: () => resolve(false),
        ...options
      });
    });
  };

  // Confirmación para eliminar elementos que devuelve una promesa
  const confirmDelete = (itemName, options = {}) => {
    return new Promise((resolve) => {
      showConfirmation(
        `¿Estás seguro de que quieres eliminar "${itemName}"? Esta acción no se puede deshacer.`,
        () => resolve(true),
        {
          title: 'Confirmar eliminación',
          confirmText: 'Sí, eliminar',
          cancelText: 'Cancelar',
          onCancel: () => resolve(false),
          ...options
        }
      );
    });
  };

  // Confirmación para cerrar sesión que devuelve una promesa
  const confirmLogout = (options = {}) => {
    return new Promise((resolve) => {
      showConfirmation(
        '¿Estás seguro de que quieres cerrar sesión?',
        () => resolve(true),
        {
          title: 'Cerrar sesión',
          confirmText: 'Sí, cerrar sesión',
          cancelText: 'Cancelar',
          onCancel: () => resolve(false),
          ...options
        }
      );
    });
  };

  // Confirmación para guardar cambios que devuelve una promesa
  const confirmSave = (options = {}) => {
    return new Promise((resolve) => {
      showConfirmation(
        '¿Quieres guardar los cambios realizados?',
        () => resolve(true),
        {
          title: 'Guardar cambios',
          confirmText: 'Sí, guardar',
          cancelText: 'Descartar',
          onCancel: () => resolve(false),
          ...options
        }
      );
    });
  };

  return {
    // Métodos básicos
    showAlert,
    showConfirmation,
    
    // Métodos de conveniencia
    success,
    error,
    warning,
    info,
    confirm,
    
    // Confirmaciones específicas
    confirmDelete,
    confirmLogout,
    confirmSave
  };
};

export default useAlertHelpers;
