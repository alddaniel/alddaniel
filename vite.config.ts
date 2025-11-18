import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This allows the code to use `process.env.API_KEY` as required by the guidelines,
    // while sourcing the actual key from a Vercel environment variable `VITE_API_KEY`
    // which is the standard way to expose env vars to a Vite client build.
    'process.env.API_KEY': JSON.stringify(process.env.VITE_API_KEY || ''),
  },
});
