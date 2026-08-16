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
  Check,
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
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [lessonType, setLessonType] = useState<'TEXT' | 'VIDEO' | 'PDF' | 'LINK' | 'QUIZ'>('TEXT');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonUrl, setLessonUrl] = useState('');
  const [lessonBody, setLessonBody] = useState('');
  const [showAddExam, setShowAddExam] = useState(false);
  const [examTitle, setExamTitle] = useState('');
  const [examDescription, setExamDescription] = useState('');

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

  useEffect(() => {
    fetchData();
  }, [module.id]);

  const theoreticalLessons = lessons.filter(l => l.category === 'THEORIQUE');
  const practicalLessons = lessons.filter(l => l.category === 'PRATIQUE');

  const handleAddLesson = async () => {
    if (!lessonTitle.trim()) return;
    const category = activeTab === 'theoretical' ? 'THEORIQUE' : 'PRATIQUE';
    const position = category === 'THEORIQUE' ? theoreticalLessons.length + 1 : practicalLessons.length + 1;

    const { error } = await supabase.from('lessons').insert({
      module_id: module.id,
      title: lessonTitle,
      content_type: lessonType,
      content_url: lessonUrl.trim() || null,
      content_body: lessonBody.trim() || null,
      category,
      position,
    });

    if (!error) {
      setLessonTitle('');
      setLessonUrl('');
      setLessonBody('');
      setLessonType('TEXT');
      setShowAddLesson(false);
      fetchData();
      onUpdate();
    }
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
      {/* Onglets simples */}
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
        {/* ============ CONTENU THÉORIQUE / PRATIQUE ============ */}
        {(activeTab === 'theoretical' || activeTab === 'practical') && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {/* Bouton ajouter */}
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

            {/* Formulaire ajout leçon */}
            {showAddLesson && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3">
                <div className="flex gap-2">
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
                  placeholder="Titre"
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

                <div className="flex gap-2">
                  <button
                    onClick={handleAddLesson}
                    disabled={!lessonTitle.trim()}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    Ajouter
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
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between bg-slate-800/30 border border-slate-700/50 rounded-lg p-3"
                  >
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

        {/* ============ EXAMENS ============ */}
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
                  <div
                    key={exam.id}
                    className="flex items-center justify-between bg-slate-800/30 border border-slate-700/50 rounded-lg p-3"
                  >
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
    </div>
  );
}