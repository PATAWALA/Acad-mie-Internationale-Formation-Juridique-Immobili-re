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
  ChevronDown,
  X,
  HelpCircle,
} from 'lucide-react';

interface Props {
  module: any;
  onUpdate: () => void;
}

export default function ModuleEditor({ module, onUpdate }: Props) {
  const supabase = createClientComponent();
  const [lessons, setLessons] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<'lessons' | 'assessments' | 'qcm'>('lessons');
  const [showAddLessonInput, setShowAddLessonInput] = useState(false);
  const [showAddAssessmentInput, setShowAddAssessmentInput] = useState(false);
  const [showAddQCMInput, setShowAddQCMInput] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState<string>('TEXT');
  const [newAssessmentTitle, setNewAssessmentTitle] = useState('');
  const [newAssessmentType, setNewAssessmentType] = useState<string>('TP');

  // État pour le QCM
  const [qcmQuestions, setQcmQuestions] = useState<any[]>([]);
  const [selectedAssessmentForQCM, setSelectedAssessmentForQCM] = useState<string>('');
  const [newQCMQuestion, setNewQCMQuestion] = useState({
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
  });

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

  const fetchQCMQuestions = async () => {
    if (!selectedAssessmentForQCM) return;
    const { data } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('assessment_id', selectedAssessmentForQCM)
      .order('position', { ascending: true });
    if (data) setQcmQuestions(data);
  };

  useEffect(() => {
    fetchData();
  }, [module.id]);

  useEffect(() => {
    fetchQCMQuestions();
  }, [selectedAssessmentForQCM]);

  const handleAddLesson = async () => {
    if (!newLessonTitle.trim()) return;
    const { error } = await supabase.from('lessons').insert({
      module_id: module.id,
      title: newLessonTitle,
      content_type: newLessonType,
      position: lessons.length + 1,
    });
    if (error) alert(error.message);
    else {
      setNewLessonTitle('');
      setNewLessonType('TEXT');
      setShowAddLessonInput(false);
      fetchData();
      onUpdate();
    }
  };

  const handleAddAssessment = async () => {
    if (!newAssessmentTitle.trim()) return;
    const { error } = await supabase.from('assessments').insert({
      module_id: module.id,
      course_id: module.course_id,
      title: newAssessmentTitle,
      type: newAssessmentType.toUpperCase() === 'EXAM' ? 'EXAM' : 'TP',
    });
    if (error) alert(error.message);
    else {
      setNewAssessmentTitle('');
      setNewAssessmentType('TP');
      setShowAddAssessmentInput(false);
      fetchData();
      onUpdate();
    }
  };

  const handleAddQCMQuestion = async () => {
    if (!newQCMQuestion.question.trim() || !selectedAssessmentForQCM) return;
    const { error } = await supabase.from('quiz_questions').insert({
      assessment_id: selectedAssessmentForQCM,
      question: newQCMQuestion.question,
      option_a: newQCMQuestion.option_a,
      option_b: newQCMQuestion.option_b,
      option_c: newQCMQuestion.option_c,
      option_d: newQCMQuestion.option_d,
      correct_answer: newQCMQuestion.correct_answer,
      position: qcmQuestions.length + 1,
    });
    if (error) alert(error.message);
    else {
      setNewQCMQuestion({ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A' });
      fetchQCMQuestions();
      onUpdate();
    }
  };

  const handleDeleteQCMQuestion = async (id: number) => {
    const { error } = await supabase.from('quiz_questions').delete().eq('id', id);
    if (!error) fetchQCMQuestions();
  };

  const lessonTypes = [
    { type: 'TEXT', icon: FileText, label: 'Partie théorique', color: 'text-blue-400', bg: 'bg-blue-500/10', desc: 'Contenu texte à lire' },
    { type: 'TEXT', icon: PenTool, label: 'Partie pratique', color: 'text-orange-400', bg: 'bg-orange-500/10', desc: 'Exercices à faire' },
    { type: 'VIDEO', icon: Video, label: 'Support vidéo', color: 'text-red-400', bg: 'bg-red-500/10', desc: 'Lien YouTube, Loom...' },
    { type: 'PDF', icon: FileArchive, label: 'Support PDF', color: 'text-amber-400', bg: 'bg-amber-500/10', desc: 'Document à télécharger' },
    { type: 'LINK', icon: Link2, label: 'Ressource externe', color: 'text-green-400', bg: 'bg-green-500/10', desc: 'Lien vers un site' },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs Leçons / Évaluations / QCM */}
      <div className="flex gap-2 p-1 bg-slate-800/50 rounded-xl">
        <button onClick={() => setActiveSection('lessons')} className={cn("flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200", activeSection === 'lessons' ? "bg-violet-500/20 text-violet-400 shadow-sm" : "text-slate-400 hover:text-white")}>
          <BookOpen className="w-4 h-4" /> Leçons
          <span className={cn("text-xs px-1.5 py-0.5 rounded-full", activeSection === 'lessons' ? "bg-violet-500/20" : "bg-slate-700")}>{lessons.length}</span>
        </button>
        <button onClick={() => setActiveSection('assessments')} className={cn("flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200", activeSection === 'assessments' ? "bg-violet-500/20 text-violet-400 shadow-sm" : "text-slate-400 hover:text-white")}>
          <PenTool className="w-4 h-4" /> Évaluations
          <span className={cn("text-xs px-1.5 py-0.5 rounded-full", activeSection === 'assessments' ? "bg-violet-500/20" : "bg-slate-700")}>{assessments.length}</span>
        </button>
        <button onClick={() => setActiveSection('qcm')} className={cn("flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200", activeSection === 'qcm' ? "bg-violet-500/20 text-violet-400 shadow-sm" : "text-slate-400 hover:text-white")}>
          <HelpCircle className="w-4 h-4" /> QCM
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* SECTION LEÇONS (inchangée) */}
        {activeSection === 'lessons' && (
          <motion.div key="lessons" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            {/* ... contenu identique à l'original ... */}
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2"><BookOpen className="w-4 h-4" /> Leçons ({lessons.length})</h5>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowAddLessonInput(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors"><Plus className="w-3.5 h-3.5" /> Ajouter une leçon</motion.button>
            </div>
            {lessons.length === 0 ? (
              <div className="text-center py-8 bg-slate-800/30 rounded-xl border border-slate-800/50"><BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" /><p className="text-slate-500 text-sm">Ajoutez une partie théorique et une partie pratique</p></div>
            ) : (
              <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-2">
                {lessons.map((lesson) => (<LessonEditor key={lesson.id} lesson={lesson} onUpdate={fetchData} />))}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* SECTION ÉVALUATIONS (inchangée) */}
        {activeSection === 'assessments' && (
          <motion.div key="assessments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            {/* ... contenu identique à l'original ... */}
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2"><PenTool className="w-4 h-4" /> Évaluations ({assessments.length})</h5>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowAddAssessmentInput(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors"><Plus className="w-3.5 h-3.5" /> Ajouter une évaluation</motion.button>
            </div>
            {assessments.length === 0 ? (
              <div className="text-center py-8 bg-slate-800/30 rounded-xl border border-slate-800/50"><PenTool className="w-8 h-8 text-slate-600 mx-auto mb-2" /><p className="text-slate-500 text-sm">Ajoutez une évaluation pour valider cette semaine</p></div>
            ) : (
              <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-2">
                {assessments.map((ass) => (<AssessmentEditor key={ass.id} assessment={ass} onUpdate={fetchData} />))}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* SECTION QCM */}
        {activeSection === 'qcm' && (
          <motion.div key="qcm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2"><HelpCircle className="w-4 h-4" /> QCM</h5>
            </div>

            {/* Sélectionner l'évaluation associée */}
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Associer à une évaluation :</label>
              <select value={selectedAssessmentForQCM} onChange={(e) => setSelectedAssessmentForQCM(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm">
                <option value="">-- Sélectionner --</option>
                {assessments.map((ass) => (<option key={ass.id} value={ass.id}>{ass.title}</option>))}
              </select>
            </div>

            {selectedAssessmentForQCM && (
              <>
                {/* Formulaire ajout question */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-medium text-white">Ajouter une question</p>
                  <input type="text" placeholder="Question" value={newQCMQuestion.question} onChange={(e) => setNewQCMQuestion({ ...newQCMQuestion, question: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Option A" value={newQCMQuestion.option_a} onChange={(e) => setNewQCMQuestion({ ...newQCMQuestion, option_a: e.target.value })}
                      className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm" />
                    <input type="text" placeholder="Option B" value={newQCMQuestion.option_b} onChange={(e) => setNewQCMQuestion({ ...newQCMQuestion, option_b: e.target.value })}
                      className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm" />
                    <input type="text" placeholder="Option C" value={newQCMQuestion.option_c} onChange={(e) => setNewQCMQuestion({ ...newQCMQuestion, option_c: e.target.value })}
                      className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm" />
                    <input type="text" placeholder="Option D" value={newQCMQuestion.option_d} onChange={(e) => setNewQCMQuestion({ ...newQCMQuestion, option_d: e.target.value })}
                      className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm" />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs text-slate-400">Bonne réponse :</label>
                    <select value={newQCMQuestion.correct_answer} onChange={(e) => setNewQCMQuestion({ ...newQCMQuestion, correct_answer: e.target.value })}
                      className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm">
                      <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                    </select>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAddQCMQuestion} disabled={!newQCMQuestion.question.trim()}
                      className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-400 disabled:opacity-50">Ajouter</motion.button>
                  </div>
                </div>

                {/* Liste des questions */}
                <div className="space-y-2">
                  {qcmQuestions.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-4">Aucune question pour ce QCM.</p>
                  ) : (
                    qcmQuestions.map((q, i) => (
                      <div key={q.id} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3 flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">Q{i + 1}. {q.question}</p>
                          <div className="grid grid-cols-2 gap-1 mt-1">
                            <span className={cn("text-xs", q.correct_answer === 'A' ? 'text-green-400 font-bold' : 'text-slate-400')}>A) {q.option_a}</span>
                            <span className={cn("text-xs", q.correct_answer === 'B' ? 'text-green-400 font-bold' : 'text-slate-400')}>B) {q.option_b}</span>
                            <span className={cn("text-xs", q.correct_answer === 'C' ? 'text-green-400 font-bold' : 'text-slate-400')}>C) {q.option_c}</span>
                            <span className={cn("text-xs", q.correct_answer === 'D' ? 'text-green-400 font-bold' : 'text-slate-400')}>D) {q.option_d}</span>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteQCMQuestion(q.id)} className="text-red-400 hover:text-red-300 ml-3 flex-shrink-0"><X className="w-4 h-4" /></button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}