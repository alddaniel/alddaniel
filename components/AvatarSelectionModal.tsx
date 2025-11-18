import React, { useRef, useState } from 'react';
import { Modal } from './Modal';
import { REALISTIC_AVATARS } from '../constants';
import { PlusIcon } from './Icons';
import { useLocalization } from '../contexts/LocalizationContext';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { useAppState } from '../state/AppContext';

interface AvatarSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAvatar: (avatarUrl: string) => void;
}

/**
 * Uploads a file to a specified Supabase Storage bucket.
 * @param file The file to upload.
 * @param bucket The name of the storage bucket (e.g., 'public-assets').
 * @returns A promise that resolves to the public URL of the uploaded file.
 * @throws An error if the upload fails.
 */
const uploadFileToSupabase = async (file: File, bucket: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading file to Supabase Storage:', uploadError);
    throw new Error('Failed to upload file to storage.');
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  if (!data || !data.publicUrl) {
    throw new Error('Failed to get public URL for uploaded file.');
  }

  return data.publicUrl;
};


export const AvatarSelectionModal: React.FC<AvatarSelectionModalProps> = ({ isOpen, onClose, onSelectAvatar }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLocalization();
  const { dispatch } = useAppState();
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadClick = () => {
    if (!isSupabaseConfigured) {
      alert("File upload is disabled. Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are not set.");
      return;
    }
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      dispatch({ type: 'SHOW_LOADING' });
      try {
        // Use a generic 'public-assets' bucket.
        // In a production app, this bucket must exist and have public read access policies.
        const publicUrl = await uploadFileToSupabase(file, 'public-assets');
        onSelectAvatar(publicUrl);
        onClose();
      } catch (error) {
        console.error("Error uploading file to Supabase Storage", error);
        alert('File upload failed. Check browser console for details and ensure the `public-assets` bucket exists in Supabase with public read access.');
      } finally {
        setIsUploading(false);
        dispatch({ type: 'HIDE_LOADING' });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('avatarSelection.title')}>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
        <button
          onClick={handleUploadClick}
          className="w-16 h-16 flex items-center justify-center rounded-full border-2 border-dashed border-gray-300 text-gray-400 hover:border-primary hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-wait"
          aria-label={t('customers.form.uploadLogo')}
          disabled={isUploading}
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          ) : (
            <PlusIcon className="w-8 h-8" />
          )}
          <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="sr-only"
              accept="image/*"
              disabled={isUploading}
          />
        </button>
        {REALISTIC_AVATARS.map((avatarUrl, index) => (
          <button
            key={index}
            onClick={() => onSelectAvatar(avatarUrl)}
            className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-150 ease-in-out"
            aria-label={`Avatar ${index + 1}`}
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