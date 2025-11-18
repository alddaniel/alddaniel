import React from 'react';
import { User, UserRole, Customer, Supplier, Appointment, Company, ActivityLog, AppointmentStatus, Permission, Plan, Service, Resource } from './types';
import { DashboardIcon, CustomerIcon, SupplierIcon, AgendaIcon, ReportsIcon, SettingsIcon, HelpIcon, UsersIcon, BriefcaseIcon, TagIcon, HeartIcon, WhatsAppIcon } from './components/Icons';

export const navItems: { nameKey: string; path: string; icon: React.FC<any>; permission?: Permission }[] = [
    { nameKey: 'sidebar.dashboard', path: '/', icon: DashboardIcon, permission: 'VIEW_DASHBOARD' },
    { nameKey: 'sidebar.customers', path: '/customers', icon: CustomerIcon, permission: 'VIEW_CUSTOMERS' },
    { nameKey: 'sidebar.suppliers', path: '/suppliers', icon: SupplierIcon, permission: 'VIEW_SUPPLIERS' },
    { nameKey: 'sidebar.agenda', path: '/agenda', icon: AgendaIcon, permission: 'VIEW_AGENDA' },
    { nameKey: 'sidebar.reports', path: '/reports', icon: ReportsIcon, permission: 'VIEW_REPORTS' },
    { nameKey: 'sidebar.whatsapp', path: '/whatsapp', icon: WhatsAppIcon },
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
    'MANAGE_COMPANY_INFO',
    'MANAGE_USERS',
    'MANAGE_CATEGORIES',
    'MANAGE_SERVICES_RESOURCES',
];

export const ALL_PERMISSIONS: Permission[] = [
    ...ADMIN_PERMISSIONS,
    'MANAGE_ALL_COMPANIES',
    'MANAGE_ALL_USERS',
    'MANAGE_PERMISSIONS',
    'MANAGE_PLANS',
];

export const USER_MANAGEABLE_PERMISSIONS: Permission[] = ALL_PERMISSIONS.filter(p => !['MANAGE_PERMISSIONS', 'MANAGE_ALL_COMPANIES'].includes(p));
