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
} from 'lucide-react';

interface Props {
  module: any;
  onUpdate: () => void;
}

export default function ModuleEditor({ module, onUpdate }: Props) {
  const supabase = createClientComponent();
  const [lessons, setLessons] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<'lessons' | 'assessments'>('lessons');
  const [showAddLessonInput, setShowAddLessonInput] = useState(false);
  const [showAddAssessmentInput, setShowAddAssessmentInput] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState<string>('TEXT');
  const [newAssessmentTitle, setNewAssessmentTitle] = useState('');
  const [newAssessmentType, setNewAssessmentType] = useState<string>('TP');

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

  // Types de leçons avec les nouveaux libellés
  const lessonTypes = [
    { type: 'TEXT', icon: FileText, label: 'Partie théorique', color: 'text-blue-400', bg: 'bg-blue-500/10', desc: 'Contenu texte à lire' },
    { type: 'TEXT', icon: PenTool, label: 'Partie pratique', color: 'text-orange-400', bg: 'bg-orange-500/10', desc: 'Exercices à faire' },
    { type: 'VIDEO', icon: Video, label: 'Support vidéo', color: 'text-red-400', bg: 'bg-red-500/10', desc: 'Lien YouTube, Loom...' },
    { type: 'PDF', icon: FileArchive, label: 'Support PDF', color: 'text-amber-400', bg: 'bg-amber-500/10', desc: 'Document à télécharger' },
    { type: 'LINK', icon: Link2, label: 'Ressource externe', color: 'text-green-400', bg: 'bg-green-500/10', desc: 'Lien vers un site' },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs Leçons / Évaluations */}
      <div className="flex gap-2 p-1 bg-slate-800/50 rounded-xl">
        <button
          onClick={() => setActiveSection('lessons')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            activeSection === 'lessons'
              ? "bg-violet-500/20 text-violet-400 shadow-sm"
              : "text-slate-400 hover:text-white"
          )}
        >
          <BookOpen className="w-4 h-4" />
          Leçons
          <span className={cn(
            "text-xs px-1.5 py-0.5 rounded-full",
            activeSection === 'lessons' ? "bg-violet-500/20" : "bg-slate-700"
          )}>
            {lessons.length}
          </span>
        </button>
        <button
          onClick={() => setActiveSection('assessments')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            activeSection === 'assessments'
              ? "bg-violet-500/20 text-violet-400 shadow-sm"
              : "text-slate-400 hover:text-white"
          )}
        >
          <PenTool className="w-4 h-4" />
          Évaluations
          <span className={cn(
            "text-xs px-1.5 py-0.5 rounded-full",
            activeSection === 'assessments' ? "bg-violet-500/20" : "bg-slate-700"
          )}>
            {assessments.length}
          </span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* SECTION LEÇONS */}
        {activeSection === 'lessons' && (
          <motion.div
            key="lessons"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Leçons ({lessons.length})
              </h5>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddLessonInput(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                  bg-slate-800 text-slate-300 border border-slate-700
                  hover:bg-slate-700 hover:text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter une leçon
              </motion.button>
            </div>

            {/* Formulaire ajout leçon */}
            <AnimatePresence>
              {showAddLessonInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">Nouvelle leçon</p>
                        <p className="text-xs text-slate-400 mt-0.5">Choisissez le type de contenu</p>
                      </div>
                      <button
                        onClick={() => setShowAddLessonInput(false)}
                        className="text-slate-500 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Types de leçon */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {lessonTypes.map((type) => (
                        <motion.button
                          key={type.type + type.label}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setNewLessonType(type.type)}
                          className={cn(
                            "flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium transition-all duration-200 border",
                            newLessonType === type.type && newLessonTitle.includes(type.label)
                              ? `${type.bg} border-current ${type.color}`
                              : "bg-slate-900 border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600"
                          )}
                        >
                          <type.icon className="w-5 h-5" />
                          <span className="text-center leading-tight">{type.label}</span>
                        </motion.button>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={newLessonTitle}
                        onChange={(e) => setNewLessonTitle(e.target.value)}
                        placeholder="Titre de la leçon (ex: Introduction théorique)"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddLesson();
                          if (e.key === 'Escape') {
                            setShowAddLessonInput(false);
                            setNewLessonTitle('');
                          }
                        }}
                        className={cn(
                          "flex-1 px-3 py-2 rounded-lg text-white text-sm",
                          "bg-slate-900 border border-slate-700",
                          "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500",
                          "placeholder-slate-500 transition-all duration-200"
                        )}
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddLesson}
                        disabled={!newLessonTitle.trim()}
                        className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-medium
                          hover:bg-green-400 transition-colors disabled:opacity-50"
                      >
                        Ajouter
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Liste des leçons */}
            {lessons.length === 0 ? (
              <div className="text-center py-8 bg-slate-800/30 rounded-xl border border-slate-800/50">
                <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">
                  Ajoutez une partie théorique et une partie pratique
                </p>
              </div>
            ) : (
              <motion.div
                variants={stagger}
                initial="initial"
                animate="animate"
                className="space-y-2"
              >
                {lessons.map((lesson) => (
                  <LessonEditor key={lesson.id} lesson={lesson} onUpdate={fetchData} />
                ))}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* SECTION ÉVALUATIONS */}
        {activeSection === 'assessments' && (
          <motion.div
            key="assessments"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <PenTool className="w-4 h-4" />
                Évaluations ({assessments.length})
              </h5>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddAssessmentInput(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                  bg-slate-800 text-slate-300 border border-slate-700
                  hover:bg-slate-700 hover:text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter une évaluation
              </motion.button>
            </div>

            {/* Formulaire ajout évaluation */}
            <AnimatePresence>
              {showAddAssessmentInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">Nouvelle évaluation</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Cette évaluation permettra de valider la semaine
                        </p>
                      </div>
                      <button
                        onClick={() => setShowAddAssessmentInput(false)}
                        className="text-slate-500 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Type d'évaluation */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { type: 'TP', icon: PenTool, label: 'Travail Pratique' },
                        { type: 'EXAM', icon: GraduationCap, label: 'Examen final' },
                      ].map((type) => (
                        <motion.button
                          key={type.type}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setNewAssessmentType(type.type)}
                          className={cn(
                            "flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-medium transition-all duration-200 border",
                            newAssessmentType === type.type
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-slate-900 border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600"
                          )}
                        >
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </motion.button>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={newAssessmentTitle}
                        onChange={(e) => setNewAssessmentTitle(e.target.value)}
                        placeholder="Titre de l'évaluation (ex: TP Semaine 1)"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddAssessment();
                          if (e.key === 'Escape') {
                            setShowAddAssessmentInput(false);
                            setNewAssessmentTitle('');
                          }
                        }}
                        className={cn(
                          "flex-1 px-3 py-2 rounded-lg text-white text-sm",
                          "bg-slate-900 border border-slate-700",
                          "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500",
                          "placeholder-slate-500 transition-all duration-200"
                        )}
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddAssessment}
                        disabled={!newAssessmentTitle.trim()}
                        className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-medium
                          hover:bg-green-400 transition-colors disabled:opacity-50"
                      >
                        Ajouter
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Liste des évaluations */}
            {assessments.length === 0 ? (
              <div className="text-center py-8 bg-slate-800/30 rounded-xl border border-slate-800/50">
                <PenTool className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">
                  Ajoutez une évaluation pour valider cette semaine
                </p>
              </div>
            ) : (
              <motion.div
                variants={stagger}
                initial="initial"
                animate="animate"
                className="space-y-2"
              >
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