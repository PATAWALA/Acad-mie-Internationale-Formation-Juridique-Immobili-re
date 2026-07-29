'use client';

import { useState } from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPay: (method: 'wave' | 'paypal' | 'bank') => void;
  amount: number;
  loading: boolean;
}

export default function PaymentModal({ isOpen, onClose, onPay, amount, loading }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'wave' | 'paypal' | 'bank' | null>(null);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
    }}>
      <div style={{
        background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '24px',
        width: '100%', maxWidth: '400px', color: '#fff'
      }}>
        <h3 style={{ marginTop: 0 }}>💳 Paiement</h3>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Montant à payer : <strong>{amount.toLocaleString()} FCFA</strong>
        </p>

        <div style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
          <button
            onClick={() => setSelectedMethod('wave')}
            style={{
              flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #334155',
              background: selectedMethod === 'wave' ? '#1e3a8a' : '#1e293b', color: '#fff', cursor: 'pointer'
            }}
          >
            🌊 Wave
          </button>
          <button
            onClick={() => setSelectedMethod('paypal')}
            style={{
              flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #334155',
              background: selectedMethod === 'paypal' ? '#1e3a8a' : '#1e293b', color: '#fff', cursor: 'pointer'
            }}
          >
            🅿️ PayPal
          </button>
          <button
            onClick={() => setSelectedMethod('bank')}
            style={{
              flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #334155',
              background: selectedMethod === 'bank' ? '#1e3a8a' : '#1e293b', color: '#fff', cursor: 'pointer'
            }}
          >
            🏦 Virement
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 16px', background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Annuler
          </button>
          <button
            disabled={!selectedMethod || loading}
            onClick={() => selectedMethod && onPay(selectedMethod)}
            style={{
              padding: '8px 16px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px',
              fontWeight: 'bold', cursor: 'pointer', opacity: (!selectedMethod || loading) ? 0.5 : 1
            }}
          >
            {loading ? 'Paiement...' : 'Payer'}
          </button>
        </div>
      </div>
    </div>
  );
}