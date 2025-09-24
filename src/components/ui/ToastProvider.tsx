import React, { useState, useEffect, createContext, useContext } from 'react';
import { Toast, ToastType } from './Toast';
import { feedbackManager } from '../../utils/feedbackManager';

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('info');
  const [duration, setDuration] = useState(3000);

  useEffect(() => {
    // Register toast callback with feedback manager
    feedbackManager.registerToast((msg, toastType, toastDuration) => {
      showToast(msg, toastType, toastDuration);
    });
  }, []);

  const showToast = (msg: string, toastType: ToastType = 'info', toastDuration?: number) => {
    setMessage(msg);
    setType(toastType);
    setDuration(toastDuration || 3000);
    setVisible(true);
  };

  const handleDismiss = () => {
    setVisible(false);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        visible={visible}
        message={message}
        type={type}
        duration={duration}
        onDismiss={handleDismiss}
      />
    </ToastContext.Provider>
  );
};