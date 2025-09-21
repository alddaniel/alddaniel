import React, { useState, useEffect } from 'react';
import { useAppState } from '../state/AppContext';
import * as authService from '../services/authService';
import { GoogleIcon, MicrosoftIcon } from './Icons';
import { useLocalization } from '../contexts/LocalizationContext';

const Login: React.FC = () => {
    const { dispatch } = useAppState();
    const { t } = useLocalization();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [systemLogo, setSystemLogo] = useState<string | null>(null);

    useEffect(() => {
        // Load system logo from localStorage on component mount
        const savedLogo = localStorage.getItem('system_logo_url');
        if (savedLogo) {
            setSystemLogo(savedLogo);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            const user = await authService.login(email, password, rememberMe);
            dispatch({ type: 'LOGIN', payload: { user } });
        } catch (err: any) {
            setError(t(err.message));
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-light dark:bg-secondary p-4">
            <div className="w-full max-w-sm p-8 space-y-6 bg-white dark:bg-dark rounded-xl shadow-lg animate-fade-in-up">
                <div className="text-center">
                    <div className="flex items-center justify-center mb-2 h-32">
                         {systemLogo ? (
                            <img src={systemLogo} alt={t('app.title.short')} className="max-h-full w-auto object-contain drop-shadow-2xl" />
                        ) : (
                            <h1 className="text-3xl font-bold text-secondary dark:text-white">{t('app.title.full')}</h1>
                        )}
                    </div>
                    <p className="mt-2 text-medium dark:text-gray-400">{t('login.welcome')}</p>
                </div>
                
                <form className="space-y-6" onSubmit={handleSubmit}>
                     {error && (
                        <div className="p-3 text-center text-sm text-red-700 bg-red-100 rounded-md dark:bg-red-900/20 dark:text-red-300 dark:border-red-600" role="alert">
                           {error}
                        </div>
                    )}
                    <div>
                        <label htmlFor="email-address" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('login.emailLabel')}</label>
                        <input
                            id="email-address"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            placeholder={t('login.emailPlaceholder')}
                        />
                    </div>
                    <div>
                        <label htmlFor="password"className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('login.passwordLabel')}</label>
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

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-900"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                {t('login.rememberMe')}
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="#" className="font-medium text-primary hover:text-primary-hover">
                                {t('login.forgotPassword')}
                            </a>
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
        </div>
    );
};

export default Login;