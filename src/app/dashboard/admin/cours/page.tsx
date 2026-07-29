'use client';

import { useState, useEffect } from 'react';
import { createClientComponent } from '@/lib/supabase/client';
import CourseFormModal from '@/components/dashboard/admin/CourseFormModal';

export default function AdminCoursesPage() {
  const supabase = createClientComponent();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('courses')
      .select('*, certificate:certificate_id(title), teacher:created_by(full_name, email)')
      .order('created_at', { ascending: false });
    if (!error && data) setCourses(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleAdd = () => {
    setSelectedCourse(null);
    setShowModal(true);
  };

  const handleEdit = (course: any) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce cours et tous ses modules ?')) return;
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (!error) fetchCourses();
    else alert('Erreur : ' + error.message);
  };

  const handleSaved = () => {
    setShowModal(false);
    fetchCourses();
  };

  return (
    <div>
      <h1 style={{ fontSize: '22px', marginBottom: '20px' }}>📚 Gestion des Cours</h1>
      <button
        onClick={handleAdd}
        style={{ marginBottom: '20px', padding: '10px 20px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        + Ajouter un cours
      </button>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Chargement...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Titre</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Certificat</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Enseignant</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id} style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '12px' }}>{course.title}</td>
                <td style={{ padding: '12px', color: '#38bdf8' }}>{course.certificate?.title || 'N/A'}</td>
                <td style={{ padding: '12px' }}>{course.teacher?.full_name || 'Non assigné'}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <button
                    onClick={() => handleEdit(course)}
                    style={{ marginRight: '8px', padding: '6px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
                    style={{ padding: '6px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <CourseFormModal
          course={selectedCourse}
          onClose={() => setShowModal(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}