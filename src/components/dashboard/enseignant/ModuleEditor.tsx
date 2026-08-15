'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import LessonEditor from './LessonEditor';
import AssessmentEditor from './AssessmentEditor';
import { cn } from '@/lib/utils';
import { fadeIn, stagger } from '@/lib/animations';
import {
  BookOpen,
  FileText,
  Video,
  FileArchive,
  Link2,
  Plus,
  PenTool,
  GraduationCap,
  X,
  Check,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';

interface Props {
  module: any;
  onUpdate: () => void;
}

export default function ModuleEditor({ module, onUpdate }: Props) {
  const supabase = createClientComponent();
  const [lessons, setLessons] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'lessons' | 'assessments' | 'qcm'>('lessons');

  // --- États pour l'ajout de leçon ---
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState<string>('TEXT');
  const [lessonUrl, setLessonUrl] = useState('');

  // --- États pour l'ajout d'évaluation ---
  const [showAddAssessment, setShowAddAssessment] = useState(false);
  const [assessmentTitle, setAssessmentTitle] = useState('');
  const [assessmentDescription, setAssessmentDescription] = useState('');
  const [assessmentType, setAssessmentType] = useState<'TP' | 'EXAM'>('TP');

  // --- États pour le QCM ---
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('');
  const [qcmQuestions, setQcmQuestions] = useState<any[]>([]);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [question, setQuestion] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState<'A' | 'B' | 'C' | 'D'>('A');

  // Charger les leçons et évaluations
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

  // Charger les questions du QCM quand une évaluation est sélectionnée
  const fetchQCMQuestions = async (assessmentId: string) => {
    if (!assessmentId) return;
    const { data } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('position', { ascending: true });
    if (data) setQcmQuestions(data);
  };

  useEffect(() => {
    fetchData();
  }, [module.id]);

  useEffect(() => {
    if (selectedAssessmentId) {
      fetchQCMQuestions(selectedAssessmentId);
    } else {
      setQcmQuestions([]);
    }
  }, [selectedAssessmentId]);

  // --- Ajout d'une leçon ---
  const handleAddLesson = async () => {
    if (!lessonTitle.trim()) return;
    const { error } = await supabase.from('lessons').insert({
      module_id: module.id,
      title: lessonTitle,
      content_type: lessonType,
      content_url: lessonUrl.trim() || null,
      position: lessons.length + 1,
    });
    if (error) {
      alert(`Erreur : ${error.message}`);
      return;
    }
    resetLessonForm();
    fetchData();
    onUpdate();
  };

  const resetLessonForm = () => {
    setLessonTitle('');
    setLessonUrl('');
    setLessonType('TEXT');
    setShowAddLesson(false);
  };

  // --- Ajout d'une évaluation ---
  const handleAddAssessment = async () => {
    if (!assessmentTitle.trim()) return;
    const { error } = await supabase.from('assessments').insert({
      module_id: module.id,
      course_id: module.course_id,
      title: assessmentTitle,
      description: assessmentDescription.trim() || null,
      type: assessmentType,
    });
    if (error) {
      alert(`Erreur : ${error.message}`);
      return;
    }
    resetAssessmentForm();
    fetchData();
    onUpdate();
  };

  const resetAssessmentForm = () => {
    setAssessmentTitle('');
    setAssessmentDescription('');
    setAssessmentType('TP');
    setShowAddAssessment(false);
  };

  // --- Ajout d'une question QCM ---
  const handleAddQuestion = async () => {
    if (!question.trim() || !selectedAssessmentId) return;
    if (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      alert('Veuillez remplir les 4 options.');
      return;
    }
    const { error } = await supabase.from('quiz_questions').insert({
      assessment_id: selectedAssessmentId,
      question: question,
      option_a: optionA,
      option_b: optionB,
      option_c: optionC,
      option_d: optionD,
      correct_answer: correctAnswer,
      position: qcmQuestions.length + 1,
    });
    if (error) {
      alert(`Erreur : ${error.message}`);
      return;
    }
    resetQuestionForm();
    fetchQCMQuestions(selectedAssessmentId);
    onUpdate();
  };

  const resetQuestionForm = () => {
    setQuestion('');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setCorrectAnswer('A');
    setShowAddQuestion(false);
  };

  // --- Suppression d'une question ---
  const handleDeleteQuestion = async (id: number) => {
    if (!confirm('Supprimer cette question ?')) return;
    const { error } = await supabase.from('quiz_questions').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchQCMQuestions(selectedAssessmentId);
  };

  // --- Configurations ---
  const lessonTypes = [
    { type: 'TEXT', icon: FileText, label: 'Partie théorique', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    { type: 'TEXT', icon: PenTool, label: 'Partie pratique', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
    { type: 'VIDEO', icon: Video, label: 'Support vidéo', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    { type: 'PDF', icon: FileArchive, label: 'Support PDF', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    { type: 'LINK', icon: Link2, label: 'Ressource externe', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  ];

  return (
    <div className="space-y-4">
      {/* Onglets */}
      <div className="flex gap-1 p-1 bg-slate-800/50 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('lessons')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
            activeTab === 'lessons' ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"
          )}
        >
          <BookOpen className="w-4 h-4" />
          Leçons
          <span className="text-xs text-slate-500">{lessons.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('assessments')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
            activeTab === 'assessments' ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"
          )}
        >
          <PenTool className="w-4 h-4" />
          Évaluations
          <span className="text-xs text-slate-500">{assessments.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('qcm')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
            activeTab === 'qcm' ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"
          )}
        >
          <HelpCircle className="w-4 h-4" />
          QCM
        </button>
      </div>

      {/* ========== CONTENU LEÇONS ========== */}
      <AnimatePresence mode="wait">
        {activeTab === 'lessons' && (
          <motion.div key="lessons" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
            {!showAddLesson ? (
              <button
                onClick={() => setShowAddLesson(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-800/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                Ajouter une leçon
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-900/70 border border-slate-700 rounded-xl p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white">Nouvelle leçon</h4>
                  <button onClick={() => setShowAddLesson(false)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                </div>
                {/* Sélection du type */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {lessonTypes.map((type) => (
                    <button
                      key={type.label}
                      onClick={() => setLessonType(type.type)}
                      className={cn(
                        "flex flex-col items-center gap-1 py-3 px-2 rounded-lg border text-xs font-medium transition-all",
                        lessonType === type.type
                          ? `${type.bg} ${type.color} ${type.border}`
                          : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                      )}
                    >
                      <type.icon className="w-5 h-5" />
                      {type.label}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="Titre de la leçon"
                  autoFocus
                  className="w-full px-3 py-2 rounded-lg text-sm text-white bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder-slate-500"
                />
                {(lessonType === 'VIDEO' || lessonType === 'PDF' || lessonType === 'LINK') && (
                  <input
                    type="text"
                    value={lessonUrl}
                    onChange={(e) => setLessonUrl(e.target.value)}
                    placeholder="URL du contenu (https://...)"
                    className="w-full px-3 py-2 rounded-lg text-sm text-white bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder-slate-500"
                  />
                )}
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowAddLesson(false)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white">Annuler</button>
                  <button onClick={handleAddLesson} disabled={!lessonTitle.trim()} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500 text-white hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed">
                    <Check className="w-3.5 h-3.5" />
                    Ajouter
                  </button>
                </div>
              </motion.div>
            )}

            {lessons.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                Ajoutez une partie théorique et une partie pratique.
              </div>
            ) : (
              <div className="space-y-2">
                {lessons.map((lesson) => (
                  <LessonEditor key={lesson.id} lesson={lesson} onUpdate={fetchData} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ========== CONTENU ÉVALUATIONS ========== */}
        {activeTab === 'assessments' && (
          <motion.div key="assessments" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
            {!showAddAssessment ? (
              <button
                onClick={() => setShowAddAssessment(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-800/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                Ajouter une évaluation
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-900/70 border border-slate-700 rounded-xl p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white">Nouvelle évaluation</h4>
                  <button onClick={() => setShowAddAssessment(false)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                </div>
                {/* Type d'évaluation */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { type: 'TP', icon: PenTool, label: 'Travaux Pratiques' },
                    { type: 'EXAM', icon: GraduationCap, label: 'Examen' },
                  ].map((type) => (
                    <button
                      key={type.type}
                      onClick={() => setAssessmentType(type.type as 'TP' | 'EXAM')}
                      className={cn(
                        "flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all",
                        assessmentType === type.type
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                      )}
                    >
                      <type.icon className="w-4 h-4" />
                      {type.label}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={assessmentTitle}
                  onChange={(e) => setAssessmentTitle(e.target.value)}
                  placeholder="Titre de l'évaluation (ex: QCM, TP noté...)"
                  autoFocus
                  className="w-full px-3 py-2 rounded-lg text-sm text-white bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder-slate-500"
                />
                <textarea
                  value={assessmentDescription}
                  onChange={(e) => setAssessmentDescription(e.target.value)}
                  rows={2}
                  placeholder="Description (optionnelle)"
                  className="w-full px-3 py-2 rounded-lg text-sm text-white bg-slate-800 border border-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder-slate-500"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowAddAssessment(false)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white">Annuler</button>
                  <button onClick={handleAddAssessment} disabled={!assessmentTitle.trim()} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500 text-white hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed">
                    <Check className="w-3.5 h-3.5" />
                    Ajouter
                  </button>
                </div>
              </motion.div>
            )}

            {assessments.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                Ajoutez une évaluation pour valider cette semaine.
              </div>
            ) : (
              <div className="space-y-2">
                {assessments.map((ass) => (
                  <AssessmentEditor key={ass.id} assessment={ass} onUpdate={fetchData} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ========== CONTENU QCM ========== */}
        {activeTab === 'qcm' && (
          <motion.div key="qcm" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            {/* Sélection de l'évaluation */}
            <div>
              <label className="text-xs font-medium text-slate-400 mb-2 block">
                Choisir une évaluation pour y attacher un QCM
              </label>
              <select
                value={selectedAssessmentId}
                onChange={(e) => setSelectedAssessmentId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm text-white bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                <option value="">-- Sélectionner une évaluation --</option>
                {assessments.map((ass) => (
                  <option key={ass.id} value={ass.id}>
                    {ass.title} ({ass.type})
                  </option>
                ))}
              </select>
            </div>

            {selectedAssessmentId && (
              <>
                {/* Bouton ajouter question */}
                {!showAddQuestion ? (
                  <button
                    onClick={() => setShowAddQuestion(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-800/30 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter une question
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-slate-900/70 border border-slate-700 rounded-xl p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-white">Nouvelle question</h4>
                      <button onClick={() => setShowAddQuestion(false)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                    </div>
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Question"
                      autoFocus
                      className="w-full px-3 py-2 rounded-lg text-sm text-white bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder-slate-500"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input type="text" value={optionA} onChange={(e) => setOptionA(e.target.value)} placeholder="Option A" className="px-3 py-2 rounded-lg text-sm text-white bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder-slate-500" />
                      <input type="text" value={optionB} onChange={(e) => setOptionB(e.target.value)} placeholder="Option B" className="px-3 py-2 rounded-lg text-sm text-white bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder-slate-500" />
                      <input type="text" value={optionC} onChange={(e) => setOptionC(e.target.value)} placeholder="Option C" className="px-3 py-2 rounded-lg text-sm text-white bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder-slate-500" />
                      <input type="text" value={optionD} onChange={(e) => setOptionD(e.target.value)} placeholder="Option D" className="px-3 py-2 rounded-lg text-sm text-white bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder-slate-500" />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-xs text-slate-400">Bonne réponse :</label>
                      <select
                        value={correctAnswer}
                        onChange={(e) => setCorrectAnswer(e.target.value as 'A' | 'B' | 'C' | 'D')}
                        className="px-3 py-1.5 rounded-lg text-sm text-white bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setShowAddQuestion(false)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white">Annuler</button>
                      <button onClick={handleAddQuestion} disabled={!question.trim() || !optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500 text-white hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed">
                        <Check className="w-3.5 h-3.5" />
                        Ajouter
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Liste des questions */}
                {qcmQuestions.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    Aucune question pour ce QCM.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {qcmQuestions.map((q, i) => (
                      <div key={q.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">
                            Q{i + 1}. {q.question}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-2">
                            {[
                              { key: 'A', value: q.option_a },
                              { key: 'B', value: q.option_b },
                              { key: 'C', value: q.option_c },
                              { key: 'D', value: q.option_d },
                            ].map((opt) => (
                              <span
                                key={opt.key}
                                className={cn(
                                  "text-xs px-2 py-1 rounded",
                                  q.correct_answer === opt.key
                                    ? "bg-green-500/10 text-green-400 font-semibold border border-green-500/20"
                                    : "text-slate-400"
                                )}
                              >
                                {opt.key}) {opt.value}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
                          title="Supprimer la question"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}