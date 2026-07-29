'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponent } from '@/lib/supabase/client';

interface UserManagementTableProps {
  users: any[];
}

export function UserManagementTable({ users }: UserManagementTableProps) {
  const supabase = createClientComponent();
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const togglePaymentStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PAID' ? 'PENDING_PAYMENT' : 'PAID';
    setLoadingId(userId);

    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', userId);

    setLoadingId(null);

    if (!error) {
      router.refresh();
    } else {
      alert('Erreur lors de la mise à jour : ' + error.message);
    }
  };

  const changeRole = async (userId: string, newRole: string) => {
    setLoadingId(userId);

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    setLoadingId(null);

    if (!error) {
      router.refresh();
    } else {
      alert('Erreur lors du changement de rôle : ' + error.message);
    }
  };

  if (!users || users.length === 0) {
    return <p style={{ color: '#94a3b8' }}>Aucun utilisateur enregistré pour le moment.</p>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
            <th style={{ padding: '12px' }}>Nom / Email</th>
            <th style={{ padding: '12px' }}>Rôle</th>
            <th style={{ padding: '12px' }}>Paiement</th>
            <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} style={{ borderBottom: '1px solid #1e293b' }}>
              <td style={{ padding: '12px' }}>
                <div style={{ fontWeight: 'bold', color: '#fff' }}>{u.full_name || 'Sans nom'}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>{u.email}</div>
              </td>
              <td style={{ padding: '12px' }}>
                <select
                  value={u.role || 'STUDENT'}
                  onChange={(e) => changeRole(u.id, e.target.value)}
                  disabled={loadingId === u.id}
                  style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '4px' }}
                >
                  <option value="STUDENT">Étudiant</option>
                  <option value="TEACHER">Enseignant</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </td>
              <td style={{ padding: '12px' }}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  background: u.status === 'PAID' ? '#065f46' : '#7c2d12',
                  color: u.status === 'PAID' ? '#a7f3d0' : '#fed7aa'
                }}>
                  {u.status === 'PAID' ? 'PAYÉ' : 'EN ATTENTE'}
                </span>
              </td>
              <td style={{ padding: '12px', textAlign: 'right' }}>
                <button
                  onClick={() => togglePaymentStatus(u.id, u.status)}
                  disabled={loadingId === u.id}
                  style={{
                    padding: '6px 12px',
                    background: u.status === 'PAID' ? '#991b1b' : '#16a34a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  {loadingId === u.id ? '...' : u.status === 'PAID' ? 'Marquer Impayé' : 'Valider Paiement ✅'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}