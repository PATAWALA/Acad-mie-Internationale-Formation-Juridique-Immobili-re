import { CheckCircle } from 'lucide-react';

interface RegistrationModalProps {
  studentName: string;
  total: number;
  paymentMethod: string;
  onClose: () => void;
}

export default function RegistrationModal({ studentName, total, paymentMethod, onClose }: RegistrationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-[#D4AF37]/30 rounded-2xl p-8 max-w-md w-full mx-4 text-center">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-2xl font-display text-white mb-2">Inscription validée !</h3>
        <p className="text-gray-400 mb-6">
          Merci <strong className="text-white">{studentName}</strong>. Votre inscription pour{' '}
          <strong className="text-[#D4AF37]">{total.toLocaleString()} FCFA</strong> a bien été
          enregistrée.
        </p>
        {paymentMethod === 'wave' && (
          <p className="text-sm text-gray-500 mb-6">
            Vous allez recevoir une notification Wave pour finaliser votre paiement.
          </p>
        )}
        {paymentMethod === 'bank' && (
          <div className="bg-[#0B0F19] border border-[#1E293B] rounded-xl p-4 mb-6 text-left">
            <p className="text-white text-sm font-medium mb-2">Coordonnées bancaires :</p>
            <p className="text-gray-400 text-xs">Banque : UBA Côte d&apos;Ivoire</p>
            <p className="text-gray-400 text-xs">IBAN : CI93 0101 1000 1234 5678 9012 34</p>
          </div>
        )}
        <button
          onClick={onClose}
          className="w-full py-3 bg-[#D4AF37] text-[#0B0F19] font-semibold rounded-xl hover:bg-[#C5A028] transition"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}