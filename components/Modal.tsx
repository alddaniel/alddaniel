import React, { ReactNode } from 'react';
import { CloseIcon } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-xs z-50 flex justify-center items-center p-4 animate-fade-in" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl animate-modal-content-show" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 id="modal-title" className="text-xl font-semibold text-secondary dark:text-gray-100">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Fechar modal"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};