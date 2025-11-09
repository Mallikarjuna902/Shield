import { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, children, title }) {
  // Close modal when pressing Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/70 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
        
        {/* Modal panel */}
        <div className="relative transform overflow-hidden rounded-xl bg-slate-900 border border-slate-800 shadow-2xl transition-all w-full max-w-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}

export function ModalHeader({ children, onClose }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800 p-6">
      <h3 className="text-xl font-semibold text-white">
        {children}
      </h3>
      <button
        type="button"
        onClick={onClose}
        className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

export function ModalContent({ children, className = '' }) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}

export function ModalFooter({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-end space-x-3 border-t border-slate-800 p-6 ${className}`}>
      {children}
    </div>
  );
}
