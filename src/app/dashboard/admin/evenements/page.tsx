'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import { Plus, Pencil, Trash2, Loader2, Send, Eye, X } from 'lucide-react';
import Link from 'next/link';
import EventFormModal from '@/components/dashboard/admin/EventFormModal';

export default function AdminEventsPage() {
  const supabase = createClientComponent();
  const [events, setEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'events' | 'registrations'>('events');
  const [deletingRegId, setDeletingRegId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const { data: evts } = await supabase.from('events').select('*').order('date', { ascending: false });
    const { data: regs } = await supabase.from('event_registrations').select('*, events(title, slug)').order('registered_at', { ascending: false });
    if (evts) setEvents(evts);
    if (regs) setRegistrations(regs);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeleteEvent = async (id: number) => {
    if (!confirm('Supprimer cet événement ? Toutes les inscriptions seront perdues.')) return;
    await supabase.from('events').delete().eq('id', id);
    fetchData();
  };

  const handleDeleteRegistration = async (id: number) => {
    if (!confirm('Supprimer cette inscription ?')) return;
    setDeletingRegId(id);
    await supabase.from('event_registrations').delete().eq('id', id);
    setRegistrations(prev => prev.filter(r => r.id !== id));
    setDeletingRegId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">📅 Événements & Inscriptions</h1>
        <button onClick={() => { setEditingEvent(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Nouvel événement
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setActiveTab('events')}
          className={`px-4 py-2 rounded-xl text-sm font-medium ${activeTab === 'events' ? 'bg-blue-500 text-white' : 'bg-[#1e293b] text-slate-400'}`}>
          📅 Événements ({events.length})
        </button>
        <button onClick={() => setActiveTab('registrations')}
          className={`px-4 py-2 rounded-xl text-sm font-medium ${activeTab === 'registrations' ? 'bg-green-500 text-white' : 'bg-[#1e293b] text-slate-400'}`}>
          👥 Inscrits ({registrations.length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-amber-400 animate-spin" /></div>
      ) : activeTab === 'events' ? (
        <div className="space-y-4">
          {events.length === 0 ? (
            <p className="text-slate-400 text-center py-10">Aucun événement créé.</p>
          ) : (
            events.map((event) => (
              <div key={event.id} className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden">
                {/* Image de couverture */}
                {event.image_url && (
                  <div className="h-40 bg-[#1e293b] overflow-hidden">
                    <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold">{event.title}</h3>
                    <p className="text-slate-400 text-sm">{event.theme}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      <span>📅 {new Date(event.date).toLocaleDateString('fr-FR')}</span>
                      <span>🕐 {event.time_start?.slice(0, 5)}</span>
                      <span>👨‍🏫 {event.trainer}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/evenements/${event.slug}`} target="_blank"
                      className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button onClick={() => { setEditingEvent(event); setShowForm(true); }}
                      className="p-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteEvent(event.id)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden">
          {registrations.length === 0 ? (
            <p className="text-slate-400 text-center py-10">Aucune inscription pour le moment.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-[#1e293b]">
                    <th className="text-left py-3 px-4">Nom</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">WhatsApp</th>
                    <th className="text-left py-3 px-4">Événement</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg: any) => (
                    <tr key={reg.id} className="border-b border-[#1e293b]/50">
                      <td className="py-3 px-4 text-white">{reg.full_name}</td>
                      <td className="py-3 px-4 text-slate-400">{reg.email}</td>
                      <td className="py-3 px-4 text-slate-400">{reg.phone}</td>
                      <td className="py-3 px-4 text-slate-400">{reg.events?.title}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a href={`https://wa.me/${(reg.phone || '').replace(/[^0-9+]/g, '')}?text=${encodeURIComponent(`Bonjour ${reg.full_name}, nous vous confirmons votre inscription à "${reg.events?.title}". À très bientôt !`)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-colors">
                            <Send className="w-3 h-3" /> WhatsApp
                          </a>
                          <button onClick={() => handleDeleteRegistration(reg.id)}
                            disabled={deletingRegId === reg.id}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50">
                            {deletingRegId === reg.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <EventFormModal
          event={editingEvent}
          onClose={() => { setShowForm(false); setEditingEvent(null); }}
          onSaved={fetchData}
        />
      )}
    </div>
  );
}