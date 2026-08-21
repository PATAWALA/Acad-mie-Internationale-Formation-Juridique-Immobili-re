'use client';

import { useState, useMemo } from 'react';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SubmissionViewerProps {
  submissionUrl: string;
}

export default function SubmissionViewer({ submissionUrl }: SubmissionViewerProps) {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Séparer les URLs multiples (stockées avec '|||')
  const files = useMemo(() => {
    if (!submissionUrl) return [];
    return submissionUrl.split('|||').filter(url => url.trim() !== '');
  }, [submissionUrl]);

  const currentFile = files[currentIndex] || '';

  const isImage = (url: string) => /\.(jpeg|jpg|png|gif|webp)(\?.*)?$/i.test(url);
  const isPdf = (url: string) => /\.pdf(\?.*)?$/i.test(url);

  const getFileType = (url: string) => {
    if (isImage(url)) return { icon: FileImage, label: 'Image' };
    if (isPdf(url)) return { icon: FileText, label: 'PDF' };
    return { icon: AlertTriangle, label: 'Fichier' };
  };

  const fileType = currentFile ? getFileType(currentFile) : { icon: FileImage, label: 'Fichier' };
  const FileIcon = fileType.icon;

  const goNext = () => {
    if (files.length > 1) setCurrentIndex(prev => (prev + 1) % files.length);
  };

  const goPrev = () => {
    if (files.length > 1) setCurrentIndex(prev => (prev - 1 + files.length) % files.length);
  };

  return (
    <>
      {/* Bouton d'ouverture */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setCurrentIndex(0);
          setOpen(true);
        }}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
          bg-blue-500/10 text-blue-400 border border-blue-500/20
          hover:bg-blue-500/20 transition-colors"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        Voir le travail {files.length > 1 ? `(${files.length} fichiers)` : ''}
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
                      {fileType.label} de l&apos;étudiant {files.length > 1 && `(${currentIndex + 1}/${files.length})`}
                    </p>
                    <p className="text-slate-500 text-xs">
                      {currentFile.split('/').pop()?.substring(0, 50)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Lien externe */}
                  <a
                    href={currentFile}
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
              <div className="relative flex-1 overflow-auto bg-slate-950/50 flex items-center justify-center p-4">
                {/* Navigation multi-fichiers */}
                {files.length > 1 && (
                  <>
                    <button
                      onClick={goPrev}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-slate-800/80 rounded-full text-white hover:bg-slate-700 transition-colors"
                      aria-label="Fichier précédent"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={goNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-slate-800/80 rounded-full text-white hover:bg-slate-700 transition-colors"
                      aria-label="Fichier suivant"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {isImage(currentFile) ? (
                  <motion.img
                    key={currentFile}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    src={currentFile}
                    alt="Copie de l'étudiant"
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  />
                ) : isPdf(currentFile) ? (
                  <motion.iframe
                    key={currentFile}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    src={currentFile}
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
                    <h3 className="text-white font-semibold mb-2">Aperçu non disponible</h3>
                    <p className="text-slate-400 text-sm mb-6">
                      Ce format de fichier ne peut pas être prévisualisé directement.
                    </p>
                    <a
                      href={currentFile}
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

                {/* Vignettes multi-fichiers */}
                {files.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-slate-900/80 rounded-lg p-2">
                    {files.map((url, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={cn(
                          "w-10 h-10 rounded-lg overflow-hidden border transition-all",
                          index === currentIndex
                            ? "border-blue-500"
                            : "border-slate-700 hover:border-slate-500"
                        )}
                      >
                        {isImage(url) ? (
                          <img src={url} alt={`Miniature ${index + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-800">
                            <FileText className="w-4 h-4 text-slate-400" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}