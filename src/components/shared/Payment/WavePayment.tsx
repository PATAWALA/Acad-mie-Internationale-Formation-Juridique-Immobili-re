'use client';

import { useState } from 'react';
import { useWavePayment } from '@/hooks/useWavePayment';

interface WavePaymentProps {
  amount: number;
  enrollmentId: number;
  onSuccess: (details: any) => void;
  onCancel: () => void;
}

export default function WavePayment({ amount, enrollmentId, onSuccess, onCancel }: WavePaymentProps) {
  const [phone, setPhone] = useState('');
  const { pay, loading, error } = useWavePayment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await pay({ amount, phone, enrollmentId });
      // Si le paiement est immédiatement confirmé (cas rare), on appelle onSuccess
      if (result.status === 'SUCCESS') {
        onSuccess({ amount, method: 'wave', transactionId: result.transactionId });
      } else {
        // Normalement on redirige vers l'URL de paiement Wave
        // window.location.href = result.redirectUrl;
        // Pour l'instant, on simule
        setTimeout(() => {
          onSuccess({ amount, method: 'wave', transactionId: result.transactionId });
        }, 2000);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-white mb-4">Payer avec Wave</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Numéro Wave</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-2 text-white"
            placeholder="01 XX XX XX XX"
            required
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gold-500 text-dark-900 py-2 rounded-xl font-semibold hover:bg-gold-400 transition disabled:opacity-50"
          >
            {loading ? 'Envoi...' : `Payer ${amount} FCFA`}
          </button>
          <button type="button" onClick={onCancel} className="text-gray-400 hover:text-white transition">
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}