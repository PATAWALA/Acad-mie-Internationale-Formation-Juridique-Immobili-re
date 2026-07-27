'use client';
import { useEffect, useState } from 'react';
import { createClientComponent } from '@/lib/supabase/client';

export default function StudentsList() {
  const [students, setStudents] = useState<any[]>([]);
  const supabase = createClientComponent();

  useEffect(() => {
    supabase.from('profiles').select('*').eq('role', 'STUDENT').then(({ data }) => {
      if (data) setStudents(data);
    });
  }, []);

  return (
    <div>
      <h2 className="text-lg font-display text-white mb-4">Liste des étudiants</h2>
      <ul className="space-y-2">
        {students.map((s) => (
          <li key={s.id} className="text-gray-300">{s.full_name} — {s.email}</li>
        ))}
      </ul>
    </div>
  );
}