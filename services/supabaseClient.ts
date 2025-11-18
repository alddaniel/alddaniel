import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Safe access to environment variables to prevent "Cannot read properties of undefined"
const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : ({} as any);

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

if (!isSupabaseConfigured) {
  console.warn(
    "Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are missing. " +
    "The application requires these to function correctly."
  );
}

// Initialize the Supabase client.
// We provide placeholder values if the environment variables are missing to prevent
// the `createClient` function from throwing an error during initialization.
// The `isSupabaseConfigured` flag should be used to gate actual API calls.
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);