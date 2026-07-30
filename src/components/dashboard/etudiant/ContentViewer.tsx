'use client';

interface ContentViewerProps {
  contentType: string;
  contentUrl?: string | null;
  contentBody?: string | null;
  title: string;
}

export default function ContentViewer({ contentType, contentUrl, contentBody, title }: ContentViewerProps) {
  if (contentType === 'TEXT' && contentBody) {
    return (
      <div style={{ padding: '12px', background: '#1e293b', borderRadius: '8px', color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>
        {contentBody}
      </div>
    );
  }

  if (contentType === 'VIDEO' && contentUrl) {
    // Transforme un lien YouTube classique en embed si nécessaire
    let embedUrl = contentUrl;
    if (contentUrl.includes('youtube.com/watch?v=')) {
      const videoId = contentUrl.split('v=')[1]?.split('&')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (contentUrl.includes('youtu.be/')) {
      const videoId = contentUrl.split('youtu.be/')[1]?.split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
    return (
      <div style={{ marginTop: '8px' }}>
        <iframe
          width="100%"
          height="400"
          src={embedUrl}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ borderRadius: '8px' }}
        ></iframe>
      </div>
    );
  }

  if (contentType === 'PDF' && contentUrl) {
    return (
      <div style={{ marginTop: '8px' }}>
        <iframe
          src={contentUrl}
          width="100%"
          height="500"
          style={{ borderRadius: '8px', border: '1px solid #334155' }}
        ></iframe>
      </div>
    );
  }

  // Fallback pour LINK ou autre : on affiche un lien
  return (
    <div style={{ marginTop: '8px' }}>
      <a
        href={contentUrl || '#'}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#38bdf8', textDecoration: 'underline' }}
      >
        📎 Ouvrir le contenu ({contentType})
      </a>
    </div>
  );
}