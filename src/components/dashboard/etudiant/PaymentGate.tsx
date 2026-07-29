
'use client';

import { useState } from 'react';
import { useStudent } from '@/context/StudentContext';

export function PaymentGate() {
  const { profile, updateStatusToPaid } = useStudent();
  const [selectedMethod, setSelectedMethod] = useState<'wave' | 'paypal' | 'bank' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!selectedMethod) return;
    setIsProcessing(true);

    const success = await updateStatusToPaid();
    setIsProcessing(false);

    if (success) {
      alert(`Paiement (${selectedMethod.toUpperCase()}) effectué avec succès !`);
    } else {
      alert('Erreur lors du paiement.');
    }
  };

  return (
    <div style={{ padding: '30px', background: '#0f172a', borderRadius: '12px', border: '1px solid #334155', maxWidth: '600px', margin: '40px auto' }}>
      <h2 style={{ color: '#f59e0b', marginTop: 0 }}>⚠️ Activation du compte requise</h2>
      <p style={{ color: '#94a3b8' }}>
        Bonjour <strong>{profile?.full_name}</strong>, choisissez votre mode de règlement pour débloquer immédiatement vos accès.
      </p>

      {/* Boutons de sélection des méthodes */}
      <div style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
        <button
          onClick={() => setSelectedMethod('wave')}
          style={{ flex: 1, padding: '12px', cursor: 'pointer', background: selectedMethod === 'wave' ? '#1e3a8a' : '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '8px' }}
        >
          🌊 Wave
        </button>

        <button
          onClick={() => setSelectedMethod('paypal')}
          style={{ flex: 1, padding: '12px', cursor: 'pointer', background: selectedMethod === 'paypal' ? '#1e3a8a' : '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '8px' }}
        >
          🅿️ PayPal
        </button>

        <button
          onClick={() => setSelectedMethod('bank')}
          style={{ flex: 1, padding: '12px', cursor: 'pointer', background: selectedMethod === 'bank' ? '#1e3a8a' : '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '8px' }}
        >
          🏦 Virement
        </button>
      </div>

      {selectedMethod && (
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          style={{ width: '100%', padding: '14px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {isProcessing ? 'Traitement en cours...' : `Confirmer le paiement avec ${selectedMethod.toUpperCase()}`}
        </button>
      )}
    </div>
  );
}