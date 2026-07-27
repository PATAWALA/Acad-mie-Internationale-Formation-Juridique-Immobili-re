import { createServerSupabase } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TeacherDashboardClient from './TeacherDashboardClient';

export default async function TeacherDashboardPage() {
  const supabase = await createServerSupabase();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Récupérer les classes attribuées à ce formateur
  const { data: classes } = await supabase
    .from('classes_teachers')
    .select('*, certificates(*)')
    .eq('teacher_id', user.id);

  return <TeacherDashboardClient classes={classes || []} userId={user.id} />;
}