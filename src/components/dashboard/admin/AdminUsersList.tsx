'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponent } from '@/lib/supabase/client';

interface Props {
  users: any[];
}

export function AdminUsersList({ users }: Props) {
  const supabase = createClientComponent();
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'STUDENT' | 'TEACHER'>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Supprimer définitivement cet utilisateur ?')) return;
    setDeletingId(userId);
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (!error) {
      router.refresh();
    } else {
      alert('Erreur : ' + error.message);
    }
    setDeletingId(null);
  };

  // Calcul des KPIs
  const students = users.filter(u => u.role === 'STUDENT');
  const teachers = users.filter(u => u.role === 'TEACHER');
  const paidStudents = students.filter(s => s.status === 'PAID');
  const pendingStudents = students.filter(s => s.status === 'PENDING_PAYMENT' || s.status === 'PENDING');

  // Filtrage
  let filteredUsers = users;
  if (roleFilter !== 'ALL') {
    filteredUsers = filteredUsers.filter(u => u.role === roleFilter);
  }
  // Appliquer le filtre de paiement seulement si on regarde les étudiants
  if (roleFilter === 'STUDENT' || roleFilter === 'ALL') {
    if (paymentFilter === 'PAID') {
      filteredUsers = filteredUsers.filter(u => u.role === 'STUDENT' && u.status === 'PAID');
    } else if (paymentFilter === 'PENDING') {
      filteredUsers = filteredUsers.filter(u => u.role === 'STUDENT' && (u.status === 'PENDING_PAYMENT' || u.status === 'PENDING'));
    }
  }

  return (
    <div>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <div style={kpiCardStyle}>
          <p style={kpiLabelStyle}>👨‍🎓 Étudiants</p>
          <p style={kpiValueStyle}>{students.length}</p>
        </div>
        <div style={kpiCardStyle}>
          <p style={kpiLabelStyle}>👨‍🏫 Enseignants</p>
          <p style={kpiValueStyle}>{teachers.length}</p>
        </div>
        <div style={kpiCardStyle}>
          <p style={kpiLabelStyle}>✅ Payés</p>
          <p style={{ ...kpiValueStyle, color: '#22c55e' }}>{paidStudents.length}</p>
        </div>
        <div style={kpiCardStyle}>
          <p style={kpiLabelStyle}>⏳ En attente</p>
          <p style={{ ...kpiValueStyle, color: '#f59e0b' }}>{pendingStudents.length}</p>
        </div>
      </div>

      {/* Barre de filtres */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button onClick={() => setRoleFilter('ALL')} style={roleFilter === 'ALL' ? activeFilterBtn : filterBtn}>
          Tous
        </button>
        <button onClick={() => setRoleFilter('STUDENT')} style={roleFilter === 'STUDENT' ? activeFilterBtn : filterBtn}>
          Étudiants
        </button>
        <button onClick={() => setRoleFilter('TEACHER')} style={roleFilter === 'TEACHER' ? activeFilterBtn : filterBtn}>
          Enseignants
        </button>
        <div style={{ width: '1px', background: '#334155', margin: '0 4px' }} />
        <button onClick={() => setPaymentFilter('ALL')} style={paymentFilter === 'ALL' ? activeFilterBtn : filterBtn}>
          Tous statuts
        </button>
        <button onClick={() => setPaymentFilter('PAID')} style={paymentFilter === 'PAID' ? activeFilterBtn : filterBtn}>
          Payés
        </button>
        <button onClick={() => setPaymentFilter('PENDING')} style={paymentFilter === 'PENDING' ? activeFilterBtn : filterBtn}>
          En attente
        </button>
      </div>

      {/* Tableau */}
      {filteredUsers.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>Aucun utilisateur trouvé.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Nom complet</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Téléphone</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Rôle</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Statut</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{u.full_name || 'Non renseigné'}</td>
                  <td style={{ padding: '12px', color: '#94a3b8' }}>{u.email}</td>
                  <td style={{ padding: '12px', color: '#94a3b8' }}>{u.phone || '-'}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '4px', fontSize: '11px',
                      background: u.role === 'TEACHER' ? '#8b5cf6' : u.role === 'ADMIN' ? '#dc2626' : '#0284c7',
                      color: '#fff'
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {u.role === 'STUDENT' ? (
                      u.status === 'PAID' ? (
                        <span style={{ color: '#22c55e' }}>✅ Payé</span>
                      ) : (
                        <span style={{ color: '#f59e0b' }}>⏳ En attente</span>
                      )
                    ) : (
                      <span style={{ color: '#94a3b8' }}>--</span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDelete(u.id)}
                      disabled={deletingId === u.id}
                      style={{
                        padding: '6px 12px',
                        background: '#b91c1c',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        opacity: deletingId === u.id ? 0.5 : 1
                      }}
                    >
                      {deletingId === u.id ? '...' : 'Supprimer'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const kpiCardStyle: React.CSSProperties = {
  background: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: '8px',
  padding: '16px',
  textAlign: 'center'
};

const kpiLabelStyle: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '12px',
  marginBottom: '4px'
};

const kpiValueStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#fff',
  margin: 0
};

const filterBtn: React.CSSProperties = {
  padding: '6px 12px',
  borderRadius: '6px',
  border: '1px solid #334155',
  background: '#1e293b',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '13px'
};

const activeFilterBtn: React.CSSProperties = {
  ...filterBtn,
  background: '#3b82f6',
  borderColor: '#3b82f6'
};