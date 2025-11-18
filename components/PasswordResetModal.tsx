import React, { useState } from 'react';
import { Modal } from './Modal';
import * as authService from '../services/authService';
import { useLocalization } from '../contexts/LocalizationContext';

interface PasswordResetModalProps {
  onClose: () => void;
}

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ onClose }) => {
    const { t } = useLocalization();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleClose = () => {
        // Use history API to clear the hash without refreshing the page or triggering router prematurely
        if (window.history && window.history.replaceState) {
             window.history.replaceState(null, '', window.location.pathname);
        } else {
            window.location.hash = ''; 
        }
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password.length < 6) {
            setError(t('resetPassword.passwordTooShort'));
            return;
        }

        if (password !== confirmPassword) {
            setError(t('resetPassword.passwordMismatch'));
            return;
        }

        setIsLoading(true);
        try {
            await authService.updatePassword(password);
            setSuccess(t('resetPassword.success'));
            setTimeout(() => {
                handleClose();
            }, 2500);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={handleClose} title={t('resetPassword.setNewPasswordTitle')}>
            <form className="space-y-6" onSubmit={handleSubmit}>
                {error && <div className="p-3 text-center text-sm text-red-700 bg-red-100 rounded-md dark:bg-red-900/20 dark:text-red-300 dark:border-red-600" role="alert">{error}</div>}
                {success && <div className="p-3 text-center text-sm text-green-700 bg-green-100 rounded-md dark:bg-green-900/20 dark:text-green-300 dark:border-green-600" role="alert">{success}</div>}

                {!success && (
                    <>
                        <div>
                            <label htmlFor="new-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('resetPassword.password')}</label>
                            <input
                                id="new-password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('resetPassword.confirmPassword')}</label>
                            <input
                                id="confirm-password"
                                name="confirmPassword"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                            />
                        </div>
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-primary/50"
                            >
                                {isLoading ? t('common.saving') : t('resetPassword.savePassword')}
                            </button>
                        </div>
                    </>
                )}
            </form>
        </Modal>
    );
};

export default PasswordResetModal;