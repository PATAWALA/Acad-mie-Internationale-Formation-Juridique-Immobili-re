'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import CourseEditor from './CourseEditor';
import { cn } from '@/lib/utils';
import { fadeIn, stagger, scaleIn } from '@/lib/animations';
import {
  BookOpen,
  Plus,
  Loader2,
  FileText,
  Clock,
  ArrowRight,
  Bookmark,
  Search,
  X,
} from 'lucide-react';

interface Props {
  certId: number;
  profile: any;
}

export default function CourseContentManager({ certId, profile }: Props) {
  const supabase = createClientComponent();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('certificate_id', certId)
      .order('created_at', { ascending: false });
    if (!error && data) setCourses(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, [certId]);

  const handleCreateCourse = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);

    const { data, error } = await supabase
      .from('courses')
      .insert({
        title: newTitle,
        description: newDescription,
        certificate_id: certId,
        created_by: profile.id,
        is_published: true,
      })
      .select('*')
      .single();

    if (error) {
      alert('Erreur : ' + error.message);
      setCreating(false);
    } else {
      setNewTitle('');
      setNewDescription('');
      setShowAddForm(false);
      setCreating(false);
      setSelectedCourse(data);
      fetchCourses();
    }
  };

  if (selectedCourse) {
    return (
      <CourseEditor
        course={selectedCourse}
        onBack={() => setSelectedCourse(null)}
      />
    );
  }

  // Squelette de chargement
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-56 bg-slate-800 rounded animate-pulse" />
            <div className="h-4 w-40 bg-slate-800/50 rounded animate-pulse" />
          </div>
          <div className="h-10 w-36 bg-slate-800 rounded-xl animate-pulse" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-3">
              <div className="h-5 w-48 bg-slate-800 rounded animate-pulse" />
              <div className="h-4 w-72 bg-slate-800/50 rounded animate-pulse" />
              <div className="h-3 w-24 bg-slate-800/50 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div {...fadeIn} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-violet-400" />
            </div>
            📚 Cours du certificat
          </h2>
          <p className="text-slate-400 text-sm mt-1 ml-[52px]">
            Gérez le contenu pédagogique de cette formation
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
            bg-gradient-to-r from-green-500 to-emerald-600 text-white
            shadow-lg shadow-green-500/20 hover:shadow-green-500/30
            hover:from-green-400 hover:to-emerald-500 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Nouveau cours
        </motion.button>
      </motion.div>

      {/* Liste des cours */}
      {courses.length === 0 && !showAddForm ? (
        <motion.div
          {...fadeIn}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-24 h-24 bg-slate-800 rounded-3xl flex items-center justify-center mb-6">
            <Bookmark className="w-12 h-12 text-slate-600" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">
            Aucun cours pour le moment
          </h3>
          <p className="text-slate-400 max-w-md mb-6">
            Commencez par créer votre premier cours pour ce certificat. 
            Vous pourrez ensuite y ajouter des modules, leçons et évaluations.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
              bg-violet-500/10 text-violet-400 border border-violet-500/20
              hover:bg-violet-500/20 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Créer mon premier cours
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="grid gap-4"
        >
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              variants={fadeIn}
              custom={index}
              whileHover={{ y: -2, scale: 1.005 }}
              whileTap={{ scale: 0.995 }}
              onClick={() => setSelectedCourse(course)}
              className={cn(
                "group cursor-pointer",
                "bg-slate-900/50 border border-slate-800 rounded-xl",
                "hover:border-violet-500/30 hover:bg-slate-900/80",
                "transition-all duration-300 p-5 lg:p-6"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-violet-500/10 rounded-lg flex items-center justify-center
                      group-hover:bg-violet-500/20 transition-colors">
                      <FileText className="w-4 h-4 text-violet-400" />
                    </div>
                    <h3 className="text-white font-semibold text-lg truncate group-hover:text-violet-400 transition-colors">
                      {course.title}
                    </h3>
                  </div>
                  <p className="text-slate-400 text-sm ml-11 line-clamp-2">
                    {course.description || 'Aucune description'}
                  </p>
                  <div className="flex items-center gap-4 mt-3 ml-11">
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      Créé le {new Date(course.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <motion.div
                    className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center
                      group-hover:bg-violet-500/20 group-hover:text-violet-400
                      text-slate-500 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Modal de création */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddForm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              variants={scaleIn}
              initial="initial"
              animate="animate"
              exit="initial"
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-violet-500/5 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <Plus className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">
                      Créer un nouveau cours
                    </h3>
                    <p className="text-slate-400 text-xs">
                      Remplissez les informations du cours
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowAddForm(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Formulaire */}
              <div className="p-5 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Titre du cours *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Introduction au droit civil"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    autoFocus
                    className={cn(
                      "w-full px-4 py-2.5 rounded-xl text-white",
                      "bg-slate-800 border border-slate-700",
                      "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500",
                      "placeholder-slate-500 transition-all duration-200"
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Description
                  </label>
                  <textarea
                    placeholder="Description du cours (optionnelle)"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    rows={3}
                    className={cn(
                      "w-full px-4 py-2.5 rounded-xl text-white resize-none",
                      "bg-slate-800 border border-slate-700",
                      "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500",
                      "placeholder-slate-500 transition-all duration-200"
                    )}
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium
                      bg-slate-800 text-slate-300 border border-slate-700
                      hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    Annuler
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateCourse}
                    disabled={!newTitle.trim() || creating}
                    className={cn(
                      "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium",
                      "bg-gradient-to-r from-green-500 to-emerald-600 text-white",
                      "shadow-lg shadow-green-500/20 hover:shadow-green-500/30",
                      "hover:from-green-400 hover:to-emerald-500 transition-all duration-200",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Création...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Créer le cours
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}