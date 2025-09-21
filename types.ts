

export type Permission =
  // Dashboard
  | 'VIEW_DASHBOARD'
  // Customers
  | 'VIEW_CUSTOMERS'
  | 'MANAGE_CUSTOMERS' // Add/Edit
  | 'DELETE_CUSTOMERS'
  // Suppliers
  | 'VIEW_SUPPLIERS'
  | 'MANAGE_SUPPLIERS' // Add/Edit
  | 'DELETE_SUPPLIERS'
  // Agenda
  | 'VIEW_AGENDA'
  | 'MANAGE_AGENDA' // Add/Edit/Complete
  // Reports
  | 'VIEW_REPORTS'
  // Settings
  | 'VIEW_SETTINGS'
  | 'MANAGE_COMPANY_INFO' // Edit own company info
  | 'MANAGE_USERS' // Add/Edit users in own company
  | 'MANAGE_CATEGORIES'
  // Super Admin
  | 'MANAGE_ALL_COMPANIES' // Add/Edit/Delete any company
  | 'MANAGE_ALL_USERS' // Add/Edit users in any company
  | 'MANAGE_PERMISSIONS';


export interface AppointmentHistory {
  modifiedAt: Date;
  modifiedById: string;
  previousState: {
    title: string;
    start: Date;
    end: Date;
  };
}

export enum UserRole {
  ADMIN = 'Administrador',
  MANAGER = 'Gerente',
  COLLABORATOR = 'Colaborador',
}

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  logoUrl?: string;
}

export interface User {
  id:string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  companyId: string;
  gender?: 'male' | 'female';
  permissions: Permission[];
}

export interface Customer {
  id:string;
  name: string;
  type: 'Individual' | 'Company';
  identifier: string; // CPF or CNPJ
  phone: string;
  email: string;
  cep: string;
  address: string;
  status: 'Active' | 'Inactive';
  createdAt: Date;
  interactions: Interaction[];
  documents: Document[];
  companyId: string;
  avatarUrl?: string;
  gender?: 'male' | 'female';
}

export interface Interaction {
  id: string;
  date: Date;
  notes: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  userId: string;
}

export interface Document {
  id: string;
  name: string;
  url: string; // In a real app, this would be a URL to the stored file
  uploadedAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  cnpj: string;
  contactPerson: string;
  phone: string;
  email: string;
  services: string[];
  companyId: string;
  logoUrl?: string;
  contactAvatarUrl?: string;
  cep: string;
  address: string;
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  until: Date;
}

export enum AppointmentStatus {
  SCHEDULED = 'agendado',
  COMPLETED = 'concluido',
}

export interface Attachment {
  id: string;
  name: string;
  type: string; // Mime type
  content: string; // Base64 data URL
}

export interface Appointment {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  dueDate?: Date;
  location: string;
  participants: (User | Customer | Supplier)[];
  status: AppointmentStatus;
  category: string;
  customerId?: string;
  supplierId?: string;
  companyId: string;
  recurrenceRule?: RecurrenceRule;
  attachments?: Attachment[];
  history?: AppointmentHistory[];
  reminder?: number; // Minutes before start time
}

export type ActivityType = 'Cliente' | 'Fornecedor' | 'Compromisso' | 'Usuário' | 'Empresa';

export interface ActivityLog {
  id: string;
  date: Date;
  type: ActivityType;
  descriptionKey: string;
  descriptionParams?: { [key: string]: string | number };
  companyId: string;
}