import { useEffect, useState } from 'react';
import './Toast.css';

export type ToastType = 'error' | 'success' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

function Toast({ message, type = 'error', duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Attendre la fin de l'animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons: Record<ToastType, string> = {
    error: '❌',
    success: '✅',
    warning: '⚠️',
    info: 'ℹ️',
  };

  return (
    <div className={`toast toast-${type} ${isVisible ? 'toast-visible' : 'toast-hidden'}`}>
      <span className="toast-icon">{icons[type]}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }}>
        ×
      </button>
    </div>
  );
}

export default Toast;
