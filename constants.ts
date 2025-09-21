

import { User, UserRole, Customer, Supplier, Appointment, Company, ActivityLog, AppointmentStatus, Permission } from './types';
import { DashboardIcon, CustomerIcon, SupplierIcon, AgendaIcon, ReportsIcon, SettingsIcon, HelpIcon, UsersIcon, BriefcaseIcon, TagIcon, HeartIcon } from './components/Icons';

export const navItems: { nameKey: string; path: string; icon: React.FC<any>; permission?: Permission }[] = [
    { nameKey: 'sidebar.dashboard', path: '/', icon: DashboardIcon, permission: 'VIEW_DASHBOARD' },
    { nameKey: 'sidebar.customers', path: '/customers', icon: CustomerIcon, permission: 'VIEW_CUSTOMERS' },
    { nameKey: 'sidebar.suppliers', path: '/suppliers', icon: SupplierIcon, permission: 'VIEW_SUPPLIERS' },
    { nameKey: 'sidebar.agenda', path: '/agenda', icon: AgendaIcon, permission: 'VIEW_AGENDA' },
    { nameKey: 'sidebar.reports', path: '/reports', icon: ReportsIcon, permission: 'VIEW_REPORTS' },
    { nameKey: 'sidebar.settings', path: '/settings', icon: SettingsIcon, permission: 'VIEW_SETTINGS' },
    { nameKey: 'sidebar.help', path: '/help', icon: HelpIcon },
];

export const APPOINTMENT_CATEGORIES = {
    CLIENT_MEETING: 'CLIENT_MEETING',
    INTERNAL_TEAM: 'INTERNAL_TEAM',
    SUPPLIER: 'SUPPLIER',
    SALES: 'SALES',
    PERSONAL: 'PERSONAL',
    OTHER: 'OTHER',
};


export const APPOINTMENT_CATEGORY_CONFIG: { [key: string]: { icon: string; color: string; } } = {
    [APPOINTMENT_CATEGORIES.CLIENT_MEETING]: { icon: 'CustomerIcon', color: 'blue' },
    [APPOINTMENT_CATEGORIES.INTERNAL_TEAM]: { icon: 'UsersIcon', color: 'green' },
    [APPOINTMENT_CATEGORIES.SUPPLIER]: { icon: 'SupplierIcon', color: 'purple' },
    [APPOINTMENT_CATEGORIES.SALES]: { icon: 'BriefcaseIcon', color: 'yellow' },
    [APPOINTMENT_CATEGORIES.PERSONAL]: { icon: 'HeartIcon', color: 'pink' },
    [APPOINTMENT_CATEGORIES.OTHER]: { icon: 'TagIcon', color: 'gray' },
};

// --- Local Realistic Avatars ---
export const REALISTIC_AVATARS: string[] = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1780&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=1886&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1888&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1521119989659-a83eee488004?q=80&w=1923&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
];


// --- PERMISSION SETS ---
export const COLLABORATOR_PERMISSIONS: Permission[] = [
    'VIEW_DASHBOARD',
    'VIEW_CUSTOMERS',
    'VIEW_SUPPLIERS',
    'VIEW_AGENDA',
];

export const MANAGER_PERMISSIONS: Permission[] = [
    ...COLLABORATOR_PERMISSIONS,
    'MANAGE_CUSTOMERS',
    'MANAGE_SUPPLIERS',
    'MANAGE_AGENDA',
];

export const ADMIN_PERMISSIONS: Permission[] = [
    ...MANAGER_PERMISSIONS,
    'DELETE_CUSTOMERS',
    'DELETE_SUPPLIERS',
    'VIEW_REPORTS',
    'VIEW_SETTINGS',
    'MANAGE_USERS',
    'MANAGE_CATEGORIES',
];

export const ALL_PERMISSIONS: Permission[] = [
    ...ADMIN_PERMISSIONS,
    'MANAGE_COMPANY_INFO',
    'MANAGE_ALL_COMPANIES',
    'MANAGE_ALL_USERS',
    'MANAGE_PERMISSIONS'
];

export const USER_MANAGEABLE_PERMISSIONS: Permission[] = ALL_PERMISSIONS.filter(p => !['MANAGE_PERMISSIONS', 'MANAGE_ALL_COMPANIES'].includes(p));

// MOCK DATA
export const MOCK_COMPANIES: Company[] = [
  { id: 'company-1', name: 'Business Hub Pro Inc.', cnpj: '11.111.111/0001-11', address: '123 Main St, Anytown, USA', phone: '(11) 99999-1234', email: 'contact@businesshub.com', logoUrl: '' },
  { id: 'company-2', name: 'InovaTech Solutions', cnpj: '22.222.222/0001-22', address: '456 Oak Ave, Tech City, USA', phone: '(21) 88888-5678', email: 'support@inovatech.com', logoUrl: '' },
];

export const MOCK_USERS: User[] = [
    { id: 'user-1', name: 'Davi Darruspe', email: 'ddarruspe@gmail.com', role: UserRole.ADMIN, avatarUrl: REALISTIC_AVATARS[0], companyId: 'company-1', gender: 'male', permissions: ALL_PERMISSIONS },
    { id: 'user-2', name: 'Alice Wonder', email: 'alice@businesshub.com', role: UserRole.ADMIN, avatarUrl: REALISTIC_AVATARS[1], companyId: 'company-1', gender: 'female', permissions: ADMIN_PERMISSIONS },
    { id: 'user-3', name: 'Bob Builder', email: 'bob@businesshub.com', role: UserRole.MANAGER, avatarUrl: REALISTIC_AVATARS[2], companyId: 'company-1', gender: 'male', permissions: MANAGER_PERMISSIONS },
    { id: 'user-4', name: 'Carlos Finanças', email: 'carlos@inovatech.com', role: UserRole.ADMIN, avatarUrl: REALISTIC_AVATARS[3], companyId: 'company-2', gender: 'male', permissions: ADMIN_PERMISSIONS },
    { id: 'user-5', name: 'Diana Prince', email: 'diana@inovatech.com', role: UserRole.COLLABORATOR, avatarUrl: REALISTIC_AVATARS[4], companyId: 'company-2', gender: 'female', permissions: COLLABORATOR_PERMISSIONS },
    { id: 'user-6', name: 'Jane Smith', email: 'jane.smith@businesshub.com', role: UserRole.COLLABORATOR, companyId: 'company-1', avatarUrl: REALISTIC_AVATARS[5], gender: 'female', permissions: COLLABORATOR_PERMISSIONS },
    { id: 'user-7', name: 'Robert Johnson', email: 'robert.j@inovatech.com', role: UserRole.COLLABORATOR, companyId: 'company-2', avatarUrl: REALISTIC_AVATARS[6], gender: 'male', permissions: COLLABORATOR_PERMISSIONS },
];

export const MOCK_CUSTOMERS: Customer[] = [
    { id: 'cust-1', name: 'Global Imports', type: 'Company', identifier: '33.333.333/0001-33', phone: '(11) 5555-1111', email: 'contact@globalimports.com', cep: '01001-000', address: 'Praça da Sé, Sé - São Paulo/SP', status: 'Active', createdAt: new Date('2023-01-15'), interactions: [], documents: [], companyId: 'company-1' },
    { id: 'cust-2', name: 'Fernanda Lima', type: 'Individual', identifier: '123.456.789-00', phone: '(21) 98765-4321', email: 'fernanda.lima@email.com', cep: '22071-060', address: 'Rua Francisco Otaviano, Copacabana - Rio de Janeiro/RJ', status: 'Active', createdAt: new Date('2023-03-20'), interactions: [], documents: [], companyId: 'company-1', avatarUrl: REALISTIC_AVATARS[7], gender: 'female' },
    { id: 'cust-3', name: 'Tech Dynamics', type: 'Company', identifier: '44.444.444/0001-44', phone: '(11) 5555-2222', email: 'sales@techdynamics.com', cep: '04538-132', address: 'Avenida Brigadeiro Faria Lima, Itaim Bibi - São Paulo/SP', status: 'Inactive', createdAt: new Date('2022-11-10'), interactions: [], documents: [], companyId: 'company-2' },
];

export const MOCK_SUPPLIERS: Supplier[] = [
    { id: 'sup-1', name: 'Office Supplies Co.', cnpj: '55.555.555/0001-55', contactPerson: 'Sr. Silva', phone: '(11) 2222-3333', email: 'vendas@officesupplies.com', services: ['Material de Escritório'], companyId: 'company-1', cep: '01311-000', address: 'Avenida Paulista, 1578, Bela Vista - São Paulo/SP' },
    { id: 'sup-2', name: 'Cloud Server Hosting', cnpj: '66.666.666/0001-66', contactPerson: 'Maria Souza', phone: '(21) 4444-5555', email: 'suporte@cloudhosting.com', services: ['Hospedagem', 'Servidores'], companyId: 'company-1', contactAvatarUrl: REALISTIC_AVATARS[8], cep: '22290-901', address: 'Avenida Pasteur, 350, Urca - Rio de Janeiro/RJ' },
    { id: 'sup-3', name: 'Marketing Digital Experts', cnpj: '77.777.777/0001-77', contactPerson: 'João Pereira', phone: '(11) 6666-7777', email: 'contato@marketingexperts.com', services: ['Marketing', 'SEO'], companyId: 'company-2', contactAvatarUrl: REALISTIC_AVATARS[9], cep: '05425-902', address: 'Avenida das Nações Unidas, 3003, Pinheiros - São Paulo/SP' },
];

const today = new Date();
const tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1);
const nextWeek = new Date(); nextWeek.setDate(today.getDate() + 7);
const yesterday = new Date(); yesterday.setDate(today.getDate() -1);
yesterday.setHours(14,0,0);
const yesterdayEnd = new Date(yesterday); yesterdayEnd.setHours(15,0,0);

export const MOCK_APPOINTMENTS: Appointment[] = [
    {
        id: 'app-1', title: 'Reunião de Alinhamento Semanal', description: 'Discutir progresso dos projetos.', start: new Date(new Date().setHours(10, 0, 0)), end: new Date(new Date().setHours(11, 0, 0)),
        location: 'Sala de Reuniões 1', participants: [MOCK_USERS[0], MOCK_USERS[1]], status: AppointmentStatus.SCHEDULED, category: APPOINTMENT_CATEGORIES.INTERNAL_TEAM, companyId: 'company-1', attachments: []
    },
    {
        id: 'app-2', title: 'Apresentação para Global Imports', description: 'Demonstração do novo produto.', start: new Date(new Date().setHours(14, 0, 0)), end: new Date(new Date().setHours(15, 30, 0)),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
        location: 'Online - Google Meet', participants: [MOCK_USERS[1], MOCK_CUSTOMERS[0]], status: AppointmentStatus.SCHEDULED, category: APPOINTMENT_CATEGORIES.SALES, customerId: 'cust-1', companyId: 'company-1', attachments: []
    },
     {
        id: 'app-3', title: 'Reunião com Fornecedor de Nuvem', description: 'Negociar renovação de contrato.', start: new Date(tomorrow.setHours(11, 0, 0)), end: new Date(tomorrow.setHours(12, 0, 0)),
        location: 'Escritório do Fornecedor', participants: [MOCK_USERS[3], MOCK_SUPPLIERS[1]], status: AppointmentStatus.SCHEDULED, category: APPOINTMENT_CATEGORIES.SUPPLIER, supplierId: 'sup-2', companyId: 'company-2', attachments: []
    },
    {
        id: 'app-4', title: 'Consulta Médica', description: 'Check-up anual.', start: new Date(nextWeek.setHours(9, 0, 0)), end: new Date(nextWeek.setHours(10, 0, 0)),
        location: 'Clínica Central', participants: [MOCK_USERS[0]], status: AppointmentStatus.SCHEDULED, category: APPOINTMENT_CATEGORIES.PERSONAL, companyId: 'company-1', attachments: []
    },
    {
        id: 'app-5', title: 'Revisão Trimestral de Contrato', description: 'Revisar contrato com Marketing Digital Experts.', start: yesterday, end: yesterdayEnd,
        location: 'Online', participants: [MOCK_USERS[3], MOCK_SUPPLIERS[2]], status: AppointmentStatus.COMPLETED, category: APPOINTMENT_CATEGORIES.SUPPLIER, supplierId: 'sup-3', companyId: 'company-2', attachments: []
    }
];

export const MOCK_ACTIVITY_LOG: ActivityLog[] = [
    { id: 'log-1', date: new Date(Date.now() - 86400000), type: 'Cliente', descriptionKey: 'activityLog.NEW_CUSTOMER', descriptionParams: { name: 'Global Imports' }, companyId: 'company-1' },
    { id: 'log-2', date: new Date(Date.now() - 172800000), type: 'Compromisso', descriptionKey: 'activityLog.NEW_APPOINTMENT', descriptionParams: { title: 'Apresentação para Global Imports' }, companyId: 'company-1' },
    { id: 'log-3', date: new Date(Date.now() - 259200000), type: 'Usuário', descriptionKey: 'activityLog.NEW_USER', descriptionParams: { name: 'Bob Builder' }, companyId: 'company-1' },
    { id: 'log-4', date: new Date(Date.now() - 345600000), type: 'Fornecedor', descriptionKey: 'activityLog.UPDATE_SUPPLIER', descriptionParams: { name: 'Marketing Digital Experts' }, companyId: 'company-2' },
];