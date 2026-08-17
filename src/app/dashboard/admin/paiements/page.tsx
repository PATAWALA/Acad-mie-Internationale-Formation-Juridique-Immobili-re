'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { fadeIn, stagger } from '@/lib/animations';
import {
  CreditCard,
  Loader2,
  CheckCircle2,
  XCircle,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  User,
  Calendar,
  Clock,
  DollarSign,
} from 'lucide-react';

export default function PaiementsPage() {
  const supabase = createClientComponent();
  const router = useRouter();
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [authorized, setAuthorized] = useState(false);

  // Vérification admin
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'SUPER_ADMIN')) {
        router.push('/dashboard/etudiant');
        return;
      }
      setAuthorized(true);
    };
    checkAuth();
  }, []);

  const fetchPendingPayments = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        id,
        student_id,
        student_name,
        certificate_id,
        certificates(title),
        remaining_balance,
        amount_paid,
        receipt_url,
        created_at
      `)
      .eq('payment_status', 'PENDING')
      .not('receipt_url', 'is', null)
      .order('created_at', { ascending: false });

    if (data) setPendingPayments(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (authorized) fetchPendingPayments();
  }, [authorized, fetchPendingPayments]);

  const handleValidate = async (enrollmentId: number) => {
  if (!confirm('Valider ce paiement ? L\'étudiant aura immédiatement accès à la formation.')) return;
  setProcessingId(enrollmentId);

  const payment = pendingPayments.find(p => p.id === enrollmentId);
  if (!payment) {
    setProcessingId(null);
    return;
  }

  const amount = payment.remaining_balance || 0;

  // 1. Mettre à jour l'enrollment
  const { error: enrollError } = await supabase
    .from('enrollments')
    .update({
      payment_status: 'PAID',
      amount_paid: amount,
      remaining_balance: 0,
    })
    .eq('id', enrollmentId);

  if (enrollError) {
    alert('Erreur enrollment : ' + enrollError.message);
    setProcessingId(null);
    return;
  }

  // 2. Mettre à jour le profil de l'étudiant
  if (payment.student_id) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ status: 'PAID' })
      .eq('id', payment.student_id);

    if (profileError) {
      console.error('Erreur profil:', profileError.message);
    }
  }

  // 3. Notification
  if (payment.student_id) {
    await supabase.from('notifications').insert({
      user_id: payment.student_id,
      title: 'Paiement validé',
      message: 'Votre paiement a été validé. Vous avez maintenant accès à votre formation.',
      type: 'PAYMENT_VALIDATED',
    });
  }

  fetchPendingPayments();
  setProcessingId(null);
};

  const handleReject = async (enrollmentId: number) => {
    if (!confirm('Rejeter cette preuve de paiement ?')) return;
    setProcessingId(enrollmentId);
    // On peut remettre le reçu à null pour forcer l'étudiant à renvoyer
    const { error } = await supabase
      .from('enrollments')
      .update({ receipt_url: null })
      .eq('id', enrollmentId);

    if (error) {
      alert('Erreur : ' + error.message);
    } else {
      await supabase.from('notifications').insert({
        user_id: pendingPayments.find(p => p.id === enrollmentId)?.student_id,
        title: 'Preuve rejetée',
        message: 'Votre preuve de paiement a été rejetée. Veuillez en envoyer une nouvelle.',
        type: 'PAYMENT_REJECTED',
      });
      fetchPendingPayments();
    }
    setProcessingId(null);
  };

  if (!authorized) return null;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={stagger}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeIn} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Paiements en attente</h1>
          <p className="text-slate-400 text-sm mt-1">
            {pendingPayments.length} demande{pendingPayments.length > 1 ? 's' : ''} de validation
          </p>
        </div>
        <button
          onClick={fetchPendingPayments}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm transition-colors"
        >
          <Loader2 className="w-4 h-4" /> Actualiser
        </button>
      </motion.div>

      {/* Liste des paiements */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse">
              <div className="h-5 bg-slate-800 rounded w-1/3 mb-4" />
              <div className="h-4 bg-slate-800 rounded w-1/2 mb-2" />
              <div className="h-24 bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      ) : pendingPayments.length === 0 ? (
        <motion.div
          variants={fadeIn}
          className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl"
        >
          <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold">Aucun paiement en attente</h3>
          <p className="text-slate-400 text-sm">Toutes les preuves ont été traitées.</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {pendingPayments.map((payment) => (
            <motion.div
              key={payment.id}
              variants={fadeIn}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Preuve */}
                <div className="flex-shrink-0 w-full md:w-64">
                  {payment.receipt_url ? (
                    payment.receipt_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <div className="relative h-40 md:h-48 rounded-xl overflow-hidden bg-slate-800">
                        <img
                          src={payment.receipt_url}
                          alt="Preuve de paiement"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <a
                        href={payment.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 h-40 md:h-48 rounded-xl bg-slate-800 text-blue-400 hover:bg-slate-700 transition-colors"
                      >
                        <FileText className="w-6 h-6" />
                        <span className="text-sm">Voir le PDF</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )
                  ) : (
                    <div className="flex items-center justify-center h-40 md:h-48 rounded-xl bg-slate-800 text-slate-500">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                </div>

                {/* Détails */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-bold text-lg">
                        {payment.certificates?.title || 'Formation'}
                      </h3>
                      <p className="text-slate-400 text-sm flex items-center gap-2 mt-1">
                        <User className="w-4 h-4" /> {payment.student_name}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" /> En attente
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Montant à payer</p>
                      <p className="text-white font-semibold">
                        {payment.remaining_balance?.toLocaleString()} FCFA
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Déjà payé</p>
                      <p className="text-white font-semibold">
                        {payment.amount_paid?.toLocaleString()} FCFA
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Date d'envoi</p>
                      <p className="text-white font-semibold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleValidate(payment.id)}
                      disabled={processingId === payment.id}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white text-sm font-medium rounded-xl transition-colors"
                    >
                      {processingId === payment.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Valider
                    </button>
                    <button
                      onClick={() => handleReject(payment.id)}
                      disabled={processingId === payment.id}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-xl border border-red-500/20 transition-colors"
                    >
                      {processingId === payment.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Rejeter
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}