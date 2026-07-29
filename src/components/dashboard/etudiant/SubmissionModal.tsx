'use client';

import { useState } from 'react';
import { createClientComponent } from '@/lib/supabase/client';

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessmentId: string;
  userStatus: string;
}

export function SubmissionModal({ isOpen, onClose, assessmentId, userStatus }: SubmissionModalProps) {
  const supabase = createClientComponent();
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const isPaid = userStatus?.trim().toUpperCase() === 'PAID';

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPaid) {
      alert("❌ Seuls les étudiants ayant validé leur règlement peuvent soumettre leurs travaux.");
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase.from('submissions').insert({
        assessment_id: assessmentId,
        student_id: user.id,
        submission_url: submissionUrl,
        status: 'PENDING'
      });

      if (!error) {
        alert("✅ Votre devoir a été transmis au formateur !");
        onClose();
      } else {
        alert("Erreur : " + error.message);
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '450px', color: '#fff' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>📤 Soumettre votre TP / Examen</h3>

        {!isPaid ? (
          <div style={{ background: '#451a03', border: '1px solid #ea580c', padding: '16px', borderRadius: '8px', color: '#fdba74', fontSize: '13px' }}>
            🔒 <strong>Option Verrouillée :</strong> Vous devez régler vos frais d'inscription pour pouvoir soumettre vos devoirs et obtenir vos notes.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                Lien de votre rendu (Google Drive, GitHub, PDF...) *
              </label>
              <input
                type="url"
                required
                placeholder="https://..."
                value={submissionUrl}
                onChange={(e) => setSubmissionUrl(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={onClose} style={{ padding: '8px 16px', background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                Annuler
              </button>
              <button type="submit" disabled={loading} style={{ padding: '8px 16px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                {loading ? 'Envoi...' : 'Envoyer le devoir'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}