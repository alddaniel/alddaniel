import React, { useRef } from 'react';
import { Modal } from './Modal';
import { REALISTIC_AVATARS } from '../constants';
import { PlusIcon } from './Icons';

interface AvatarSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAvatar: (avatarUrl: string) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const AvatarSelectionModal: React.FC<AvatarSelectionModalProps> = ({ isOpen, onClose, onSelectAvatar }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const base64 = await fileToBase64(file);
        onSelectAvatar(base64);
      } catch (error) {
        console.error("Error converting file to base64", error);
      }
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Escolha ou Carregue um Avatar">
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
        <button
          onClick={handleUploadClick}
          className="w-16 h-16 flex items-center justify-center rounded-full border-2 border-dashed border-gray-300 text-gray-400 hover:border-primary hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Carregar nova imagem"
        >
          <PlusIcon className="w-8 h-8" />
          <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="sr-only"
              accept="image/*"
          />
        </button>
        {REALISTIC_AVATARS.map((avatarUrl, index) => (
          <button
            key={index}
            onClick={() => onSelectAvatar(avatarUrl)}
            className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-150 ease-in-out"
            aria-label={`Selecionar avatar ${index + 1}`}
          >
            <img
              src={avatarUrl}
              alt={`Avatar ${index + 1}`}
              className="w-16 h-16 rounded-full object-cover"
            />
          </button>
        ))}
      </div>
    </Modal>
  );
};