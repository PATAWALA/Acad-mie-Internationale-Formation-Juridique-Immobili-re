'use client';

import { useState } from 'react';

export default function TPUpload({ enrollmentId }: { enrollmentId: number }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploaded, setUploaded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulation upload – à connecter à Supabase Storage
    setUploaded(true);
  };

  return (
    <div className="bg-dark-700 border border-dark-600 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">📤 Dépôt de TP</h3>
      {!uploaded ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-gold-500/10 file:text-gold-400 hover:file:bg-gold-500/20"
          />
          <button
            type="submit"
            disabled={!file}
            className="w-full py-3 bg-gold-500 text-dark-900 rounded-xl font-semibold hover:bg-gold-400 transition disabled:opacity-50"
          >
            Déposer le TP
          </button>
        </form>
      ) : (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-green-400 text-center">
          ✅ TP déposé avec succès ! Votre formateur va le corriger.
        </div>
      )}
    </div>
  );
}