'use client';

import QCMQuiz from './QCMQuiz';
import TPUpload from './TPUpload';

interface WeekContentProps {
  week: number;
  enrollmentId: number;
}

export default function WeekContent({ week, enrollmentId }: WeekContentProps) {
  if (week === 1) {
    return (
      <div className="space-y-6">
        <div className="bg-dark-700 border border-dark-600 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">📹 Leçon vidéo</h3>
          <div className="aspect-video bg-dark-900 rounded-lg flex items-center justify-center text-gray-500">
            Vidéo de la semaine 1
          </div>
        </div>
        <div className="bg-dark-700 border border-dark-600 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">📄 Support PDF</h3>
          <button className="px-4 py-2 bg-gold-500/10 text-gold-400 border border-gold-400/20 rounded-xl text-sm">
            Télécharger le support
          </button>
        </div>
      </div>
    );
  }

  if (week === 2) {
    return <QCMQuiz enrollmentId={enrollmentId} />;
  }

  if (week === 3) {
    return <TPUpload enrollmentId={enrollmentId} />;
  }

  if (week === 4) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-display text-white mb-2">Correction en cours</h3>
        <p className="text-gray-400">Votre formateur évalue votre TP. Vous recevrez une notification dès qu'il sera corrigé.</p>
      </div>
    );
  }

  return null;
}