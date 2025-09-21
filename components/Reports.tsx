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

const ReportCard: React.FC<{ title: string; children: React.ReactNode; onExportPDF: () => void; onExportExcel: () => void }> = ({ title, children, onExportPDF, onExportExcel }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mt-6">
        <div className="p-4 border-b dark:border-gray-700 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <h2 className="text-xl font-bold text-secondary dark:text-gray-100">{title}</h2>
            <div className="flex gap-2 flex-wrap">
                <button onClick={onExportPDF} className="text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg transition-colors">
                    Exportar PDF
                </button>
                <button onClick={onExportExcel} className="text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg transition-colors">
                    Exportar Excel
                </button>
            </div>
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

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
    const { state } = useAppState();
    const { t } = useLocalization();
    const { currentUser, companies } = state;
    const currentCompany = useMemo(() => companies.find(c => c.id === currentUser?.companyId), [companies, currentUser]);

    const [activeTab, setActiveTab] = useState<ReportTab>('appointments');

    // --- Appointments Report State and Logic ---
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const [startDate, setStartDate] = useState(firstDayOfMonth);
    const [endDate, setEndDate] = useState(lastDayOfMonth);

    const filteredAppointments = useMemo(() => {
        if (!startDate || !endDate) return appointments;
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return appointments.filter(app => app.start >= start && app.start <= end);
    }, [appointments, startDate, endDate]);

    const exportAppointmentsToPDF = () => {
        const doc = new jsPDF();
        const reportTitle = "Relatório de Compromissos";
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
            head: [['Título', 'Data e Hora', 'Vencimento', 'Local', 'Participantes']],
            body: filteredAppointments.map(app => [
                app.title,
                app.start.toLocaleString('pt-BR'),
                app.dueDate ? app.dueDate.toLocaleString('pt-BR') : 'N/A',
                app.location,
                app.participants.map(p => p.name).join(', ')
            ]),
            startY: tableStartY,
        });
        doc.save('relatorio_compromissos.pdf');
    };

    const exportAppointmentsToExcel = () => {
        const reportTitle = "Relatório de Compromissos";
        const jsonData = filteredAppointments.map(app => ({
            'Título': app.title,
            'Data e Hora': app.start.toLocaleString('pt-BR'),
            'Vencimento': app.dueDate ? app.dueDate.toLocaleString('pt-BR') : 'N/A',
            'Local': app.location,
            'Participantes': app.participants.map(p => p.name).join(', ')
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
        XLSX.utils.book_append_sheet(workbook, worksheet, "Compromissos");
        XLSX.writeFile(workbook, 'relatorio_compromissos.xlsx');
    };

    // --- Customers Report Logic ---
    const customerStatusData = useMemo(() => {
        const active = customers.filter(c => c.status === 'Active').length;
        const inactive = customers.length - active;
        return [
            { name: 'Ativos', value: active },
            { name: 'Inativos', value: inactive },
        ];
    }, [customers]);
    const COLORS = ['#4f46e5', '#f9a8d4'];

    const exportCustomersToPDF = () => {
        const doc = new jsPDF();
        const reportTitle = "Relatório de Clientes";
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
            head: [['Nome', 'Status', 'Email', 'Telefone']],
            body: customers.map(c => [
                c.name,
                c.status === 'Active' ? 'Ativo' : 'Inativo',
                c.email,
                c.phone
            ]),
            startY: tableStartY,
        });
        doc.save('relatorio_clientes.pdf');
    };

    const exportCustomersToExcel = () => {
        const reportTitle = "Relatório de Clientes";
        const jsonData = customers.map(c => ({
            'Nome': c.name,
            'Status': c.status === 'Active' ? 'Ativo' : 'Inativo',
            'Email': c.email,
            'Telefone': c.phone,
            'Tipo': c.type === 'Individual' ? 'Pessoa Física' : 'Empresa'
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
        XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");
        XLSX.writeFile(workbook, 'relatorio_clientes.xlsx');
    };

    // --- Suppliers Report Logic ---
    const suppliersByCategory = useMemo(() => {
        return suppliers.reduce<Record<string, Supplier[]>>((acc, supplier) => {
            supplier.services.forEach(service => {
                if (!acc[service]) {
                    acc[service] = [];
                }
                acc[service].push(supplier);
            });
            return acc;
        }, {});
    }, [suppliers]);

    const exportSuppliersToPDF = () => {
        const doc = new jsPDF();
        const reportTitle = "Relatório de Fornecedores por Categoria";
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

        const body = Object.entries(suppliersByCategory).flatMap(([category, supplierList]) => 
            supplierList.map(supplier => [
                category,
                supplier.name,
                supplier.contactPerson,
                supplier.email
            ])
        );
        autoTable(doc, {
            head: [['Categoria', 'Fornecedor', 'Contato', 'Email']],
            body: body,
            startY: tableStartY,
        });
        doc.save('relatorio_fornecedores.pdf');
    };

    const exportSuppliersToExcel = () => {
        const reportTitle = "Relatório de Fornecedores";
        const flatData = Object.entries(suppliersByCategory).flatMap(([category, supplierList]) => 
            supplierList.map(supplier => ({
                'Categoria': category,
                'Fornecedor': supplier.name,
                'Contato': supplier.contactPerson,
                'Email': supplier.email,
                'CNPJ': supplier.cnpj
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
        XLSX.utils.book_append_sheet(workbook, worksheet, "Fornecedores");
        XLSX.writeFile(workbook, 'relatorio_fornecedores.xlsx');
    };

    // --- Activity Log Report ---
    const [activityStartDate, setActivityStartDate] = useState('');
    const [activityEndDate, setActivityEndDate] = useState('');
    const [activityType, setActivityType] = useState('all');
    
    const activityTypes = useMemo(() => ['all', ...Array.from(new Set(activityLog.map(log => log.type)))], [activityLog]);

    const filteredActivityLog = useMemo(() => {
        return activityLog.filter(log => {
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
    }, [activityLog, activityStartDate, activityEndDate, activityType]);

    const exportActivityToPDF = () => {
        const doc = new jsPDF();
        const reportTitle = "Histórico de Atividades";
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
            head: [['Data', 'Tipo', 'Descrição']],
            body: filteredActivityLog.map(log => [
                log.date.toLocaleString('pt-BR'),
                log.type,
                t(log.descriptionKey, log.descriptionParams)
            ]),
            startY: tableStartY,
        });
        doc.save('historico_atividades.pdf');
    };

    const exportActivityToExcel = () => {
        const reportTitle = "Histórico de Atividades";
        const jsonData = filteredActivityLog.map(log => ({
            'Data': log.date.toLocaleString('pt-BR'),
            'Tipo': log.type,
            'Descrição': t(log.descriptionKey, log.descriptionParams),
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
        XLSX.utils.book_append_sheet(workbook, worksheet, "Atividades");
        XLSX.writeFile(workbook, 'historico_atividades.xlsx');
    };

    
    return (
        <div className="p-4 sm:p-8 dark:bg-secondary">
            <Breadcrumbs />
            <h1 className="text-3xl font-bold text-secondary dark:text-gray-100 mb-6">Relatórios e Exportações</h1>
            
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                    <button onClick={() => setActiveTab('appointments')} className={`flex-shrink-0 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'appointments' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                        Compromissos
                    </button>
                    <button onClick={() => setActiveTab('customers')} className={`flex-shrink-0 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'customers' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                        Clientes
                    </button>
                     <button onClick={() => setActiveTab('suppliers')} className={`flex-shrink-0 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'suppliers' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                        Fornecedores
                    </button>
                    <button onClick={() => setActiveTab('activity')} className={`flex-shrink-0 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'activity' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                        Histórico de Atividades
                    </button>
                </nav>
            </div>

            {/* Appointments Report */}
            {activeTab === 'appointments' && (
                <ReportCard title="Relatório de Compromissos" onExportPDF={exportAppointmentsToPDF} onExportExcel={exportAppointmentsToExcel}>
                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Início</label>
                            <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-900 dark:text-gray-200 dark:[color-scheme:dark] focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Fim</label>
                            <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-900 dark:text-gray-200 dark:[color-scheme:dark] focus:ring-primary focus:border-primary" />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                         <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Título</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Data e Hora</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Vencimento</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Local</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Participantes</th>
                                </tr>
                            </thead>
                             <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredAppointments.map(app => (
                                    <tr key={app.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{app.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{app.start.toLocaleString('pt-BR')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{app.dueDate ? app.dueDate.toLocaleString('pt-BR') : 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{app.location}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{app.participants.map(p => p.name).join(', ')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ReportCard>
            )}

             {/* Customers Report */}
            {activeTab === 'customers' && (
                <ReportCard title="Relatório de Clientes" onExportPDF={exportCustomersToPDF} onExportExcel={exportCustomersToExcel}>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="md:col-span-1">
                           <h3 className="text-lg font-semibold text-secondary dark:text-gray-100 mb-4">Status dos Clientes</h3>
                           <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={customerStatusData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label={renderPieLabel}>
                                        {customerStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} labelStyle={{ color: '#d1d5db' }}/>
                                    <Legend wrapperStyle={{ color: '#d1d5db' }} />
                                </PieChart>
                           </ResponsiveContainer>
                       </div>
                        <div className="md:col-span-2 overflow-x-auto">
                             <h3 className="text-lg font-semibold text-secondary dark:text-gray-100 mb-4">Lista de Clientes</h3>
                            <div className="overflow-x-auto max-h-96">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nome</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {customers.map(customer => (
                                            <tr key={customer.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{customer.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${customer.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'}`}>
                                                        {customer.status === 'Active' ? 'Ativo' : 'Inativo'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                   </div>
                </ReportCard>
            )}

            {/* Suppliers Report */}
            {activeTab === 'suppliers' && (
                <ReportCard title="Relatório de Fornecedores por Categoria" onExportPDF={exportSuppliersToPDF} onExportExcel={exportSuppliersToExcel}>
                    <div className="space-y-6">
                        {Object.entries(suppliersByCategory).map(([category, supplierList]) => (
                            <div key={category}>
                                <h3 className="text-lg font-semibold text-secondary dark:text-gray-100 border-b dark:border-gray-600 pb-2 mb-3">{category}</h3>
                                <ul className="space-y-2 list-disc list-inside">
                                    {supplierList.map(supplier => (
                                        <li key={supplier.id} className="text-sm text-gray-700 dark:text-gray-300">{supplier.name} ({supplier.contactPerson})</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </ReportCard>
            )}

             {/* Activity Log Report */}
            {activeTab === 'activity' && (
                <ReportCard title="Histórico de Atividades" onExportPDF={exportActivityToPDF} onExportExcel={exportActivityToExcel}>
                    <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4 mb-6">
                        <div>
                            <label htmlFor="activityStartDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Início</label>
                            <input type="date" id="activityStartDate" value={activityStartDate} onChange={e => setActivityStartDate(e.target.value)} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-900 dark:text-gray-200 dark:[color-scheme:dark] focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                            <label htmlFor="activityEndDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Fim</label>
                            <input type="date" id="activityEndDate" value={activityEndDate} onChange={e => setActivityEndDate(e.target.value)} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-900 dark:text-gray-200 dark:[color-scheme:dark] focus:ring-primary focus:border-primary" />
                        </div>
                         <div>
                            <label htmlFor="activityType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Atividade</label>
                            <select id="activityType" value={activityType} onChange={e => setActivityType(e.target.value)} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-900 dark:text-gray-200 focus:ring-primary focus:border-primary">
                                {activityTypes.map(type => (
                                    <option key={type} value={type}>{type === 'all' ? 'Todos os Tipos' : type}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Data</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tipo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Descrição</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredActivityLog.map(log => (
                                    <tr key={log.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.date.toLocaleString('pt-BR')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"><ActivityTypeBadge type={log.type} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{t(log.descriptionKey, log.descriptionParams)}</td>
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