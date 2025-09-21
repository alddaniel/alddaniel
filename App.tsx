

import React, { useMemo, useEffect, useState } from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import { StateProvider, useAppState } from './state/AppContext';
import { LocalizationProvider, useLocalization } from './contexts/LocalizationContext';
import { MOCK_USERS, navItems } from './constants';
import * as authService from './services/authService';
import { User, Company } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import CustomerManagement from './components/CustomerManagement';
import SupplierManagement from './components/SupplierManagement';
import Agenda from './components/Agenda';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Login from './components/Login';
import Help from './components/Help';
import { CloseIcon } from './components/Icons';

const Sidebar: React.FC<{onClose?: () => void; company: Company}> = ({onClose, company}) => {
    const { hasPermission } = useAppState();
    const { t } = useLocalization();

    const visibleNavItems = useMemo(() => {
        return navItems.filter(item => !item.permission || hasPermission(item.permission));
    }, [hasPermission]);

    return (
        <div className="w-64 bg-white dark:bg-secondary text-gray-300 flex flex-col border-r border-gray-200 dark:border-gray-700 h-full">
            <div className="h-20 flex items-center justify-between px-4 text-2xl font-bold text-secondary dark:text-white border-b border-gray-200 dark:border-gray-700">
                {company.logoUrl ? (
                    <img src={company.logoUrl} alt={`${company.name} logo`} className="h-10 max-w-[180px] object-contain" />
                ) : (
                    <span>{t('app.title.short')}</span>
                )}
                 {onClose && (
                    <button onClick={onClose} className="lg:hidden p-1 text-gray-500 rounded-full hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark">
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
        </div>
    );
};


const NotificationToast: React.FC<{ message: string; type: 'success' | 'info'; onClose: () => void }> = ({ message, type, onClose }) => {
    const bgColor = type === 'success' ? 'bg-green-600' : 'bg-blue-600';
    const borderColor = type === 'success' ? 'border-green-700' : 'border-blue-700';

    return (
        <div className={`fixed bottom-4 right-4 md:bottom-8 md:right-8 ${bgColor} text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-fade-in-up flex items-center gap-4 border-b-4 ${borderColor}`}>
            <p>{message}</p>
            <button onClick={onClose} className="text-xl font-bold opacity-70 hover:opacity-100">&times;</button>
        </div>
    );
};

const AppContent: React.FC = () => {
    const { state, dispatch } = useAppState();
    const { t } = useLocalization();
    const { currentUser, customers, suppliers, appointments, users, companies, activityLog, appointmentCategoryConfig, notification, theme, remindersShown } = state;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        // On initial load, check if a user session exists in localStorage
        const user = authService.getCurrentUser();
        if (user) {
            dispatch({ type: 'LOGIN', payload: { user } });
        }
    }, [dispatch]); // The dependency array ensures this runs only once on mount

    useEffect(() => {
        // Apply dark mode class to the root element
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
            return () => clearTimeout(timer);
        }
    }, [notification, dispatch]);

    // Effect for checking and triggering appointment reminders
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
                        reminderText = `${minutes} minuto${minutes > 1 ? 's' : ''}`;
                    } else if (minutes < 1440) {
                        const hours = Math.floor(minutes / 60);
                        reminderText = `${hours} hora${hours > 1 ? 's' : ''}`;
                    } else {
                        const days = Math.floor(minutes / 1440);
                        reminderText = `${days} dia${days > 1 ? 's' : ''}`;
                    }

                    const message = `Lembrete: "${app.title}" começa em aprox. ${reminderText}.`;

                    dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: message, type: 'info' } });
                    dispatch({ type: 'MARK_REMINDER_SHOWN', payload: app.id });
                }
            }
        };

        const intervalId = setInterval(checkReminders, 30000); // Check every 30 seconds

        return () => {
            clearInterval(intervalId);
        };
    }, [appointments, remindersShown, currentUser, dispatch]);

    const handleLogout = () => {
        authService.logout();
        dispatch({ type: 'LOGOUT' });
    };

    if (!currentUser) {
        // The Login component now handles its own authentication logic internally.
        return <Login />;
    }

    const isSuperAdmin = currentUser.email === 'ddarruspe@gmail.com';

    const companyForCurrentUser = companies.find(c => c.id === currentUser.companyId) ?? companies[0];

    const dataForCurrentUser = <T extends { companyId: string }>(data: T[]): T[] => {
        return isSuperAdmin ? data : data.filter(item => item.companyId === currentUser.companyId);
    };

    const userCustomers = dataForCurrentUser(customers);
    const userSuppliers = dataForCurrentUser(suppliers);
    const userAppointments = dataForCurrentUser(appointments);
    const userActivityLog = dataForCurrentUser(activityLog);

    return (
        <div className="flex h-screen bg-light dark:bg-secondary overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

            {/* Mobile Sidebar */}
             <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translateX(0)' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-40 lg:hidden`}>
                <Sidebar onClose={() => setIsSidebarOpen(false)} company={companyForCurrentUser} />
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:flex lg:flex-shrink-0">
                <Sidebar company={companyForCurrentUser}/>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header
                    companyName={companyForCurrentUser.name}
                    currentUser={currentUser}
                    appointments={userAppointments}
                    customers={userCustomers}
                    suppliers={userSuppliers}
                    onLogout={handleLogout}
                    onMenuClick={() => setIsSidebarOpen(true)}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    <Routes>
                       <Route path="/" element={<Dashboard customers={userCustomers} suppliersCount={userSuppliers.length} appointments={userAppointments} />} />
                       <Route path="/customers" element={<CustomerManagement />} />
                       <Route path="/suppliers" element={<SupplierManagement />} />
                       <Route path="/agenda" element={<Agenda />} />
                       <Route path="/reports" element={<Reports appointments={userAppointments} customers={userCustomers} suppliers={userSuppliers} activityLog={userActivityLog} />} />
                       <Route path="/settings" element={<Settings />} />
                       <Route path="/help" element={<Help />} />
                    </Routes>
                </main>
            </div>
            {notification && <NotificationToast message={t(notification.messageKey, notification.messageParams)} type={notification.type} onClose={() => dispatch({ type: 'HIDE_NOTIFICATION' })} />}
        </div>
    );
};

const App: React.FC = () => {
    return (
        <StateProvider>
            <LocalizationProvider>
                <HashRouter>
                    <AppContent />
                </HashRouter>
            </LocalizationProvider>
        </StateProvider>
    );
};

export default App;