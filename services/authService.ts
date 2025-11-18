import { supabase, isSupabaseConfigured } from './supabaseClient';
import { User, UserRole, Permission } from '../types';
import { COLLABORATOR_PERMISSIONS, MANAGER_PERMISSIONS, ADMIN_PERMISSIONS } from '../constants';

/**
 * Fetches a user's profile from the public.users table in Supabase.
 */
export const getUserProfile = async (userId: string): Promise<User | null> => {
    if (!isSupabaseConfigured) return null;

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
    
    if (!data) return null;
    
    return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role as UserRole,
        avatarUrl: data.avatar_url || undefined,
        companyId: data.company_id,
        permissions: (data.permissions as any as Permission[]) || [],
        status: data.status as 'active' | 'pending'
    };
};

/**
 * Ensures a user profile exists in the database.
 */
export const getOrCreateUserProfile = async (authUser: any): Promise<User | null> => {
    if (!authUser || !authUser.id || !authUser.email) return null;

    // 1. Try to get existing profile
    const profile = await getUserProfile(authUser.id);
    if (profile) return profile;

    console.warn(`User ${authUser.id} authenticated but has no profile. Attempting to create one...`);

    // 2. Find a default company or create one (Fallbacks for safety)
    let companyId = 'company-1';
    const { data: companies } = await supabase.from('companies').select('id').limit(1);
    if (companies && companies.length > 0) {
        companyId = companies[0].id;
    }

    // 3. Create the user profile
    const newUserProfile = {
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.name || authUser.email.split('@')[0],
        role: 'ADMIN', // Default to Admin for new setups
        company_id: companyId,
        permissions: ADMIN_PERMISSIONS,
        status: 'active'
    };

    const { error: createError } = await supabase.from('users').insert(newUserProfile);

    if (createError) {
        console.error("Failed to create user profile:", createError);
        throw new Error("Failed to initialize account structure.");
    }

    return {
        id: newUserProfile.id,
        name: newUserProfile.name,
        email: newUserProfile.email,
        role: UserRole.ADMIN,
        companyId: newUserProfile.company_id,
        permissions: newUserProfile.permissions as Permission[],
        status: 'active'
    };
};

/**
 * Signs in a user using Supabase authentication.
 */
export const signIn = async (email: string, password: string): Promise<User> => {
    if (!isSupabaseConfigured) throw new Error('System not configured.');

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (signInError) throw new Error(signInError.message);
    if (!signInData.user) throw new Error('login.errors.invalidCredentials');

    const userProfile = await getOrCreateUserProfile(signInData.user);

    if (!userProfile) {
        await supabase.auth.signOut();
        throw new Error('User profile could not be loaded.');
    }

    if (userProfile.status === 'pending') {
        throw new Error('login.errors.pendingAccount');
    }

    return userProfile;
};

/**
 * Signs out the current user.
 */
export const signOut = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
};

/**
 * Creates a user record in the public table.
 * Note: This does not create a Supabase Auth user (requires invite flow or service key).
 * It creates a placeholder that allows the user to exist in the system logic.
 */
export const adminCreateUser = async (userData: Omit<User, 'id'>): Promise<User> => {
    const { data, error } = await supabase
        .from('users')
        .insert({
            id: crypto.randomUUID(), // Generate a temporary ID
            name: userData.name,
            email: userData.email,
            role: userData.role,
            company_id: userData.companyId,
            permissions: userData.permissions,
            status: 'pending',
            avatar_url: userData.avatarUrl
        })
        .select()
        .single();

    if (error) throw new Error(error.message);

    // Trigger password reset flow so they can "claim" this account if they sign up
    try {
        await sendPasswordResetEmail(userData.email);
    } catch (e) {
        console.warn("Could not send reset email:", e);
    }

    return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role as UserRole,
        companyId: data.company_id,
        avatarUrl: data.avatar_url || undefined,
        permissions: (data.permissions as any) || [],
        status: 'pending',
    };
};

export const sendPasswordResetEmail = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#type=recovery`,
    });
    if (error) throw error;
};

export const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
};