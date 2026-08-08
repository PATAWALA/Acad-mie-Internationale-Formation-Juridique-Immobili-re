'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import { X, Save, Loader2, Plus, Trash2 } from 'lucide-react';

interface Props {
  event: any | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function EventFormModal({ event, onClose, onSaved }: Props) {
  const supabase = createClientComponent();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [date, setDate] = useState('');
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [trainer, setTrainer] = useState('');
  const [theme, setTheme] = useState('');
  const [practicalWork, setPracticalWork] = useState('');
  const [program, setProgram] = useState<{ time: string; activity: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!event;

  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setSlug(event.slug || '');
      setDate(event.date || '');
      setTimeStart(event.time_start?.slice(0, 5) || '');
      setTimeEnd(event.time_end?.slice(0, 5) || '');
      setTrainer(event.trainer || '');
      setTheme(event.theme || '');
      setPracticalWork(event.practical_work || '');
      setProgram(typeof event.program === 'string' ? JSON.parse(event.program) : event.program || []);
    }
  }, [event]);

  const addProgramItem = () => setProgram([...program, { time: '', activity: '' }]);
  const removeProgramItem = (i: number) => setProgram(program.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) { setError('Titre et date obligatoires'); return; }
    setLoading(true);
    setError('');

    const finalSlug = slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const payload = { title, slug: finalSlug, date, time_start: timeStart, time_end: timeEnd, trainer, theme, program: JSON.stringify(program), practical_work: practicalWork };

    const { error: err } = isEditing
      ? await supabase.from('events').update(payload).eq('id', event.id)
      : await supabase.from('events').insert(payload);

    if (err) { setError(err.message); setLoading(false); return; }
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">{isEditing ? 'Modifier' : 'Nouvel'} événement</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400">Titre *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 bg-[#1e293b] rounded-lg text-white text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs text-slate-400">Slug (URL)</label>
              <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="rentree-2026" className="w-full px-3 py-2 bg-[#1e293b] rounded-lg text-white text-sm mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400">Date *</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 bg-[#1e293b] rounded-lg text-white text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs text-slate-400">Début</label>
              <input type="time" value={timeStart} onChange={e => setTimeStart(e.target.value)} className="w-full px-3 py-2 bg-[#1e293b] rounded-lg text-white text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs text-slate-400">Fin</label>
              <input type="time" value={timeEnd} onChange={e => setTimeEnd(e.target.value)} className="w-full px-3 py-2 bg-[#1e293b] rounded-lg text-white text-sm mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400">Formateur</label>
              <input value={trainer} onChange={e => setTrainer(e.target.value)} className="w-full px-3 py-2 bg-[#1e293b] rounded-lg text-white text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs text-slate-400">Thème</label>
              <input value={theme} onChange={e => setTheme(e.target.value)} className="w-full px-3 py-2 bg-[#1e293b] rounded-lg text-white text-sm mt-1" />
            </div>
          </div>

          {/* Programme */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-slate-400">📋 Programme (horaires)</label>
              <button type="button" onClick={addProgramItem} className="text-xs text-amber-400 flex items-center gap-1"><Plus className="w-3 h-3" /> Ajouter</button>
            </div>
            {program.map((item, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input value={item.time} onChange={e => { const p = [...program]; p[i].time = e.target.value; setProgram(p); }}
                  placeholder="08H15 - 08H30" className="flex-1 px-3 py-2 bg-[#1e293b] rounded-lg text-white text-sm" />
                <input value={item.activity} onChange={e => { const p = [...program]; p[i].activity = e.target.value; setProgram(p); }}
                  placeholder="Activité" className="flex-[2] px-3 py-2 bg-[#1e293b] rounded-lg text-white text-sm" />
                <button type="button" onClick={() => removeProgramItem(i)} className="text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs text-slate-400">📝 Travaux Pratiques</label>
            <textarea value={practicalWork} onChange={e => setPracticalWork(e.target.value)} rows={3}
              className="w-full px-3 py-2 bg-[#1e293b] rounded-lg text-white text-sm mt-1 resize-none" />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-[#1e293b] text-slate-300 rounded-lg text-sm">Annuler</button>
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEditing ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}