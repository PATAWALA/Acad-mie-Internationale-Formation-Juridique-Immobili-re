'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponent } from '@/lib/supabase/client';
import WavePayment from '@/components/shared/Payment/WavePayment';
import BankTransfer from '@/components/shared/Payment/BankTransfer';
import { generateReceipt } from '@/components/shared/Payment/ReceiptGenerator';

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const enrollmentId = searchParams.get('enrollment_id');
  const supabase = createClientComponent();

  const [enrollment, setEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'wave' | 'bank' | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!enrollmentId) {
      router.push('/');
      return;
    }

    const fetchEnrollment = async () => {
      const { data } = await supabase
        .from('enrollments')
        .select('*, certificates(*)')
        .eq('id', enrollmentId)
        .single();
      setEnrollment(data);
      setLoading(false);
    };

    fetchEnrollment();
  }, [enrollmentId]);

  const handlePaymentSuccess = async (details: any) => {
    if (!enrollment) return;
    setLoading(true);

    // Générer la quittance PDF
    const receipt = await generateReceipt({
      studentName: enrollment.student_name,
      certificateTitle: enrollment.certificates?.title || 'Certificat',
      amountPaid: details.amount || enrollment.remaining_balance,
      remaining: 0,
      date: new Date().toISOString(),
    });

    // Mettre à jour l'enrollment dans Supabase
    await supabase
      .from('enrollments')
      .update({
        payment_status: 'PAID',
        amount_paid: enrollment.remaining_balance,
        remaining_balance: 0,
        receipt_url: receipt,
      })
      .eq('id', enrollment.id);

    setReceiptUrl(receipt);
    setLoading(false);
  };

  const handlePendingPayment = () => {
    // L'étudiant a choisi le virement, on redirige vers une page d'attente
    router.push('/dashboard/etudiant?status=pending');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19]">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (receiptUrl) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[#0B0F19] px-4">
        <div className="max-w-md w-full bg-[#0f172a] border border-[#1E293B] rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-display text-white mb-2">Paiement validé !</h2>
          <p className="text-gray-400 mb-6">Votre quittance a été générée avec succès.</p>
          <a
            href={receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-[#0B0F19] rounded-xl font-semibold hover:bg-[#C5A028] transition mb-4"
          >
            📄 Télécharger la quittance
          </a>
          <p className="text-gray-500 text-sm">Redirection vers votre espace dans 5 secondes...</p>
        </div>
      </section>
    );
  }

  if (!paymentMethod) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[#0B0F19] px-4">
        <div className="max-w-md w-full bg-[#0f172a] border border-[#1E293B] rounded-2xl p-8">
          <h2 className="text-2xl font-display text-white mb-6">Choisissez votre mode de paiement</h2>
          <div className="space-y-4">
            <button
              onClick={() => setPaymentMethod('wave')}
              className="w-full p-4 bg-[#0B0F19] border border-[#1E293B] rounded-xl hover:border-[#D4AF37]/30 transition text-left"
            >
              <p className="text-white font-medium">Wave Mobile Money</p>
              <p className="text-sm text-gray-400 mt-1">Paiement instantané</p>
            </button>
            <button
              onClick={() => setPaymentMethod('bank')}
              className="w-full p-4 bg-[#0B0F19] border border-[#1E293B] rounded-xl hover:border-[#D4AF37]/30 transition text-left"
            >
              <p className="text-white font-medium">Virement Bancaire</p>
              <p className="text-sm text-gray-400 mt-1">Validation sous 24h</p>
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (paymentMethod === 'wave' && enrollment) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[#0B0F19] px-4">
        <div className="max-w-md w-full bg-[#0f172a] border border-[#1E293B] rounded-2xl p-8">
          <WavePayment
            amount={enrollment.remaining_balance}
            enrollmentId={enrollment.id}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setPaymentMethod(null)}
          />
        </div>
      </section>
    );
  }

  if (paymentMethod === 'bank' && enrollment) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[#0B0F19] px-4">
        <div className="max-w-md w-full bg-[#0f172a] border border-[#1E293B] rounded-2xl p-8">
          <BankTransfer
            amount={enrollment.remaining_balance}
            enrollmentId={enrollment.id}
            onConfirm={handlePendingPayment}
            onCancel={() => setPaymentMethod(null)}
          />
        </div>
      </section>
    );
  }

  return null;
}