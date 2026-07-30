'use client';

import { useEffect, useState } from 'react';
import { createClientComponent } from '@/lib/supabase/client';
import { useStudent } from '@/context/StudentContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, MessageSquare, Send, Loader2, 
  Check, Clock, AlertCircle, Search, 
  ChevronRight, MessageCircle
} from 'lucide-react';

export default function SupportView() {
  const { profile } = useStudent();
  const supabase = createClientComponent();
  const [questions, setQuestions] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchQuestions = async () => {
    if (!profile) return;
    setLoadingQuestions(true);
    const { data } = await supabase
      .from('student_questions')
      .select('*')
      .eq('student_id', profile.id)
      .order('created_at', { ascending: false });
    if (data) setQuestions(data);
    setLoadingQuestions(false);
  };

  useEffect(() => {
    fetchQuestions();
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setSubmitting(true);
    setMessage(null);

    const { error } = await supabase.from('student_questions').insert({
      student_id: profile?.id,
      question: newQuestion.trim(),
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Question envoyée avec succès !' });
      setNewQuestion('');
      fetchQuestions();
    }
    
    setSubmitting(false);
    setTimeout(() => setMessage(null), 3000);
  };

  // Statistiques
  const totalQuestions = questions.length;
  const answeredQuestions = questions.filter(q => q.status === 'ANSWERED').length;
  const pendingQuestions = questions.filter(q => q.status !== 'ANSWERED').length;

  // Filtrer les questions
  const filteredQuestions = questions.filter(q =>
    q.question?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6 lg:space-y-8">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-2xl">
            <HelpCircle className="w-6 h-6 lg:w-7 lg:h-7 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-white">
              Support & Questions
            </h2>
            <p className="text-sm text-slate-400">
              Une question ? Notre équipe vous répond rapidement.
            </p>
          </div>
        </div>

        {/* Mini Stats */}
        <div className="hidden sm:flex gap-3">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl px-3 py-2 text-center">
            <p className="text-lg font-bold text-green-400">{answeredQuestions}</p>
            <p className="text-[10px] text-slate-500">Répondues</p>
          </div>
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl px-3 py-2 text-center">
            <p className="text-lg font-bold text-amber-400">{pendingQuestions}</p>
            <p className="text-[10px] text-slate-500">En attente</p>
          </div>
        </div>
      </motion.div>

      {/* Formulaire Nouvelle Question */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden"
      >
        <div className="flex items-center gap-3 p-5 lg:p-6 border-b border-[#1e293b]">
          <div className="p-2 bg-purple-500/10 rounded-xl">
            <MessageCircle className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Poser une nouvelle question
            </h3>
            <p className="text-xs text-slate-400">
              Décrivez votre problème en détail
            </p>
          </div>
        </div>

        <div className="p-5 lg:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <textarea
                rows={4}
                placeholder="Décrivez votre problème ou votre question..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="w-full px-4 py-3 bg-[#020617] border border-[#1e293b] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition-all text-sm resize-none"
                required
              />
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Soyez précis pour obtenir une réponse plus rapide.
              </p>
            </div>

            {/* Feedback Message */}
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`flex items-start gap-2 p-3 rounded-xl ${
                    message.type === 'success'
                      ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                      : 'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}
                >
                  {message.type === 'success' ? (
                    <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  )}
                  <span className="text-sm">{message.text}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={submitting || !newQuestion.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Envoyer ma question
                </>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>

      {/* Historique des Questions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 lg:p-6 border-b border-[#1e293b]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <MessageSquare className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Mes Questions
              </h3>
              <p className="text-xs text-slate-400">
                {totalQuestions} question{totalQuestions > 1 ? 's' : ''} posée{totalQuestions > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Barre de recherche */}
          {totalQuestions > 0 && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#020617] border border-[#1e293b] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
          )}
        </div>

        <div className="p-5 lg:p-6">
          {/* Loading State */}
          {loadingQuestions ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-[#020617] rounded-xl p-4">
                  <div className="flex justify-between mb-2">
                    <div className="h-3 bg-[#1e293b] rounded w-24" />
                    <div className="h-3 bg-[#1e293b] rounded w-16" />
                  </div>
                  <div className="h-4 bg-[#1e293b] rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : filteredQuestions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-semibold text-white mb-1">
                {searchTerm ? 'Aucun résultat' : 'Aucune question'}
              </h4>
              <p className="text-sm text-slate-400">
                {searchTerm 
                  ? 'Essayez avec un autre terme de recherche.' 
                  : 'Posez votre première question ci-dessus.'}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filteredQuestions.map((q, index) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-[#020617] border border-[#1e293b] rounded-xl overflow-hidden"
                >
                  {/* Question Header */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                        q.status === 'ANSWERED' 
                          ? 'bg-green-500/10' 
                          : 'bg-amber-500/10'
                      }`}>
                        {q.status === 'ANSWERED' ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">
                          {q.question}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(q.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      q.status === 'ANSWERED'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {q.status === 'ANSWERED' ? (
                        <>
                          <Check className="w-3 h-3" />
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

                  {/* Réponse */}
                  {q.answer && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="border-t border-[#1e293b] bg-green-500/5 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-green-500/10 rounded-lg flex-shrink-0 mt-0.5">
                          <MessageCircle className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-green-400 mb-1">
                            Réponse de l'équipe :
                          </p>
                          <p className="text-sm text-slate-300">
                            {q.answer}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}