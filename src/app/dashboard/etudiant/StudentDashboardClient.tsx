'use client';

import { useState } from 'react';
import CertificateCard from '@/components/student/CertificateCard';
import CourseProgress from '@/components/student/CourseProgress';

export default function StudentDashboardClient({ enrollments = [] }: { enrollments: any[] }) {
  const [activeCert, setActiveCert] = useState(enrollments[0] || null);

  return (
    <section className="min-h-screen bg-dark-900 pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-display text-white mb-2">Mon espace de formation</h1>
      <p className="text-gray-400 mb-10">Continuez votre parcours là où vous vous êtes arrêté.</p>

      {enrollments.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500">Vous n'êtes inscrit à aucun certificat pour le moment.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            {enrollments.map((enr: any) => (
              <CertificateCard
                key={enr.id}
                enrollment={enr}
                isActive={activeCert?.id === enr.id}
                onClick={() => setActiveCert(enr)}
              />
            ))}
          </div>
          <div className="lg:col-span-2">
            {activeCert && <CourseProgress enrollment={activeCert} />}
          </div>
        </div>
      )}
    </section>
  );
}