'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import {
  FileText,
  Video,
  FileArchive,
  Link2,
  Pencil,
  Trash2,
  Check,
  X,
  ExternalLink,
  GripVertical,
  HelpCircle,
  BookOpen,
  Wrench,
} from 'lucide-react';

interface Props {
  lesson: any;
  onUpdate: () => void;
}

export default function LessonEditor({ lesson, onUpdate }: Props) {
  const supabase = createClientComponent();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const [contentUrl, setContentUrl] = useState(lesson.content_url || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getTypeConfig = (type: string) => {
    const configs: Record<string, { icon: any; label: string; color: string; bg: string }> = {
      TEXT: { icon: FileText, label: 'Texte', color: 'text-blue-400', bg: 'bg-blue-500/10' },
      VIDEO: { icon: Video, label: 'Vidéo', color: 'text-red-400', bg: 'bg-red-500/10' },
      PDF: { icon: FileArchive, label: 'PDF', color: 'text-amber-400', bg: 'bg-amber-500/10' },
      LINK: { icon: Link2, label: 'Lien', color: 'text-green-400', bg: 'bg-green-500/10' },
      QUIZ: { icon: HelpCircle, label: 'QCM', color: 'text-violet-400', bg: 'bg-violet-500/10' },
    };
    return configs[type] || configs.TEXT;
  };

  const typeConfig = getTypeConfig(lesson.content_type || 'TEXT');
  const TypeIcon = typeConfig.icon;
  const isQuiz = lesson.content_type === 'QUIZ';
  const category = lesson.category || 'THEORIQUE';

  const handleSave = async () => {
    const { error } = await supabase
      .from('lessons')
      .update({
        title,
        content_url: isQuiz ? null : contentUrl || null,
      })
      .eq('id', lesson.id);
    if (error) alert(error.message);
    else {
      setEditing(false);
      onUpdate();
    }
  };

  const handleDelete = async () => {
    const { error } = await supabase.from('lessons').delete().eq('id', lesson.id);
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

          {!isQuiz && (lesson.content_type === 'VIDEO' || lesson.content_type === 'PDF' || lesson.content_type === 'LINK') && (
            <div className="ml-11">
              <input
                type="text"
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
                placeholder="URL du contenu"
                className={cn(
                  "w-full px-3 py-1.5 rounded-lg text-white text-sm",
                  "bg-slate-900 border border-slate-700",
                  "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500",
                  "placeholder-slate-500 transition-all duration-200"
                )}
              />
            </div>
          )}

          {isQuiz && (
            <div className="ml-11 text-xs text-slate-400">
              Les questions du QCM se gèrent via le bouton sous la leçon.
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditing(false);
                setTitle(lesson.title);
                setContentUrl(lesson.content_url || '');
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

          <div className="flex-1 min-w-0 flex items-center gap-2">
            <span className="text-white text-sm font-medium truncate">
              {lesson.title}
            </span>
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0",
              typeConfig.bg, typeConfig.color
            )}>
              {typeConfig.label}
            </span>
            {/* Badge catégorie */}
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0",
              category === 'THEORIQUE' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'
            )}>
              {category === 'THEORIQUE' ? 'Théorique' : 'Pratique'}
            </span>
          </div>

          {lesson.content_url && !isQuiz && (
            <a
              href={lesson.content_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors flex-shrink-0"
            >
              <ExternalLink className="w-3 h-3" />
              Voir
            </a>
          )}

          {isQuiz && (
            <span className="text-xs text-violet-400 flex-shrink-0">
              {lesson.quiz_questions_count || 'QCM'} {/* Optionnel si vous avez un compteur */}
            </span>
          )}

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
                Supprimer cette leçon ?
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