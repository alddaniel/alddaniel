import { supabase } from './supabaseClient';
import { Customer, Supplier, Appointment, User, Company, ActivityLog, Plan, UserRole, Permission, AppointmentStatus } from '../types';

// --- MAPPERS ---

const mapCompany = (row: any): Company => ({
    id: row.id,
    name: row.name,
    cnpj: row.cnpj,
    address: row.address,
    phone: row.phone,
    email: row.email,
    logoUrl: row.logo_url || '',
    cep: row.cep || '',
    status: row.status,
    trialEndsAt: row.trial_ends_at ? new Date(row.trial_ends_at) : null,
    history: row.history || [], // JSON column
    planId: row.plan_id || 'plan-1' // Default to basic plan if null
});

const mapUser = (row: any): User => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as UserRole,
    avatarUrl: row.avatar_url || undefined,
    companyId: row.company_id,
    gender: row.gender,
    permissions: (row.permissions as Permission[]) || [],
    status: row.status
});

const mapCustomer = (row: any): Customer => ({
    id: row.id,
    name: row.name,
    type: row.type,
    identifier: row.identifier,
    phone: row.phone,
    email: row.email,
    cep: row.cep,
    address: row.address,
    status: row.status,
    createdAt: new Date(row.created_at),
    companyId: row.company_id,
    avatarUrl: row.avatar_url || undefined,
    gender: row.gender,
    interactions: [], // Not in DB table yet, defaulting to empty
    documents: [] // Not in DB table yet, defaulting to empty
});

const mapSupplier = (row: any): Supplier => ({
    id: row.id,
    name: row.name,
    cnpj: row.cnpj,
    contactPerson: row.contact_person,
    phone: row.phone,
    email: row.email,
    services: row.services || [],
    companyId: row.company_id,
    logoUrl: row.logo_url || undefined,
    contactAvatarUrl: row.contact_avatar_url || undefined,
    cep: row.cep,
    address: row.address
});

const mapAppointment = (row: any, users: User[], customers: Customer[], suppliers: Supplier[]): Appointment => {
    const participants = [];
    
    // Map Users
    if (row.user_participant_ids) {
        row.user_participant_ids.forEach((uid: string) => {
            const u = users.find(user => user.id === uid);
            if (u) participants.push(u);
        });
    }
    // Map Customer
    if (row.customer_id) {
        const c = customers.find(cust => cust.id === row.customer_id);
        if (c) participants.push(c);
    }
    // Map Supplier
    if (row.supplier_id) {
        const s = suppliers.find(sup => sup.id === row.supplier_id);
        if (s) participants.push(s);
    }

    return {
        id: row.id,
        title: row.title,
        description: row.description,
        start: new Date(row.start_time),
        end: new Date(row.end_time),
        dueDate: row.due_date ? new Date(row.due_date) : undefined,
        location: row.location,
        participants: participants as any,
        status: row.status as AppointmentStatus,
        category: row.category,
        customerId: row.customer_id,
        supplierId: row.supplier_id,
        companyId: row.company_id,
        recurrenceRule: row.recurrence_rule ? {
            ...row.recurrence_rule,
            until: new Date(row.recurrence_rule.until)
        } : undefined,
        attachments: row.attachments || [],
        history: (row.history || []).map((h: any) => ({
            ...h,
            modifiedAt: new Date(h.modifiedAt),
            previousState: {
                ...h.previousState,
                start: new Date(h.previousState.start),
                end: new Date(h.previousState.end)
            }
        })),
        subtasks: row.subtasks || [],
        reminder: row.reminder
    };
};

const mapActivityLog = (row: any): ActivityLog => ({
    id: row.id,
    date: new Date(row.created_at),
    type: row.type,
    descriptionKey: row.description_key,
    descriptionParams: row.description_params,
    companyId: row.company_id
});

// --- DATA FETCHING ---

export const fetchInitialData = async (userCompanyId: string, isSuperAdmin: boolean) => {
    try {
        // Fetch in parallel
        const [
            companiesRes,
            usersRes,
            customersRes,
            suppliersRes,
            appointmentsRes,
            activityLogRes,
            plansRes
        ] = await Promise.all([
            supabase.from('companies').select('*'),
            supabase.from('users').select('*'),
            supabase.from('customers').select('*'),
            supabase.from('suppliers').select('*'),
            supabase.from('appointments').select('*'),
            supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(50),
            supabase.from('plans').select('*')
        ]);

        if (companiesRes.error) throw companiesRes.error;
        if (usersRes.error) throw usersRes.error;
        if (customersRes.error) throw customersRes.error;
        if (suppliersRes.error) throw suppliersRes.error;
        if (appointmentsRes.error) throw appointmentsRes.error;
        if (activityLogRes.error) throw activityLogRes.error;

        const plans: Plan[] = (plansRes.data || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            userLimit: p.user_limit,
            customerLimit: p.customer_limit,
            hasWhatsApp: p.has_whatsapp,
            hasAI: p.has_ai,
            allowBranding: p.allow_branding
        }));

        const companies = (companiesRes.data || []).map(mapCompany);
        const users = (usersRes.data || []).map(mapUser);
        const customers = (customersRes.data || []).map(mapCustomer);
        const suppliers = (suppliersRes.data || []).map(mapSupplier);
        const activityLog = (activityLogRes.data || []).map(mapActivityLog);
        
        const appointments = (appointmentsRes.data || []).map(row => 
            mapAppointment(row, users, customers, suppliers)
        );

        return {
            companies,
            users,
            customers,
            suppliers,
            appointments,
            activityLog,
            plans
        };

    } catch (error) {
        console.error("Error fetching initial data:", error);
        throw error;
    }
};

// --- PERSISTENCE HELPERS ---

export const db = {
    companies: {
        insert: async (company: Company) => {
            const { error } = await supabase.from('companies').insert({
                id: company.id,
                name: company.name,
                cnpj: company.cnpj,
                address: company.address,
                phone: company.phone,
                email: company.email,
                logo_url: company.logoUrl,
                cep: company.cep,
                status: company.status,
                plan_id: company.planId,
                trial_ends_at: company.trialEndsAt?.toISOString(),
                history: company.history
            });
            if (error) throw error;
        },
        update: async (company: Company) => {
            const { error } = await supabase.from('companies').update({
                name: company.name,
                cnpj: company.cnpj,
                address: company.address,
                phone: company.phone,
                email: company.email,
                logo_url: company.logoUrl,
                cep: company.cep,
                status: company.status,
                plan_id: company.planId,
                trial_ends_at: company.trialEndsAt?.toISOString(),
                history: company.history
            }).eq('id', company.id);
            if (error) throw error;
        },
        delete: async (id: string) => {
            const { error } = await supabase.from('companies').delete().eq('id', id);
            if (error) throw error;
        }
    },
    users: {
        update: async (user: User) => {
            const { error } = await supabase.from('users').update({
                name: user.name,
                email: user.email,
                role: user.role,
                avatar_url: user.avatarUrl,
                permissions: user.permissions,
                company_id: user.companyId
            }).eq('id', user.id);
            if (error) throw error;
        },
        updatePermissions: async (userId: string, permissions: Permission[]) => {
            const { error } = await supabase.from('users').update({ permissions }).eq('id', userId);
            if(error) throw error;
        }
    },
    customers: {
        insert: async (customer: Customer) => {
            const { error } = await supabase.from('customers').insert({
                id: customer.id,
                name: customer.name,
                type: customer.type,
                identifier: customer.identifier,
                phone: customer.phone,
                email: customer.email,
                cep: customer.cep,
                address: customer.address,
                status: customer.status,
                company_id: customer.companyId,
                avatar_url: customer.avatarUrl,
                gender: customer.gender
            });
            if (error) throw error;
        },
        update: async (customer: Customer) => {
             const { error } = await supabase.from('customers').update({
                name: customer.name,
                phone: customer.phone,
                email: customer.email,
                cep: customer.cep,
                address: customer.address,
                status: customer.status,
                avatar_url: customer.avatarUrl
             }).eq('id', customer.id);
             if (error) throw error;
        },
        delete: async (id: string) => {
             const { error } = await supabase.from('customers').delete().eq('id', id);
             if (error) throw error;
        }
    },
    suppliers: {
        insert: async (supplier: Supplier) => {
            const { error } = await supabase.from('suppliers').insert({
                id: supplier.id,
                name: supplier.name,
                cnpj: supplier.cnpj,
                contact_person: supplier.contactPerson,
                phone: supplier.phone,
                email: supplier.email,
                services: supplier.services,
                company_id: supplier.companyId,
                logo_url: supplier.logoUrl,
                contact_avatar_url: supplier.contactAvatarUrl,
                cep: supplier.cep,
                address: supplier.address
            });
            if (error) throw error;
        },
        update: async (supplier: Supplier) => {
            const { error } = await supabase.from('suppliers').update({
                name: supplier.name,
                cnpj: supplier.cnpj,
                contact_person: supplier.contactPerson,
                phone: supplier.phone,
                email: supplier.email,
                services: supplier.services,
                logo_url: supplier.logoUrl,
                contact_avatar_url: supplier.contactAvatarUrl,
                cep: supplier.cep,
                address: supplier.address
            }).eq('id', supplier.id);
            if (error) throw error;
        },
        delete: async (id: string) => {
            const { error } = await supabase.from('suppliers').delete().eq('id', id);
            if (error) throw error;
        }
    },
    appointments: {
        insert: async (app: Appointment) => {
            const userParticipantIds = app.participants
                .filter(p => 'role' in p) // Check if user
                .map(p => p.id);

            const { error } = await supabase.from('appointments').insert({
                id: app.id,
                title: app.title,
                description: app.description,
                start_time: app.start.toISOString(),
                end_time: app.end.toISOString(),
                due_date: app.dueDate?.toISOString(),
                location: app.location,
                status: app.status,
                category: app.category,
                company_id: app.companyId,
                customer_id: app.customerId || null,
                supplier_id: app.supplierId || null,
                user_participant_ids: userParticipantIds,
                recurrence_rule: app.recurrenceRule as any,
                attachments: app.attachments as any,
                history: app.history as any,
                subtasks: app.subtasks as any,
                reminder: app.reminder
            });
            if (error) throw error;
        },
        update: async (app: Appointment) => {
            const userParticipantIds = app.participants
                .filter(p => 'role' in p)
                .map(p => p.id);

            const { error } = await supabase.from('appointments').update({
                title: app.title,
                description: app.description,
                start_time: app.start.toISOString(),
                end_time: app.end.toISOString(),
                due_date: app.dueDate?.toISOString(),
                location: app.location,
                status: app.status,
                category: app.category,
                customer_id: app.customerId || null,
                supplier_id: app.supplierId || null,
                user_participant_ids: userParticipantIds,
                recurrence_rule: app.recurrenceRule as any,
                attachments: app.attachments as any,
                history: app.history as any,
                subtasks: app.subtasks as any,
                reminder: app.reminder
            }).eq('id', app.id);
            if (error) throw error;
        }
    },
    activityLog: {
        insert: async (log: ActivityLog) => {
            const { error } = await supabase.from('activity_log').insert({
                id: log.id,
                created_at: log.date.toISOString(),
                type: log.type,
                description_key: log.descriptionKey,
                description_params: log.descriptionParams as any,
                company_id: log.companyId
            });
             if (error) console.error("Failed to log activity", error);
        }
    },
    plans: {
        insert: async (plan: Plan) => {
             const { error } = await supabase.from('plans').insert({
                 id: plan.id,
                 name: plan.name,
                 price: plan.price,
                 user_limit: plan.userLimit,
                 customer_limit: plan.customerLimit,
                 has_whatsapp: plan.hasWhatsApp,
                 has_ai: plan.hasAI,
                 allow_branding: plan.allowBranding
             });
             if (error) throw error;
        },
        update: async (plan: Plan) => {
             const { error } = await supabase.from('plans').update({
                 name: plan.name,
                 price: plan.price,
                 user_limit: plan.userLimit,
                 customer_limit: plan.customerLimit,
                 has_whatsapp: plan.hasWhatsApp,
                 has_ai: plan.hasAI,
                 allow_branding: plan.allowBranding
             }).eq('id', plan.id);
             if (error) throw error;
        },
        delete: async (id: string) => {
            const { error } = await supabase.from('plans').delete().eq('id', id);
            if(error) throw error;
        }
    }
};