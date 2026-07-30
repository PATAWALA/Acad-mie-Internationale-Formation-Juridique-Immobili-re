'use client';

import { useState } from 'react';
import { createClientComponent } from '@/lib/supabase/client';

interface Props {
  lesson: any;
  onUpdate: () => void;
}

export default function LessonEditor({ lesson, onUpdate }: Props) {
  const supabase = createClientComponent();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const [contentUrl, setContentUrl] = useState(lesson.content_url || '');

  const handleSave = async () => {
    const { error } = await supabase
      .from('lessons')
      .update({ title, content_url: contentUrl || null })
      .eq('id', lesson.id);
    if (error) alert(error.message);
    else {
      setEditing(false);
      onUpdate();
    }
  };

  const handleDelete = async () => {
    if (!confirm('Supprimer cette leçon ?')) return;
    const { error } = await supabase.from('lessons').delete().eq('id', lesson.id);
    if (error) alert(error.message);
    else onUpdate();
  };

  return (
    <div style={{ background: '#1e293b', padding: '8px', borderRadius: '4px', marginBottom: '6px', fontSize: '13px' }}>
      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <input value={title} onChange={e => setTitle(e.target.value)} style={{ background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '4px', borderRadius: '4px' }} />
          {(lesson.content_type === 'VIDEO' || lesson.content_type === 'PDF' || lesson.content_type === 'LINK') && (
            <input value={contentUrl} onChange={e => setContentUrl(e.target.value)} placeholder="URL du contenu" style={{ background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '4px', borderRadius: '4px' }} />
          )}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={handleSave} style={{ padding: '2px 8px', background: '#22c55e', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>Enregistrer</button>
            <button onClick={() => setEditing(false)} style={{ padding: '2px 8px', background: '#334155', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>Annuler</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{lesson.title} ({lesson.content_type}) {lesson.content_url && <a href={lesson.content_url} target="_blank" style={{ color: '#38bdf8', marginLeft: '8px' }}>Voir</a>}</span>
          <div>
            <button onClick={() => setEditing(true)} style={{ marginRight: '6px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>✏️</button>
            <button onClick={handleDelete} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>🗑️</button>
          </div>
        </div>
      )}
    </div>
  );
}