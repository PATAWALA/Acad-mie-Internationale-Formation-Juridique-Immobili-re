'use client';

import { useState, useEffect } from 'react';
import { createClientComponent } from '@/lib/supabase/client';

interface CertificateFormModalProps {
  certificate: any | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function CertificateFormModal({ certificate, onClose, onSaved }: CertificateFormModalProps) {
  const supabase = createClientComponent();
  const [title, setTitle] = useState('');
  const [priceNormal, setPriceNormal] = useState<number>(50000);
  const [priceBourse, setPriceBourse] = useState<number>(40000);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!certificate;

  useEffect(() => {
    // Charger tous les enseignants
    supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'TEACHER')
      .order('full_name')
      .then(({ data }) => { if (data) setTeachers(data); });

    if (certificate) {
      setTitle(certificate.title || '');
      setPriceNormal(certificate.price_normal || 0);
      setPriceBourse(certificate.price_bourse || 0);
      // Charger les assignations existantes pour ce certificat
      supabase
        .from('certificate_teachers')
        .select('teacher_id')
        .eq('certificate_id', certificate.id)
        .then(({ data }) => {
          if (data) setSelectedTeachers(data.map((a: any) => a.teacher_id));
        });
    } else {
      setTitle('');
      setPriceNormal(50000);
      setPriceBourse(40000);
      setSelectedTeachers([]);
    }
  }, [certificate]);

  const discountPercent = priceNormal > 0 ? ((priceNormal - priceBourse) / priceNormal) * 100 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Le titre est obligatoire.');
      return;
    }
    setLoading(true);
    setError('');

    // 1. Upsert certificat
    const certPayload = { title, price_normal: priceNormal, price_bourse: priceBourse };
    let certId = certificate?.id;

    if (isEditing) {
      await supabase.from('certificates').update(certPayload).eq('id', certId);
    } else {
      const { data: newCert, error: insertError } = await supabase
        .from('certificates')
        .insert({ ...certPayload, slug: title.toLowerCase().replace(/\s+/g, '-') })
        .select('id')
        .single();
      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }
      certId = newCert?.id;
    }

    // 2. Mettre à jour les assignations enseignants
    if (certId) {
      // Supprimer les anciennes
      await supabase.from('certificate_teachers').delete().eq('certificate_id', certId);
      // Insérer les nouvelles
      if (selectedTeachers.length > 0) {
        const inserts = selectedTeachers.map((teacherId) => ({
          certificate_id: certId,
          teacher_id: teacherId,
        }));
        await supabase.from('certificate_teachers').insert(inserts);
      }
    }

    setLoading(false);
    onSaved();
  };

  const toggleTeacher = (teacherId: string) => {
    setSelectedTeachers((prev) =>
      prev.includes(teacherId) ? prev.filter((id) => id !== teacherId) : [...prev, teacherId]
    );
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '520px', color: '#fff', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ marginTop: 0 }}>{isEditing ? 'Modifier le certificat' : 'Nouveau certificat'}</h3>
        {error && <div style={{ background: '#7f1d1d', padding: '8px', borderRadius: '4px', color: '#fca5a5', fontSize: '13px', marginBottom: '12px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Titre *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required style={inputStyle} />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Prix normal (FCFA)</label>
              <input type="number" min={0} value={priceNormal} onChange={(e) => setPriceNormal(Number(e.target.value))} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Prix bourse (FCFA)</label>
              <input type="number" min={0} value={priceBourse} onChange={(e) => setPriceBourse(Number(e.target.value))} style={inputStyle} />
            </div>
          </div>
          <div style={{ background: '#1e293b', padding: '8px', borderRadius: '4px', fontSize: '13px' }}>
            <span>Réduction : </span>
            <strong style={{ color: '#22c55e' }}>-{Math.round(discountPercent)}%</strong>
            {discountPercent > 0 && <span style={{ color: '#94a3b8' }}> (économisez {priceNormal - priceBourse} FCFA)</span>}
          </div>

          {/* Sélection des enseignants spécialistes */}
          <div>
            <label style={labelStyle}>👨‍🏫 Enseignants assignés (peuvent corriger les TPs de cette formation)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
              {teachers.map((teacher) => (
                <label key={teacher.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedTeachers.includes(teacher.id)}
                    onChange={() => toggleTeacher(teacher.id)}
                  />
                  {teacher.full_name || teacher.email}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', background: '#334155', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Annuler</button>
            <button type="submit" disabled={loading} style={{ padding: '8px 16px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              {loading ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer le certificat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px' };