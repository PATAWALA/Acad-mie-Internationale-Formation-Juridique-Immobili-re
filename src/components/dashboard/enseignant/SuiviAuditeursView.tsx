// components/enseignant/SuiviAuditeursView.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEnseignant } from '@/context/EnseignantContext';
import AuditeursList from '@/components/dashboard/enseignant/AuditeursList';
import { createClientComponent } from '@/lib/supabase/client';
import { Users, ChevronRight, BookOpen, Loader2, ArrowLeft, BarChart3 } from 'lucide-react';

export default function SuiviAuditeursView() {
  const { assignedCertificates } = useEnseignant();
  const supabase = createClientComponent();
  const [selectedCert, setSelectedCert] = useState<number | null>(null);
  const [statsByCert, setStatsByCert] = useState<Record<number, { total: number; paid: number }>>({});
  const [loadingStats, setLoadingStats] = useState(true);

  // Charger le nombre d'auditeurs payés pour chaque formation
  useEffect(() => {
    const fetchStats = async () => {
      if (!assignedCertificates.length) {
        setLoadingStats(false);
        return;
      }
      setLoadingStats(true);
      const newStats: Record<number, { total: number; paid: number }> = {};

      for (const cert of assignedCertificates) {
        const { count: totalCount } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('certificate_id', cert.id);

        const { count: paidCount } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('certificate_id', cert.id)
          .eq('payment_status', 'PAID');

        newStats[cert.id] = {
          total: totalCount || 0,
          paid: paidCount || 0,
        };
      }

      setStatsByCert(newStats);
      setLoadingStats(false);
    };

    fetchStats();
  }, [assignedCertificates]);

  if (!selectedCert) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        {/* En-tête */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              Suivi des auditeurs
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Sélectionnez une formation pour voir la liste des auditeurs inscrits.
            </p>
          </div>
        </div>

        {/* Grille des formations */}
        {assignedCertificates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-white font-semibold mb-2">Aucune formation assignée</h3>
            <p className="text-slate-400 text-sm max-w-sm">
              Contactez l'administrateur pour qu'il vous assigne des formations.
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {assignedCertificates.map((cert) => {
              const stats = statsByCert[cert.id] || { total: 0, paid: 0 };
              return (
                <button
                  key={cert.id}
                  onClick={() => setSelectedCert(cert.id)}
                  className="group relative bg-slate-900/50 border border-slate-800 rounded-xl p-5 text-left transition-all hover:border-blue-500/40 hover:bg-slate-900/80 hover:shadow-lg hover:shadow-blue-500/5"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
                      <BookOpen className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold leading-tight line-clamp-2">
                        {cert.title}
                      </h3>
                    </div>
                  </div>

                  {/* Statistiques */}
                  <div className="mt-4 flex items-center gap-3 text-sm">
                    <span className="inline-flex items-center gap-1.5 text-slate-400">
                      <Users className="w-4 h-4 text-slate-500" />
                      {loadingStats ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <span>
                          <span className="text-white font-semibold">{stats.paid}</span>
                          {' '}auditeur{stats.paid > 1 ? 's' : ''} actif{stats.paid > 1 ? 's' : ''}
                        </span>
                      )}
                    </span>
                    {stats.total > 0 && !loadingStats && (
                      <span className="text-xs text-slate-500">
                        ({stats.total} inscription{stats.total > 1 ? 's' : ''})
                      </span>
                    )}
                  </div>

                  {/* Indication cliquable */}
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Voir les auditeurs
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </div>
    );
  }

  // Vue détaillée avec AuditeursList
  return (
    <div className="max-w-6xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key="auditeurs"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <AuditeursList
            certId={selectedCert}
            onBack={() => setSelectedCert(null)}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}