'use client';

import { useState, useEffect } from 'react';
import { createClientComponent } from '@/lib/supabase/client';
import CertificateFormModal from '@/components/admin/CertificateFormModal';

export default function AdminCertificatsPage() {
  const supabase = createClientComponent();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchCertificates = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('certificates').select('*').order('title');
    if (!error && data) setCertificates(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleEdit = (cert: any) => {
    setSelectedCert(cert);
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedCert(null);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer ce certificat ? Cette action est irréversible.')) return;
    const { error } = await supabase.from('certificates').delete().eq('id', id);
    if (!error) fetchCertificates();
    else alert('Erreur : ' + error.message);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedCert(null);
  };

  const handleSaved = () => {
    handleModalClose();
    fetchCertificates();
  };

  return (
    <div>
      <h1 style={{ fontSize: '22px', marginBottom: '20px' }}>📋 Gestion des Certificats & Réductions</h1>
      <button
        onClick={handleAdd}
        style={{ marginBottom: '20px', padding: '10px 20px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        + Ajouter un certificat
      </button>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Chargement...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Titre</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Prix normal</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Prix bourse</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Réduction</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {certificates.map((cert) => {
              const discount = cert.price_normal > 0
                ? Math.round(((cert.price_normal - cert.price_bourse) / cert.price_normal) * 100)
                : 0;
              return (
                <tr key={cert.id} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '12px' }}>{cert.title}</td>
                  <td style={{ padding: '12px' }}>{cert.price_normal.toLocaleString()} FCFA</td>
                  <td style={{ padding: '12px' }}>{cert.price_bourse.toLocaleString()} FCFA</td>
                  <td style={{ padding: '12px', color: '#22c55e' }}>-{discount}%</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleEdit(cert)}
                      style={{ marginRight: '8px', padding: '6px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(cert.id)}
                      style={{ padding: '6px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {showModal && (
        <CertificateFormModal
          certificate={selectedCert}
          onClose={handleModalClose}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}