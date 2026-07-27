'use client';

import { useState } from 'react';

interface Submission {
  id: number;
  student_name: string;
  file_url: string;
  status: string;
}

interface ClassInfo {
  id: number;
  certificate_id: number;
  certificates?: {
    title: string;
  };
}

export default function TeacherDashboardClient({
  submissions = [],
  classes = [],
  userId = '',
}: {
  submissions: Submission[];
  classes?: ClassInfo[];
  userId?: string;
}) {
  const [activeSub, setActiveSub] = useState<Submission | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);

  return (
    <section className="min-h-screen bg-dark-900 pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-display text-white mb-10">
        Espace Enseignant
      </h1>

      {/* Sélecteur de classe */}
      {classes.length > 0 && (
        <div className="mb-8">
          <label className="text-gray-400 text-sm mb-2 block">Classe active</label>
          <select
            onChange={(e) => {
              const cls = classes.find((c) => c.id === parseInt(e.target.value));
              setSelectedClass(cls || null);
            }}
            className="bg-dark-800 border border-dark-600 rounded-xl px-4 py-2 text-white"
          >
            <option value="">-- Choisir une classe --</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.certificates?.title || `Classe ${cls.certificate_id}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Correction des TP */}
      <h2 className="text-xl font-display text-white mb-4">Travaux à corriger</h2>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          {submissions.length === 0 && (
            <p className="text-gray-500">Aucun TP en attente.</p>
          )}
          {submissions.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setActiveSub(sub)}
              className={`w-full text-left p-4 rounded-2xl border transition ${
                activeSub?.id === sub.id
                  ? 'bg-dark-700 border-gold-400/30'
                  : 'bg-dark-800 border-dark-600 hover:border-dark-500'
              }`}
            >
              <p className="text-white font-medium">{sub.student_name}</p>
              <p className="text-xs text-gray-400 mt-1">{sub.status}</p>
            </button>
          ))}
        </div>

        <div className="md:col-span-2 bg-dark-800 border border-dark-700 rounded-2xl p-8">
          {activeSub ? (
            <div>
              <h3 className="text-lg font-display text-white mb-4">
                TP de {activeSub.student_name}
              </h3>
              <div className="aspect-video bg-dark-900 rounded-lg flex items-center justify-center text-gray-500 mb-6">
                Fichier : {activeSub.file_url || 'Aucun fichier'}
              </div>
              <textarea
                className="w-full bg-dark-700 border border-dark-600 rounded-xl p-4 text-white mb-4"
                rows={4}
                placeholder="Commentaire de correction..."
              />
              <div className="flex gap-4">
                <button className="flex-1 bg-gold-500 text-dark-900 py-2 rounded-xl font-semibold hover:bg-gold-400 transition">
                  Valider la correction
                </button>
                <button
                  onClick={() => setActiveSub(null)}
                  className="text-gray-400 hover:text-white transition"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Sélectionnez un TP à corriger.</p>
          )}
        </div>
      </div>
    </section>
  );
}