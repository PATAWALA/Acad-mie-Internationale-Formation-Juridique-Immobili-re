import { createServerSupabase as createServerComponent } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { GradingTable } from '@/components/dashboard/enseignant/GradingTable';

export default async function EnseignantDashboardPage() {
  const supabase = await createServerComponent();

  // 1. Authentification
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 2. Vérification du rôle
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'TEACHER' && profile?.role !== 'ADMIN' && profile?.role !== 'SUPER_ADMIN') {
    redirect('/dashboard/etudiant');
  }

  // 3. Récupération des soumissions de devoirs avec jointures
  const { data: submissions } = await supabase
    .from('submissions')
    .select(`
      id,
      submission_url,
      grade,
      feedback,
      status,
      created_at,
      student_id,
      assessment_id,
      profiles:student_id (full_name, email),
      assessments:assessment_id (title, course_id)
    `)
    .order('created_at', { ascending: false });

  return (
    <div style={{ padding: '32px', background: '#020617', minHeight: '100vh', color: '#fff' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Espace Enseignant - Correction des Devoirs</h1>
      <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
        Gestion des notes et des rendus d'examens/TPs des étudiants.
      </p>

      <GradingTable submissions={submissions || []} />
    </div>
  );
}