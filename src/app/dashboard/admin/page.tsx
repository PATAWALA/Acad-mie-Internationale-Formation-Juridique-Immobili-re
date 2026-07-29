'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponent } from '@/lib/supabase/client';
import { UsersTable } from '@/components/dashboard/admin/UsersTable';

export default function AdminDashboardPage() {
  const supabase = createClientComponent();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    paidEnrollments: 0,
    revenue: 0,
    pendingPayments: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  // Vérification du rôle admin
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'SUPER_ADMIN')) {
        router.push('/dashboard/etudiant');
        return;
      }
      setAuthorized(true);
    };
    checkAuth();
  }, []);

  // Chargement des statistiques
  useEffect(() => {
    if (!authorized) return;
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        // Étudiants
        const { count: studentsCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'STUDENT');

        // Enseignants
        const { count: teachersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'TEACHER');

        // Enrollments payés et revenu
        const { data: paidEnrollments } = await supabase
          .from('enrollments')
          .select('amount_paid')
          .eq('payment_status', 'PAID');

        const paidCount = paidEnrollments?.length || 0;
        const totalRevenue = paidEnrollments?.reduce((sum, enr) => sum + (enr.amount_paid || 0), 0) || 0;

        // Paiements en attente
        const { count: pendingCount } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('payment_status', 'PENDING');

        setStats({
          totalStudents: studentsCount || 0,
          totalTeachers: teachersCount || 0,
          paidEnrollments: paidCount,
          revenue: totalRevenue,
          pendingPayments: pendingCount || 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [authorized]);

  if (!authorized) return null;

  return (
    <div>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>📊 Vue d'ensemble</h1>

      {/* KPIs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={kpiCardStyle}>
          <p style={kpiLabelStyle}>👨‍🎓 Étudiants</p>
          <p style={kpiValueStyle}>{loadingStats ? '...' : stats.totalStudents}</p>
        </div>
        <div style={kpiCardStyle}>
          <p style={kpiLabelStyle}>👨‍🏫 Enseignants</p>
          <p style={kpiValueStyle}>{loadingStats ? '...' : stats.totalTeachers}</p>
        </div>
        <div style={kpiCardStyle}>
          <p style={kpiLabelStyle}>💰 Revenu total (payé)</p>
          <p style={kpiValueStyle}>{loadingStats ? '...' : stats.revenue.toLocaleString()} FCFA</p>
        </div>
        <div style={kpiCardStyle}>
          <p style={kpiLabelStyle}>⏳ Paiements en attente</p>
          <p style={{ ...kpiValueStyle, color: '#f59e0b' }}>{loadingStats ? '...' : stats.pendingPayments}</p>
        </div>
        <div style={kpiCardStyle}>
          <p style={kpiLabelStyle}>📊 Inscriptions payées</p>
          <p style={{ ...kpiValueStyle, color: '#22c55e' }}>{loadingStats ? '...' : stats.paidEnrollments}</p>
        </div>
      </div>

      {/* Tableau des utilisateurs (filtres + ajout enseignant) */}
      <UsersTable />
    </div>
  );
}

const kpiCardStyle: React.CSSProperties = {
  background: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: '12px',
  padding: '20px'
};

const kpiLabelStyle: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '13px',
  marginBottom: '8px'
};

const kpiValueStyle: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#fff'
};