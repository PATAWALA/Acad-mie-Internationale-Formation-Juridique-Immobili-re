'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import {
  BookOpen, Wrench, GraduationCap, Plus, Trash2, HelpCircle,
  FileText, Video, FileArchive, Link2, X, Upload, Loader2, Pencil,
  ListChecks
} from 'lucide-react';
import HtmlContentViewer from '../../HtmlContentViewer';
import { textToHtml } from '@/lib/textToHtml';

/* eslint-disable @next/next/no-img-element */

interface ModuleEditorProps {
  module: any;
  onUpdate: () => void;
}

type LessonType = 'TEXT' | 'VIDEO' | 'PDF' | 'LINK' | 'QUIZ';

export default function ModuleEditor({ module, onUpdate }: ModuleEditorProps) {
  const supabase = createClientComponent();
  const [activeTab, setActiveTab] = useState<'theoretical' | 'practical' | 'exams'>('theoretical');

  // Données
  const [lessons, setLessons] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);

  // Formulaire leçon théorique / création QCM
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [lessonType, setLessonType] = useState<LessonType>('TEXT');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonUrl, setLessonUrl] = useState('');
  const [lessonBodyRaw, setLessonBodyRaw] = useState('');
  const [uploadingPdf, setUploadingPdf] = useState(false);

  // Formulaire examen
  const [showAddExam, setShowAddExam] = useState(false);
  const [editingExam, setEditingExam] = useState<any | null>(null);
  const [examTitle, setExamTitle] = useState('');
  const [examDescription, setExamDescription] = useState('');
  const [examImages, setExamImages] = useState<string[]>([]);
  const [examFiles, setExamFiles] = useState<string[]>([]);
  const [uploadingExamFile, setUploadingExamFile] = useState(false);

  // Modale QCM
  const [activeQuizLesson, setActiveQuizLesson] = useState<any | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState<'A' | 'B' | 'C' | 'D'>('A');

  // Modale TP
  const [showTpModal, setShowTpModal] = useState(false);
  const [tpTitle, setTpTitle] = useState('');
  const [tpStatement, setTpStatement] = useState('');
  const [tpQuestions, setTpQuestions] = useState<any[]>([]);
  const [tpQuestionText, setTpQuestionText] = useState('');
  const [tpOptionA, setTpOptionA] = useState('');
  const [tpOptionB, setTpOptionB] = useState('');
  const [tpOptionC, setTpOptionC] = useState('');
  const [tpOptionD, setTpOptionD] = useState('');
  const [tpCorrectAnswer, setTpCorrectAnswer] = useState<'A' | 'B' | 'C' | 'D'>('A');

  const fetchData = useCallback(async () => {
    const { data: l } = await supabase
      .from('lessons')
      .select('id, title, content_type, content_url, content_body, category, position')
      .eq('module_id', module.id)
      .order('position', { ascending: true });
    if (l) setLessons(l);

    const { data: a } = await supabase
      .from('assessments')
      .select('id, title, description, type')
      .eq('module_id', module.id);
    if (a) setAssessments(a);
  }, [supabase, module.id]);

  const fetchQuizQuestions = useCallback(async (lessonId: string) => {
    const { data } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('position', { ascending: true });
    if (data) setQuizQuestions(data);
  }, [supabase]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  useEffect(() => {
    if (activeQuizLesson) {
      const timer = setTimeout(() => {
        fetchQuizQuestions(activeQuizLesson.id);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeQuizLesson, fetchQuizQuestions]);

  const theoreticalLessons = lessons.filter(l => l.category === 'THEORIQUE');
  const practicalLessons = lessons.filter(l => l.category === 'PRATIQUE' && l.content_type !== 'QUIZ');
  const quizLessons = lessons.filter(l => l.content_type === 'QUIZ');

  const sanitizeFileName = (fileName: string) => {
    return fileName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9.\-_]/g, '_')
      .replace(/\s+/g, '_');
  };

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  };

  const handlePdfUpload = async (file: File) => {
    if (!file) return;
    setUploadingPdf(true);
    const cleanName = sanitizeFileName(file.name);
    const fileName = `${Date.now()}_${cleanName}`;
    const { error: uploadError } = await supabase.storage
      .from('course-pdfs')
      .upload(fileName, file);
    if (uploadError) {
      alert('Upload échoué : ' + uploadError.message);
      setUploadingPdf(false);
      return;
    }
    const { data: publicUrlData } = supabase.storage
      .from('course-pdfs')
      .getPublicUrl(fileName);
    setLessonUrl(publicUrlData.publicUrl);
    setUploadingPdf(false);
  };

  const handleExamFileUpload = async (file: File) => {
    if (!file) return;
    setUploadingExamFile(true);
    const cleanName = sanitizeFileName(file.name);
    const fileName = `${Date.now()}_${cleanName}`;
    const { error: uploadError } = await supabase.storage
      .from('course-pdfs')
      .upload(fileName, file);
    if (uploadError) {
      alert('Upload échoué : ' + uploadError.message);
      setUploadingExamFile(false);
      return;
    }
    const { data: publicUrlData } = supabase.storage
      .from('course-pdfs')
      .getPublicUrl(fileName);
    if (file.type.startsWith('image/')) {
      setExamImages(prev => [...prev, publicUrlData.publicUrl]);
    } else {
      setExamFiles(prev => [...prev, publicUrlData.publicUrl]);
    }
    setUploadingExamFile(false);
  };

  const handleEditExam = (exam: any) => {
    setEditingExam(exam);
    setExamTitle(exam.title);
    setExamDescription(exam.description || '');
    setExamImages([]);
    setExamFiles([]);
    setShowAddExam(true);
  };

  const resetExamForm = () => {
    setExamTitle('');
    setExamDescription('');
    setExamImages([]);
    setExamFiles([]);
    setEditingExam(null);
    setShowAddExam(false);
  };

  const handleAddExam = async () => {
    if (!examTitle.trim()) return;
    let fullDescription = examDescription.trim() || '';
    if (examImages.length > 0) {
      fullDescription += '\n\n📷 DOCUMENTS IMAGES :\n';
      examImages.forEach((url, i) => {
        fullDescription += `Image ${i + 1}: ${url}\n`;
      });
    }
    if (examFiles.length > 0) {
      fullDescription += '\n📄 DOCUMENTS PDF :\n';
      examFiles.forEach((url, i) => {
        fullDescription += `PDF ${i + 1}: ${url}\n`;
      });
    }

    if (editingExam) {
      const { error } = await supabase
        .from('assessments')
        .update({ title: examTitle, description: fullDescription.trim() || null })
        .eq('id', editingExam.id);
      if (!error) resetExamForm();
    } else {
      const { error } = await supabase.from('assessments').insert({
        module_id: module.id,
        course_id: module.course_id,
        title: examTitle,
        description: fullDescription.trim() || null,
        type: 'EXAM',
      });
      if (!error) resetExamForm();
    }
    fetchData();
    onUpdate();
  };

  const handleDeleteExam = async (id: string) => {
    if (!confirm('Supprimer cet examen ?')) return;
    await supabase.from('assessments').delete().eq('id', id);
    fetchData();
    onUpdate();
  };

  // Gestion des leçons (théorique ou QCM)
  const handleAddTheoreticalLesson = async () => {
    if (!lessonTitle.trim()) return;
    if (lessonType === 'PDF' && !lessonUrl) {
      alert('Veuillez télécharger un fichier PDF.');
      return;
    }
    const category = activeTab === 'theoretical' ? 'THEORIQUE' : 'PRATIQUE';
    const contentBody = lessonType === 'TEXT' ? textToHtml(lessonBodyRaw) : null;
    const position = category === 'THEORIQUE'
      ? theoreticalLessons.length + 1
      : lessonType === 'QUIZ'
        ? quizLessons.length + 1
        : practicalLessons.length + 1;

    const { data, error } = await supabase.from('lessons').insert({
      module_id: module.id,
      title: lessonTitle,
      content_type: lessonType,
      content_url: lessonUrl.trim() || null,
      content_body: contentBody,
      category,
      position,
    }).select('*').single();

    if (error) {
      alert('Erreur: ' + error.message);
      return;
    }

    setLessonTitle('');
    setLessonUrl('');
    setLessonBodyRaw('');
    setLessonType('TEXT');
    setShowAddLesson(false);

    if (lessonType === 'QUIZ' && data) {
      setActiveQuizLesson(data);
    }
    fetchData();
    onUpdate();
  };

  const cleanOption = (text: string) => {
  return text.replace(/\s*\([^)]*Bonne réponse[^)]*\)/gi, '');
};

  const handleAddQuizQuestion = async () => {
  const cleanedQuestion = questionText.trim();
  const cleanedA = cleanOption(optionA.trim());
  const cleanedB = cleanOption(optionB.trim());
  const cleanedC = cleanOption(optionC.trim());
  const cleanedD = cleanOption(optionD.trim());

  if (!cleanedQuestion || !activeQuizLesson) return;
  if (!cleanedA || !cleanedB || !cleanedC || !cleanedD) {
    alert('Veuillez remplir les 4 options.');
    return;
  }

  const { error } = await supabase.from('quiz_questions').insert({
    lesson_id: activeQuizLesson.id,
    question: cleanedQuestion,
    option_a: cleanedA,
    option_b: cleanedB,
    option_c: cleanedC,
    option_d: cleanedD,
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

  const handleDeleteQuiz = async (lessonId: string) => {
    if (!confirm('Supprimer ce QCM et toutes ses questions ?')) return;
    await supabase.from('quiz_questions').delete().eq('lesson_id', lessonId);
    await supabase.from('lessons').delete().eq('id', lessonId);
    fetchData();
    onUpdate();
  };

  const handleSaveTp = async () => {
    if (!tpTitle.trim() || !tpStatement.trim()) return;
    if (tpQuestions.length === 0) {
      alert('Ajoutez au moins une question au TP.');
      return;
    }
    const { data: tpLesson, error: tpLessonError } = await supabase.from('lessons').insert({
      module_id: module.id,
      title: tpTitle,
      content_type: 'TEXT',
      content_body: textToHtml(tpStatement),
      category: 'PRATIQUE',
      position: practicalLessons.length + 1,
    }).select('*').single();

    if (tpLessonError || !tpLesson) {
      alert('Erreur création TP : ' + (tpLessonError?.message || 'inconnue'));
      return;
    }

    for (let i = 0; i < tpQuestions.length; i++) {
      const q = tpQuestions[i];
      const { data: questionData, error: questionError } = await supabase.from('tp_questions').insert({
        lesson_id: tpLesson.id,
        question_text: q.question,
        position: i + 1,
      }).select('*').single();

      if (questionError || !questionData) {
        alert('Erreur ajout question TP');
        continue;
      }

      const options = [
        { text: q.optionA, isCorrect: q.correct === 'A' },
        { text: q.optionB, isCorrect: q.correct === 'B' },
        { text: q.optionC, isCorrect: q.correct === 'C' },
        { text: q.optionD, isCorrect: q.correct === 'D' },
      ];

      for (let j = 0; j < options.length; j++) {
        await supabase.from('tp_options').insert({
          lesson_id: tpLesson.id,
          tp_question_id: questionData.id,
          option_text: options[j].text,
          is_correct: options[j].isCorrect,
          position: j + 1,
        });
      }
    }

    setTpTitle('');
    setTpStatement('');
    setTpQuestions([]);
    setShowTpModal(false);
    fetchData();
    onUpdate();
  };

  const handleAddTpQuestion = () => {
  const cleanedQuestion = tpQuestionText.trim();
  const cleanedA = cleanOption(tpOptionA.trim());
  const cleanedB = cleanOption(tpOptionB.trim());
  const cleanedC = cleanOption(tpOptionC.trim());
  const cleanedD = cleanOption(tpOptionD.trim());

  if (!cleanedQuestion || !cleanedA || !cleanedB || !cleanedC || !cleanedD) {
    alert('Veuillez remplir la question et les 4 propositions.');
    return;
  }

  const newQuestion = {
    question: cleanedQuestion,
    optionA: cleanedA,
    optionB: cleanedB,
    optionC: cleanedC,
    optionD: cleanedD,
    correct: tpCorrectAnswer,
  };

  setTpQuestions(prev => [...prev, newQuestion]);
  setTpQuestionText('');
  setTpOptionA('');
  setTpOptionB('');
  setTpOptionC('');
  setTpOptionD('');
  setTpCorrectAnswer('A');
};

  const handleDeleteTp = async (lessonId: string) => {
    if (!confirm('Supprimer ce TP et toutes ses questions ?')) return;
    const { data: tpQuestionIds } = await supabase.from('tp_questions').select('id').eq('lesson_id', lessonId);
    const ids = tpQuestionIds?.map(q => q.id) || [];
    if (ids.length > 0) {
      await supabase.from('tp_options').delete().in('tp_question_id', ids);
    }
    await supabase.from('tp_questions').delete().eq('lesson_id', lessonId);
    await supabase.from('lessons').delete().eq('id', lessonId);
    fetchData();
    onUpdate();
  };

  const lessonTypes = [
    { type: 'TEXT', icon: FileText, label: 'Texte', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { type: 'VIDEO', icon: Video, label: 'Vidéo', color: 'text-red-400', bg: 'bg-red-500/10' },
    { type: 'PDF', icon: FileArchive, label: 'PDF', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { type: 'LINK', icon: Link2, label: 'Lien', color: 'text-green-400', bg: 'bg-green-500/10' },
  ];

  return (
    <div className="space-y-4">
      {/* Onglets */}
      <div className="flex gap-2">
        <button onClick={() => setActiveTab('theoretical')} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors", activeTab === 'theoretical' ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-400 hover:text-white")}>
          <BookOpen className="w-4 h-4" /> Théorique <span className="text-xs opacity-75">({theoreticalLessons.length})</span>
        </button>
        <button onClick={() => setActiveTab('practical')} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors", activeTab === 'practical' ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-400 hover:text-white")}>
          <Wrench className="w-4 h-4" /> Pratique <span className="text-xs opacity-75">({practicalLessons.length + quizLessons.length})</span>
        </button>
        <button onClick={() => setActiveTab('exams')} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors", activeTab === 'exams' ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-400 hover:text-white")}>
          <GraduationCap className="w-4 h-4" /> Examens <span className="text-xs opacity-75">({assessments.length})</span>
        </button>
      </div>

      {/* Onglet Théorique */}
      {activeTab === 'theoretical' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-400">Contenu de cours : leçons, vidéos, PDF, liens. Les auditeurs lisent ce contenu avant de passer aux exercices.</p>
          <button onClick={() => { setShowAddLesson(true); setLessonType('TEXT'); setLessonUrl(''); setLessonBodyRaw(''); }}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-slate-500 transition-colors">
            <Plus className="w-4 h-4" /> Ajouter une leçon théorique
          </button>

          {showAddLesson && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                {lessonTypes.map((type) => (
                  <button key={type.type} onClick={() => setLessonType(type.type as LessonType)}
                    className={cn("flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors", lessonType === type.type ? `${type.bg} ${type.color} border-current` : "border-slate-600 text-slate-400 hover:text-white")}>
                    <type.icon className="w-4 h-4" /> {type.label}
                  </button>
                ))}
              </div>
              <input type="text" placeholder="Titre de la leçon" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              {lessonType === 'TEXT' && (
                <>
                  <textarea placeholder="Contenu... (séparez les paragraphes par une ligne vide, utilisez - pour une liste, ## pour un sous-titre)" value={lessonBodyRaw} onChange={(e) => setLessonBodyRaw(e.target.value)}
                    rows={6} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none" />
                  {lessonBodyRaw && (
                    <div className="p-3 bg-slate-900/80 border border-slate-700 rounded-lg">
                      <p className="text-xs text-slate-400 mb-2">Aperçu :</p>
                      <HtmlContentViewer content={textToHtml(lessonBodyRaw)} />
                    </div>
                  )}
                </>
              )}
              {lessonType === 'VIDEO' && (
                <input type="text" placeholder="URL de la vidéo" value={lessonUrl} onChange={(e) => setLessonUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              )}
              {lessonType === 'PDF' && (
                <div className="space-y-2">
                  <label className="flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-slate-400 transition-colors">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-400">
                      {uploadingPdf ? 'Upload en cours...' : 'Cliquez pour choisir un PDF'}
                    </span>
                    <input type="file" accept=".pdf" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handlePdfUpload(file); }} />
                  </label>
                  {uploadingPdf && <Loader2 className="w-4 h-4 text-blue-400 animate-spin mx-auto" />}
                  {lessonUrl && !uploadingPdf && <p className="text-xs text-green-400">✅ PDF téléchargé</p>}
                </div>
              )}
              {lessonType === 'LINK' && (
                <input type="text" placeholder="URL du lien" value={lessonUrl} onChange={(e) => setLessonUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              )}
              <div className="flex gap-2">
                <button onClick={handleAddTheoreticalLesson} disabled={!lessonTitle.trim() || (lessonType === 'PDF' && !lessonUrl) || uploadingPdf}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">Ajouter</button>
                <button onClick={() => setShowAddLesson(false)} className="px-4 py-2 bg-slate-700 text-slate-400 hover:text-white rounded-lg text-sm">Annuler</button>
              </div>
            </div>
          )}

          {theoreticalLessons.length === 0 ? (
            <p className="text-center text-slate-500 text-sm py-6">Aucune leçon théorique</p>
          ) : (
            theoreticalLessons.map((lesson) => (
              <div key={lesson.id} className="flex items-center justify-between bg-slate-800/30 border border-slate-700/50 rounded-lg p-3">
                <span className="text-white text-sm">{lesson.title}</span>
                <button onClick={() => handleDeleteTp(lesson.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Onglet Pratique */}
      {activeTab === 'practical' && (
        <div className="space-y-6">
          <p className="text-sm text-slate-400">Exercices pratiques : les TP sont des études de cas avec propositions, les QCM sont des questionnaires à choix multiples.</p>

          {/* Section TP */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold">Travaux Pratiques</h3>
              <button onClick={() => { setShowTpModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-medium">
                <Plus className="w-4 h-4" /> Ajouter un TP
              </button>
            </div>
            {practicalLessons.length === 0 ? (
              <p className="text-slate-500 text-sm py-4">Aucun TP pour le moment.</p>
            ) : (
              practicalLessons.map((tp) => (
                <div key={tp.id} className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3 mb-2 flex items-center justify-between">
                  <span className="text-white text-sm">{tp.title}</span>
                  <button onClick={() => handleDeleteTp(tp.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))
            )}
          </div>

          {/* Section QCM */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold">QCM</h3>
              <button onClick={() => { setShowAddLesson(true); setLessonType('QUIZ'); setLessonTitle(''); setLessonUrl(''); setLessonBodyRaw(''); }} className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-medium">
                <Plus className="w-4 h-4" /> Ajouter un QCM
              </button>
            </div>

            {/* Formulaire de création du QCM (affiche uniquement quand showAddLesson est vrai) */}
            {showAddLesson && lessonType === 'QUIZ' && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3 mb-4">
                <p className="text-sm text-slate-400">Donnez un titre au QCM, puis vous pourrez ajouter les questions juste après l'enregistrement.</p>
                <input type="text" placeholder="Titre du QCM" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
                <div className="flex gap-2">
                  <button onClick={handleAddTheoreticalLesson} disabled={!lessonTitle.trim()}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">Créer le QCM</button>
                  <button onClick={() => setShowAddLesson(false)} className="px-4 py-2 bg-slate-700 text-slate-400 hover:text-white rounded-lg text-sm">Annuler</button>
                </div>
              </div>
            )}

            {quizLessons.length === 0 ? (
              <p className="text-slate-500 text-sm py-4">Aucun QCM pour le moment.</p>
            ) : (
              quizLessons.map((quiz) => (
                <div key={quiz.id} className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3 mb-2 flex items-center justify-between">
                  <span className="text-white text-sm">{quiz.title}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setActiveQuizLesson(quiz)} className="text-violet-400 hover:text-violet-300 text-xs underline">Gérer les questions</button>
                    <button onClick={() => handleDeleteQuiz(quiz.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Onglet Examens */}
      {activeTab === 'exams' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-400">Examens de passage : ils valident le module. Les auditeurs doivent obtenir au moins 10/20 pour passer au module suivant.</p>
          <button onClick={() => { setEditingExam(null); setExamTitle(''); setExamDescription(''); setExamImages([]); setExamFiles([]); setShowAddExam(true); }}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-slate-500 transition-colors">
            <Plus className="w-4 h-4" /> Ajouter un examen
          </button>

          {showAddExam && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3">
              <input type="text" placeholder="Titre de l'examen" value={examTitle} onChange={(e) => setExamTitle(e.target.value)} autoFocus
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              <textarea placeholder="Consignes de l'examen..." value={examDescription} onChange={(e) => setExamDescription(e.target.value)} rows={4}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none" />
              <div className="space-y-2">
                <p className="text-xs text-slate-400 font-medium">Documents à joindre :</p>
                <label className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-slate-400 transition-colors">
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-400">{uploadingExamFile ? 'Upload en cours...' : 'Ajouter une image ou un PDF'}</span>
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleExamFileUpload(file); }} />
                </label>
                {uploadingExamFile && <Loader2 className="w-4 h-4 text-blue-400 animate-spin mx-auto" />}
                {examImages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {examImages.map((url, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-700">
                        <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                        <button onClick={() => setExamImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg p-0.5"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
                {examFiles.length > 0 && (
                  <div className="space-y-1">
                    {examFiles.map((url, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-900 rounded-lg p-2">
                        <span className="text-xs text-slate-400 flex items-center gap-2"><FileText className="w-3 h-3" /> PDF {i + 1}</span>
                        <button onClick={() => setExamFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-300"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddExam} disabled={!examTitle.trim() || uploadingExamFile}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">{editingExam ? 'Enregistrer' : 'Ajouter'}</button>
                <button onClick={() => { setShowAddExam(false); setEditingExam(null); }} className="px-4 py-2 bg-slate-700 text-slate-400 hover:text-white rounded-lg text-sm">Annuler</button>
              </div>
            </div>
          )}

          {assessments.length === 0 ? (
            <p className="text-center text-slate-500 text-sm py-6">Aucun examen</p>
          ) : (
            assessments.map((exam) => (
              <div key={exam.id} className="flex items-center justify-between bg-slate-800/30 border border-slate-700/50 rounded-lg p-3">
                <div className="flex-1 min-w-0">
                  <span className="text-white text-sm font-medium block truncate">{exam.title}</span>
                  {exam.description && <p className="text-slate-500 text-xs mt-0.5 line-clamp-1 overflow-hidden">{stripHtml(exam.description).substring(0, 80)}...</p>}
                  <div className="flex items-center gap-2 mt-1">
                    {exam.description?.includes('📷') && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] rounded-full">📷 Images</span>}
                    {exam.description?.includes('📄') && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] rounded-full">📄 PDFs</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <button onClick={() => handleEditExam(exam)} className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors" title="Modifier"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteExam(exam.id)} className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors" title="Supprimer"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modale TP */}
      <AnimatePresence>
        {showTpModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowTpModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <h3 className="text-white font-semibold flex items-center gap-2"><ListChecks className="w-5 h-5 text-orange-400" /> Créer un TP</h3>
                <button onClick={() => setShowTpModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                <p className="text-sm text-slate-400">Donnez un titre et un énoncé, puis ajoutez plusieurs questions avec leurs propositions.</p>
                <input type="text" placeholder="Titre du TP" value={tpTitle} onChange={(e) => setTpTitle(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
                <textarea placeholder="Énoncé du TP (texte brut, séparez les paragraphes par une ligne vide)" value={tpStatement} onChange={(e) => setTpStatement(e.target.value)} rows={4} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none" />
                {tpStatement && (
                  <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                    <p className="text-xs text-slate-400 mb-2">Aperçu de l'énoncé :</p>
                    <HtmlContentViewer content={textToHtml(tpStatement)} />
                  </div>
                )}

                <div className="border-t border-slate-800 pt-3">
                  <p className="text-sm text-slate-400 mb-2">Questions du TP</p>
                  <div className="grid grid-cols-1 gap-2">
                    <input type="text" placeholder="Question" value={tpQuestionText} onChange={(e) => setTpQuestionText(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input type="text" placeholder="Proposition A" value={tpOptionA} onChange={(e) => setTpOptionA(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
                      <input type="text" placeholder="Proposition B" value={tpOptionB} onChange={(e) => setTpOptionB(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
                      <input type="text" placeholder="Proposition C" value={tpOptionC} onChange={(e) => setTpOptionC(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
                      <input type="text" placeholder="Proposition D" value={tpOptionD} onChange={(e) => setTpOptionD(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Bonne réponse :</span>
                      {['A', 'B', 'C', 'D'].map((letter) => (
                        <button key={letter} onClick={() => setTpCorrectAnswer(letter as any)} className={cn("w-10 h-10 rounded-lg font-bold", tpCorrectAnswer === letter ? "bg-green-500 text-white" : "bg-slate-800 text-slate-400")}>{letter}</button>
                      ))}
                    </div>
                    <button onClick={handleAddTpQuestion} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm">Ajouter cette question</button>
                  </div>
                </div>

                {tpQuestions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400 font-medium">Questions ajoutées ({tpQuestions.length})</p>
                    {tpQuestions.map((q, idx) => (
                      <div key={idx} className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-2">
                        <p className="text-white text-sm">Q{idx + 1}. {q.question}</p>
                        <p className="text-xs text-slate-400">A: {q.optionA} | B: {q.optionB} | C: {q.optionC} | D: {q.optionD}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <button onClick={handleSaveTp} disabled={!tpTitle.trim() || !tpStatement.trim() || tpQuestions.length === 0}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">Enregistrer le TP</button>
                  <button onClick={() => setShowTpModal(false)} className="px-4 py-2 bg-slate-700 text-slate-400 hover:text-white rounded-lg text-sm">Annuler</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modale QCM */}
      <AnimatePresence>
        {activeQuizLesson && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveQuizLesson(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <h3 className="text-white font-semibold flex items-center gap-2"><HelpCircle className="w-5 h-5 text-violet-400" /> Questions du QCM : {activeQuizLesson.title}</h3>
                <button onClick={() => setActiveQuizLesson(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Question</label>
                    <input type="text" value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="Ex: Quelle est la première étape ?" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label className="text-xs text-slate-400 mb-1 block">Option A</label><input type="text" value={optionA} onChange={(e) => setOptionA(e.target.value)} placeholder="Option A" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50" /></div>
                    <div><label className="text-xs text-slate-400 mb-1 block">Option B</label><input type="text" value={optionB} onChange={(e) => setOptionB(e.target.value)} placeholder="Option B" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50" /></div>
                    <div><label className="text-xs text-slate-400 mb-1 block">Option C</label><input type="text" value={optionC} onChange={(e) => setOptionC(e.target.value)} placeholder="Option C" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50" /></div>
                    <div><label className="text-xs text-slate-400 mb-1 block">Option D</label><input type="text" value={optionD} onChange={(e) => setOptionD(e.target.value)} placeholder="Option D" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50" /></div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Bonne réponse</label>
                    <div className="flex gap-2">
                      {['A', 'B', 'C', 'D'].map((letter) => (
                        <button key={letter} onClick={() => setCorrectAnswer(letter as 'A' | 'B' | 'C' | 'D')} className={cn("w-12 h-12 rounded-lg font-bold text-lg transition-colors", correctAnswer === letter ? "bg-green-500 text-white" : "bg-slate-800 text-slate-400 hover:text-white")}>{letter}</button>
                      ))}
                    </div>
                  </div>
                  <button onClick={handleAddQuizQuestion} disabled={!questionText.trim() || !optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"><Plus className="w-4 h-4" /> Ajouter la question</button>
                </div>

                {quizQuestions.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-slate-800">
                    <p className="text-xs text-slate-400 font-medium">Questions ajoutées ({quizQuestions.length})</p>
                    {quizQuestions.map((q, index) => {
                      const optionsMap: Record<string, string> = { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d };
                      return (
                        <div key={q.id} className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-white text-sm font-medium">Q{index + 1}. {q.question}</p>
                            <button onClick={() => handleDeleteQuestion(q.id)} className="text-red-400 hover:text-red-300 flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
                          </div>
                          <div className="grid grid-cols-2 gap-1 mt-2">
                            {['A', 'B', 'C', 'D'].map((letter) => (
                              <span key={letter} className={cn("text-xs px-2 py-1 rounded", q.correct_answer === letter ? "bg-green-500/10 text-green-400 font-semibold" : "text-slate-400")}>{letter}) {optionsMap[letter]}</span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
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