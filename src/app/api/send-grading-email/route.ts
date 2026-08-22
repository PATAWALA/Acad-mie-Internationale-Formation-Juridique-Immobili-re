import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { sendGradingEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { submissionId } = await request.json();

    if (!submissionId) {
      return NextResponse.json({ error: 'Paramètre manquant' }, { status: 400 });
    }

    const supabase = await createServerSupabase();

    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .select('assessment_id, student_id, grade, feedback, status')
      .eq('id', submissionId)
      .single();

    if (submissionError || !submission) {
      console.error('Soumission non trouvée:', submissionError);
      return NextResponse.json({ error: 'Soumission introuvable' }, { status: 404 });
    }

    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('course_id, title, type, max_score, module_id')
      .eq('id', submission.assessment_id)
      .single();

    if (assessmentError || !assessment) {
      console.error('Assessment non trouvé:', assessmentError);
      return NextResponse.json({ error: 'Assessment introuvable' }, { status: 404 });
    }

    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('certificate_id')
      .eq('id', assessment.course_id)
      .single();

    if (courseError || !course) {
      console.error('Course non trouvé:', courseError);
      return NextResponse.json({ error: 'Course introuvable' }, { status: 404 });
    }

    const { data: certificate } = await supabase
      .from('certificates')
      .select('title')
      .eq('id', course.certificate_id)
      .single();

    const formationTitle = certificate?.title || `Formation #${course.certificate_id}`;

    const { data: student } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', submission.student_id)
      .single();

    if (!student?.email) {
      return NextResponse.json({ message: 'Email étudiant introuvable' });
    }

    const sent = await sendGradingEmail({
      to: student.email,
      studentName: student.full_name || 'Étudiant',
      formationTitle,
      moduleTitle: assessment.title,
      grade: submission.grade ?? 0,
      maxScore: assessment.max_score ?? 20,
      status: submission.status as 'PASSED' | 'FAILED',
      feedback: submission.feedback || undefined,
    });

    if (sent) {
      return NextResponse.json({ success: true });
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