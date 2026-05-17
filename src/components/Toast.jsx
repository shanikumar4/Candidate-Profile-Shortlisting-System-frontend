import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const Toast = ({ message, type = 'error', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-card shadow-lg border-l-4 bg-white ${type === 'error' ? 'border-red-500' : 'border-brand'}`}>
        <p className="text-sm font-medium text-navy-heading">{message}</p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
