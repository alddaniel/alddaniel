import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Appointment, Customer, Supplier, ActivityLog, ActivityType } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Breadcrumbs from './Breadcrumbs';
import { useAppState } from '../state/AppContext';
import { useLocalization } from '../contexts/LocalizationContext';


interface ReportsProps {
    appointments: Appointment[];
    customers: Customer[];
    suppliers: Supplier[];
    activityLog: ActivityLog[];
}

type ReportTab = 'appointments' | 'customers' | 'suppliers' | 'activity';

const ReportCard: React.FC<{ title: string; children: React.ReactNode; onExportPDF: () => void; onExportExcel: () => void }> = ({ title, children, onExportPDF, onExportExcel }) => {
    const { t } = useLocalization();
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mt-6">
            <div className="p-4 border-b dark:border-gray-700 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h2 className="text-xl font-bold text-secondary dark:text-gray-100">{title}</h2>
                <div className="flex gap-2 flex-wrap">
                    <button onClick={onExportPDF} className="text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg transition-colors">
                        {t('reports.exportPDF')}
                    </button>
                    <button onClick={onExportExcel} className="text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg transition-colors">
                        {t('reports.exportExcel')}
                    </button>
                </div>
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    );
};

const ActivityTypeBadge: React.FC<{ type: ActivityType }> = ({ type }) => {
    const typeClasses: Record<ActivityType, string> = {
        'Cliente': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
        'Fornecedor': 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
        'Compromisso': 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
        'Usuário': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
        'Empresa': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${typeClasses[type] || 'bg-gray-100 text-gray-800'}`}>
            {type}
        </span>
    );
};

// Helper function to render the Pie chart label.
// Defining it outside the component prevents re-creation on each render
// and helps avoid compatibility issues with libraries like Recharts and newer React versions.
const renderPieLabel = (props: any) => {
    // Defensive check
    if (props === null || typeof props !== 'object' || props.name === undefined || props.percent === undefined) {
        return null;
    }
    return `${props.name} ${((props.percent || 0) * 100).toFixed(0)}%`;
};

const Reports: React.FC<ReportsProps> = ({ appointments, customers, suppliers, activityLog }) => {
    const { state, hasPermission } = useAppState();
    const { t, locale } = useLocalization();
    const { currentUser, companies } = state;
    const currentCompany = useMemo(() => companies.find(c => c.id === currentUser?.companyId), [companies, currentUser]);

    const [activeTab, setActiveTab] = useState<ReportTab>('appointments');

    const companyData = useMemo(() => {
        if (!currentUser) return { visibleAppointments: [], visibleCustomers: [], visibleSuppliers: [], visibleActivityLog: [] };
        
        const isSuperAdmin = hasPermission('MANAGE_ALL_COMPANIES');

        const visibleAppointments = isSuperAdmin ? appointments : appointments.filter(a => a.companyId === currentUser.companyId);
        const visibleCustomers = isSuperAdmin ? customers : customers.filter(c => c.companyId === currentUser.companyId);
        const visibleSuppliers = isSuperAdmin ? suppliers : suppliers.filter(s => s.companyId === currentUser.companyId);
        const visibleActivityLog = isSuperAdmin ? activityLog : activityLog.filter(l => l.companyId === currentUser.companyId);
        
        return { visibleAppointments, visibleCustomers, visibleSuppliers, visibleActivityLog };
    }, [appointments, customers, suppliers, activityLog, currentUser, hasPermission]);


    // --- Appointments Report State and Logic ---
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const [startDate, setStartDate] = useState(firstDayOfMonth);
    const [endDate, setEndDate] = useState(lastDayOfMonth);

    const filteredAppointments = useMemo(() => {
        if (!startDate || !endDate) return companyData.visibleAppointments;
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return companyData.visibleAppointments.filter(app => app.start >= start && app.start <= end);
    }, [companyData.visibleAppointments, startDate, endDate]);

    const exportAppointmentsToPDF = () => {
        const doc = new jsPDF();
        const reportTitle = t('reports.appointments.title');
        let tableStartY = 20;

        if (currentCompany) {
            doc.setFontSize(12).setFont(undefined, 'bold');
            doc.text(currentCompany.name, 105, 10, { align: 'center' });
            doc.setFontSize(9).setFont(undefined, 'normal');
            doc.text(currentCompany.address, 105, 15, { align: 'center' });
            doc.setFontSize(16).setFont(undefined, 'bold');
            doc.text(reportTitle, 14, 25);
            tableStartY = 29;
        } else {
            doc.text(reportTitle, 14, 16);
        }

        autoTable(doc, {
            head: [[
                t('reports.appointments.table.title'),
                t('reports.appointments.table.dateTime'),
                t('reports.appointments.table.dueDate'),
                t('reports.appointments.table.location'),
                t('reports.appointments.table.participants')
            ]],
            body: filteredAppointments.map(app => [
                app.title,
                app.start.toLocaleString(locale),
                app.dueDate ? app.dueDate.toLocaleString(locale) : 'N/A',
                app.location,
                app.participants.map(p => p.name).join(', ')
            ]),
            startY: tableStartY,
        });
        doc.save(`${t('reports.appointments.fileName')}.pdf`);
    };

    const exportAppointmentsToExcel = () => {
        const reportTitle = t('reports.appointments.title');
        const jsonData = filteredAppointments.map(app => ({
            [t('reports.appointments.table.title')]: app.title,
            [t('reports.appointments.table.dateTime')]: app.start.toLocaleString(locale),
            [t('reports.appointments.table.dueDate')]: app.dueDate ? app.dueDate.toLocaleString(locale) : 'N/A',
            [t('reports.appointments.table.location')]: app.location,
            [t('reports.appointments.table.participants')]: app.participants.map(p => p.name).join(', ')
        }));

        const headerRows: string[][] = [];
        if (currentCompany) {
            headerRows.push([currentCompany.name]);
            headerRows.push([currentCompany.address]);
            headerRows.push([]);
        }
        headerRows.push([reportTitle]);

        const worksheet = XLSX.utils.aoa_to_sheet(headerRows);
        XLSX.utils.sheet_add_json(worksheet, jsonData, { origin: -1 });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, t('reports.tabs.appointments'));
        XLSX.writeFile(workbook, `${t('reports.appointments.fileName')}.xlsx`);
    };

    // --- Customers Report Logic ---
    const customerStatusData = useMemo(() => {
        const active = companyData.visibleCustomers.filter(c => c.status === 'Active').length;
        const inactive = companyData.visibleCustomers.length - active;
        return [
            { name: t('customers.statusActive'), value: active },
            { name: t('customers.statusInactive'), value: inactive },
        ];
    }, [companyData.visibleCustomers, t]);
    const COLORS = ['#4f46e5', '#f9a8d4'];

    const exportCustomersToPDF = () => {
        const doc = new jsPDF();
        const reportTitle = t('reports.customers.title');
        let tableStartY = 20;

        if (currentCompany) {
            doc.setFontSize(12).setFont(undefined, 'bold');
            doc.text(currentCompany.name, 105, 10, { align: 'center' });
            doc.setFontSize(9).setFont(undefined, 'normal');
            doc.text(currentCompany.address, 105, 15, { align: 'center' });
            doc.setFontSize(16).setFont(undefined, 'bold');
            doc.text(reportTitle, 14, 25);
            tableStartY = 29;
        } else {
            doc.text(reportTitle, 14, 16);
        }

        autoTable(doc, {
            head: [[
                t('reports.customers.table.name'), 
                t('reports.customers.table.status'), 
                t('reports.customers.table.email'), 
                t('reports.customers.table.phone')
            ]],
            body: companyData.visibleCustomers.map(c => [
                c.name,
                c.status === 'Active' ? t('customers.statusActive') : t('customers.statusInactive'),
                c.email,
                c.phone
            ]),
            startY: tableStartY,
        });
        doc.save(`${t('reports.customers.fileName')}.pdf`);
    };

    const exportCustomersToExcel = () => {
        const reportTitle = t('reports.customers.title');
        const jsonData = companyData.visibleCustomers.map(c => ({
            [t('reports.customers.table.name')]: c.name,
            [t('reports.customers.table.status')]: c.status === 'Active' ? t('customers.statusActive') : t('customers.statusInactive'),
            [t('reports.customers.table.email')]: c.email,
            [t('reports.customers.table.phone')]: c.phone,
            [t('reports.customers.table.type')]: c.type === 'Individual' ? t('customers.typePerson') : t('customers.typeCompany')
        }));

        const headerRows: string[][] = [];
        if (currentCompany) {
            headerRows.push([currentCompany.name]);
            headerRows.push([currentCompany.address]);
            headerRows.push([]);
        }
        headerRows.push([reportTitle]);

        const worksheet = XLSX.utils.aoa_to_sheet(headerRows);
        XLSX.utils.sheet_add_json(worksheet, jsonData, { origin: -1 });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, t('reports.tabs.customers'));
        XLSX.writeFile(workbook, `${t('reports.customers.fileName')}.xlsx`);
    };

    // --- Suppliers Report Logic ---
    const suppliersByCategory = useMemo(() => {
        return companyData.visibleSuppliers.reduce<Record<string, Supplier[]>>((acc, supplier) => {
            supplier.services.forEach(service => {
                if (!acc[service]) {
                    acc[service] = [];
                }
                acc[service].push(supplier);
            });
            return acc;
        }, {});
    }, [companyData.visibleSuppliers]);

    const exportSuppliersToPDF = () => {
        const doc = new jsPDF();
        const reportTitle = t('reports.suppliers.title');
        let tableStartY = 20;

        if (currentCompany) {
            doc.setFontSize(12).setFont(undefined, 'bold');
            doc.text(currentCompany.name, 105, 10, { align: 'center' });
            doc.setFontSize(9).setFont(undefined, 'normal');
            doc.text(currentCompany.address, 105, 15, { align: 'center' });
            doc.setFontSize(16).setFont(undefined, 'bold');
            doc.text(reportTitle, 14, 25);
            tableStartY = 29;
        } else {
            doc.text(reportTitle, 14, 16);
        }
        
        const body = Object.entries(suppliersByCategory).flatMap(([category, supplierList]: [string, Supplier[]]) => 
            supplierList.map(supplier => [
                category,
                supplier.name,
                supplier.contactPerson,
                supplier.email
            ])
        );
        autoTable(doc, {
            head: [[
                t('reports.suppliers.table.category'), 
                t('reports.suppliers.table.supplier'), 
                t('reports.suppliers.table.contact'), 
                t('reports.suppliers.table.email')
            ]],
            body: body,
            startY: tableStartY,
        });
        doc.save(`${t('reports.suppliers.fileName')}.pdf`);
    };

    const exportSuppliersToExcel = () => {
        const reportTitle = t('reports.suppliers.title');
        const flatData = Object.entries(suppliersByCategory).flatMap(([category, supplierList]: [string, Supplier[]]) => 
            supplierList.map(supplier => ({
                [t('reports.suppliers.table.category')]: category,
                [t('reports.suppliers.table.supplier')]: supplier.name,
                [t('reports.suppliers.table.contact')]: supplier.contactPerson,
                [t('reports.suppliers.table.email')]: supplier.email,
                [t('reports.suppliers.table.cnpj')]: supplier.cnpj
            }))
        );

        const headerRows: string[][] = [];
        if (currentCompany) {
            headerRows.push([currentCompany.name]);
            headerRows.push([currentCompany.address]);
            headerRows.push([]);
        }
        headerRows.push([reportTitle]);

        const worksheet = XLSX.utils.aoa_to_sheet(headerRows);
        XLSX.utils.sheet_add_json(worksheet, flatData, { origin: -1 });
        
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, t('reports.tabs.suppliers'));
        XLSX.writeFile(workbook, `${t('reports.suppliers.fileName')}.xlsx`);
    };

    // --- Activity Log Report ---
    const [activityStartDate, setActivityStartDate] = useState('');
    const [activityEndDate, setActivityEndDate] = useState('');
    const [activityType, setActivityType] = useState<ActivityType | 'all'>('all');
    
    const activityTypes: (ActivityType | 'all')[] = useMemo(() => ['all', ...Array.from(new Set(companyData.visibleActivityLog.map(log => log.type)))], [companyData.visibleActivityLog]);

    const filteredActivityLog = useMemo(() => {
        return companyData.visibleActivityLog.filter(log => {
            const logDate = new Date(log.date);
            if (activityStartDate) {
                const start = new Date(activityStartDate);
                start.setHours(0, 0, 0, 0);
                if (logDate < start) return false;
            }
            if (activityEndDate) {
                const end = new Date(activityEndDate);
                end.setHours(23, 59, 59, 999);
                if (logDate > end) return false;
            }
            if (activityType !== 'all' && log.type !== activityType) {
                return false;
            }
            return true;
        });
    }, [companyData.visibleActivityLog, activityStartDate, activityEndDate, activityType]);
    
    return (
        <div className="p-4 sm:p-8 dark:bg-secondary">
            <Breadcrumbs />
            <h1 className="text-3xl font-bold text-secondary dark:text-gray-100 mb-6">{t('reports.title')}</h1>

            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                    <button onClick={() => setActiveTab('appointments')} className={`flex-shrink-0 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'appointments' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                        {t('reports.tabs.appointments')}
                    </button>
                    <button onClick={() => setActiveTab('customers')} className={`flex-shrink-0 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'customers' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                        {t('reports.tabs.customers')}
                    </button>
                    <button onClick={() => setActiveTab('suppliers')} className={`flex-shrink-0 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'suppliers' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                        {t('reports.tabs.suppliers')}
                    </button>
                    <button onClick={() => setActiveTab('activity')} className={`flex-shrink-0 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'activity' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                        {t('reports.tabs.activity')}
                    </button>
                </nav>
            </div>

            {activeTab === 'appointments' && (
                <ReportCard title={t('reports.appointments.title')} onExportPDF={exportAppointmentsToPDF} onExportExcel={exportAppointmentsToExcel}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('reports.startDate')}</label>
                            <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 dark:[color-scheme:dark] focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('reports.endDate')}</label>
                            <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 dark:[color-scheme:dark] focus:ring-primary focus:border-primary" />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('reports.appointments.table.title')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('reports.appointments.table.dateTime')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('reports.appointments.table.participants')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredAppointments.map(app => (
                                    <tr key={app.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{app.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{app.start.toLocaleString(locale)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{app.participants.map(p => p.name).join(', ')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ReportCard>
            )}
             {activeTab === 'customers' && (
                <ReportCard title={t('reports.customers.title')} onExportPDF={exportCustomersToPDF} onExportExcel={exportCustomersToExcel}>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={customerStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label={renderPieLabel}>
                                        {customerStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="overflow-x-auto">
                           <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('reports.customers.table.name')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('reports.customers.table.status')}</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {companyData.visibleCustomers.map(c => (
                                        <tr key={c.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{c.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{c.status === 'Active' ? t('customers.statusActive') : t('customers.statusInactive')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                   </div>
                </ReportCard>
            )}
            {activeTab === 'suppliers' && (
                <ReportCard title={t('reports.suppliers.title')} onExportPDF={exportSuppliersToPDF} onExportExcel={exportSuppliersToExcel}>
                    <div className="space-y-4">
                        {Object.entries(suppliersByCategory).map(([category, supplierList]: [string, Supplier[]]) => (
                            <div key={category}>
                                <h3 className="text-lg font-semibold text-secondary dark:text-gray-200 mb-2">{category}</h3>
                                <div className="overflow-x-auto border dark:border-gray-700 rounded-md">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                         <thead className="bg-gray-50 dark:bg-gray-700">
                                             <tr>
                                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('reports.suppliers.table.supplier')}</th>
                                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('reports.suppliers.table.contact')}</th>
                                             </tr>
                                         </thead>
                                         <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {supplierList.map(s => (
                                                <tr key={s.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{s.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{s.contactPerson}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                </ReportCard>
            )}
             {activeTab === 'activity' && (
                <ReportCard title={t('reports.activity.title')} onExportPDF={() => {}} onExportExcel={() => {}}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                         <div>
                            <label htmlFor="activity-start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('reports.startDate')}</label>
                            <input type="date" id="activity-start-date" value={activityStartDate} onChange={e => setActivityStartDate(e.target.value)} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 dark:[color-scheme:dark] focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                            <label htmlFor="activity-end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('reports.endDate')}</label>
                            <input type="date" id="activity-end-date" value={activityEndDate} onChange={e => setActivityEndDate(e.target.value)} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 dark:[color-scheme:dark] focus:ring-primary focus:border-primary" />
                        </div>
                         <div>
                            <label htmlFor="activity-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('reports.activity.type')}</label>
                            <select id="activity-type" value={activityType} onChange={e => setActivityType(e.target.value as ActivityType | 'all')} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary">
                                {activityTypes.map(type => (
                                    <option key={type} value={type}>{type === 'all' ? t('reports.activity.allTypes') : type}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                             <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('reports.activity.table.date')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('reports.activity.table.type')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('reports.activity.table.description')}</th>
                                </tr>
                            </thead>
                             <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredActivityLog.map(log => (
                                    <tr key={log.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.date.toLocaleString(locale)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap"><ActivityTypeBadge type={log.type} /></td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100" dangerouslySetInnerHTML={{ __html: t(log.descriptionKey, log.descriptionParams) }} />
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ReportCard>
            )}
        </div>
    );
};

export default Reports;