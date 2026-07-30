'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { fadeIn, stagger } from '@/lib/animations';
import {
  MessageCircle,
  Clock,
  CheckCircle,
  Send,
  Loader2,
  User,
  Calendar,
  Filter,
  Inbox,
} from 'lucide-react';

export default function AdminQuestionsPage() {
  const supabase = createClientComponent();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ANSWERED'>('PENDING');
  const [answerInput, setAnswerInput] = useState<{ [key: number]: string }>({});
  const [responding, setResponding] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchQuestions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('student_questions')
      .select('*, student:student_id (full_name, email)')
      .order('created_at', { ascending: false });
    if (data) setQuestions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleRespond = async (questionId: number) => {
    const answer = answerInput[questionId]?.trim();
    if (!answer) return;
    setResponding(questionId);
    const { error } = await supabase
      .from('student_questions')
      .update({ answer, status: 'ANSWERED' })
      .eq('id', questionId);
    if (!error) {
      setAnswerInput((prev) => ({ ...prev, [questionId]: '' }));
      fetchQuestions();
    } else {
      alert('Erreur : ' + error.message);
    }
    setResponding(null);
  };

  const filtered = questions.filter((q) => {
    if (filter === 'PENDING') return q.status === 'PENDING';
    if (filter === 'ANSWERED') return q.status === 'ANSWERED';
    return true;
  });

  const pendingCount = questions.filter((q) => q.status === 'PENDING').length;
  const answeredCount = questions.filter((q) => q.status === 'ANSWERED').length;

  const filters = [
    { key: 'ALL', label: 'Toutes', count: questions.length, color: 'slate' },
    { key: 'PENDING', label: 'En attente', count: pendingCount, color: 'amber' },
    { key: 'ANSWERED', label: 'Répondues', count: answeredCount, color: 'emerald' },
  ];

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeIn}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-amber-500/10 rounded-xl">
            <MessageCircle className="w-5 h-5 text-amber-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Support Étudiants
          </h1>
        </div>
        <p className="text-slate-400 text-sm ml-14">
          Répondez aux questions des étudiants et suivez les conversations.
        </p>
      </motion.div>

      {/* Filtres */}
      <motion.div variants={fadeIn} className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-slate-500 mr-1" />
        {filters.map((f) => (
          <motion.button
            key={f.key}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(f.key as any)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border',
              filter === f.key
                ? f.color === 'amber'
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : f.color === 'emerald'
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-700 border-slate-600 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            )}
          >
            {f.key === 'PENDING' && <Clock className="w-3 h-3" />}
            {f.key === 'ANSWERED' && <CheckCircle className="w-3 h-3" />}
            {f.key === 'ALL' && <Inbox className="w-3 h-3" />}
            {f.label}
            <span
              className={cn(
                'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                filter === f.key
                  ? 'bg-white/10 text-white'
                  : 'bg-slate-700 text-slate-400'
              )}
            >
              {f.count}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* Liste des questions */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-800 rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-800 rounded-lg w-1/4" />
                  <div className="h-3 bg-slate-800 rounded-lg w-1/6" />
                </div>
                <div className="w-20 h-6 bg-slate-800 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-800 rounded-lg w-3/4" />
                <div className="h-4 bg-slate-800 rounded-lg w-1/2" />
              </div>
            </motion.div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          variants={fadeIn}
          className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl"
        >
          <div className="w-20 h-20 mx-auto mb-4 bg-slate-800 rounded-2xl flex items-center justify-center">
            <Inbox className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">
            {filter === 'ALL'
              ? 'Aucune question'
              : filter === 'PENDING'
              ? 'Aucune question en attente'
              : 'Aucune question répondue'}
          </h3>
          <p className="text-slate-400 text-sm">
            {filter === 'PENDING'
              ? 'Toutes les questions ont été traitées. 👍'
              : 'Les questions des étudiants apparaîtront ici.'}
          </p>
        </motion.div>
      ) : (
        <motion.div variants={stagger} className="space-y-4">
          <AnimatePresence>
            {filtered.map((q) => (
              <motion.div
                key={q.id}
                variants={fadeIn}
                initial="initial"
                animate="animate"
                exit={{ opacity: 0, y: -10 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all duration-300"
              >
                {/* En-tête de la question */}
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-amber-300">
                          {(q.student?.full_name || '?')[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-medium text-sm truncate">
                            {q.student?.full_name || q.student?.email || 'Anonyme'}
                          </h3>
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border flex-shrink-0',
                              q.status === 'ANSWERED'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            )}
                          >
                            {q.status === 'ANSWERED' ? (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                Répondu
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3" />
                                En attente
                              </>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(q.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>

                    <motion.div
                      animate={{ rotate: expandedId === q.id ? 180 : 0 }}
                      className="text-slate-500 flex-shrink-0 mt-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </motion.div>
                  </div>

                  {/* Aperçu de la question */}
                  <div className="ml-13 mt-3">
                    <p className="text-sm text-slate-300 line-clamp-2">
                      {q.question}
                    </p>
                  </div>
                </div>

                {/* Contenu étendu */}
                <AnimatePresence>
                  {expandedId === q.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-slate-800">
                        {/* Question complète */}
                        <div className="mt-4 p-4 bg-slate-800/50 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                              Question de l'étudiant
                            </span>
                          </div>
                          <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">
                            {q.question}
                          </p>
                        </div>

                        {/* Réponse existante */}
                        {q.answer && (
                          <div className="mt-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
                                Votre réponse
                              </span>
                            </div>
                            <p className="text-sm text-emerald-100 whitespace-pre-wrap leading-relaxed">
                              {q.answer}
                            </p>
                          </div>
                        )}

                        {/* Zone de réponse */}
                        {q.status !== 'ANSWERED' && (
                          <div className="mt-4 space-y-3">
                            <textarea
                              rows={3}
                              placeholder="Rédigez votre réponse..."
                              value={answerInput[q.id] || ''}
                              onChange={(e) =>
                                setAnswerInput((prev) => ({
                                  ...prev,
                                  [q.id]: e.target.value,
                                }))
                              }
                              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all resize-none"
                            />
                            <div className="flex justify-end">
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleRespond(q.id)}
                                disabled={responding === q.id || !answerInput[q.id]?.trim()}
                                className={cn(
                                  'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all',
                                  answerInput[q.id]?.trim()
                                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20'
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed',
                                  responding === q.id && 'opacity-70'
                                )}
                              >
                                {responding === q.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Envoi...
                                  </>
                                ) : (
                                  <>
                                    <Send className="w-4 h-4" />
                                    Répondre
                                  </>
                                )}
                              </motion.button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}