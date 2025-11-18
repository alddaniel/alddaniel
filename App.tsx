import React, { Suspense, useMemo, useEffect, useState } from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import { StateProvider, useAppState } from './state/AppContext';
import { LocalizationProvider, useLocalization } from './contexts/LocalizationContext';
import { navItems } from './constants';
import * as authService from './services/authService';
import { User, Company, Plan } from './types';
import Header from './components/Header';
import Login from './components/Login';
import { CloseIcon, CheckCircleIcon, InformationCircleIcon, AlertTriangleIcon } from './components/Icons';
import Logo from './components/Logo';
import { supabase } from './services/supabaseClient';
import PasswordResetModal from './components/PasswordResetModal';
import { sendAppointmentReminderEmail } from './services/notificationService';
import AccountStatusScreen from './components/AccountStatusScreen';
import GlobalLoadingSpinner from './components/GlobalLoadingSpinner';

// Lazy-loaded page components for code-splitting
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const CustomerManagement = React.lazy(() => import('./components/CustomerManagement'));
const CustomerDetailPage = React.lazy(() => import('./components/CustomerDetailPage'));
const SupplierManagement = React.lazy(() => import('./components/SupplierManagement'));
const Agenda = React.lazy(() => import('./components/Agenda'));
const Reports = React.lazy(() => import('./components/Reports'));
const WhatsAppSender = React.lazy(() => import('./components/WhatsAppCloud'));
const Settings = React.lazy(() => import('./components/Settings'));
const Help = React.lazy(() => import('./components/Help'));


const Sidebar: React.FC<{onClose?: () => void; company: Company, plan: Plan | null}> = ({onClose, company, plan}) => {
    const { hasPermission } = useAppState();
    const { t } = useLocalization();

    const visibleNavItems = useMemo(() => {
        return navItems.filter(item => {
             if (item.path === '/whatsapp' && !(plan?.hasWhatsApp)) {
                return false;
            }
            return !item.permission || hasPermission(item.permission)
        });
    }, [hasPermission, plan]);

    return (
        <div className="w-64 bg-white dark:bg-secondary text-gray-300 flex flex-col border-r border-gray-200 dark:border-gray-700 h-full">
            <div className="h-20 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                    {company.logoUrl ? (
                        <img src={company.logoUrl} alt={`${company.name} logo`} className="max-h-10 object-contain flex-shrink-0" />
                    ) : (
                        <Logo 
                            showText={false} 
                            iconClassName="h-10 w-10" 
                            className="flex-shrink-0" 
                        />
                    )}
                    <span className="font-bold text-lg text-secondary dark:text-white truncate">
                        {company.name}
                    </span>
                </div>
                 {onClose && (
                    <button onClick={onClose} className="lg:hidden p-1 text-gray-500 rounded-full hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark ml-2 flex-shrink-0">
                        <CloseIcon className="w-6 h-6"/>
                    </button>
                )}
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                {visibleNavItems.map((item: any) => (
                    <NavLink
                        key={item.nameKey}
                        to={item.path}
                        end={item.path === '/'}
                        onClick={onClose} // Close sidebar on navigation
                        className={({ isActive }: { isActive: boolean }) =>
                            `flex items-center px-4 py-2.5 rounded-lg transition-colors duration-200 ${
                                isActive
                                    ? 'bg-primary text-white'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark hover:text-secondary dark:hover:text-white'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5 mr-3" />
                        <span className="font-medium">{t(item.nameKey)}</span>
                    </NavLink>
                ))}
            </nav>
             <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    By SobControle
                </p>
            </div>
        </div>
    );
};


const NotificationToast: React.FC<{ message: string; type: 'success' | 'info' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
    const config = {
        success: {
            bgColor: 'bg-green-500 dark:bg-green-600',
            borderColor: 'border-green-600 dark:border-green-700',
            icon: <CheckCircleIcon className="w-6 h-6" />
        },
        info: {
            bgColor: 'bg-blue-500 dark:bg-blue-600',
            borderColor: 'border-blue-600 dark:border-blue-700',
            icon: <InformationCircleIcon className="w-6 h-6" />
        },
        error: {
            bgColor: 'bg-red-500 dark:bg-red-600',
            borderColor: 'border-red-600 dark:border-red-700',
            icon: <AlertTriangleIcon className="w-6 h-6" />
        }
    };

    const { bgColor, borderColor, icon } = config[type];

    return (
        <div className={`fixed bottom-4 right-4 md:bottom-8 md:right-8 text-white px-4 py-3 rounded-lg shadow-xl z-50 animate-fade-in-up flex items-center gap-4 border-l-4 ${bgColor} ${borderColor}`}>
            <div className="flex-shrink-0">{icon}</div>
            <p className="flex-grow text-sm font-medium">{message}</p>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-white">
                <CloseIcon className="w-5 h-5"/>
            </button>
        </div>
    );
};

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center h-full w-full bg-light dark:bg-secondary">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
    </div>
);

const PasswordResetFlow: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
    const { state } = useAppState();
    
    const handleClose = async () => {
        // Clear the recovery session and return to login flow/dashboard check
        // Do NOT sign out here, as the user is technically authenticated after password reset.
        // We want them to fall through to the 'currentUser' check in AppContent.
        onFinish();
    };

    return (
        <>
            <Login />
            <PasswordResetModal onClose={handleClose} />
            {state.isLoading && <GlobalLoadingSpinner />}
        </>
    );
};


const AppContent: React.FC = () => {
    const { state, dispatch } = useAppState();
    const { t, locale } = useLocalization();
    const { currentUser, customers, suppliers, appointments, users, companies, activityLog, notification, theme, remindersShown, plans, isLoading } = state;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    
    // Centralized effect for managing Supabase authentication state
    useEffect(() => {
        const setSessionUser = async (authUser: any) => {
            // Use getOrCreateUserProfile to handle cases where Auth exists but DB row is missing
            // This is critical for the "User profile not found" error after password reset.
            try {
                setAuthError(null);
                const userProfile = await authService.getOrCreateUserProfile(authUser);
                if (userProfile) {
                    dispatch({ type: 'LOGIN', payload: { user: userProfile } });
                } else {
                    console.error(`User ${authUser.id} authenticated but profile creation failed.`);
                    // Don't sign out immediately, show error to user
                    setAuthError("Unable to load user profile. Please try again or contact support.");
                }
            } catch (e: any) {
                console.error("Error in session setup:", e);
                setAuthError(e.message || "Failed to initialize user session.");
            }
        };

        // Check for an active session when the app first loads
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setSessionUser(session.user);
            }
        });

        // Listen for all auth events
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
                await setSessionUser(session.user);
            } else if (event === 'SIGNED_OUT') {
                dispatch({ type: 'LOGOUT' });
                setAuthError(null);
            }
        });

        return () => subscription.unsubscribe();
    }, [dispatch]);


    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                dispatch({ type: 'HIDE_NOTIFICATION' });
            }, 4000);
            return () => clearTimeout(timer); // Clear the timer if a new notification appears or the component unmounts.
        }
    }, [notification, dispatch]);

    useEffect(() => {
        const checkReminders = () => {
            if (!currentUser) return;

            const now = new Date();
            const upcomingAppointments = appointments.filter(app =>
                app.status === 'agendado' &&
                app.reminder &&
                !remindersShown.includes(app.id) &&
                app.companyId === currentUser.companyId
            );

            for (const app of upcomingAppointments) {
                const reminderTime = new Date(new Date(app.start).getTime() - app.reminder * 60000);

                if (now >= reminderTime && now < new Date(app.start)) {
                    const minutes = app.reminder!;
                    let reminderText = '';
                    if (minutes < 60) {
                        reminderText = t(minutes > 1 ? 'common.time.minutes' : 'common.time.minute', { count: minutes });
                    } else if (minutes < 1440) {
                        const hours = Math.floor(minutes / 60);
                        reminderText = t(hours > 1 ? 'common.time.hours' : 'common.time.hour', { count: hours });
                    } else {
                        const days = Math.floor(minutes / 1440);
                        reminderText = t(days > 1 ? 'common.time.days' : 'common.time.day', { count: days });
                    }

                    dispatch({ 
                        type: 'SHOW_NOTIFICATION', 
                        payload: { 
                            messageKey: 'notifications.ui.reminder', 
                            messageParams: { title: app.title, time: reminderText },
                            type: 'info' 
                        } 
                    });

                    // "Send" emails to all participants
                    for (const participant of app.participants) {
                        if (participant.email) {
                            sendAppointmentReminderEmail(app, participant, t, locale);
                        }
                    }

                    dispatch({ type: 'MARK_REMINDER_SHOWN', payload: app.id });
                }
            }
        };

        const intervalId = setInterval(checkReminders, 30000);

        return () => {
            clearInterval(intervalId);
        };
    }, [appointments, remindersShown, currentUser, dispatch, t, locale]);

    const handleLogout = async () => {
        await authService.signOut();
        dispatch({ type: 'LOGOUT' });
        setAuthError(null);
    };

    if (authError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-light dark:bg-secondary p-4">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md text-center border border-gray-200 dark:border-gray-700">
                    <AlertTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Authentication Error</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">{authError}</p>
                    <button onClick={handleLogout} className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-hover transition-colors">
                        Back to Login
                    </button>
                </div>
            </div>
        )
    }

    // Priority 1: If no user is logged in, show the standard Login screen.
    if (!currentUser) {
        return (
            <>
                <Login />
                {isLoading && <GlobalLoadingSpinner />}
            </>
        );
    }
    

    const companyForCurrentUser = companies.find(c => c.id === currentUser.companyId);
    
    // While data is loading for the first time after login, show a spinner.
    if (!companyForCurrentUser && isLoading) {
        return <GlobalLoadingSpinner />;
    }
    
    // If we have a user but NO company loaded yet (and not loading), something is off or it's a fresh create.
    // We can render a basic loading state or the sidebar with a placeholder until data syncs.
    if (!companyForCurrentUser) {
         return <GlobalLoadingSpinner />;
    }
    
    const planForCurrentUser = companyForCurrentUser ? plans.find(p => p.id === companyForCurrentUser.planId) : null;


    if (companyForCurrentUser) {
        let isBlocked = false;
        let blockReason: 'suspended' | 'trial_expired' | 'past_due' | null = null;

        if (companyForCurrentUser.status === 'suspended') {
            isBlocked = true;
            blockReason = 'suspended';
        } else if (companyForCurrentUser.status === 'trial' && companyForCurrentUser.trialEndsAt) {
            if (new Date() > new Date(companyForCurrentUser.trialEndsAt)) {
                isBlocked = true;
                blockReason = 'trial_expired';
            }
        }


        if (isBlocked) {
            return <AccountStatusScreen reason={blockReason} onLogout={handleLogout} />;
        }
    }


    return (
        <div className="flex h-screen bg-light dark:bg-secondary overflow-hidden">
            {isSidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

             <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translateX(0)' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-40 lg:hidden`}>
                <Sidebar onClose={() => setIsSidebarOpen(false)} company={companyForCurrentUser!} plan={planForCurrentUser} />
            </div>

            <div className="hidden lg:flex lg:flex-shrink-0">
                <Sidebar company={companyForCurrentUser!} plan={planForCurrentUser}/>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header
                    companyName={companyForCurrentUser!.name}
                    currentUser={currentUser}
                    appointments={appointments}
                    customers={customers}
                    suppliers={suppliers}
                    onLogout={handleLogout}
                    onMenuClick={() => setIsSidebarOpen(true)}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    <Suspense fallback={<LoadingSpinner />}>
                        <Routes>
                        <Route path="/" element={<Dashboard customers={customers} suppliers={suppliers} appointments={appointments} activityLog={activityLog} />} />
                        <Route path="/customers" element={<CustomerManagement />} />
                        <Route path="/customers/:customerId" element={<CustomerDetailPage />} />
                        <Route path="/suppliers" element={<SupplierManagement />} />
                        <Route path="/agenda" element={<Agenda />} />
                        <Route path="/reports" element={<Reports appointments={appointments} customers={customers} suppliers={suppliers} activityLog={activityLog} />} />
                        <Route path="/whatsapp" element={<WhatsAppSender />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/help" element={<Help />} />
                        </Routes>
                    </Suspense>
                </main>
            </div>
            {notification && <NotificationToast message={t(notification.messageKey, notification.messageParams)} type={notification.type} onClose={() => dispatch({ type: 'HIDE_NOTIFICATION' })} />}
            {isLoading && <GlobalLoadingSpinner />}
        </div>
    );
};

const App: React.FC = () => {
    // Use sessionStorage to persist recovery mode across re-renders or minor URL changes
    // during the authentication flow, as Supabase client might strip the hash.
    const [recoveryMode, setRecoveryMode] = useState(() => {
        const isRecoveryHash = window.location.hash.includes('type=recovery');
        if (isRecoveryHash) {
            sessionStorage.setItem('auth_recovery_mode', 'true');
            return true;
        }
        return sessionStorage.getItem('auth_recovery_mode') === 'true';
    });

    useEffect(() => {
        // Also listen for the event, just in case the app is already open/mounted.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                sessionStorage.setItem('auth_recovery_mode', 'true');
                setRecoveryMode(true);
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleRecoveryFinish = () => {
        sessionStorage.removeItem('auth_recovery_mode');
        setRecoveryMode(false);
    };

    return (
        <LocalizationProvider>
            <StateProvider>
                {recoveryMode ? (
                    <PasswordResetFlow onFinish={handleRecoveryFinish} />
                ) : (
                    <HashRouter>
                        <AppContent />
                    </HashRouter>
                )}
            </StateProvider>
        </LocalizationProvider>
    );
};

export default App;