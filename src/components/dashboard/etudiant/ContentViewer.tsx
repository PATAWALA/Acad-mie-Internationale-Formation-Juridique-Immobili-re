'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, FileText, ExternalLink, Maximize2, 
  Download, Eye, Loader2, AlertCircle
} from 'lucide-react';

interface ContentViewerProps {
  contentType: string;
  contentUrl?: string | null;
  contentBody?: string | null;
  title: string;
}

export default function ContentViewer({ contentType, contentUrl, contentBody, title }: ContentViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Transformer les liens YouTube
  const getYouTubeEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  // Contenu TEXTE
  if (contentType === 'TEXT' && contentBody) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#020617] border border-[#1e293b] rounded-xl p-4 lg:p-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-green-500/10 rounded-lg">
            <FileText className="w-4 h-4 text-green-400" />
          </div>
          <span className="text-sm font-medium text-white">{title}</span>
        </div>
        <div className="prose prose-invert max-w-none text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
          {contentBody}
        </div>
      </motion.div>
    );
  }

  // Contenu VIDÉO
  if (contentType === 'VIDEO' && contentUrl) {
    const embedUrl = getYouTubeEmbedUrl(contentUrl);

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#020617] border border-[#1e293b] rounded-xl overflow-hidden"
      >
        {/* Video Header */}
        <div className="flex items-center justify-between p-3 lg:p-4 border-b border-[#1e293b]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-500/10 rounded-lg">
              <Play className="w-4 h-4 text-red-400" />
            </div>
            <span className="text-sm font-medium text-white truncate">{title}</span>
          </div>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 hover:bg-[#1e293b] rounded-lg transition-colors"
          >
            <Maximize2 className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Video Container */}
        <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#020617]">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          )}
          
          {hasError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-sm text-slate-400 mb-2">Impossible de charger la vidéo</p>
              <a
                href={contentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
              >
                <ExternalLink className="w-4 h-4" />
                Ouvrir dans un nouvel onglet
              </a>
            </div>
          ) : (
            <div className="relative w-full" style={{ paddingBottom: isFullscreen ? '0' : '56.25%' }}>
              <iframe
                src={embedUrl}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setHasError(true);
                }}
                className={`absolute inset-0 w-full ${isFullscreen ? 'h-screen' : 'h-full'} rounded-b-xl`}
              />
            </div>
          )}
        </div>

        {/* Close fullscreen button */}
        {isFullscreen && (
          <button
            onClick={() => setIsFullscreen(false)}
            className="fixed top-4 right-4 z-50 p-2 bg-black/80 hover:bg-black rounded-xl text-white transition-colors"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        )}
      </motion.div>
    );
  }

  // Contenu PDF
  if (contentType === 'PDF' && contentUrl) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#020617] border border-[#1e293b] rounded-xl overflow-hidden"
      >
        {/* PDF Header */}
        <div className="flex items-center justify-between p-3 lg:p-4 border-b border-[#1e293b]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-500/10 rounded-lg">
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-sm font-medium text-white truncate">{title}</span>
          </div>
          <div className="flex items-center gap-1">
            <a
              href={contentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 hover:bg-[#1e293b] rounded-lg transition-colors"
              title="Ouvrir dans un nouvel onglet"
            >
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </a>
            <a
              href={contentUrl}
              download
              className="p-1.5 hover:bg-[#1e293b] rounded-lg transition-colors"
              title="Télécharger"
            >
              <Download className="w-4 h-4 text-slate-400" />
            </a>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#020617]">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          )}
          
          {hasError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-sm text-slate-400 mb-2">Aperçu non disponible</p>
              <a
                href={contentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <Download className="w-4 h-4" />
                Télécharger le PDF
              </a>
            </div>
          ) : (
            <iframe
              src={contentUrl}
              width="100%"
              height="500"
              className="w-full rounded-b-xl"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
          )}
        </div>
      </motion.div>
    );
  }

  // Contenu LIEN ou fallback
  if (contentType === 'LINK' && contentUrl) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ x: 4 }}
        className="bg-[#020617] border border-[#1e293b] hover:border-blue-500/20 rounded-xl p-4 transition-all group"
      >
        <a
          href={contentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3"
        >
          <div className="p-2 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors">
            <ExternalLink className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white group-hover:text-purple-400 transition-colors truncate">
              {title}
            </p>
            <p className="text-xs text-slate-500">Cliquez pour ouvrir le lien</p>
          </div>
          <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition-colors flex-shrink-0" />
        </a>
      </motion.div>
    );
  }

  // Fallback générique
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#020617] border border-[#1e293b] rounded-xl p-4 text-center"
    >
      <Eye className="w-8 h-8 text-slate-600 mx-auto mb-2" />
      <p className="text-sm text-slate-400 mb-1">
        Contenu {contentType}
      </p>
      {contentUrl && (
        <a
          href={contentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          Ouvrir le contenu
        </a>
      )}
    </motion.div>
  );
}