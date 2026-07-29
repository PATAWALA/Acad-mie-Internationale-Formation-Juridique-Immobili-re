'use client';

import { useRef } from 'react';

interface CertificateProps {
  studentName: string;
  courseTitle: string;
  issueDate: string;
  certificateId: string;
  onClose: () => void;
}

export function CertificateGenerator({
  studentName,
  courseTitle,
  issueDate,
  certificateId,
  onClose,
}: CertificateProps) {
  const certRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px'
    }}>
      {/* Barre d'action */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
        <button
          onClick={handlePrint}
          style={{ padding: '10px 20px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          🖨️ Imprimer / Sauvegarder en PDF
        </button>
        <button
          onClick={onClose}
          style={{ padding: '10px 20px', background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          Fermer
        </button>
      </div>

      {/* MODÈLE DU CERTIFICAT A4 PAYSAGE */}
      <div
        ref={certRef}
        className="certificate-print-area"
        style={{
          width: '800px',
          height: '560px',
          background: '#ffffff',
          color: '#1e293b',
          padding: '40px',
          borderRadius: '8px',
          border: '12px solid #0f172a',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          textAlign: 'center',
          fontFamily: 'Georgia, serif',
          boxSizing: 'border-box',
          position: 'relative'
        }}
      >
        {/* Filigrane / Bordure intérieure */}
        <div style={{ border: '2px solid #cbd5e1', height: '100%', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
          
          <div>
            <h1 style={{ fontSize: '28px', letterSpacing: '4px', textTransform: 'uppercase', color: '#0f172a', margin: '0 0 8px 0' }}>
              CERTIFICAT DE RÉUSSITE
            </h1>
            <p style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic', margin: 0 }}>
              Ce document atteste que
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '32px', color: '#0284c7', textTransform: 'capitalize', margin: '12px 0', borderBottom: '2px solid #0284c7', display: 'inline-block', paddingBottom: '4px' }}>
              {studentName}
            </h2>
            <p style={{ fontSize: '14px', color: '#334155', margin: '12px 0 0 0' }}>
              a suivi avec succès la formation professionnelle et validé l'ensemble des modules de :
            </p>
            <h3 style={{ fontSize: '20px', color: '#0f172a', marginTop: '8px' }}>
              « {courseTitle} »
            </h3>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '20px', textAlign: 'left' }}>
            <div>
              <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0' }}>Délivré le : <strong>{issueDate}</strong></p>
              <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>ID VÉRIFICATION : {certificateId}</p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '140px', borderBottom: '1px solid #0f172a', marginBottom: '4px' }}></div>
              <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>La Direction / Le Formateur</p>
            </div>
          </div>

        </div>
      </div>

      {/* Style spécifique pour l'impression propre */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .certificate-print-area, .certificate-print-area * {
            visibility: visible;
          }
          .certificate-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            height: 100% !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
}