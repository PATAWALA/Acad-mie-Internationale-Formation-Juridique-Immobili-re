import { createClient } from '@supabase/supabase-js';

let clientInstance: ReturnType<typeof createClient> | null = null;

export const createClientComponent = () => {
  if (clientInstance) return clientInstance;
  clientInstance = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return clientInstance;
};