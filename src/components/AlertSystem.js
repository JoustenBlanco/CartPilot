"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { createPortal } from "react-dom";

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const addAlert = (alert) => {
    const id = Date.now() + Math.random();
    const newAlert = { ...alert, id };
    setAlerts(prev => [...prev, newAlert]);

    // Auto-remover alertas después de 5 segundos (excepto confirmaciones)
    if (alert.type !== 'confirmation') {
      setTimeout(() => {
        removeAlert(id);
      }, alert.duration || 5000);
    }

    return id;
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const showAlert = (message, type = 'info', options = {}) => {
    return addAlert({
      message,
      type,
      ...options
    });
  };

  const showConfirmation = (message, onConfirm, options = {}) => {
    return addAlert({
      message,
      type: 'confirmation',
      onConfirm,
      onCancel: options.onCancel,
      confirmText: options.confirmText || 'Confirmar',
      cancelText: options.cancelText || 'Cancelar',
      ...options
    });
  };

  return (
    <AlertContext.Provider value={{
      alerts,
      addAlert,
      removeAlert,
      showAlert,
      showConfirmation
    }}>
      {children}
      <AlertContainer alerts={alerts} removeAlert={removeAlert} />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert debe ser usado dentro de un AlertProvider');
  }
  return context;
};

// Componente principal del contenedor de alertas
const AlertContainer = ({ alerts, removeAlert }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-[60]">
      {/* Alertas en la esquina superior derecha */}
      <div className="absolute top-4 right-4 space-y-3 max-w-sm w-full">
        {alerts.filter(alert => alert.type !== 'confirmation').map(alert => (
          <Alert key={alert.id} alert={alert} onClose={() => removeAlert(alert.id)} />
        ))}
      </div>

      {/* Confirmaciones en el centro */}
      {alerts.filter(alert => alert.type === 'confirmation').map(alert => (
        <ConfirmationModal key={alert.id} alert={alert} onClose={() => removeAlert(alert.id)} />
      ))}
    </div>,
    document.body
  );
};

// Componente de alerta individual
const Alert = ({ alert, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const getAlertStyles = () => {
    const baseStyles = "pointer-events-auto transform transition-all duration-300 ease-in-out";
    const visibilityStyles = isVisible
      ? "translate-x-0 opacity-100"
      : "translate-x-full opacity-0";

    const typeStyles = {
      success: "bg-gray-800/95 dark:bg-gray-900/95 border-l-4 border-green-500 text-white",
      error: "bg-gray-800/95 dark:bg-gray-900/95 border-l-4 border-red-500 text-white",
      warning: "bg-gray-800/95 dark:bg-gray-900/95 border-l-4 border-yellow-500 text-white",
      info: "bg-gray-800/95 dark:bg-gray-900/95 border-l-4 border-blue-500 text-white"
    };

    return `${baseStyles} ${visibilityStyles} ${typeStyles[alert.type] || typeStyles.info}`;
  };

  const getIcon = () => {
    const iconStyles = "w-5 h-5 flex-shrink-0";
    
    switch (alert.type) {
      case 'success':
        return (
          <svg className={`${iconStyles} text-green-500`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className={`${iconStyles} text-red-500`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className={`${iconStyles} text-yellow-500`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className={`${iconStyles} text-blue-500`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className={getAlertStyles()}>
      <div className="flex items-start p-4 rounded-lg shadow-lg backdrop-blur-sm border border-gray-600/30">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          {alert.title && (
            <h3 className="text-sm font-medium mb-1 text-white">
              {alert.title}
            </h3>
          )}
          <p className="text-sm text-gray-100">
            {alert.message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            className="inline-flex text-gray-300 hover:text-white transition-colors"
            onClick={handleClose}
          >
            <span className="sr-only">Cerrar</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente de confirmación modal
const ConfirmationModal = ({ alert, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleConfirm = () => {
    if (alert.onConfirm) {
      alert.onConfirm();
    }
    handleClose();
  };

  const handleCancel = () => {
    if (alert.onCancel) {
      alert.onCancel();
    }
    handleClose();
  };

  return (
    <div className={`fixed inset-0 pointer-events-auto z-[60] flex items-center justify-center p-4 transition-all duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleCancel}
      />
      
      {/* Modal */}
      <div className={`relative bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 border border-gray-600 ${
        isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
      }`}>
        <div className="p-6">
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-orange-100/20 border border-orange-500/30">
            <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>

          {/* Content */}
          <div className="text-center">
            {alert.title && (
              <h3 className="text-lg font-semibold text-white mb-2">
                {alert.title}
              </h3>
            )}
            <p className="text-gray-300 mb-6">
              {alert.message}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 hover:text-white transition-colors"
            >
              {alert.cancelText || 'Cancelar'}
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-sm"
              style={{
                backgroundColor: 'var(--primary)',
                boxShadow: '0 4px 12px rgba(255, 142, 1, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--primary-hover)';
                e.target.style.boxShadow = '0 6px 16px rgba(255, 142, 1, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'var(--primary)';
                e.target.style.boxShadow = '0 4px 12px rgba(255, 142, 1, 0.3)';
              }}
            >
              {alert.confirmText || 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
