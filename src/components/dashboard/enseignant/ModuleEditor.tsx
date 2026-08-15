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
} from 'lucide-react';

interface Props {
  module: any;
  onUpdate: () => void;
}

export default function ModuleEditor({ module, onUpdate }: Props) {
  const supabase = createClientComponent();
  const [lessons, setLessons] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'lessons' | 'assessments'>('lessons');

  // États pour l'ajout de leçon
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState<string>('TEXT');
  const [lessonUrl, setLessonUrl] = useState('');

  // États pour l'ajout d'évaluation
  const [showAddAssessment, setShowAddAssessment] = useState(false);
  const [assessmentTitle, setAssessmentTitle] = useState('');
  const [assessmentDescription, setAssessmentDescription] = useState('');
  const [assessmentType, setAssessmentType] = useState<'TP' | 'EXAM'>('TP');

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
    // Reset
    setLessonTitle('');
    setLessonUrl('');
    setLessonType('TEXT');
    setShowAddLesson(false);
    fetchData();
    onUpdate();
  };

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
    // Reset
    setAssessmentTitle('');
    setAssessmentDescription('');
    setAssessmentType('TP');
    setShowAddAssessment(false);
    fetchData();
    onUpdate();
  };

  const lessonTypes = [
    { type: 'TEXT', icon: FileText, label: 'Texte', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    { type: 'VIDEO', icon: Video, label: 'Vidéo', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    { type: 'PDF', icon: FileArchive, label: 'PDF', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
    { type: 'LINK', icon: Link2, label: 'Lien', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  ];

  return (
    <div className="space-y-4">
      {/* Onglets */}
      <div className="flex gap-1 p-1 bg-slate-800/50 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('lessons')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
            activeTab === 'lessons'
              ? "bg-slate-700 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
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
            activeTab === 'assessments'
              ? "bg-slate-700 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          <PenTool className="w-4 h-4" />
          Évaluations
          <span className="text-xs text-slate-500">{assessments.length}</span>
        </button>
      </div>

      {/* ========== CONTENU LEÇONS ========== */}
      <AnimatePresence mode="wait">
        {activeTab === 'lessons' && (
          <motion.div
            key="lessons"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            {/* Bouton ajouter leçon */}
            {!showAddLesson ? (
              <button
                onClick={() => setShowAddLesson(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-800/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                Ajouter une leçon
              </button>
            ) : (
              /* Formulaire ajout leçon */
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-900/70 border border-slate-700 rounded-xl p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white">Nouvelle leçon</h4>
                  <button
                    onClick={() => setShowAddLesson(false)}
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Type de leçon */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {lessonTypes.map((type) => (
                    <button
                      key={type.type}
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

                {/* Titre */}
                <input
                  type="text"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="Titre de la leçon"
                  autoFocus
                  className={cn(
                    "w-full px-3 py-2 rounded-lg text-sm text-white bg-slate-800 border border-slate-700",
                    "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500",
                    "placeholder-slate-500"
                  )}
                />

                {/* URL si nécessaire */}
                {(lessonType === 'VIDEO' || lessonType === 'PDF' || lessonType === 'LINK') && (
                  <input
                    type="text"
                    value={lessonUrl}
                    onChange={(e) => setLessonUrl(e.target.value)}
                    placeholder="URL du contenu (https://...)"
                    className={cn(
                      "w-full px-3 py-2 rounded-lg text-sm text-white bg-slate-800 border border-slate-700",
                      "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500",
                      "placeholder-slate-500"
                    )}
                  />
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowAddLesson(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddLesson}
                    disabled={!lessonTitle.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500 text-white hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Ajouter
                  </button>
                </div>
              </motion.div>
            )}

            {/* Liste des leçons */}
            {lessons.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                Aucune leçon dans ce module.
              </div>
            ) : (
              <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-2">
                {lessons.map((lesson) => (
                  <LessonEditor key={lesson.id} lesson={lesson} onUpdate={fetchData} />
                ))}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ========== CONTENU ÉVALUATIONS ========== */}
        {activeTab === 'assessments' && (
          <motion.div
            key="assessments"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            {/* Bouton ajouter évaluation */}
            {!showAddAssessment ? (
              <button
                onClick={() => setShowAddAssessment(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-800/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                Ajouter une évaluation
              </button>
            ) : (
              /* Formulaire ajout évaluation */
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-900/70 border border-slate-700 rounded-xl p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white">Nouvelle évaluation</h4>
                  <button
                    onClick={() => setShowAddAssessment(false)}
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
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

                {/* Titre */}
                <input
                  type="text"
                  value={assessmentTitle}
                  onChange={(e) => setAssessmentTitle(e.target.value)}
                  placeholder="Titre de l'évaluation (ex: QCM, TP noté...)"
                  autoFocus
                  className={cn(
                    "w-full px-3 py-2 rounded-lg text-sm text-white bg-slate-800 border border-slate-700",
                    "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500",
                    "placeholder-slate-500"
                  )}
                />

                {/* Description */}
                <textarea
                  value={assessmentDescription}
                  onChange={(e) => setAssessmentDescription(e.target.value)}
                  rows={2}
                  placeholder="Description (optionnelle)"
                  className={cn(
                    "w-full px-3 py-2 rounded-lg text-sm text-white bg-slate-800 border border-slate-700 resize-none",
                    "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500",
                    "placeholder-slate-500"
                  )}
                />

                {/* Actions */}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowAddAssessment(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddAssessment}
                    disabled={!assessmentTitle.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500 text-white hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Ajouter
                  </button>
                </div>
              </motion.div>
            )}

            {/* Liste des évaluations */}
            {assessments.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                Aucune évaluation dans ce module.
              </div>
            ) : (
              <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-2">
                {assessments.map((ass) => (
                  <AssessmentEditor key={ass.id} assessment={ass} onUpdate={fetchData} />
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}