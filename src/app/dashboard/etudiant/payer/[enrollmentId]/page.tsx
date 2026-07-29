'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClientComponent } from '@/lib/supabase/client';

export default function PayerEnrollmentPage() {
  const params = useParams();
  const enrollmentId = Number(params.enrollmentId);
  const supabase = createClientComponent();
  const router = useRouter();
  const [enrollment, setEnrollment] = useState<any>(null);
  const [method, setMethod] = useState<'wave' | 'paypal' | 'bank' | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEnrollment = async () => {
      const { data } = await supabase.from('enrollments').select('*').eq('id', enrollmentId).single();
      if (data) setEnrollment(data);
    };
    fetchEnrollment();
  }, [enrollmentId]);

  const handlePay = async () => {
    if (!method || !enrollment) return;
    setLoading(true);

    // Simulation du paiement
    const { error } = await supabase
      .from('enrollments')
      .update({
        payment_status: 'PAID',
        amount_paid: enrollment.remaining_balance,
        // Remaining balance devient 0
        remaining_balance: 0,
      })
      .eq('id', enrollmentId);

    if (!error) {
      alert(`Paiement par ${method.toUpperCase()} réussi !`);
      router.push('/dashboard/etudiant');
    } else {
      alert('Erreur : ' + error.message);
    }
    setLoading(false);
  };

  if (!enrollment) return <div style={{ color: '#fff', padding: '32px' }}>Chargement...</div>;

  return (
    <div style={{ padding: '40px', maxWidth: '500px', margin: '0 auto', color: '#fff' }}>
      <h1>Paiement pour la formation</h1>
      <p style={{ color: '#94a3b8' }}>Montant à payer : {enrollment.remaining_balance.toLocaleString()} FCFA</p>

      <div style={{ display: 'flex', gap: '12px', margin: '24px 0' }}>
        <button onClick={() => setMethod('wave')} style={{ flex: 1, padding: '12px', background: method === 'wave' ? '#1e3a8a' : '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer' }}>
          🌊 Wave
        </button>
        <button onClick={() => setMethod('paypal')} style={{ flex: 1, padding: '12px', background: method === 'paypal' ? '#1e3a8a' : '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer' }}>
          🅿️ PayPal
        </button>
        <button onClick={() => setMethod('bank')} style={{ flex: 1, padding: '12px', background: method === 'bank' ? '#1e3a8a' : '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer' }}>
          🏦 Virement
        </button>
      </div>

      {method && (
        <button onClick={handlePay} disabled={loading} style={{ width: '100%', padding: '14px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          {loading ? 'Traitement...' : 'Confirmer le paiement'}
        </button>
      )}
    </div>
  );
}