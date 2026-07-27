import { createServerSupabase } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import StudentDashboardClient from './StudentDashboardClient';

export default async function StudentDashboardPage() {
  const supabase = await createServerSupabase();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('*, certificates(*)')
    .eq('student_id', user.id);

  return <StudentDashboardClient enrollments={enrollments || []} />;
}