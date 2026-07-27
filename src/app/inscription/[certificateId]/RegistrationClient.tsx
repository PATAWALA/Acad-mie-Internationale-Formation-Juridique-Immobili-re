'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponent } from '@/lib/supabase/client';
import PaymentFlow from '@/components/shared/Payment/PaymentFlow';

export default function RegistrationClient({ certificate }: { certificate: any }) {
  const [step, setStep] = useState<'form' | 'payment'>('form');
  const [studentName, setStudentName] = useState('');
  const [phone, setPhone] = useState('');
  const [enrollmentId, setEnrollmentId] = useState<number | null>(null);
  const supabase = createClientComponent();
  const router = useRouter();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Créer l'enrôlement dans Supabase
    const { data, error } = await supabase
      .from('enrollments')
      .insert({
        student_name: studentName,
        certificate_id: certificate.id,
        amount_paid: 0,
        remaining_balance: certificate.price_normal,
        payment_status: 'PENDING',
      })
      .select()
      .single();

    if (data) {
      setEnrollmentId(data.id);
      setStep('payment');
    }
  };

  return (
    <section className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      {step === 'form' && (
        <form onSubmit={handleFormSubmit} className="max-w-md w-full bg-dark-800 p-8 rounded-2xl space-y-4">
          <h1 className="text-2xl font-display text-white">Inscription – {certificate.title}</h1>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Nom complet"
            className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-2 text-white"
            required
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Téléphone Wave"
            className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-2 text-white"
            required
          />
          <button type="submit" className="w-full bg-gold-500 text-dark-900 py-3 rounded-xl font-semibold">
            Continuer vers le paiement
          </button>
        </form>
      )}

      {step === 'payment' && enrollmentId && (
        <PaymentFlow
          enrollmentId={enrollmentId}
          studentName={studentName}
          certificateTitle={certificate.title}
          amountDue={certificate.price_normal}
        />
      )}
    </section>
  );
}