'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import ModuleEditor from './ModuleEditor';
import { cn } from '@/lib/utils';
import { fadeIn, stagger } from '@/lib/animations';
import {
  ArrowLeft,
  Plus,
  Loader2,
  BookOpen,
  Calendar,
  Trash2,
  AlertCircle,
  Layers,
} from 'lucide-react';

interface Props {
  course: any;
  onBack: () => void;
}

export default function CourseEditor({ course, onBack }: Props) {
  const supabase = createClientComponent();
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingModule, setAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);

  const fetchModules = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('course_id', course.id)
      .order('week_number', { ascending: true });
    if (!error && data) setModules(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchModules();
  }, [course.id]);

  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) return;
    setAddingModule(true);
    
    const weekNumber = modules.length + 1;
    const { error } = await supabase
      .from('modules')
      .insert({
        course_id: course.id,
        title: newModuleTitle,
        week_number: weekNumber,
      });
    
    if (error) {
      alert(error.message);
    } else {
      setNewModuleTitle('');
      setShowAddInput(false);
      fetchModules();
    }
    setAddingModule(false);
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Supprimer ce module et tout son contenu ? Cette action est irréversible.')) return;
    const { error } = await supabase.from('modules').delete().eq('id', moduleId);
    if (error) alert(error.message);
    else fetchModules();
  };

  // Squelette de chargement
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 bg-slate-800 rounded animate-pulse" />
        <div className="space-y-2">
          <div className="h-7 w-64 bg-slate-800 rounded animate-pulse" />
          <div className="h-4 w-96 bg-slate-800/50 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-3">
              <div className="h-5 w-48 bg-slate-800 rounded animate-pulse" />
              <div className="h-20 bg-slate-800/50 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div {...fadeIn} className="space-y-6">
      {/* Breadcrumb + Header */}
      <div className="space-y-4">
        <motion.button
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Retour aux cours</span>
        </motion.button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6 text-violet-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">
              {course.title}
            </h2>
            {course.description && (
              <p className="text-slate-400 mt-2 text-sm">
                {course.description}
              </p>
            )}
            <div className="flex items-center gap-4 mt-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                Créé le {new Date(course.created_at).toLocaleDateString('fr-FR')}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <Layers className="w-3.5 h-3.5" />
                {modules.length} module{modules.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section modules */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-violet-400" />
            Modules (semaines)
          </h3>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddInput(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
              bg-gradient-to-r from-green-500 to-emerald-600 text-white
              shadow-lg shadow-green-500/20 hover:shadow-green-500/30
              hover:from-green-400 hover:to-emerald-500 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Ajouter un module
          </motion.button>
        </div>

        {/* Input ajout rapide */}
        <AnimatePresence>
          {showAddInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={newModuleTitle}
                    onChange={(e) => setNewModuleTitle(e.target.value)}
                    placeholder="Ex: Semaine 1 : Introduction au droit"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddModule();
                      if (e.key === 'Escape') {
                        setShowAddInput(false);
                        setNewModuleTitle('');
                      }
                    }}
                    className={cn(
                      "flex-1 px-4 py-2.5 rounded-xl text-white",
                      "bg-slate-800 border border-slate-700",
                      "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500",
                      "placeholder-slate-500 transition-all duration-200"
                    )}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddModule}
                    disabled={!newModuleTitle.trim() || addingModule}
                    className="px-4 py-2.5 rounded-xl bg-green-500 text-white font-medium
                      hover:bg-green-400 transition-colors disabled:opacity-50"
                  >
                    {addingModule ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Ajouter'
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowAddInput(false);
                      setNewModuleTitle('');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-400
                      hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    Annuler
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Liste des modules */}
        {modules.length === 0 ? (
          <motion.div
            {...fadeIn}
            className="flex flex-col items-center justify-center py-16 text-center bg-slate-900/30 border border-slate-800 rounded-xl"
          >
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
              <Layers className="w-8 h-8 text-slate-600" />
            </div>
            <h4 className="text-white font-medium mb-2">
              Aucun module pour ce cours
            </h4>
            <p className="text-slate-400 text-sm max-w-md">
              Ajoutez des modules pour structurer votre cours par semaines. 
              Chaque module peut contenir des leçons et des évaluations.
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="space-y-4"
          >
            {modules.map((mod, index) => (
              <motion.div
                key={mod.id}
                variants={fadeIn}
                custom={index}
                className={cn(
                  "bg-slate-900/50 border border-slate-800 rounded-xl",
                  "hover:border-slate-700 transition-colors duration-200",
                  "overflow-hidden"
                )}
              >
                {/* Header du module */}
                <div className="flex items-center justify-between p-5 border-b border-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-violet-500/10 rounded-lg flex items-center justify-center text-sm font-bold text-violet-400">
                      {mod.week_number}
                    </div>
                    <h4 className="text-white font-semibold">
                      Semaine {mod.week_number} : {mod.title}
                    </h4>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteModule(mod.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                      bg-red-500/10 text-red-400 border border-red-500/20
                      hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Supprimer
                  </motion.button>
                </div>

                {/* Contenu du module */}
                <div className="p-5">
                  <ModuleEditor module={mod} onUpdate={fetchModules} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}