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
  Upload,
  Wrench,
} from 'lucide-react';

interface Props {
  module: any;
  onUpdate: () => void;
}

export default function ModuleEditor({ module, onUpdate }: Props) {
  const supabase = createClientComponent();
  const [activeTab, setActiveTab] = useState<'theoretical' | 'practical' | 'exams'>('theoretical');

  // ----- Données -----
  const [theoreticalLessons, setTheoreticalLessons] = useState<any[]>([]);
  const [practicalLessons, setPracticalLessons] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);

  // ----- Formulaire cours théorique -----
  const [showAddTheoretical, setShowAddTheoretical] = useState(false);
  const [theoreticalTitle, setTheoreticalTitle] = useState('');
  const [theoreticalType, setTheoreticalType] = useState<'TEXT' | 'VIDEO' | 'PDF' | 'LINK'>('TEXT');
  const [theoreticalUrl, setTheoreticalUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // ----- Formulaire cours pratique -----
  const [showAddPractical, setShowAddPractical] = useState(false);
  const [practicalTitle, setPracticalTitle] = useState('');
  const [practicalType, setPracticalType] = useState<'TEXT' | 'VIDEO' | 'PDF' | 'LINK' | 'QUIZ'>('TEXT');
  const [practicalUrl, setPracticalUrl] = useState('');
  const [practicalUploading, setPracticalUploading] = useState(false);

  // ----- Formulaire examen -----
  const [showAddAssessment, setShowAddAssessment] = useState(false);
  const [assessmentTitle, setAssessmentTitle] = useState('');
  const [assessmentDescription, setAssessmentDescription] = useState('');
  const [assessmentType, setAssessmentType] = useState<'TP' | 'EXAM'>('TP');

  // ----- Gestion QCM (pour les leçons de type QUIZ) -----
  const [selectedQuizLesson, setSelectedQuizLesson] = useState<any | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState<'A' | 'B' | 'C' | 'D'>('A');

  // Chargement initial
  const fetchData = async () => {
    const { data: lessons } = await supabase
      .from('lessons')
      .select('*')
      .eq('module_id', module.id)
      .order('position', { ascending: true });

    if (lessons) {
      setTheoreticalLessons(lessons.filter((l) => l.category === 'THEORIQUE'));
      setPracticalLessons(lessons.filter((l) => l.category === 'PRATIQUE'));
    }

    const { data: assessmentsData } = await supabase
      .from('assessments')
      .select('*')
      .eq('module_id', module.id);
    if (assessmentsData) setAssessments(assessmentsData);
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
    if (selectedQuizLesson) fetchQuizQuestions(selectedQuizLesson.id);
  }, [selectedQuizLesson]);

  // ----- Ajout cours théorique -----
  const handleAddTheoretical = async () => {
    if (!theoreticalTitle.trim()) return;
    const { error } = await supabase.from('lessons').insert({
      module_id: module.id,
      title: theoreticalTitle,
      content_type: theoreticalType,
      content_url: theoreticalUrl.trim() || null,
      category: 'THEORIQUE',
      position: theoreticalLessons.length + 1,
    });
    if (error) {
      alert(`Erreur : ${error.message}`);
      return;
    }
    resetTheoreticalForm();
    fetchData();
    onUpdate();
  };

  const resetTheoreticalForm = () => {
    setTheoreticalTitle('');
    setTheoreticalType('TEXT');
    setTheoreticalUrl('');
    setShowAddTheoretical(false);
  };

  const handleTheoreticalFileUpload = async (file: File) => {
    setUploading(true);
    const fileName = `${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from('course-pdfs')
      .upload(fileName, file);
    if (error) {
      alert(`Upload échoué : ${error.message}`);
      setUploading(false);
      return;
    }
    const { data: publicUrl } = supabase.storage
      .from('course-pdfs')
      .getPublicUrl(fileName);
    setTheoreticalUrl(publicUrl.publicUrl);
    setUploading(false);
  };

  // ----- Ajout cours pratique -----
  const handleAddPractical = async () => {
    if (!practicalTitle.trim()) return;
    const { error } = await supabase.from('lessons').insert({
      module_id: module.id,
      title: practicalTitle,
      content_type: practicalType,
      content_url: practicalUrl.trim() || null,
      category: 'PRATIQUE',
      position: practicalLessons.length + 1,
    });
    if (error) {
      alert(`Erreur : ${error.message}`);
      return;
    }
    resetPracticalForm();
    fetchData();
    onUpdate();
  };

  const resetPracticalForm = () => {
    setPracticalTitle('');
    setPracticalType('TEXT');
    setPracticalUrl('');
    setShowAddPractical(false);
  };

  const handlePracticalFileUpload = async (file: File) => {
    setPracticalUploading(true);
    const fileName = `${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from('course-pdfs')
      .upload(fileName, file);
    if (error) {
      alert(`Upload échoué : ${error.message}`);
      setPracticalUploading(false);
      return;
    }
    const { data: publicUrl } = supabase.storage
      .from('course-pdfs')
      .getPublicUrl(fileName);
    setPracticalUrl(publicUrl.publicUrl);
    setPracticalUploading(false);
  };

  // ----- Ajout examen -----
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

  // ----- Ajout question QCM -----
  const handleAddQuestion = async () => {
    if (!questionText.trim() || !selectedQuizLesson) return;
    if (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      alert('Veuillez remplir les 4 options.');
      return;
    }
    const { error } = await supabase.from('quiz_questions').insert({
      lesson_id: selectedQuizLesson.id,
      question: questionText,
      option_a: optionA,
      option_b: optionB,
      option_c: optionC,
      option_d: optionD,
      correct_answer: correctAnswer,
      position: quizQuestions.length + 1,
    });
    if (error) {
      alert(`Erreur : ${error.message}`);
      return;
    }
    setQuestionText('');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setCorrectAnswer('A');
    setShowAddQuestion(false);
    fetchQuizQuestions(selectedQuizLesson.id);
    onUpdate();
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm('Supprimer cette question ?')) return;
    const { error } = await supabase.from('quiz_questions').delete().eq('id', id);
    if (!error) fetchQuizQuestions(selectedQuizLesson.id);
  };

  // ----- Helpers -----
  const contentTypes = [
    { type: 'TEXT', icon: FileText, label: 'Texte' },
    { type: 'VIDEO', icon: Video, label: 'Vidéo' },
    { type: 'PDF', icon: FileArchive, label: 'PDF' },
    { type: 'LINK', icon: Link2, label: 'Lien' },
  ];

  const practicalTypes = [
    ...contentTypes,
    { type: 'QUIZ', icon: HelpCircle, label: 'QCM' },
  ];

  return (
    <div className="space-y-4">
      {/* Onglets */}
      <div className="flex gap-1 p-1 bg-slate-800/50 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('theoretical')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
            activeTab === 'theoretical' ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"
          )}
        >
          <BookOpen className="w-4 h-4" />
          Cours théoriques
          <span className="text-xs text-slate-500">{theoreticalLessons.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('practical')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
            activeTab === 'practical' ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"
          )}
        >
          <Wrench className="w-4 h-4" />
          Cours pratiques
          <span className="text-xs text-slate-500">{practicalLessons.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('exams')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
            activeTab === 'exams' ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"
          )}
        >
          <GraduationCap className="w-4 h-4" />
          Examens
          <span className="text-xs text-slate-500">{assessments.length}</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* ============ COURS THÉORIQUES ============ */}
        {activeTab === 'theoretical' && (
          <motion.div key="theoretical" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
            {!showAddTheoretical ? (
              <button
                onClick={() => setShowAddTheoretical(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-800/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                Ajouter un cours théorique
              </button>
            ) : (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-slate-900/70 border border-slate-700 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white">Nouveau cours théorique</h4>
                  <button onClick={() => setShowAddTheoretical(false)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {contentTypes.map((type) => (
                    <button key={type.type} onClick={() => setTheoreticalType(type.type as any)}
                      className={cn(
                        "flex flex-col items-center gap-1 py-3 px-2 rounded-lg border text-xs font-medium transition-all",
                        theoreticalType === type.type ? "bg-blue-500/10 text-blue-400 border-blue-500/30" : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                      )}
                    >
                      <type.icon className="w-5 h-5" />
                      {type.label}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={theoreticalTitle}
                  onChange={(e) => setTheoreticalTitle(e.target.value)}
                  placeholder="Titre du cours (ex: Introduction au droit civil)"
                  autoFocus
                  className="w-full px-3 py-2 rounded-lg text-sm text-white bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder-slate-500"
                />
                {(theoreticalType === 'VIDEO' || theoreticalType === 'LINK') && (
                  <input
                    type="text"
                    value={theoreticalUrl}
                    onChange={(e) => setTheoreticalUrl(e.target.value)}
                    placeholder="URL (https://...)"
                    className="w-full px-3 py-2 rounded-lg text-sm text-white bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder-slate-500"
                  />
                )}
                {theoreticalType === 'PDF' && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={theoreticalUrl}
                      onChange={(e) => setTheoreticalUrl(e.target.value)}
                      placeholder="URL du PDF (ou utilisez l'upload)"
                      className="w-full px-3 py-2 rounded-lg text-sm text-white bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder-slate-500"
                    />
                    <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      Uploader un PDF
                      <input type="file" accept=".pdf" onChange={(e) => e.target.files?.[0] && handleTheoreticalFileUpload(e.target.files[0])} className="hidden" />
                    </label>
                    {uploading && <p className="text-xs text-slate-500">Upload en cours...</p>}
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowAddTheoretical(false)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white">Annuler</button>
                  <button onClick={handleAddTheoretical} disabled={!theoreticalTitle.trim()} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500 text-white hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed">
                    <Check className="w-3.5 h-3.5" />
                    Ajouter
                  </button>
                </div>
              </motion.div>
            )}

            {/* Liste des cours théoriques */}
            {theoreticalLessons.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">Aucun cours théorique pour ce module.</div>
            ) : (
              <div className="space-y-2">
                {theoreticalLessons.map((lesson) => (
                  <LessonEditor key={lesson.id} lesson={lesson} onUpdate={fetchData} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ============ COURS PRATIQUES ============ */}
        {activeTab === 'practical' && (
          <motion.div key="practical" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
            {!showAddPractical ? (
              <button
                onClick={() => setShowAddPractical(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-800/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                Ajouter un cours pratique / QCM
              </button>
            ) : (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-slate-900/70 border border-slate-700 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white">Nouveau cours pratique</h4>
                  <button onClick={() => setShowAddPractical(false)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {practicalTypes.map((type) => (
                    <button key={type.type} onClick={() => setPracticalType(type.type as any)}
                      className={cn(
                        "flex flex-col items-center gap-1 py-3 px-2 rounded-lg border text-xs font-medium transition-all",
                        practicalType === type.type ? "bg-orange-500/10 text-orange-400 border-orange-500/30" : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                      )}
                    >
                      <type.icon className="w-5 h-5" />
                      {type.label}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={practicalTitle}
                  onChange={(e) => setPracticalTitle(e.target.value)}
                  placeholder="Titre de l'exercice ou du QCM"
                  autoFocus
                  className="w-full px-3 py-2 rounded-lg text-sm text-white bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder-slate-500"
                />
                {(practicalType === 'VIDEO' || practicalType === 'LINK') && (
                  <input
                    type="text"
                    value={practicalUrl}
                    onChange={(e) => setPracticalUrl(e.target.value)}
                    placeholder="URL (https://...)"
                    className="w-full px-3 py-2 rounded-lg text-sm text-white bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder-slate-500"
                  />
                )}
                {practicalType === 'PDF' && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={practicalUrl}
                      onChange={(e) => setPracticalUrl(e.target.value)}
                      placeholder="URL du PDF (ou utilisez l'upload)"
                      className="w-full px-3 py-2 rounded-lg text-sm text-white bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder-slate-500"
                    />
                    <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      Uploader un PDF
                      <input type="file" accept=".pdf" onChange={(e) => e.target.files?.[0] && handlePracticalFileUpload(e.target.files[0])} className="hidden" />
                    </label>
                    {practicalUploading && <p className="text-xs text-slate-500">Upload en cours...</p>}
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowAddPractical(false)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white">Annuler</button>
                  <button onClick={handleAddPractical} disabled={!practicalTitle.trim()} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500 text-white hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed">
                    <Check className="w-3.5 h-3.5" />
                    Ajouter
                  </button>
                </div>
              </motion.div>
            )}

            {/* Liste des cours pratiques (y compris QCM) */}
            {practicalLessons.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">Aucun cours pratique pour ce module.</div>
            ) : (
              <div className="space-y-2">
                {practicalLessons.map((lesson) => (
                  <div key={lesson.id}>
                    <LessonEditor lesson={lesson} onUpdate={fetchData} />
                    {lesson.content_type === 'QUIZ' && (
                      <div className="ml-4 mt-1">
                        <button
                          onClick={() => setSelectedQuizLesson(lesson)}
                          className="text-xs text-violet-400 hover:text-violet-300 underline"
                        >
                          Gérer les questions ({quizQuestions.length})
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ============ EXAMENS ============ */}
        {activeTab === 'exams' && (
          <motion.div key="exams" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
            {!showAddAssessment ? (
              <button
                onClick={() => setShowAddAssessment(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-800/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                Ajouter un examen
              </button>
            ) : (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-slate-900/70 border border-slate-700 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white">Nouvel examen</h4>
                  <button onClick={() => setShowAddAssessment(false)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { type: 'TP', icon: PenTool, label: 'Devoir final' },
                    { type: 'EXAM', icon: GraduationCap, label: 'Examen blanc' },
                  ].map((type) => (
                    <button key={type.type} onClick={() => setAssessmentType(type.type as any)}
                      className={cn(
                        "flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all",
                        assessmentType === type.type ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
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
                  placeholder="Titre de l'examen"
                  autoFocus
                  className="w-full px-3 py-2 rounded-lg text-sm text-white bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder-slate-500"
                />
                <textarea
                  value={assessmentDescription}
                  onChange={(e) => setAssessmentDescription(e.target.value)}
                  rows={2}
                  placeholder="Consignes (optionnel)"
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

            {/* Liste des examens */}
            {assessments.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">Aucun examen pour ce module.</div>
            ) : (
              <div className="space-y-2">
                {assessments.map((ass) => (
                  <AssessmentEditor key={ass.id} assessment={ass} onUpdate={fetchData} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ MODALE GESTION QCM ============ */}
      <AnimatePresence>
        {selectedQuizLesson && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedQuizLesson(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <h3 className="text-white font-semibold">Questions du QCM</h3>
                <button onClick={() => setSelectedQuizLesson(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-4 space-y-4">
                {/* Formulaire d'ajout */}
                {!showAddQuestion ? (
                  <button
                    onClick={() => setShowAddQuestion(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-800/30 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter une question
                  </button>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
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
                      <select value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value as any)}
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
                      <button onClick={handleAddQuestion} disabled={!questionText.trim() || !optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500 text-white hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed">
                        <Check className="w-3.5 h-3.5" />
                        Ajouter
                      </button>
                    </div>
                  </div>
                )}

                {/* Liste des questions */}
                {quizQuestions.length === 0 ? (
                  <p className="text-center text-slate-500 text-sm py-4">Aucune question pour ce QCM.</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {quizQuestions.map((q, i) => (
                      <div key={q.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-white text-sm font-medium">Q{i + 1}. {q.question}</p>
                          <button onClick={() => handleDeleteQuestion(q.id)} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-1 mt-2">
                          {[{ key: 'A', val: q.option_a }, { key: 'B', val: q.option_b }, { key: 'C', val: q.option_c }, { key: 'D', val: q.option_d }].map((opt) => (
                            <span key={opt.key} className={cn(
                              "text-xs px-2 py-1 rounded",
                              q.correct_answer === opt.key ? "bg-green-500/10 text-green-400 font-semibold" : "text-slate-400"
                            )}>
                              {opt.key}) {opt.val}
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