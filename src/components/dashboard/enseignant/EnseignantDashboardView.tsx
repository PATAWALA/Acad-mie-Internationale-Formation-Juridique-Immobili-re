'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import { GradingTable } from '@/components/dashboard/enseignant/GradingTable';
import { fadeIn, stagger, scaleIn } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { 
  BookOpen, 
  Clock, 
  CheckCircle2,
  TrendingUp,
  Loader2 
} from 'lucide-react';

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

  const currentCertTitle = certId === 'all' 
    ? null 
    : assignedCertificates.find((c) => c.id === certId)?.title;

  const kpiCards = [
    {
      label: 'Formations assignées',
      value: stats.totalAssignments,
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500/20',
    },
    {
      label: 'En attente',
      value: stats.pending,
      icon: Clock,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/20',
      pulse: stats.pending > 0,
    },
    {
      label: 'Corrigées',
      value: stats.graded,
      icon: CheckCircle2,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-400',
      borderColor: 'border-green-500/20',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div {...fadeIn} className="space-y-2">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">
          👋 Bonjour, {profile?.full_name?.split(' ')[0] || 'Enseignant'}
        </h1>
        <p className="text-slate-400 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          {certId === 'all' ? (
            "Vue d'ensemble de toutes vos formations"
          ) : (
            <span>
              Formation : <span className="text-violet-400 font-medium">{currentCertTitle}</span>
            </span>
          )}
        </p>
      </motion.div>

      {/* KPIs */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {kpiCards.map((kpi) => (
          <motion.div
            key={kpi.label}
            variants={scaleIn}
            whileHover={{ y: -2, scale: 1.02 }}
            className={cn(
              "relative overflow-hidden rounded-xl border p-5",
              "bg-slate-900/50 backdrop-blur-sm",
              kpi.borderColor,
              "transition-shadow duration-300 hover:shadow-lg"
            )}
          >
            {/* Fond dégradé subtil */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
              <kpi.icon className="w-full h-full text-white" />
            </div>

            <div className="relative flex items-start justify-between">
              <div className="space-y-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", kpi.bgColor)}>
                  <kpi.icon className={cn("w-5 h-5", kpi.textColor)} />
                </div>
                <div>
                  <p className="text-slate-400 text-sm font-medium">{kpi.label}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <motion.span
                      key={kpi.value}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={cn("text-3xl font-bold", kpi.textColor)}
                    >
                      {loading ? (
                        <Loader2 className="w-8 h-8 animate-spin" />
                      ) : (
                        kpi.value
                      )}
                    </motion.span>
                    {kpi.pulse && (
                      <motion.span
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-2 h-2 bg-amber-400 rounded-full"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Tableau des soumissions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <GradingTable submissions={submissions} loading={loading} />
      </motion.div>
    </div>
  );
}