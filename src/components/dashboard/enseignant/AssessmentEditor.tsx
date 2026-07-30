'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import {
  PenTool,
  GraduationCap,
  Pencil,
  Trash2,
  Check,
  X,
  GripVertical,
} from 'lucide-react';

interface Props {
  assessment: any;
  onUpdate: () => void;
}

export default function AssessmentEditor({ assessment, onUpdate }: Props) {
  const supabase = createClientComponent();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(assessment.title);
  const [description, setDescription] = useState(assessment.description || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isExam = assessment.type === 'EXAM';
  const typeConfig = isExam
    ? { icon: GraduationCap, label: 'Examen', color: 'text-purple-400', bg: 'bg-purple-500/10' }
    : { icon: PenTool, label: 'TP', color: 'text-amber-400', bg: 'bg-amber-500/10' };

  const TypeIcon = typeConfig.icon;

  const handleSave = async () => {
    const { error } = await supabase
      .from('assessments')
      .update({ title, description })
      .eq('id', assessment.id);
    if (error) alert(error.message);
    else {
      setEditing(false);
      onUpdate();
    }
  };

  const handleDelete = async () => {
    const { error } = await supabase.from('assessments').delete().eq('id', assessment.id);
    if (error) alert(error.message);
    else onUpdate();
  };

  return (
    <motion.div
      layout
      className={cn(
        "group relative bg-slate-800/30 border border-slate-700/50 rounded-xl transition-all duration-200",
        "hover:border-slate-600/50 hover:bg-slate-800/50"
      )}
    >
      {editing ? (
        /* MODE ÉDITION */
        <div className="p-3 space-y-3">
          <div className="flex items-center gap-3">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", typeConfig.bg)}>
              <TypeIcon className={cn("w-4 h-4", typeConfig.color)} />
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              className={cn(
                "flex-1 px-3 py-1.5 rounded-lg text-white text-sm",
                "bg-slate-900 border border-slate-700",
                "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500",
                "placeholder-slate-500 transition-all duration-200"
              )}
            />
          </div>

          <div className="ml-11">
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de l'évaluation"
              className={cn(
                "w-full px-3 py-1.5 rounded-lg text-white text-sm resize-none",
                "bg-slate-900 border border-slate-700",
                "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500",
                "placeholder-slate-500 transition-all duration-200"
              )}
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditing(false);
                setTitle(assessment.title);
                setDescription(assessment.description || '');
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium
                bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Annuler
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium
                bg-green-500 text-white hover:bg-green-400 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Enregistrer
            </motion.button>
          </div>
        </div>
      ) : (
        /* MODE AFFICHAGE */
        <div className="flex items-center gap-3 p-3">
          <GripVertical className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />

          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", typeConfig.bg)}>
            <TypeIcon className={cn("w-4 h-4", typeConfig.color)} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-medium truncate">
                {assessment.title}
              </span>
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0",
                typeConfig.bg, typeConfig.color
              )}>
                {typeConfig.label}
              </span>
            </div>
            {assessment.description && (
              <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">
                {assessment.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setEditing(true)}
              className="w-7 h-7 flex items-center justify-center rounded-lg
                bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white transition-colors"
              title="Modifier"
            >
              <Pencil className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowDeleteConfirm(true)}
              className="w-7 h-7 flex items-center justify-center rounded-lg
                bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
      )}

      {/* Confirmation suppression */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm rounded-xl flex items-center justify-center z-10"
          >
            <div className="text-center p-4">
              <p className="text-white text-sm font-medium mb-3">
                Supprimer cette évaluation ?
              </p>
              <div className="flex items-center justify-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium
                    bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDelete}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium
                    bg-red-500 text-white hover:bg-red-400 transition-colors"
                >
                  Supprimer
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}