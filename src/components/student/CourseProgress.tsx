'use client';

import { useState } from 'react';
import WeekContent from './WeekContent';

export default function CourseProgress({ enrollment }: { enrollment: any }) {
  const [currentWeek, setCurrentWeek] = useState(enrollment.current_week || 1);

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-2xl p-8">
      {/* Barre de progression */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-display text-white">{enrollment.certificates.title}</h2>
          <span className="text-sm text-gray-400">Semaine {currentWeek}/4</span>
        </div>
        <div className="w-full h-2 bg-dark-700 rounded-full">
          <div
            className="h-full bg-gradient-to-r from-gold-500 to-gold-400 rounded-full transition-all duration-500"
            style={{ width: `${(currentWeek / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Sélecteur de semaine */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map((week) => (
          <button
            key={week}
            onClick={() => setCurrentWeek(week)}
            className={`w-10 h-10 rounded-xl font-semibold text-sm transition-all ${
              currentWeek === week
                ? 'bg-gold-500 text-dark-900'
                : 'bg-dark-700 text-gray-400 hover:text-white'
            }`}
          >
            S{week}
          </button>
        ))}
      </div>

      {/* Contenu de la semaine */}
      <WeekContent week={currentWeek} enrollmentId={enrollment.id} />
    </div>
  );
}