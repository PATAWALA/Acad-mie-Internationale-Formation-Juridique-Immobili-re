import { createServerSupabase } from '@/lib/supabase/server';
import { AdminUsersList } from '@/components/dashboard/admin/AdminUsersList'; // nouveau composant

export default async function AdminUsersPage() {
  const supabase = await createServerSupabase();
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div style={{ padding: '24px', color: '#fff' }}>
      <h1 style={{ fontSize: '22px', marginBottom: '20px' }}>👥 Gestion des utilisateurs</h1>
      <AdminUsersList users={users || []} />
    </div>
  );
}