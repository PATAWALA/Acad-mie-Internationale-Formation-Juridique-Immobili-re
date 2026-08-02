'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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
      <div className="text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
        {contentBody}
      </div>
    );
  }

  // Contenu VIDÉO
  if (contentType === 'VIDEO' && contentUrl) {
    const embedUrl = getYouTubeEmbedUrl(contentUrl);

    return (
      <div className="relative bg-[#020617] border border-[#1e293b] rounded-xl overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#020617] z-10 rounded-xl">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        )}
        
        {hasError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-sm text-slate-400 mb-3">Impossible de charger la vidéo</p>
            <a href={contentUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors">
              <ExternalLink className="w-4 h-4" /> Ouvrir dans un nouvel onglet
            </a>
          </div>
        ) : (
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={embedUrl}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setIsLoading(false)}
              onError={() => { setIsLoading(false); setHasError(true); }}
              className="absolute inset-0 w-full h-full"
            />
          </div>
        )}
      </div>
    );
  }

  // Contenu PDF
  if (contentType === 'PDF' && contentUrl) {
    return (
      <div className="bg-[#020617] border border-[#1e293b] rounded-xl overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#020617] z-10 rounded-xl">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        )}
        
        {hasError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-sm text-slate-400 mb-3">Aperçu non disponible</p>
            <a href={contentUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors">
              <Download className="w-4 h-4" /> Télécharger le PDF
            </a>
          </div>
        ) : (
          <iframe src={contentUrl} width="100%" height="500" className="w-full"
            onLoad={() => setIsLoading(false)}
            onError={() => { setIsLoading(false); setHasError(true); }} />
        )}
      </div>
    );
  }

  // Contenu LIEN
  if (contentType === 'LINK' && contentUrl) {
    return (
      <a href={contentUrl} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 hover:bg-purple-500/20 transition-colors text-sm font-medium">
        <ExternalLink className="w-4 h-4" /> Ouvrir le lien
      </a>
    );
  }

  // Fallback
  return null;
}