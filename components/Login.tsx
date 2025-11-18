import React, { useState } from 'react';
import { useAppState } from '../state/AppContext';
import * as authService from '../services/authService';
import { GoogleIcon, MicrosoftIcon } from './Icons';
import Logo from './Logo';
import { useLocalization } from '../contexts/LocalizationContext';

const ResetPasswordView: React.FC<{
    onBackToLogin: () => void;
}> = ({ onBackToLogin }) => {
    const { t } = useLocalization();
    const [email, setEmail] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess('');
        setIsLoading(true);
        
        try {
            await authService.sendPasswordResetEmail(email);
            setSuccess(t('resetPassword.successLinkSent'));
        } catch (err: any) {
            console.error("Password reset submission failed:", err);
            setSuccess(t('resetPassword.successLinkSent'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full animate-fade-in">
            <p className="text-sm text-center text-medium dark:text-gray-400 -mt-2 mb-4">{t('resetPassword.instructions')}</p>
            
            {success && <div className="p-3 my-4 text-center text-sm text-green-700 bg-green-100 rounded-md dark:bg-green-900/20 dark:text-green-300 dark:border-green-600" role="alert">{success}</div>}

            <form className="space-y-6 mt-6" onSubmit={handleEmailSubmit}>
                <div>
                    <label htmlFor="reset-email" className="sr-only">{t('login.emailLabel')}</label>
                    <input id="reset-email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder={t('login.emailPlaceholder')}
                    />
                </div>
                <div>
                    <button type="submit" disabled={isLoading || !!success} className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-primary/50 disabled:cursor-not-allowed">
                        {isLoading ? t('common.saving') : t('resetPassword.sendLink')}
                    </button>
                </div>
            </form>

            <div className="text-sm text-center mt-6">
                <button onClick={onBackToLogin} className="font-medium text-primary hover:text-primary-hover">
                    {t('resetPassword.backToLogin')}
                </button>
            </div>
        </div>
    );
};


const Login: React.FC = () => {
    const { state, dispatch } = useAppState();
    const { systemLogoUrl } = state;
    const { t } = useLocalization();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResetView, setIsResetView] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            const user = await authService.signIn(email, password);
            dispatch({ type: 'LOGIN', payload: { user } });
        } catch (err: any) {
            setError(t(err.message || 'login.errors.invalidCredentials'));
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-light dark:bg-secondary p-4">
            <div className="max-w-sm w-full bg-white dark:bg-dark p-8 rounded-2xl shadow-2xl animate-fade-in-up border border-gray-200 dark:border-gray-700">
                 <div className="text-center mb-8 flex justify-center">
                    {systemLogoUrl ? (
                        <img src={systemLogoUrl} alt="System Logo" className="max-w-xs mx-auto h-auto max-h-20 object-contain" />
                    ) : (
                        <Logo 
                            iconClassName="h-12 w-12" 
                            textClassName="font-bold text-2xl text-secondary dark:text-white" 
                        />
                    )}
                </div>
                
                {isResetView ? (
                    <ResetPasswordView onBackToLogin={() => setIsResetView(false)} />
                ) : (
                    <div className="w-full">
                        <p className="text-center text-sm text-medium dark:text-gray-400 mb-6">{t('login.welcome')}</p>
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="p-3 text-center text-sm text-red-700 bg-red-100 rounded-md dark:bg-red-900/20 dark:text-red-300 dark:border-red-600" role="alert">
                                {error}
                                </div>
                            )}
                            <div>
                                <label htmlFor="email-address" className="sr-only">{t('login.emailLabel')}</label>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                    placeholder={t('login.emailPlaceholder')}
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="sr-only">{t('login.passwordLabel')}</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                    placeholder={t('login.passwordPlaceholder')}
                                />
                            </div>

                            <div className="flex items-center justify-end">
                                <div className="text-sm">
                                    <button type="button" onClick={() => setIsResetView(true)} className="font-medium text-primary hover:text-primary-hover">
                                        {t('login.firstTimeOrForgot')}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:bg-primary/50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? t('login.signingIn') : t('login.signIn')}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;