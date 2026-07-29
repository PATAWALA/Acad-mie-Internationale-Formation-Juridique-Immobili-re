'use client';

import { useState, useEffect } from 'react';
import { createClientComponent } from '@/lib/supabase/client';

interface CourseFormModalProps {
  course: any | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function CourseFormModal({ course, onClose, onSaved }: CourseFormModalProps) {
  const supabase = createClientComponent();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [certificateId, setCertificateId] = useState<number | ''>('');
  const [teacherId, setTeacherId] = useState<string>('');
  const [certificates, setCertificates] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!course;

  useEffect(() => {
    // Charger certificats
    supabase.from('certificates').select('id, title').order('title').then(({ data }) => {
      if (data) setCertificates(data);
    });
    // Charger enseignants
    supabase.from('profiles').select('id, full_name, email').eq('role', 'TEACHER').order('full_name').then(({ data }) => {
      if (data) setTeachers(data);
    });

    if (course) {
      setTitle(course.title || '');
      setDescription(course.description || '');
      setCertificateId(course.certificate_id || '');
      setTeacherId(course.created_by || '');
    }
  }, [course]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || certificateId === '') {
      setError('Titre et certificat obligatoires.');
      return;
    }
    setLoading(true);
    setError('');

    const payload = {
      title,
      description,
      certificate_id: certificateId,
      created_by: teacherId || null,
      is_published: true,
    };

    const { error: submitError } = isEditing
      ? await supabase.from('courses').update(payload).eq('id', course.id)
      : await supabase.from('courses').insert(payload);

    if (submitError) {
      setError(submitError.message);
    } else {
      onSaved();
    }
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '480px', color: '#fff' }}>
        <h3 style={{ marginTop: 0 }}>{isEditing ? 'Modifier le cours' : 'Nouveau cours'}</h3>
        {error && <div style={{ background: '#7f1d1d', padding: '8px', borderRadius: '4px', color: '#fca5a5', marginBottom: '12px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Titre *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: '100%', padding: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Description</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', padding: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px', resize: 'vertical' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Certificat *</label>
            <select value={certificateId} onChange={(e) => setCertificateId(e.target.value === '' ? '' : Number(e.target.value))} required style={{ width: '100%', padding: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px' }}>
              <option value="">-- Sélectionner --</option>
              {certificates.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Enseignant responsable</label>
            <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} style={{ width: '100%', padding: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px' }}>
              <option value="">-- Aucun --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.full_name || t.email}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', background: '#334155', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Annuler</button>
            <button type="submit" disabled={loading} style={{ padding: '8px 16px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              {loading ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}