'use client';

import { useState } from 'react';
import { createClientComponent } from '@/lib/supabase/client';

interface GradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: any;
  onSuccess: () => void;
}

export function GradeModal({ isOpen, onClose, submission, onSuccess }: GradeModalProps) {
  const supabase = createClientComponent();
  const [grade, setGrade] = useState<number | ''>(submission?.grade ?? '');
  const [feedback, setFeedback] = useState<string>(submission?.feedback ?? '');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !submission) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const numGrade = Number(grade);
    const status = numGrade >= 10 ? 'PASSED' : 'FAILED';

    // Mise à jour de la soumission uniquement
    const { error: updateError } = await supabase
      .from('submissions')
      .update({
        grade: numGrade,
        feedback: feedback,
        status: status,
        graded_at: new Date().toISOString(),
      })
      .eq('id', submission.id);

    if (updateError) {
      alert('Erreur lors de l\'enregistrement : ' + updateError.message);
    }

    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '24px', width: '100%', maxWidth: '450px', color: '#fff' }}>
        <h3>Évaluer la soumission</h3>

        <p style={{ fontSize: '14px', color: '#94a3b8' }}>
          <strong>Étudiant :</strong> {submission.profiles?.full_name || submission.profiles?.email}<br />
          <strong>Lien du rendu :</strong>{' '}
          <a href={submission.submission_url} target="_blank" rel="noreferrer" style={{ color: '#38bdf8' }}>
            Consulter le travail ↗
          </a>
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Note (/20) :</label>
            <input
              type="number"
              min="0"
              max="20"
              step="0.5"
              required
              value={grade}
              onChange={(e) => setGrade(e.target.value === '' ? '' : Number(e.target.value))}
              style={{ width: '100%', padding: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Commentaire / Appréciation :</label>
            <textarea
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              style={{ width: '100%', padding: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', background: '#334155', color: '#fff', border: 'none', borderRadius: '4px' }}>
              Annuler
            </button>
            <button type="submit" disabled={loading} style={{ padding: '8px 16px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '4px' }}>
              {loading ? 'Enregistrement...' : 'Valider la note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}