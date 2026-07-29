'use client';

interface SidebarProps {
  enrollments: any[];
  selectedCertId: number | null;
  onSelectFormation: (certId: number) => void;
  onAddFormation: () => void;
  onGoHome: () => void;
  onGoSupport: () => void;
  onGoProfil: () => void;
  onPayClick: (enrollmentId: number, amount: number) => void;
  onLogout: () => void;
}

export default function Sidebar({
  enrollments,
  selectedCertId,
  onSelectFormation,
  onAddFormation,
  onGoHome,
  onGoProfil,
  onPayClick,
  onGoSupport,
  onLogout,
}: SidebarProps) {
  return (
    <aside style={{
      width: '260px',
      background: '#0f172a',
      borderRight: '1px solid #1e293b',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      minHeight: '100vh',
      boxSizing: 'border-box'
    }}>
      <div
        onClick={onGoHome}
        style={{ fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', marginBottom: '12px' }}
      >
        🎓 MaPlateforme
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        {enrollments.map((enr) => {
          const isActive = selectedCertId === enr.certificate_id;
          return (
            <div key={enr.id} style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                onClick={() => onSelectFormation(enr.certificate_id)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: isActive ? '#1e3a8a' : 'transparent',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '14px',
                  userSelect: 'none'
                }}
              >
                <span>{enr.certificates?.title || `Certificat #${enr.certificate_id}`}</span>
                <span style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  background: enr.payment_status === 'PAID' ? '#065f46' : '#7c2d12',
                  color: enr.payment_status === 'PAID' ? '#a7f3d0' : '#fed7aa'
                }}>
                  {enr.payment_status === 'PAID' ? 'Payé' : 'En attente'}
                </span>
              </div>
              {enr.payment_status !== 'PAID' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPayClick(enr.id, enr.remaining_balance || 0);
                  }}
                  style={{
                    marginLeft: '12px',
                    marginTop: '6px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    background: '#ea580c',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    outline: 'none'
                  }}
                >
                  Payer maintenant
                </button>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={onAddFormation}
        style={{
          padding: '10px 12px',
          background: '#1e293b',
          border: '1px dashed #334155',
          borderRadius: '6px',
          color: '#94a3b8',
          textAlign: 'center',
          cursor: 'pointer',
          fontSize: '13px',
          outline: 'none'
        }}
      >
        + Ajouter une formation
      </button>

      <div style={{ borderTop: '1px solid #1e293b', paddingTop: '12px' }}>
        <button onClick={onGoProfil} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px 0', fontSize: '13px', textAlign: 'left', width: '100%', outline: 'none' }}>
          👤 Mon profil
        </button>
        <button onClick={onGoSupport} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px 0', fontSize: '13px', textAlign: 'left', width: '100%', outline: 'none' }}>
          ❓ Support
        </button>
        <button onClick={onLogout} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px 0', fontSize: '13px', textAlign: 'left', width: '100%', outline: 'none' }}>
          🚪 Déconnexion
        </button>
      </div>
    </aside>
  );
}