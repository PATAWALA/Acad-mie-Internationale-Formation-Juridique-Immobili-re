'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import { getStudentProgress } from '@/lib/student-progress';
import {
  User, Mail, ArrowLeft, Loader2, FileText, HelpCircle, Wrench,
  ChevronDown, ChevronUp, Star, Pencil, BookOpen, TrendingUp, Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import HtmlContentViewer from '../../HtmlContentViewer';
import { GradeModal } from './GradeModal';

interface Props {
  studentId: string;
  certId: number;
  onBack: () => void;
}

// Types locaux
interface StudentProfile { id: string; full_name: string | null; email: string; }
interface ModuleSummary { id: string; title: string; week_number: number; }
interface StudentProgress { modules?: { module: ModuleSummary }[]; progressPercent: number; }
interface Lesson { id: string; title: string; module_id: string; content_type: string | null; category: string | null; }
interface TpQuestion { id: string; lesson_id: string; question_text: string; }
interface QuizQuestion { id: number; lesson_id: string; question: string; correct_answer: string; }
interface TpAttempt { student_id: string; tp_question_id: string; selected_option: string; is_correct: boolean; created_at: string | null; }
interface QuizAnswer { student_id: string; question_id: number; selected_answer: string; is_correct: boolean; }
interface Assessment { id: string; module_id: string | null; title: string; type: string | null; description?: string | null; }
interface Submission { id: number; assessment_id: string | null; student_id: string | null; submission_url: string; status: string | null; grade: number | null; feedback: string | null; }

interface ModuleDetail {
  module: ModuleSummary;
  tpData: {
    id: string;
    title: string;
    questions: {
      id: string;
      question_text: string;
      attempts: TpAttempt[];
    }[];
  }[];
  quizData: {
    id: string;
    title: string;
    questions: {
      id: number;
      question: string;
      correct_answer: string;
      answers: QuizAnswer[];
    }[];
  }[];
  exam: Assessment | null;
  examSubmission: Submission | null;
}

export default function AuditeurDetailView({ studentId, certId, onBack }: Props) {
  const supabase = createClientComponent();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [moduleDetails, setModuleDetails] = useState<ModuleDetail[]>([]);
  const [finalExam, setFinalExam] = useState<Assessment | null>(null);
  const [finalSubmission, setFinalSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [gradeModalOpen, setGradeModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Étape 1 : profil + cours + progression
      const [profileRes, courseRes, progressData] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email').eq('id', studentId).single(),
        supabase.from('courses').select('id').eq('certificate_id', certId).limit(1).maybeSingle(),
        getStudentProgress(certId, studentId),
      ]);

      setProfile(profileRes.data as StudentProfile | null);
      setProgress(progressData);

      if (!courseRes.data) {
        setLoading(false);
        return;
      }

      const courseId = courseRes.data.id;

      // Étape 2 : modules et leçons
      const { data: modules } = await supabase
        .from('modules')
        .select('id, title, week_number')
        .eq('course_id', courseId)
        .order('week_number');

      if (!modules || modules.length === 0) {
        setLoading(false);
        return;
      }

      const moduleIds = (modules as ModuleSummary[]).map((m) => m.id);

      const { data: allLessons } = await supabase
        .from('lessons')
        .select('id, title, module_id, content_type, category')
        .in('module_id', moduleIds);

      if (!allLessons) {
        setLoading(false);
        return;
      }

      const lessons = allLessons as Lesson[];
      const tpLessons = lessons.filter(l => l.category === 'PRATIQUE' && l.content_type !== 'QUIZ');
      const quizLessons = lessons.filter(l => l.content_type === 'QUIZ');
      const tpLessonIds = tpLessons.map(l => l.id);
      const quizLessonIds = quizLessons.map(l => l.id);

      // Étape 3 : questions et tentatives
      const tpQuestionsRes = tpLessonIds.length > 0
        ? await supabase.from('tp_questions').select('id, lesson_id, question_text').in('lesson_id', tpLessonIds)
        : { data: [] as TpQuestion[], error: null };

      const quizQuestionsRes = quizLessonIds.length > 0
        ? await supabase.from('quiz_questions').select('id, lesson_id, question, correct_answer').in('lesson_id', quizLessonIds)
        : { data: [] as QuizQuestion[], error: null };

      const moduleAssessRes = await supabase
        .from('assessments')
        .select('id, module_id, title, type, description')
        .in('module_id', moduleIds)
        .eq('type', 'EXAM');

      const finalAssessRes = await supabase
        .from('assessments')
        .select('id, module_id, title, type, description')
        .eq('course_id', courseId)
        .eq('type', 'FINAL')
        .maybeSingle();

      const submissionsRes = await supabase
        .from('submissions')
        .select('id, assessment_id, student_id, submission_url, status, grade, feedback')
        .eq('student_id', studentId);

      const tpAttemptsRes = tpLessonIds.length > 0
        ? await supabase.from('tp_attempts').select('student_id, tp_question_id, selected_option, is_correct, created_at').eq('student_id', studentId).in('lesson_id', tpLessonIds)
        : { data: [] as TpAttempt[], error: null };

      let quizAnswers: QuizAnswer[] = [];
      if (quizQuestionsRes.data && quizQuestionsRes.data.length > 0) {
        const quizQuestionIds = quizQuestionsRes.data.map(q => q.id);
        const quizAnswersRes = await supabase
          .from('quiz_answers')
          .select('student_id, question_id, selected_answer, is_correct')
          .eq('student_id', studentId)
          .in('question_id', quizQuestionIds);
        quizAnswers = (quizAnswersRes.data || []) as QuizAnswer[];
      }

      const tpQuestions = tpQuestionsRes.data || [];
      const quizQuestions = quizQuestionsRes.data || [];
      const moduleAssessments = (moduleAssessRes.data || []) as Assessment[];
      const finalAssessment = (finalAssessRes.data || null) as Assessment | null;
      const submissions = (submissionsRes.data || []) as Submission[];
      const tpAttempts = (tpAttemptsRes.data || []) as TpAttempt[];

      // Groupement
      const tpAttemptsMap: Record<string, TpAttempt[]> = {};
      tpAttempts.forEach(att => {
        if (!tpAttemptsMap[att.tp_question_id]) tpAttemptsMap[att.tp_question_id] = [];
        tpAttemptsMap[att.tp_question_id].push(att);
      });

      const quizAnswersMap: Record<number, QuizAnswer[]> = {};
      quizAnswers.forEach(ans => {
        if (!quizAnswersMap[ans.question_id]) quizAnswersMap[ans.question_id] = [];
        quizAnswersMap[ans.question_id].push(ans);
      });

      // Construire moduleDetails
      const details: ModuleDetail[] = modules.map((mod) => {
        const modTpLessons = tpLessons.filter(l => l.module_id === mod.id);
        const modQuizLessons = quizLessons.filter(l => l.module_id === mod.id);

        const tpData = modTpLessons.map(tpLesson => ({
          id: tpLesson.id,
          title: tpLesson.title,
          questions: tpQuestions
            .filter(q => q.lesson_id === tpLesson.id)
            .map(q => ({
              id: q.id,
              question_text: q.question_text,
              attempts: tpAttemptsMap[q.id] || [],
            })),
        }));

        const quizData = modQuizLessons.map(quizLesson => ({
          id: quizLesson.id,
          title: quizLesson.title,
          questions: quizQuestions
            .filter(q => q.lesson_id === quizLesson.id)
            .map(q => ({
              id: q.id,
              question: q.question,
              correct_answer: q.correct_answer,
              answers: quizAnswersMap[q.id] || [],
            })),
        }));

        const modExam = moduleAssessments.find(a => a.module_id === mod.id) || null;
        const examSubmission = modExam
          ? submissions.find(s => s.assessment_id === modExam.id && s.student_id === studentId) || null
          : null;

        return { module: mod, tpData, quizData, exam: modExam, examSubmission };
      });

      setModuleDetails(details);
      setFinalExam(finalAssessment);
      setFinalSubmission(finalAssessment
        ? submissions.find(s => s.assessment_id === finalAssessment.id && s.student_id === studentId) || null
        : null);

      if (details.length > 0) setOpenModules({ [details[0].module.id]: true });

      setLoading(false);
    };

    fetchData();
  }, [studentId, certId, supabase]);

  // Fonctions
  const toggleModule = (moduleId: string) => {
    setOpenModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const handleGradeSuccess = (grade: number, status: string) => {
    if (selectedSubmission) {
      const updated = { ...selectedSubmission, grade, status };
      setSelectedSubmission(null);
      setGradeModalOpen(false);
      setModuleDetails(prev => prev.map(mod => {
        if (mod.examSubmission?.id === updated.id) return { ...mod, examSubmission: updated };
        return mod;
      }));
      setFinalSubmission(prev => prev && prev.id === updated.id ? updated : prev);
    }
  };

  // Calculs simples pour le résumé
  const allTpQuestions = moduleDetails.flatMap(mod => mod.tpData.flatMap(tp => tp.questions));
  const allQuizQuestions = moduleDetails.flatMap(mod => mod.quizData.flatMap(quiz => quiz.questions));

  const totalTpValidated = allTpQuestions.filter(q => q.attempts.some(a => a.is_correct)).length;
  const totalQuizValidated = allQuizQuestions.filter(q => q.answers.some(a => a.is_correct)).length;
  const totalQuestions = allTpQuestions.length + allQuizQuestions.length;
  const totalValidated = totalTpValidated + totalQuizValidated;

  const modulesPassed = moduleDetails.filter(m => m.examSubmission?.status === 'PASSED').length;
  const totalModules = moduleDetails.length;

  const examGrades = moduleDetails
    .map(mod => mod.examSubmission?.grade)
    .filter((grade): grade is number => grade !== null && grade !== undefined);
  const averageExamGrade = examGrades.length > 0
    ? Math.round(examGrades.reduce((sum, g) => sum + g, 0) / examGrades.length)
    : null;

  const progressPercent = progress?.progressPercent || 0;

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Retour à la liste des auditeurs
      </button>

      {/* En-tête étudiant */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white">{profile?.full_name || 'Sans nom'}</h1>
            <p className="text-slate-400 text-sm flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" />
              {profile?.email || ''}
            </p>
          </div>
        </div>
      </div>

      {/* Résumé simplifié */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
        <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" /> Résumé
        </h2>

        {/* Progression */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400">Progression</span>
            <span className={cn("font-bold", progressPercent === 100 ? "text-green-400" : "text-blue-400")}>
              {progressPercent}%
            </span>
          </div>
          <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Chiffres clés */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <p className="text-slate-400 text-xs">Modules validés</p>
            <p className="text-white font-bold text-lg">{modulesPassed}/{totalModules}</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <p className="text-slate-400 text-xs">Questions réussies</p>
            <p className="text-white font-bold text-lg">{totalValidated}/{totalQuestions}</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <p className="text-slate-400 text-xs">Note moyenne</p>
            <p className="text-white font-bold text-lg">
              {averageExamGrade !== null ? `${averageExamGrade}/20` : '-'}
            </p>
          </div>
        </div>

        {/* Badge global simple */}
        {progressPercent === 100 ? (
          <p className="mt-3 text-green-400 font-bold">✅ Formation terminée</p>
        ) : progressPercent > 50 ? (
          <p className="mt-3 text-blue-400 font-bold">👍 Bonne progression</p>
        ) : progressPercent > 20 ? (
          <p className="mt-3 text-amber-400 font-bold">⚠️ En cours d'apprentissage</p>
        ) : (
          <p className="mt-3 text-red-400 font-bold">🔴 Difficultés détectées</p>
        )}
      </div>

      {/* Liste des modules */}
      {moduleDetails.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Aucun module pour cette formation.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {moduleDetails.map((modDetail) => {
            const isOpen = openModules[modDetail.module.id] || false;
            return (
              <div key={modDetail.module.id} className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                <button onClick={() => toggleModule(modDetail.module.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 font-bold text-sm">
                      {modDetail.module.week_number}
                    </div>
                    <h3 className="text-white font-semibold">{modDetail.module.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {modDetail.examSubmission?.status === 'PASSED' && (
                      <span className="text-green-400 text-xs font-medium">Examen validé</span>
                    )}
                    {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-800"
                    >
                      <div className="p-4 space-y-6">
                        {/* TP */}
                        {modDetail.tpData.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-orange-400 mb-2 flex items-center gap-2">
                              <Wrench className="w-4 h-4" /> Travaux Pratiques
                            </h4>
                            {modDetail.tpData.map((tp) => (
                              <div key={tp.id} className="mb-3">
                                <p className="text-white text-sm font-medium">{tp.title}</p>
                                {tp.questions.map((q) => {
                                  const attempts = q.attempts;
                                  const lastAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : null;
                                  return (
                                    <div key={q.id} className="ml-4 mt-1 p-2 rounded-lg bg-slate-800/50">
                                      <HtmlContentViewer content={q.question_text} />
                                      <div className="text-xs mt-1 text-slate-400">
                                        Tentatives: {attempts.length}
                                      </div>
                                      {lastAttempt && (
                                        <div className={cn("text-xs mt-1", lastAttempt.is_correct ? "text-green-400" : "text-red-400")}>
                                          Dernière réponse : <HtmlContentViewer content={lastAttempt.selected_option} />
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* QCM */}
                        {modDetail.quizData.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-violet-400 mb-2 flex items-center gap-2">
                              <HelpCircle className="w-4 h-4" /> QCM
                            </h4>
                            {modDetail.quizData.map((quiz) => (
                              <div key={quiz.id} className="mb-3">
                                <p className="text-white text-sm font-medium">{quiz.title}</p>
                                {quiz.questions.map((q) => {
                                  const answers = q.answers;
                                  const lastAnswer = answers.length > 0 ? answers[answers.length - 1] : null;
                                  return (
                                    <div key={q.id} className="ml-4 mt-1 p-2 rounded-lg bg-slate-800/50">
                                      <HtmlContentViewer content={q.question} />
                                      <div className="text-xs mt-1 text-slate-400">
                                        Tentatives: {answers.length}
                                      </div>
                                      {lastAnswer && (
                                        <div className={cn("text-xs mt-1", lastAnswer.is_correct ? "text-green-400" : "text-red-400")}>
                                          Réponse : <HtmlContentViewer content={lastAnswer.selected_answer} /> (bonne : <HtmlContentViewer content={q.correct_answer} />)
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Examen de module */}
                        {modDetail.exam && (
                          <div>
                            <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                              <FileText className="w-4 h-4" /> Examen : {modDetail.exam.title}
                            </h4>
                            {modDetail.examSubmission ? (
                              <div className="ml-4 p-2 rounded-lg bg-slate-800/50 space-y-2">
                                <p className="text-slate-300 text-sm">Statut : {modDetail.examSubmission.status}</p>
                                <p className="text-slate-300 text-sm">Note : {modDetail.examSubmission.grade ?? '-'}/20</p>
                                {modDetail.examSubmission.submission_url && (
                                  <a href={modDetail.examSubmission.submission_url} target="_blank" rel="noreferrer"
                                    className="text-blue-400 hover:text-blue-300 text-xs">
                                    Voir la copie
                                  </a>
                                )}
                                <button
                                  onClick={() => { setSelectedSubmission(modDetail.examSubmission); setGradeModalOpen(true); }}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                                >
                                  <Pencil className="w-3.5 h-3.5" /> Noter / Corriger
                                </button>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-500 ml-4">Aucune soumission</p>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* Examen final */}
      {finalExam && (
        <div className="bg-slate-900/50 border border-amber-500/30 rounded-xl overflow-hidden">
          <div className="p-4 flex items-center justify-between bg-amber-500/5 border-b border-amber-500/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="text-white font-semibold">Examen final</h3>
            </div>
            {finalSubmission ? (
              <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                finalSubmission.status === 'PASSED' ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20")}>
                {finalSubmission.status === 'PASSED' ? '✅ Validé' : '⏳ En attente'}
              </span>
            ) : (
              <span className="text-xs text-slate-500">Non soumis</span>
            )}
          </div>
          <div className="p-4 space-y-3">
            {finalSubmission ? (
              <>
                <p className="text-sm text-slate-300">Statut : {finalSubmission.status}</p>
                <p className="text-sm text-slate-300">Note : {finalSubmission.grade ?? '-'}/20</p>
                {finalSubmission.feedback && (
                  <p className="text-sm text-slate-400">Feedback : {finalSubmission.feedback}</p>
                )}
                {finalSubmission.submission_url && (
                  <a href={finalSubmission.submission_url} target="_blank" rel="noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-xs">Voir la copie</a>
                )}
                <button
                  onClick={() => { setSelectedSubmission(finalSubmission); setGradeModalOpen(true); }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> Noter / Corriger
                </button>
              </>
            ) : (
              <p className="text-sm text-slate-500">L&apos;étudiant n&apos;a pas encore soumis son examen final.</p>
            )}
          </div>
        </div>
      )}

      {/* Modal de notation */}
      <GradeModal
        isOpen={gradeModalOpen && !!selectedSubmission}
        onClose={() => { setGradeModalOpen(false); setSelectedSubmission(null); }}
        submission={selectedSubmission}
        onSuccess={handleGradeSuccess}
      />
    </div>
  );
}