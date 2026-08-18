'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Eye, Download, ExternalLink, 
  Image, FileText, Loader2 
} from 'lucide-react';

interface SubmissionViewerProps {
  submissionUrl: string;
}

export default function SubmissionViewer({ submissionUrl }: SubmissionViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Détection des types de fichiers
  const isImage = /\.(jpeg|jpg|png|gif|webp|bmp)(\?.*)?$/i.test(submissionUrl);
  const isPdf = /\.pdf(\?.*)?$/i.test(submissionUrl);

  // Réinitialiser l'état quand on ouvre
  const handleOpen = () => {
    setIsLoading(true);
    setHasError(false);
    setIsOpen(true);
  };

  return (
    <>
      {/* Bouton déclencheur */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleOpen}
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 text-xs font-medium rounded-lg transition-all"
      >
        <Eye className="w-3.5 h-3.5" />
        Voir le travail
      </motion.button>

      {/* Modal Viewer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#1e293b]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-xl">
                    {isImage ? (
                      <Image className="w-5 h-5 text-blue-400" />
                    ) : isPdf ? (
                      <FileText className="w-5 h-5 text-blue-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-blue-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Copie soumise
                    </h3>
                    <p className="text-xs text-slate-400">
                      {isImage ? 'Image' : isPdf ? 'Document PDF' : 'Fichier'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Ouvrir dans un nouvel onglet */}
                  <a
                    href={submissionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-[#1e293b] rounded-xl transition-colors"
                    title="Ouvrir dans un nouvel onglet"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </a>
                  {/* Télécharger */}
                  <a
                    href={submissionUrl}
                    download
                    className="p-2 hover:bg-[#1e293b] rounded-xl transition-colors"
                    title="Télécharger"
                  >
                    <Download className="w-4 h-4 text-slate-400" />
                  </a>
                  {/* Fermer */}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-[#1e293b] rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="relative bg-[#020617] overflow-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
                {/* Loading */}
                {isLoading && !hasError && (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                  </div>
                )}

                {/* Error */}
                {hasError && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <FileText className="w-16 h-16 text-slate-600 mb-4" />
                    <h4 className="text-lg font-semibold text-white mb-2">
                      Aperçu non disponible
                    </h4>
                    <p className="text-sm text-slate-400 mb-4">
                      Le fichier ne peut pas être affiché directement.
                    </p>
                    <a
                      href={submissionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Ouvrir dans un nouvel onglet
                    </a>
                  </div>
                )}

                {/* Image Viewer */}
                {isImage && !hasError && (
                  <img
                    src={submissionUrl}
                    alt="Copie soumise"
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                      setIsLoading(false);
                      setHasError(true);
                    }}
                    className="w-full h-auto"
                    style={{ display: isLoading ? 'none' : 'block' }}
                  />
                )}

                {/* PDF Viewer */}
                {isPdf && !hasError && (
                  <iframe
                    src={submissionUrl}
                    width="100%"
                    height="700"
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                      setIsLoading(false);
                      setHasError(true);
                    }}
                    className="w-full border-none"
                    style={{ display: isLoading ? 'none' : 'block' }}
                  />
                )}

                {/* Fallback */}
                {!isImage && !isPdf && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Eye className="w-16 h-16 text-slate-600 mb-4" />
                    <h4 className="text-lg font-semibold text-white mb-2">
                      Aperçu non disponible
                    </h4>
                    <p className="text-sm text-slate-400 mb-4">
                      Ce type de fichier ne peut pas être prévisualisé.
                    </p>
                    <a
                      href={submissionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Ouvrir le fichier
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}