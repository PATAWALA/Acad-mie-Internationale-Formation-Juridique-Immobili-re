// lib/student-progress.ts
import { createClientComponent } from '@/lib/supabase/client';

export async function getStudentProgress(certificateId: number, studentId: string) {
  const supabase = createClientComponent();

  // 1. Récupérer le cours de la formation
  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('certificate_id', certificateId)
    .single();

  if (!course) return null;

  // 2. Récupérer les modules du cours
  const { data: modules } = await supabase
    .from('modules')
    .select('id, title, week_number')
    .eq('course_id', course.id)
    .order('week_number');

  if (!modules) return null;

  const moduleProgress = [];

  for (const mod of modules) {
    // TP du module
    const { data: tpLessons } = await supabase
      .from('lessons')
      .select('id')
      .eq('module_id', mod.id)
      .eq('category', 'PRATIQUE')
      .neq('content_type', 'QUIZ');

    let tpValidated = 0;
    for (const tp of tpLessons || []) {
      const { data: questions } = await supabase
        .from('tp_questions')
        .select('id')
        .eq('lesson_id', tp.id);
      if (!questions || questions.length === 0) continue;

      const questionIds = questions.map(q => q.id);
      const { data: correctAttempts } = await supabase
        .from('tp_attempts')
        .select('tp_question_id')
        .eq('student_id', studentId)
        .in('tp_question_id', questionIds)
        .eq('is_correct', true);

      const correctSet = new Set(correctAttempts?.map(a => a.tp_question_id));
      const allCorrect = questions.every(q => correctSet.has(q.id));
      if (allCorrect) tpValidated++;
    }

    // QCM du module
    const { data: quizLessons } = await supabase
      .from('lessons')
      .select('id')
      .eq('module_id', mod.id)
      .eq('content_type', 'QUIZ');

    let quizValidated = 0;
    for (const quiz of quizLessons || []) {
      const { data: questions } = await supabase
        .from('quiz_questions')
        .select('id')
        .eq('lesson_id', quiz.id);
      if (!questions || questions.length === 0) continue;

      const questionIds = questions.map(q => q.id);
      const { data: correctAnswers } = await supabase
        .from('quiz_answers')
        .select('question_id')
        .eq('student_id', studentId)
        .in('question_id', questionIds)
        .eq('is_correct', true);

      const correctSet = new Set(correctAnswers?.map(a => a.question_id));
      const allCorrect = questions.every(q => correctSet.has(q.id));
      if (allCorrect) quizValidated++;
    }

    // Examen du module
    const { data: exam } = await supabase
      .from('assessments')
      .select('id')
      .eq('module_id', mod.id)
      .eq('type', 'EXAM')
      .single();

    let examPassed = false;
    if (exam) {
      const { data: submission } = await supabase
        .from('submissions')
        .select('status, grade')
        .eq('assessment_id', exam.id)
        .eq('student_id', studentId)
        .maybeSingle();
      examPassed = submission?.status === 'PASSED';
    }

    moduleProgress.push({
      module: mod,
      tpValidated,
      tpTotal: tpLessons?.length || 0,
      quizValidated,
      quizTotal: quizLessons?.length || 0,
      examPassed,
    });
  }

  const totalModules = modules.length;
  const modulesValidated = moduleProgress.filter(m => m.examPassed).length;
  const progressPercent = totalModules > 0 ? Math.round((modulesValidated / totalModules) * 100) : 0;

  return {
    courseId: course.id,
    modules: moduleProgress,
    totalModules,
    modulesValidated,
    progressPercent,
  };
}