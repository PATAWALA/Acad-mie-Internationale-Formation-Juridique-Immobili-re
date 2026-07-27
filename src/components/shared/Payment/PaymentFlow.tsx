'use client';

interface PayPalPaymentProps {
  amount: number;
  enrollmentId: number;
  onSuccess: (details: { amount: number; method: string }) => void;
  onCancel: () => void;
}

export default function PayPalPayment({ amount, enrollmentId, onSuccess, onCancel }: PayPalPaymentProps) {
  const handlePayPal = () => {
    // Simulation
    onSuccess({ amount, method: 'paypal' });
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-white mb-4">PayPal / Autre</h3>
      <p className="text-gray-400 mb-6">Paiement sécurisé via PayPal (simulation).</p>
      <div className="flex gap-4">
        <button onClick={handlePayPal} className="flex-1 bg-gold-500 text-dark-900 py-2 rounded-xl font-semibold">
          Payer {amount} FCFA avec PayPal
        </button>
        <button onClick={onCancel} className="text-gray-400 hover:text-white transition">
          Annuler
        </button>
      </div>
    </div>
  );
}