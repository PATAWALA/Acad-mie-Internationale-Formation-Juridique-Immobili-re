'use client';

import { useEffect, useState } from 'react';
import { createClientComponent } from '@/lib/supabase/client';
import { useStudent } from '@/context/StudentContext';

export default function SupportView() {
  const { profile } = useStudent();
  const supabase = createClientComponent();
  const [questions, setQuestions] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchQuestions = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('student_questions')
      .select('*')
      .eq('student_id', profile.id)
      .order('created_at', { ascending: false });
    if (data) setQuestions(data);
  };

  useEffect(() => {
    fetchQuestions();
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from('student_questions').insert({
      student_id: profile?.id,
      question: newQuestion,
    });
    if (error) {
      setMessage('Erreur : ' + error.message);
    } else {
      setMessage('✅ Question envoyée.');
      setNewQuestion('');
      fetchQuestions();
    }
    setSubmitting(false);
  };

  return (
    <div>
      <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>❓ Support & Questions</h2>

      {/* Formulaire */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <h3 style={{ marginTop: 0 }}>Poser une nouvelle question</h3>
        {message && <p style={{ color: '#94a3b8', fontSize: '13px' }}>{message}</p>}
        <form onSubmit={handleSubmit}>
          <textarea
            rows={3}
            placeholder="Décrivez votre problème..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            style={{ width: '100%', padding: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px', resize: 'vertical' }}
            required
          />
          <button
            type="submit"
            disabled={submitting}
            style={{ marginTop: '8px', padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {submitting ? 'Envoi...' : 'Envoyer'}
          </button>
        </form>
      </div>

      {/* Historique */}
      <h3 style={{ marginBottom: '12px' }}>📋 Mes questions</h3>
      {questions.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>Aucune question posée.</p>
      ) : (
        questions.map((q) => (
          <div key={q.id} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                {new Date(q.created_at).toLocaleDateString('fr-FR')}
              </span>
              <span style={{ fontSize: '12px', color: q.status === 'ANSWERED' ? '#22c55e' : '#f59e0b' }}>
                {q.status === 'ANSWERED' ? '✅ Répondu' : '⏳ En attente'}
              </span>
            </div>
            <p style={{ whiteSpace: 'pre-wrap', marginBottom: '8px' }}>{q.question}</p>
            {q.answer && (
              <div style={{ background: '#1e293b', padding: '8px', borderRadius: '4px', fontSize: '13px', color: '#a7f3d0' }}>
                <strong>Réponse :</strong> {q.answer}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}