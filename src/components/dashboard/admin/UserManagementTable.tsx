'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { fadeIn, stagger } from '@/lib/animations';
import {
  CheckCircle,
  Clock,
  Shield,
  UserCheck,
  Users,
  Loader2,
  Ban,
  Wallet,
} from 'lucide-react';

interface UserManagementTableProps {
  users: any[];
}

export function UserManagementTable({ users }: UserManagementTableProps) {
  const supabase = createClientComponent();
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<{ id: string; action: 'toggle' | 'role'; newValue: string } | null>(null);

  const togglePaymentStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PAID' ? 'PENDING_PAYMENT' : 'PAID';
    setLoadingId(userId);

    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', userId);

    setLoadingId(null);
    setShowConfirm(null);

    if (!error) {
      router.refresh();
    } else {
      alert('Erreur lors de la mise à jour : ' + error.message);
    }
  };

  const changeRole = async (userId: string, newRole: string) => {
    setLoadingId(userId);

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    setLoadingId(null);
    setShowConfirm(null);

    if (!error) {
      router.refresh();
    } else {
      alert('Erreur lors du changement de rôle : ' + error.message);
    }
  };

  if (!users || users.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <div className="w-20 h-20 mx-auto mb-4 bg-slate-800 rounded-2xl flex items-center justify-center">
          <Users className="w-10 h-10 text-slate-600" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">Aucun utilisateur</h3>
        <p className="text-slate-400 text-sm">Aucun utilisateur enregistré pour le moment.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={stagger}
      className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">
                Utilisateur
              </th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">
                Rôle
              </th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">
                Statut paiement
              </th>
              <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {users.map((u, index) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group"
                >
                  {/* Utilisateur */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0',
                        u.role === 'TEACHER' && 'bg-violet-500/20 text-violet-300',
                        u.role === 'ADMIN' && 'bg-red-500/20 text-red-300',
                        u.role === 'STUDENT' && 'bg-blue-500/20 text-blue-300'
                      )}>
                        {(u.full_name || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">
                          {u.full_name || 'Sans nom'}
                        </p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Rôle */}
                  <td className="px-6 py-4">
                    <select
                      value={u.role || 'STUDENT'}
                      onChange={(e) => setShowConfirm({ id: u.id, action: 'role', newValue: e.target.value })}
                      disabled={loadingId === u.id}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-bold border transition-all appearance-none cursor-pointer',
                        'bg-slate-800 border-slate-700 text-white',
                        'focus:outline-none focus:border-violet-500',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        u.role === 'TEACHER' && 'border-violet-500/50',
                        u.role === 'ADMIN' && 'border-red-500/50',
                        u.role === 'STUDENT' && 'border-blue-500/50'
                      )}
                    >
                      <option value="STUDENT">Étudiant</option>
                      <option value="TEACHER">Enseignant</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>

                  {/* Statut paiement */}
                  <td className="px-6 py-4">
                    {u.role === 'STUDENT' ? (
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border',
                          u.status === 'PAID'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        )}
                      >
                        {u.status === 'PAID' ? (
                          <>
                            <Wallet className="w-3 h-3" />
                            Payé
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            En attente
                          </>
                        )}
                      </span>
                    ) : (
                      <span className="text-slate-600 text-sm">--</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        setShowConfirm({
                          id: u.id,
                          action: 'toggle',
                          newValue: u.status === 'PAID' ? 'PENDING' : 'PAID',
                        })
                      }
                      disabled={loadingId === u.id}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                        u.status === 'PAID'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20',
                        loadingId === u.id && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {loadingId === u.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : u.status === 'PAID' ? (
                        <>
                          <Ban className="w-3.5 h-3.5" />
                          Marquer Impayé
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          Valider Paiement
                        </>
                      )}
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Modal de confirmation */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  'p-2 rounded-full',
                  showConfirm.action === 'toggle' && 'bg-amber-500/10',
                  showConfirm.action === 'role' && 'bg-violet-500/10'
                )}>
                  <Shield className={cn(
                    'w-5 h-5',
                    showConfirm.action === 'toggle' && 'text-amber-400',
                    showConfirm.action === 'role' && 'text-violet-400'
                  )} />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {showConfirm.action === 'toggle' ? 'Modifier le statut' : 'Changer le rôle'}
                </h3>
              </div>
              <p className="text-slate-400 text-sm mb-6">
                {showConfirm.action === 'toggle'
                  ? `Voulez-vous vraiment ${showConfirm.newValue === 'PAID' ? 'valider' : 'invalider'} le paiement ?`
                  : `Définir le rôle sur "${showConfirm.newValue}" ?`}
              </p>
              <div className="flex gap-3 justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowConfirm(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors"
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (showConfirm.action === 'toggle') {
                      togglePaymentStatus(showConfirm.id, showConfirm.newValue);
                    } else {
                      changeRole(showConfirm.id, showConfirm.newValue);
                    }
                  }}
                  className={cn(
                    'px-4 py-2 text-white text-sm font-medium rounded-xl transition-all shadow-lg',
                    showConfirm.action === 'toggle'
                      ? showConfirm.newValue === 'PAID'
                        ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
                        : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                      : 'bg-violet-500 hover:bg-violet-600 shadow-violet-500/20'
                  )}
                >
                  Confirmer
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}