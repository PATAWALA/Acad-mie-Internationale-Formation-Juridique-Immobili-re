'use client';

import { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { CreateTeacherModal } from './CreateTeacherModal';

export function UsersTable() {
  const { users, loading, validatePayment } = useAdmin();
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'PAID'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (loading) {
    return <div style={{ padding: '20px', color: '#94a3b8' }}>Chargement des utilisateurs...</div>;
  }

  const isStudent = (user: any) => user.role === 'STUDENT';

  const isPending = (status: string | null) => {
    if (!status) return false;
    const s = status.trim().toUpperCase();
    return s === 'PENDING_PAYMENT' || s === 'PENDING';
  };

  const isPaid = (status: string | null) => {
    if (!status) return false;
    const s = status.trim().toUpperCase();
    return s === 'PAID';
  };

  // Filtrage : on n'applique le filtre de paiement qu'aux étudiants
  const filteredUsers = users.filter((user) => {
    if (filter === 'ALL') return true;
    if (!isStudent(user)) return false;
    if (filter === 'PENDING') return isPending(user.status);
    if (filter === 'PAID') return isPaid(user.status);
    return true;
  });

  // Compteurs basés uniquement sur les étudiants
  const pendingCount = users.filter((u) => isStudent(u) && isPending(u.status)).length;
  const paidCount = users.filter((u) => isStudent(u) && isPaid(u.status)).length;

  return (
    <div style={{ background: '#0f172a', borderRadius: '12px', border: '1px solid #334155', padding: '24px', margin: '20px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ color: '#fff', margin: 0, fontSize: '18px' }}>
          👥 Liste des utilisateurs ({filteredUsers.length} / {users.length})
        </h2>

        <div style={{ display: 'flex', gap: '8px', background: '#1e293b', padding: '4px', borderRadius: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => setFilter('ALL')} style={filter === 'ALL' ? activeBtn : btn}>
            Tous ({users.length})
          </button>
          <button onClick={() => setFilter('PENDING')} style={filter === 'PENDING' ? activeBtn : btn}>
            ⏳ Étudiants en attente ({pendingCount})
          </button>
          <button onClick={() => setFilter('PAID')} style={filter === 'PAID' ? activeBtn : btn}>
            ✅ Étudiants payés ({paidCount})
          </button>
          <button onClick={() => setIsModalOpen(true)} style={{ padding: '6px 12px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ➕ Ajouter un Enseignant
          </button>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#e2e8f0', fontSize: '14px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
            <th style={{ padding: '12px' }}>Nom complet</th>
            <th style={{ padding: '12px' }}>Email / Téléphone</th>
            <th style={{ padding: '12px' }}>Rôle</th>
            <th style={{ padding: '12px' }}>Statut paiement</th>
            <th style={{ padding: '12px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                Aucun utilisateur trouvé.
              </td>
            </tr>
          ) : (
            filteredUsers.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{user.full_name || 'Non renseigné'}</td>
                <td style={{ padding: '12px', color: '#94a3b8' }}>
                  {user.email}<br />
                  <small style={{ color: '#64748b' }}>{user.phone || ''}</small>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold',
                    background: user.role === 'TEACHER' ? '#8b5cf6' : user.role === 'ADMIN' ? '#dc2626' : '#0284c7',
                    color: '#fff'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  {isStudent(user) ? (
                    isPaid(user.status) ? (
                      <span style={{ color: '#22c55e', fontWeight: 'bold' }}>✅ Payé</span>
                    ) : (
                      <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>⏳ En attente</span>
                    )
                  ) : (
                    <span style={{ color: '#64748b' }}>--</span>
                  )}
                </td>
                <td style={{ padding: '12px' }}>
                  {isStudent(user) && isPending(user.status) && (
                    <button
                      onClick={() => validatePayment(user.id)}
                      style={{
                        padding: '6px 12px', background: '#22c55e', color: '#fff', border: 'none',
                        borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px'
                      }}
                    >
                      Valider le paiement
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <CreateTeacherModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

const btn = {
  padding: '6px 12px',
  borderRadius: '6px',
  border: 'none',
  cursor: 'pointer',
  background: 'transparent',
  color: '#fff',
  fontSize: '12px',
} as React.CSSProperties;

const activeBtn = {
  ...btn,
  background: '#3b82f6',
} as React.CSSProperties;