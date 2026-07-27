
interface BankTransferProps {
  amount: number;
  enrollmentId: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function BankTransfer({ amount, onConfirm, onCancel }: BankTransferProps) {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-white mb-4">Virement Bancaire</h3>
      <p className="text-gray-400 mb-4">
        Veuillez effectuer un virement de <strong>{amount} FCFA</strong> sur le compte suivant :
      </p>
      <div className="bg-dark-900 p-4 rounded-xl mb-4">
        <p className="text-white">Banque : UBA Côte d'Ivoire</p>
        <p className="text-white">IBAN : CI93 0101 1000 1234 5678 9012 34</p>
        <p className="text-white">BIC : UNABCIAB</p>
      </div>
      <p className="text-gray-400 text-sm mb-6">
        Après validation par l'administration, vous recevrez votre quittance.
      </p>
      <div className="flex gap-4">
        <button onClick={onConfirm} className="flex-1 bg-gold-500 text-dark-900 py-2 rounded-xl font-semibold">
          J'ai effectué le virement
        </button>
        <button onClick={onCancel} className="text-gray-400 hover:text-white transition">
          Annuler
        </button>
      </div>
    </div>
  );
}