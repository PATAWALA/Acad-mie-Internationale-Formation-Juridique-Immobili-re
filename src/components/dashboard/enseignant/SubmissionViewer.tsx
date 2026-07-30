'use client';

import { useState } from 'react';

interface SubmissionViewerProps {
  submissionUrl: string;
}

export default function SubmissionViewer({ submissionUrl }: SubmissionViewerProps) {
  const [open, setOpen] = useState(false);

  const isImage = /\.(jpeg|jpg|png|gif|webp)(\?.*)?$/i.test(submissionUrl);
  const isPdf = /\.pdf(\?.*)?$/i.test(submissionUrl);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ background: 'none', border: 'none', color: '#38bdf8', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}
      >
        Voir le travail ↗
      </button>

      {open && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 3000, padding: '20px'
          }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{ maxWidth: '90%', maxHeight: '90%', background: '#0f172a', borderRadius: '8px', overflow: 'auto', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              style={{
                position: 'absolute', top: '10px', right: '20px',
                background: 'rgba(0,0,0,0.8)', color: '#fff', border: 'none',
                fontSize: '28px', cursor: 'pointer', lineHeight: 1, zIndex: 10
              }}
            >
              ✕
            </button>
            {isImage ? (
              <img src={submissionUrl} alt="Copie" style={{ width: '100%', display: 'block' }} />
            ) : isPdf ? (
              <iframe src={submissionUrl} width="800" height="600" style={{ border: 'none' }} />
            ) : (
              <p style={{ padding: '20px', color: '#fff' }}>
                Aperçu indisponible.{' '}
                <a href={submissionUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8' }}>
                  Ouvrir dans un nouvel onglet
                </a>
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}