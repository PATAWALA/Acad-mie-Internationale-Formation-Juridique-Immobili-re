'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClientComponent } from '@/lib/supabase/client';

interface AdminContextType {
  users: any[];
  loading: boolean;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  validatePayment: (userId: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const supabase = createClientComponent();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false); // ← ajouté

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
      await fetchUsers();
    } else {
      alert('Erreur : ' + error.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <AdminContext.Provider value={{ users, loading, collapsed, setCollapsed, validatePayment, refreshUsers: fetchUsers }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within AdminProvider');
  return context;
}