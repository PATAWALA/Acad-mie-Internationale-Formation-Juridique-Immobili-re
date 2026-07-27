'use client';

import { useState } from 'react';

export default function QCMQuiz({ enrollmentId }: { enrollmentId: number }) {
  const [submitted, setSubmitted] = useState(false);

  // Simulation – à remplacer par des vraies questions depuis Supabase
  const questions = [
    { id: 1, text: 'Question 1 ?', options: ['A', 'B', 'C'] },
    { id: 2, text: 'Question 2 ?', options: ['A', 'B', 'C'] },
  ];

  return (
    <div className="space-y-6">
      {questions.map((q) => (
        <div key={q.id} className="bg-dark-700 border border-dark-600 rounded-xl p-6">
          <p className="text-white mb-4">{q.text}</p>
          <div className="space-y-2">
            {q.options.map((opt) => (
              <label key={opt} className="flex items-center gap-3 text-gray-300 cursor-pointer">
                <input type="radio" name={`q-${q.id}`} className="accent-gold-400" />
                {opt}
              </label>
            ))}
          </div>
        </div>
      ))}
      {!submitted ? (
        <button
          onClick={() => setSubmitted(true)}
          className="w-full py-3 bg-gold-500 text-dark-900 rounded-xl font-semibold hover:bg-gold-400 transition"
        >
          Valider mes réponses
        </button>
      ) : (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-green-400 text-center">
          ✅ QCM validé ! Passez à la semaine 3.
        </div>
      )}
    </div>
  );
}