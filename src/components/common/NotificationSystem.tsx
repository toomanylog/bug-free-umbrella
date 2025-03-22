import React, { useState, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { Check, X, AlertTriangle, Info } from 'lucide-react';

// Types d'interface
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  buttons?: React.ReactNode;
  type?: 'info' | 'success' | 'error' | 'confirm';
}

interface NotificationModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

interface NotificationContextType {
  showNotification: (title: string, message: string, type?: 'info' | 'success' | 'error') => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => void;
  confirmDialog: (message: string) => Promise<boolean>;
}

// Composant Modal
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, buttons, type = 'info' }) => {
  if (!isOpen) return null;
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Check className="h-8 w-8 text-green-400" />;
      case 'error':
        return <X className="h-8 w-8 text-red-400" />;
      case 'confirm':
        return <AlertTriangle className="h-8 w-8 text-amber-400" />;
      default:
        return <Info className="h-8 w-8 text-blue-400" />;
    }
  };
  
  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/20';
      case 'error':
        return 'bg-red-500/20';
      case 'confirm':
        return 'bg-amber-500/20';
      default:
        return 'bg-blue-500/20';
    }
  };
  
  return createPortal(
    <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">{title}</h2>
          <button 
            className="p-2 hover:bg-gray-700 rounded-full"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="text-center">
            <div className={`${getBgColor()} p-3 rounded-full inline-block mb-4`}>
              {getIcon()}
            </div>
            <div className="mb-6">
              {children}
            </div>
            {buttons ? (
              buttons
            ) : (
              <button 
                onClick={onClose}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Fermer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Création du contexte de notification
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider de notification
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notificationModal, setNotificationModal] = useState<NotificationModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });
  
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {}
  });
  
  const showNotification = (title: string, message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setNotificationModal({
      isOpen: true,
      title,
      message,
      type
    });
  };
  
  const closeNotification = () => {
    setNotificationModal({
      ...notificationModal,
      isOpen: false
    });
  };
  
  const showConfirm = (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      onCancel: onCancel || (() => {})
    });
  };
  
  const confirmDialog = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      showConfirm(
        'Confirmation',
        message,
        () => {
          setConfirmModal({ ...confirmModal, isOpen: false });
          resolve(true);
        },
        () => {
          setConfirmModal({ ...confirmModal, isOpen: false });
          resolve(false);
        }
      );
    });
  };
  
  return (
    <NotificationContext.Provider value={{ showNotification, showConfirm, confirmDialog }}>
      {children}
      
      {/* Modal de notification personnalisée */}
      <Modal
        isOpen={notificationModal.isOpen}
        onClose={closeNotification}
        title={notificationModal.title}
        type={notificationModal.type}
      >
        <p className="text-gray-300">{notificationModal.message}</p>
      </Modal>
      
      {/* Modal de confirmation personnalisée */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => {
          confirmModal.onCancel();
          setConfirmModal({ ...confirmModal, isOpen: false });
        }}
        title={confirmModal.title}
        type="confirm"
        buttons={
          <div className="flex gap-3">
            <button 
              onClick={() => {
                confirmModal.onCancel();
                setConfirmModal({ ...confirmModal, isOpen: false });
              }}
              className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button 
              onClick={() => {
                confirmModal.onConfirm();
                setConfirmModal({ ...confirmModal, isOpen: false });
              }}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Confirmer
            </button>
          </div>
        }
      >
        <p className="text-gray-300">{confirmModal.message}</p>
      </Modal>
    </NotificationContext.Provider>
  );
};

// Hook pour utiliser le contexte de notification
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification doit être utilisé à l\'intérieur d\'un NotificationProvider');
  }
  return context;
};

// Fonctions d'utilité pour les composants qui ne sont pas à l'intérieur du contexte
let notificationUtils: NotificationContextType | null = null;

export const setNotificationUtils = (utils: NotificationContextType) => {
  notificationUtils = utils;
};

export const showNotification = (title: string, message: string, type: 'info' | 'success' | 'error' = 'info') => {
  if (notificationUtils) {
    notificationUtils.showNotification(title, message, type);
  } else {
    console.warn('NotificationProvider n\'est pas initialisé. Utilisation d\'une alerte standard à la place.');
    alert(`${title}: ${message}`);
  }
};

export const showConfirm = (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => {
  if (notificationUtils) {
    notificationUtils.showConfirm(title, message, onConfirm, onCancel);
  } else {
    console.warn('NotificationProvider n\'est pas initialisé. Utilisation d\'une confirmation standard à la place.');
    const confirmed = window.confirm(message);
    if (confirmed) {
      onConfirm();
    } else if (onCancel) {
      onCancel();
    }
  }
};

export const confirmDialog = async (message: string): Promise<boolean> => {
  if (notificationUtils) {
    return notificationUtils.confirmDialog(message);
  } else {
    console.warn('NotificationProvider n\'est pas initialisé. Utilisation d\'une confirmation standard à la place.');
    return window.confirm(message);
  }
}; 