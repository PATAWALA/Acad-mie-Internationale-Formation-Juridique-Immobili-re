'use client';

import { useState, useRef } from 'react';
import { createClientComponent } from '@/lib/supabase/client';

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessmentId: string;
  userStatus: string;
}

export function SubmissionModal({ isOpen, onClose, assessmentId, userStatus }: SubmissionModalProps) {
  const supabase = createClientComponent();
  const [mode, setMode] = useState<'upload' | 'link'>('upload'); // mode par défaut : upload
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPaid = userStatus?.trim().toUpperCase() === 'PAID';

  if (!isOpen) return null;

  // Gère la sélection d'un fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    // Prévisualisation pour les images
    if (selected.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(selected);
    } else {
      setPreview(null);
    }
  };

  // Upload vers Supabase Storage
  const handleUpload = async (): Promise<string | null> => {
    if (!file) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Non authentifié');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${assessmentId}_${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage
      .from('submissions')
      .upload(fileName, file);

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from('submissions')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPaid) {
      alert("❌ Seuls les étudiants ayant validé leur règlement peuvent soumettre leurs travaux.");
      return;
    }

    setLoading(true);
    try {
      let finalUrl = '';

      if (mode === 'upload' && file) {
        finalUrl = await handleUpload() || '';
        if (!finalUrl) throw new Error("Échec de l'upload.");
      } else if (mode === 'link') {
        if (!linkUrl.trim()) throw new Error("Veuillez fournir un lien.");
        finalUrl = linkUrl.trim();
      } else {
        throw new Error("Veuillez choisir un fichier ou entrer un lien.");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { error: insertError } = await supabase.from('submissions').insert({
        assessment_id: assessmentId,
        student_id: user.id,
        submission_url: finalUrl,
        status: 'PENDING',
      });

      if (insertError) throw insertError;

      alert("✅ Votre travail a été transmis au formateur !");
      onClose();
    } catch (err: any) {
      alert("Erreur : " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '500px', color: '#fff' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>📤 Soumettre votre travail</h3>

        {!isPaid ? (
          <div style={{ background: '#451a03', border: '1px solid #ea580c', padding: '16px', borderRadius: '8px', color: '#fdba74', fontSize: '13px' }}>
            🔒 <strong>Option Verrouillée :</strong> Vous devez régler vos frais d'inscription pour pouvoir soumettre vos devoirs et obtenir vos notes.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Choix du mode */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <button
                type="button"
                onClick={() => setMode('upload')}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: mode === 'upload' ? '#1e3a8a' : '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: mode === 'upload' ? 'bold' : 'normal'
                }}
              >
                📎 Photo / PDF
              </button>
              <button
                type="button"
                onClick={() => setMode('link')}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: mode === 'link' ? '#1e3a8a' : '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: mode === 'link' ? 'bold' : 'normal'
                }}
              >
                🔗 Lien externe
              </button>
            </div>

            {/* Mode upload */}
            {mode === 'upload' && (
              <div>
                <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
                  Prenez une photo de votre copie manuscrite, ou uploadez un fichier PDF.
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ padding: '10px', background: '#1e293b', border: '1px dashed #334155', borderRadius: '6px', color: '#94a3b8', cursor: 'pointer', width: '100%' }}
                >
                  {file ? file.name : 'Cliquez pour sélectionner un fichier'}
                </button>
                {preview && (
                  <img src={preview} alt="Aperçu" style={{ marginTop: '12px', maxWidth: '100%', borderRadius: '8px', border: '1px solid #334155' }} />
                )}
              </div>
            )}

            {/* Mode lien */}
            {mode === 'link' && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                  Lien de votre rendu (Google Drive, GitHub, PDF...) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={onClose} style={{ padding: '8px 16px', background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                Annuler
              </button>
              <button type="submit" disabled={loading} style={{ padding: '8px 16px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                {loading ? 'Envoi...' : 'Envoyer le travail'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}