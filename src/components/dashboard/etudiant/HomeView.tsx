interface HomeViewProps {
  enrollments: any[];
  profile: any;
}

export default function HomeView({ enrollments, profile }: HomeViewProps) {
  const paid = enrollments.filter(e => e.payment_status === 'PAID');
  const pending = enrollments.filter(e => e.payment_status !== 'PAID');
  return (
    <div>
      <h1 style={{ fontSize: '24px', marginBottom: '24px' }}>
        👋 Bonjour, {profile.full_name || profile.email}
      </h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '20px' }}>
          <p style={{ color: '#94a3b8', fontSize: '13px' }}>Formations actives</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0 0' }}>{paid.length}</p>
        </div>
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '20px' }}>
          <p style={{ color: '#94a3b8', fontSize: '13px' }}>En attente de paiement</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0 0', color: '#f59e0b' }}>{pending.length}</p>
        </div>
        {/* Ajoutez d'autres KPIs si besoin (certificats obtenus, etc.) */}
      </div>
      <p style={{ color: '#94a3b8' }}>
        Sélectionnez une formation dans la barre latérale pour voir son contenu, ou ajoutez-en une nouvelle.
      </p>
    </div>
  );
}