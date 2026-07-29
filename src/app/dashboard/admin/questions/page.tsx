'use client';

import { useState, useEffect } from 'react';
import { createClientComponent } from '@/lib/supabase/client';

export default function AdminQuestionsPage() {
  const supabase = createClientComponent();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ANSWERED'>('ALL');
  const [answerInput, setAnswerInput] = useState<{ [key: number]: string }>({});
  const [responding, setResponding] = useState<number | null>(null);

  const fetchQuestions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('student_questions')
      .select('*, student:student_id (full_name, email)')
      .order('created_at', { ascending: false });
    if (data) setQuestions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleRespond = async (questionId: number) => {
    const answer = answerInput[questionId]?.trim();
    if (!answer) return;
    setResponding(questionId);
    const { error } = await supabase
      .from('student_questions')
      .update({ answer, status: 'ANSWERED' })
      .eq('id', questionId);
    if (!error) {
      setAnswerInput((prev) => ({ ...prev, [questionId]: '' }));
      fetchQuestions();
    } else {
      alert('Erreur : ' + error.message);
    }
    setResponding(null);
  };

  const filtered = questions.filter((q) => {
    if (filter === 'PENDING') return q.status === 'PENDING';
    if (filter === 'ANSWERED') return q.status === 'ANSWERED';
    return true;
  });

  return (
    <div>
      <h1 style={{ fontSize: '22px', marginBottom: '20px' }}>❓ Support / Questions Étudiants</h1>

      <div style={{ marginBottom: '16px' }}>
        <button onClick={() => setFilter('ALL')} style={filter === 'ALL' ? activeBtn : btn}>Toutes</button>
        <button onClick={() => setFilter('PENDING')} style={filter === 'PENDING' ? activeBtn : btn}>En attente</button>
        <button onClick={() => setFilter('ANSWERED')} style={filter === 'ANSWERED' ? activeBtn : btn}>Répondues</button>
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Chargement...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>Aucune question.</p>
      ) : (
        filtered.map((q) => (
          <div key={q.id} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <strong>{q.student?.full_name || q.student?.email}</strong>
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
            {q.status !== 'ANSWERED' && (
              <div style={{ marginTop: '12px' }}>
                <textarea
                  rows={2}
                  placeholder="Votre réponse..."
                  value={answerInput[q.id] || ''}
                  onChange={(e) => setAnswerInput((prev) => ({ ...prev, [q.id]: e.target.value }))}
                  style={{ width: '100%', padding: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px', resize: 'vertical' }}
                />
                <button
                  onClick={() => handleRespond(q.id)}
                  disabled={responding === q.id}
                  style={{ marginTop: '8px', padding: '6px 12px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  {responding === q.id ? 'Envoi...' : 'Répondre'}
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

const btn: React.CSSProperties = {
  padding: '6px 12px',
  marginRight: '8px',
  background: '#1e293b',
  border: '1px solid #334155',
  color: '#fff',
  borderRadius: '4px',
  cursor: 'pointer',
};

const activeBtn: React.CSSProperties = {
  ...btn,
  background: '#3b82f6',
  borderColor: '#3b82f6',
};