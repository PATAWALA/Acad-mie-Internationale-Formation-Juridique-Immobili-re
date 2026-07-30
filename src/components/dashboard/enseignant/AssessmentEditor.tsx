'use client';

import { useState } from 'react';
import { createClientComponent } from '@/lib/supabase/client';

interface Props {
  assessment: any;
  onUpdate: () => void;
}

export default function AssessmentEditor({ assessment, onUpdate }: Props) {
  const supabase = createClientComponent();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(assessment.title);
  const [description, setDescription] = useState(assessment.description || '');

  const handleSave = async () => {
    const { error } = await supabase
      .from('assessments')
      .update({ title, description })
      .eq('id', assessment.id);
    if (error) alert(error.message);
    else {
      setEditing(false);
      onUpdate();
    }
  };

  const handleDelete = async () => {
    if (!confirm('Supprimer cette évaluation ?')) return;
    const { error } = await supabase.from('assessments').delete().eq('id', assessment.id);
    if (error) alert(error.message);
    else onUpdate();
  };

  return (
    <div style={{ background: '#1e293b', padding: '8px', borderRadius: '4px', marginBottom: '6px', fontSize: '13px' }}>
      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <input value={title} onChange={e => setTitle(e.target.value)} style={{ background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '4px', borderRadius: '4px' }} />
          <textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} style={{ background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '4px', borderRadius: '4px', resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={handleSave} style={{ padding: '2px 8px', background: '#22c55e', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>Enregistrer</button>
            <button onClick={() => setEditing(false)} style={{ padding: '2px 8px', background: '#334155', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>Annuler</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{assessment.title} ({assessment.type}) {assessment.description && <span style={{ color: '#94a3b8' }}>- {assessment.description}</span>}</span>
          <div>
            <button onClick={() => setEditing(true)} style={{ marginRight: '6px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>✏️</button>
            <button onClick={handleDelete} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>🗑️</button>
          </div>
        </div>
      )}
    </div>
  );
}