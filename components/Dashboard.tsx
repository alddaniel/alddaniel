
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Customer, Appointment } from '../types';
import { CustomerIcon, SupplierIcon, AgendaIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon } from './Icons';

interface DashboardProps {
    customers: Customer[];
    suppliersCount: number;
    appointments: Appointment[];
}

const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center">
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
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);
    const [popoverPosition, setPopoverPosition] = useState<{ top: number, left: number } | null>(null);

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

    const handleDayClick = (day: Date, e: React.MouseEvent<HTMLButtonElement>) => {
        const dayKey = day.toDateString();
        if (appointmentsByDay.has(dayKey)) {
            const rect = e.currentTarget.getBoundingClientRect();
            setSelectedDay(day);
            setPopoverPosition({ top: rect.top + window.scrollY, left: rect.right + window.scrollX + 10 });
        } else {
            setSelectedDay(null);
            setPopoverPosition(null);
        }
    };

    const renderHeader = () => (
        <div className="flex justify-between items-center mb-4">
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <ChevronLeftIcon />
            </button>
            <h3 className="font-semibold text-lg text-secondary dark:text-gray-100">
                {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
            </h3>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <ChevronRightIcon />
            </button>
        </div>
    );

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

            cells.push(
                <div key={day.toISOString()} className="text-center relative">
                    <button
                        onClick={(e) => handleDayClick(day, e)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors text-sm ${
                            isToday ? 'bg-primary text-white font-bold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                        aria-label={`Ver compromissos para ${day.toLocaleDateString('pt-BR')}`}
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

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-full">
            {renderHeader()}
            <div className="grid grid-cols-7 gap-y-2 text-center font-semibold text-medium dark:text-gray-400 text-xs mb-2">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => <div key={`${day}-${i}`}>{day}</div>)}
            </div>
            {renderDays()}
            {selectedDay && popoverPosition && selectedAppointments && selectedAppointments.length > 0 && (
                 <>
                    <div className="fixed inset-0 z-10" onClick={() => setSelectedDay(null)}></div>
                    <div
                        className="absolute z-20 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-4 border dark:border-gray-700 animate-fade-in"
                        style={{ top: `${popoverPosition.top}px`, left: `${popoverPosition.left}px` }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h4 className="font-bold text-secondary dark:text-gray-100 mb-2">{selectedDay.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric' })}</h4>
                        <ul className="space-y-2 max-h-48 overflow-y-auto">
                            {selectedAppointments.map(app => (
                                <li key={app.id} className="text-sm">
                                    <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{app.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <ClockIcon className="w-3 h-3"/>
                                        {app.start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
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


const Dashboard: React.FC<DashboardProps> = ({ customers, suppliersCount, appointments }) => {
    const activeCustomers = customers.filter(c => c.status === 'Active').length;
    
    const upcomingAppointments = appointments.filter(a => a.start > new Date()).sort((a,b) => a.start.getTime() - b.start.getTime()).slice(0, 5);
    
    const interactionData = useMemo(() => {
        const months = Array(6).fill(0).map((_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            return {
                date: d,
                name: d.toLocaleString('pt-BR', { month: 'short' }),
                interactions: 0
            };
        }).reverse();

        customers.forEach(customer => {
            (customer.interactions || []).forEach(interaction => {
                const interactionDate = new Date(interaction.date);
                const monthEntry = months.find(m => m.date.getMonth() === interactionDate.getMonth() && m.date.getFullYear() === interactionDate.getFullYear());
                if (monthEntry) {
                    monthEntry.interactions++;
                }
            });
        });
        return months.map(({ name, interactions }) => ({ name, interactions }));
    }, [customers]);


    return (
        <div className="p-4 sm:p-8 space-y-8 dark:bg-secondary">
            <h1 className="text-3xl font-bold text-secondary dark:text-gray-100">Painel</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Clientes Ativos" value={activeCustomers} icon={<CustomerIcon className="w-6 h-6"/>} />
                <StatCard title="Total de Fornecedores" value={suppliersCount} icon={<SupplierIcon className="w-6 h-6"/>} />
                <StatCard title="Próximos Compromissos" value={appointments.filter(a => a.start > new Date()).length} icon={<AgendaIcon className="w-6 h-6"/>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Customer Interaction Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-secondary dark:text-gray-100 mb-4">Interações com Clientes (Últimos 6 meses)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={interactionData}>
                            <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-600" />
                            <XAxis dataKey="name" tick={{ fill: 'currentColor' }} className="dark:text-gray-400" />
                            <YAxis tick={{ fill: 'currentColor' }} className="dark:text-gray-400" allowDecimals={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} labelStyle={{ color: '#d1d5db' }}/>
                            <Legend wrapperStyle={{ color: '#d1d5db' }} />
                            <Line type="monotone" dataKey="interactions" stroke="#4f46e5" strokeWidth={2} name="Interações" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                 {/* Upcoming Appointments */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-secondary dark:text-gray-100 mb-4">Próximos 5 Compromissos</h2>
                    <ul className="space-y-4">
                        {upcomingAppointments.length > 0 ? (
                            upcomingAppointments.map(app => (
                                <li key={app.id} className="border-l-4 border-primary pl-4">
                                    <p className="font-semibold text-secondary dark:text-gray-200 text-sm">{app.title}</p>
                                    <p className="text-xs text-medium dark:text-gray-400">{app.start.toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                </li>
                            ))
                        ) : (
                            <p className="text-sm text-medium dark:text-gray-400">Nenhum compromisso futuro.</p>
                        )}
                    </ul>
                </div>
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2">
                    <CalendarWidget appointments={appointments} />
                 </div>
                 {/* Placeholder for a potential new widget */}
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-secondary dark:text-gray-100 mb-4">Atividade Recente</h2>
                     <p className="text-sm text-medium dark:text-gray-400">Um resumo da atividade recente será exibido aqui.</p>
                 </div>
            </div>
        </div>
    );
};

export default Dashboard;
