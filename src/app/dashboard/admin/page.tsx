'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponent } from '@/lib/supabase/client';
import { UsersTable } from '@/components/dashboard/admin/UsersTable';

export default function AdminDashboardPage() {
  const supabase = createClientComponent();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    paidStudents: 0,        // étudiants avec status = 'PAID'
    pendingStudents: 0,     // étudiants avec status = 'PENDING_PAYMENT' ou 'PENDING'
    revenue: 0,
    completedStudents: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [filterCertId, setFilterCertId] = useState<number | 'all'>('all');
  const [certList, setCertList] = useState<any[]>([]);
  const [certDetails, setCertDetails] = useState<any[]>([]);

  // Vérification du rôle admin
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
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

  // Chargement des certificats pour le filtre
  useEffect(() => {
    supabase.from('certificates').select('id, title').order('title').then(({ data }) => {
      if (data) setCertList(data);
    });
  }, []);

  const fetchStats = useCallback(async () => {
    if (!authorized) return;
    setLoadingStats(true);
    try {
      // 1. Nombre total d'étudiants et d'enseignants
      const { count: studentsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'STUDENT');

      const { count: teachersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'TEACHER');

      // 2. Étudiants payés / en attente (basé sur profiles.status)
      const { count: paidCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'STUDENT')
        .eq('status', 'PAID');

      const { count: pendingCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'STUDENT')
        .or('status.eq.PENDING_PAYMENT,status.eq.PENDING');

      // 3. Revenu total (somme des enrollments payés)
      let revenueQuery = supabase
        .from('enrollments')
        .select('amount_paid')
        .eq('payment_status', 'PAID');

      if (filterCertId !== 'all') {
        revenueQuery = revenueQuery.eq('certificate_id', filterCertId);
      }

      const { data: paidEnrollments } = await revenueQuery;
      const totalRevenue = paidEnrollments?.reduce((sum, enr) => sum + (enr.amount_paid || 0), 0) || 0;

      // 4. Parcours validés (seulement si un certificat est sélectionné)
      let completedCount = 0;
      if (filterCertId !== 'all') {
        const { data: courses } = await supabase
          .from('courses')
          .select('id')
          .eq('certificate_id', filterCertId);
        const courseIds = courses?.map(c => c.id) ?? [];
        if (courseIds.length > 0) {
          const { data: assessments } = await supabase
            .from('assessments')
            .select('id')
            .in('course_id', courseIds);
          const assessmentIds = assessments?.map(a => a.id) ?? [];
          if (assessmentIds.length > 0) {
            const { data: submissions } = await supabase
              .from('submissions')
              .select('student_id, status')
              .in('assessment_id', assessmentIds);
            const studentMap = new Map<string, { passed: number; total: number }>();
            for (const sub of submissions ?? []) {
              if (!studentMap.has(sub.student_id)) {
                studentMap.set(sub.student_id, { passed: 0, total: 0 });
              }
              const rec = studentMap.get(sub.student_id)!;
              rec.total++;
              if (sub.status === 'PASSED') rec.passed++;
            }
            for (const rec of studentMap.values()) {
              if (rec.passed === assessmentIds.length && rec.total === assessmentIds.length) {
                completedCount++;
              }
            }
          }
        }
      }

      setStats({
        totalStudents: studentsCount || 0,
        totalTeachers: teachersCount || 0,
        paidStudents: paidCount || 0,
        pendingStudents: pendingCount || 0,
        revenue: totalRevenue,
        completedStudents: completedCount,
      });

      // 5. Progression par certificat (utilise les enrollments, mais c'est cohérent car on veut savoir qui a payé pour quel certificat)
      const { data: allCerts } = await supabase.from('certificates').select('id, title');
      const details = [];
      if (allCerts) {
        for (const cert of allCerts) {
          // Étudiants distincts ayant payé pour ce certificat
          const { data: paidForCert } = await supabase
            .from('enrollments')
            .select('student_id')
            .eq('certificate_id', cert.id)
            .eq('payment_status', 'PAID');
          const distinctPaidForCert = new Set(paidForCert?.map(p => p.student_id) ?? []).size;

          // Parcours validés pour ce certificat
          let completedForCert = 0;
          const { data: certCourses } = await supabase
            .from('courses')
            .select('id')
            .eq('certificate_id', cert.id);
          const certCourseIds = certCourses?.map(c => c.id) ?? [];
          if (certCourseIds.length > 0) {
            const { data: certAssessments } = await supabase
              .from('assessments')
              .select('id')
              .in('course_id', certCourseIds);
            const certAssessmentIds = certAssessments?.map(a => a.id) ?? [];
            if (certAssessmentIds.length > 0) {
              const { data: certSubs } = await supabase
                .from('submissions')
                .select('student_id, status')
                .in('assessment_id', certAssessmentIds);
              const map = new Map<string, { passed: number; total: number }>();
              for (const sub of certSubs ?? []) {
                if (!map.has(sub.student_id)) map.set(sub.student_id, { passed: 0, total: 0 });
                const rec = map.get(sub.student_id)!;
                rec.total++;
                if (sub.status === 'PASSED') rec.passed++;
              }
              for (const rec of map.values()) {
                if (rec.passed === certAssessmentIds.length && rec.total === certAssessmentIds.length) {
                  completedForCert++;
                }
              }
            }
          }
          details.push({
            id: cert.id,
            title: cert.title,
            paidCount: distinctPaidForCert,
            completedCount: completedForCert,
          });
        }
      }
      setCertDetails(details);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  }, [authorized, filterCertId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (!authorized) return null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>📊 Tableau de bord</h1>
        <div>
          <label style={{ color: '#94a3b8', marginRight: '8px', fontSize: '14px' }}>Filtrer par certificat :</label>
          <select
            value={filterCertId}
            onChange={(e) => setFilterCertId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            style={{ padding: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px' }}
          >
            <option value="all">Tous les certificats</option>
            {certList.map((cert) => (
              <option key={cert.id} value={cert.id}>{cert.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={kpiCardStyle}>
          <p style={kpiLabelStyle}>👨‍🎓 Étudiants</p>
          <p style={kpiValueStyle}>{loadingStats ? '...' : stats.totalStudents}</p>
        </div>
        <div style={kpiCardStyle}>
          <p style={kpiLabelStyle}>👨‍🏫 Enseignants</p>
          <p style={kpiValueStyle}>{loadingStats ? '...' : stats.totalTeachers}</p>
        </div>
        <div style={kpiCardStyle}>
          <p style={kpiLabelStyle}>💰 Revenu total</p>
          <p style={kpiValueStyle}>{loadingStats ? '...' : stats.revenue.toLocaleString()} FCFA</p>
        </div>
        <div style={kpiCardStyle}>
          <p style={kpiLabelStyle}>⏳ Étudiants en attente</p>
          <p style={{ ...kpiValueStyle, color: '#f59e0b' }}>{loadingStats ? '...' : stats.pendingStudents}</p>
        </div>
        <div style={kpiCardStyle}>
          <p style={kpiLabelStyle}>✅ Étudiants payés</p>
          <p style={{ ...kpiValueStyle, color: '#22c55e' }}>{loadingStats ? '...' : stats.paidStudents}</p>
        </div>
        {filterCertId !== 'all' && (
          <div style={kpiCardStyle}>
            <p style={kpiLabelStyle}>🎓 Parcours validés</p>
            <p style={{ ...kpiValueStyle, color: '#a78bfa' }}>{loadingStats ? '...' : stats.completedStudents}</p>
          </div>
        )}
      </div>

      {/* Tableau de progression par certificat */}
      {filterCertId === 'all' && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>📋 Progression par certificat</h2>
          {loadingStats ? (
            <p style={{ color: '#94a3b8' }}>Chargement...</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Certificat</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Étudiants payés</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Parcours validés</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Taux de réussite</th>
                </tr>
              </thead>
              <tbody>
                {certDetails.map((cert) => (
                  <tr key={cert.id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '12px' }}>{cert.title}</td>
                    <td style={{ padding: '12px' }}>{cert.paidCount}</td>
                    <td style={{ padding: '12px', color: '#a78bfa' }}>{cert.completedCount}</td>
                    <td style={{ padding: '12px' }}>
                      {cert.paidCount > 0 ? Math.round((cert.completedCount / cert.paidCount) * 100) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <UsersTable />
    </div>
  );
}

const kpiCardStyle: React.CSSProperties = {
  background: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: '12px',
  padding: '20px',
};

const kpiLabelStyle: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '13px',
  marginBottom: '8px',
};

const kpiValueStyle: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#fff',
};