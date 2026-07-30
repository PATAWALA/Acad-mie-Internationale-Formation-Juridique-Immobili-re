'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { fadeIn, stagger } from '@/lib/animations';
import {
  GraduationCap,
  Users,
  CheckCircle,
  Clock,
  Filter,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';

interface Props {
  users: any[];
}

export function AdminUsersList({ users }: Props) {
  const supabase = createClientComponent();
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'STUDENT' | 'TEACHER'>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleDelete = async (userId: string) => {
    setDeletingId(userId);
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (!error) {
      router.refresh();
    } else {
      alert('Erreur : ' + error.message);
    }
    setDeletingId(null);
    setShowDeleteConfirm(null);
  };

  // KPIs
  const students = users.filter(u => u.role === 'STUDENT');
  const teachers = users.filter(u => u.role === 'TEACHER');
  const paidStudents = students.filter(s => s.status === 'PAID');
  const pendingStudents = students.filter(s => s.status === 'PENDING_PAYMENT' || s.status === 'PENDING');

  // Filtrage
  let filteredUsers = users;
  if (roleFilter !== 'ALL') {
    filteredUsers = filteredUsers.filter(u => u.role === roleFilter);
  }
  if (roleFilter === 'STUDENT' || roleFilter === 'ALL') {
    if (paymentFilter === 'PAID') {
      filteredUsers = filteredUsers.filter(u => u.role === 'STUDENT' && u.status === 'PAID');
    } else if (paymentFilter === 'PENDING') {
      filteredUsers = filteredUsers.filter(u => u.role === 'STUDENT' && (u.status === 'PENDING_PAYMENT' || u.status === 'PENDING'));
    }
  }

  const kpiCards = [
    { label: 'Étudiants', value: students.length, icon: GraduationCap, color: 'blue' },
    { label: 'Enseignants', value: teachers.length, icon: Users, color: 'violet' },
    { label: 'Payés', value: paidStudents.length, icon: CheckCircle, color: 'emerald' },
    { label: 'En attente', value: pendingStudents.length, icon: Clock, color: 'amber' },
  ];

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <motion.div
            key={kpi.label}
            variants={fadeIn}
            className={cn(
              'relative overflow-hidden rounded-xl border p-4 transition-all duration-300',
              'bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-lg hover:shadow-slate-900/50'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {kpi.label}
              </span>
              <kpi.icon
                className={cn(
                  'w-5 h-5',
                  kpi.color === 'blue' && 'text-blue-400',
                  kpi.color === 'violet' && 'text-violet-400',
                  kpi.color === 'emerald' && 'text-emerald-400',
                  kpi.color === 'amber' && 'text-amber-400'
                )}
              />
            </div>
            <span className="text-2xl font-bold text-white">{kpi.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Filtres */}
      <motion.div variants={fadeIn} className="flex flex-wrap items-center gap-2">
        <Filter className="w-4 h-4 text-slate-500 mr-1" />
        
        {/* Filtres rôle */}
        {(['ALL', 'STUDENT', 'TEACHER'] as const).map((role) => (
          <motion.button
            key={role}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setRoleFilter(role);
              if (role !== 'STUDENT') setPaymentFilter('ALL');
            }}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border',
              roleFilter === role
                ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            )}
          >
            {role === 'ALL' ? 'Tous' : role === 'STUDENT' ? 'Étudiants' : 'Enseignants'}
          </motion.button>
        ))}

        {/* Séparateur */}
        <div className="w-px h-5 bg-slate-700 mx-2" />

        {/* Filtres paiement */}
        {(['ALL', 'PAID', 'PENDING'] as const).map((status) => (
          <motion.button
            key={status}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPaymentFilter(status)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border',
              paymentFilter === status
                ? status === 'PAID'
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : status === 'PENDING'
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-slate-700 border-slate-600 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            )}
          >
            {status === 'ALL' ? 'Tous statuts' : status === 'PAID' ? 'Payés' : 'En attente'}
          </motion.button>
        ))}
      </motion.div>

      {/* Tableau */}
      {filteredUsers.length === 0 ? (
        <motion.div variants={fadeIn} className="text-center py-12">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Aucun utilisateur trouvé.</p>
        </motion.div>
      ) : (
        <motion.div variants={fadeIn} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                    Nom complet
                  </th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                    Email
                  </th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                    Téléphone
                  </th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                    Rôle
                  </th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                    Statut
                  </th>
                  <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredUsers.map((u, index) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                            {(u.full_name || '?')[0].toUpperCase()}
                          </div>
                          <span className="text-white font-medium text-sm">
                            {u.full_name || 'Non renseigné'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">{u.email}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{u.phone || '-'}</td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold',
                            u.role === 'TEACHER' && 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
                            u.role === 'ADMIN' && 'bg-red-500/20 text-red-300 border border-red-500/30',
                            u.role === 'STUDENT' && 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          )}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {u.role === 'STUDENT' ? (
                          u.status === 'PAID' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 text-sm font-medium">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Payé
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-400 text-sm font-medium">
                              <Clock className="w-3.5 h-3.5" />
                              En attente
                            </span>
                          )
                        ) : (
                          <span className="text-slate-600">--</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowDeleteConfirm(u.id)}
                          disabled={deletingId === u.id}
                          className={cn(
                            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                            'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300',
                            deletingId === u.id && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          {deletingId === u.id ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 0.8 }}
                                className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full"
                              />
                              Suppression...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-3.5 h-3.5" />
                              Supprimer
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
        </motion.div>
      )}

      {/* Modal de confirmation de suppression */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/10 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Confirmer la suppression</h3>
              </div>
              <p className="text-slate-400 text-sm mb-6">
                Cette action est irréversible. L'utilisateur sera définitivement supprimé de la plateforme.
              </p>
              <div className="flex gap-3 justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                >
                  Supprimer définitivement
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}