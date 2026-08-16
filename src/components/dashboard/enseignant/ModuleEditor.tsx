'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Wrench,
  GraduationCap,
  Plus,
  Trash2,
  HelpCircle,
  FileText,
  Video,
  FileArchive,
  Link2,
  X,
} from 'lucide-react';

interface Props {
  module: any;
  onUpdate: () => void;
}

export default function ModuleEditor({ module, onUpdate }: Props) {
  const supabase = createClientComponent();
  const [activeTab, setActiveTab] = useState<'theoretical' | 'practical' | 'exams'>('theoretical');
  const [lessons, setLessons] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);

  // Formulaire leçon
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [lessonType, setLessonType] = useState<'TEXT' | 'VIDEO' | 'PDF' | 'LINK' | 'QUIZ'>('TEXT');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonUrl, setLessonUrl] = useState('');
  const [lessonBody, setLessonBody] = useState('');

  // Formulaire examen
  const [showAddExam, setShowAddExam] = useState(false);
  const [examTitle, setExamTitle] = useState('');
  const [examDescription, setExamDescription] = useState('');

  // QCM
  const [activeQuizLesson, setActiveQuizLesson] = useState<any | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState<'A' | 'B' | 'C' | 'D'>('A');

  const fetchData = async () => {
    const { data: l } = await supabase
      .from('lessons')
      .select('*')
      .eq('module_id', module.id)
      .order('position', { ascending: true });
    if (l) setLessons(l);

    const { data: a } = await supabase
      .from('assessments')
      .select('*')
      .eq('module_id', module.id);
    if (a) setAssessments(a);
  };

  const fetchQuizQuestions = async (lessonId: string) => {
    const { data } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('position', { ascending: true });
    if (data) setQuizQuestions(data);
  };

  useEffect(() => {
    fetchData();
  }, [module.id]);

  useEffect(() => {
    if (activeQuizLesson) {
      fetchQuizQuestions(activeQuizLesson.id);
    }
  }, [activeQuizLesson]);

  const theoreticalLessons = lessons.filter(l => l.category === 'THEORIQUE');
  const practicalLessons = lessons.filter(l => l.category === 'PRATIQUE');

  const handleAddLesson = async () => {
    if (!lessonTitle.trim()) return;
    const category = activeTab === 'theoretical' ? 'THEORIQUE' : 'PRATIQUE';
    const position = category === 'THEORIQUE' ? theoreticalLessons.length + 1 : practicalLessons.length + 1;

    const { data, error } = await supabase.from('lessons').insert({
      module_id: module.id,
      title: lessonTitle,
      content_type: lessonType,
      content_url: lessonUrl.trim() || null,
      content_body: lessonBody.trim() || null,
      category,
      position,
    }).select('*').single();

    if (error) {
      alert('Erreur: ' + error.message);
      return;
    }

    setLessonTitle('');
    setLessonUrl('');
    setLessonBody('');
    setLessonType('TEXT');
    setShowAddLesson(false);

    if (lessonType === 'QUIZ' && data) {
      setActiveQuizLesson(data); // ✅ Ouvre la modale QCM
    }

    fetchData();
    onUpdate();
  };

  const handleAddQuestion = async () => {
    if (!questionText.trim() || !activeQuizLesson) return;
    if (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      alert('Veuillez remplir les 4 options.');
      return;
    }

    const { error } = await supabase.from('quiz_questions').insert({
      lesson_id: activeQuizLesson.id,
      assessment_id: null,
      question: questionText,
      option_a: optionA,
      option_b: optionB,
      option_c: optionC,
      option_d: optionD,
      correct_answer: correctAnswer,
      position: quizQuestions.length + 1,
    });

    if (!error) {
      setQuestionText('');
      setOptionA('');
      setOptionB('');
      setOptionC('');
      setOptionD('');
      setCorrectAnswer('A');
      fetchQuizQuestions(activeQuizLesson.id);
      onUpdate();
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm('Supprimer cette question ?')) return;
    await supabase.from('quiz_questions').delete().eq('id', id);
    if (activeQuizLesson) fetchQuizQuestions(activeQuizLesson.id);
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm('Supprimer cette leçon ?')) return;
    await supabase.from('lessons').delete().eq('id', id);
    fetchData();
    onUpdate();
  };

  const handleAddExam = async () => {
    if (!examTitle.trim()) return;
    const { error } = await supabase.from('assessments').insert({
      module_id: module.id,
      course_id: module.course_id,
      title: examTitle,
      description: examDescription.trim() || null,
      type: 'EXAM',
    });
    if (!error) {
      setExamTitle('');
      setExamDescription('');
      setShowAddExam(false);
      fetchData();
      onUpdate();
    }
  };

  const handleDeleteExam = async (id: string) => {
    if (!confirm('Supprimer cet examen ?')) return;
    await supabase.from('assessments').delete().eq('id', id);
    fetchData();
    onUpdate();
  };

  const lessonTypes = [
    { type: 'TEXT', icon: FileText, label: 'Texte', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { type: 'VIDEO', icon: Video, label: 'Vidéo', color: 'text-red-400', bg: 'bg-red-500/10' },
    { type: 'PDF', icon: FileArchive, label: 'PDF', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { type: 'LINK', icon: Link2, label: 'Lien', color: 'text-green-400', bg: 'bg-green-500/10' },
    { type: 'QUIZ', icon: HelpCircle, label: 'QCM', color: 'text-violet-400', bg: 'bg-violet-500/10' },
  ];

  return (
    <div className="space-y-4">
      {/* Onglets */}
      <div className="flex gap-2">
        {[
          { id: 'theoretical', label: 'Théorique', icon: BookOpen, count: theoreticalLessons.length },
          { id: 'practical', label: 'Pratique', icon: Wrench, count: practicalLessons.length },
          { id: 'exams', label: 'Examens', icon: GraduationCap, count: assessments.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-blue-500 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <span className="text-xs opacity-75">({tab.count})</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* THÉORIQUE / PRATIQUE */}
        {(activeTab === 'theoretical' || activeTab === 'practical') && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <button
              onClick={() => {
                setShowAddLesson(true);
                setLessonType('TEXT');
              }}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter un contenu {activeTab === 'theoretical' ? 'théorique' : 'pratique'}
            </button>

            {showAddLesson && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {lessonTypes.map((type) => (
                    <button
                      key={type.type}
                      onClick={() => setLessonType(type.type as any)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors",
                        lessonType === type.type
                          ? `${type.bg} ${type.color} border-current`
                          : "border-slate-600 text-slate-400 hover:text-white"
                      )}
                    >
                      <type.icon className="w-4 h-4" />
                      {type.label}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder={lessonType === 'QUIZ' ? 'Titre du QCM (ex: Quiz de compréhension)' : 'Titre du contenu'}
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />

                {lessonType === 'TEXT' && (
                  <textarea
                    placeholder="Contenu..."
                    value={lessonBody}
                    onChange={(e) => setLessonBody(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                  />
                )}

                {(lessonType === 'VIDEO' || lessonType === 'PDF' || lessonType === 'LINK') && (
                  <input
                    type="text"
                    placeholder="URL"
                    value={lessonUrl}
                    onChange={(e) => setLessonUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                )}

                {lessonType === 'QUIZ' && (
                  <p className="text-xs text-violet-400">💡 Le QCM sera créé, puis vous pourrez ajouter des questions.</p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleAddLesson}
                    disabled={!lessonTitle.trim()}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    {lessonType === 'QUIZ' ? 'Créer le QCM' : 'Ajouter'}
                  </button>
                  <button
                    onClick={() => setShowAddLesson(false)}
                    className="px-4 py-2 bg-slate-700 text-slate-400 hover:text-white rounded-lg text-sm"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Liste des leçons */}
            {activeTab === 'theoretical' && theoreticalLessons.length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-6">Aucun contenu théorique</p>
            ) : activeTab === 'practical' && practicalLessons.length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-6">Aucun contenu pratique</p>
            ) : (
              <div className="space-y-2">
                {(activeTab === 'theoretical' ? theoreticalLessons : practicalLessons).map((lesson) => (
                  <div key={lesson.id} className="flex items-center justify-between bg-slate-800/30 border border-slate-700/50 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        lesson.content_type === 'VIDEO' ? 'bg-red-500/10 text-red-400' :
                        lesson.content_type === 'PDF' ? 'bg-amber-500/10 text-amber-400' :
                        lesson.content_type === 'LINK' ? 'bg-green-500/10 text-green-400' :
                        lesson.content_type === 'QUIZ' ? 'bg-violet-500/10 text-violet-400' :
                        'bg-blue-500/10 text-blue-400'
                      )}>
                        {lesson.content_type}
                      </span>
                      <span className="text-white text-sm">{lesson.title}</span>
                      {lesson.content_type === 'QUIZ' && (
                        <button
                          onClick={() => setActiveQuizLesson(lesson)}
                          className="text-xs text-violet-400 hover:text-violet-300 underline"
                        >
                          Gérer les questions
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteLesson(lesson.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* EXAMENS */}
        {activeTab === 'exams' && (
          <motion.div
            key="exams"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <button
              onClick={() => setShowAddExam(true)}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter un examen
            </button>

            {showAddExam && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3">
                <input
                  type="text"
                  placeholder="Titre de l'examen"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  autoFocus
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <textarea
                  placeholder="Consignes (optionnel)"
                  value={examDescription}
                  onChange={(e) => setExamDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddExam}
                    disabled={!examTitle.trim()}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    Ajouter
                  </button>
                  <button
                    onClick={() => setShowAddExam(false)}
                    className="px-4 py-2 bg-slate-700 text-slate-400 hover:text-white rounded-lg text-sm"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {assessments.length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-6">Aucun examen</p>
            ) : (
              <div className="space-y-2">
                {assessments.map((exam) => (
                  <div key={exam.id} className="flex items-center justify-between bg-slate-800/30 border border-slate-700/50 rounded-lg p-3">
                    <div>
                      <span className="text-white text-sm font-medium">{exam.title}</span>
                      {exam.description && (
                        <p className="text-slate-500 text-xs mt-0.5">{exam.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteExam(exam.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ MODALE QCM ============ */}
      <AnimatePresence>
        {activeQuizLesson && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveQuizLesson(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-violet-400" />
                  Questions du QCM : {activeQuizLesson.title}
                </h3>
                <button
                  onClick={() => setActiveQuizLesson(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Formulaire question */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Question</label>
                    <input
                      type="text"
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder="Ex: Quelle est la première étape ?"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Option A</label>
                      <input
                        type="text"
                        value={optionA}
                        onChange={(e) => setOptionA(e.target.value)}
                        placeholder="Option A"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Option B</label>
                      <input
                        type="text"
                        value={optionB}
                        onChange={(e) => setOptionB(e.target.value)}
                        placeholder="Option B"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Option C</label>
                      <input
                        type="text"
                        value={optionC}
                        onChange={(e) => setOptionC(e.target.value)}
                        placeholder="Option C"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Option D</label>
                      <input
                        type="text"
                        value={optionD}
                        onChange={(e) => setOptionD(e.target.value)}
                        placeholder="Option D"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Bonne réponse</label>
                    <div className="flex gap-2">
                      {['A', 'B', 'C', 'D'].map((letter) => (
                        <button
                          key={letter}
                          onClick={() => setCorrectAnswer(letter as any)}
                          className={cn(
                            "w-12 h-12 rounded-lg font-bold text-lg transition-colors",
                            correctAnswer === letter
                              ? "bg-green-500 text-white"
                              : "bg-slate-800 text-slate-400 hover:text-white"
                          )}
                        >
                          {letter}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleAddQuestion}
                    disabled={!questionText.trim() || !optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter la question
                  </button>
                </div>

                {/* Liste des questions */}
                {quizQuestions.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-slate-800">
                    <p className="text-xs text-slate-400 font-medium">
                      Questions ajoutées ({quizQuestions.length})
                    </p>
                    {quizQuestions.map((q, index) => (
                      <div key={q.id} className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-white text-sm font-medium">
                            Q{index + 1}. {q.question}
                          </p>
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="text-red-400 hover:text-red-300 flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-1 mt-2">
                          {['A', 'B', 'C', 'D'].map((letter) => (
                            <span
                              key={letter}
                              className={cn(
                                "text-xs px-2 py-1 rounded",
                                q.correct_answer === letter
                                  ? "bg-green-500/10 text-green-400 font-semibold"
                                  : "text-slate-400"
                              )}
                            >
                              {letter}) {q[`option_${letter.toLowerCase()}`]}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}