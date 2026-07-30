'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import { GradingTable } from '@/components/dashboard/enseignant/GradingTable';
import { fadeIn, stagger, scaleIn } from '@/lib/animations';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  TrendingUp,
  Loader2,
  FileText,
  ChevronDown,
} from 'lucide-react';

interface Props {
  certId: number | 'all';
  profile: any;
  onManageContent: (certId: number) => void;
  assignedCertificates: { id: number; title: string }[];
  onSelectCert: (certId: number) => void;
  onShowAll: () => void;
}

export default function EnseignantDashboardView({
  certId,
  profile,
  onManageContent,
  assignedCertificates,
  onSelectCert,
  onShowAll,
}: Props) {
  const supabase = createClientComponent();
  const [stats, setStats] = useState({ pending: 0, graded: 0, totalAssignments: 0 });
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCertSelector, setShowCertSelector] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const load = async () => {
      setLoading(true);
      try {
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

        const targetCertIds = certId === 'all' ? allCertIds : allCertIds.filter((id) => id === certId);
        if (targetCertIds.length === 0) {
          setSubmissions([]);
          setStats({ pending: 0, graded: 0, totalAssignments: 0 });
          setLoading(false);
          return;
        }

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

        const studentIds = [...new Set(subs.map((s: any) => s.student_id))];
        const { data: students } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', studentIds);
        const studentMap = new Map(students?.map((s: any) => [s.id, s]));

        const assessmentIdsUnique = [...new Set(subs.map((s: any) => s.assessment_id))];
        const { data: assessmentsData } = await supabase
          .from('assessments')
          .select('id, title')
          .in('id', assessmentIdsUnique);
        const assessmentMap = new Map(assessmentsData?.map((a: any) => [a.id, a]));

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

  const currentCert = certId === 'all' ? null : assignedCertificates.find((c) => c.id === certId);

  const kpiCards = [
    {
      label: 'Formations assignées',
      value: stats.totalAssignments,
      icon: BookOpen,
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500/20',
    },
    {
      label: 'En attente',
      value: stats.pending,
      icon: Clock,
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/20',
      pulse: stats.pending > 0,
    },
    {
      label: 'Corrigées',
      value: stats.graded,
      icon: CheckCircle2,
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-400',
      borderColor: 'border-green-500/20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div {...fadeIn} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              👋 Bonjour, {profile?.full_name?.split(' ')[0] || 'Enseignant'}
            </h1>
            <p className="text-slate-400 flex items-center gap-2 mt-1">
              <TrendingUp className="w-4 h-4" />
              {certId === 'all'
                ? "Vue d'ensemble de toutes vos formations"
                : 'Tableau de bord de la formation'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Sélecteur de formation */}
            <div className="relative">
              <button
                onClick={() => setShowCertSelector(!showCertSelector)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  "bg-slate-800 border border-slate-700 text-slate-300",
                  "hover:border-slate-600 hover:text-white"
                )}
              >
                <BookOpen className="w-4 h-4 text-slate-400" />
                <span className="max-w-[160px] truncate">
                  {currentCert ? currentCert.title : 'Toutes les formations'}
                </span>
                <ChevronDown className={cn(
                  "w-4 h-4 text-slate-400 transition-transform",
                  showCertSelector && "rotate-180"
                )} />
              </button>

              <AnimatePresence>
                {showCertSelector && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowCertSelector(false)}
                      className="fixed inset-0 z-40"
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-72 max-h-80 overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50"
                    >
                      <div className="p-2">
                        <button
                          onClick={() => {
                            onShowAll();
                            setShowCertSelector(false);
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                            certId === 'all'
                              ? "bg-violet-500/10 text-violet-400"
                              : "text-slate-300 hover:bg-slate-700"
                          )}
                        >
                          📊 Toutes les formations
                        </button>
                        <div className="my-1 border-t border-slate-700" />
                        {assignedCertificates.map((cert) => (
                          <button
                            key={cert.id}
                            onClick={() => {
                              onSelectCert(cert.id);
                              setShowCertSelector(false);
                            }}
                            className={cn(
                              "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2",
                              certId === cert.id
                                ? "bg-violet-500/10 text-violet-400"
                                : "text-slate-300 hover:bg-slate-700"
                            )}
                          >
                            <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{cert.title}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Bouton Gérer les cours */}
            {currentCert && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onManageContent(certId as number)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                  bg-blue-500/10 text-blue-400 border border-blue-500/20
                  hover:bg-blue-500/20 transition-all duration-200"
              >
                <FileText className="w-4 h-4" />
                Gérer les cours
              </motion.button>
            )}
          </div>
        </div>
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