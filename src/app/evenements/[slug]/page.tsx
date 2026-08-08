import { createServerSupabase } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import RegistrationForm from './RegistrationForm';

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createServerSupabase();
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!event) notFound();

  const program = typeof event.program === 'string' ? JSON.parse(event.program) : event.program;

  return (
    <div className="min-h-screen bg-[#020617] text-white pt-28 pb-20 px-4 max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          <span className="text-sm text-green-400 font-bold">INSCRIPTIONS OUVERTES</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold font-['Playfair_Display'] mb-4">{event.title}</h1>
        <p className="text-amber-400 text-lg font-semibold">{event.theme}</p>
        <div className="flex items-center justify-center gap-4 mt-4 text-slate-400 text-sm">
          <span>📅 {new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span>🕐 {event.time_start?.slice(0, 5)} – {event.time_end?.slice(0, 5)}</span>
          <span>👨‍🏫 {event.trainer}</span>
        </div>
      </div>

      {/* Programme */}
      {Array.isArray(program) && program.length > 0 && (
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 md:p-8 mb-8">
          <h2 className="text-xl font-bold mb-4">📋 Déroulement</h2>
          <div className="space-y-2">
            {program.map((item: any, i: number) => (
              <p key={i} className="text-slate-300 text-sm">
                <strong className="text-amber-400">{item.time}</strong> — {item.activity}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Travaux pratiques */}
      {event.practical_work && (
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 md:p-8 mb-8">
          <h2 className="text-xl font-bold mb-4">📝 Travaux Pratiques</h2>
          <p className="text-slate-300 text-sm whitespace-pre-wrap">{event.practical_work}</p>
        </div>
      )}

      {/* Formulaire d'inscription */}
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold text-white mb-2">🎓 Inscrivez-vous</h2>
        <p className="text-slate-400 text-sm mb-6">Remplissez ce formulaire. Nous vous contacterons par WhatsApp.</p>
        <RegistrationForm eventId={event.id} />
      </div>
    </div>
  );
}