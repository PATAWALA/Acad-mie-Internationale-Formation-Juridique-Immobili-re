'use client';

import { useEffect, useState } from 'react';
import { createClientComponent } from '@/lib/supabase/client';
import LessonEditor from './LessonEditor';
import AssessmentEditor from './AssessmentEditor';

interface Props {
  module: any;
  onUpdate: () => void;
}

export default function ModuleEditor({ module, onUpdate }: Props) {
  const supabase = createClientComponent();
  const [lessons, setLessons] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);

  const fetchData = async () => {
    const { data: l } = await supabase
      .from('lessons')
      .select('*')
      .eq('module_id', module.id)
      .order('position', { ascending: true });
    if (l) setLessons(l);

    const { data: a } = await supabase
      .from('assessments')
      .select('*')
      .eq('module_id', module.id);
    if (a) setAssessments(a);
  };

  useEffect(() => {
    fetchData();
  }, [module.id]);

  const handleAddLesson = async (type: string) => {
    const title = prompt('Titre de la leçon :');
    if (!title) return;
    const { error } = await supabase.from('lessons').insert({
      module_id: module.id,
      title,
      content_type: type,
      position: lessons.length + 1,
    });
    if (error) alert(error.message);
    else fetchData();
  };

  const handleAddAssessment = async () => {
    const title = prompt("Titre de l'évaluation (ex: TP semaine 1) :");
    if (!title) return;
    const type = prompt('Type (TP ou EXAM) :', 'TP');
    const { error } = await supabase.from('assessments').insert({
      module_id: module.id,
      course_id: module.course_id,
      title,
      type: type?.toUpperCase() === 'EXAM' ? 'EXAM' : 'TP',
    });
    if (error) alert(error.message);
    else fetchData();
  };

  return (
    <div style={{ marginTop: '16px', paddingLeft: '16px', borderLeft: '2px solid #334155' }}>
      {/* Leçons */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h5 style={{ color: '#94a3b8', margin: '0 0 8px 0' }}>📖 Leçons</h5>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={() => handleAddLesson('TEXT')} style={tinyBtn}>+ Texte</button>
            <button onClick={() => handleAddLesson('VIDEO')} style={tinyBtn}>+ Vidéo</button>
            <button onClick={() => handleAddLesson('PDF')} style={tinyBtn}>+ PDF</button>
            <button onClick={() => handleAddLesson('LINK')} style={tinyBtn}>+ Lien</button>
          </div>
        </div>
        {lessons.length === 0 && <p style={{ color: '#94a3b8', fontSize: '13px' }}>Aucune leçon.</p>}
        {lessons.map((lesson) => (
          <LessonEditor key={lesson.id} lesson={lesson} onUpdate={fetchData} />
        ))}
      </div>

      {/* Évaluations */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h5 style={{ color: '#94a3b8', margin: '0 0 8px 0' }}>📝 Évaluations</h5>
          <button onClick={handleAddAssessment} style={tinyBtn}>+ Ajouter</button>
        </div>
        {assessments.length === 0 && <p style={{ color: '#94a3b8', fontSize: '13px' }}>Aucune évaluation.</p>}
        {assessments.map((ass) => (
          <AssessmentEditor key={ass.id} assessment={ass} onUpdate={fetchData} />
        ))}
      </div>
    </div>
  );
}

const tinyBtn: React.CSSProperties = {
  padding: '2px 6px',
  fontSize: '11px',
  background: '#1e293b',
  border: '1px solid #334155',
  color: '#fff',
  borderRadius: '4px',
  cursor: 'pointer',
};