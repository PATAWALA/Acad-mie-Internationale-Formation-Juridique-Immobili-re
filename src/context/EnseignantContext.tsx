'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { createClientComponent } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface EnseignantContextType {
  profile: any;
  loading: boolean;
  assignedCertificates: any[];
  refreshAssignments: () => Promise<void>;
  refreshProfile: () => Promise<void>; // ← AJOUTÉ
}

const EnseignantContext = createContext<EnseignantContextType | undefined>(undefined);

export function EnseignantProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponent();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [assignedCertificates, setAssignedCertificates] = useState<any[]>([]);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (!prof || (prof.role !== 'TEACHER' && prof.role !== 'ADMIN')) {
      router.push('/dashboard/etudiant');
      return;
    }
    setProfile(prof);
    setLoading(false);
  };

  const loadAssignments = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('certificate_teachers')
      .select('certificate_id, certificates(title)')
      .eq('teacher_id', profile.id);
    setAssignedCertificates(data?.map((a: any) => ({ id: a.certificate_id, title: a.certificates?.title })) ?? []);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile) loadAssignments();
  }, [profile]);

  const refreshAssignments = async () => {
    await loadAssignments();
  };

  // Nouvelle fonction pour recharger le profil après modification
  const refreshProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (prof) setProfile(prof);
  };

  return (
    <EnseignantContext.Provider
      value={{ profile, loading, assignedCertificates, refreshAssignments, refreshProfile }}
    >
      {children}
    </EnseignantContext.Provider>
  );
}

export function useEnseignant() {
  const ctx = useContext(EnseignantContext);
  if (!ctx) throw new Error('useEnseignant must be used within EnseignantProvider');
  return ctx;
}