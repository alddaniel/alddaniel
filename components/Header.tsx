

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { navItems } from '../constants';
import { Appointment, User, Customer, Supplier, AppointmentStatus } from '../types';
import { BellIcon, SearchIcon, LogoutIcon, UserProfile, CustomerIcon, SupplierIcon, AgendaIcon, SunIcon, MoonIcon, MenuIcon, GlobeIcon } from './Icons';
import { useAppState } from '../state/AppContext';
import { useLocalization, Language } from '../contexts/LocalizationContext';

interface HeaderProps {
    companyName: string;
    currentUser: User;
    appointments: Appointment[];
    customers: Customer[];
    suppliers: Supplier[];
    onLogout: () => void;
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ companyName, currentUser, appointments, customers, suppliers, onLogout, onMenuClick }) => {
    const { state, dispatch } = useAppState();
    const { theme } = state;
    const { t, language, setLanguage } = useLocalization();
    const location = useLocation();
    const navigate = useNavigate();
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<{ customers: Customer[]; suppliers: Supplier[]; appointments: Appointment[] } | null>(null);
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
    
    const searchRef = useRef<HTMLDivElement>(null);
    const langRef = useRef<HTMLDivElement>(null);

    const currentNavItem = navItems.find(item => {
        if (item.path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(item.path);
    });
    const pageTitle = currentNavItem ? t(currentNavItem.nameKey) : t('app.title.short');

    const todaysAppointments = useMemo(() => {
        const now = new Date();
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        return appointments
            .filter(app => app.start > now && app.start <= endOfToday && app.status === AppointmentStatus.SCHEDULED)
            .sort((a, b) => a.start.getTime() - b.start.getTime());
    }, [appointments]);
    
    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchTerm.trim() === '') {
                setSearchResults(null);
                return;
            }

            const lowercasedTerm = searchTerm.toLowerCase();

            const filteredCustomers = customers.filter(c =>
                c.name.toLowerCase().includes(lowercasedTerm)
            );
            const filteredSuppliers = suppliers.filter(s =>
                s.name.toLowerCase().includes(lowercasedTerm)
            );
            const filteredAppointments = appointments.filter(a =>
                a.title.toLowerCase().includes(lowercasedTerm)
            );

            setSearchResults({
                customers: filteredCustomers,
                suppliers: filteredSuppliers,
                appointments: filteredAppointments,
            });
        }, 300); // 300ms debounce

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm, customers, suppliers, appointments]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setSearchResults(null);
                setSearchTerm('');
            }
             if (langRef.current && !langRef.current.contains(event.target as Node)) {
                setIsLangDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleNotificationClick = () => {
        navigate('/agenda');
        setIsNotificationsOpen(false);
    };

     const handleResultClick = (path: string, params: Record<string, string> = {}) => {
        const searchParams = new URLSearchParams(params);
        navigate(`${path}?${searchParams.toString()}`);
        setSearchTerm('');
        setSearchResults(null);
    };
    
    const hasResults = searchResults && (searchResults.customers.length > 0 || searchResults.suppliers.length > 0 || searchResults.appointments.length > 0);
    
    const languages: { [key in Language]: string } = {
        en: 'English',
        pt: 'Português',
        es: 'Español'
    };


    return (
        <header className="h-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sm:px-8 flex-shrink-0">
            <div className="flex items-center">
                 <button onClick={onMenuClick} className="text-gray-500 dark:text-gray-400 lg:hidden mr-4">
                    <MenuIcon className="w-6 h-6" />
                </button>
                <div>
                     <h1 className="text-xl sm:text-2xl font-bold text-secondary dark:text-gray-100">{pageTitle}</h1>
                     <p className="text-sm text-medium dark:text-gray-400 hidden sm:block">{companyName}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
                <div ref={searchRef} className="relative hidden md:block">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder={t('header.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-40 sm:w-64 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-gray-700 dark:text-gray-200"
                    />
                     {searchResults && (
                        <div className="absolute top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-30 border border-gray-200 dark:border-gray-700 animate-fade-in">
                            <div className="max-h-96 overflow-y-auto p-2">
                                {hasResults ? (
                                    <>
                                        {searchResults.customers.length > 0 && (
                                            <div>
                                                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('header.searchResults.customers')}</h3>
                                                <ul>
                                                    {searchResults.customers.map(customer => (
                                                        <li key={`cust-${customer.id}`}>
                                                            <button onMouseDown={() => handleResultClick('/customers', { search: customer.name })} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                                                                <CustomerIcon className="w-4 h-4 text-gray-400" />
                                                                <span>{customer.name}</span>
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {searchResults.suppliers.length > 0 && (
                                            <div>
                                                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase border-t dark:border-gray-600 mt-2 pt-2">{t('header.searchResults.suppliers')}</h3>
                                                <ul>
                                                    {searchResults.suppliers.map(supplier => (
                                                        <li key={`supp-${supplier.id}`}>
                                                            <button onMouseDown={() => handleResultClick('/suppliers', { search: supplier.name })} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                                                                <SupplierIcon className="w-4 h-4 text-gray-400" />
                                                                <span>{supplier.name}</span>
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {searchResults.appointments.length > 0 && (
                                            <div>
                                                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase border-t dark:border-gray-600 mt-2 pt-2">{t('header.searchResults.appointments')}</h3>
                                                <ul>
                                                    {searchResults.appointments.map(appointment => (
                                                        <li key={`app-${appointment.id}`}>
                                                            <button onMouseDown={() => handleResultClick('/agenda', { view: 'list', search: appointment.title })} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                                                                <AgendaIcon className="w-4 h-4 text-gray-400" />
                                                                <span>{appointment.title}</span>
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                        {t('header.searchResults.noResults')}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                
                 <button
                    onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
                    className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title={theme === 'light' ? t('header.changeToDarkMode') : t('header.changeToLightMode')}
                >
                    {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
                </button>

                <div className="relative">
                    <button onClick={() => setIsNotificationsOpen(prev => !prev)} className="relative text-gray-500 dark:text-gray-400 hover:text-primary">
                        <BellIcon className="w-6 h-6" />
                        {todaysAppointments.length > 0 && (
                            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                {todaysAppointments.length}
                            </span>
                        )}
                    </button>
                    {isNotificationsOpen && (
                        <div onClick={() => setIsNotificationsOpen(false)} className="fixed inset-0 h-full w-full z-10"></div>
                    )}
                    {isNotificationsOpen && (
                         <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-xl z-20 border dark:border-gray-700">
                           <div className="p-4 font-bold border-b dark:border-gray-700 text-secondary dark:text-gray-100">{t('header.appointmentsForToday')}</div>
                            <ul className="py-2 max-h-64 overflow-y-auto">
                                {todaysAppointments.length > 0 ? (
                                    todaysAppointments.map(app => (
                                        <li key={app.id}>
                                            <button onClick={handleNotificationClick} className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                                <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{app.title}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{app.start.toLocaleString('pt-BR', { timeStyle: 'short' })}</p>
                                            </button>
                                        </li>
                                    ))
                                ) : (
                                    <li className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{t('header.noAppointmentsToday')}</li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>

                 <div ref={langRef} className="relative">
                    <button
                        onClick={() => setIsLangDropdownOpen(prev => !prev)}
                        className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Change language"
                    >
                        <GlobeIcon className="w-6 h-6" />
                    </button>
                    {isLangDropdownOpen && (
                         <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 rounded-lg shadow-xl z-20 border dark:border-gray-700 animate-fade-in">
                           <ul className="py-1">
                                {Object.entries(languages).map(([langCode, langName]) => (
                                    <li key={langCode}>
                                        <button 
                                            onClick={() => { setLanguage(langCode as Language); setIsLangDropdownOpen(false); }}
                                            className={`w-full text-left px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 ${language === langCode ? 'font-bold text-primary' : ''}`}
                                        >
                                            {langName}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>


                <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>

                <div className="flex items-center gap-4">
                    <UserProfile user={currentUser} className="w-10 h-10" />
                    <div className="hidden sm:block">
                        <p className="font-semibold text-sm text-secondary dark:text-gray-100">{currentUser.name}</p>
                        <p className="text-xs text-medium dark:text-gray-400">{currentUser.role}</p>
                    </div>
                    <button onClick={onLogout} className="text-gray-500 dark:text-gray-400 hover:text-primary" title={t('header.logout')}>
                        <LogoutIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;