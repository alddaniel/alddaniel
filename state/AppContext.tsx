import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { Customer, Supplier, Appointment, Company, User, ActivityLog, UserRole, ActivityType, AppointmentStatus, Attachment, RecurrenceRule, Interaction, AppointmentHistory, Permission } from '../types';
import { MOCK_CUSTOMERS, MOCK_SUPPLIERS, MOCK_APPOINTMENTS, MOCK_COMPANIES, MOCK_USERS, MOCK_ACTIVITY_LOG, APPOINTMENT_CATEGORY_CONFIG, COLLABORATOR_PERMISSIONS, MANAGER_PERMISSIONS, ADMIN_PERMISSIONS } from '../constants';

// --- STATE SHAPE ---
interface AppState {
    customers: Customer[];
    suppliers: Supplier[];
    appointments: Appointment[];
    companies: Company[];
    users: User[];
    activityLog: ActivityLog[];
    appointmentCategoryConfig: { [key: string]: { icon: string; color: string; } };
    currentUser: User | null;
    notification: { messageKey: string; messageParams?: any; type: 'success' | 'info' } | null;
    theme: 'light' | 'dark';
    remindersShown: string[];
}

// --- INITIAL STATE ---
const initialState: AppState = {
    customers: MOCK_CUSTOMERS,
    suppliers: MOCK_SUPPLIERS,
    appointments: MOCK_APPOINTMENTS,
    companies: MOCK_COMPANIES,
    users: MOCK_USERS,
    activityLog: MOCK_ACTIVITY_LOG,
    appointmentCategoryConfig: APPOINTMENT_CATEGORY_CONFIG,
    currentUser: null,
    notification: null,
    theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
    remindersShown: [],
};

// --- ACTION TYPES ---
type Action =
    | { type: 'LOGIN'; payload: { user: User } }
    | { type: 'LOGOUT' }
    | { type: 'TOGGLE_THEME' }
    | { type: 'ADD_COMPANY'; payload: Omit<Company, 'id'> }
    | { type: 'UPDATE_COMPANY'; payload: { company: Company, description: string } }
    | { type: 'DELETE_COMPANY'; payload: string }
    | { type: 'ADD_USER'; payload: Omit<User, 'id' | 'permissions'> }
    | { type: 'UPDATE_USER'; payload: { user: User, description: string } }
    | { type: 'UPDATE_USER_PERMISSIONS'; payload: { userId: string; permissions: Permission[] } }
    | { type: 'ADD_CUSTOMER'; payload: Omit<Customer, 'id' | 'createdAt' | 'interactions' | 'documents' | 'companyId' | 'permissions'> }
    | { type: 'UPDATE_CUSTOMER'; payload: Customer }
    | { type: 'DELETE_CUSTOMER'; payload: string }
    | { type: 'ADD_SUPPLIER'; payload: Omit<Supplier, 'id' | 'companyId'> }
    | { type: 'UPDATE_SUPPLIER'; payload: Supplier }
    | { type: 'DELETE_SUPPLIER'; payload: string }
    | { type: 'ADD_APPOINTMENT'; payload: Omit<Appointment, 'id' | 'participants' | 'companyId' | 'status' | 'dueDate' | 'reminder'> & { participantIds: string[], notify: boolean; recurrenceRule?: RecurrenceRule; attachments?: Attachment[]; dueDate?: Date; reminder?: number; } }
    | { type: 'UPDATE_APPOINTMENT'; payload: Appointment }
    | { type: 'SHOW_NOTIFICATION'; payload: { messageKey: string, messageParams?: any, type: 'success' | 'info' } }
    | { type: 'HIDE_NOTIFICATION' }
    | { type: 'UPDATE_CATEGORY_CONFIG', payload: any }
    | { type: 'ADD_INTERACTION'; payload: { customerId: string; notes: string; type: Interaction['type'] } }
    | { type: 'MARK_REMINDER_SHOWN'; payload: string };


// --- REDUCER ---
const appReducer = (state: AppState, action: Action): AppState => {
    const addActivityLog = (type: ActivityType, descriptionKey: string, descriptionParams?: { [key: string]: string | number }): ActivityLog[] => {
        const newLog: ActivityLog = {
            id: `log-${Date.now()}`,
            date: new Date(),
            type,
            descriptionKey,
            descriptionParams,
            companyId: state.currentUser!.companyId,
        };
        return [newLog, ...state.activityLog];
    };

    switch (action.type) {
        case 'LOGIN':
            return { ...state, currentUser: action.payload.user };
        case 'LOGOUT':
            return { ...state, currentUser: null };

        case 'TOGGLE_THEME': {
            const newTheme = state.theme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            return { ...state, theme: newTheme };
        }

        case 'ADD_COMPANY': {
            const newCompany: Company = { id: `company-${Date.now()}`, ...action.payload };
            return {
                ...state,
                companies: [...state.companies, newCompany],
                activityLog: addActivityLog('Empresa', 'activityLog.NEW_COMPANY', { name: newCompany.name }),
            };
        }
        case 'UPDATE_COMPANY':
            return {
                ...state,
                companies: state.companies.map(c => c.id === action.payload.company.id ? action.payload.company : c),
                activityLog: addActivityLog('Empresa', 'activityLog.UPDATE_COMPANY', { description: action.payload.description }),
            };
        case 'DELETE_COMPANY': {
            const companyToDelete = state.companies.find(c => c.id === action.payload);
            if (!companyToDelete) return state;
            return {
                ...state,
                companies: state.companies.filter(c => c.id !== action.payload),
                users: state.users.filter(u => u.companyId !== action.payload),
                customers: state.customers.filter(c => c.companyId !== action.payload),
                suppliers: state.suppliers.filter(s => s.companyId !== action.payload),
                appointments: state.appointments.filter(a => a.companyId !== action.payload),
                activityLog: addActivityLog('Empresa', 'activityLog.DELETE_COMPANY', { name: companyToDelete.name }),
            };
        }

        case 'ADD_USER': {
            const rolePermissions = {
                [UserRole.COLLABORATOR]: COLLABORATOR_PERMISSIONS,
                [UserRole.MANAGER]: MANAGER_PERMISSIONS,
                [UserRole.ADMIN]: ADMIN_PERMISSIONS,
            };
            const newUser: User = {
                id: `user-${Date.now()}`,
                ...action.payload,
                permissions: rolePermissions[action.payload.role] || COLLABORATOR_PERMISSIONS,
            };
             if (!newUser.avatarUrl) {
                newUser.avatarUrl = `https://i.pravatar.cc/150?u=${newUser.email}`;
            }
            return {
                ...state,
                users: [...state.users, newUser],
                activityLog: addActivityLog('Usuário', 'activityLog.NEW_USER', { name: newUser.name }),
            };
        }
        case 'UPDATE_USER':
            return {
                ...state,
                users: state.users.map(u => u.id === action.payload.user.id ? action.payload.user : u),
                activityLog: addActivityLog('Usuário', 'activityLog.UPDATE_USER', { description: action.payload.description }),
            };

        case 'UPDATE_USER_PERMISSIONS': {
            const { userId, permissions } = action.payload;
            return {
                ...state,
                users: state.users.map(u => (u.id === userId ? { ...u, permissions } : u)),
                activityLog: addActivityLog(
                    'Usuário',
                    'activityLog.UPDATE_USER_PERMISSIONS',
                    { name: state.users.find(u => u.id === userId)?.name || '' }
                ),
            };
        }

        case 'ADD_CUSTOMER': {
            const newCustomer: Customer = {
                id: `cust-${Date.now()}`,
                ...action.payload,
                createdAt: new Date(),
                interactions: [],
                documents: [],
                companyId: state.currentUser!.companyId
            };
            return {
                ...state,
                customers: [...state.customers, newCustomer],
                activityLog: addActivityLog('Cliente', 'activityLog.NEW_CUSTOMER', { name: newCustomer.name }),
            };
        }
        case 'UPDATE_CUSTOMER': {
            const updatedCustomer = action.payload;
            return {
                ...state,
                customers: state.customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c),
                activityLog: addActivityLog('Cliente', 'activityLog.UPDATE_CUSTOMER', { name: updatedCustomer.name }),
            };
        }
        case 'DELETE_CUSTOMER': {
             const customerToDelete = state.customers.find(c => c.id === action.payload);
             if (!customerToDelete) return state;
            return {
                ...state,
                customers: state.customers.filter(c => c.id !== action.payload),
                activityLog: addActivityLog('Cliente', 'activityLog.DELETE_CUSTOMER', { name: customerToDelete.name }),
            };
        }

        case 'ADD_SUPPLIER': {
            const newSupplier: Supplier = { id: `sup-${Date.now()}`, ...action.payload, companyId: state.currentUser!.companyId };
            return {
                ...state,
                suppliers: [...state.suppliers, newSupplier],
                activityLog: addActivityLog('Fornecedor', 'activityLog.NEW_SUPPLIER', { name: newSupplier.name }),
            };
        }
        case 'UPDATE_SUPPLIER': {
             const updatedSupplier = action.payload;
            return {
                ...state,
                suppliers: state.suppliers.map(s => s.id === updatedSupplier.id ? updatedSupplier : s),
                activityLog: addActivityLog('Fornecedor', 'activityLog.UPDATE_SUPPLIER', { name: updatedSupplier.name }),
            };
        }
        case 'DELETE_SUPPLIER': {
            const supplierToDelete = state.suppliers.find(s => s.id === action.payload);
            if (!supplierToDelete) return state;
            return {
                ...state,
                suppliers: state.suppliers.filter(s => s.id !== action.payload),
                activityLog: addActivityLog('Fornecedor', 'activityLog.DELETE_SUPPLIER', { name: supplierToDelete.name }),
            };
        }

        case 'ADD_APPOINTMENT': {
            const appointmentData = action.payload;
            const participants: (User | Customer | Supplier)[] = [];
            appointmentData.participantIds.forEach(id => {
                const user = state.users.find(u => u.id === id); if (user) participants.push(user);
            });
            if (appointmentData.customerId) {
                const customer = state.customers.find(c => c.id === appointmentData.customerId); if (customer) participants.push(customer);
            }
            if (appointmentData.supplierId) {
                const supplier = state.suppliers.find(s => s.id === appointmentData.supplierId); if (supplier) participants.push(supplier);
            }
            if (!participants.some(p => p.id === state.currentUser!.id)) {
                participants.push(state.currentUser!);
            }

            if (appointmentData.recurrenceRule) {
                const { recurrenceRule, start, end } = appointmentData;
                const appointmentsToAdd: Appointment[] = [];
                let currentDate = new Date(start);
                const untilDate = new Date(recurrenceRule.until);
                untilDate.setHours(23, 59, 59, 999);
                const duration = end.getTime() - start.getTime();

                while (currentDate <= untilDate) {
                    const occurrenceEnd = new Date(currentDate.getTime() + duration);
                    const newAppointment: Appointment = {
                        id: `app-${Date.now()}-${appointmentsToAdd.length}`, ...appointmentData, start: new Date(currentDate), end: occurrenceEnd, status: AppointmentStatus.SCHEDULED, participants, companyId: state.currentUser!.companyId,
                    };
                    appointmentsToAdd.push(newAppointment);
                    switch (recurrenceRule.frequency) {
                        case 'daily': currentDate.setDate(currentDate.getDate() + 1); break;
                        case 'weekly': currentDate.setDate(currentDate.getDate() + 7); break;
                        case 'monthly': currentDate.setMonth(currentDate.getMonth() + 1); break;
                        case 'yearly': currentDate.setFullYear(currentDate.getFullYear() + 1); break;
                    }
                }
                return {
                    ...state,
                    appointments: [...state.appointments, ...appointmentsToAdd],
                    activityLog: addActivityLog('Compromisso', 'activityLog.NEW_APPOINTMENT_SERIES', { title: appointmentData.title }),
                };
            } else {
                const newAppointment: Appointment = {
                    id: `app-${Date.now()}`, ...appointmentData, status: AppointmentStatus.SCHEDULED, participants, companyId: state.currentUser!.companyId,
                };
                return {
                    ...state,
                    appointments: [...state.appointments, newAppointment],
                    activityLog: addActivityLog('Compromisso', 'activityLog.NEW_APPOINTMENT', { title: newAppointment.title }),
                };
            }
        }
       case 'UPDATE_APPOINTMENT': {
            const updatedAppointment = action.payload;
            const originalAppointment = state.appointments.find(app => app.id === updatedAppointment.id);

            if (originalAppointment && state.currentUser) {
                const hasChanged = originalAppointment.title !== updatedAppointment.title ||
                                originalAppointment.start.getTime() !== updatedAppointment.start.getTime() ||
                                originalAppointment.end.getTime() !== updatedAppointment.end.getTime();

                if (hasChanged) {
                    const historyEntry: AppointmentHistory = {
                        modifiedAt: new Date(),
                        modifiedById: state.currentUser.id,
                        previousState: {
                            title: originalAppointment.title,
                            start: originalAppointment.start,
                            end: originalAppointment.end,
                        },
                    };
                    updatedAppointment.history = [historyEntry, ...(originalAppointment.history || [])];
                } else {
                    updatedAppointment.history = originalAppointment.history;
                }
            }

            const getChangeDescription = () => {
                if (!originalAppointment) return `Compromisso "${updatedAppointment.title}" foi atualizado.`;
                const changes: string[] = [];
                if (originalAppointment.title !== updatedAppointment.title) changes.push('título');
                if (originalAppointment.start.getTime() !== updatedAppointment.start.getTime()) changes.push('data/hora de início');
                if (originalAppointment.end.getTime() !== updatedAppointment.end.getTime()) changes.push('data/hora de fim');
                if (originalAppointment.status !== updatedAppointment.status) changes.push(`status para "${updatedAppointment.status}"`);

                if (changes.length > 0) {
                    return `Compromisso "${updatedAppointment.title}" teve seu(s) ${changes.join(', ')} atualizado(s).`;
                }
                return `Compromisso "${updatedAppointment.title}" foi atualizado.`;
            };

            return {
                ...state,
                appointments: state.appointments.map(app => app.id === updatedAppointment.id ? updatedAppointment : app),
                activityLog: addActivityLog('Compromisso', 'activityLog.UPDATE_APPOINTMENT', { description: getChangeDescription() }),
            };
        }

        case 'UPDATE_CATEGORY_CONFIG':
            return { ...state, appointmentCategoryConfig: action.payload };

        case 'SHOW_NOTIFICATION':
            return { ...state, notification: action.payload };
        case 'HIDE_NOTIFICATION':
            return { ...state, notification: null };

        case 'ADD_INTERACTION': {
            const { customerId, notes, type } = action.payload;
            const targetCustomer = state.customers.find(c => c.id === customerId);
            if (!targetCustomer || !state.currentUser) return state;

            const newInteraction: Interaction = {
                id: `int-${Date.now()}`,
                date: new Date(),
                notes,
                type,
                userId: state.currentUser.id,
            };
            const updatedCustomer = {
                 ...targetCustomer,
                 interactions: [newInteraction, ...targetCustomer.interactions],
            };

            return {
                ...state,
                customers: state.customers.map(c =>
                    c.id === customerId ? updatedCustomer : c
                ),
                activityLog: addActivityLog('Cliente', 'activityLog.NEW_INTERACTION', { type: type, name: targetCustomer.name }),
            };
        }

        case 'MARK_REMINDER_SHOWN':
            if (state.remindersShown.includes(action.payload)) {
                return state;
            }
            return {
                ...state,
                remindersShown: [...state.remindersShown, action.payload],
            };

        default:
            return state;
    }
};

// --- CONTEXT & PROVIDER ---
interface AppContextValue {
    state: AppState;
    dispatch: React.Dispatch<Action>;
    hasPermission: (permission: Permission) => boolean;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const StateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    const hasPermission = (permission: Permission): boolean => {
        return state.currentUser?.permissions.includes(permission) ?? false;
    };

    return (
        <AppContext.Provider value={{ state, dispatch, hasPermission }}>
            {children}
        </AppContext.Provider>
    );
};

// --- CUSTOM HOOK ---
export const useAppState = (): AppContextValue => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppState must be used within a StateProvider');
    }
    return context;
};