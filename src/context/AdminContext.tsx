'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClientComponent } from '@/lib/supabase/client';

interface AdminContextType {
  users: any[];
  loading: boolean;
  validatePayment: (userId: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const supabase = createClientComponent();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  };

  const validatePayment = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'PAID' })
      .eq('id', userId);

    if (!error) {
      await fetchUsers(); // rafraîchir la liste
    } else {
      alert('Erreur : ' + error.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <AdminContext.Provider value={{ users, loading, validatePayment, refreshUsers: fetchUsers }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within AdminProvider');
  return context;
}