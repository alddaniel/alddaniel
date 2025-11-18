import React from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { LogoutIcon, AlertTriangleIcon } from './Icons';

interface AccountStatusScreenProps {
  reason: 'suspended' | 'trial_expired' | 'past_due' | null;
  onLogout: () => void;
}

const AccountStatusScreen: React.FC<AccountStatusScreenProps> = ({ reason, onLogout }) => {
    const { t } = useLocalization();

    const messages = {
        suspended: {
            title: t('accountStatus.suspended.title'),
            body: t('accountStatus.suspended.body'),
        },
        trial_expired: {
            title: t('accountStatus.trialExpired.title'),
            body: t('accountStatus.trialExpired.body'),
        },
        past_due: {
            title: t('accountStatus.past_due.title'),
            body: t('accountStatus.past_due.body'),
        },
    };
    
    const currentMessage = reason ? messages[reason] : messages.suspended;

    return (
        <div className="flex items-center justify-center min-h-screen bg-light dark:bg-secondary p-4">
            <div className="max-w-md w-full bg-white dark:bg-dark p-8 rounded-2xl shadow-2xl text-center animate-fade-in-up">
                <AlertTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-secondary dark:text-gray-100 mb-2">{currentMessage.title}</h1>
                <p className="text-medium dark:text-gray-400 mb-6">{currentMessage.body}</p>
                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-hover transition-colors"
                >
                    <LogoutIcon className="w-5 h-5" />
                    {t('accountStatus.logout')}
                </button>
            </div>
        </div>
    );
};

export default AccountStatusScreen;