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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!certificate;

  useEffect(() => {
    if (certificate) {
      setTitle(certificate.title || '');
      setPriceNormal(certificate.price_normal || 0);
      setPriceBourse(certificate.price_bourse || 0);
    } else {
      setTitle('');
      setPriceNormal(50000);
      setPriceBourse(40000);
    }
  }, [certificate]);

  // Calcul du pourcentage de réduction
  const discountPercent = priceNormal > 0 ? ((priceNormal - priceBourse) / priceNormal) * 100 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Le titre est obligatoire.');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      title,
      price_normal: priceNormal,
      price_bourse: priceBourse,
    };

    let result;
    if (isEditing) {
      result = await supabase.from('certificates').update(payload).eq('id', certificate.id);
    } else {
      result = await supabase.from('certificates').insert({ ...payload, slug: title.toLowerCase().replace(/\s+/g, '-') });
    }

    if (result.error) {
      setError(result.error.message);
    } else {
      onSaved();
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
    }}>
      <div style={{
        background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '24px',
        width: '100%', maxWidth: '480px', color: '#fff'
      }}>
        <h3 style={{ marginTop: 0 }}>{isEditing ? 'Modifier le certificat' : 'Nouveau certificat'}</h3>
        {error && <div style={{ background: '#7f1d1d', padding: '8px', borderRadius: '4px', color: '#fca5a5', fontSize: '13px', marginBottom: '12px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Titre</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Prix normal (FCFA)</label>
            <input
              type="number"
              min={0}
              value={priceNormal}
              onChange={(e) => setPriceNormal(Number(e.target.value))}
              style={{ width: '100%', padding: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Prix bourse (FCFA)</label>
            <input
              type="number"
              min={0}
              value={priceBourse}
              onChange={(e) => setPriceBourse(Number(e.target.value))}
              style={{ width: '100%', padding: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px' }}
            />
          </div>

          <div style={{ background: '#1e293b', padding: '8px', borderRadius: '4px', fontSize: '13px' }}>
            <span>Réduction appliquée : </span>
            <strong style={{ color: '#22c55e' }}>-{Math.round(discountPercent)}%</strong>
            {discountPercent > 0 && <span style={{ color: '#94a3b8' }}> (économisez {priceNormal - priceBourse} FCFA)</span>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', background: '#334155', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Annuler
            </button>
            <button type="submit" disabled={loading} style={{ padding: '8px 16px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              {loading ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}