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

  // Helper pour normaliser les statuts (ex: "pending_payment", "PENDING_PAYMENT ", etc.)
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

  // 🔍 LOGIQUE DE FILTRAGE SÉCURISÉE
  const filteredUsers = users.filter((user) => {
    if (filter === 'PENDING') return isPending(user.status);
    if (filter === 'PAID') return isPaid(user.status);
    return true; // 'ALL'
  });

  const pendingCount = users.filter((u) => isPending(u.status)).length;
  const paidCount = users.filter((u) => isPaid(u.status)).length;

  return (
    <div style={{ background: '#0f172a', borderRadius: '12px', border: '1px solid #334155', padding: '24px', margin: '20px 0' }}>
      
      {/* HEADER & BARRE DE FILTRES */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ color: '#fff', margin: 0, fontSize: '18px' }}>
          👥 Liste des Inscrits ({filteredUsers.length} / {users.length})
        </h2>

        {/* BOUTONS DE FILTRAGE & ACTION */}
        <div style={{ display: 'flex', gap: '8px', background: '#1e293b', padding: '4px', borderRadius: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilter('ALL')}
            style={{
              padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              background: filter === 'ALL' ? '#3b82f6' : 'transparent', color: '#fff', fontSize: '12px'
            }}
          >
            Tous ({users.length})
          </button>

          <button
            onClick={() => setFilter('PENDING')}
            style={{
              padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              background: filter === 'PENDING' ? '#f59e0b' : 'transparent', color: '#fff', fontSize: '12px'
            }}
          >
            ⏳ En attente ({pendingCount})
          </button>

          <button
            onClick={() => setFilter('PAID')}
            style={{
              padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              background: filter === 'PAID' ? '#22c55e' : 'transparent', color: '#fff', fontSize: '12px'
            }}
          >
            ✅ Payés ({paidCount})
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              padding: '6px 12px', background: '#8b5cf6', color: '#fff', border: 'none',
              borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            ➕ Ajouter un Enseignant
          </button>
        </div>
      </div>

      {/* TABLEAU */}
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#e2e8f0', fontSize: '14px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
            <th style={{ padding: '12px' }}>Nom complet</th>
            <th style={{ padding: '12px' }}>Email / Téléphone</th>
            <th style={{ padding: '12px' }}>Rôle</th>
            <th style={{ padding: '12px' }}>Statut réel (Brut)</th>
            <th style={{ padding: '12px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                Aucun utilisateur ne correspond à ce filtre.
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
                    background: user.role === 'TEACHER' ? '#8b5cf6' : '#0284c7', color: '#fff'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  {isPaid(user.status) ? (
                    <span style={{ color: '#22c55e', fontWeight: 'bold' }}>✅ Payé</span>
                  ) : (
                    <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>⏳ En attente ({user.status})</span>
                  )}
                </td>
                <td style={{ padding: '12px' }}>
                  {isPending(user.status) && (
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

      {/* MODALE DE CRÉATION D'ENSEIGNANT */}
      <CreateTeacherModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}