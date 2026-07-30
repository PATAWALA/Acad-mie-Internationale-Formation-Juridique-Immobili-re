'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '@/context/AdminContext';
import { CreateTeacherModal } from './CreateTeacherModal';
import { cn } from '@/lib/utils';
import { fadeIn, scaleIn, stagger } from '@/lib/animations';
import {
  Users,
  Clock,
  CheckCircle,
  Plus,
  Search,
  Filter,
  ChevronDown,
  UserCheck,
} from 'lucide-react';

export function UsersTable() {
  const { users, loading, validatePayment } = useAdmin();
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'PAID'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const isStudent = (user: any) => user.role === 'STUDENT';
  const isPending = (status: string | null) => {
    if (!status) return false;
    const s = status.trim().toUpperCase();
    return s === 'PENDING_PAYMENT' || s === 'PENDING';
  };
  const isPaid = (status: string | null) => {
    if (!status) return false;
    return status.trim().toUpperCase() === 'PAID';
  };

  // Filtrage combiné (filtre pilule + recherche)
  const filteredUsers = users.filter((user) => {
    // Filtre de statut
    if (filter === 'PENDING' && (!isStudent(user) || !isPending(user.status))) return false;
    if (filter === 'PAID' && (!isStudent(user) || !isPaid(user.status))) return false;

    // Recherche textuelle
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        (user.full_name || '').toLowerCase().includes(term) ||
        (user.email || '').toLowerCase().includes(term) ||
        (user.phone || '').toLowerCase().includes(term)
      );
    }

    return true;
  });

  const pendingCount = users.filter((u) => isStudent(u) && isPending(u.status)).length;
  const paidCount = users.filter((u) => isStudent(u) && isPaid(u.status)).length;

  const filters = [
    { key: 'ALL', label: 'Tous', count: users.length, icon: Users },
    { key: 'PENDING', label: 'En attente', count: pendingCount, icon: Clock, color: 'amber' },
    { key: 'PAID', label: 'Payés', count: paidCount, icon: CheckCircle, color: 'green' },
  ];

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={stagger}
      className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <motion.div variants={fadeIn} className="flex items-center gap-3">
            <div className="p-2 bg-violet-500/10 rounded-lg">
              <Users className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Liste des utilisateurs
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {filteredUsers.length} sur {users.length} utilisateurs
              </p>
            </div>
          </motion.div>

          <motion.div variants={fadeIn} className="flex items-center gap-3">
            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-56 pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-violet-500/20"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Ajouter un Enseignant</span>
            </motion.button>
          </motion.div>
        </div>

        {/* Filtres en pilules */}
        <motion.div variants={fadeIn} className="flex items-center gap-2 mt-4 flex-wrap">
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
                  ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
              )}
            >
              <f.icon className="w-3 h-3" />
              {f.label}
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                  filter === f.key
                    ? 'bg-violet-500/30 text-violet-200'
                    : 'bg-slate-700 text-slate-400'
                )}
              >
                {f.count}
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Tableau */}
      {loading ? (
        <div className="p-6 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 animate-pulse"
            >
              <div className="w-8 h-8 bg-slate-800 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-800 rounded w-1/3" />
                <div className="h-3 bg-slate-800 rounded w-1/2" />
              </div>
              <div className="w-20 h-6 bg-slate-800 rounded-full" />
              <div className="w-24 h-8 bg-slate-800 rounded-lg" />
            </motion.div>
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <motion.div variants={fadeIn} className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-800 rounded-2xl flex items-center justify-center">
            <Users className="w-8 h-8 text-slate-600" />
          </div>
          <p className="text-slate-400 text-sm">Aucun utilisateur trouvé.</p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-2 text-violet-400 text-sm hover:underline"
            >
              Effacer la recherche
            </button>
          )}
        </motion.div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                  Utilisateur
                </th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                  Contact
                </th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                  Rôle
                </th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                  Statut
                </th>
                <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-sm font-bold text-slate-300 flex-shrink-0">
                          {(user.full_name || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">
                            {user.full_name || 'Non renseigné'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-300">{user.email}</div>
                      {user.phone && (
                        <div className="text-xs text-slate-500 mt-0.5">{user.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide',
                          user.role === 'TEACHER' &&
                            'bg-violet-500/20 text-violet-300 border border-violet-500/30',
                          user.role === 'ADMIN' &&
                            'bg-red-500/20 text-red-300 border border-red-500/30',
                          user.role === 'STUDENT' &&
                            'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        )}
                      >
                        {user.role === 'TEACHER' && <UserCheck className="w-3 h-3 mr-1" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {isStudent(user) ? (
                        isPaid(user.status) ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle className="w-3 h-3" />
                            Payé
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            <Clock className="w-3 h-3" />
                            En attente
                          </span>
                        )
                      ) : (
                        <span className="text-slate-600 text-sm">--</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isStudent(user) && isPending(user.status) && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => validatePayment(user.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-colors shadow-lg shadow-emerald-500/20"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Valider le paiement
                        </motion.button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      <CreateTeacherModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </motion.div>
  );
}