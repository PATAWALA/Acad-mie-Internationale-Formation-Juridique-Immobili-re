import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database'; // Ajuste le chemin si ton fichier est dans /types/database.ts

export const createClientComponent = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};