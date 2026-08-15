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
} from 'lucide-react';

interface Props {
  module: any;
  onUpdate: () => void;
}

export default function ModuleEditor({ module, onUpdate }: Props) {
  const supabase = createClientComponent();
  const [activeTab, setActiveTab] = useState<'contents' | 'quiz' | 'assessments'>('contents');

  // États pour les contenus
  const [showAddContent, setShowAddContent] = useState(false);
  const [contentTitle, setContentTitle] = useState('');
  const [contentType, setContentType] = useState<string>('TEXT');
  const [contentUrl, setContentUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // États pour les évaluations
  const [showAddAssessment, setShowAddAssessment] = useState(false);
  const [assessmentTitle, setAssessmentTitle] = useState('');
  const [assessmentDescription, setAssessmentDescription] = useState('');
  const [assessmentType, setAssessmentType] = useState<'TP' | 'EXAM'>('TP');

  // États pour le QCM
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('');
  const [qcmQuestions, setQcmQuestions] = useState<any[]>([]);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [question, setQuestion] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState<'A' | 'B' | 'C' | 'D'>('A');

  // Données
  const [contents, setContents] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);

  const fetchData = async () => {
    const { data: l } = await supabase
      .from('lessons')
      .select('*')
      .eq('module_id', module.id)
      .order('position', { ascending: true });
    if (l) setContents(l);

    const { data: a } = await supabase
      .from('assessments')
      .select('*')
      .eq('module_id', module.id);
    if (a) setAssessments(a);
  };

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
    if (selectedAssessmentId) fetchQCMQuestions(selectedAssessmentId);
    else setQcmQuestions([]);
  }, [selectedAssessmentId]);

  // --- Ajout d'un contenu ---
  const handleAddContent = async () => {
    if (!contentTitle.trim()) return;
    const { error } = await supabase.from('lessons').insert({
      module_id: module.id,
      title: contentTitle,
      content_type: contentType,
      content_url: contentUrl.trim() || null,
      position: contents.length + 1,
    });
    if (error) {
      alert(`Erreur : ${error.message}`);
      return;
    }
    setContentTitle('');
    setContentUrl('');
    setContentType('TEXT');
    setShowAddContent(false);
    fetchData();
    onUpdate();
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from('course-pdfs') // Assurez-vous que le bucket existe
      .upload(fileName, file);
    if (error) {
      alert(`Upload échoué : ${error.message}`);
      setUploading(false);
      return;
    }
    const { data: publicUrl } = supabase.storage
      .from('course-pdfs')
      .getPublicUrl(fileName);
    setContentUrl(publicUrl.publicUrl);
    setUploading(false);
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
    setAssessmentTitle('');
    setAssessmentDescription('');
    setAssessmentType('TP');
    setShowAddAssessment(false);
    fetchData();
    onUpdate();
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
      question,
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
    setQuestion('');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setCorrectAnswer('A');
    setShowAddQuestion(false);
    fetchQCMQuestions(selectedAssessmentId);
    onUpdate();
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm('Supprimer cette question ?')) return;
    const { error } = await supabase.from('quiz_questions').delete().eq('id', id);
    if (!error) fetchQCMQuestions(selectedAssessmentId);
  };

  // Configurations
  const contentTypes = [
    { type: 'TEXT', icon: FileText, label: 'Texte', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { type: 'VIDEO', icon: Video, label: 'Vidéo', color: 'text-red-400', bg: 'bg-red-500/10' },
    { type: 'PDF', icon: FileArchive, label: 'PDF', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { type: 'LINK', icon: Link2, label: 'Lien', color: 'text-green-400', bg: 'bg-green-500/10' },
  ];

  return (
    <div className="space-y-4">
      {/* Onglets */}
      <div className="flex gap-1 p-1 bg-slate-800/50 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('contents')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
            activeTab === 'contents' ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"
          )}
        >
          <BookOpen className="w-4 h-4" />
          Contenus
          <span className="text-xs text-slate-500">{contents.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
            activeTab === 'quiz' ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"
          )}
        >
          <HelpCircle className="w-4 h-4" />
          Quiz
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
      </div>

      <AnimatePresence mode="wait">
        {/* ===== CONTENUS ===== */}
        {activeTab === 'contents' && (
          <motion.div key="contents" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
            {!showAddContent ? (
              <button
                onClick={() => setShowAddContent(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-800/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                Ajouter un contenu
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-900/70 border border-slate-700 rounded-xl p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white">Nouveau contenu</h4>
                  <button onClick={() => setShowAddContent(false)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                </div>

                {/* Choix du type */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {contentTypes.map((type) => (
                    <button
                      key={type.type}
                      onClick={() => setContentType(type.type)}
                      className={cn(
                        "flex flex-col items-center gap-1 py-3 px-2 rounded-lg border text-xs font-medium transition-all",
                        contentType === type.type
                          ? `${type.bg} ${type.color} border-current`
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
                  value={contentTitle}
                  onChange={(e) => setContentTitle(e.target.value)}
                  placeholder="Titre du contenu"
                  autoFocus
                  className="w-full px-3 py-2 rounded-lg text-sm text-white bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder-slate-500"
                />

                {/* URL ou upload PDF */}
                {(contentType === 'VIDEO' || contentType === 'LINK') && (
                  <input
                    type="text"
                    value={contentUrl}
                    onChange={(e) => setContentUrl(e.target.value)}
                    placeholder="URL (https://...)"
                    className="w-full px-3 py-2 rounded-lg text-sm text-white bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder-slate-500"
                  />
                )}

                {contentType === 'PDF' && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={contentUrl}
                      onChange={(e) => setContentUrl(e.target.value)}
                      placeholder="URL du PDF (ou utilisez l'upload)"
                      className="w-full px-3 py-2 rounded-lg text-sm text-white bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder-slate-500"
                    />
                    <label className="flex items-center gap-2 text-xs text-slate-400">
                      <Upload className="w-3.5 h-3.5" />
                      Uploader un PDF
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                    {uploading && <p className="text-xs text-slate-500">Upload en cours...</p>}
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowAddContent(false)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white">Annuler</button>
                  <button onClick={handleAddContent} disabled={!contentTitle.trim()} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500 text-white hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed">
                    <Check className="w-3.5 h-3.5" />
                    Ajouter
                  </button>
                </div>
              </motion.div>
            )}

            {/* Liste des contenus */}
            {contents.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                Aucun contenu pour ce module. Ajoutez du texte, vidéo, PDF ou lien.
              </div>
            ) : (
              <div className="space-y-2">
                {contents.map((lesson) => (
                  <LessonEditor key={lesson.id} lesson={lesson} onUpdate={fetchData} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ===== QUIZ ===== */}
        {activeTab === 'quiz' && (
          <motion.div key="quiz" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-2 block">
                Associer le quiz à une évaluation (ou laisser vide pour auto-évaluation indépendante)
              </label>
              <select
                value={selectedAssessmentId}
                onChange={(e) => setSelectedAssessmentId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm text-white bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                <option value="">-- Aucune évaluation liée --</option>
                {assessments.map((ass) => (
                  <option key={ass.id} value={ass.id}>{ass.title} ({ass.type})</option>
                ))}
              </select>
            </div>

            {/* Ajout question */}
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
                Aucune question pour ce quiz.
              </div>
            ) : (
              <div className="space-y-2">
                {qcmQuestions.map((q, i) => (
                  <div key={q.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">Q{i + 1}. {q.question}</p>
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
                    <button onClick={() => handleDeleteQuestion(q.id)} className="text-red-400 hover:text-red-300 transition-colors flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ===== ÉVALUATIONS ===== */}
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
                    { type: 'TP', icon: PenTool, label: 'Devoir (pratique)' },
                    { type: 'EXAM', icon: GraduationCap, label: 'Examen (final)' },
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
                  placeholder="Titre de l'évaluation (ex: Devoir n°1, Examen final)"
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

            {/* Liste des évaluations */}
            {assessments.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                Aucune évaluation pour ce module.
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
      </AnimatePresence>
    </div>
  );
}