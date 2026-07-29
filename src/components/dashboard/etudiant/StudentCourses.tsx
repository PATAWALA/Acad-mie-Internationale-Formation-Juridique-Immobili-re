
'use client';

import { useStudent } from '@/context/StudentContext';

export function StudentCourses() {
  const { profile } = useStudent();

  return (
    <div style={{ padding: '30px' }}>
      <h1 style={{ color: '#22c55e' }}>🎓 Bienvenue dans votre Espace de Formation</h1>
      <p>Ravi de vous revoir, {profile?.full_name}. Tous vos cours sont débloqués.</p>
      
      <div style={{ marginTop: '20px', padding: '20px', background: '#1e293b', borderRadius: '8px' }}>
        <h3>📚 Vos Modules Disponibles</h3>
        <ul>
          <li>Module 1 : Introduction & Fondamentaux</li>
          <li>Module 2 : Pratique Avancée</li>
        </ul>
      </div>
    </div>
  );
}