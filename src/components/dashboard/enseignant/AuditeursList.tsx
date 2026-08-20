'use client';

import { useState, useEffect } from 'react';
import { createClientComponent } from '@/lib/supabase/client';
import { Search, Users, Loader2, ArrowLeft, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Tables } from '@/types/database';

type ProfileRow = Tables<'profiles'>;
type ModuleRow = Tables<'modules'>;
type LessonRow = Tables<'lessons'>;
type TpQuestionRow = Tables<'tp_questions'>;
type QuizQuestionRow = Tables<'quiz_questions'>;
type AssessmentRow = Tables<'assessments'>;
type TpAttemptRow = Tables<'tp_attempts'>;
type QuizAnswerRow = Tables<'quiz_answers'>;
type SubmissionRow = Tables<'submissions'>;

interface AuditeursListProps {
  certId: number;
  onBack: () => void;
}

interface StudentProgress {
  id: string;
  full_name: string | null;
  email: string | null;
  progressPercent: number;
  modulesValidated: number;
  totalModules: number;
}

export default function AuditeursList({ certId, onBack }: AuditeursListProps) {
  const supabase = createClientComponent();
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED'>('ALL');

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);

      // 1. Récupérer le cours
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('id')
        .eq('certificate_id', certId)
        .single();

      if (courseError || !course) {
        setLoading(false);
        setStudents([]);
        return;
      }

      // 2. Récupérer les inscriptions payées
      const { data: enrolls, error: enrollError } = await supabase
        .from('enrollments')
        .select('student_id')
        .eq('certificate_id', certId)
        .eq('payment_status', 'PAID');

      if (enrollError || !enrolls || enrolls.length === 0) {
        setLoading(false);
        setStudents([]);
        return;
      }

      // Filtrer les student_id null, en sachant que la colonne est nullable dans la DB
      const studentIds: string[] = enrolls
  .map((e) => e.student_id)
  .filter((id): id is string => id !== null);

      if (studentIds.length === 0) {
        setLoading(false);
        setStudents([]);
        return;
      }

      // 3. Récupérer les profils
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', studentIds);

      if (profilesError || !profiles) {
        setLoading(false);
        setStudents([]);
        return;
      }

      // 4. Récupérer tous les modules du cours
      const { data: modules, error: modulesError } = await supabase
        .from('modules')
        .select('id, title, week_number')
        .eq('course_id', course.id)
        .order('week_number');

      if (modulesError || !modules) {
        setLoading(false);
        setStudents([]);
        return;
      }

      const moduleIds = (modules as ModuleRow[]).map((m) => m.id);

      // 5. Récupérer toutes les leçons
      const { data: allLessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('id, title, module_id, content_type, category')
        .in('module_id', moduleIds);

      if (lessonsError || !allLessons) {
        setLoading(false);
        setStudents([]);
        return;
      }

      const lessons = allLessons as LessonRow[];
      const tpLessons = lessons.filter((l) => l.category === 'PRATIQUE' && l.content_type !== 'QUIZ');
      const quizLessons = lessons.filter((l) => l.content_type === 'QUIZ');
      const tpLessonIds = tpLessons.map((l) => l.id);
      const quizLessonIds = quizLessons.map((l) => l.id);

      // 6. Questions TP et QCM
      let tpQuestionsData: TpQuestionRow[] = [];
      let quizQuestionsData: QuizQuestionRow[] = [];
      if (tpLessonIds.length > 0) {
        const { data, error } = await supabase
          .from('tp_questions')
          .select('id, lesson_id')
          .in('lesson_id', tpLessonIds);
        if (error) console.error(error);
        tpQuestionsData = (data as TpQuestionRow[]) || [];
      }
      if (quizLessonIds.length > 0) {
        const { data, error } = await supabase
          .from('quiz_questions')
          .select('id, lesson_id')
          .in('lesson_id', quizLessonIds);
        if (error) console.error(error);
        quizQuestionsData = (data as QuizQuestionRow[]) || [];
      }

      const totalTpQuestions = tpQuestionsData.length;
      const totalQuizQuestions = quizQuestionsData.length;

      // 7. Examens de module
      const { data: assessments, error: assessmentsError } = await supabase
        .from('assessments')
        .select('id, module_id, type')
        .in('module_id', moduleIds)
        .eq('type', 'EXAM');
      if (assessmentsError) console.error(assessmentsError);
      const assessmentList = (assessments as AssessmentRow[]) || [];
      const assessmentIds = assessmentList.map((a) => a.id);

      // 8. Tentatives TP correctes
      const tpCorrectMap: Record<string, Set<string>> = {};
      if (tpLessonIds.length > 0) {
        const { data: tpAttempts, error: tpError } = await supabase
          .from('tp_attempts')
          .select('student_id, tp_question_id, is_correct')
          .in('student_id', studentIds)
          .in('lesson_id', tpLessonIds)
          .eq('is_correct', true);
        if (tpError) console.error(tpError);
        (tpAttempts as TpAttemptRow[])?.forEach((att) => {
          if (att.student_id && att.tp_question_id) {
            if (!tpCorrectMap[att.student_id]) tpCorrectMap[att.student_id] = new Set();
            tpCorrectMap[att.student_id].add(att.tp_question_id);
          }
        });
      }

      // 9. Réponses QCM correctes
      const quizCorrectMap: Record<string, Set<string>> = {};
      if (quizLessonIds.length > 0) {
        const qIds = quizQuestionsData.map((q) => q.id);
        const { data: quizAnswers, error: quizError } = await supabase
          .from('quiz_answers')
          .select('student_id, question_id, is_correct')
          .in('student_id', studentIds)
          .in('question_id', qIds)
          .eq('is_correct', true);
        if (quizError) console.error(quizError);
        (quizAnswers as QuizAnswerRow[])?.forEach((ans) => {
          if (ans.student_id && ans.question_id !== null) {
            if (!quizCorrectMap[ans.student_id]) quizCorrectMap[ans.student_id] = new Set();
            quizCorrectMap[ans.student_id].add(String(ans.question_id));
          }
        });
      }

      // 10. Soumissions d'examens réussies
      const examPassedMap: Record<string, number> = {};
      if (assessmentIds.length > 0) {
        const { data: submissions, error: subError } = await supabase
          .from('submissions')
          .select('student_id, assessment_id, status')
          .in('student_id', studentIds)
          .in('assessment_id', assessmentIds)
          .eq('status', 'PASSED');
        if (subError) console.error(subError);
        (submissions as SubmissionRow[])?.forEach((sub) => {
          if (sub.student_id) {
            examPassedMap[sub.student_id] = (examPassedMap[sub.student_id] || 0) + 1;
          }
        });
      }

      // 11. Calcul progression
      const progressData: StudentProgress[] = (profiles as ProfileRow[]).map((profile) => {
        const tpCorrect = tpCorrectMap[profile.id] || new Set();
        const quizCorrect = quizCorrectMap[profile.id] || new Set();
        const examsPassed = examPassedMap[profile.id] || 0;

        const tpPercent = totalTpQuestions > 0 ? Math.round((tpCorrect.size / totalTpQuestions) * 100) : 0;
        const quizPercent = totalQuizQuestions > 0 ? Math.round((quizCorrect.size / totalQuizQuestions) * 100) : 0;
        const modulesPercent = assessmentList.length > 0
          ? Math.round((examsPassed / assessmentList.length) * 100)
          : 0;

        const overall = Math.round((tpPercent + quizPercent + modulesPercent) / 3);

        return {
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          progressPercent: overall,
          modulesValidated: examsPassed,
          totalModules: modules.length,
        };
      });

      setStudents(progressData);
      setLoading(false);
    };

    fetchAllData();
  }, [certId, supabase]);

  const filteredStudents = students.filter((student) => {
    if (statusFilter !== 'ALL') {
      const pct = student.progressPercent || 0;
      if (statusFilter === 'COMPLETED' && pct !== 100) return false;
      if (statusFilter === 'IN_PROGRESS' && (pct === 0 || pct === 100)) return false;
      if (statusFilter === 'NOT_STARTED' && pct !== 0) return false;
    }
    const searchLower = search.toLowerCase();
    const name = (student.full_name || '').toLowerCase();
    const email = (student.email || '').toLowerCase();
    return name.includes(searchLower) || email.includes(searchLower);
  });

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Retour aux formations
      </button>

      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          Auditeurs de la formation
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {students.length} auditeur{students.length > 1 ? 's' : ''} inscrit{students.length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED')}
          className="..."
        >
          <option value="ALL">Tous</option>
          <option value="COMPLETED">Terminés</option>
          <option value="IN_PROGRESS">En cours</option>
          <option value="NOT_STARTED">Non commencés</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <UserCircle className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-white font-semibold mb-1">Aucun auditeur trouvé</h3>
          <p className="text-slate-400 text-sm max-w-sm">
            {search ? 'Essayez avec un autre terme de recherche.' : 'Aucun auditeur payé pour cette formation.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredStudents.map((student) => {
            const pct = student.progressPercent || 0;
            return (
              <div
                key={student.id}
                className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{student.full_name || 'Sans nom'}</p>
                  <p className="text-slate-400 text-sm truncate">{student.email || ''}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", pct === 100 ? 'bg-green-500' : pct > 0 ? 'bg-blue-500' : 'bg-slate-700')}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-slate-400 text-sm w-10 text-right">{pct}%</span>
                </div>

                <span
                  className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
                    pct === 100
                      ? "bg-green-500/10 text-green-400 border-green-500/20"
                      : pct > 0
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      : "bg-slate-800 text-slate-400 border-slate-700"
                  )}
                >
                  {pct === 100 ? 'Terminé' : pct > 0 ? 'En cours' : 'Non commencé'}
                </span>

                <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors">
                  Détails
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}