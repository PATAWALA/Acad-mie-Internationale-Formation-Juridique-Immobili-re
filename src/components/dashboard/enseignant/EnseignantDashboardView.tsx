'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import { GradingTable } from '@/components/dashboard/enseignant/GradingTable';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  TrendingUp,
  Loader2,
  FileText,
  ChevronDown,
  GraduationCap,
  AlertCircle,
  ArrowRight,
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

        const { data: courses } = await supabase.from('courses').select('id').in('certificate_id', targetCertIds);
        const courseIds = courses?.map((c) => c.id) || [];
        if (courseIds.length === 0) {
          setSubmissions([]);
          setStats({ pending: 0, graded: 0, totalAssignments: targetCertIds.length });
          setLoading(false);
          return;
        }

        const { data: assessments } = await supabase.from('assessments').select('id, title').in('course_id', courseIds);
        const assessmentMap = new Map(assessments?.map((a: any) => [a.id, a]) || []);
        const assessmentIds = [...assessmentMap.keys()];
        if (assessmentIds.length === 0) {
          setSubmissions([]);
          setStats({ pending: 0, graded: 0, totalAssignments: targetCertIds.length });
          setLoading(false);
          return;
        }

        const { data: subs } = await supabase
          .from('submissions')
          .select('*')
          .in('assessment_id', assessmentIds)
          .order('created_at', { ascending: false });

        if (!subs || subs.length === 0) {
          setSubmissions([]);
          setStats({ pending: 0, graded: 0, totalAssignments: targetCertIds.length });
          setLoading(false);
          return;
        }

        // Récupérer les profils étudiants
        const studentIds = [...new Set(subs.map((s: any) => s.student_id).filter(Boolean))];
        const { data: students } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', studentIds);
        const studentMap = new Map(students?.map((s: any) => [s.id, s]) || []);

        // Enrichir les soumissions
        const enrichedSubs = subs.map((s: any) => ({
          ...s,
          profiles: studentMap.get(s.student_id) || { full_name: 'Étudiant inconnu', email: '' },
          assessments: assessmentMap.get(s.assessment_id) || { title: 'Évaluation' },
        }));

        setSubmissions(enrichedSubs);
        setStats({
          pending: enrichedSubs.filter((s: any) => s.status === 'PENDING').length,
          graded: enrichedSubs.filter((s: any) => s.status !== 'PENDING').length,
          totalAssignments: targetCertIds.length,
        });
      } catch (err) {
        console.error(err);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [certId, profile]);

  const currentCert = certId === 'all' ? null : assignedCertificates.find((c) => c.id === certId);

  const kpiCards = [
    { label: 'Mes formations', value: stats.totalAssignments, icon: BookOpen, color: 'blue', pulse: false },
    { label: 'À corriger', value: stats.pending, icon: AlertCircle, color: 'amber', pulse: stats.pending > 0 },
    { label: 'Corrigées', value: stats.graded, icon: CheckCircle2, color: 'green', pulse: false },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">
            👋 Bonjour, {profile?.full_name?.split(' ')[0] || 'Enseignant'}
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {certId === 'all' ? "Vue d'ensemble de toutes vos formations" : 'Tableau de bord'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button onClick={() => setShowCertSelector(!showCertSelector)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0f172a] border border-[#1e293b] rounded-xl text-sm text-slate-300 hover:border-slate-600 transition-colors">
              <GraduationCap className="w-4 h-4 text-slate-400" />
              <span className="max-w-[140px] truncate">{currentCert ? currentCert.title : 'Toutes mes formations'}</span>
              <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", showCertSelector && "rotate-180")} />
            </button>

            <AnimatePresence>
              {showCertSelector && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowCertSelector(false)} />
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-72 max-h-80 overflow-y-auto bg-[#0f172a] border border-[#1e293b] rounded-xl shadow-xl z-50">
                    <div className="p-2">
                      <button onClick={() => { onShowAll(); setShowCertSelector(false); }}
                        className={cn("w-full text-left px-3 py-2 rounded-lg text-sm transition-colors", certId === 'all' ? "bg-blue-500/10 text-blue-400" : "text-slate-300 hover:bg-[#1e293b]")}>
                        📊 Toutes mes formations
                      </button>
                      <div className="my-1 border-t border-[#1e293b]" />
                      {assignedCertificates.map((cert) => (
                        <button key={cert.id} onClick={() => { onSelectCert(cert.id); setShowCertSelector(false); }}
                          className={cn("w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2", certId === cert.id ? "bg-blue-500/10 text-blue-400" : "text-slate-300 hover:bg-[#1e293b]")}>
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

          {currentCert && (
            <button onClick={() => onManageContent(certId as number)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-blue-500/20">
              <FileText className="w-4 h-4" /> Gérer les cours
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {kpiCards.map((kpi) => {
          const colors: Record<string, any> = {
            blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
            amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
            green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
          };
          const c = colors[kpi.color];
          return (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={cn("rounded-2xl border p-4 md:p-5 bg-[#0f172a]", c.border)}>
              <div className="flex items-center justify-between mb-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", c.bg)}>
                  <kpi.icon className={cn("w-5 h-5", c.text)} />
                </div>
                {kpi.pulse && (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400" />
                  </span>
                )}
              </div>
              <p className={cn("text-2xl md:text-3xl font-bold", c.text)}>
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : kpi.value}
              </p>
              <p className="text-slate-500 text-xs md:text-sm mt-1">{kpi.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Tableau */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <GradingTable submissions={submissions} loading={loading} />
      </motion.div>
    </div>
  );
}