'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import { UsersTable } from '@/components/dashboard/admin/UsersTable';
import { cn } from '@/lib/utils';
import { fadeIn, slideIn, stagger } from '@/lib/animations';
import {
  GraduationCap,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  Award,
  TrendingUp,
  TrendingDown,
  Filter,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const supabase = createClientComponent();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    paidStudents: 0,
    pendingStudents: 0,
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
      const { count: studentsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'STUDENT');

      const { count: teachersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'TEACHER');

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

      let revenueQuery = supabase
        .from('enrollments')
        .select('amount_paid')
        .eq('payment_status', 'PAID');

      if (filterCertId !== 'all') {
        revenueQuery = revenueQuery.eq('certificate_id', filterCertId);
      }

      const { data: paidEnrollments } = await revenueQuery;
      const totalRevenue = paidEnrollments?.reduce((sum, enr) => sum + (enr.amount_paid || 0), 0) || 0;

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

      const { data: allCerts } = await supabase.from('certificates').select('id, title');
      const details = [];
      if (allCerts) {
        for (const cert of allCerts) {
          const { data: paidForCert } = await supabase
            .from('enrollments')
            .select('student_id')
            .eq('certificate_id', cert.id)
            .eq('payment_status', 'PAID');
          const distinctPaidForCert = new Set(paidForCert?.map(p => p.student_id) ?? []).size;

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

  const kpiCards = [
    {
      label: 'Étudiants',
      value: stats.totalStudents,
      icon: GraduationCap,
      color: 'blue',
      loading: loadingStats,
    },
    {
      label: 'Enseignants',
      value: stats.totalTeachers,
      icon: Users,
      color: 'violet',
      loading: loadingStats,
    },
    {
      label: 'Revenu total',
      value: `${stats.revenue.toLocaleString()} FCFA`,
      icon: DollarSign,
      color: 'emerald',
      loading: loadingStats,
    },
    {
      label: 'En attente',
      value: stats.pendingStudents,
      icon: Clock,
      color: 'amber',
      loading: loadingStats,
      trend: 'down',
    },
    {
      label: 'Payés',
      value: stats.paidStudents,
      icon: CheckCircle,
      color: 'green',
      loading: loadingStats,
      trend: 'up',
    },
    ...(filterCertId !== 'all'
      ? [
          {
            label: 'Parcours validés',
            value: stats.completedStudents,
            icon: Award,
            color: 'purple' as const,
            loading: loadingStats,
          },
        ]
      : []),
  ];

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-8">
      {/* Header */}
      <motion.div variants={fadeIn} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Tableau de bord
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Vue d'ensemble de la plateforme
          </p>
        </div>

        {/* Filtre certificat */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 hover:border-slate-700 transition-colors">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={filterCertId}
            onChange={(e) => setFilterCertId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="bg-transparent text-white text-sm font-medium outline-none cursor-pointer pr-8"
          >
            <option value="all" className="bg-slate-900">Tous les certificats</option>
            {certList.map((cert) => (
              <option key={cert.id} value={cert.id} className="bg-slate-900">
                {cert.title}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* KPIs Grid */}
      <motion.div
        variants={stagger}
        className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
      >
        {kpiCards.map((kpi, index) => (
          <motion.div
            key={kpi.label}
            variants={fadeIn}
            className={cn(
              'relative overflow-hidden rounded-2xl border p-5 transition-all duration-300',
              'bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-lg hover:shadow-slate-900/50',
              'group cursor-default'
            )}
          >
            {/* Background gradient subtle */}
            <div
              className={cn(
                'absolute top-0 right-0 w-24 h-24 -translate-y-1/2 translate-x-1/2 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity',
                kpi.color === 'blue' && 'bg-blue-500',
                kpi.color === 'violet' && 'bg-violet-500',
                kpi.color === 'emerald' && 'bg-emerald-500',
                kpi.color === 'amber' && 'bg-amber-500',
                kpi.color === 'green' && 'bg-green-500',
                kpi.color === 'purple' && 'bg-purple-500'
              )}
            />

            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {kpi.label}
                </span>
                {kpi.trend && (
                  <span
                    className={cn(
                      'flex items-center gap-1 text-xs font-medium',
                      kpi.trend === 'up' ? 'text-green-400' : 'text-amber-400'
                    )}
                  >
                    {kpi.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                  </span>
                )}
              </div>

              {kpi.loading ? (
                <div className="space-y-2">
                  <div className="h-8 bg-slate-800 rounded-lg animate-pulse w-3/4" />
                </div>
              ) : (
                <div className="flex items-end gap-2">
                  <span
                    className={cn(
                      'text-2xl md:text-3xl font-bold tracking-tight',
                      kpi.color === 'blue' && 'text-blue-400',
                      kpi.color === 'violet' && 'text-violet-400',
                      kpi.color === 'emerald' && 'text-emerald-400',
                      kpi.color === 'amber' && 'text-amber-400',
                      kpi.color === 'green' && 'text-green-400',
                      kpi.color === 'purple' && 'text-purple-400'
                    )}
                  >
                    {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
                  </span>
                  <kpi.icon className="w-8 h-8 text-slate-700 group-hover:text-slate-600 transition-colors mb-0.5" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Tableau de progression par certificat */}
      {filterCertId === 'all' && (
        <motion.div
          variants={slideIn}
          className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-violet-400" />
              Progression par certificat
            </h2>
          </div>

          {loadingStats ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="flex-1 h-5 bg-slate-800 rounded-lg" />
                  <div className="w-20 h-5 bg-slate-800 rounded-lg" />
                  <div className="w-20 h-5 bg-slate-800 rounded-lg" />
                  <div className="w-24 h-5 bg-slate-800 rounded-lg" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                      Certificat
                    </th>
                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                      Étudiants payés
                    </th>
                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                      Parcours validés
                    </th>
                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                      Taux de réussite
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {certDetails.map((cert) => {
                    const successRate =
                      cert.paidCount > 0
                        ? Math.round((cert.completedCount / cert.paidCount) * 100)
                        : 0;
                    return (
                      <motion.tr
                        key={cert.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="text-white font-medium">{cert.title}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-300">{cert.paidCount}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-violet-400 font-medium">
                            {cert.completedCount}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden max-w-[120px]">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${successRate}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className={cn(
                                  'h-full rounded-full',
                                  successRate >= 80
                                    ? 'bg-emerald-500'
                                    : successRate >= 50
                                    ? 'bg-amber-500'
                                    : 'bg-red-500'
                                )}
                              />
                            </div>
                            <span
                              className={cn(
                                'text-sm font-medium min-w-[3rem]',
                                successRate >= 80
                                  ? 'text-emerald-400'
                                  : successRate >= 50
                                  ? 'text-amber-400'
                                  : 'text-red-400'
                              )}
                            >
                              {successRate}%
                            </span>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* Users Table Section */}
      <motion.div variants={fadeIn}>
        <UsersTable />
      </motion.div>
    </motion.div>
  );
}