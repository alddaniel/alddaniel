// FIX: Removed the unresolved reference to "vite/client" which was causing a type error.
// The necessary types for `import.meta.env` are defined below.

// FIX: Explicitly define the shape of import.meta.env to resolve TypeScript errors
// in services/supabaseClient.ts and fix the issue with vite/client types not being found.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
