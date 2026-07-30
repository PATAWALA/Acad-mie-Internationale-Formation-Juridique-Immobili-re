'use client';

import { useState, useEffect } from 'react';
import { createClientComponent } from '@/lib/supabase/client';

export default function AdminAssignationsPage() {
  const supabase = createClientComponent();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedCert, setSelectedCert] = useState<number | ''>('');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchAssignments = async () => {
    const { data, error } = await supabase
      .from('certificate_teachers')
      .select('id, certificate_id, teacher_id, certificates(title), profiles!teacher_id(full_name, email)');
    if (data) setAssignments(data);
  };

  useEffect(() => {
    const loadData = async () => {
      const { data: certs } = await supabase.from('certificates').select('id, title').order('title');
      const { data: teachs } = await supabase.from('profiles').select('id, full_name, email').eq('role', 'TEACHER').order('full_name');
      if (certs) setCertificates(certs);
      if (teachs) setTeachers(teachs);
      await fetchAssignments();
      setLoading(false);
    };
    loadData();
  }, []);

  const handleAssign = async () => {
    if (!selectedCert || !selectedTeacher) return;
    const { error } = await supabase.from('certificate_teachers').insert({
      certificate_id: selectedCert,
      teacher_id: selectedTeacher,
    });
    if (error) {
      alert('Erreur : ' + error.message);
    } else {
      setSelectedCert('');
      setSelectedTeacher('');
      fetchAssignments();
    }
  };

  const handleRemove = async (id: number) => {
    const { error } = await supabase.from('certificate_teachers').delete().eq('id', id);
    if (!error) fetchAssignments();
    else alert('Erreur : ' + error.message);
  };

  if (loading) return <p style={{ color: '#fff' }}>Chargement...</p>;

  return (
    <div>
      <h1 style={{ fontSize: '22px', marginBottom: '20px' }}>🔧 Assignation des enseignants aux certificats</h1>

      <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Certificat</label>
            <select value={selectedCert} onChange={(e) => setSelectedCert(Number(e.target.value))} style={{ padding: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px', minWidth: '220px' }}>
              <option value="">-- Sélectionner --</option>
              {certificates.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Enseignant</label>
            <select value={selectedTeacher} onChange={(e) => setSelectedTeacher(e.target.value)} style={{ padding: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px', minWidth: '220px' }}>
              <option value="">-- Sélectionner --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.full_name || t.email}</option>
              ))}
            </select>
          </div>
          <button onClick={handleAssign} style={{ padding: '8px 16px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            ➕ Assigner
          </button>
        </div>
      </div>

      <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>📋 Assignations existantes</h2>
      {assignments.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>Aucune assignation pour le moment.</p>
      ) : (
        assignments.map((a) => (
          <div key={a.id} style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '12px', borderRadius: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ color: '#38bdf8' }}>{a.certificates?.title}</strong> — <span style={{ color: '#cbd5e1' }}>{a.profiles?.full_name} ({a.profiles?.email})</span>
            </div>
            <button onClick={() => handleRemove(a.id)} style={{ padding: '4px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Retirer
            </button>
          </div>
        ))
      )}
    </div>
  );
}