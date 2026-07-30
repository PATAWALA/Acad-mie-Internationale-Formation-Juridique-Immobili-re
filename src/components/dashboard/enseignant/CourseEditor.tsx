'use client';

import { useEffect, useState } from 'react';
import { createClientComponent } from '@/lib/supabase/client';
import ModuleEditor from './ModuleEditor';

interface Props {
  course: any;
  onBack: () => void;
}

export default function CourseEditor({ course, onBack }: Props) {
  const supabase = createClientComponent();
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchModules = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('course_id', course.id)
      .order('week_number', { ascending: true });
    if (!error && data) setModules(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchModules();
  }, [course.id]);

  const handleAddModule = () => {
    const title = prompt('Titre du module (ex: Semaine 1 : Introduction) :');
    if (!title) return;
    const weekNumber = modules.length + 1;
    supabase
      .from('modules')
      .insert({
        course_id: course.id,
        title,
        week_number: weekNumber,
      })
      .then(({ error }) => {
        if (error) alert(error.message);
        else fetchModules();
      });
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Supprimer ce module et tout son contenu ?')) return;
    const { error } = await supabase.from('modules').delete().eq('id', moduleId);
    if (error) alert(error.message);
    else fetchModules();
  };

  return (
    <div>
      <button
        onClick={onBack}
        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginBottom: '16px' }}
      >
        ← Retour aux cours
      </button>
      <h2 style={{ fontSize: '20px', marginBottom: '4px' }}>{course.title}</h2>
      <p style={{ color: '#94a3b8', marginBottom: '20px' }}>{course.description}</p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3>📅 Modules (semaines)</h3>
        <button
          onClick={handleAddModule}
          style={{ padding: '6px 12px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          + Ajouter un module
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Chargement...</p>
      ) : modules.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>Aucun module pour ce cours.</p>
      ) : (
        modules.map((mod) => (
          <div
            key={mod.id}
            style={{
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0 }}>Semaine {mod.week_number} : {mod.title}</h4>
              <button
                onClick={() => handleDeleteModule(mod.id)}
                style={{ background: '#b91c1c', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px' }}
              >
                Supprimer
              </button>
            </div>
            {/* Gestion des leçons et évaluations pour ce module */}
            <ModuleEditor module={mod} onUpdate={fetchModules} />
          </div>
        ))
      )}
    </div>
  );
}