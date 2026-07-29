'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponent } from '@/lib/supabase/client';
import { useStudent } from '@/context/StudentContext';

export default function CataloguePage() {
  const { profile } = useStudent();
  const supabase = createClientComponent();
  const router = useRouter();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: certs } = await supabase.from('certificates').select('*').order('title');
      if (certs) setCertificates(certs);

      if (profile) {
        const { data: enrs } = await supabase.from('enrollments').select('certificate_id, payment_status').eq('student_id', profile.id);
        if (enrs) setEnrollments(enrs);
      }
    };
    fetchData();
  }, [profile]);

  const handleSubscribe = async (certId: number) => {
    if (!profile) return;
    // Vérifier si déjà inscrit
    const already = enrollments.find(e => e.certificate_id === certId);
    if (already) {
      alert('Vous êtes déjà inscrit à cette formation.');
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
      // Rediriger vers la page de paiement ou vers le dashboard
      router.push('/dashboard/etudiant');
    } else {
      alert('Erreur : ' + error.message);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '22px', marginBottom: '20px' }}>📚 Catalogue des formations</h1>
      <div style={{ display: 'grid', gap: '16px' }}>
        {certificates.map(cert => {
          const enrollment = enrollments.find(e => e.certificate_id === cert.id);
          return (
            <div key={cert.id} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, color: '#38bdf8' }}>{cert.title}</h3>
                <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0' }}>
                  Prix bourse : {cert.price_bourse.toLocaleString()} FCFA
                </p>
              </div>
              <div>
                {enrollment ? (
                  <span style={{ background: enrollment.payment_status === 'PAID' ? '#065f46' : '#7c2d12', padding: '6px 12px', borderRadius: '4px', color: '#fff', fontSize: '13px' }}>
                    {enrollment.payment_status === 'PAID' ? 'Payé' : 'En attente de paiement'}
                  </span>
                ) : (
                  <button onClick={() => handleSubscribe(cert.id)} style={{ padding: '8px 16px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
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