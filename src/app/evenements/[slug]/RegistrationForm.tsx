'use client';

import { useState } from 'react';
import { createClientComponent } from '@/lib/supabase/client';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';

export default function RegistrationForm({ eventId }: { eventId: number }) {
  const supabase = createClientComponent();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone) { setError('Tous les champs sont obligatoires'); return; }
    setLoading(true);
    setError('');

    const { error: insertError } = await supabase.from('event_registrations').insert({
      event_id: eventId,
      full_name: fullName,
      email,
      phone,
    });

    if (insertError) { setError(insertError.message); setLoading(false); return; }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">✅ Inscription réussie !</h3>
        <p className="text-slate-400">Nous vous contacterons bientôt sur WhatsApp.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="text" placeholder="Nom complet *" value={fullName} onChange={(e) => setFullName(e.target.value)}
        className="w-full px-4 py-3 bg-[#0f172a] border border-[#1e293b] rounded-xl text-white text-sm focus:outline-none focus:border-amber-500" required />
      <input type="email" placeholder="Email *" value={email} onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-3 bg-[#0f172a] border border-[#1e293b] rounded-xl text-white text-sm focus:outline-none focus:border-amber-500" required />
      <input type="tel" placeholder="WhatsApp * (ex: +225 07...)" value={phone} onChange={(e) => setPhone(e.target.value)}
        className="w-full px-4 py-3 bg-[#0f172a] border border-[#1e293b] rounded-xl text-white text-sm focus:outline-none focus:border-amber-500" required />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button type="submit" disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        S&apos;inscrire
      </button>
    </form>
  );
}