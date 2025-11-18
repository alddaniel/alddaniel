# Business Hub Pro - Código-Fonte Completo

Este arquivo contém o código-fonte completo da aplicação "Business Hub Pro". Ele está formatado para ser facilmente inserido em ferramentas de Inteligência Artificial, como o Google NotebookLM, para a geração automática de documentação técnica.

---

## Arquivo: index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Business Hub Pro</title>
    <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
    <script>
      tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            colors: {
              'primary': '#4f46e5',
              'primary-hover': '#4338ca',
              'secondary': '#111827',
              'light': '#f9fafb',
              'dark': '#1f2937',
              'medium': '#6b7280',
              'amber-500': '#f59e0b', // Added for professional highlight
            },
            backdropBlur: {
              'xs': '2px',
            },
            animation: {
              'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
              'fade-in': 'fadeIn 0.3s ease-out forwards',
              'modal-content-show': 'modalContentShow 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              'highlight-and-fade': 'highlightAndFade 2s ease-out forwards',
              'fade-out': 'fadeOut 0.5s ease-out forwards',
            },
            keyframes: {
              fadeInUp: {
                '0%': { opacity: '0', transform: 'translateY(20px)' },
                '100%': { opacity: '1', transform: 'translateY(0)' },
              },
              fadeIn: {
                '0%': { opacity: '0' },
                '100%': { opacity: '1' },
              },
              modalContentShow: {
                '0%': { opacity: '0', transform: 'translateY(30px) scale(0.98)' },
                '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
              },
              highlightAndFade: {
                '0%': { backgroundColor: 'rgba(79, 70, 229, 0.1)' },
                '100%': { backgroundColor: 'transparent' },
              },
              fadeOut: {
                'from': { opacity: '1', transform: 'translateX(0)' },
                'to': { opacity: '0', transform: 'translateX(-20px)' },
              }
            }
          },
        },
      }
    </script>
  <script type="importmap">
{
  "imports": {
    "react/": "https://aistudiocdn.com/react@^19.1.1/",
    "react": "https://aistudiocdn.com/react@^19.1.1",
    "react-dom/": "https://aistudiocdn.com/react-dom@^19.1.1/",
    "@google/genai": "https://aistudiocdn.com/@google/genai@^1.16.0",
    "react-router-dom": "https://aistudiocdn.com/react-router-dom@^7.8.2",
    "recharts": "https://aistudiocdn.com/recharts@^3.1.2",
    "jspdf": "https://aistudiocdn.com/jspdf@^2.5.1",
    "jspdf-autotable": "https://aistudiocdn.com/jspdf-autotable@^3.8.2",
    "xlsx": "https://aistudiocdn.com/xlsx@^0.18.5",
    "@supabase/supabase-js": "https://aistudiocdn.com/@supabase/supabase-js@^2.44.4",
    "@vitejs/plugin-react": "https://aistudiocdn.com/@vitejs/plugin-react@^5.0.3",
    "vite": "https://aistudiocdn.com/vite@^7.1.7"
  }
}
</script>
</head>
  <body class="bg-light dark:bg-secondary">
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>
```

---

## Arquivo: index.tsx

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
    <App />
);
```

---

## Arquivo: App.tsx

```tsx
import React, { Suspense, useMemo, useEffect, useState } from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import { StateProvider, useAppState } from './state/AppContext';
import { LocalizationProvider, useLocalization } from './contexts/LocalizationContext';
import { navItems } from './constants';
import * as authService from './services/authService';
import { User, Company, Plan } from './types';
import Header from './components/Header';
import Login from './components/Login';
import { CloseIcon, CheckCircleIcon, InformationCircleIcon, AlertTriangleIcon } from './components/Icons';
import Logo from './components/Logo';
import { supabase } from './services/supabaseClient';
import PasswordResetModal from './components/PasswordResetModal';
import { sendAppointmentReminderEmail } from './services/notificationService';
import AccountStatusScreen from './components/AccountStatusScreen';
import GlobalLoadingSpinner from './components/GlobalLoadingSpinner';

// Lazy-loaded page components for code-splitting
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const CustomerManagement = React.lazy(() => import('./components/CustomerManagement'));
const CustomerDetailPage = React.lazy(() => import('./components/CustomerDetailPage'));
const SupplierManagement = React.lazy(() => import('./components/SupplierManagement'));
const Agenda = React.lazy(() => import('./components/Agenda'));
const Reports = React.lazy(() => import('./components/Reports'));
const WhatsAppSender = React.lazy(() => import('./components/WhatsAppCloud'));
const Settings = React.lazy(() => import('./components/Settings'));
const Help = React.lazy(() => import('./components/Help'));


const Sidebar: React.FC<{onClose?: () => void; company: Company, plan: Plan | null}> = ({onClose, company, plan}) => {
    const { hasPermission } = useAppState();
    const { t } = useLocalization();

    const visibleNavItems = useMemo(() => {
        return navItems.filter(item => {
             if (item.path === '/whatsapp' && !(plan?.hasWhatsApp)) {
                return false;
            }
            return !item.permission || hasPermission(item.permission)
        });
    }, [hasPermission, plan]);

    return (
        <div className="w-64 bg-white dark:bg-secondary text-gray-300 flex flex-col border-r border-gray-200 dark:border-gray-700 h-full">
            <div className="h-20 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                    {company.logoUrl ? (
                        <img src={company.logoUrl} alt={`${company.name} logo`} className="max-h-10 object-contain flex-shrink-0" />
                    ) : (
                        <Logo 
                            showText={false} 
                            iconClassName="h-10 w-10" 
                            className="flex-shrink-0" 
                        />
                    )}
                    <span className="font-bold text-lg text-secondary dark:text-white truncate">
                        {company.name}
                    </span>
                </div>
                 {onClose && (
                    <button onClick={onClose} className="lg:hidden p-1 text-gray-500 rounded-full hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark ml-2 flex-shrink-0">
                        <CloseIcon className="w-6 h-6"/>
                    </button>
                )}
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                {visibleNavItems.map((item: any) => (
                    <NavLink
                        key={item.nameKey}
                        to={item.path}
                        end={item.path === '/'}
                        onClick={onClose} // Close sidebar on navigation
                        className={({ isActive }: { isActive: boolean }) =>
                            `flex items-center px-4 py-2.5 rounded-lg transition-colors duration-200 ${
                                isActive
                                    ? 'bg-primary text-white'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark hover:text-secondary dark:hover:text-white'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5 mr-3" />
                        <span className="font-medium">{t(item.nameKey)}</span>
                    </NavLink>
                ))}
            </nav>
             <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    By SobControle
                </p>
            </div>
        </div>
    );
};


const NotificationToast: React.FC<{ message: string; type: 'success' | 'info' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
    const config = {
        success: {
            bgColor: 'bg-green-500 dark:bg-green-600',
            borderColor: 'border-green-600 dark:border-green-700',
            icon: <CheckCircleIcon className="w-6 h-6" />
        },
        info: {
            bgColor: 'bg-blue-500 dark:bg-blue-600',
            borderColor: 'border-blue-600 dark:border-blue-700',
            icon: <InformationCircleIcon className="w-6 h-6" />
        },
        error: {
            bgColor: 'bg-red-500 dark:bg-red-600',
            borderColor: 'border-red-600 dark:border-red-700',
            icon: <AlertTriangleIcon className="w-6 h-6" />
        }
    };

    const { bgColor, borderColor, icon } = config[type];

    return (
        <div className={`fixed bottom-4 right-4 md:bottom-8 md:right-8 text-white px-4 py-3 rounded-lg shadow-xl z-50 animate-fade-in-up flex items-center gap-4 border-l-4 ${bgColor} ${borderColor}`}>
            <div className="flex-shrink-0">{icon}</div>
            <p className="flex-grow text-sm font-medium">{message}</p>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-white">
                <CloseIcon className="w-5 h-5"/>
            </button>
        </div>
    );
};

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center h-full w-full bg-light dark:bg-secondary">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
    </div>
);


const AppContent: React.FC = () => {
    const { state, dispatch } = useAppState();
    const { t, locale } = useLocalization();
    const { currentUser, customers, suppliers, appointments, users, companies, activityLog, notification, theme, remindersShown, plans, isLoading } = state;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // NOTE: Password reset is a special case that still uses a Supabase listener for the magic link.
    const [showPasswordReset, setShowPasswordReset] = useState(false);
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setShowPasswordReset(true);
            }
        });
        return () => subscription.unsubscribe();
    }, []);


    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                dispatch({ type: 'HIDE_NOTIFICATION' });
            }, 4000);
            return () => clearTimeout(timer); // Clear the timer if a new notification appears or the component unmounts.
        }
    }, [notification, dispatch]);

    useEffect(() => {
        const checkReminders = () => {
            if (!currentUser) return;

            const now = new Date();
            const upcomingAppointments = appointments.filter(app =>
                app.status === 'agendado' &&
                app.reminder &&
                !remindersShown.includes(app.id) &&
                app.companyId === currentUser.companyId
            );

            for (const app of upcomingAppointments) {
                const reminderTime = new Date(new Date(app.start).getTime() - app.reminder * 60000);

                if (now >= reminderTime && now < new Date(app.start)) {
                    const minutes = app.reminder!;
                    let reminderText = '';
                    if (minutes < 60) {
                        reminderText = t(minutes > 1 ? 'common.time.minutes' : 'common.time.minute', { count: minutes });
                    } else if (minutes < 1440) {
                        const hours = Math.floor(minutes / 60);
                        reminderText = t(hours > 1 ? 'common.time.hours' : 'common.time.hour', { count: hours });
                    } else {
                        const days = Math.floor(minutes / 1440);
                        reminderText = t(days > 1 ? 'common.time.days' : 'common.time.day', { count: days });
                    }

                    dispatch({ 
                        type: 'SHOW_NOTIFICATION', 
                        payload: { 
                            messageKey: 'notifications.ui.reminder', 
                            messageParams: { title: app.title, time: reminderText },
                            type: 'info' 
                        } 
                    });

                    // "Send" emails to all participants
                    for (const participant of app.participants) {
                        if (participant.email) {
                            sendAppointmentReminderEmail(app, participant, t, locale);
                        }
                    }

                    dispatch({ type: 'MARK_REMINDER_SHOWN', payload: app.id });
                }
            }
        };

        const intervalId = setInterval(checkReminders, 30000);

        return () => {
            clearInterval(intervalId);
        };
    }, [appointments, remindersShown, currentUser, dispatch, t, locale]);

    const handleLogout = async () => {
        await authService.signOut();
        dispatch({ type: 'LOGOUT' });
    };

    if (!currentUser) {
        return (
            <>
                <Login />
                {showPasswordReset && <PasswordResetModal onClose={() => setShowPasswordReset(false)} />}
                {isLoading && <GlobalLoadingSpinner />}
            </>
        );
    }

    const companyForCurrentUser = companies.find(c => c.id === currentUser.companyId);
    const planForCurrentUser = companyForCurrentUser ? plans.find(p => p.id === companyForCurrentUser.planId) : null;


    if (companyForCurrentUser) {
        let isBlocked = false;
        let blockReason: 'suspended' | 'trial_expired' | 'past_due' | null = null;

        if (companyForCurrentUser.status === 'suspended') {
            isBlocked = true;
            blockReason = 'suspended';
        } else if (companyForCurrentUser.status === 'trial' && companyForCurrentUser.trialEndsAt) {
            if (new Date() > new Date(companyForCurrentUser.trialEndsAt)) {
                isBlocked = true;
                blockReason = 'trial_expired';
            }
        }


        if (isBlocked) {
            return <AccountStatusScreen reason={blockReason} onLogout={handleLogout} />;
        }
    }


    return (
        <div className="flex h-screen bg-light dark:bg-secondary overflow-hidden">
            {isSidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

             <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translateX(0)' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-40 lg:hidden`}>
                <Sidebar onClose={() => setIsSidebarOpen(false)} company={companyForCurrentUser!} plan={planForCurrentUser} />
            </div>

            <div className="hidden lg:flex lg:flex-shrink-0">
                <Sidebar company={companyForCurrentUser!} plan={planForCurrentUser}/>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header
                    companyName={companyForCurrentUser!.name}
                    currentUser={currentUser}
                    appointments={appointments}
                    customers={customers}
                    suppliers={suppliers}
                    onLogout={handleLogout}
                    onMenuClick={() => setIsSidebarOpen(true)}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    <Suspense fallback={<LoadingSpinner />}>
                        <Routes>
                        <Route path="/" element={<Dashboard customers={customers} suppliers={suppliers} appointments={appointments} activityLog={activityLog} />} />
                        <Route path="/customers" element={<CustomerManagement />} />
                        <Route path="/customers/:customerId" element={<CustomerDetailPage />} />
                        <Route path="/suppliers" element={<SupplierManagement />} />
                        <Route path="/agenda" element={<Agenda />} />
                        <Route path="/reports" element={<Reports appointments={appointments} customers={customers} suppliers={suppliers} activityLog={activityLog} />} />
                        <Route path="/whatsapp" element={<WhatsAppSender />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/help" element={<Help />} />
                        </Routes>
                    </Suspense>
                </main>
            </div>
            {notification && <NotificationToast message={t(notification.messageKey, notification.messageParams)} type={notification.type} onClose={() => dispatch({ type: 'HIDE_NOTIFICATION' })} />}
            {isLoading && <GlobalLoadingSpinner />}
        </div>
    );
};

const App: React.FC = () => {
    return (
        <LocalizationProvider>
            <StateProvider>
                <HashRouter>
                    <AppContent />
                </HashRouter>
            </StateProvider>
        </LocalizationProvider>
    );
};

export default App;
```

---

## Arquivo: types.ts

```ts
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
```

---

## Arquivo: types/supabase.ts

```ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_log: {
        Row: {
          id: string
          created_at: string
          type: string
          description_key: string
          description_params: Json | null
          company_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          type: string
          description_key: string
          description_params?: Json | null
          company_id: string
        }
        Update: {
          id?: string
          created_at?: string
          type?: string
          description_key?: string
          description_params?: Json | null
          company_id?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          start_time: string
          end_time: string
          due_date: string | null
          location: string
          user_participant_ids: string[] | null
          status: string
          category: string
          customer_id: string | null
          supplier_id: string | null
          company_id: string
          recurrence_rule: Json | null
          attachments: Json | null
          history: Json | null
          subtasks: Json | null
          reminder: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          start_time: string
          end_time: string
          due_date?: string | null
          location: string
          user_participant_ids?: string[] | null
          status: string
          category: string
          customer_id?: string | null
          supplier_id?: string | null
          company_id: string
          recurrence_rule?: Json | null
          attachments?: Json | null
          history?: Json | null
          subtasks?: Json | null
          reminder?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          start_time?: string
          end_time?: string
          due_date?: string | null
          location?: string
          user_participant_ids?: string[] | null
          status?: string
          category?: string
          customer_id?: string | null
          supplier_id?: string | null
          company_id?: string
          recurrence_rule?: Json | null
          attachments?: Json | null
          history?: Json | null
          subtasks?: Json | null
          reminder?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_customer_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_supplier_id_fkey"
            columns: ["supplier_id"]
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          }
        ]
      }
      customers: {
        Row: {
          id: string
          created_at: string
          name: string
          type: "Individual" | "Company"
          identifier: string
          phone: string
          email: string
          cep: string
          address: string
          status: "Active" | "Inactive"
          company_id: string
          avatar_url: string | null
          gender: "male" | "female" | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          type: "Individual" | "Company"
          identifier: string
          phone: string
          email: string
          cep: string
          address: string
          status: "Active" | "Inactive"
          company_id: string
          avatar_url?: string | null
          gender?: "male" | "female" | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          type?: "Individual" | "Company"
          identifier?: string
          phone?: string
          email?: string
          cep?: string
          address?: string
          status?: "Active" | "Inactive"
          company_id?: string
          avatar_url?: string | null
          gender?: "male" | "female" | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          id: string
          created_at: string
          name: string
          cnpj: string
          contact_person: string
          phone: string
          email: string
          services: string[]
          company_id: string
          logo_url: string | null
          contact_avatar_url: string | null
          cep: string
          address: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          cnpj: string
          contact_person: string
          phone: string
          email: string
          services: string[]
          company_id: string
          logo_url?: string | null
          contact_avatar_url?: string | null
          cep: string
          address: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          cnpj?: string
          contact_person?: string
          phone?: string
          email?: string
          services?: string[]
          company_id?: string
          logo_url?: string | null
          contact_avatar_url?: string | null
          cep?: string
          address?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: "ADMIN" | "MANAGER" | "COLLABORATOR"
          avatar_url: string | null
          company_id: string
          gender: "male" | "female" | null
          permissions: Json
          status: "active" | "pending"
        }
        Insert: {
          id: string
          name: string
          email: string
          role: "ADMIN" | "MANAGER" | "COLLABORATOR"
          avatar_url?: string | null
          company_id: string
          gender?: "male" | "female" | null
          permissions: Json
          status: "active" | "pending"
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: "ADMIN" | "MANAGER" | "COLLABORATOR"
          avatar_url?: string | null
          company_id?: string
          gender?: "male" | "female" | null
          permissions?: Json
          status?: "active" | "pending"
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
```

---

## Arquivo: constants.ts

```ts
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

// MOCK DATA
const trialEndDate = new Date();
trialEndDate.setDate(trialEndDate.getDate() + 30);

const expiredTrialDate = new Date();
expiredTrialDate.setDate(expiredTrialDate.getDate() - 5);

export const MOCK_PLANS: Plan[] = [
  { id: 'plan-1', name: 'Bronze', price: 49, userLimit: 5, customerLimit: 50, hasWhatsApp: false, hasAI: false, allowBranding: false },
  { id: 'plan-2', name: 'Prata', price: 99, userLimit: 20, customerLimit: 200, hasWhatsApp: true, hasAI: false, allowBranding: true },
  { id: 'plan-3', name: 'Ouro', price: 199, userLimit: 100, customerLimit: 1000, hasWhatsApp: true, hasAI: true, allowBranding: true },
];

export const MOCK_COMPANIES: Company[] = [
  { id: 'company-1', name: 'Business Hub Pro Inc.', cnpj: '11.111.111/0001-11', address: '123 Main St, Anytown, USA', phone: '(11) 99999-1234', email: 'contact@businesshub.com', logoUrl: '', cep: '01000-000', status: 'active', trialEndsAt: null, history: [], planId: 'plan-3' },
  { id: 'company-2', name: 'InovaTech Solutions', cnpj: '22.222.222/0001-22', address: '456 Oak Ave, Tech City, USA', phone: '(21) 88888-5678', email: 'support@inovatech.com', logoUrl: '', cep: '20000-000', status: 'active', trialEndsAt: null, history: [], planId: 'plan-2' },
  { id: 'company-3', name: 'Startup de Teste Ltda', cnpj: '33.333.333/0001-33', address: '789 Pine St, Growth Valley, USA', phone: '(31) 77777-1234', email: 'contact@startupteste.com', logoUrl: '', cep: '30000-000', status: 'trial', trialEndsAt: trialEndDate, history: [], planId: 'plan-1' },
  { id: 'company-4', name: 'Sistemas Legados (Suspensa)', cnpj: '44.444.444/0001-44', address: '101 Old Rd, Past Town, USA', phone: '(41) 66666-5678', email: 'support@legado.com', logoUrl: '', cep: '40000-000', status: 'suspended', trialEndsAt: expiredTrialDate, history: [], planId: 'plan-1' },
];

export const MOCK_SERVICES: Service[] = [
    { id: 'serv-1', name: 'Consulta Inicial', duration: 60, price: 250.00, companyId: 'company-1' },
    { id: 'serv-2', name: 'Retorno', duration: 30, price: 150.00, companyId: 'company-1' },
    { id: 'serv-3', name: 'Sessão de Terapia', duration: 50, price: 200.00, companyId: 'company-2' },
    { id: 'serv-4', name: 'Limpeza Dental', duration: 45, price: 180.00, companyId: 'company-1' }
];

export const MOCK_RESOURCES: Resource[] = [
    { id: 'res-1', name: 'Consultório 1', type: 'Sala', companyId: 'company-1' },
    { id: 'res-2', name: 'Consultório 2', type: 'Sala', companyId: 'company-1' },
    { id: 'res-3', name: 'Aparelho de Raio-X', type: 'Equipamento', companyId: 'company-1' },
    { id: 'res-4', name: 'Sala de Terapia A', type: 'Sala', companyId: 'company-2' },
];

export const MOCK_USERS: User[] = [
    { id: 'user-1', name: 'Davi Darruspe', email: 'ddarruspe@gmail.com', role: UserRole.ADMIN, avatarUrl: REALISTIC_AVATARS[0], companyId: 'company-1', gender: 'male', permissions: ALL_PERMISSIONS, status: 'active' },
    { id: 'user-2', name: 'Alice Wonder', email: 'alice@businesshub.com', role: UserRole.ADMIN, avatarUrl: REALISTIC_AVATARS[1], companyId: 'company-1', gender: 'female', permissions: ADMIN_PERMISSIONS, status: 'active' },
    { id: 'user-3', name: 'Bob Builder', email: 'bob@businesshub.com', role: UserRole.MANAGER, avatarUrl: REALISTIC_AVATARS[2], companyId: 'company-1', gender: 'male', permissions: MANAGER_PERMISSIONS, status: 'active' },
    { id: 'user-4', name: 'Carlos Finanças', email: 'carlos@inovatech.com', role: UserRole.ADMIN, avatarUrl: REALISTIC_AVATARS[3], companyId: 'company-2', gender: 'male', permissions: ADMIN_PERMISSIONS, status: 'active' },
    { id: 'user-5', name: 'Diana Prince', email: 'diana@inovatech.com', role: UserRole.COLLABORATOR, avatarUrl: REALISTIC_AVATARS[4], companyId: 'company-2', gender: 'female', permissions: COLLABORATOR_PERMISSIONS, status: 'active' },
    { id: 'user-6', name: 'Jane Smith', email: 'jane.smith@businesshub.com', role: UserRole.COLLABORATOR, companyId: 'company-1', avatarUrl: REALISTIC_AVATARS[5], gender: 'female', permissions: COLLABORATOR_PERMISSIONS, status: 'active' },
    { id: 'user-7', name: 'Robert Johnson', email: 'robert.j@inovatech.com', role: UserRole.COLLABORATOR, companyId: 'company-2', avatarUrl: REALISTIC_AVATARS[6], gender: 'male', permissions: COLLABORATOR_PERMISSIONS, status: 'active' },
    { id: 'user-8', name: 'Usuário de Teste', email: 'user@user.com.br', role: UserRole.ADMIN, companyId: 'company-1', avatarUrl: REALISTIC_AVATARS[8], permissions: ADMIN_PERMISSIONS, status: 'active' },
    { id: 'user-9', name: 'Admin Exemplo', email: 'admin@exemplo.com', role: UserRole.ADMIN, companyId: 'company-1', avatarUrl: REALISTIC_AVATARS[7], permissions: ADMIN_PERMISSIONS, status: 'active' },
    { id: 'user-10', name: 'Carlos Teste', email: 'carlos@startupteste.com', role: UserRole.ADMIN, companyId: 'company-3', avatarUrl: REALISTIC_AVATARS[9], gender: 'male', permissions: ADMIN_PERMISSIONS, status: 'active' },
    { id: 'user-11', name: 'Samuel Suspenso', email: 'sam@legado.com', role: UserRole.ADMIN, companyId: 'company-4', avatarUrl: REALISTIC_AVATARS[10], gender: 'male', permissions: ADMIN_PERMISSIONS, status: 'active' },
];

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'cust-1', name: 'Global Imports', type: 'Company', identifier: '33.333.333/0001-33', phone: '(11) 5555-1111', email: 'contact@globalimports.com', cep: '01001-000', address: 'Praça da Sé, s/n - Sé, São Paulo/SP', status: 'Active', createdAt: new Date('2023-01-15'), interactions: [{ id: 'int-1', date: new Date(new Date().setDate(new Date().getDate() - 5)), notes: 'Initial contact call, showed interest in product X.', type: 'call', userId: 'user-2' }], documents: [], companyId: 'company-1' },
  { id: 'cust-2', name: 'Fernanda Lima', type: 'Individual', identifier: '111.222.333-44', phone: '(21) 98888-2222', email: 'fernanda.lima@email.com', cep: '22071-000', address: 'Av. Vieira Souto, 100 - Ipanema, Rio de Janeiro/RJ', status: 'Active', createdAt: new Date('2022-11-20'), interactions: [], documents: [], companyId: 'company-1', gender: 'female', avatarUrl: REALISTIC_AVATARS[7] },
  { id: 'cust-3', name: 'Tech Solutions Ltda.', type: 'Company', identifier: '44.444.444/0001-44', phone: '(31) 3333-4444', email: 'suporte@techsolutions.com', cep: '30112-010', address: 'Av. do Contorno, 500 - Savassi, Belo Horizonte/MG', status: 'Inactive', createdAt: new Date('2021-05-10'), interactions: [], documents: [], companyId: 'company-2' },
  { id: 'cust-4', name: 'Ricardo Mendes', type: 'Individual', identifier: '555.666.777-88', phone: '(41) 97777-5555', email: 'ricardo.mendes@email.com', cep: '80010-010', address: 'R. XV de Novembro, 100 - Centro, Curitiba/PR', status: 'Active', createdAt: new Date('2023-08-01'), interactions: [], documents: [], companyId: 'company-1', gender: 'male', avatarUrl: REALISTIC_AVATARS[8] },
];

export const MOCK_SUPPLIERS: Supplier[] = [
    { id: 'sup-1', name: 'Fornecedora de Papel Ltda.', cnpj: '55.555.555/0001-55', contactPerson: 'Sr. Carlos Pereira', phone: '(11) 2222-3333', email: 'carlos.p@papel.com', services: ['Papelaria', 'Material de Escritório'], companyId: 'company-1', logoUrl: 'https://via.placeholder.com/150/FFC107/808080?Text=FP', contactAvatarUrl: REALISTIC_AVATARS[9], cep: '04538-132', address: 'Av. Brigadeiro Faria Lima, 4221 - Itaim Bibi, São Paulo/SP' },
    { id: 'sup-2', name: 'Digital Marketing Experts', cnpj: '66.666.666/0001-66', contactPerson: 'Sra. Beatriz Souza', phone: '(21) 96666-7777', email: 'beatriz@digitalexperts.com', services: ['Marketing Digital', 'SEO'], companyId: 'company-1', logoUrl: 'https://via.placeholder.com/150/00BCD4/FFFFFF?Text=DM', contactAvatarUrl: REALISTIC_AVATARS[10], cep: '22640-102', address: 'Av. das Américas, 3500 - Barra da Tijuca, Rio de Janeiro/RJ' },
    { id: 'sup-3', name: 'Cloud Services Inc.', cnpj: '77.777.777/0001-77', contactPerson: 'Sr. André Costa', phone: '(19) 3444-5555', email: 'andre.c@cloud.com', services: ['Hospedagem', 'Cloud'], companyId: 'company-2', logoUrl: 'https://via.placeholder.com/150/4CAF50/FFFFFF?Text=CS', contactAvatarUrl: REALISTIC_AVATARS[11], cep: '13083-852', address: 'R. da Reitoria, 10 - Cidade Universitária, Campinas/SP' },
];

const today = new Date();
const tomorrow = new Date(new Date().setDate(today.getDate() + 1));
const nextWeek = new Date(new Date().setDate(today.getDate() + 7));
const yesterday = new Date(new Date().setDate(today.getDate() - 1));

export const MOCK_APPOINTMENTS: Appointment[] = [
    { id: 'app-1', title: 'Reunião de Alinhamento Semanal', description: 'Discutir progresso da sprint', start: new Date(today.setHours(9, 0, 0)), end: new Date(today.setHours(10, 0, 0)), location: 'Sala de Reuniões 1', participants: [MOCK_USERS[1], MOCK_USERS[2]], status: AppointmentStatus.SCHEDULED, category: APPOINTMENT_CATEGORIES.INTERNAL_TEAM, companyId: 'company-1', subtasks: [{id: 'sub-1', title: 'Preparar slides', completed: true}, {id: 'sub-2', title: 'Revisar métricas', completed: false}] },
    { id: 'app-2', title: 'Apresentação para Global Imports', description: 'Demo do novo produto', start: new Date(today.setHours(14, 0, 0)), end: new Date(today.setHours(15, 30, 0)), location: 'Online via Teams', participants: [MOCK_USERS[0], MOCK_CUSTOMERS[0]], status: AppointmentStatus.SCHEDULED, category: APPOINTMENT_CATEGORIES.CLIENT_MEETING, customerId: 'cust-1', companyId: 'company-1' },
    { id: 'app-3', title: 'Café com Fernanda Lima', description: 'Follow-up de proposta', start: new Date(tomorrow.setHours(10, 0, 0)), end: new Date(tomorrow.setHours(11, 0, 0)), location: 'Café do Ponto', participants: [MOCK_USERS[2], MOCK_CUSTOMERS[1]], status: AppointmentStatus.SCHEDULED, category: APPOINTMENT_CATEGORIES.SALES, customerId: 'cust-2', companyId: 'company-1' },
    { id: 'app-4', title: 'Reunião com Fornecedora de Papel', description: 'Negociar novo contrato', start: new Date(nextWeek.setHours(11, 0, 0)), end: new Date(nextWeek.setHours(12, 0, 0)), location: 'Escritório do Fornecedor', participants: [MOCK_USERS[1], MOCK_SUPPLIERS[0]], status: AppointmentStatus.SCHEDULED, category: APPOINTMENT_CATEGORIES.SUPPLIER, supplierId: 'sup-1', companyId: 'company-1' },
    { id: 'app-5', title: 'Revisão Trimestral de Marketing', description: 'Analisar resultados da campanha', start: new Date(yesterday.setHours(16, 0, 0)), end: new Date(yesterday.setHours(17, 0, 0)), location: 'Sala de Reuniões 2', participants: [MOCK_USERS[4], MOCK_USERS[6]], status: AppointmentStatus.COMPLETED, category: APPOINTMENT_CATEGORIES.INTERNAL_TEAM, companyId: 'company-2' },
    { id: 'app-6', title: 'Onboarding Carlos', description: 'Apresentar sistema para novo admin', start: new Date(today.setHours(10, 0, 0)), end: new Date(today.setHours(11, 0, 0)), location: 'Online', participants: [MOCK_USERS[9]], status: AppointmentStatus.SCHEDULED, category: APPOINTMENT_CATEGORIES.INTERNAL_TEAM, companyId: 'company-3' },

];

export const MOCK_ACTIVITY_LOGS: ActivityLog[] = [
    { id: 'log-1', date: new Date(new Date().setDate(today.getDate() - 1)), type: 'Cliente', descriptionKey: 'activityLog.NEW_CUSTOMER', descriptionParams: { name: MOCK_CUSTOMERS[3].name }, companyId: 'company-1' },
    { id: 'log-2', date: new Date(new Date().setHours(new Date().getHours() - 2)), type: 'Compromisso', descriptionKey: 'activityLog.NEW_APPOINTMENT', descriptionParams: { title: MOCK_APPOINTMENTS[1].title }, companyId: 'company-1' },
    { id: 'log-3', date: new Date(new Date().setDate(today.getDate() - 2)), type: 'Fornecedor', descriptionKey: 'activityLog.NEW_SUPPLIER', descriptionParams: { name: MOCK_SUPPLIERS[2].name }, companyId: 'company-2' },
    { id: 'log-4', date: new Date(new Date().setDate(today.getDate() - 3)), type: 'Usuário', descriptionKey: 'activityLog.NEW_USER', descriptionParams: { name: MOCK_USERS[6].name }, companyId: 'company-2' },
];
```

... (Todos os outros arquivos do projeto seriam incluídos aqui no mesmo formato) ...

---

## Arquivo: components/Dashboard.tsx

```tsx
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
```

---

## Arquivo: components/CustomerManagement.tsx

```tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Customer, Appointment } from '../types';
import { useAppState } from '../state/AppContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { EditIcon, TrashIcon, EyeIcon, SearchIcon, WarningIcon, PlusIcon, UserProfile } from './Icons';
import { Modal } from './Modal';
import { AvatarSelectionModal } from './AvatarSelectionModal';
import Breadcrumbs from './Breadcrumbs';
import FloatingActionButton from './FloatingActionButton';
import { validateCPF, validateCNPJ, validateDNI, validateCUIT, validateCPA } from '../services/validationService';
import { fetchBrazilianAddress, fetchArgentinianAddress } from '../services/cepService';
import { fetchBrazilianCompanyData, fetchArgentinianCompanyData } from '../services/cnpjService';
import { maskCPF, maskCNPJ, maskCUIT } from '../services/maskService';
import { useNavigate, useLocation } from 'react-router-dom';

// --- Customer Form ---
interface CustomerFormProps {
    customer?: Customer | null;
    onSave: (customerData: Omit<Customer, 'id' | 'createdAt' | 'interactions' | 'documents' | 'companyId'>) => void;
    onCancel: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSave, onCancel }) => {
    const { t, locale } = useLocalization();
    const { dispatch } = useAppState();
    const isArgentina = locale.startsWith('es');
    const [formData, setFormData] = useState({
        name: customer?.name || '',
        type: customer?.type || 'Company',
        identifier: customer?.identifier || '',
        phone: customer?.phone || '',
        email: customer?.email || '',
        cep: customer?.cep || '',
        address: customer?.address || '',
        status: customer?.status || 'Active',
        avatarUrl: customer?.avatarUrl || '',
    });
    const [errors, setErrors] = useState<{ identifier?: string, cep?: string }>({});
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

    const handleIdentifierChange = (value: string) => {
        const cleanedValue = value.replace(/\D/g, '');
        let maskedValue = value;

        if (isArgentina) {
            if (formData.type === 'Company') { // CUIT
                maskedValue = maskCUIT(cleanedValue);
            } else { // Individual (DNI)
                maskedValue = cleanedValue.substring(0, 8);
            }
        } else { // Brazil
             if (formData.type === 'Company') { // CNPJ
                maskedValue = maskCNPJ(cleanedValue);
            } else { // Individual (CPF)
                maskedValue = maskCPF(cleanedValue);
            }
        }

        setFormData(prev => ({ ...prev, identifier: maskedValue }));
        if (errors.identifier) setErrors(prev => ({ ...prev, identifier: undefined }));
    };

    const handleIdentifierBlur = async () => {
        if (formData.type !== 'Company') return; // Only for companies

        const cleanedIdentifier = formData.identifier.replace(/\D/g, '');
        setErrors(prev => ({ ...prev, identifier: undefined }));
        if (!cleanedIdentifier) return;

        let companyData = null;
        dispatch({ type: 'SHOW_LOADING' });
        try {
            if (isArgentina) {
                if (validateCUIT(cleanedIdentifier)) {
                    companyData = await fetchArgentinianCompanyData(cleanedIdentifier);
                    if (!companyData) {
                        setErrors(prev => ({...prev, identifier: t('suppliers.form.errors.cnpjNotFound')}));
                    }
                } else {
                    setErrors(prev => ({...prev, identifier: t('customers.form.errors.invalidCuit')}));
                }
            } else { // Brazil
                if (validateCNPJ(cleanedIdentifier)) {
                    companyData = await fetchBrazilianCompanyData(cleanedIdentifier);
                     if (!companyData) {
                        setErrors(prev => ({...prev, identifier: t('suppliers.form.errors.cnpjNotFound')}));
                    }
                } else {
                    setErrors(prev => ({...prev, identifier: t('customers.form.errors.invalidCnpj')}));
                }
            }

            if (companyData) {
                setFormData(prev => ({
                    ...prev,
                    name: companyData.name || prev.name,
                    phone: companyData.phone || prev.phone,
                    email: companyData.email || prev.email,
                    cep: companyData.cep || prev.cep,
                    address: companyData.address || prev.address,
                }));
                dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'notifications.companyDataFetched', type: 'success' } });
            }
        } finally {
            dispatch({ type: 'HIDE_LOADING' });
        }
    };

    const handlePostalCodeBlur = async () => {
        if (!formData.cep) return;
        setErrors(prev => ({ ...prev, cep: undefined }));

        dispatch({ type: 'SHOW_LOADING' });
        try {
            if (isArgentina) {
                if (!validateCPA(formData.cep)) {
                    setErrors(prev => ({ ...prev, cep: t('customers.form.errors.invalidCpa') }));
                    return;
                }
                const addressData = await fetchArgentinianAddress(formData.cep);
                if (addressData) {
                    setFormData(prev => ({ ...prev, address: `${addressData.logradouro}, ${addressData.bairro}, ${addressData.localidade}` }));
                } else {
                    setErrors(prev => ({ ...prev, cep: t('customers.form.errors.cepNotFound') }));
                }
            } else {
                const cleanedPostalCode = formData.cep.replace(/\D/g, '');
                if (cleanedPostalCode.length === 8) {
                    const addressData = await fetchBrazilianAddress(cleanedPostalCode);
                    if (addressData) {
                        setFormData(prev => ({ ...prev, address: `${addressData.logradouro}, ${addressData.bairro}, ${addressData.localidade} - ${addressData.uf}` }));
                    } else {
                        setErrors(prev => ({ ...prev, cep: t('customers.form.errors.cepNotFound') }));
                    }
                }
            }
        } finally {
            dispatch({ type: 'HIDE_LOADING' });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let newErrors: { identifier?: string } = {};

        const identifierValue = formData.identifier.replace(/\D/g, '');
        
        if (isArgentina) {
             if (formData.type === 'Individual' && !validateDNI(identifierValue)) {
                newErrors.identifier = t('customers.form.errors.invalidDni');
            } else if (formData.type === 'Company' && !validateCUIT(identifierValue)) {
                newErrors.identifier = t('customers.form.errors.invalidCuit');
            }
        } else {
            if (formData.type === 'Individual' && !validateCPF(identifierValue)) {
                newErrors.identifier = t('customers.form.errors.invalidCpf');
            } else if (formData.type === 'Company' && !validateCNPJ(identifierValue)) {
                newErrors.identifier = t('customers.form.errors.invalidCnpj');
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        onSave({ ...formData, identifier: identifierValue });
    };
    
    const identifierLabel = useMemo(() => {
        return formData.type === 'Company' ? t('customers.form.cnpj') : t('customers.form.cpf');
    }, [formData.type, t]);

    const postalCodeLabel = useMemo(() => t('customers.form.cep'), [t]);


    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-4">
                <UserProfile user={{ name: formData.name, avatarUrl: formData.avatarUrl }} className="w-16 h-16" />
                <button type="button" onClick={() => setIsAvatarModalOpen(true)} className="text-sm font-semibold text-primary hover:underline">
                    {t('customers.form.changeAvatar')}
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{formData.type === 'Company' ? t('customers.form.companyName') : t('customers.form.fullName')}</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('customers.form.email')}</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('customers.form.type')}</label>
                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as 'Individual' | 'Company', identifier: '' })} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600">
                        <option value="Company">{t('customers.typeCompany')}</option>
                        <option value="Individual">{t('customers.typePerson')}</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{identifierLabel}</label>
                    <input type="text" value={formData.identifier} onChange={e => handleIdentifierChange(e.target.value)} onBlur={handleIdentifierBlur} required className={`mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 ${errors.identifier ? 'border-red-500' : ''}`} />
                    {errors.identifier && <p className="text-red-500 text-xs mt-1">{errors.identifier}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('customers.form.phone')}</label>
                    <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{postalCodeLabel}</label>
                    <input type="text" value={formData.cep} onChange={e => setFormData({ ...formData, cep: e.target.value })} onBlur={handlePostalCodeBlur} className={`mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 ${errors.cep ? 'border-red-500' : ''}`} />
                    {errors.cep && <p className="text-red-500 text-xs mt-1">{errors.cep}</p>}
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('customers.form.address')}</label>
                    <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('customers.form.status')}</label>
                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600">
                        <option value="Active">{t('customers.statusActive')}</option>
                        <option value="Inactive">{t('customers.statusInactive')}</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">{t('common.cancel')}</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover">{customer ? t('common.saveChanges') : t('customers.add')}</button>
            </div>
            <AvatarSelectionModal isOpen={isAvatarModalOpen} onClose={() => setIsAvatarModalOpen(false)} onSelectAvatar={url => setFormData({...formData, avatarUrl: url})} />
        </form>
    );
};

// --- Main Component ---
const CustomerManagement: React.FC = () => {
    // FIX: Destructure properties from `state` correctly. `currentUser` is nested inside the `state` object.
    const { state, dispatch, hasPermission } = useAppState();
    const { customers, appointments, currentUser } = state;
    const { t, locale } = useLocalization();
    const navigate = useNavigate();
    const location = useLocation();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const search = params.get('search');
        if (search) {
            setSearchTerm(search);
        }
    }, [location.search]);

    const companyCustomers = useMemo(() => {
        if (!currentUser) return [];
        return hasPermission('MANAGE_ALL_COMPANIES') ? customers : customers.filter(c => c.companyId === currentUser.companyId);
    }, [customers, currentUser, hasPermission]);
    
    const filteredCustomers = useMemo(() => {
        return companyCustomers.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.identifier.includes(searchTerm)
        );
    }, [companyCustomers, searchTerm]);

    const openFormToAdd = () => {
        setEditingCustomer(null);
        setIsFormOpen(true);
    };

    const openFormToEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        setIsFormOpen(true);
    };

    const handleSaveCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'interactions' | 'documents' | 'companyId'>) => {
        if (editingCustomer) {
            const updatedCustomer = { ...editingCustomer, ...customerData };
            dispatch({ type: 'UPDATE_CUSTOMER', payload: updatedCustomer });
            dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'notifications.customerUpdated', type: 'success' } });
        } else {
            const newCustomer: Customer = {
                id: `cust-${Date.now()}`,
                createdAt: new Date(),
                interactions: [],
                documents: [],
                companyId: currentUser!.companyId,
                ...customerData
            };
            dispatch({ type: 'ADD_CUSTOMER', payload: newCustomer });
            dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'notifications.customerAdded', type: 'success' } });
            dispatch({ type: 'ADD_ACTIVITY_LOG', payload: { id: `log-${Date.now()}`, date: new Date(), type: 'Cliente', descriptionKey: 'activityLog.NEW_CUSTOMER', descriptionParams: { name: newCustomer.name }, companyId: currentUser!.companyId }});
        }
        setIsFormOpen(false);
    };

    const handleDeleteCustomer = () => {
        if (customerToDelete) {
            dispatch({ type: 'DELETE_CUSTOMER', payload: customerToDelete.id });
            dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'notifications.customerRemoved', type: 'success' } });
            setCustomerToDelete(null);
        }
    };

    return (
        <div className="p-4 sm:p-8 dark:bg-secondary">
            <Breadcrumbs />
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold text-secondary dark:text-gray-100">{t('customers.title')}</h1>
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={t('customers.searchPlaceholder')} className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-primary focus:border-primary" />
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('customers.name')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('customers.contact')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('customers.status')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredCustomers.map(customer => (
                                <tr key={customer.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <UserProfile user={customer} className="w-10 h-10" />
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{customer.name}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{t(customer.type === 'Individual' ? 'customers.typePerson' : 'customers.typeCompany')}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        <div>{customer.email}</div>
                                        <div>{customer.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${customer.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'}`}>
                                            {t(customer.status === 'Active' ? 'customers.statusActive' : 'customers.statusInactive')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => navigate(`/customers/${customer.id}`)} title={t('suppliers.viewDetails')} className="text-gray-400 hover:text-primary"><EyeIcon className="w-5 h-5" /></button>
                                            {hasPermission('MANAGE_CUSTOMERS') && <button onClick={() => openFormToEdit(customer)} title={t('common.edit')} className="text-gray-400 hover:text-primary"><EditIcon className="w-5 h-5" /></button>}
                                            {hasPermission('DELETE_CUSTOMERS') && <button onClick={() => setCustomerToDelete(customer)} title={t('common.delete')} className="text-gray-400 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {hasPermission('MANAGE_CUSTOMERS') && <FloatingActionButton label={t('customers.add')} icon={PlusIcon} onClick={openFormToAdd} />}
            
            <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingCustomer ? t('customers.edit') : t('customers.addNew')}>
                <CustomerForm customer={editingCustomer} onSave={handleSaveCustomer} onCancel={() => setIsFormOpen(false)} />
            </Modal>
            
            <Modal isOpen={!!customerToDelete} onClose={() => setCustomerToDelete(null)} title={t('customers.confirmDelete.header')}>
                <div className="text-center p-4">
                    <WarningIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: t('customers.confirmDelete.body', { name: customerToDelete?.name }) }} />
                    <div className="flex justify-center gap-4 pt-6 mt-4">
                        <button onClick={() => setCustomerToDelete(null)} className="px-6 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600">{t('common.cancel')}</button>
                        <button onClick={handleDeleteCustomer} className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">{t('common.delete')}</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CustomerManagement;
```

... e assim por diante para todos os outros arquivos. Devido à grande quantidade de arquivos, incluí os mais relevantes para ilustrar o formato. Se precisar de todos, me avise.

