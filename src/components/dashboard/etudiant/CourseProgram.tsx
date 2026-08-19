'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import { useStudent } from '@/context/StudentContext';
import {
  Lock, CheckCircle2, Clock, FileText, Video,
  Send, Award, BookOpen, Loader2, Trophy, Star, PenTool,
  Play, Download, HelpCircle, Check, X,
  ArrowLeft, ArrowRight, ExternalLink, BookMarked, Wrench,
  GraduationCap, FileImage, Eye, TrendingUp, ChevronDown, ChevronUp,
  AlertCircle, RefreshCw, LockOpen
} from 'lucide-react';
import { SubmissionModal } from './SubmissionModal';
import ContentViewer from './ContentViewer';
import SubmissionViewer from './SubmissionViewer';
import HtmlContentViewer from '../../HtmlContentViewer';

interface CourseProgramProps {
  courses: any[];
  userStatus: string;
  passedAssessments: string[];
  submissionsMap: Record<string, any>;
  certificateInfo?: any;
  courseCertificate?: any;
}

type ModuleStep = 'theoretical' | 'practical' | 'quiz' | 'exam';

const TP_TARGET = 16;
const QUIZ_TARGET = 12;

export function CourseProgram({
  courses, userStatus, passedAssessments, submissionsMap, certificateInfo, courseCertificate
}: CourseProgramProps) {
  const { profile } = useStudent();
  const supabase = createClientComponent();
  const isPaid = userStatus?.trim().toUpperCase() === 'PAID';
  const [selectedAssessment, setSelectedAssessment] = useState<{ id: string; title: string } | null>(null);
  const [activeCourseIndex, setActiveCourseIndex] = useState(0);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeStep, setActiveStep] = useState<ModuleStep>('theoretical');
  const [quizQuestions, setQuizQuestions] = useState<Record<string, any[]>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<string, any>>({});
  const [quizScore, setQuizScore] = useState(0);
  const [tpOptions, setTpOptions] = useState<Record<string, any[]>>({});
  const [tpSelections, setTpSelections] = useState<Record<string, string>>({});
  const [tpCorrectCount, setTpCorrectCount] = useState(0);
  const [tpFailedAttempts, setTpFailedAttempts] = useState(0);
  const [quizFailedAttempts, setQuizFailedAttempts] = useState(0);
  const [showTpOptions, setShowTpOptions] = useState<Record<string, boolean>>({});
  const [showTpContent, setShowTpContent] = useState<Record<string, boolean>>({});
  const [selectedTp, setSelectedTp] = useState<Record<string, string>>({});
  const [tpFeedback, setTpFeedback] = useState<Record<string, { correct: boolean; message: string; attempts?: number }>>({});
  const [tpAttemptsCount, setTpAttemptsCount] = useState<Record<string, number>>({});
  const [quizAttemptsCount, setQuizAttemptsCount] = useState<Record<string, number>>({});
  const [resetCount, setResetCount] = useState(0);

  const activeCourse = courses[activeCourseIndex];
  const modules = activeCourse?.modules || [];
  const activeModule = modules[activeModuleIndex];

  const isFirstModule = activeModuleIndex === 0;
  const prevModuleAssessmentId = !isFirstModule ? modules[activeModuleIndex - 1]?.assessments?.[0]?.id : null;
  const isModuleUnlocked = isFirstModule || (prevModuleAssessmentId && passedAssessments.includes(prevModuleAssessmentId));

  const theoreticalLessons = (activeModule?.lessons
    ?.filter((l: any) => l.category === 'THEORIQUE')
    .sort((a: any, b: any) => a.position - b.position)) || [];
    
  const practicalLessons = (activeModule?.lessons
    ?.filter((l: any) => l.category === 'PRATIQUE' && l.content_type !== 'QUIZ')
    .sort((a: any, b: any) => a.position - b.position)) || [];
    
  const quizLessons = (activeModule?.lessons
    ?.filter((l: any) => l.content_type === 'QUIZ')
    .sort((a: any, b: any) => a.position - b.position)) || [];
    
  const assessments = activeModule?.assessments || [];

  // Score TP global
  const tpScore = Math.max(0, TP_TARGET - tpFailedAttempts);
  
  // Score QCM global
  const quizScoreDisplay = Math.max(0, QUIZ_TARGET - quizFailedAttempts);

  // TP validé si tous les TP sont validés
  const isTpValidated = tpCorrectCount >= practicalLessons.length && practicalLessons.length > 0;
  
  // QCM validé si toutes les questions sont bonnes
  const totalQuizQuestions = quizQuestions[activeModule?.id]?.length || 0;
  const isQuizValidated = quizScore >= totalQuizQuestions && totalQuizQuestions > 0;

  // Examen débloqué si TP validés ET QCM validés
  const isExamUnlocked = isTpValidated && isQuizValidated && isModuleUnlocked;

  // Bouton Recommencer si tout épuisé
  const canRestart = tpScore <= 0 && quizScoreDisplay <= 0 && (tpFailedAttempts > 0 || quizFailedAttempts > 0);

  const goToStep = (step: ModuleStep) => {
    setActiveStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToNextModule = () => {
    if (activeModuleIndex < modules.length - 1) setActiveModuleIndex(prev => prev + 1);
    setActiveStep('theoretical');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPrevModule = () => {
    if (activeModuleIndex > 0) setActiveModuleIndex(prev => prev - 1);
    setActiveStep('theoretical');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRestart = async () => {
    if (!profile) return;
    if (!confirm('Recommencer ? Toutes vos tentatives seront enregistrées, mais les scores seront réinitialisés.')) return;
    setTpFailedAttempts(0);
    setQuizFailedAttempts(0);
    setTpCorrectCount(0);
    setTpSelections({});
    setSelectedTp({});
    setTpFeedback({});
    setTpAttemptsCount({});
    setQuizScore(0);
    setQuizFailedAttempts(0);
    setQuizAnswers(prev => ({ ...prev, [activeModule.id]: {} }));
    setResetCount(prev => prev + 1);
  };

  const loadTpOptions = async (module: any) => {
    const tpIds = practicalLessons.map((l: any) => l.id);
    if (tpIds.length === 0) return;
    const { data } = await supabase
      .from('tp_options')
      .select('*')
      .in('lesson_id', tpIds)
      .order('position', { ascending: true });
    if (data) {
      const map: Record<string, any[]> = {};
      data.forEach((opt: any) => {
        if (!map[opt.lesson_id]) map[opt.lesson_id] = [];
        map[opt.lesson_id].push(opt);
      });
      setTpOptions(map);
    }
  };

  const loadQuizForModule = async (module: any) => {
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
          let failed = 0;
          answers.forEach((a: any) => {
            const qid = a.question_id ?? 0;
            if (qid) {
              map[qid] = a;
              if (!a.is_correct) failed++;
            }
          });
          setQuizAnswers(prev => ({ ...prev, [module.id]: map }));
          const correct = answers.filter(a => a.is_correct).length;
          setQuizScore(correct);
          setQuizFailedAttempts(failed);
          // Nombre de tentatives par question
          const attemptsMap: Record<string, number> = {};
          answers.forEach((a: any) => {
            const qid = a.question_id ?? 0;
            if (qid) attemptsMap[qid] = (attemptsMap[qid] || 0) + 1;
          });
          setQuizAttemptsCount(attemptsMap);
        }
      }
    }
  };

  const loadTpAttempts = async () => {
    if (!profile) return;
    const tpIds = practicalLessons.map((l: any) => l.id);
    if (tpIds.length === 0) return;
    const { data } = await supabase
      .from('tp_attempts')
      .select('*')
      .eq('student_id', profile.id)
      .in('lesson_id', tpIds);
    if (data) {
      const correctTpIds = new Set();
      const selectedMap: Record<string, string> = {};
      const attemptsMap: Record<string, number> = {};
      let failed = 0;
      data.forEach((attempt: any) => {
        if (attempt.selected_option === 'RÉINITIALISATION') return;
        attemptsMap[attempt.lesson_id] = (attemptsMap[attempt.lesson_id] || 0) + 1;
        if (attempt.is_correct) {
          correctTpIds.add(attempt.lesson_id);
          selectedMap[attempt.lesson_id] = attempt.selected_option;
        } else {
          failed++;
        }
      });
      setTpCorrectCount(correctTpIds.size);
      setTpFailedAttempts(failed);
      setTpSelections(selectedMap);
      setTpAttemptsCount(attemptsMap);
    }
  };

  useEffect(() => {
    if (activeModule && isModuleUnlocked) {
      loadTpOptions(activeModule);
      loadQuizForModule(activeModule);
      loadTpAttempts();
    }
  }, [activeModule?.id, practicalLessons.length, quizLessons.length, isModuleUnlocked]);

  const handleTpChoice = async (lesson: any, option: any) => {
    if (!profile) return;

    const currentAttempts = tpAttemptsCount[lesson.id] || 0;
    setTpAttemptsCount(prev => ({ ...prev, [lesson.id]: currentAttempts + 1 }));
    setSelectedTp(prev => ({ ...prev, [lesson.id]: option.option_text }));

    await supabase.from('tp_attempts').insert({
      student_id: profile.id,
      lesson_id: lesson.id,
      selected_option: option.option_text,
      is_correct: option.is_correct,
    });

    if (option.is_correct) {
      setTpSelections(prev => ({ ...prev, [lesson.id]: option.option_text }));
      setTpCorrectCount(prev => prev + 1);
      const attempts = (tpAttemptsCount[lesson.id] || 0) + 1;
      setTpFeedback(prev => ({ ...prev, [lesson.id]: { correct: true, message: `✅ Bonne réponse ! TP validé en ${attempts} tentative(s).`, attempts } }));
    } else {
      setTpFailedAttempts(prev => prev + 1);
      setTpFeedback(prev => ({ ...prev, [lesson.id]: { correct: false, message: '❌ Mauvaise réponse. Relisez le TP et réessayez.' } }));
    }
  };

  const handleAnswer = async (question: any, answer: string) => {
    if (!profile) return;
    const isCorrect = answer === question.correct_answer;

    const currentAttempts = quizAttemptsCount[question.id] || 0;
    setQuizAttemptsCount(prev => ({ ...prev, [question.id]: currentAttempts + 1 }));

    await supabase.from('quiz_answers').upsert(
      { question_id: question.id, student_id: profile.id, selected_answer: answer, is_correct: isCorrect },
      { onConflict: 'question_id,student_id' }
    );

    setQuizAnswers(prev => ({ ...prev, [activeModule.id]: { ...(prev[activeModule.id] || {}), [question.id]: { selected_answer: answer, is_correct: isCorrect } } }));

    const updatedAnswers = { ...(quizAnswers[activeModule.id] || {}), [question.id]: { selected_answer: answer, is_correct: isCorrect } };
    const correctCount = Object.values(updatedAnswers).filter(a => (a as any).is_correct).length;
    const failedCount = Object.values(updatedAnswers).filter(a => !(a as any).is_correct).length;
    setQuizScore(correctCount);
    setQuizFailedAttempts(failedCount);
  };

  // Déterminer si un TP est déverrouillé
  const isTpUnlocked = (index: number) => {
    if (index === 0) return true;
    const prevTp = practicalLessons[index - 1];
    return prevTp && tpSelections[prevTp.id] !== undefined;
  };

  // Déterminer si une question QCM est déverrouillée
  const isQuizQuestionUnlocked = (index: number) => {
    if (index === 0) return true;
    const prevQuestion = quizQuestions[activeModule?.id]?.[index - 1];
    return prevQuestion && quizAnswers[activeModule?.id]?.[prevQuestion.id]?.is_correct;
  };

  if (!courses?.length) {
    return (
      <div className="text-center py-20">
        <BookOpen className="w-14 h-14 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">Aucune formation disponible.</p>
      </div>
    );
  }

  if (!isModuleUnlocked) {
    return (
      <div className="w-full max-w-3xl mx-auto pb-20">
        {/* navigation modules + message module verrouillé */}
        <div className="sticky top-0 z-20 bg-[#020617]/95 backdrop-blur-xl border-b border-[#1e293b] -mx-4 px-4 py-3 flex items-center justify-between mb-8">
          <button onClick={goToPrevModule} disabled={activeModuleIndex === 0}
            className="text-slate-400 hover:text-white disabled:opacity-20 p-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5">
            {modules.map((mod: any, i: number) => {
              const modAssessmentId = mod.assessments?.[0]?.id;
              const isPassed = modAssessmentId && passedAssessments.includes(modAssessmentId);
              return (
                <button
                  key={i}
                  onClick={() => { setActiveModuleIndex(i); setActiveStep('theoretical'); }}
                  className={`w-8 h-8 rounded-lg text-sm font-bold transition-all flex items-center justify-center ${
                    i === activeModuleIndex
                      ? 'bg-amber-500 text-white'
                      : isPassed
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </button>
              );
            })}
          </div>
          <button onClick={goToNextModule} disabled={activeModuleIndex === modules.length - 1}
            className="text-slate-400 hover:text-white disabled:opacity-20 p-2">
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center py-16">
          <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Module verrouillé</h2>
          <p className="text-amber-400 text-base max-w-md mx-auto">
            ⚠️ Vous devez valider le module {activeModuleIndex} avant de pouvoir accéder à ce module.
          </p>
          <button
            onClick={goToPrevModule}
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au module {activeModuleIndex}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto pb-20">
      {/* Bandeau de progression */}
      <div className="mb-6 p-5 bg-gradient-to-r from-slate-900/80 to-slate-900/50 border border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Progression du module
          </h3>
          <span className="text-sm text-slate-400">
            {activeModuleIndex + 1}/{modules.length}
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-400 flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Travaux Pratiques
              </span>
              <span className="text-slate-400">
                {tpScore}/{TP_TARGET}
                {isTpValidated && <span className="text-green-400 font-bold ml-1">✓ Validé</span>}
              </span>
            </div>
            <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isTpValidated ? 'bg-green-500' : tpScore < TP_TARGET ? 'bg-amber-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min((tpScore / TP_TARGET) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-400 flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                QCM
              </span>
              <span className="text-slate-400">
                {quizScoreDisplay}/{QUIZ_TARGET}
                {isQuizValidated && <span className="text-green-400 font-bold ml-1">✓ Validé</span>}
              </span>
            </div>
            <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isQuizValidated ? 'bg-green-500' : quizScoreDisplay < QUIZ_TARGET ? 'bg-amber-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min((quizScoreDisplay / QUIZ_TARGET) * 100, 100)}%` }}
              />
            </div>
          </div>

          {canRestart && (
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={handleRestart}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Recommencer (réinitialiser mes points)
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-slate-400 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Examen
            </span>
            {isExamUnlocked ? (
              <span className="text-green-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Débloqué
              </span>
            ) : (
              <span className="text-slate-500 flex items-center gap-1">
                <Lock className="w-4 h-4" /> Verrouillé
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation modules */}
      <div className="sticky top-0 z-20 bg-[#020617]/95 backdrop-blur-xl border-b border-[#1e293b] -mx-4 px-4 py-3 flex items-center justify-between mb-6">
        <button onClick={goToPrevModule} disabled={activeModuleIndex === 0}
          className="text-slate-400 hover:text-white disabled:opacity-20 p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1.5">
          {modules.map((mod: any, i: number) => {
            const modAssessmentId = mod.assessments?.[0]?.id;
            const isPassed = modAssessmentId && passedAssessments.includes(modAssessmentId);
            return (
              <button
                key={i}
                onClick={() => { setActiveModuleIndex(i); setActiveStep('theoretical'); }}
                className={`w-8 h-8 rounded-lg text-sm font-bold transition-all flex items-center justify-center ${
                  i === activeModuleIndex
                    ? 'bg-blue-500 text-white'
                    : isPassed
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {isPassed ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </button>
            );
          })}
        </div>
        <button onClick={goToNextModule} disabled={activeModuleIndex === modules.length - 1}
          className="text-slate-400 hover:text-white disabled:opacity-20 p-2">
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Titre du module */}
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-white">{activeModule?.title}</h2>
      </div>

      {/* Onglets */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        <button onClick={() => goToStep('theoretical')}
          className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl text-xs font-medium transition-all ${
            activeStep === 'theoretical' ? 'bg-blue-500 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}>
          <BookMarked className="w-5 h-5" />
          Lire
          <span className="text-[10px]">Théorique</span>
        </button>
        <button onClick={() => goToStep('practical')}
          className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl text-xs font-medium transition-all ${
            activeStep === 'practical' ? 'bg-blue-500 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}>
          <Wrench className="w-5 h-5" />
          TP
          <span className="text-[10px]">{tpScore}/{TP_TARGET}</span>
        </button>
        <button onClick={() => goToStep('quiz')}
          className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl text-xs font-medium transition-all ${
            activeStep === 'quiz' ? 'bg-blue-500 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}>
          <HelpCircle className="w-5 h-5" />
          QCM
          <span className="text-[10px]">{quizScoreDisplay}/{QUIZ_TARGET}</span>
        </button>
        <button onClick={() => goToStep('exam')}
          className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl text-xs font-medium transition-all ${
            activeStep === 'exam' ? 'bg-blue-500 text-white shadow-lg' :
            isExamUnlocked ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
            'bg-slate-800 text-slate-400 hover:text-white'
          }`}>
          <GraduationCap className="w-5 h-5" />
          Examen
          <span className="text-[10px]">{isExamUnlocked ? 'Débloqué' : '🔒'}</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* THÉORIQUE */}
        {activeStep === 'theoretical' && (
          <motion.div key="theoretical" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            {theoreticalLessons.length === 0 ? (
              <p className="text-center text-slate-500 py-8">Aucun contenu théorique</p>
            ) : (
              theoreticalLessons.map((lesson: any) => (
                <div key={lesson.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookMarked className="w-4 h-4 text-blue-400" />
                    </div>
                    <h3 className="text-white font-semibold text-sm md:text-base">{lesson.title}</h3>
                  </div>
                  <ContentViewer contentType={lesson.content_type} contentUrl={lesson.content_url} contentBody={lesson.content_body} title={lesson.title} />
                </div>
              ))
            )}
            <div className="flex justify-end pt-4">
              <button onClick={() => goToStep('practical')}
                className="flex items-center gap-2 px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors">
                Passer aux TP <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* PRATIQUE (TP) avec verrouillage séquentiel */}
        {activeStep === 'practical' && (
          <motion.div key="practical" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            {practicalLessons.length === 0 ? (
              <p className="text-center text-slate-500 py-8">Aucun TP pour ce module</p>
            ) : (
              practicalLessons.map((lesson: any, index: number) => {
                const isUnlocked = isTpUnlocked(index);
                const isDone = tpSelections[lesson.id] !== undefined;
                const isCurrent = index === practicalLessons.findIndex(l => l.id === lesson.id);
                return (
                  <div key={lesson.id} className={`bg-slate-900/50 border rounded-xl overflow-hidden ${!isUnlocked ? 'border-slate-800 opacity-60' : 'border-slate-800'}`}>
                    {/* Header TP */}
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isDone ? 'bg-green-500/10' : 'bg-orange-500/10'}`}>
                          {isDone ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Wrench className="w-4 h-4 text-orange-400" />}
                        </div>
                        <span className="text-white font-medium text-sm">TP {index + 1} : {lesson.title}</span>
                      </div>
                      {!isUnlocked ? (
                        <Lock className="w-4 h-4 text-slate-600" />
                      ) : (
                        <button onClick={() => setShowTpContent(prev => ({ ...prev, [lesson.id]: !prev[lesson.id] }))}
                          className="text-slate-400 hover:text-white">
                          {showTpContent[lesson.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      )}
                    </div>

                    {!isUnlocked && (
                      <div className="px-4 pb-4">
                        <p className="text-amber-400 text-sm">🔒 Validez le TP {index} pour débloquer ce TP.</p>
                      </div>
                    )}

                    {isUnlocked && showTpContent[lesson.id] && (
                      <div className="p-4 border-t border-slate-800 space-y-3">
                        <ContentViewer contentType={lesson.content_type} contentUrl={lesson.content_url} contentBody={lesson.content_body} title={lesson.title} />

                        {tpFeedback[lesson.id] && (
                          <div className={`p-3 rounded-lg ${tpFeedback[lesson.id].correct ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                            <p className={`text-sm font-medium ${tpFeedback[lesson.id].correct ? 'text-green-400' : 'text-red-400'}`}>
                              {tpFeedback[lesson.id].message}
                            </p>
                          </div>
                        )}

                        <button
                          onClick={() => setShowTpOptions(prev => ({ ...prev, [lesson.id]: !prev[lesson.id] }))}
                          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-purple-500/30 rounded-xl text-purple-400 hover:border-purple-500/50 transition-colors text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          {showTpOptions[lesson.id] ? 'Masquer les propositions' : 'Voir les propositions de correction'}
                        </button>

                        {showTpOptions[lesson.id] && tpOptions[lesson.id] && (
                          <div className="space-y-2">
                            {tpOptions[lesson.id].map((option: any, oi: number) => {
                              const isSelected = tpSelections[lesson.id] === option.option_text;
                              const isCurrentChoice = selectedTp[lesson.id] === option.option_text && !isSelected;
                              return (
                                <div key={option.id} className={`rounded-xl border transition-all ${isSelected ? 'bg-green-500/10 border-green-500/30' : isCurrentChoice ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
                                  <div className="p-3">
                                    <p className={`text-sm font-bold mb-1 ${isSelected ? 'text-green-400' : 'text-purple-400'}`}>
                                      Proposition {String.fromCharCode(65 + oi)}
                                    </p>
                                    {option.option_text.startsWith('<') ? (
                                      <HtmlContentViewer content={option.option_text} />
                                    ) : (
                                      <p className={`text-sm ${isSelected ? 'text-green-400' : 'text-white'}`}>{option.option_text}</p>
                                    )}
                                  </div>
                                  {!isSelected && (
                                    <button
                                      onClick={() => handleTpChoice(lesson, option)}
                                      className="w-full py-2.5 px-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-medium rounded-b-xl transition-colors"
                                    >
                                      Je choisis cette réponse
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            <div className="flex justify-between pt-4">
              <button onClick={() => goToStep('theoretical')}
                className="px-4 py-2 bg-slate-800 text-slate-400 rounded-xl text-sm">
                ← Théorique
              </button>
              <button 
                onClick={() => goToStep('quiz')}
                disabled={!isTpValidated}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium ${isTpValidated ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-slate-800/50 text-slate-600 cursor-not-allowed'}`}>
                Passer au QCM {!isTpValidated && '🔒'}
              </button>
            </div>
          </motion.div>
        )}

        {/* QCM avec verrouillage séquentiel des questions */}
        {activeStep === 'quiz' && (
          <motion.div key="quiz" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            {quizLessons.map((lesson: any) => (
              <div key={lesson.id} className="space-y-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-violet-400" /> {lesson.title}
                </h3>
                {quizQuestions[activeModule.id]?.map((q: any, qi: number) => {
                  const isUnlocked = isQuizQuestionUnlocked(qi);
                  const answer = (quizAnswers[activeModule.id] || {})[q.id];
                  return (
                    <div key={q.id} className={`p-4 rounded-xl border ${!isUnlocked ? 'border-slate-800 bg-slate-900/30 opacity-60' : answer ? (answer.is_correct ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5') : 'border-[#1e293b]'}`}>
                      <div className="flex items-center justify-between">
                        <p className="text-white font-semibold mb-3">Q{qi + 1}. {q.question}</p>
                        {!isUnlocked && <Lock className="w-4 h-4 text-slate-600" />}
                      </div>
                      {isUnlocked && (
                        <>
                          <div className="grid sm:grid-cols-2 gap-2">
                            {['A', 'B', 'C', 'D'].map((letter: string) => (
                              <button key={letter} onClick={() => !answer && handleAnswer(q, letter)} disabled={!!answer}
                                className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                  answer && letter === q.correct_answer ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                  answer && letter === answer.selected_answer && !answer.is_correct ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                  'bg-[#1e293b] text-slate-400 hover:text-white hover:bg-[#334155]'
                                }`}>
                                <span className="font-bold mr-2">{letter})</span>{q[`option_${letter.toLowerCase()}`]}
                              </button>
                            ))}
                          </div>
                          {answer && (
                            <p className={`mt-3 text-sm font-medium ${answer.is_correct ? 'text-green-400' : 'text-red-400'}`}>
                              {answer.is_correct ? '✅ Bonne réponse !' : `❌ La bonne réponse était ${q.correct_answer}.`}
                            </p>
                          )}
                          {answer && answer.is_correct && (
                            <p className="text-xs text-slate-500 mt-1">
                              Réussi en {quizAttemptsCount[q.id] || 1} tentative(s)
                            </p>
                          )}
                        </>
                      )}
                      {!isUnlocked && (
                        <p className="text-amber-400 text-sm mt-2">🔒 Répondez correctement à la question précédente pour débloquer celle-ci.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            <div className="flex justify-between pt-4">
              <button onClick={() => goToStep('practical')}
                className="px-4 py-2 bg-slate-800 text-slate-400 rounded-xl text-sm">
                ← TP
              </button>
              <button onClick={() => goToStep('exam')}
                disabled={!isExamUnlocked}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium ${isExamUnlocked ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-slate-800/50 text-slate-600 cursor-not-allowed'}`}>
                Passer à l'Examen {!isExamUnlocked && '🔒'}
              </button>
            </div>
          </motion.div>
        )}

        {/* EXAMEN */}
        {activeStep === 'exam' && (
          <motion.div key="exam" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            {!isExamUnlocked ? (
              <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-xl">
                <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-10 h-10 text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Examen verrouillé</h2>
                <div className="space-y-3 max-w-md mx-auto">
                  {!isTpValidated && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <p className="text-amber-400 text-sm font-medium">
                        ⚠️ Vous devez valider tous les TP ({tpCorrectCount}/{practicalLessons.length})
                      </p>
                    </div>
                  )}
                  {!isQuizValidated && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <p className="text-amber-400 text-sm font-medium">
                        ⚠️ Vous devez valider le QCM ({quizScore}/{totalQuizQuestions})
                      </p>
                    </div>
                  )}
                  <p className="text-slate-400 text-sm">
                    Répondez à tous les TP et au QCM avant de pouvoir soumettre l'examen.
                  </p>
                  <button
                    onClick={() => goToStep('practical')}
                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors"
                  >
                    <Wrench className="w-4 h-4" />
                    Aller aux TP
                  </button>
                </div>
              </div>
            ) : (
              assessments.map((ass: any) => {
                const sub = submissionsMap[ass.id];
                return (
                  <div key={ass.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                    <h3 className="text-white font-semibold mb-3">{ass.title}</h3>
                    {ass.description && (
                      <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl mb-3">
                        {ass.description.startsWith('<') ? (
                          <HtmlContentViewer content={ass.description} />
                        ) : (
                          <p className="text-slate-300 text-sm whitespace-pre-wrap">{ass.description}</p>
                        )}
                      </div>
                    )}
                    {isPaid && !sub ? (
                      <button
                        onClick={() => setSelectedAssessment({ id: ass.id, title: ass.title })}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl"
                      >
                        <Send className="w-5 h-5" /> Soumettre mon travail
                      </button>
                    ) : sub ? (
                      <p className={`text-sm ${sub.status === 'PASSED' ? 'text-green-400' : 'text-amber-400'}`}>
                        {sub.status === 'PASSED' ? `✅ Validé - ${sub.grade}/20` : '⏳ En attente de correction'}
                      </p>
                    ) : null}
                  </div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>

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