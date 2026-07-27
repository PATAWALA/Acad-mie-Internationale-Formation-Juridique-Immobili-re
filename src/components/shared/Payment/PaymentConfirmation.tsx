'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponent } from '@/lib/supabase/client';
import WavePayment from './WavePayment';
import BankTransfer from './BankTransfer';
import PayPalPayment from './PayPalPayment';
import { generateReceipt } from './ReceiptGenerator';
import AlertMessage from '@/components/shared/Feedback/AlertMessage';

interface PaymentFlowProps {
  enrollmentId: number;
  studentName: string;
  certificateTitle: string;
  amountDue: number;
}

export default function PaymentFlow({
  enrollmentId,
  studentName,
  certificateTitle,
  amountDue,
}: PaymentFlowProps) {
  const [method, setMethod] = useState<'wave' | 'bank' | 'paypal' | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'pending' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();
  const supabase = createClientComponent();

  const handlePaymentSuccess = async (paymentDetails: any) => {
    setStatus('processing');
    try {
      const receiptUrl = await generateReceipt({
        studentName,
        certificateTitle,
        amountPaid: paymentDetails.amount,
        remaining: amountDue - paymentDetails.amount,
        date: new Date().toISOString(),
      });

      const { error } = await supabase
        .from('enrollments')
        .update({
          payment_status: 'PAID' as const,
          amount_paid: paymentDetails.amount,
          remaining_balance: amountDue - paymentDetails.amount,
          receipt_url: receiptUrl,
        })
        .eq('id', enrollmentId);

      if (error) throw new Error(error.message);

      setStatus('success');
      setTimeout(() => {
        router.push('/dashboard/etudiant');
      }, 2000);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  };

  const handlePendingPayment = async () => {
    setStatus('pending');
    router.push('/dashboard/etudiant?status=pending');
  };

  return (
    <div className="max-w-lg mx-auto bg-dark-800 border border-dark-700 rounded-2xl p-8">
      {status === 'idle' && (
        <>
          <h2 className="text-2xl font-display text-white mb-6">Choisissez votre mode de paiement</h2>
          <div className="space-y-4">
            <button onClick={() => setMethod('wave')} className="w-full p-4 bg-dark-700 border border-dark-600 rounded-xl hover:border-gold-400/30 transition">
              <span className="text-white font-medium">Wave Mobile Money</span>
            </button>
            <button onClick={() => setMethod('bank')} className="w-full p-4 bg-dark-700 border border-dark-600 rounded-xl hover:border-gold-400/30 transition">
              <span className="text-white font-medium">Virement Bancaire</span>
            </button>
            <button onClick={() => setMethod('paypal')} className="w-full p-4 bg-dark-700 border border-dark-600 rounded-xl hover:border-gold-400/30 transition">
              <span className="text-white font-medium">PayPal / Autre</span>
            </button>
          </div>
        </>
      )}

      {status === 'processing' && (
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 mt-4">Traitement de votre paiement...</p>
        </div>
      )}

      {status === 'success' && <AlertMessage type="success" message="Paiement validé ! Redirection..." />}
      {status === 'error' && <AlertMessage type="error" message={errorMsg} />}

      {method === 'wave' && (
        <WavePayment
          amount={amountDue}
          enrollmentId={enrollmentId}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setMethod(null)}
        />
      )}
      {method === 'bank' && (
        <BankTransfer
          amount={amountDue}
          enrollmentId={enrollmentId}
          onConfirm={handlePendingPayment}
          onCancel={() => setMethod(null)}
        />
      )}
      {method === 'paypal' && (
        <PayPalPayment
          amount={amountDue}
          enrollmentId={enrollmentId}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setMethod(null)}
        />
      )}
    </div>
  );
}