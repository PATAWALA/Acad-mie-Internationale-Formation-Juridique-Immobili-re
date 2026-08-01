'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import { useStudent } from '@/context/StudentContext';
import { 
  Lock, Unlock, CheckCircle2, AlertCircle, 
  Clock, FileText, Video, Link as LinkIcon, 
  Send, ChevronDown, ChevronRight, Award,
  BookOpen, Loader2, Trophy, Star, PenTool,
  Calendar, Play, Target, Users, Download,
  Shield, Zap, HelpCircle, Check, X,
  ArrowLeft, ArrowRight
} from 'lucide-react';
import { SubmissionModal } from './SubmissionModal';
import ContentViewer from './ContentViewer';
import SubmissionViewer from "./SubmissionViewer";

interface CourseProgramProps {
  courses: any[];
  userStatus: string;
  passedAssessments: string[];
  submissionsMap: Record<string, any>;
  certificateInfo?: any;
}

export function CourseProgram({ courses, userStatus, passedAssessments, submissionsMap, certificateInfo }: CourseProgramProps) {
  const { profile } = useStudent();
  const supabase = createClientComponent();
  const isPaid = userStatus?.trim().toUpperCase() === 'PAID';
  const [selectedAssessment, setSelectedAssessment] = useState<{ id: string; title: string } | null>(null);
  const [activeCourseIndex, setActiveCourseIndex] = useState(0);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState<Record<string, any[]>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<string, any>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<Record<string, string>>({});

  const activeCourse = courses[activeCourseIndex];
  const modules = activeCourse?.modules || [];
  const activeModule = modules[activeModuleIndex];

  const isFirstModule = activeModuleIndex === 0;
  const prevModuleAssessmentId = !isFirstModule ? modules[activeModuleIndex - 1]?.assessments?.[0]?.id : null;
  const isModuleUnlocked = isFirstModule || (prevModuleAssessmentId && passedAssessments.includes(prevModuleAssessmentId));
  const moduleAssessmentId = activeModule?.assessments?.[0]?.id;
  const isModulePassed = moduleAssessmentId && passedAssessments.includes(moduleAssessmentId);

  const totalModules = modules.length;
  const completedModules = modules.filter((m: any) => {
    const aid = m.assessments?.[0]?.id;
    return aid && passedAssessments.includes(aid);
  }).length;
  const progressPercent = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  const goToNextModule = () => {
    if (activeModuleIndex < modules.length - 1) setActiveModuleIndex(prev => prev + 1);
    else if (activeCourseIndex < courses.length - 1) { setActiveCourseIndex(prev => prev + 1); setActiveModuleIndex(0); }
  };

  const goToPrevModule = () => {
    if (activeModuleIndex > 0) setActiveModuleIndex(prev => prev - 1);
    else if (activeCourseIndex > 0) { setActiveCourseIndex(prev => prev - 1); setActiveModuleIndex((courses[activeCourseIndex - 1]?.modules?.length || 1) - 1); }
  };

  const loadQuizForModule = async (moduleId: string, assessmentIds: string[]) => {
    if (assessmentIds.length === 0) return;
    const { data: questions } = await (supabase as any).from('quiz_questions').select('*').in('assessment_id', assessmentIds).order('position', { ascending: true });
    if (questions?.length > 0) {
      setQuizQuestions(prev => ({ ...prev, [moduleId]: questions }));
      if (profile) {
        const { data: answers } = await (supabase as any).from('quiz_answers').select('*').eq('student_id', profile.id).in('question_id', questions.map((q: any) => q.id));
        if (answers) {
          const map: Record<string, any> = {};
          answers.forEach((a: any) => { const qid = a.question_id ?? 0; if (qid) map[qid] = a; });
          setQuizAnswers(prev => ({ ...prev, [moduleId]: map }));
        }
      }
    }
  };

  const handleAnswer = async (question: any, answer: string, moduleId: string) => {
    if (!profile) return;
    setSelectedAnswer(prev => ({ ...prev, [question.id]: answer }));
    const isCorrect = answer === question.correct_answer;
    await (supabase as any).from('quiz_answers').upsert({ question_id: question.id, student_id: profile.id, selected_answer: answer, is_correct: isCorrect }, { onConflict: 'question_id,student_id' });
    setQuizAnswers(prev => ({ ...prev, [moduleId]: { ...(prev[moduleId] || {}), [question.id]: { selected_answer: answer, is_correct: isCorrect } } }));
  };

  const getLessonType = (lesson: any, index: number) => {
    const t = (lesson.title || '').toLowerCase();
    if (t.includes('théorie') || t.includes('theorie') || index === 0) return 'theorie';
    if (t.includes('pratique') || t.includes('exercice') || index === 1) return 'pratique';
    return 'standard';
  };

  if (!courses?.length) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 md:py-20">
        <BookOpen className="w-12 h-12 md:w-16 md:h-16 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400 text-base md:text-lg">Aucune formation disponible.</p>
      </motion.div>
    );
  }

  if (activeModule && !quizQuestions[activeModule.id]) {
    const assessmentIds = activeModule.assessments?.map((a: any) => a.id) || [];
    loadQuizForModule(activeModule.id, assessmentIds);
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 md:space-y-6 pb-16 md:pb-20">
      {/* Barre de progression */}
      {isPaid && totalModules > 0 && (
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl md:rounded-2xl p-3 md:p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] md:text-xs text-slate-400 font-medium">Progression</span>
            <span className="text-[11px] md:text-xs text-blue-400 font-bold">{progressPercent}%</span>
          </div>
          <div className="h-1 md:h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" />
          </div>
        </div>
      )}

      {/* 🧭 Navigation sticky */}
      <div className="sticky top-0 z-20 bg-[#020617]/95 backdrop-blur-xl border-b border-[#1e293b] -mx-4 px-3 md:px-4 py-2.5 md:py-3 flex items-center justify-between">
        <button onClick={goToPrevModule} disabled={activeModuleIndex === 0 && activeCourseIndex === 0}
          className="flex items-center gap-1 text-xs md:text-sm text-slate-400 hover:text-white disabled:opacity-20 transition-colors p-1.5 md:p-1">
          <ArrowLeft className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-1 md:gap-2">
          {modules.map((_: any, i: number) => {
            const modId = modules[i]?.assessments?.[0]?.id;
            const isPassed = modId && passedAssessments.includes(modId);
            return (
              <button key={i} onClick={() => setActiveModuleIndex(i)}
                className={`w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-center ${
                  i === activeModuleIndex ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20 scale-110' : 
                  isPassed ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                  'bg-[#1e293b] text-slate-500 hover:bg-[#334155]'
                }`}>
                {isPassed ? <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4" /> : i + 1}
              </button>
            );
          })}
        </div>

        <button onClick={goToNextModule} disabled={activeModuleIndex === modules.length - 1 && activeCourseIndex === courses.length - 1}
          className="flex items-center gap-1 text-xs md:text-sm text-slate-400 hover:text-white disabled:opacity-20 transition-colors p-1.5 md:p-1">
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 📄 Contenu */}
      {activeModule && (
        <motion.div key={activeModule.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          {/* En-tête */}
          <div className="mb-4 md:mb-6">
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <span className="text-[10px] md:text-xs font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-2 md:px-3 py-1 rounded-full">
                S{activeModule.week_number}/{totalModules}
              </span>
              {isModulePassed && (
                <span className="inline-flex items-center gap-1 px-2 md:px-2.5 py-0.5 md:py-1 bg-green-500/10 text-green-400 text-[10px] md:text-xs font-bold rounded-full border border-green-500/20">
                  <CheckCircle2 className="w-3 h-3" /> Validée
                </span>
              )}
            </div>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white leading-tight">{activeModule.title}</h2>
          </div>

          {!isModuleUnlocked ? (
            <div className="text-center py-16 md:py-20">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                <Lock className="w-8 h-8 md:w-10 md:h-10 text-slate-500" />
              </div>
              <h3 className="text-base md:text-lg font-bold text-white mb-2">Semaine verrouillée</h3>
              <p className="text-slate-400 text-xs md:text-sm">Validez la semaine {activeModule.week_number - 1} pour accéder à celle-ci.</p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-5">
              {/* Leçons */}
              {activeModule.lessons?.map((lesson: any, li: number) => {
                const lessonType = getLessonType(lesson, li);
                return (
                  <div key={lesson.id} className="bg-[#0f172a] border border-[#1e293b] rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6">
                    <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                      {lessonType === 'theorie' && <span className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 bg-blue-500/10 text-blue-400 text-[10px] md:text-xs font-bold rounded-full border border-blue-500/20">📚 Théorie</span>}
                      {lessonType === 'pratique' && <span className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 bg-orange-500/10 text-orange-400 text-[10px] md:text-xs font-bold rounded-full border border-orange-500/20">✍️ Pratique</span>}
                      {lesson.content_type === 'VIDEO' && <Video className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-400" />}
                      <h3 className="text-sm md:text-base font-bold text-white">{lesson.title}</h3>
                    </div>
                    {isPaid ? (
                      <ContentViewer contentType={lesson.content_type} contentUrl={lesson.content_url} contentBody={lesson.content_body} title={lesson.title} />
                    ) : (
                      <div className="text-amber-400 text-xs md:text-sm"><Lock className="w-3.5 h-3.5 md:w-4 md:h-4 inline mr-1" />Réservé aux membres payants</div>
                    )}
                  </div>
                );
              })}

              {/* QCM */}
              {quizQuestions[activeModule.id]?.length > 0 && (
                <div className="bg-[#0f172a] border border-purple-500/20 rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6">
                  <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-5">
                    <div className="p-1.5 md:p-2 bg-purple-500/10 rounded-lg md:rounded-xl"><HelpCircle className="w-4 h-4 md:w-5 md:h-5 text-purple-400" /></div>
                    <h3 className="text-sm md:text-base font-bold text-white">🧠 QCM d'auto-évaluation</h3>
                    <span className="text-xs md:text-sm text-purple-400 ml-auto bg-purple-500/10 px-2 md:px-3 py-1 rounded-full font-bold">
                      {Object.keys(quizAnswers[activeModule.id] || {}).length}/{quizQuestions[activeModule.id]?.length || 0}
                    </span>
                  </div>
                  <div className="space-y-3 md:space-y-4">
                    {quizQuestions[activeModule.id]?.map((q: any, qi: number) => {
                      const answer = (quizAnswers[activeModule.id] || {})[q.id];
                      return (
                        <div key={q.id} className={`p-3 md:p-4 rounded-lg md:rounded-xl border ${answer ? (answer.is_correct ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20') : 'bg-[#020617] border-[#1e293b]'}`}>
                          <p className="text-white text-sm md:text-base font-semibold mb-2 md:mb-3">Q{qi + 1}. {q.question}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 md:gap-2">
                            {['A', 'B', 'C', 'D'].map((letter: string) => (
                              <button key={letter} onClick={() => !answer && handleAnswer(q, letter, activeModule.id)} disabled={!!answer}
                                className={`text-left px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-all ${
                                  answer && letter === q.correct_answer ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                  answer && letter === answer.selected_answer && !answer.is_correct ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                  'bg-[#1e293b] text-slate-400 hover:text-white hover:bg-[#334155] border border-transparent'
                                }`}>
                                <span className="font-bold mr-1.5 md:mr-2">{letter})</span>{q[`option_${letter.toLowerCase()}`]}
                                {answer && letter === q.correct_answer && <Check className="w-3.5 h-3.5 md:w-4 md:h-4 inline ml-1 text-green-400" />}
                                {answer && letter === answer.selected_answer && !answer.is_correct && <X className="w-3.5 h-3.5 md:w-4 md:h-4 inline ml-1 text-red-400" />}
                              </button>
                            ))}
                          </div>
                          {answer && (
                            <p className={`mt-2 md:mt-3 text-xs md:text-sm font-medium ${answer.is_correct ? 'text-green-400' : 'text-red-400'}`}>
                              {answer.is_correct ? '✅ Bonne réponse !' : `❌ Incorrect. Bonne réponse : ${q.correct_answer}.`}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TP */}
              {activeModule.assessments?.map((ass: any) => {
                const sub = submissionsMap[ass.id];
                return (
                  <div key={ass.id} className="bg-[#0f172a] border border-[#1e293b] rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="p-1.5 md:p-2 bg-yellow-500/10 rounded-lg md:rounded-xl"><PenTool className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" /></div>
                        <h3 className="text-sm md:text-base font-bold text-white">{ass.title}</h3>
                        <span className="inline-flex items-center gap-1 px-2 md:px-2.5 py-0.5 md:py-1 bg-yellow-500/10 text-yellow-400 text-[10px] md:text-xs font-bold rounded-full border border-yellow-500/20">🎯 Validation</span>
                      </div>
                      {sub ? (
                        sub.status === 'PENDING' ? <span className="text-amber-400 text-xs md:text-sm font-medium">⏳ En attente</span> :
                        sub.status === 'PASSED' ? <span className="text-green-400 text-xs md:text-sm font-medium">✅ {sub.grade}/20</span> :
                        <span className="text-red-400 text-xs md:text-sm font-medium">❌ {sub.grade}/20</span>
                      ) : <span className="text-slate-500 text-xs md:text-sm">Non soumis</span>}
                    </div>
                    {ass.description && (
                      <div className="mb-3 md:mb-4 p-3 md:p-4 bg-amber-500/5 border border-amber-500/10 rounded-lg md:rounded-xl">
                        <p className="text-xs md:text-sm text-amber-400 font-semibold mb-1">📋 Consignes :</p>
                        <p className="text-slate-300 text-xs md:text-sm leading-relaxed whitespace-pre-wrap">{ass.description}</p>
                      </div>
                    )}
                    {sub?.feedback && (
                      <div className="mb-3 md:mb-4 p-3 md:p-4 bg-blue-500/5 border border-blue-500/10 rounded-lg md:rounded-xl">
                        <p className="text-xs md:text-sm text-blue-400 font-semibold mb-1">💬 Feedback :</p>
                        <p className="text-slate-300 text-xs md:text-sm">{sub.feedback}</p>
                      </div>
                    )}
                    {sub?.submission_url && <div className="mb-3 md:mb-4"><SubmissionViewer submissionUrl={sub.submission_url} /></div>}
                    {isPaid && !sub && (
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedAssessment({ id: ass.id, title: ass.title })}
                        className="w-full flex items-center justify-center gap-2 px-5 md:px-6 py-3 md:py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 transition-all text-sm md:text-base">
                        <Send className="w-4 h-4 md:w-5 md:h-5" /> Soumettre mon travail
                      </motion.button>
                    )}
                  </div>
                );
              })}

              {/* Navigation bas */}
              <div className="flex items-center justify-between pt-4 md:pt-6 border-t border-[#1e293b]">
                <button onClick={goToPrevModule} disabled={activeModuleIndex === 0 && activeCourseIndex === 0}
                  className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 text-slate-400 hover:text-white disabled:opacity-20 transition-colors rounded-lg md:rounded-xl hover:bg-[#1e293b] text-xs md:text-sm">
                  <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" /> Précédent
                </button>
                <span className="text-[10px] md:text-xs text-slate-500">{activeModuleIndex + 1} / {totalModules}</span>
                <button onClick={goToNextModule} disabled={activeModuleIndex === modules.length - 1 && activeCourseIndex === courses.length - 1}
                  className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg md:rounded-xl font-medium transition-colors disabled:opacity-20 text-xs md:text-sm shadow-lg shadow-blue-500/20">
                  Suivant <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {selectedAssessment && (
          <SubmissionModal isOpen={!!selectedAssessment} onClose={() => setSelectedAssessment(null)}
            assessmentId={selectedAssessment.id} userStatus={userStatus} />
        )}
      </AnimatePresence>
    </div>
  );
}