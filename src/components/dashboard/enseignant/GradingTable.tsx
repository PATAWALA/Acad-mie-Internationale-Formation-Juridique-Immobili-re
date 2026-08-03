'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GradeModal } from './GradeModal';
import SubmissionViewer from './SubmissionViewer';
import { cn } from '@/lib/utils';
import { fadeIn, stagger } from '@/lib/animations';
import { notifyTPCorrige, notifyEligibleCertificat } from '@/lib/notifications';
import { createClientComponent } from '@/lib/supabase/client';
import {
  User,
  FileText,
  ExternalLink,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  Edit3,
  FileSearch,
  Loader2,
} from 'lucide-react';

interface GradingTableProps {
  submissions: any[];
  loading?: boolean;
}

export function GradingTable({ submissions, loading }: GradingTableProps) {
  const router = useRouter();
  const supabase = createClientComponent();
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  const handleSuccess = async (submission: any, grade: number, status: string) => {
  setSelectedSubmission(null);

  // 🔔 Notifier l'étudiant
  if (submission.student_id) {
    const courseTitle = submission.assessments?.title || 'TP';
    await notifyTPCorrige(submission.student_id, courseTitle, grade);
  }

  // 🔔 Vérifier si tout est validé → notifier admin
  if (status === 'PASSED' && submission.student_id && submission.assessment_id) {
    const { data: allSubmissions } = await supabase
      .from('submissions')
      .select('status')
      .eq('student_id', submission.student_id);

    const allPassed = allSubmissions?.every(s => s.status === 'PASSED');
    
    if (allPassed && allSubmissions && allSubmissions.length > 0) {
      const studentName = submission.profiles?.full_name || 'Un étudiant';
      
      // Récupérer le certificat
      const { data: assessment } = await supabase
        .from('assessments')
        .select('course_id')
        .eq('id', submission.assessment_id)
        .single();
      
      let certificateTitle = 'Formation';
      
      if (assessment?.course_id) {
        const { data: course } = await supabase
          .from('courses')
          .select('certificate_id')
          .eq('id', assessment.course_id)
          .single();
        
        if (course?.certificate_id) {
          const { data: certificate } = await supabase
            .from('certificates')
            .select('title')
            .eq('id', course.certificate_id)
            .single();
          
          if (certificate?.title) {
            certificateTitle = certificate.title;
          }
        }
      }
      
      // Notifier les admins
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .or('role.eq.ADMIN,role.eq.SUPER_ADMIN');
      
      if (admins) {
        for (const admin of admins) {
          await notifyEligibleCertificat(admin.id, studentName, certificateTitle);
        }
      }
    }
  }

  router.refresh();
};

  const getStatusBadge = (status: string) => {
    const configs = {
      PASSED: {
        icon: CheckCircle2,
        className: 'bg-green-500/10 text-green-400 border-green-500/20',
        label: 'Validé',
      },
      FAILED: {
        icon: XCircle,
        className: 'bg-red-500/10 text-red-400 border-red-500/20',
        label: 'Échoué',
      },
      PENDING: {
        icon: Clock,
        className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        label: 'En attente',
      },
    };
    const config = configs[status as keyof typeof configs] || configs.PENDING;
    const Icon = config.icon;
    return (
      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", config.className)}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 bg-slate-800 rounded animate-pulse" />
          <div className="h-6 w-32 bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
          <div className="divide-y divide-slate-800">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-slate-800 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-slate-800/50 rounded animate-pulse" />
                </div>
                <div className="h-4 w-24 bg-slate-800 rounded animate-pulse" />
                <div className="h-4 w-20 bg-slate-800 rounded animate-pulse" />
                <div className="h-8 w-8 bg-slate-800 rounded animate-pulse" />
                <div className="h-9 w-24 bg-slate-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-violet-400" />
            Soumissions à corriger
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {submissions.length} devoir{submissions.length > 1 ? 's' : ''} soumis
          </p>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        {submissions.length === 0 ? (
          <motion.div {...fadeIn} className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-white font-medium mb-2">Aucun devoir soumis</h3>
            <p className="text-slate-400 text-sm max-w-md">
              Les soumissions de vos étudiants apparaîtront ici dès qu&apos;ils déposeront leurs travaux.
            </p>
          </motion.div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80">
                    <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider"><div className="flex items-center gap-2"><User className="w-3.5 h-3.5" />Étudiant</div></th>
                    <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider"><div className="flex items-center gap-2"><FileText className="w-3.5 h-3.5" />Évaluation</div></th>
                    <th className="text-center py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Rendu</th>
                    <th className="text-center py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider"><div className="flex items-center justify-center gap-2"><Star className="w-3.5 h-3.5" />Note</div></th>
                    <th className="text-center py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Statut</th>
                    <th className="text-right py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {submissions.map((sub, index) => (
                    <motion.tr key={sub.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                      whileHover={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }} className="group transition-colors duration-150">
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="text-white font-medium text-sm">{sub.profiles?.full_name || 'N/A'}</p>
                          <p className="text-slate-500 text-xs mt-0.5">{sub.profiles?.email || ''}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4"><span className="text-slate-300 text-sm">{sub.assessments?.title || 'Évaluation'}</span></td>
                      <td className="py-3.5 px-4 text-center"><SubmissionViewer submissionUrl={sub.submission_url} /></td>
                      <td className="py-3.5 px-4 text-center">
                        {sub.grade !== null ? (
                          <span className={cn("inline-flex items-center gap-1 font-bold text-sm", sub.grade >= 10 ? "text-green-400" : "text-red-400")}>
                            <Star className="w-3.5 h-3.5" />{sub.grade}/20
                          </span>
                        ) : <span className="text-slate-500 text-sm">-</span>}
                      </td>
                      <td className="py-3.5 px-4 text-center">{getStatusBadge(sub.status)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSelectedSubmission(sub)}
                          className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                            sub.grade !== null ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700" : "bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20")}>
                          <Edit3 className="w-3.5 h-3.5" />{sub.grade !== null ? 'Modifier' : 'Corriger'}
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="lg:hidden divide-y divide-slate-800">
              {submissions.map((sub, index) => (
                <motion.div key={sub.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                  className="p-4 space-y-3 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{sub.profiles?.full_name || 'N/A'}</p>
                      <p className="text-slate-500 text-xs truncate mt-0.5">{sub.profiles?.email || ''}</p>
                    </div>
                    {getStatusBadge(sub.status)}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">{sub.assessments?.title || 'Évaluation'}</span>
                    {sub.grade !== null && <span className={cn("font-bold", sub.grade >= 10 ? "text-green-400" : "text-red-400")}>{sub.grade}/20</span>}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
                    <SubmissionViewer submissionUrl={sub.submission_url} />
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => setSelectedSubmission(sub)}
                      className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium",
                        sub.grade !== null ? "bg-slate-800 text-slate-300" : "bg-violet-500/10 text-violet-400 border border-violet-500/20")}>
                      <Edit3 className="w-3.5 h-3.5" />{sub.grade !== null ? 'Modifier' : 'Corriger'}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {selectedSubmission && (
          <GradeModal
            isOpen={!!selectedSubmission}
            onClose={() => setSelectedSubmission(null)}
            submission={selectedSubmission}
            onSuccess={(grade: number, status: string) => handleSuccess(selectedSubmission, grade, status)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}