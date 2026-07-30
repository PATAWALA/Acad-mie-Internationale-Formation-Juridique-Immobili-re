'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { scaleIn } from '@/lib/animations';
import {
  X,
  BookOpen,
  GraduationCap,
  UserCheck,
  FileText,
  AlertCircle,
  Loader2,
  Save,
  PlusCircle,
  Edit3,
} from 'lucide-react';

interface CourseFormModalProps {
  course: any | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function CourseFormModal({ course, onClose, onSaved }: CourseFormModalProps) {
  const supabase = createClientComponent();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [certificateId, setCertificateId] = useState<number | ''>('');
  const [teacherId, setTeacherId] = useState<string>('');
  const [certificates, setCertificates] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!course;

  useEffect(() => {
    supabase
      .from('certificates')
      .select('id, title')
      .order('title')
      .then(({ data }) => {
        if (data) setCertificates(data);
      });

    supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'TEACHER')
      .order('full_name')
      .then(({ data }) => {
        if (data) setTeachers(data);
      });

    if (course) {
      setTitle(course.title || '');
      setDescription(course.description || '');
      setCertificateId(course.certificate_id || '');
      setTeacherId(course.created_by || '');
    }
  }, [course]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || certificateId === '') {
      setError('Le titre et le certificat sont obligatoires.');
      return;
    }
    setLoading(true);
    setError('');

    const payload = {
      title,
      description,
      certificate_id: certificateId,
      created_by: teacherId || null,
      is_published: true,
    };

    const { error: submitError } = isEditing
      ? await supabase.from('courses').update(payload).eq('id', course.id)
      : await supabase.from('courses').insert(payload);

    if (submitError) {
      setError(submitError.message);
    } else {
      onSaved();
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          variants={scaleIn}
          initial="initial"
          animate="animate"
          exit="initial"
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl shadow-black/50 overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-xl">
                {isEditing ? (
                  <Edit3 className="w-5 h-5 text-blue-400" />
                ) : (
                  <PlusCircle className="w-5 h-5 text-blue-400" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {isEditing ? 'Modifier le cours' : 'Nouveau cours'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isEditing
                    ? 'Modifier les informations du cours'
                    : 'Créer un nouveau cours de formation'}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4"
                >
                  <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Titre */}
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  Titre du cours *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Ex: Introduction au Droit des Sociétés"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                  <FileText className="w-3.5 h-3.5" />
                  Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description du cours, objectifs pédagogiques..."
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none"
                />
              </div>

              {/* Certificat */}
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Certificat associé *
                </label>
                <select
                  value={certificateId}
                  onChange={(e) =>
                    setCertificateId(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  required
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="">-- Sélectionner un certificat --</option>
                  {certificates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
                {certificates.length === 0 && (
                  <p className="text-xs text-amber-400 mt-2">
                    Aucun certificat disponible. Créez-en un d'abord.
                  </p>
                )}
              </div>

              {/* Enseignant responsable */}
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                  <UserCheck className="w-3.5 h-3.5" />
                  Enseignant responsable
                </label>
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="">-- Aucun (non assigné) --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name || t.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors"
                >
                  Annuler
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'px-5 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-xl transition-all flex items-center gap-2',
                    'hover:bg-blue-600 shadow-lg shadow-blue-500/20',
                    loading && 'opacity-70 cursor-not-allowed'
                  )}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {isEditing ? 'Mettre à jour' : 'Ajouter le cours'}
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}