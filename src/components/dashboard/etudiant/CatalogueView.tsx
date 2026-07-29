'use client';

import { useEffect, useState } from 'react';
import { createClientComponent } from '@/lib/supabase/client';

interface CatalogueViewProps {
  profile: any;
  enrollments: any[];
  onNavigateFormation: (certId: number) => void;
  onRefresh: () => void;
}

export default function CatalogueView({ profile, enrollments, onNavigateFormation, onRefresh }: CatalogueViewProps) {
  const supabase = createClientComponent();
  const [certificates, setCertificates] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from('certificates')
      .select('*')
      .order('title')
      .then(({ data }) => { if (data) setCertificates(data); });
  }, []);

  const handleSubscribe = async (certId: number) => {
    if (!profile) return;
    const already = enrollments.find(e => e.certificate_id === certId);
    if (already) {
      // Si déjà en attente, proposer d'aller à la vue de la formation (où il pourra payer)
      onNavigateFormation(certId);
      return;
    }

    const { error } = await supabase.from('enrollments').insert({
      student_id: profile.id,
      student_name: profile.full_name || profile.email,
      certificate_id: certId,
      phone: profile.phone || '',
      email: profile.email,
      amount_paid: 0,
      remaining_balance: certificates.find(c => c.id === certId)?.price_bourse || 0,
      payment_status: 'PENDING',
    });

    if (!error) {
      onRefresh(); // recharge la sidebar
      onNavigateFormation(certId); // va directement à la vue de la formation
    } else {
      alert('Erreur : ' + error.message);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '22px', marginBottom: '20px' }}>📚 Catalogue des formations</h2>
      <div style={{ display: 'grid', gap: '16px' }}>
        {certificates.map(cert => {
          const enr = enrollments.find(e => e.certificate_id === cert.id);
          const isPaid = enr?.payment_status === 'PAID';
          const isPending = enr && !isPaid;
          return (
            <div key={cert.id} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, color: '#38bdf8' }}>{cert.title}</h3>
                <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0' }}>
                  {cert.price_bourse.toLocaleString()} FCFA (bourse)
                </p>
              </div>
              <div>
                {isPaid ? (
                  <button
                    onClick={() => onNavigateFormation(cert.id)}
                    style={{ padding: '8px 16px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Accéder
                  </button>
                ) : isPending ? (
                  <button
                    onClick={() => onNavigateFormation(cert.id)}
                    style={{ padding: '8px 16px', background: '#ea580c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Payer
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(cert.id)}
                    style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    S'inscrire
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}