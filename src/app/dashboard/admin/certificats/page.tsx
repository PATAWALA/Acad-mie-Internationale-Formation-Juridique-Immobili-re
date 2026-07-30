'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import CertificateFormModal from '@/components/dashboard/admin/CertificateFormModal';
import { cn } from '@/lib/utils';
import { fadeIn, stagger } from '@/lib/animations';
import {
  Plus,
  GraduationCap,
  Pencil,
  Trash2,
  TrendingDown,
  DollarSign,
  Loader2,
  AlertTriangle,
  ScrollText,
} from 'lucide-react';

export default function AdminCertificatsPage() {
  const supabase = createClientComponent();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const fetchCertificates = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('certificates').select('*').order('title');
    if (!error && data) setCertificates(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleEdit = (cert: any) => {
    setSelectedCert(cert);
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedCert(null);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    const { error } = await supabase.from('certificates').delete().eq('id', id);
    if (!error) {
      fetchCertificates();
    } else {
      alert('Erreur : ' + error.message);
    }
    setDeletingId(null);
    setShowDeleteConfirm(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedCert(null);
  };

  const handleSaved = () => {
    handleModalClose();
    fetchCertificates();
  };

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">
      {/* Header */}
      <motion.div
        variants={fadeIn}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Gestion des Certificats
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Gérez les certificats, les prix et les réductions
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          Ajouter un certificat
        </motion.button>
      </motion.div>

      {/* Tableau */}
      <motion.div
        variants={fadeIn}
        className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
      >
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 animate-pulse"
              >
                <div className="flex-1 h-5 bg-slate-800 rounded-lg" />
                <div className="w-28 h-5 bg-slate-800 rounded-lg" />
                <div className="w-28 h-5 bg-slate-800 rounded-lg" />
                <div className="w-16 h-5 bg-slate-800 rounded-lg" />
                <div className="w-40 h-8 bg-slate-800 rounded-lg" />
              </motion.div>
            ))}
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-slate-800 rounded-2xl flex items-center justify-center">
              <ScrollText className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Aucun certificat</h3>
            <p className="text-slate-400 text-sm mb-6">
              Commencez par créer votre premier certificat.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter un certificat
            </motion.button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">
                    Titre
                  </th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">
                    Prix normal
                  </th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">
                    Prix bourse
                  </th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">
                    Réduction
                  </th>
                  <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {certificates.map((cert, index) => {
                    const discount =
                      cert.price_normal > 0
                        ? Math.round(
                            ((cert.price_normal - cert.price_bourse) / cert.price_normal) * 100
                          )
                        : 0;
                    return (
                      <motion.tr
                        key={cert.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                              <GraduationCap className="w-4 h-4 text-emerald-400" />
                            </div>
                            <span className="text-white font-medium">{cert.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 text-slate-300">
                            <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                            {cert.price_normal.toLocaleString()} FCFA
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 text-slate-300">
                            <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                            {cert.price_bourse.toLocaleString()} FCFA
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border',
                              discount > 0
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-slate-800 text-slate-500 border-slate-700'
                            )}
                          >
                            {discount > 0 && <TrendingDown className="w-3 h-3" />}
                            -{discount}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleEdit(cert)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 rounded-lg text-xs font-medium transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Modifier
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setShowDeleteConfirm(cert.id)}
                              disabled={deletingId === cert.id}
                              className={cn(
                                'inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-lg text-xs font-medium transition-colors',
                                deletingId === cert.id && 'opacity-50 cursor-not-allowed'
                              )}
                            >
                              {deletingId === cert.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                              Supprimer
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

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
                Cette action est irréversible. Le certificat et toutes ses données associées seront
                définitivement supprimés.
              </p>
              <div className="flex gap-3 justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors"
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                >
                  Supprimer définitivement
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Formulaire */}
      {showModal && (
        <CertificateFormModal
          certificate={selectedCert}
          onClose={handleModalClose}
          onSaved={handleSaved}
        />
      )}
    </motion.div>
  );
}