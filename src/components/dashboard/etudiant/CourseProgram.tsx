'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import { useStudent } from '@/context/StudentContext';
import {
  Lock, CheckCircle2, BookOpen, Loader2, HelpCircle,
  ArrowLeft, ArrowRight, BookMarked, Wrench,
  GraduationCap, TrendingUp, ChevronDown, ChevronUp,
  ListChecks, XCircle, Send, Star
} from 'lucide-react';
import { SubmissionModal } from './SubmissionModal';
import ContentViewer from './ContentViewer';
import HtmlContentViewer from '../../HtmlContentViewer';

interface CourseProgramProps {
  courses: any[];
  userStatus: string;
  passedAssessments: string[];
  submissionsMap: Record<string, any>;
}

type ModuleStep = 'theoretical' | 'practical' | 'quiz' | 'exam';

export function CourseProgram({
  courses, userStatus, passedAssessments, submissionsMap
}: CourseProgramProps) {
  const { profile } = useStudent();
  const supabase = createClientComponent();
  const [selectedAssessment, setSelectedAssessment] = useState<{ id: string; title: string } | null>(null);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeStep, setActiveStep] = useState<ModuleStep>('theoretical');

  // QCM states
  const [quizQuestions, setQuizQuestions] = useState<Record<string, any[]>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<string, any>>({});
  const [quizScore, setQuizScore] = useState(0);
  const [quizAttemptsCount, setQuizAttemptsCount] = useState<Record<string, number>>({});

  // TP question states
  const [tpQuestions, setTpQuestions] = useState<Record<string, any[]>>({});
  const [tpQuestionOptions, setTpQuestionOptions] = useState<Record<string, any[]>>({});
  const [tpQuestionSelections, setTpQuestionSelections] = useState<Record<string, string>>({});
  const [tpQuestionCorrectSelected, setTpQuestionCorrectSelected] = useState<Record<string, boolean>>({});
  const [tpQuestionFeedback, setTpQuestionFeedback] = useState<Record<string, { correct: boolean; message: string }>>({});
  const [tpQuestionAttempts, setTpQuestionAttempts] = useState<Record<string, number>>({});
  const [tpQuestionChosenOption, setTpQuestionChosenOption] = useState<Record<string, string>>({});
  const [loadingTP, setLoadingTP] = useState<Record<string, boolean>>({});

  // UI
  const [showTpContent, setShowTpContent] = useState<Record<string, boolean>>({});
  const [selectedQuizOption, setSelectedQuizOption] = useState<Record<string, string>>({});
  const [quizCorrectSelected, setQuizCorrectSelected] = useState<Record<string, boolean>>({});
  const [quizFeedback, setQuizFeedback] = useState<Record<string, string>>({});

  // Examen final
  const [finalAssessment, setFinalAssessment] = useState<any | null>(null);

  const activeCourse = courses[0];
  const modules = useMemo(() => activeCourse?.modules || [], [activeCourse]);
  const activeModule = modules[activeModuleIndex];
  const isFinalExamActive = activeModuleIndex === modules.length && !!finalAssessment;

  const isFirstModule = activeModuleIndex === 0;
  const prevModuleAssessmentId = !isFirstModule ? modules[activeModuleIndex - 1]?.assessments?.[0]?.id : null;
  const isModuleUnlocked = isFirstModule || (prevModuleAssessmentId && passedAssessments.includes(prevModuleAssessmentId));

  // Helper pour scroller
  const scrollToTop = () => {
    const main = document.getElementById('main-content');
    if (main) {
      main.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Charger l'examen final (différé pour éviter setState synchrone)
  useEffect(() => {
    const loadFinalAssessment = async () => {
      if (!activeCourse) return;
      const { data } = await supabase
        .from('assessments')
        .select('*')
        .eq('course_id', activeCourse.id)
        .eq('type', 'FINAL')
        .maybeSingle();
      setFinalAssessment(data || null);
    };
    const timer = setTimeout(loadFinalAssessment, 0);
    return () => clearTimeout(timer);
  }, [activeCourse, supabase]);

  const getPositionFromTitle = (title: string) => {
    if (!title) return 9999;
    const match = title.match(/TP\s*(\d+)/i);
    return match ? parseInt(match[1], 10) : 9999;
  };

  const theoreticalLessons = useMemo(() => {
    return (activeModule?.lessons || [])
      .filter((l: any) => l.category === 'THEORIQUE')
      .sort((a: any, b: any) => Number(a.position) - Number(b.position));
  }, [activeModule?.lessons]);

  const practicalLessons = useMemo(() => {
    return (activeModule?.lessons || [])
      .filter((l: any) => l.category === 'PRATIQUE' && l.content_type !== 'QUIZ')
      .map((l: any) => ({
        ...l,
        position: l.position ?? getPositionFromTitle(l.title),
      }))
      .sort((a: any, b: any) => Number(a.position) - Number(b.position));
  }, [activeModule?.lessons]);

  const quizLessons = useMemo(() => {
    return (activeModule?.lessons || [])
      .filter((l: any) => l.content_type === 'QUIZ')
      .sort((a: any, b: any) => Number(a.position) - Number(b.position));
  }, [activeModule?.lessons]);

  const assessments = activeModule?.assessments || [];

  const totalTp = practicalLessons.length;
  const totalQuiz = quizQuestions[activeModule?.id]?.length || 0;

  const totalTpQuestions = practicalLessons.reduce(
    (acc: number, lesson: any) => acc + (tpQuestions[lesson.id]?.length || 0),
    0
  );
  const tpValidatedQuestions = Object.keys(tpQuestionSelections).length;

  // Dérivations via useMemo
  const allModulesPassed = useMemo(() => {
    const moduleExamIds = modules.flatMap((mod: any) => mod.assessments?.map((a: any) => a.id) || []);
    return moduleExamIds.length > 0 && moduleExamIds.every((id: string) => passedAssessments.includes(id));
  }, [modules, passedAssessments]);

  const { tpSelections, tpCorrectCount } = useMemo(() => {
    const validTpMap: Record<string, string> = {};
    let count = 0;
    practicalLessons.forEach((lesson: any) => {
      const questions = tpQuestions[lesson.id] || [];
      if (questions.length > 0 && questions.every((q: any) => tpQuestionSelections[q.id] !== undefined)) {
        validTpMap[lesson.id] = 'validated';
        count++;
      }
    });
    return { tpSelections: validTpMap, tpCorrectCount: count };
  }, [tpQuestionSelections, tpQuestions, practicalLessons]);

  const isTpValidated = tpCorrectCount >= totalTp && totalTp > 0;
  const isQuizValidated = quizScore >= totalQuiz && totalQuiz > 0;
  const isExamUnlocked = isTpValidated && isQuizValidated && isModuleUnlocked;

  const tpNoteSur20 = totalTpQuestions > 0 ? Math.round((tpValidatedQuestions / totalTpQuestions) * 20) : 0;
  const quizNoteSur10 = totalQuiz > 0 ? Math.round((quizScore / totalQuiz) * 10) : 0;

  const goToStep = (step: ModuleStep) => {
    setActiveStep(step);
    scrollToTop();
  };

  const goToNextModule = () => {
    if (activeModuleIndex < modules.length - 1) {
      setActiveModuleIndex(prev => prev + 1);
      setActiveStep('theoretical');
      scrollToTop();
    } else if (finalAssessment && allModulesPassed) {
      setActiveModuleIndex(modules.length);
      scrollToTop();
    }
  };

  const goToPrevModule = () => {
    if (activeModuleIndex > 0) {
      setActiveModuleIndex(prev => prev - 1);
      setActiveStep('theoretical');
      scrollToTop();
    }
  };

  // Charger les questions d'un TP et leurs options (useCallback)
  const loadTpQuestionsAndOptions = useCallback(async (lessonId: string) => {
    setLoadingTP(prev => ({ ...prev, [lessonId]: true }));
    const { data: questions } = await supabase
      .from('tp_questions')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('position', { ascending: true });

    if (questions && questions.length > 0) {
      setTpQuestions(prev => ({ ...prev, [lessonId]: questions }));
      const questionIds = questions.map((q: any) => q.id);
      const { data: options } = await supabase
        .from('tp_options')
        .select('*')
        .in('tp_question_id', questionIds)
        .order('position', { ascending: true });

      if (options) {
        const optionsMap: Record<string, any[]> = {};
        options.forEach((opt: any) => {
          if (!optionsMap[opt.tp_question_id]) optionsMap[opt.tp_question_id] = [];
          optionsMap[opt.tp_question_id].push(opt);
        });
        setTpQuestionOptions(prev => ({ ...prev, ...optionsMap }));
      }

      if (profile) {
        const { data: attempts } = await supabase
          .from('tp_attempts')
          .select('*')
          .eq('student_id', profile.id)
          .in('tp_question_id', questionIds);

        if (attempts) {
          const correctMap: Record<string, string> = {};
          const attemptsMap: Record<string, number> = {};
          attempts.forEach((att: any) => {
            if (!att.is_correct) return;
            correctMap[att.tp_question_id] = att.selected_option;
            attemptsMap[att.tp_question_id] = (attemptsMap[att.tp_question_id] || 0) + 1;
          });
          setTpQuestionSelections(prev => ({ ...prev, ...correctMap }));
          setTpQuestionAttempts(prev => ({ ...prev, ...attemptsMap }));
        }
      }
    }
    setLoadingTP(prev => ({ ...prev, [lessonId]: false }));
  }, [supabase, profile]);

  const loadQuizForModule = useCallback(async (module: any) => {
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
        const correctCountSet = new Set<string>(); // pour compter les questions réussies

        // Ne garder que les réponses correctes pour chaque question
        answers.forEach((a: any) => {
          const qid = a.question_id ?? 0;
          if (qid && a.is_correct) {
            map[qid] = { selected_answer: a.selected_answer, is_correct: true };
            correctCountSet.add(qid);
          }
        });

        setQuizAnswers(prev => ({ ...prev, [module.id]: map }));
        setQuizScore(correctCountSet.size);

        // Calculer les tentatives par question
        const attemptsMap: Record<string, number> = {};
        answers.forEach((a: any) => {
          const qid = a.question_id ?? 0;
          if (qid) attemptsMap[qid] = (attemptsMap[qid] || 0) + 1;
        });
        setQuizAttemptsCount(attemptsMap);
      }
    }
  }
}, [quizLessons, supabase, profile]);

  // Effet principal différé pour charger TP et QCM
  useEffect(() => {
    if (activeModule && isModuleUnlocked && !isFinalExamActive) {
      const timer = setTimeout(() => {
        practicalLessons.forEach((lesson: any) => {
          loadTpQuestionsAndOptions(lesson.id);
        });
        loadQuizForModule(activeModule);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeModule, isModuleUnlocked, isFinalExamActive, practicalLessons, loadTpQuestionsAndOptions, loadQuizForModule]);

  const handleTpOptionClick = async (lessonId: string, questionId: string, optionText: string, isCorrect: boolean) => {
    if (!profile) return;
    const currentAttempts = tpQuestionAttempts[questionId] || 0;
    setTpQuestionChosenOption(prev => ({ ...prev, [questionId]: optionText }));

    await supabase.from('tp_attempts').insert({
      student_id: profile.id,
      lesson_id: lessonId,
      tp_question_id: questionId,
      selected_option: optionText,
      is_correct: isCorrect,
    });

    setTpQuestionAttempts(prev => ({ ...prev, [questionId]: currentAttempts + 1 }));

    if (isCorrect) {
      setTpQuestionCorrectSelected(prev => ({ ...prev, [questionId]: true }));
      setTpQuestionFeedback(prev => ({
        ...prev,
        [questionId]: { correct: true, message: '✅ Bonne réponse ! Cliquez sur Valider pour confirmer.' }
      }));
    } else {
      setTpQuestionCorrectSelected(prev => ({ ...prev, [questionId]: false }));
      setTpQuestionFeedback(prev => ({
        ...prev,
        [questionId]: { correct: false, message: '❌ Mauvaise réponse' }
      }));
    }
  };

  const handleTpQuestionValidate = async (lessonId: string, questionId: string, optionText: string) => {
    if (!profile) return;
    const updatedSelections = { ...tpQuestionSelections, [questionId]: optionText };
    setTpQuestionSelections(updatedSelections);
    setTpQuestionCorrectSelected(prev => ({ ...prev, [questionId]: false }));
    setTpQuestionFeedback(prev => ({
      ...prev,
      [questionId]: { correct: true, message: `✅ Question validée en ${tpQuestionAttempts[questionId] || 1} tentative(s).` }
    }));
  };

  const handleQuizChoice = async (question: any, answer: string) => {
  if (!profile) return;
  const isCorrect = answer === question.correct_answer;

  const { error } = await supabase
    .from('quiz_answers')
    .insert({
      question_id: question.id,
      student_id: profile.id,
      selected_answer: answer,
      is_correct: isCorrect,
    });

  if (error) {
    console.error('Erreur insertion quiz answer:', error);
    setQuizFeedback(prev => ({ ...prev, [question.id]: '❌ Erreur lors de l\'enregistrement.' }));
    return;
  }

  const currentAttempts = quizAttemptsCount[question.id] || 0;
  setQuizAttemptsCount(prev => ({ ...prev, [question.id]: currentAttempts + 1 }));

  if (isCorrect) {
    setSelectedQuizOption(prev => ({ ...prev, [question.id]: answer }));
    setQuizCorrectSelected(prev => ({ ...prev, [question.id]: true }));
    setQuizFeedback(prev => ({ ...prev, [question.id]: '✅ Bonne réponse ! Cliquez sur Valider pour confirmer.' }));
  } else {
    setQuizCorrectSelected(prev => ({ ...prev, [question.id]: false }));
    setQuizFeedback(prev => ({ ...prev, [question.id]: `❌ Mauvaise réponse. Relisez et réessayez. (Tentative ${currentAttempts + 1})` }));
  }
};

  const handleQuizValidate = async (question: any, answer: string) => {
  if (!profile) return;

  // Mise à jour de l'état local pour débloquer la question suivante
  setQuizAnswers(prev => ({
    ...prev,
    [activeModule.id]: {
      ...(prev[activeModule.id] || {}),
      [question.id]: { selected_answer: answer, is_correct: true }
    }
  }));
  setQuizScore(prev => prev + 1);
  setQuizFeedback(prev => ({ ...prev, [question.id]: `✅ Question validée en ${quizAttemptsCount[question.id] || 1} tentative(s).` }));
  setQuizCorrectSelected(prev => ({ ...prev, [question.id]: false }));
  setSelectedQuizOption(prev => ({ ...prev, [question.id]: '' }));
};

  const isTpUnlocked = (index: number) => {
    if (index === 0) return true;
    const prevTp = practicalLessons[index - 1];
    if (!prevTp) return false;
    const questions = tpQuestions[prevTp.id] || [];
    return questions.every((q: any) => tpQuestionSelections[q.id] !== undefined);
  };

  const isQuizQuestionUnlocked = (index: number) => {
    if (index === 0) return true;
    const prevQuestion = quizQuestions[activeModule?.id]?.[index - 1];
    return prevQuestion && quizAnswers[activeModule?.id]?.[prevQuestion.id]?.is_correct;
  };

  const isTpQuestionUnlocked = (lessonId: string, questionIndex: number) => {
    if (questionIndex === 0) return true;
    const questions = tpQuestions[lessonId] || [];
    const prevQuestion = questions[questionIndex - 1];
    return prevQuestion && tpQuestionSelections[prevQuestion.id] !== undefined;
  };

  if (!courses?.length) {
    return (
      <div className="text-center py-20">
        <BookOpen className="w-14 h-14 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">Aucune formation disponible.</p>
      </div>
    );
  }

  if (isFinalExamActive) {
    // Vue examen final
    return (
      <div className="w-full max-w-3xl mx-auto pb-20">
        {/* Navigation modules avec bouton final actif */}
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
                  onClick={() => { setActiveModuleIndex(i); setActiveStep('theoretical'); scrollToTop(); }}
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
            <button
              onClick={() => { setActiveModuleIndex(modules.length); scrollToTop(); }}
              className={`w-8 h-8 rounded-lg text-sm font-bold transition-all flex items-center justify-center ${
                isFinalExamActive ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Star className="w-4 h-4" />
            </button>
          </div>
          <button onClick={goToNextModule} disabled={activeModuleIndex === modules.length}
            className="text-slate-400 hover:text-white disabled:opacity-20 p-2">
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Contenu examen final */}
        <div className="bg-slate-900/50 border border-blue-500/30 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-400" />
            Examen final de formation
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Vous avez validé tous les modules. Cet examen final est requis pour obtenir votre certificat.
          </p>

          {finalAssessment.description && (
            <div className="mt-4 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
              <HtmlContentViewer content={finalAssessment.description} />
            </div>
          )}

          {(() => {
  const sub = submissionsMap[finalAssessment.id];
  if (sub) {
    return (
      <div className="mt-4 space-y-3">
        <div className={`p-3 rounded-lg ${
          sub.status === 'PASSED' 
            ? 'bg-green-500/10 border border-green-500/20' 
            : sub.status === 'FAILED' 
              ? 'bg-red-500/10 border border-red-500/20' 
              : 'bg-amber-500/10 border border-amber-500/20'
        }`}>
          <p className={`text-sm font-medium ${
            sub.status === 'PASSED' ? 'text-green-400' : sub.status === 'FAILED' ? 'text-red-400' : 'text-amber-400'
          }`}>
            {sub.status === 'PASSED' 
              ? `✅ Examen final validé - ${sub.grade}/20`
              : sub.status === 'FAILED' 
                ? `❌ Non validé - ${sub.grade}/20. Vous pouvez renvoyer votre travail.`
                : `⏳ Vous avez déjà soumis votre travail. En attente de correction.`}
          </p>
        </div>
        {sub.status !== 'PASSED' && (
          <button
            onClick={() => setSelectedAssessment({ id: finalAssessment.id, title: finalAssessment.title })}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl"
          >
            <Send className="w-5 h-5" /> Renvoyer mon examen final
          </button>
        )}
      </div>
    );
  }
  return (
    <button
      onClick={() => setSelectedAssessment({ id: finalAssessment.id, title: finalAssessment.title })}
      className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl"
    >
      <Send className="w-5 h-5" />
      Soumettre mon examen final
    </button>
  );
})()}
        </div>

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

  if (!isModuleUnlocked) {
    return (
      <div className="w-full max-w-3xl mx-auto pb-20">
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
                  onClick={() => { setActiveModuleIndex(i); setActiveStep('theoretical'); scrollToTop(); }}
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
                {tpValidatedQuestions}/{totalTpQuestions} questions
                <span className="ml-2">({tpNoteSur20}/20)</span>
              </span>
            </div>
            <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  tpNoteSur20 >= 20 ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${totalTpQuestions > 0 ? (tpValidatedQuestions / totalTpQuestions) * 100 : 0}%` }}
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
                {quizScore}/{totalQuiz} bonnes réponses
                {isQuizValidated && <span className="text-green-400 font-bold ml-1">✓</span>}
                <span className="ml-2">({quizNoteSur10}/10)</span>
              </span>
            </div>
            <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isQuizValidated ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${totalQuiz > 0 ? (quizScore / totalQuiz) * 100 : 0}%` }}
              />
            </div>
          </div>

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
                onClick={() => { setActiveModuleIndex(i); setActiveStep('theoretical'); scrollToTop(); }}
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
          {finalAssessment && (
            <button
              onClick={() => {
                if (allModulesPassed) {
                  setActiveModuleIndex(modules.length);
                  scrollToTop();
                } else {
                  alert('Vous devez valider tous les modules avant de passer l\'examen final.');
                }
              }}
              className={`w-8 h-8 rounded-lg text-sm font-bold transition-all flex items-center justify-center ${
                isFinalExamActive
                  ? 'bg-amber-500 text-white'
                  : allModulesPassed
                  ? 'bg-slate-800 text-amber-400 hover:bg-slate-700'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
              title="Examen final"
            >
              <Star className="w-4 h-4" />
            </button>
          )}
        </div>
        <button onClick={goToNextModule} disabled={activeModuleIndex === modules.length - 1 && !(finalAssessment && allModulesPassed)}
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
          <span className="text-[10px]">{tpValidatedQuestions}/{totalTpQuestions}</span>
        </button>
        <button onClick={() => goToStep('quiz')}
          className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl text-xs font-medium transition-all ${
            activeStep === 'quiz' ? 'bg-blue-500 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}>
          <HelpCircle className="w-5 h-5" />
          QCM
          <span className="text-[10px]">{quizScore}/{totalQuiz}</span>
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

        {/* PRATIQUE (TP) */}
        {activeStep === 'practical' && (
          <motion.div key="practical" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            {practicalLessons.length === 0 ? (
              <p className="text-center text-slate-500 py-8">Aucun TP pour ce module</p>
            ) : (
              [...practicalLessons]
                .sort((a: any, b: any) => Number(a.position) - Number(b.position))
                .map((lesson: any, tpIndex: number) => {
                  const isUnlocked = isTpUnlocked(tpIndex);
                  const isTpDone = tpSelections[lesson.id] !== undefined;
                  return (
                    <div key={lesson.id} className={`bg-slate-900/50 border rounded-xl overflow-hidden ${!isUnlocked ? 'border-slate-800 opacity-60' : 'border-slate-800'}`}>
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isTpDone ? 'bg-green-500/10' : 'bg-orange-500/10'}`}>
                            {isTpDone ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Wrench className="w-4 h-4 text-orange-400" />}
                          </div>
                          <span className="text-white font-medium text-sm">{lesson.title}</span>
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
                          <p className="text-amber-400 text-sm">🔒 Validez le TP {tpIndex} pour débloquer ce TP.</p>
                        </div>
                      )}

                      {isUnlocked && showTpContent[lesson.id] && (
                        <div className="p-4 border-t border-slate-800 space-y-6">
                          <ContentViewer contentType={lesson.content_type} contentUrl={lesson.content_url} contentBody={lesson.content_body} title={lesson.title} />

                          {loadingTP[lesson.id] ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                              <span className="ml-2 text-slate-400">Chargement des questions...</span>
                            </div>
                          ) : tpQuestions[lesson.id] && tpQuestions[lesson.id].length > 0 ? (
                            tpQuestions[lesson.id].map((question: any, qIndex: number) => {
                              const qId = question.id;
                              const isQUnlocked = isTpQuestionUnlocked(lesson.id, qIndex);
                              const qOptions = tpQuestionOptions[qId] || [];
                              const qSelected = tpQuestionSelections[qId];
                              const isQCorrectSelected = tpQuestionCorrectSelected[qId];
                              const chosenOption = tpQuestionChosenOption[qId];
                              const qFeedback = tpQuestionFeedback[qId];

                              return (
                                <div key={qId} className={`border rounded-xl p-4 ${!isQUnlocked ? 'border-slate-800 bg-slate-900/30 opacity-60' : 'border-slate-700 bg-slate-900/60'}`}>
                                  <div className="flex items-start gap-2 mb-3">
                                    <ListChecks className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                                    <div className="flex-1">
                                      <h4 className="text-white font-semibold">Question {qIndex + 1}</h4>
                                      <HtmlContentViewer content={question.question_text} />
                                    </div>
                                  </div>

                                  {!isQUnlocked ? (
                                    <p className="text-amber-400 text-sm mt-2">🔒 Validez la question précédente pour débloquer celle-ci.</p>
                                  ) : (
                                    <>
                                      <div className="space-y-2 mt-3">
                                        {qOptions.map((option: any, oi: number) => {
                                          const isChosen = chosenOption === option.option_text;
                                          const isCorrectOption = option.is_correct;
                                          const isWrongChosen = isChosen && !isCorrectOption;
                                          const isGoodChosen = isChosen && isCorrectOption;
                                          const isAlreadyValidated = qSelected !== undefined;

                                          return (
                                            <button
                                              key={option.id}
                                              onClick={() => handleTpOptionClick(lesson.id, qId, option.option_text, option.is_correct)}
                                              disabled={isQCorrectSelected || isAlreadyValidated}
                                              className={`w-full text-left p-3 rounded-xl border transition-all ${
                                                isWrongChosen
                                                  ? 'border-red-500 bg-red-500/10'
                                                  : isGoodChosen
                                                  ? 'border-green-500 bg-green-500/10'
                                                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-500'
                                              }`}
                                            >
                                              <div className="flex justify-between items-start">
                                                <p className={`text-sm font-bold mb-1 ${isGoodChosen ? 'text-green-400' : isWrongChosen ? 'text-red-400' : 'text-white'}`}>
                                                  Proposition {String.fromCharCode(65 + oi)}
                                                </p>
                                                {isWrongChosen && <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
                                                {isGoodChosen && <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />}
                                              </div>
                                              <HtmlContentViewer content={option.option_text} />
                                              {isWrongChosen && (
                                                <p className="text-red-400 text-xs font-semibold mt-1">Mauvaise réponse</p>
                                              )}
                                            </button>
                                          );
                                        })}
                                      </div>

                                      {qFeedback && qFeedback.correct && (
                                        <div className="mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                          <p className="text-sm font-medium text-green-400">{qFeedback.message}</p>
                                        </div>
                                      )}

                                      {isQCorrectSelected && qFeedback.correct && (
                                        <button
                                          onClick={() => handleTpQuestionValidate(lesson.id, qId, chosenOption || '')}
                                          className="mt-4 w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
                                        >
                                          Valider ma réponse
                                        </button>
                                      )}
                                    </>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-center text-slate-500 py-4">Aucune question pour ce TP.</p>
                          )}

                          {isTpDone && (
                            <p className="text-green-400 font-bold text-center py-2">
                              ✅ TP validé
                            </p>
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

        {/* QCM */}
        {activeStep === 'quiz' && (
          <motion.div key="quiz" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            {!isTpValidated ? (
              <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-xl">
                <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-10 h-10 text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">QCM verrouillé</h2>
                <div className="space-y-3 max-w-md mx-auto">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-amber-400 text-sm font-medium">
                      ⚠️ Vous devez valider tous les TP ({tpCorrectCount}/{totalTp}) avant de pouvoir accéder au QCM.
                    </p>
                  </div>
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
              quizLessons.map((lesson: any) => (
                <div key={lesson.id} className="space-y-4">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-violet-400" /> {lesson.title}
                  </h3>
                  {quizQuestions[activeModule.id]?.map((q: any, qi: number) => {
                    const isUnlocked = isQuizQuestionUnlocked(qi);
                    const answer = (quizAnswers[activeModule.id] || {})[q.id];
                    const selectedAnswer = selectedQuizOption[q.id];
                    const isCorrectSelected = quizCorrectSelected[q.id];
                    return (
                      <div key={q.id} className={`p-4 rounded-xl border ${!isUnlocked ? 'border-slate-800 bg-slate-900/30 opacity-60' : answer ? 'border-green-500/30 bg-green-500/5' : 'border-[#1e293b]'}`}>
                        <div className="flex items-center justify-between">
                          <p className="text-white font-semibold mb-3">Q{qi + 1}. {q.question}</p>
                          {!isUnlocked && <Lock className="w-4 h-4 text-slate-600" />}
                        </div>
                        {isUnlocked && !answer && (
                          <>
                            <div className="grid sm:grid-cols-2 gap-2">
                              {['A', 'B', 'C', 'D'].map((letter: string) => (
                                <button
                                  key={letter}
                                  onClick={() => handleQuizChoice(q, letter)}
                                  disabled={isCorrectSelected}
                                  className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                    selectedAnswer === letter
                                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                                      : 'bg-[#1e293b] text-slate-400 hover:text-white hover:bg-[#334155]'
                                  }`}
                                >
                                  <span className="font-bold mr-2">{letter})</span>{q[`option_${letter.toLowerCase()}`]}
                                </button>
                              ))}
                            </div>

                            {quizFeedback[q.id] && (
                              <p className="mt-3 text-sm font-medium text-amber-400">{quizFeedback[q.id]}</p>
                            )}

                            {isCorrectSelected && selectedAnswer && (
                              <button
                                onClick={() => handleQuizValidate(q, selectedAnswer)}
                                className="mt-3 w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl"
                              >
                                Valider ma réponse
                              </button>
                            )}
                          </>
                        )}

                        {answer && (
                          <p className="mt-3 text-sm font-medium text-green-400">
                            ✅ Validé en {quizAttemptsCount[q.id] || 1} tentative(s)
                          </p>
                        )}
                        {!isUnlocked && (
                          <p className="text-amber-400 text-sm mt-2">🔒 Répondez correctement à la question précédente pour débloquer celle-ci.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))
            )}

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
                        ⚠️ Vous devez valider tous les TP ({tpCorrectCount}/{totalTp})
                      </p>
                    </div>
                  )}
                  {!isQuizValidated && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <p className="text-amber-400 text-sm font-medium">
                        ⚠️ Vous devez valider le QCM ({quizScore}/{totalQuiz})
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
                    {sub ? (
  <div className="space-y-3">
    <div className={`p-3 rounded-lg ${
      sub.status === 'PASSED' 
        ? 'bg-green-500/10 border border-green-500/20' 
        : sub.status === 'FAILED' 
          ? 'bg-red-500/10 border border-red-500/20' 
          : 'bg-amber-500/10 border border-amber-500/20'
    }`}>
      <p className={`text-sm font-medium ${
        sub.status === 'PASSED' ? 'text-green-400' : sub.status === 'FAILED' ? 'text-red-400' : 'text-amber-400'
      }`}>
        {sub.status === 'PASSED' 
          ? `✅ Examen validé - ${sub.grade}/20`
          : sub.status === 'FAILED' 
            ? `❌ Non validé - ${sub.grade}/20. Vous pouvez renvoyer votre travail.`
            : `⏳ Vous avez déjà soumis votre travail. En attente de correction.`}
      </p>
    </div>
    {sub.status !== 'PASSED' && (
      <button
        onClick={() => setSelectedAssessment({ id: ass.id, title: ass.title })}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl"
      >
        <Send className="w-5 h-5" /> Renvoyer mon travail
      </button>
    )}
  </div>
) : (
  <button
    onClick={() => setSelectedAssessment({ id: ass.id, title: ass.title })}
    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl"
  >
    <Send className="w-5 h-5" /> Soumettre mon travail
  </button>
)}
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