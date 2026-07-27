import { createServerSupabase } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SuperAdminClient from './SuperAdminClient';

export default async function SuperAdminDashboardPage() {
  const supabase = await createServerSupabase();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Récupération des métriques
  const { count: totalStudents } = await supabase.from('profiles').select('*', { count: 'exact' }).eq('role', 'STUDENT');
  const { count: totalTeachers } = await supabase.from('profiles').select('*', { count: 'exact' }).eq('role', 'TEACHER');
  const { count: activeEnrollments } = await supabase.from('enrollments').select('*', { count: 'exact' }).eq('payment_status', 'PAID');
  const { count: pendingPayments } = await supabase.from('enrollments').select('*', { count: 'exact' }).eq('payment_status', 'PENDING');

  // Récupération des bourses en attente
  const { data: boursesPending } = await supabase
    .from('enrollments')
    .select('*, profiles(full_name, email), certificates(title, price_normal, price_bourse)')
    .eq('is_bourse', true)
    .eq('bourse_status', 'PENDING');

  // Récupération des formateurs
  const { data: teachers } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'TEACHER');

  return (
    <SuperAdminClient
      metrics={{
        totalStudents: totalStudents || 0,
        totalTeachers: totalTeachers || 0,
        activeEnrollments: activeEnrollments || 0,
        pendingPayments: pendingPayments || 0,
      }}
      boursesPending={boursesPending || []}
      teachers={teachers || []}
    />
  );
}