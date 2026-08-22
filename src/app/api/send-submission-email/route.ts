import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { sendSubmissionEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { assessmentId, submissionUrl, studentId } = await request.json();

    if (!assessmentId || !studentId) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    const supabase = await createServerSupabase();

    // 1. Récupérer l'évaluation
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('course_id, title, type, module_id')
      .eq('id', assessmentId)
      .single();

    if (assessmentError || !assessment) {
      console.error('Assessment non trouvé:', assessmentError);
      return NextResponse.json({ error: 'Assessment introuvable' }, { status: 404 });
    }

    // 2. Récupérer le cours
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('certificate_id')
      .eq('id', assessment.course_id)
      .single();

    if (courseError || !course) {
      console.error('Course non trouvé:', courseError);
      return NextResponse.json({ error: 'Course introuvable' }, { status: 404 });
    }

    // 3. Récupérer les formateurs assignés à ce certificat
    const { data: teachers, error: teachersError } = await supabase
      .from('certificate_teachers')
      .select('teacher_id')
      .eq('certificate_id', course.certificate_id);

    if (teachersError) {
      console.error('Erreur récupération formateurs:', teachersError);
      return NextResponse.json({ error: 'Erreur formateurs' }, { status: 500 });
    }

    const teacherIds = (teachers || []).map((t: { teacher_id: string }) => t.teacher_id);

    if (teacherIds.length === 0) {
      return NextResponse.json({ message: 'Aucun formateur assigné' });
    }

    // 4. Récupérer les emails des formateurs
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('email')
      .in('id', teacherIds);

    if (profilesError) {
      console.error('Erreur emails formateurs:', profilesError);
      return NextResponse.json({ error: 'Erreur emails formateurs' }, { status: 500 });
    }

    const emails = (profiles || []).map((p: { email: string }) => p.email).filter(Boolean);

    if (emails.length === 0) {
      return NextResponse.json({ message: 'Aucun email formateur trouvé' });
    }

    // 5. Récupérer le nom de l'étudiant
    const { data: student } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', studentId)
      .single();

    const studentName = student?.full_name || 'Étudiant';

    // 6. Récupérer le titre de la formation
    const { data: certificate } = await supabase
      .from('certificates')
      .select('title')
      .eq('id', course.certificate_id)
      .single();

    const formationTitle = certificate?.title || `Formation #${course.certificate_id}`;

    // 7. Envoyer l'e-mail
    const sent = await sendSubmissionEmail({
      to: emails,
      studentName,
      formationTitle,
      moduleTitle: assessment.title,
      submissionUrl,
    });

    if (sent) {
      return NextResponse.json({ success: true, emailsSent: emails.length });
    } else {
      return NextResponse.json({ error: 'Échec envoi e-mail' }, { status: 500 });
    }
  } catch (error) {
    console.error('Erreur générale:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: (error as any).message },
      { status: 500 }
    );
  }
}