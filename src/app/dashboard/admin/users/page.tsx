import { createServerSupabase } from '@/lib/supabase/server';
import { UserManagementTable } from '@/components/dashboard/admin/UserManagementTable';

export default async function AdminUsersPage() {
  const supabase = await createServerSupabase();
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div style={{ padding: '24px', color: '#fff' }}>
      <h1 style={{ fontSize: '22px', marginBottom: '20px' }}>👥 Gestion des utilisateurs</h1>
      <UserManagementTable users={users || []} />
    </div>
  );
}