'use client';

import { useEffect, useState } from 'react';
import { createClientComponent } from '@/lib/supabase/client';
import CourseEditor from './CourseEditor';

interface Props {
  certId: number;
  profile: any;
}

export default function CourseContentManager({ certId, profile }: Props) {
  const supabase = createClientComponent();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const fetchCourses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('certificate_id', certId)
      .order('created_at', { ascending: false });
    if (!error && data) setCourses(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, [certId]);

  const handleCreateCourse = async () => {
    if (!newTitle.trim()) return;
    const { data, error } = await supabase
      .from('courses')
      .insert({
        title: newTitle,
        description: newDescription,
        certificate_id: certId,
        created_by: profile.id,
        is_published: true,
      })
      .select('*')
      .single();

    if (error) {
      alert('Erreur : ' + error.message);
    } else {
      setNewTitle('');
      setNewDescription('');
      setShowAddForm(false);
      // Créer et ouvrir directement l'éditeur
      setSelectedCourse(data);
      fetchCourses(); // mise à jour de la liste en arrière-plan
    }
  };

  if (selectedCourse) {
    return (
      <CourseEditor
        course={selectedCourse}
        onBack={() => setSelectedCourse(null)}
      />
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px' }}>📚 Cours du certificat</h2>
        <button
          onClick={() => setShowAddForm(true)}
          style={{ padding: '8px 16px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          + Nouveau cours
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Chargement...</p>
      ) : courses.length === 0 && !showAddForm ? (
        <p style={{ color: '#94a3b8' }}>Aucun cours pour ce certificat. Cliquez sur "Nouveau cours" pour commencer.</p>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {courses.map((course) => (
            <div
              key={course.id}
              onClick={() => setSelectedCourse(course)}
              style={{
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                padding: '16px',
                cursor: 'pointer',
              }}
            >
              <h3 style={{ color: '#38bdf8', margin: 0 }}>{course.title}</h3>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
                {course.description || 'Aucune description'}
              </p>
            </div>
          ))}
        </div>
      )}

      {showAddForm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
        }}>
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '24px', width: '400px', color: '#fff' }}>
            <h3>Créer un nouveau cours</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
              <input
                type="text"
                placeholder="Titre du cours"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                style={{ padding: '8px', background: '#1e293b', border: '1px solid #334155', borderRadius: '4px', color: '#fff' }}
              />
              <textarea
                placeholder="Description (optionnelle)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={3}
                style={{ padding: '8px', background: '#1e293b', border: '1px solid #334155', borderRadius: '4px', color: '#fff', resize: 'vertical' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button onClick={() => setShowAddForm(false)} style={{ padding: '8px 16px', background: '#334155', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Annuler</button>
                <button onClick={handleCreateCourse} style={{ padding: '8px 16px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Créer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}