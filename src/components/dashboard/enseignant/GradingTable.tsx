'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GradeModal } from './GradeModal';
import SubmissionViewer from './SubmissionViewer'; // <-- ajouté

interface GradingTableProps {
  submissions: any[];
}

export function GradingTable({ submissions }: GradingTableProps) {
  const router = useRouter();
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  const handleSuccess = () => {
    setSelectedSubmission(null);
    router.refresh();
  };

  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #334155', background: '#1e293b' }}>
            <th style={{ padding: '12px' }}>Étudiant</th>
            <th style={{ padding: '12px' }}>Évaluation / TP</th>
            <th style={{ padding: '12px' }}>Rendu</th>
            <th style={{ padding: '12px' }}>Note</th>
            <th style={{ padding: '12px' }}>Statut</th>
            <th style={{ padding: '12px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {submissions.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>
                Aucun devoir soumis pour le moment.
              </td>
            </tr>
          ) : (
            submissions.map((sub) => (
              <tr key={sub.id} style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '12px' }}>
                  {sub.profiles?.full_name || sub.profiles?.email || 'N/A'}
                </td>
                <td style={{ padding: '12px' }}>
                  {sub.assessments?.title || 'Évaluation'}
                </td>
                <td style={{ padding: '12px' }}>
                  <SubmissionViewer submissionUrl={sub.submission_url} />
                </td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>
                  {sub.grade !== null ? `${sub.grade} / 20` : '-'}
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    background: sub.status === 'PASSED' ? '#15803d' : sub.status === 'FAILED' ? '#b91c1c' : '#b45309'
                  }}>
                    {sub.status}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <button
                    onClick={() => setSelectedSubmission(sub)}
                    style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    {sub.grade !== null ? 'Modifier' : 'Corriger'}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {selectedSubmission && (
        <GradeModal
          isOpen={!!selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          submission={selectedSubmission}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}