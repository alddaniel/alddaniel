import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Customer, Appointment, ActivityLog, ActivityType, Supplier } from '../types';
import { CustomerIcon, SupplierIcon, AgendaIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon, UsersIcon, BriefcaseIcon } from './Icons';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAppState } from '../state/AppContext';
import { fetchNationalHolidays, Holiday } from '../services/holidayService';

// Helper function for relative time
const formatRelativeTime = (date: Date, locale: string): string => {
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    const rtf = new Intl.RelativeTimeFormat(locale.split('-')[0], { numeric: 'auto' });

    if (days > 7) {
        return date.toLocaleDateString(locale, { day: '2-digit', month: 'short' });
    }
    if (days > 0) {
        return rtf.format(-days, 'day');
    }
    if (hours > 0) {
        return rtf.format(-hours, 'hour');
    }
    if (minutes > 0) {
        return rtf.format(-minutes, 'minute');
    }
    return rtf.format(-Math.max(0, seconds), 'second');
};

const isSameDay = (d1: Date, d2: Date): boolean => {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};


interface DashboardProps {
    customers: Customer[];
    suppliers: Supplier[];
    appointments: Appointment[];
    activityLog: ActivityLog[];
}

const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl flex items-center transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1">
        <div className="bg-primary/10 text-primary p-3 rounded-full mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-medium dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-secondary dark:text-gray-100">{value}</p>
        </div>
    </div>
);


const CalendarWidget: React.FC<{ appointments: Appointment[] }> = ({ appointments }) => {
    const { t, locale } = useLocalization();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);
    const [popoverPosition, setPopoverPosition] = useState<{ top: number, left: number } | null>(null);
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [fetchedHolidayYear, setFetchedHolidayYear] = useState<number | null>(null);

     useEffect(() => {
        const year = currentDate.getFullYear();
        if (year !== fetchedHolidayYear && locale.startsWith('pt')) {
            fetchNationalHolidays(year).then(fetchedHolidays => {
                setHolidays(fetchedHolidays);
                setFetchedHolidayYear(year);
            });
        } else if (!locale.startsWith('pt')) {
            setHolidays([]); // Clear holidays if locale is not PT
        }
    }, [currentDate, fetchedHolidayYear, locale]);


    const appointmentsByDay = useMemo(() => {
        const map = new Map<string, Appointment[]>();
        appointments.forEach(app => {
            const dayKey = app.start.toDateString();
            if (!map.has(dayKey)) {
                map.set(dayKey, []);
            }
            map.get(dayKey)!.push(app);
        });
        return map;
    }, [appointments]);
    
    const holidaysByDay = useMemo(() => {
        const map = new Map<string, Holiday>();
        holidays.forEach(holiday => {
            const dayKey = holiday.date.toDateString();
            map.set(dayKey, holiday);
        });
        return map;
    }, [holidays]);


    const handleDayClick = (day: Date, e: React.MouseEvent<HTMLButtonElement>) => {
        const dayKey = day.toDateString();
        const holiday = holidaysByDay.get(dayKey);
        const dayAppointments = appointmentsByDay.get(dayKey);

        if (dayAppointments || holiday) {
            const rect = e.currentTarget.getBoundingClientRect();
            setSelectedDay(day);
            setPopoverPosition({ top: rect.top + window.scrollY, left: rect.right + window.scrollX + 10 });
        } else {
            setSelectedDay(null);
            setPopoverPosition(null);
        }
    };

    const renderHeader = () => {
        const currentYear = new Date().getFullYear();
        const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

        return (
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <ChevronLeftIcon />
                </button>
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg text-secondary dark:text-gray-100 capitalize">
                        {currentDate.toLocaleString(locale, { month: 'long' })}
                    </h3>
                    <select
                        value={currentDate.getFullYear()}
                        onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth(), 1))}
                        className="text-lg font-semibold bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-secondary dark:text-gray-100 rounded-md p-1 focus:ring-primary focus:border-primary"
                        aria-label={t('dashboard.calendar.selectYear')}
                    >
                        {yearOptions.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <ChevronRightIcon />
                </button>
            </div>
        );
    };
    
    const weekDayNames = useMemo(() => {
        const formatter = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
        // Create dates for a week starting on Sunday
        return Array.from({ length: 7 }, (_, i) => formatter.format(new Date(2024, 0, 7 + i)));
    }, [locale]);

    const renderDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();

        const cells = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            cells.push(<div key={`empty-start-${i}`} className="p-1"></div>);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const day = new Date(year, month, i);
            const dayKey = day.toDateString();
            const isToday = day.toDateString() === today.toDateString();
            const hasAppointments = appointmentsByDay.has(dayKey);
            const holiday = holidaysByDay.get(dayKey);

            let buttonClasses = `w-8 h-8 rounded-full flex items-center justify-center transition-colors text-sm `;
            if (isToday) {
                buttonClasses += 'bg-primary text-white font-bold';
            } else if (holiday) {
                buttonClasses += 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-semibold';
            } else {
                buttonClasses += 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700';
            }


            cells.push(
                <div key={day.toISOString()} className="text-center relative">
                    <button
                        onClick={(e) => handleDayClick(day, e)}
                        className={buttonClasses}
                        aria-label={t('dashboard.calendar.viewAppointmentsFor', { date: day.toLocaleDateString(locale) })}
                        title={holiday?.name || ''}
                    >
                        {i}
                    </button>
                    {hasAppointments && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>}
                </div>
            );
        }
        return <div className="grid grid-cols-7 gap-y-2">{cells}</div>;
    };
    
    const selectedAppointments = selectedDay ? appointmentsByDay.get(selectedDay.toDateString())?.sort((a, b) => a.start.getTime() - b.start.getTime()) : [];
    const selectedHoliday = selectedDay ? holidaysByDay.get(selectedDay.toDateString()) : null;


    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl h-full transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1">
            {renderHeader()}
            <div className="grid grid-cols-7 gap-y-2 text-center font-semibold text-medium dark:text-gray-400 text-xs mb-2">
                {weekDayNames.map((day, i) => <div key={`${day}-${i}`}>{day}</div>)}
            </div>
            {renderDays()}
            {selectedDay && popoverPosition && (selectedAppointments || selectedHoliday) && (
                 <>
                    <div className="fixed inset-0 z-10" onClick={() => setSelectedDay(null)}></div>
                    <div
                        className="absolute z-20 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-4 border dark:border-gray-700 animate-fade-in"
                        style={{ top: `${popoverPosition.top}px`, left: `${popoverPosition.left}px` }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h4 className="font-bold text-secondary dark:text-gray-100 mb-2">{selectedDay.toLocaleDateString(locale, { weekday: 'long', day: 'numeric' })}</h4>
                        {selectedHoliday && (
                            <div className="mb-2 p-2 rounded-md bg-amber-100 dark:bg-amber-900/40">
                                <p className="font-semibold text-sm text-amber-800 dark:text-amber-200">{selectedHoliday.name}</p>
                            </div>
                        )}
                        <ul className="space-y-2 max-h-48 overflow-y-auto">
                            {selectedAppointments && selectedAppointments.map(app => (
                                <li key={app.id} className="text-sm">
                                    <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{app.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <ClockIcon className="w-3 h-3"/>
                                        {app.start.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            )}
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ customers, suppliers, appointments, activityLog }) => {
    const { state, hasPermission } = useAppState();
    const { currentUser } = state;
    const { t, locale } = useLocalization();

    const companyData = useMemo(() => {
        if (!currentUser) return { visibleCustomers: [], visibleSuppliers: [], visibleAppointments: [], visibleActivityLog: [] };
        
        const isSuperAdmin = hasPermission('MANAGE_ALL_COMPANIES');

        const visibleCustomers = isSuperAdmin ? customers : customers.filter(c => c.companyId === currentUser.companyId);
        const visibleSuppliers = isSuperAdmin ? suppliers : suppliers.filter(s => s.companyId === currentUser.companyId);
        const visibleAppointments = isSuperAdmin ? appointments : appointments.filter(a => a.companyId === currentUser.companyId);
        const visibleActivityLog = isSuperAdmin ? activityLog : activityLog.filter(l => l.companyId === currentUser.companyId);
        
        return { visibleCustomers, visibleSuppliers, visibleAppointments, visibleActivityLog };
    }, [customers, suppliers, appointments, activityLog, currentUser, hasPermission]);


    const activeCustomers = companyData.visibleCustomers.filter(c => c.status === 'Active').length;
    
    const upcomingAppointments = companyData.visibleAppointments.filter(a => a.start > new Date()).sort((a,b) => a.start.getTime() - b.start.getTime()).slice(0, 5);
    
    const interactionData = useMemo(() => {
        const months = Array(6).fill(0).map((_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            return {
                date: d,
                name: d.toLocaleString(locale, { month: 'short' }),
                interactions: 0
            };
        }).reverse();

        companyData.visibleCustomers.forEach(customer => {
            (customer.interactions || []).forEach(interaction => {
                const interactionDate = new Date(interaction.date);
                const monthEntry = months.find(m => m.date.getMonth() === interactionDate.getMonth() && m.date.getFullYear() === interactionDate.getFullYear());
                if (monthEntry) {
                    monthEntry.interactions++;
                }
            });
        });
        return months.map(({ name, interactions }) => ({ name, interactions }));
    }, [companyData.visibleCustomers, locale]);

    const activityTypeConfig: Record<ActivityType, { icon: React.FC<any>; bgColor: string; textColor: string }> = {
        'Cliente': { icon: CustomerIcon, bgColor: 'bg-blue-100 dark:bg-blue-900/40', textColor: 'text-blue-600 dark:text-blue-300' },
        'Fornecedor': { icon: SupplierIcon, bgColor: 'bg-purple-100 dark:bg-purple-900/40', textColor: 'text-purple-600 dark:text-purple-300' },
        'Compromisso': { icon: AgendaIcon, bgColor: 'bg-green-100 dark:bg-green-900/40', textColor: 'text-green-600 dark:text-green-300' },
        'Usuário': { icon: UsersIcon, bgColor: 'bg-yellow-100 dark:bg-yellow-900/40', textColor: 'text-yellow-600 dark:text-yellow-400' },
        'Empresa': { icon: BriefcaseIcon, bgColor: 'bg-gray-200 dark:bg-gray-700', textColor: 'text-gray-600 dark:text-gray-300' },
    };

    const recentActivities = useMemo(() => {
        return [...companyData.visibleActivityLog]
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 5);
    }, [companyData.visibleActivityLog]);


    return (
        <div className="p-4 sm:p-8 space-y-8 dark:bg-secondary">
            <h1 className="text-3xl font-bold text-secondary dark:text-gray-100">{t('dashboard.title')}</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title={t('dashboard.cards.activeCustomers')} value={activeCustomers} icon={<CustomerIcon className="w-6 h-6"/>} />
                <StatCard title={t('dashboard.cards.totalSuppliers')} value={companyData.visibleSuppliers.length} icon={<SupplierIcon className="w-6 h-6"/>} />
                <StatCard title={t('dashboard.cards.upcomingAppointments')} value={companyData.visibleAppointments.filter(a => a.start > new Date()).length} icon={<AgendaIcon className="w-6 h-6"/>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Customer Interaction Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1">
                    <h2 className="text-lg font-semibold text-secondary dark:text-gray-100 mb-4">{t('dashboard.charts.customerInteractionsTitle')}</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={interactionData}>
                            <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-600" />
                            <XAxis dataKey="name" tick={{ fill: 'currentColor' }} className="dark:text-gray-400" />
                            <YAxis tick={{ fill: 'currentColor' }} className="dark:text-gray-400" allowDecimals={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} labelStyle={{ color: '#d1d5db' }}/>
                            <Legend wrapperStyle={{ color: '#d1d5db' }} />
                            <Line type="monotone" dataKey="interactions" stroke="#4f46e5" strokeWidth={2} name={t('dashboard.charts.interactions')} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                 {/* Upcoming Appointments */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1">
                    <h2 className="text-lg font-semibold text-secondary dark:text-gray-100 mb-4">{t('dashboard.upcomingAppointments.title')}</h2>
                    <ul className="space-y-4">
                        {upcomingAppointments.length > 0 ? (
                            upcomingAppointments.map(app => (
                                <li key={app.id} className="border-l-4 border-primary pl-4">
                                    <p className="font-semibold text-secondary dark:text-gray-200 text-sm">{app.title}</p>
                                    <p className="text-xs text-medium dark:text-gray-400">{app.start.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                </li>
                            ))
                        ) : (
                            <p className="text-sm text-medium dark:text-gray-400">{t('dashboard.upcomingAppointments.none')}</p>
                        )}
                    </ul>
                </div>
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2">
                    <CalendarWidget appointments={companyData.visibleAppointments} />
                 </div>
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl h-full transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1">
                    <h2 className="text-lg font-semibold text-secondary dark:text-gray-100 mb-4">{t('dashboard.recentActivity.title')}</h2>
                    {recentActivities.length > 0 ? (
                        <ul>
                            {recentActivities.map((log, index) => {
                                const config = activityTypeConfig[log.type];
                                const Icon = config.icon;
                                return (
                                    <li key={log.id} className="relative flex gap-4 pb-4 last:pb-0">
                                        {index < recentActivities.length - 1 && (
                                            <div className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true"></div>
                                        )}
                                        <div className={`relative flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full z-10 ${config.bgColor}`}>
                                            <Icon className={`w-5 h-5 ${config.textColor}`} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-800 dark:text-gray-200" dangerouslySetInnerHTML={{ __html: t(log.descriptionKey, log.descriptionParams) }} />
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {formatRelativeTime(log.date, locale)}
                                            </p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="text-sm text-medium dark:text-gray-400 mt-4">{t('dashboard.recentActivity.summary')}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;