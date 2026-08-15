'use client';

import { useState, useEffect } from 'react';
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
  ArrowLeft, ArrowRight, ExternalLink,
  BookMarked, Wrench
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
  courseCertificate?: any;
}

export function CourseProgram({ 
  courses, userStatus, passedAssessments, submissionsMap, certificateInfo, courseCertificate 
}: CourseProgramProps) {
  const { profile } = useStudent();
  const supabase = createClientComponent();
  const isPaid = userStatus?.trim().toUpperCase() === 'PAID';
  const [selectedAssessment, setSelectedAssessment] = useState<{ id: string; title: string } | null>(null);
  const [activeCourseIndex, setActiveCourseIndex] = useState(0);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState<Record<string, any[]>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<string, any>>({});

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
  
  const isLastModule = activeModuleIndex === totalModules - 1;
  const allModulesCompleted = completedModules === totalModules && totalModules > 0;

  const goToNextModule = () => {
    if (activeModuleIndex < modules.length - 1) setActiveModuleIndex(prev => prev + 1);
    else if (activeCourseIndex < courses.length - 1) { setActiveCourseIndex(prev => prev + 1); setActiveModuleIndex(0); }
  };

  const goToPrevModule = () => {
    if (activeModuleIndex > 0) setActiveModuleIndex(prev => prev - 1);
    else if (activeCourseIndex > 0) { setActiveCourseIndex(prev => prev - 1); setActiveModuleIndex((courses[activeCourseIndex - 1]?.modules?.length || 1) - 1); }
  };

  // Charger les QCM liés aux leçons de type QUIZ
  const loadQuizForModule = async (module: any) => {
    const quizLessons = module?.lessons?.filter((l: any) => l.content_type === 'QUIZ') || [];
    if (quizLessons.length === 0) return;

    const lessonIds = quizLessons.map((l: any) => l.id);
    const { data: questions } = await supabase
      .from('quiz_questions')
      .select('*')
      .in('lesson_id', lessonIds)
      .order('position', { ascending: true });

    if (questions && questions.length > 0) {
      setQuizQuestions(prev => ({ ...prev, [module.id]: questions }));
      if (profile) {
        const { data: answers } = await supabase
          .from('quiz_answers')
          .select('*')
          .eq('student_id', profile.id)
          .in('question_id', questions.map((q: any) => q.id));
        if (answers) {
          const map: Record<string, any> = {};
          answers.forEach((a: any) => { const qid = a.question_id ?? 0; if (qid) map[qid] = a; });
          setQuizAnswers(prev => ({ ...prev, [module.id]: map }));
        }
      }
    }
  };

  // Charger les QCM quand le module actif change
  useEffect(() => {
    if (activeModule && !quizQuestions[activeModule.id]) {
      loadQuizForModule(activeModule);
    }
  }, [activeModule?.id]);

  const handleAnswer = async (question: any, answer: string, moduleId: string) => {
    if (!profile) return;
    const isCorrect = answer === question.correct_answer;
    await supabase.from('quiz_answers').upsert(
      { question_id: question.id, student_id: profile.id, selected_answer: answer, is_correct: isCorrect },
      { onConflict: 'question_id,student_id' }
    );
    setQuizAnswers(prev => ({ ...prev, [moduleId]: { ...(prev[moduleId] || {}), [question.id]: { selected_answer: answer, is_correct: isCorrect } } }));
  };

  if (!courses?.length) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
        <BookOpen className="w-14 h-14 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400 text-base">Aucune formation disponible pour le moment.</p>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto pb-20 md:pb-24">
      {/* Barre de progression */}
      {isPaid && totalModules > 0 && (
        <div className="mb-6 md:mb-8 px-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Progression</span>
            <span className="text-xs text-blue-400 font-bold">{progressPercent}%</span>
          </div>
          <div className="h-1 bg-[#1e293b] rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="sticky top-0 z-20 bg-[#020617]/95 backdrop-blur-xl border-b border-[#1e293b] -mx-4 px-4 py-3 flex items-center justify-between mb-8 md:mb-10">
        <button onClick={goToPrevModule} disabled={activeModuleIndex === 0 && activeCourseIndex === 0}
          className="text-slate-400 hover:text-white disabled:opacity-20 transition-colors p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2">
          {modules.map((_: any, i: number) => {
            const modId = modules[i]?.assessments?.[0]?.id;
            const isPassed = modId && passedAssessments.includes(modId);
            return (
              <button key={i} onClick={() => setActiveModuleIndex(i)}
                className={`w-9 h-9 rounded-xl text-sm font-bold transition-all flex items-center justify-center ${
                  i === activeModuleIndex ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20 scale-110' : 
                  isPassed ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                  'bg-[#1e293b] text-slate-500 hover:bg-[#334155]'
                }`}>
                {isPassed ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </button>
            );
          })}
        </div>

        <button onClick={goToNextModule} disabled={activeModuleIndex === modules.length - 1 && activeCourseIndex === courses.length - 1}
          className="text-slate-400 hover:text-white disabled:opacity-20 transition-colors p-2">
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Contenu du module */}
      {activeModule && (
        <motion.div key={activeModule.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          
          {/* En-tête de la semaine */}
          <div className="mb-10 md:mb-12">
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full border border-blue-500/20">
                📅 Semaine {activeModule.week_number}/{totalModules}
              </span>
              {isModulePassed && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-400 text-xs font-bold rounded-full border border-green-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Validée
                </span>
              )}
              {isLastModule && allModulesCompleted && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-full border border-amber-500/20">
                  🎉 Formation terminée
                </span>
              )}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">{activeModule.title}</h2>
          </div>

          {/* Certificat à la fin */}
          {isLastModule && allModulesCompleted && courseCertificate && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-10 p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-500/10 rounded-2xl flex-shrink-0">
                  <Trophy className="w-7 h-7 text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-green-400 mb-1">🎉 Félicitations !</h3>
                  <p className="text-sm text-slate-300 mb-4">
                    Vous avez terminé cette formation avec succès. Votre certificat est prêt.
                  </p>
                  <a
                    href={courseCertificate.certificate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-green-500/20"
                  >
                    <Download className="w-4 h-4" /> Télécharger mon certificat
                  </a>
                </div>
              </div>
            </motion.div>
          )}

          {!isModuleUnlocked ? (
            <div className="text-center py-20">
              <Lock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Validez la semaine {activeModule.week_number - 1} pour débloquer celle-ci.</p>
            </div>
          ) : (
            <div className="space-y-12 md:space-y-14">
              
              {/* 📚 LEÇONS (théoriques et pratiques) */}
              {activeModule.lessons?.length > 0 && (
                <div className="space-y-10">
                  {activeModule.lessons?.map((lesson: any, li: number) => (
                    <div key={lesson.id}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                          lesson.content_type === 'VIDEO' ? 'bg-red-500/10 border-red-500/20' :
                          lesson.content_type === 'PDF' ? 'bg-orange-500/10 border-orange-500/20' :
                          lesson.content_type === 'LINK' ? 'bg-purple-500/10 border-purple-500/20' :
                          lesson.content_type === 'QUIZ' ? 'bg-violet-500/10 border-violet-500/20' :
                          'bg-blue-500/10 border-blue-500/20'
                        }`}>
                          {lesson.content_type === 'VIDEO' ? <Play className="w-5 h-5 text-red-400" /> :
                           lesson.content_type === 'PDF' ? <FileText className="w-5 h-5 text-orange-400" /> :
                           lesson.content_type === 'LINK' ? <ExternalLink className="w-5 h-5 text-purple-400" /> :
                           lesson.content_type === 'QUIZ' ? <HelpCircle className="w-5 h-5 text-violet-400" /> :
                           <FileText className="w-5 h-5 text-blue-400" />}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base md:text-lg font-bold text-white">{lesson.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {lesson.category === 'THEORIQUE' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded-full border border-blue-500/20">
                                <BookMarked className="w-3 h-3" /> Théorique
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-500/10 text-orange-400 text-[10px] font-bold rounded-full border border-orange-500/20">
                                <Wrench className="w-3 h-3" /> Pratique
                              </span>
                            )}
                            {lesson.content_type === 'VIDEO' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/10 text-red-400 text-[10px] font-bold rounded-full border border-red-500/20">🎥 Vidéo</span>
                            )}
                            {lesson.content_type === 'PDF' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-500/10 text-orange-400 text-[10px] font-bold rounded-full border border-orange-500/20">📄 PDF</span>
                            )}
                            {lesson.content_type === 'LINK' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[10px] font-bold rounded-full border border-purple-500/20">🔗 Lien</span>
                            )}
                            {lesson.content_type === 'QUIZ' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-500/10 text-violet-400 text-[10px] font-bold rounded-full border border-violet-500/20">🧠 QCM</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Contenu selon le type */}
                      {lesson.content_type === 'QUIZ' ? (
                        <div className="ml-13 space-y-4">
                          {quizQuestions[activeModule.id]?.filter((q: any) => q.lesson_id === lesson.id).map((q: any, qi: number) => {
                            const answer = (quizAnswers[activeModule.id] || {})[q.id];
                            return (
                              <div key={q.id} className={`p-4 md:p-5 rounded-xl border ${answer ? (answer.is_correct ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5') : 'border-[#1e293b]'}`}>
                                <p className="text-white font-semibold mb-3">Q{qi + 1}. {q.question}</p>
                                <div className="grid sm:grid-cols-2 gap-2">
                                  {['A', 'B', 'C', 'D'].map((letter: string) => (
                                    <button key={letter} onClick={() => !answer && handleAnswer(q, letter, activeModule.id)} disabled={!!answer}
                                      className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                        answer && letter === q.correct_answer ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                        answer && letter === answer.selected_answer && !answer.is_correct ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                        'bg-[#1e293b] text-slate-400 hover:text-white hover:bg-[#334155] border border-transparent'
                                      }`}>
                                      <span className="font-bold mr-2">{letter})</span>{q[`option_${letter.toLowerCase()}`]}
                                      {answer && letter === q.correct_answer && <Check className="w-4 h-4 inline ml-1 text-green-400" />}
                                      {answer && letter === answer.selected_answer && !answer.is_correct && <X className="w-4 h-4 inline ml-1 text-red-400" />}
                                    </button>
                                  ))}
                                </div>
                                {answer && (
                                  <p className={`mt-3 text-sm font-medium ${answer.is_correct ? 'text-green-400' : 'text-red-400'}`}>
                                    {answer.is_correct ? '✅ Bonne réponse !' : `❌ La bonne réponse était ${q.correct_answer}.`}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="ml-13">
                          {isPaid ? (
                            <ContentViewer contentType={lesson.content_type} contentUrl={lesson.content_url} contentBody={lesson.content_body} title={lesson.title} />
                          ) : (
                            <div className="text-amber-400 text-sm"><Lock className="w-4 h-4 inline mr-1" />Réservé aux membres payants</div>
                          )}
                        </div>
                      )}

                      {li < activeModule.lessons.length - 1 && (
                        <div className="mt-10 border-t border-[#1e293b]" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 🎯 ÉVALUATIONS (TP/EXAM) - inchangé */}
              {activeModule.assessments?.length > 0 && (
                <>
                  <div className="border-t border-[#1e293b] pt-10" />
                  {activeModule.assessments?.map((ass: any) => {
                    const sub = submissionsMap[ass.id];
                    return (
                      <div key={ass.id}>
                        <div className="flex items-center gap-2 mb-4 md:mb-6">
                          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0">
                            <PenTool className="w-5 h-5 text-yellow-400" />
                          </div>
                          <div>
                            <h3 className="text-base md:text-lg font-bold text-white">{ass.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 text-yellow-400 text-[10px] font-bold rounded-full border border-yellow-500/20">🎯 Validation</span>
                              {sub ? (
                                sub.status === 'PENDING' ? <span className="text-amber-400 text-xs">⏳ En attente</span> :
                                sub.status === 'PASSED' ? <span className="text-green-400 text-xs">✅ {sub.grade}/20</span> :
                                <span className="text-red-400 text-xs">❌ {sub.grade}/20</span>
                              ) : <span className="text-slate-500 text-xs">Non soumis</span>}
                            </div>
                          </div>
                        </div>

                        {ass.description && (
                          <div className="mb-6 p-4 md:p-5 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                            <p className="text-sm text-amber-400 font-semibold mb-2">📋 Consignes</p>
                            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{ass.description}</p>
                          </div>
                        )}

                        {sub?.feedback && (
                          <div className="mb-6 p-4 md:p-5 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                            <p className="text-sm text-blue-400 font-semibold mb-2">💬 Feedback du formateur</p>
                            <p className="text-slate-300 text-sm">{sub.feedback}</p>
                          </div>
                        )}

                        {sub?.submission_url && <div className="mb-6"><SubmissionViewer submissionUrl={sub.submission_url} /></div>}

                        {isPaid && !sub && (
                          <button
                            onClick={() => setSelectedAssessment({ id: ass.id, title: ass.title })}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-500/20 text-sm md:text-base">
                            <Send className="w-5 h-5" /> Soumettre mon travail
                          </button>
                        )}
                      </div>
                    );
                  })}
                </>
              )}

              {/* Navigation bas */}
              <div className="flex items-center justify-between pt-8 border-t border-[#1e293b]">
                <button onClick={goToPrevModule} disabled={activeModuleIndex === 0 && activeCourseIndex === 0}
                  className="flex items-center gap-2 px-5 py-3 bg-[#1e293b] hover:bg-[#334155] text-white rounded-xl font-medium transition-colors disabled:opacity-20 text-sm shadow-lg">
                  <ArrowLeft className="w-4 h-4" /> Semaine précédente
                </button>
                <span className="text-xs text-slate-500 font-medium">{activeModuleIndex + 1} / {totalModules}</span>
                <button onClick={goToNextModule} disabled={activeModuleIndex === modules.length - 1 && activeCourseIndex === courses.length - 1}
                  className="flex items-center gap-2 px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors disabled:opacity-20 text-sm shadow-lg shadow-blue-500/20">
                  Semaine suivante <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {selectedAssessment && (
          <SubmissionModal 
            isOpen={!!selectedAssessment} 
            onClose={() => setSelectedAssessment(null)}
            assessmentId={selectedAssessment.id} 
            userStatus={userStatus} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}