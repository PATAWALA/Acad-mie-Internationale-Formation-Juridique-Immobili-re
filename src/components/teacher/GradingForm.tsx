'use client';
import { useState } from 'react';

interface GradingFormProps {
  studentName: string;
  fileUrl: string;
  onSubmit: (grade: number, comment: string) => void;
  onCancel: () => void;
}

export default function GradingForm({ studentName, fileUrl, onSubmit, onCancel }: GradingFormProps) {
  const [grade, setGrade] = useState<number>(0);
  const [comment, setComment] = useState('');

  return (
    <div>
      <h3 className="text-lg font-display text-white mb-4">Correction de {studentName}</h3>
      <div className="aspect-video bg-dark-900 rounded-lg flex items-center justify-center text-gray-500 mb-6">
        Fichier : {fileUrl}
      </div>
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">Note (0-20)</label>
        <input
          type="number"
          min="0"
          max="20"
          value={grade}
          onChange={(e) => setGrade(parseInt(e.target.value))}
          className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-2 text-white"
        />
      </div>
      <textarea
        className="w-full bg-dark-700 border border-dark-600 rounded-xl p-4 text-white mb-4"
        rows={4}
        placeholder="Commentaire de correction..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <div className="flex gap-4">
        <button
          onClick={() => onSubmit(grade, comment)}
          className="flex-1 bg-gold-500 text-dark-900 py-2 rounded-xl font-semibold hover:bg-gold-400 transition"
        >
          Valider la correction
        </button>
        <button onClick={onCancel} className="text-gray-400 hover:text-white transition">
          Annuler
        </button>
      </div>
    </div>
  );
}