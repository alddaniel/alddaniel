




import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { navItems } from '../constants';
import { Appointment, User, Customer, Supplier, AppointmentStatus, Company } from '../types';
import { BellIcon, SearchIcon, LogoutIcon, UserProfile, CustomerIcon, SupplierIcon, AgendaIcon, SunIcon, MoonIcon, MenuIcon, GlobeIcon, ChevronDownIcon, InformationCircleIcon } from './Icons';
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

const TrialBanner: React.FC<{ company: Company | undefined }> = ({ company }) => {
    const { t } = useLocalization();

    if (!company || company.status !== 'trial' || !company.trialEndsAt) {
        return null;
    }

    const now = new Date();
    const endDate = new Date(company.trialEndsAt);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
        return (
             <div className="bg-red-600 text-white text-center text-sm py-1.5 px-4 font-semibold">
                {t('header.trialExpiredBanner')}
            </div>
        );
    }
    
    return (
        <div className="bg-yellow-500 text-black text-center text-sm py-1.5 px-4 font-semibold flex items-center justify-center gap-2">
            <InformationCircleIcon className="w-5 h-5" />
            {t('header.trialBanner', { days: diffDays })}
        </div>
    );
}


const Header: React.FC<HeaderProps> = ({ companyName, currentUser, appointments, customers, suppliers, onLogout, onMenuClick }) => {
    const { state, dispatch, hasPermission } = useAppState();
    const { theme, companies } = state;
    const { t, locale, setLanguage, language } = useLocalization();
    const location = useLocation();
    const navigate = useNavigate();
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isLanguageOpen, setIsLanguageOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<{ customers: Customer[]; suppliers: Supplier[]; appointments: Appointment[] } | null>(null);
    
    const searchRef = useRef<HTMLDivElement>(null);
    const languageRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);

    const currentCompany = useMemo(() => companies.find(c => c.id === currentUser.companyId), [companies, currentUser]);

    const currentNavItem = navItems.find(item => {
        if (item.path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(item.path);
    });
    const pageTitle = currentNavItem ? t(currentNavItem.nameKey) : t('sidebar.dashboard');

    const companyData = useMemo(() => {
        if (!currentUser) return { visibleAppointments: [], visibleCustomers: [], visibleSuppliers: [] };
        
        const isSuperAdmin = hasPermission('MANAGE_ALL_COMPANIES');

        const visibleAppointments = isSuperAdmin ? appointments : appointments.filter(a => a.companyId === currentUser.companyId);
        const visibleCustomers = isSuperAdmin ? customers : customers.filter(c => c.companyId === currentUser.companyId);
        const visibleSuppliers = isSuperAdmin ? suppliers : suppliers.filter(s => s.companyId === currentUser.companyId);

        return { visibleAppointments, visibleCustomers, visibleSuppliers };
    }, [appointments, customers, suppliers, currentUser, hasPermission]);

    const todaysAppointments = useMemo(() => {
        const now = new Date();
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        return companyData.visibleAppointments
            .filter(app => app.start > now && app.start <= endOfToday && app.status === AppointmentStatus.SCHEDULED)
            .sort((a, b) => a.start.getTime() - b.start.getTime());
    }, [companyData.visibleAppointments]);
    
    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchTerm.trim() === '') {
                setSearchResults(null);
                return;
            }

            const lowercasedTerm = searchTerm.toLowerCase();

            const filteredCustomers = companyData.visibleCustomers.filter(c =>
                c.name.toLowerCase().includes(lowercasedTerm)
            );
            const filteredSuppliers = companyData.visibleSuppliers.filter(s =>
                s.name.toLowerCase().includes(lowercasedTerm)
            );
            const filteredAppointments = companyData.visibleAppointments.filter(a =>
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
    }, [searchTerm, companyData]);
    
     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setSearchResults(null);
                setSearchTerm('');
            }
            if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
                setIsLanguageOpen(false);
            }
             if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
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

    // FIX: Explicitly type the languageOptions array to ensure opt.code is assignable to the Language type.
    const languageOptions: { code: Language; name: string }[] = [
        { code: 'pt', name: 'Português' },
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Español' },
    ];


    return (
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0">
             <TrialBanner company={currentCompany} />
            <div className="h-20 flex items-center justify-between px-4 sm:px-8">
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

                    <div ref={languageRef} className="relative">
                        <button
                            onClick={() => setIsLanguageOpen(prev => !prev)}
                            className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <GlobeIcon className="w-6 h-6" />
                            <span className="text-xs font-bold uppercase">{language}</span>
                        </button>
                        {isLanguageOpen && (
                            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 rounded-lg shadow-xl z-20 border dark:border-gray-700 animate-fade-in">
                                <ul className="py-1">
                                    {languageOptions.map(opt => (
                                        <li key={opt.code}>
                                            <button
                                                onClick={() => {
                                                    setLanguage(opt.code);
                                                    setIsLanguageOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm ${language === opt.code ? 'font-bold text-primary bg-gray-100 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                            >
                                                {opt.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div ref={notificationsRef} className="relative">
                        <button onClick={() => setIsNotificationsOpen(prev => !prev)} className="relative text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                            <BellIcon className="w-6 h-6" />
                            {todaysAppointments.length > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                    {todaysAppointments.length}
                                </span>
                            )}
                        </button>
                        {isNotificationsOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-xl z-20 border dark:border-gray-700 animate-fade-in">
                            <div className="p-4 font-bold border-b dark:border-gray-700 text-secondary dark:text-gray-100">{t('header.appointmentsForToday')}</div>
                                <ul className="py-2 max-h-64 overflow-y-auto">
                                    {todaysAppointments.length > 0 ? (
                                        todaysAppointments.map(app => (
                                            <li key={app.id}>
                                                <button onClick={handleNotificationClick} className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{app.title}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{app.start.toLocaleString(locale, { timeStyle: 'short' })}</p>
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

                    <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>

                    <div className="flex items-center gap-4">
                        <UserProfile user={currentUser} className="w-10 h-10" />
                        <div className="hidden sm:block">
                            <p className="font-semibold text-sm text-secondary dark:text-gray-100">{currentUser.name}</p>
                            <p className="text-xs text-medium dark:text-gray-400">{t(`settings.users.form.roles.${currentUser.role.toLowerCase()}`)}</p>
                        </div>
                        <button onClick={onLogout} className="text-gray-500 dark:text-gray-400 hover:text-primary" title={t('header.logout')}>
                            <LogoutIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;