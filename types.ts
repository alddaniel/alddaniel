export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

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
  | 'MANAGE_SERVICES_RESOURCES' // New permission for managing services and resources
  // Super Admin
  | 'MANAGE_ALL_COMPANIES' // Add/Edit/Delete any company
  | 'MANAGE_ALL_USERS' // Add/Edit users in any company
  | 'MANAGE_PERMISSIONS'
  | 'MANAGE_PLANS'; // New permission for plan management


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
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  COLLABORATOR = 'COLLABORATOR',
}

export interface CompanyHistory {
  changedAt: Date;
  changedById: string;
  oldStatus: 'active' | 'trial' | 'suspended';
  newStatus: 'active' | 'trial' | 'suspended';
  reason: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  userLimit: number;
  customerLimit: number;
  hasWhatsApp: boolean;
  hasAI: boolean;
  allowBranding: boolean;
}

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  logoUrl?: string;
  cep: string;
  status: 'active' | 'trial' | 'suspended';
  trialEndsAt: Date | null;
  history?: CompanyHistory[];
  planId: string;
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
  status: 'active' | 'pending';
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
  CONFIRMED = 'confirmado',
  COMPLETED = 'concluido',
  CANCELED = 'cancelado',
  NO_SHOW = 'nao_compareceu',
}


export interface Attachment {
  id: string;
  name: string;
  type: string; // Mime type
  content: string; // Base64 data URL
}

export interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
  companyId: string;
}

export interface Resource {
  id: string;
  name: string;
  type: 'Sala' | 'Equipamento';
  companyId: string;
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
  professionalId?: string; // ID of the main User (doctor, etc.)
  serviceId?: string; // ID of the Service performed
  resourceId?: string; // ID of the Resource used (room, equipment)
  recurrenceRule?: RecurrenceRule;
  attachments?: Attachment[];
  history?: AppointmentHistory[];
  subtasks?: Subtask[];
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

// This ensures the file is treated as a module.
export {};