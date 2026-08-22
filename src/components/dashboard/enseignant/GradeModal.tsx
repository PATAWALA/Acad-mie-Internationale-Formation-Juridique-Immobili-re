'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { scaleIn } from '@/lib/animations';
import {
  X,
  User,
  ExternalLink,
  Star,
  MessageSquare,
  Loader2,
  Send,
  AlertCircle,
} from 'lucide-react';

interface GradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: any;
  onSuccess: (grade: number, status: string) => void; // 🆕 signature
  passingScore?: number; // nouveau
}

export function GradeModal({ isOpen, onClose, submission, onSuccess,passingScore = 10 }: GradeModalProps) {
  const supabase = createClientComponent();
  const [grade, setGrade] = useState<number | ''>(submission?.grade ?? '');
  const [feedback, setFeedback] = useState<string>(submission?.feedback ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !submission) return null;

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (grade === '' || Number(grade) < 0 || Number(grade) > 20) {
    setError('Veuillez saisir une note valide entre 0 et 20.');
    return;
  }

  setLoading(true);
  setError('');

  const numGrade = Number(grade);
  const status = numGrade >= passingScore ? 'PASSED' : 'FAILED';

  const { error: updateError } = await supabase
    .from('submissions')
    .update({
      grade: numGrade,
      feedback: feedback,
      status: status,
      graded_at: new Date().toISOString(),
    })
    .eq('id', submission.id);

  if (updateError) {
    setError('Erreur lors de l\'enregistrement : ' + updateError.message);
    setLoading(false);
    return;
  }

  // 📧 Envoyer un e-mail à l'étudiant avec son résultat
  await fetch('/api/send-grading-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ submissionId: submission.id }),
  });

  setLoading(false);
  // 🆕 Passer grade et status au parent
  onSuccess(numGrade, status);
  onClose();
};

  const predictedStatus = grade !== '' ? (Number(grade) >= passingScore ? 'PASSED' : 'FAILED') : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            variants={scaleIn}
            initial="initial"
            animate="animate"
            exit="initial"
            className={cn(
              "relative w-full max-w-lg",
              "bg-slate-900 border border-slate-800 rounded-2xl",
              "shadow-2xl shadow-violet-500/5",
              "overflow-hidden"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center">
                  <Star className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Évaluer la soumission</h3>
                  <p className="text-sm text-slate-400">Attribution de la note et feedback</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Info étudiant */}
            <div className="px-6 py-4 bg-slate-800/30 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    {submission.profiles?.full_name || submission.profiles?.email || 'Étudiant'}
                  </p>
                  <p className="text-slate-500 text-xs truncate">
                    {submission.assessments?.title || 'Évaluation'}
                  </p>
                </div>
                <a
                  href={submission.submission_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                    bg-blue-500/10 text-blue-400 border border-blue-500/20
                    hover:bg-blue-500/20 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Consulter le travail
                </a>
              </div>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Note */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Star className="w-4 h-4 text-amber-400" />
                  Note sur 20
                </label>
                <div className="relative">
                  <input
                    type="number" min="0" max="20" step="0.5" required
                    value={grade}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Number(e.target.value);
                      if (val === '' || (Number(val) >= 0 && Number(val) <= 20)) {
                        setGrade(val);
                        setError('');
                      }
                    }}
                    className={cn(
                      "w-full px-4 py-2.5 rounded-xl text-white",
                      "bg-slate-800 border border-slate-700",
                      "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500",
                      "placeholder-slate-500 transition-all duration-200",
                      predictedStatus === 'PASSED' && "border-green-500/30 focus:ring-green-500/50",
                      predictedStatus === 'FAILED' && "border-red-500/30 focus:ring-red-500/50"
                    )}
                    placeholder="0 - 20"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">/20</div>
                </div>
                {predictedStatus && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className={cn("text-xs flex items-center gap-1.5", predictedStatus === 'PASSED' ? "text-green-400" : "text-red-400")}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", predictedStatus === 'PASSED' ? "bg-green-400" : "bg-red-400")} />
                    Statut : {predictedStatus === 'PASSED' ? 'Réussite (≥ 10/20)' : 'Échec (< 10/20)'}
                  </motion.p>
                )}
              </div>

              {/* Commentaire */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  Commentaire / Appréciation
                </label>
                <textarea
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className={cn(
                    "w-full px-4 py-2.5 rounded-xl text-white resize-none",
                    "bg-slate-800 border border-slate-700",
                    "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500",
                    "placeholder-slate-500 transition-all duration-200"
                  )}
                  placeholder="Feedback pour l'étudiant (points forts, axes d'amélioration...)"
                />
                <p className="text-xs text-slate-500 text-right">{feedback.length} caractères</p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors">
                  Annuler
                </motion.button>
                <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className={cn(
                    "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium",
                    "bg-gradient-to-r from-green-500 to-emerald-600",
                    "text-white shadow-lg shadow-green-500/20",
                    "hover:shadow-green-500/30 hover:from-green-400 hover:to-emerald-500",
                    "transition-all duration-200",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}>
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Enregistrement...</>
                  ) : (
                    <><Send className="w-4 h-4" />Valider la note</>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}