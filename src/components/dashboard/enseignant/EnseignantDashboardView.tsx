'use client';

import { useEffect, useState } from 'react';
import { createClientComponent } from '@/lib/supabase/client';
import { GradingTable } from '@/components/dashboard/enseignant/GradingTable';

interface Props {
  certId: number | 'all';
  profile: any;
}

export default function EnseignantDashboardView({ certId, profile }: Props) {
  const supabase = createClientComponent();
  const [stats, setStats] = useState({ pending: 0, graded: 0, totalAssignments: 0 });
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignedCertificates, setAssignedCertificates] = useState<{ id: number; title: string }[]>([]);

  // Charger la liste des certificats assignés (pour affichage)
  useEffect(() => {
    if (!profile) return;
    const loadAssignments = async () => {
      const { data: teacherCerts } = await supabase
        .from('certificate_teachers')
        .select('certificate_id, certificates(title)')
        .eq('teacher_id', profile.id);
      if (teacherCerts) {
        setAssignedCertificates(
          teacherCerts.map((a: any) => ({
            id: a.certificate_id,
            title: a.certificates?.title || 'N/A',
          }))
        );
      }
    };
    loadAssignments();
  }, [profile]);

  // Charger les soumissions filtrées par certificat
  useEffect(() => {
    if (!profile) return;
    const load = async () => {
      setLoading(true);
      try {
        // 1. Récupérer les certificats assignés à l'enseignant
        const { data: teacherCerts } = await supabase
          .from('certificate_teachers')
          .select('certificate_id')
          .eq('teacher_id', profile.id);
        const allCertIds = teacherCerts?.map((t) => t.certificate_id) || [];
        if (allCertIds.length === 0) {
          setSubmissions([]);
          setStats({ pending: 0, graded: 0, totalAssignments: 0 });
          setLoading(false);
          return;
        }

        // 2. Déterminer les certificats à afficher (tous ou un seul)
        const targetCertIds = certId === 'all' ? allCertIds : allCertIds.filter((id) => id === certId);
        if (targetCertIds.length === 0) {
          setSubmissions([]);
          setStats({ pending: 0, graded: 0, totalAssignments: 0 });
          setLoading(false);
          return;
        }

        // 3. Récupérer les cours pour ces certificats
        const { data: courses } = await supabase
          .from('courses')
          .select('id')
          .in('certificate_id', targetCertIds);
        const courseIds = courses?.map((c) => c.id) || [];
        if (courseIds.length === 0) {
          setSubmissions([]);
          setStats({ pending: 0, graded: 0, totalAssignments: targetCertIds.length });
          setLoading(false);
          return;
        }

        // 4. Récupérer les assessments pour ces cours
        const { data: assessments } = await supabase
          .from('assessments')
          .select('id')
          .in('course_id', courseIds);
        const assessmentIds = assessments?.map((a) => a.id) || [];
        if (assessmentIds.length === 0) {
          setSubmissions([]);
          setStats({ pending: 0, graded: 0, totalAssignments: targetCertIds.length });
          setLoading(false);
          return;
        }

        // 5. Récupérer les soumissions
        const { data: subs } = await supabase
          .from('submissions')
          .select('id, submission_url, grade, feedback, status, created_at, student_id, assessment_id')
          .in('assessment_id', assessmentIds)
          .order('created_at', { ascending: false });

        if (!subs || subs.length === 0) {
          setSubmissions([]);
          setStats({ pending: 0, graded: 0, totalAssignments: targetCertIds.length });
          setLoading(false);
          return;
        }

        // 6. Récupérer les profils des étudiants séparément (évite les problèmes de jointure)
        const studentIds = [...new Set(subs.map((s: any) => s.student_id))];
        const { data: students } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', studentIds);
        const studentMap = new Map(students?.map((s: any) => [s.id, s]));

        // 7. Récupérer les titres des assessments séparément
        const assessmentIdsUnique = [...new Set(subs.map((s: any) => s.assessment_id))];
        const { data: assessmentsData } = await supabase
          .from('assessments')
          .select('id, title')
          .in('id', assessmentIdsUnique);
        const assessmentMap = new Map(assessmentsData?.map((a: any) => [a.id, a]));

        // 8. Fusionner manuellement les profils et les assessments dans les soumissions
        const enrichedSubs = subs.map((s: any) => ({
          ...s,
          profiles: studentMap.get(s.student_id) || null,
          assessments: assessmentMap.get(s.assessment_id) || null,
        }));

        setSubmissions(enrichedSubs);
        setStats({
          pending: enrichedSubs.filter((s: any) => s.status === 'PENDING').length,
          graded: enrichedSubs.filter((s: any) => s.status !== 'PENDING').length,
          totalAssignments: targetCertIds.length,
        });
      } catch (err) {
        console.error('Erreur chargement soumissions enseignant:', err);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [certId, profile]);

  return (
    <div>
      <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>
        👋 Bonjour, {profile?.full_name || 'Enseignant'}
      </h1>
      <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
        {certId === 'all'
          ? "Vue d'ensemble de toutes vos formations"
          : `Formation sélectionnée : ${
              assignedCertificates.find((c) => c.id === certId)?.title || ''
            }`}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={kpiCard}>
          <p style={kpiLabel}>📚 Formations assignées</p>
          <p style={kpiValue}>{stats.totalAssignments}</p>
        </div>
        <div style={kpiCard}>
          <p style={kpiLabel}>⏳ En attente</p>
          <p style={{ ...kpiValue, color: '#f59e0b' }}>{stats.pending}</p>
        </div>
        <div style={kpiCard}>
          <p style={kpiLabel}>✅ Corrigées</p>
          <p style={{ ...kpiValue, color: '#22c55e' }}>{stats.graded}</p>
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Chargement des soumissions...</p>
      ) : (
        <GradingTable submissions={submissions} />
      )}
    </div>
  );
}

const kpiCard: React.CSSProperties = {
  background: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: '12px',
  padding: '20px',
};

const kpiLabel: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '13px',
  marginBottom: '8px',
};

const kpiValue: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#fff',
};