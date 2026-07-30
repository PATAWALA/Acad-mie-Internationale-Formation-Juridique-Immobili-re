'use client';

interface EnseignantSidebarProps {
  assignedCertificates: { id: number; title: string }[];
  selectedCertId: number | 'all';
  currentView: 'dashboard' | 'content';
  onSelectCert: (id: number) => void;
  onShowAll: () => void;
  onManageContent: (certId: number) => void;
  onLogout: () => void;
  profile: any; // nouvelle prop
}

export default function EnseignantSidebar({
  assignedCertificates,
  selectedCertId,
  currentView,
  onSelectCert,
  onShowAll,
  onManageContent,
  onLogout,
  profile,
}: EnseignantSidebarProps) {
  return (
    <aside
      style={{
        width: '260px',
        background: '#0f172a',
        borderRight: '1px solid #1e293b',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      {/* En-tête personnalisé */}
      <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
        👋 Bonjour, {profile?.full_name || 'Enseignant'}
      </div>
      <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px' }}>
        👨‍🏫 Espace professeur
      </div>

      {/* Tableau de bord */}
      <div
        onClick={onShowAll}
        style={{
          padding: '10px 12px',
          borderRadius: '6px',
          background: currentView === 'dashboard' && selectedCertId === 'all' ? '#1e3a8a' : 'transparent',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        📊 Tableau de bord
      </div>

      {/* Liste des certificats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        {assignedCertificates.map((cert) => {
          const isActive =
            currentView === 'dashboard'
              ? selectedCertId === cert.id
              : selectedCertId === cert.id && currentView === 'content';
          return (
            <div key={cert.id} style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                onClick={() => onSelectCert(cert.id)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: isActive ? '#1e3a8a' : 'transparent',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                {cert.title}
              </div>
              {/* Bouton Gérer le contenu, visible seulement si ce certificat est sélectionné */}
              {selectedCertId === cert.id && (
                <button
                  onClick={() => onManageContent(cert.id)}
                  style={{
                    marginLeft: '12px',
                    marginTop: '4px',
                    padding: '4px 10px',
                    background: currentView === 'content' ? '#2563eb' : '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    textAlign: 'left',
                  }}
                >
                  📝 Gérer le contenu
                </button>
              )}
            </div>
          );
        })}
        {assignedCertificates.length === 0 && (
          <div style={{ color: '#94a3b8', fontSize: '13px', padding: '12px', background: '#1e293b', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 8px' }}>📭 Aucune formation ne vous est assignée pour le moment.</p>
            <p style={{ margin: 0, fontSize: '12px' }}>
              Contactez l'administrateur pour qu'il vous associe à une formation.
            </p>
          </div>
        )}
      </div>

      {/* Déconnexion */}
      <div style={{ borderTop: '1px solid #1e293b', paddingTop: '12px', marginTop: 'auto' }}>
        <button
          onClick={onLogout}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '6px 0',
            fontSize: '13px',
            textAlign: 'left',
            width: '100%',
          }}
        >
          🚪 Déconnexion
        </button>
      </div>
    </aside>
  );
}