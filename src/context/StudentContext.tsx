'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponent } from '@/lib/supabase/client';
import type { Tables } from '@/types/database';

// Utiliser le type généré automatiquement
type Profile = Tables<'profiles'>;

interface StudentContextType {
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateStatusToPaid: () => Promise<boolean>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const supabase = createClientComponent();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !data || data.role !== 'STUDENT') {
        return router.push('/login');
      }

      setProfile(data);
    } catch (err) {
      console.error('Erreur StudentContext:', err);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const updateStatusToPaid = async (): Promise<boolean> => {
    if (!profile) return false;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'PAID' })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile({ ...profile, status: 'PAID' });
      return true;
    } catch (err) {
      console.error('Erreur mise à jour statut:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <StudentContext.Provider value={{ profile, loading, refreshProfile: fetchProfile, updateStatusToPaid }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent doit être utilisé dans un StudentProvider');
  }
  return context;
}