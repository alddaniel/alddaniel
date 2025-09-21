import React from 'react';
import { Modal } from './Modal';
import { iconMap } from './Icons';

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (iconName: string) => void;
}

export const IconPickerModal: React.FC<IconPickerModalProps> = ({ isOpen, onClose, onSelectIcon }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Selecionar Ícone">
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
        {Object.entries(iconMap).map(([name, IconComponent]) => (
          <button
            key={name}
            onClick={() => onSelectIcon(name)}
            className="flex items-center justify-center p-3 rounded-lg text-gray-600 hover:bg-gray-200 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            aria-label={`Selecionar ícone ${name}`}
          >
            <IconComponent className="w-8 h-8" />
          </button>
        ))}
      </div>
    </Modal>
  );
};
