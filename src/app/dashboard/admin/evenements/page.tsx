'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import { Plus, Pencil, Trash2, Loader2, Users, Send, Eye } from 'lucide-react';
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

  const fetchData = async () => {
    setLoading(true);
    const { data: evts } = await supabase.from('events').select('*').order('date', { ascending: false });
    const { data: regs } = await supabase.from('event_registrations').select('*, events(title, slug)').order('registered_at', { ascending: false });
    if (evts) setEvents(evts);
    if (regs) setRegistrations(regs);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cet événement ?')) return;
    await supabase.from('events').delete().eq('id', id);
    fetchData();
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
        /* Liste des événements */
        <div className="space-y-4">
          {events.length === 0 ? (
            <p className="text-slate-400 text-center py-10">Aucun événement créé.</p>
          ) : (
            events.map((event) => (
              <div key={event.id} className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 flex items-center justify-between">
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
                  <button onClick={() => handleDelete(event.id)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Liste des inscrits */
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden">
          {registrations.length === 0 ? (
            <p className="text-slate-400 text-center py-10">Aucune inscription pour le moment.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-[#1e293b]">
                  <th className="text-left py-3 px-4">Nom</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">WhatsApp</th>
                  <th className="text-left py-3 px-4">Événement</th>
                  <th className="text-right py-3 px-4">Action</th>
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
                      <a href={`https://wa.me/${(reg.phone || '').replace(/[^0-9+]/g, '')}?text=${encodeURIComponent(`Bonjour ${reg.full_name}, nous vous confirmons votre inscription à "${reg.events?.title}". À très bientôt !`)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-colors">
                        <Send className="w-3 h-3" /> WhatsApp
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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