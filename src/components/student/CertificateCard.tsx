interface CertificateCardProps {
  enrollment: any;
  isActive: boolean;
  onClick: () => void;
}

export default function CertificateCard({ enrollment, isActive, onClick }: CertificateCardProps) {
  const cert = enrollment.certificates;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 ${
        isActive
          ? 'bg-dark-700 border-gold-400/40 shadow-lg shadow-gold-500/10'
          : 'bg-dark-800 border-dark-600 hover:border-dark-500'
      }`}
    >
      <h3 className="text-white font-semibold">{cert.title}</h3>
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-gray-400">
          Semaine {Math.min(enrollment.current_week || 1, 4)}/4
        </span>
        {enrollment.payment_status === 'PAID' && (
          <span className="text-xs text-green-400">Actif</span>
        )}
      </div>
    </button>
  );
}