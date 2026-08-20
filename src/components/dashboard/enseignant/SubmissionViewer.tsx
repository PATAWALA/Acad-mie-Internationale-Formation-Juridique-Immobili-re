'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { scaleIn } from '@/lib/animations';
import {
  X,
  ExternalLink,
  FileImage,
  FileText,
  AlertTriangle,
  Download,
} from 'lucide-react';

interface SubmissionViewerProps {
  submissionUrl: string;
}

export default function SubmissionViewer({ submissionUrl }: SubmissionViewerProps) {
  const [open, setOpen] = useState(false);

  const isImage = /\.(jpeg|jpg|png|gif|webp)(\?.*)?$/i.test(submissionUrl);
  const isPdf = /\.pdf(\?.*)?$/i.test(submissionUrl);

  const getFileType = () => {
    if (isImage) return { icon: FileImage, label: 'Image' };
    if (isPdf) return { icon: FileText, label: 'PDF' };
    return { icon: AlertTriangle, label: 'Fichier' };
  };

  const fileType = getFileType();
  const FileIcon = fileType.icon;

  return (
    <>
      {/* Bouton d'ouverture */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
          bg-blue-500/10 text-blue-400 border border-blue-500/20
          hover:bg-blue-500/20 transition-colors"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        Voir le travail
      </motion.button>

      {/* Modal plein écran */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
            />

            {/* Contenu */}
            <motion.div
              variants={scaleIn}
              initial="initial"
              animate="animate"
              exit="initial"
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "relative w-full h-full max-w-6xl max-h-[95vh] m-4",
                "bg-slate-900 border border-slate-800 rounded-2xl",
                "shadow-2xl overflow-hidden",
                "flex flex-col"
              )}
            >
              {/* Barre d'outils */}
              <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center">
                    <FileIcon className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">
                      {fileType.label} de l&apos;étudiant
                    </p>
                    <p className="text-slate-500 text-xs">
                      {submissionUrl.split('/').pop()?.substring(0, 50)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Ouvrir dans un nouvel onglet */}
                  <a
                    href={submissionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
                      bg-slate-800 text-slate-300 border border-slate-700
                      hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Ouvrir dans un nouvel onglet</span>
                  </a>

                  {/* Fermer */}
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setOpen(false)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg
                      bg-slate-800 text-slate-400 hover:bg-red-500/20 hover:text-red-400
                      transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Zone de visualisation */}
              <div className="flex-1 overflow-auto bg-slate-950/50 flex items-center justify-center p-4">
                {isImage ? (
                  <motion.img
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    src={submissionUrl}
                    alt="Copie de l'étudiant"
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  />
                ) : isPdf ? (
                  <motion.iframe
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    src={submissionUrl}
                    className="w-full h-full rounded-lg border border-slate-800"
                    title="PDF de la copie"
                  />
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md"
                  >
                    <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <AlertTriangle className="w-10 h-10 text-amber-400" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">
                      Aperçu non disponible
                    </h3>
                    <p className="text-slate-400 text-sm mb-6">
                      Ce format de fichier ne peut pas être prévisualisé directement.
                      Vous pouvez l&apos;ouvrir dans un nouvel onglet.
                    </p>
                    <a
                      href={submissionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                        bg-violet-500/10 text-violet-400 border border-violet-500/20
                        hover:bg-violet-500/20 transition-colors font-medium"
                    >
                      <Download className="w-4 h-4" />
                      Ouvrir le fichier
                    </a>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}