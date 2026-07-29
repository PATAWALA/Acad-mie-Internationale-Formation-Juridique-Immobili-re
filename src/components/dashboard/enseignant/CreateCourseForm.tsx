'use client';

import { useState, useEffect } from 'react';
import { createClientComponent } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function CreateCourseForm() {
  const supabase = createClientComponent();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [certificateId, setCertificateId] = useState<number | ''>('');
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Charger la liste des certificats (formations) disponibles
  useEffect(() => {
    const fetchCertificates = async () => {
      const { data, error } = await supabase
        .from('certificates')
        .select('id, title')
        .order('title');
      if (!error && data) {
        setCertificates(data);
      }
    };
    fetchCertificates();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || certificateId === '') {
      setError('Le titre et le certificat sont obligatoires.');
      return;
    }

    setLoading(true);
    setError('');

    // Récupérer l'utilisateur connecté (enseignant)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Vous devez être connecté.');
      setLoading(false);
      return;
    }

    // Insérer le nouveau cours
    const { error: insertError } = await supabase
      .from('courses')
      .insert({
        title,
        description,
        certificate_id: certificateId,
        created_by: user.id,
        is_published: true, // ou false selon ta logique
      });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    // Réinitialiser et rafraîchir la page
    setTitle('');
    setDescription('');
    setCertificateId('');
    setLoading(false);
    router.refresh(); // recharge les données du serveur
    alert('Cours créé avec succès !');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '500px', margin: '20px 0' }}>
      <h3 style={{ color: '#fff', margin: 0 }}>Créer un nouveau cours</h3>

      {error && (
        <div style={{ background: '#7f1d1d', padding: '8px', borderRadius: '4px', color: '#fca5a5', fontSize: '13px' }}>
          {error}
        </div>
      )}

      <div>
        <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Titre du cours *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Description</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ width: '100%', padding: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Certificat associé *</label>
        <select
          value={certificateId}
          onChange={(e) => setCertificateId(e.target.value === '' ? '' : Number(e.target.value))}
          required
          style={{ width: '100%', padding: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px' }}
        >
          <option value="">-- Sélectionner un certificat --</option>
          {certificates.map((cert) => (
            <option key={cert.id} value={cert.id}>
              {cert.title}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '10px',
          background: '#22c55e',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
      >
        {loading ? 'Création...' : 'Créer le cours'}
      </button>
    </form>
  );
}