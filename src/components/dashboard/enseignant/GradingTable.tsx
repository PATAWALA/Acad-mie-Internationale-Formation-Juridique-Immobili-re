'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import { GradeModal } from './GradeModal';
import SubmissionViewer from './SubmissionViewer';
import { cn } from '@/lib/utils';
import {
  FileText, X,  Clock, CheckCircle2, XCircle,
  Edit3, FileSearch, Loader2, Eye, HelpCircle, Wrench
} from 'lucide-react';

interface GradingTableProps {
  submissions: any[];
  loading?: boolean;
}

export function GradingTable({ submissions, loading }: GradingTableProps) {
  const router = useRouter();
  const supabase = createClientComponent();
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [showDetails, setShowDetails] = useState<any>(null);
  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleSuccess = () => {
    setSelectedSubmission(null);
    router.refresh();
  };

  const handleShowDetails = async (submission: any) => {
    setShowDetails(submission);
    setLoadingDetails(true);
    setStudentDetails(null);

    if (submission.student_id) {
      // Récupérer les tentatives TP
      const { data: tpAttempts } = await supabase
        .from('tp_attempts')
        .select('*')
        .eq('student_id', submission.student_id)
        .order('created_at', { ascending: false });

      // Récupérer les tentatives QCM
      const { data: quizAttempts } = await supabase
        .from('quiz_answers')
        .select('*')
        .eq('student_id', submission.student_id)
        .order('answered_at', { ascending: false });

      // Récupérer les leçons TP pour les titres
      const tpLessonIds = tpAttempts?.map((a: any) => a.lesson_id) || [];
      const { data: tpLessons } = tpLessonIds.length > 0
        ? await supabase.from('lessons').select('id, title').in('id', tpLessonIds)
        : { data: [] };

      const tpLessonMap = new Map(tpLessons?.map((l: any) => [l.id, l.title]) || []);

      setStudentDetails({
        tpAttempts: tpAttempts || [],
        quizAttempts: quizAttempts || [],
        tpLessonMap,
      });
    }

    setLoadingDetails(false);
  };

  const getStatusBadge = (status: string) => {
    const configs: any = {
      PASSED: { icon: CheckCircle2, className: 'bg-green-500/10 text-green-400 border-green-500/20', label: 'Validé' },
      FAILED: { icon: XCircle, className: 'bg-red-500/10 text-red-400 border-red-500/20', label: 'Échoué' },
      PENDING: { icon: Clock, className: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'En attente' },
    };
    const config = configs[status] || configs.PENDING;
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
        <div className="h-6 w-48 bg-slate-800 rounded animate-pulse" />
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
              <div className="flex-1 h-4 bg-slate-800 rounded" />
              <div className="w-24 h-4 bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
        <FileSearch className="w-5 h-5 text-violet-400" />
        Soumissions à corriger
      </h2>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        {submissions.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Aucun devoir soumis pour le moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">Étudiant</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">Évaluation</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">Rendu</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">Note</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">Statut</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">Détails</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <p className="text-white font-medium text-sm">{sub.profiles?.full_name || 'N/A'}</p>
                      <p className="text-slate-500 text-xs">{sub.profiles?.email || ''}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-300 text-sm">{sub.assessments?.title || 'Évaluation'}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <SubmissionViewer submissionUrl={sub.submission_url} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      {sub.grade !== null ? (
                        <span className={cn("font-bold text-sm", sub.grade >= 10 ? "text-green-400" : "text-red-400")}>
                          {sub.grade}/20
                        </span>
                      ) : (
                        <span className="text-slate-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(sub.status)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleShowDetails(sub)}
                        className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Voir les tentatives TP et QCM"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedSubmission(sub)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                          sub.grade !== null
                            ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                            : "bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20"
                        )}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        {sub.grade !== null ? 'Modifier' : 'Corriger'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal détails */}
      <AnimatePresence>
        {showDetails && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetails(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <h3 className="text-white font-semibold">
                  Détails : {showDetails.profiles?.full_name}
                </h3>
                <button onClick={() => setShowDetails(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                {loadingDetails ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                  </div>
                ) : studentDetails ? (
                  <>
                    {/* Tentatives TP */}
                    <div>
                      <h4 className="text-sm font-semibold text-orange-400 mb-2 flex items-center gap-2">
                        <Wrench className="w-4 h-4" /> Tentatives TP
                      </h4>
                      {studentDetails.tpAttempts.length === 0 ? (
                        <p className="text-slate-500 text-sm">Aucune tentative TP</p>
                      ) : (
                        <div className="space-y-2">
                          {studentDetails.tpAttempts.map((attempt: any, i: number) => (
                            <div key={attempt.id} className={`p-2.5 rounded-lg border ${attempt.is_correct ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                              <p className="text-white text-sm">
                                {studentDetails.tpLessonMap.get(attempt.lesson_id) || 'TP'}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">
                                {attempt.is_correct ? '✅' : '❌'} {attempt.selected_option}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {new Date(attempt.created_at).toLocaleString('fr-FR')}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Tentatives QCM */}
                    <div>
                      <h4 className="text-sm font-semibold text-violet-400 mb-2 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" /> Réponses QCM
                      </h4>
                      {studentDetails.quizAttempts.length === 0 ? (
                        <p className="text-slate-500 text-sm">Aucune réponse QCM</p>
                      ) : (
                        <div className="space-y-2">
                          {studentDetails.quizAttempts.map((answer: any, i: number) => (
                            <div key={answer.id} className={`p-2.5 rounded-lg border ${answer.is_correct ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                              <p className="text-white text-sm">
                                Question {i + 1} : {answer.is_correct ? '✅ Correcte' : '❌ Incorrecte'}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">
                                Réponse : {answer.selected_answer}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-slate-500 text-sm">Aucune donnée disponible</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal correction */}
      <AnimatePresence>
        {selectedSubmission && (
          <GradeModal
            isOpen={!!selectedSubmission}
            onClose={() => setSelectedSubmission(null)}
            submission={selectedSubmission}
            onSuccess={handleSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}