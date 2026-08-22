'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { GradeModal } from './GradeModal';
import SubmissionViewer from './SubmissionViewer';
import { cn } from '@/lib/utils';
import {
  FileText, Clock, CheckCircle2, XCircle,
  Edit3, FileSearch
} from 'lucide-react';

interface GradingTableProps {
  submissions: any[];
  loading?: boolean;
}

export function GradingTable({ submissions, loading }: GradingTableProps) {
  const router = useRouter();
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  const handleSuccess = () => {
    setSelectedSubmission(null);
    router.refresh();
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

      {/* Modal correction */}
      <AnimatePresence>
        {selectedSubmission && (
          <GradeModal
          isOpen={!!selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          submission={selectedSubmission}
          onSuccess={handleSuccess}
          passingScore={14}
          />
        )}
      </AnimatePresence>
    </div>
  );
}