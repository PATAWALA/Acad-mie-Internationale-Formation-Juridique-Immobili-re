interface Metrics {
  totalStudents: number;
  totalTeachers: number;
  totalCertificates: number;
  totalPaid: number;
}

export default function MetricsCards({ metrics }: { metrics: Metrics }) {
  const cards = [
    { label: 'Étudiants', value: metrics.totalStudents },
    { label: 'Enseignants', value: metrics.totalTeachers },
    { label: 'Certificats', value: metrics.totalCertificates },
    { label: 'Paiements reçus', value: metrics.totalPaid },
  ];

  return (
    <div className="grid md:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div key={card.label} className="bg-dark-800 border border-dark-700 rounded-2xl p-6">
          <p className="text-3xl font-bold text-white">{card.value}</p>
          <p className="text-gray-400 text-sm mt-2">{card.label}</p>
        </div>
      ))}
    </div>
  );
}