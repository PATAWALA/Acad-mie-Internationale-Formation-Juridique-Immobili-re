// components/dashboard/enseignant/AuditeurDetailView.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import { getStudentProgress } from '@/lib/student-progress';
import { User, Mail, ArrowLeft, Loader2, CheckCircle2, XCircle, Clock, FileText, HelpCircle, Wrench, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  studentId: string;
  certId: number;
  onBack: () => void;
}

export default function AuditeurDetailView({ studentId, certId, onBack }: Props) {
  const supabase = createClientComponent();
  const [profile, setProfile] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [moduleDetails, setModuleDetails] = useState<any[]>([]);
  const [finalExam, setFinalExam] = useState<any | null>(null);
  const [finalSubmission, setFinalSubmission] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Récupérer le profil de l'étudiant
      const { data: studentProfile } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', studentId)
        .single();
      setProfile(studentProfile);

      // Récupérer la progression globale
      const progressData = await getStudentProgress(certId, studentId);
      setProgress(progressData);

      if (progressData?.modules) {
        const details = [];
        for (const mod of progressData.modules) {
          const moduleId = mod.module.id;

          // ---- TP ----
          const { data: tpLessons } = await supabase
            .from('lessons')
            .select('id, title')
            .eq('module_id', moduleId)
            .eq('category', 'PRATIQUE')
            .neq('content_type', 'QUIZ');

          const tpData = [];
          for (const tp of tpLessons || []) {
            const { data: questions } = await supabase
              .from('tp_questions')
              .select('id, question_text')
              .eq('lesson_id', tp.id)
              .order('position');

            const questionsWithAttempts = [];
            for (const q of questions || []) {
              const { data: attempts } = await supabase
                .from('tp_attempts')
                .select('selected_option, is_correct, created_at')
                .eq('student_id', studentId)
                .eq('tp_question_id', q.id)
                .order('created_at', { ascending: false })
                .limit(1);

              questionsWithAttempts.push({
                ...q,
                attempt: attempts?.[0] || null,
              });
            }

            tpData.push({
              id: tp.id,
              title: tp.title,
              questions: questionsWithAttempts,
            });
          }

          // ---- QCM ----
          const { data: quizLessons } = await supabase
            .from('lessons')
            .select('id, title')
            .eq('module_id', moduleId)
            .eq('content_type', 'QUIZ');

          const quizData = [];
          for (const quiz of quizLessons || []) {
            const { data: questions } = await supabase
              .from('quiz_questions')
              .select('id, question, option_a, option_b, option_c, option_d, correct_answer')
              .eq('lesson_id', quiz.id)
              .order('position');

            const questionsWithAnswers = [];
            for (const q of questions || []) {
              const { data: answer } = await supabase
                .from('quiz_answers')
                .select('selected_answer, is_correct')
                .eq('student_id', studentId)
                .eq('question_id', q.id)
                .maybeSingle();

              questionsWithAnswers.push({
                ...q,
                answer: answer || null,
              });
            }

            quizData.push({
              id: quiz.id,
              title: quiz.title,
              questions: questionsWithAnswers,
            });
          }

          // ---- Examen de module ----
          const { data: exam } = await supabase
            .from('assessments')
            .select('id, title')
            .eq('module_id', moduleId)
            .eq('type', 'EXAM')
            .maybeSingle();

          let examSubmission = null;
          if (exam) {
            const { data: sub } = await supabase
              .from('submissions')
              .select('id, submission_url, status, grade, feedback')
              .eq('assessment_id', exam.id)
              .eq('student_id', studentId)
              .maybeSingle();
            examSubmission = sub || null;
          }

          details.push({
            module: mod.module,
            tpData,
            quizData,
            exam: exam || null,
            examSubmission,
          });
        }
        setModuleDetails(details);
      }

      // ---- Examen final ----
      const { data: courseData } = await supabase
        .from('courses')
        .select('id')
        .eq('certificate_id', certId)
        .single();

      if (courseData) {
        const { data: final } = await supabase
          .from('assessments')
          .select('id, title, description')
          .eq('course_id', courseData.id)
          .eq('type', 'FINAL')
          .maybeSingle();
        setFinalExam(final);

        if (final) {
          const { data: finalSub } = await supabase
            .from('submissions')
            .select('id, submission_url, status, grade, feedback')
            .eq('assessment_id', final.id)
            .eq('student_id', studentId)
            .maybeSingle();
          setFinalSubmission(finalSub || null);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [studentId, certId, supabase]);

  const toggleModule = (moduleId: string) => {
    setOpenModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Retour */}
      <button onClick={onBack} className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Retour à la liste des auditeurs
      </button>

      {/* En-tête étudiant */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Progression :</span>
          <span className={cn("font-bold", progress?.progressPercent === 100 ? "text-green-400" : "text-blue-400")}>
            {progress?.progressPercent || 0}%
          </span>
        </div>
      </div>

      {/* Modules */}
      {moduleDetails.length === 0 ? (
        <p className="text-center text-slate-500 py-12">Aucun module trouvé pour cette formation.</p>
      ) : (
        <div className="space-y-3">
          {moduleDetails.map((modDetail: any) => (
            <div key={modDetail.module.id} className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
              {/* Header module */}
              <button
                onClick={() => toggleModule(modDetail.module.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 font-bold text-sm">
                    {modDetail.module.week_number}
                  </div>
                  <h3 className="text-white font-semibold">{modDetail.module.title}</h3>
                </div>
                {openModules[modDetail.module.id] ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {/* Contenu dépliable */}
              <AnimatePresence>
                {openModules[modDetail.module.id] && (
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
                          {modDetail.tpData.map((tp: any) => (
                            <div key={tp.id} className="mb-3">
                              <p className="text-white text-sm font-medium">{tp.title}</p>
                              {tp.questions.map((q: any) => (
                                <div key={q.id} className="ml-4 mt-1 p-2 rounded-lg bg-slate-800/50">
                                  <p className="text-slate-300 text-sm">{q.question_text}</p>
                                  {q.attempt ? (
                                    <p className={cn("text-xs mt-1", q.attempt.is_correct ? "text-green-400" : "text-red-400")}>
                                      {q.attempt.is_correct ? '✅' : '❌'} Dernière réponse : {q.attempt.selected_option}
                                    </p>
                                  ) : (
                                    <p className="text-xs text-slate-500">Aucune tentative</p>
                                  )}
                                </div>
                              ))}
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
                          {modDetail.quizData.map((quiz: any) => (
                            <div key={quiz.id} className="mb-3">
                              <p className="text-white text-sm font-medium">{quiz.title}</p>
                              {quiz.questions.map((q: any) => (
                                <div key={q.id} className="ml-4 mt-1 p-2 rounded-lg bg-slate-800/50">
                                  <p className="text-slate-300 text-sm">{q.question}</p>
                                  {q.answer ? (
                                    <p className={cn("text-xs mt-1", q.answer.is_correct ? "text-green-400" : "text-red-400")}>
                                      {q.answer.is_correct ? '✅' : '❌'} Réponse : {q.answer.selected_answer} (bonne : {q.correct_answer})
                                    </p>
                                  ) : (
                                    <p className="text-xs text-slate-500">Aucune réponse</p>
                                  )}
                                </div>
                              ))}
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
                            <div className="ml-4 p-2 rounded-lg bg-slate-800/50">
                              <p className="text-slate-300 text-sm">Statut : {modDetail.examSubmission.status}</p>
                              <p className="text-slate-300 text-sm">Note : {modDetail.examSubmission.grade ?? '-'}/20</p>
                              <a
                                href={modDetail.examSubmission.submission_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-400 hover:text-blue-300 text-xs"
                              >
                                Voir la copie
                              </a>
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
          ))}
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
                finalSubmission.status === 'PASSED' ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              )}>
                {finalSubmission.status === 'PASSED' ? '✅ Validé' : '⏳ En attente'}
              </span>
            ) : (
              <span className="text-xs text-slate-500">Non soumis</span>
            )}
          </div>
          <div className="p-4">
            {finalSubmission ? (
              <div className="space-y-2">
                <p className="text-sm text-slate-300">Statut : {finalSubmission.status}</p>
                <p className="text-sm text-slate-300">Note : {finalSubmission.grade ?? '-'}/20</p>
                {finalSubmission.feedback && (
                  <p className="text-sm text-slate-400">Feedback : {finalSubmission.feedback}</p>
                )}
                <a
                  href={finalSubmission.submission_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-xs"
                >
                  Voir la copie
                </a>
              </div>
            ) : (
              <p className="text-sm text-slate-500">L'étudiant n'a pas encore soumis son examen final.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}