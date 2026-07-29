'use client';

export function StudentCertificates({ certificates }: { certificates: any[] }) {
  if (!certificates || certificates.length === 0) return null;

  return (
    <div style={{ background: '#064e3b', border: '1px solid #059669', borderRadius: '12px', padding: '20px', marginBottom: '30px' }}>
      <h2 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#34d399' }}>🎉 Félicitations ! Vos Certificats de Réussite</h2>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {certificates.map((cert) => (
          <a
            key={cert.id}
            href={cert.certificate_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '10px 16px',
              background: '#10b981',
              color: '#fff',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            📜 Télécharger le Certificat PDF
          </a>
        ))}
      </div>
    </div>
  );
}