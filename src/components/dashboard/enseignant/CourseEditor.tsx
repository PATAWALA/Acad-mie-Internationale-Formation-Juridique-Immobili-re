'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import ModuleEditor from './ModuleEditor';
import { ArrowLeft, Plus, Loader2, Layers, Trash2 } from 'lucide-react';

interface Props {
  course: any;
  onBack: () => void;
}

export default function CourseEditor({ course, onBack }: Props) {
  const supabase = createClientComponent();
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModule, setShowAddModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');

  const fetchModules = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('modules')
      .select('*')
      .eq('course_id', course.id)
      .order('week_number', { ascending: true });
    if (data) setModules(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchModules();
  }, [course.id]);

  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) return;
    const weekNumber = modules.length + 1;
    const { error } = await supabase.from('modules').insert({
      course_id: course.id,
      title: newModuleTitle,
      week_number: weekNumber,
    });
    if (!error) {
      setNewModuleTitle('');
      setShowAddModule(false);
      fetchModules();
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Supprimer ce module et tout son contenu ?')) return;
    const { error } = await supabase.from('modules').delete().eq('id', moduleId);
    if (!error) fetchModules();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Retour */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Retour aux cours
      </button>

      {/* Header du cours */}
      <div>
        <h2 className="text-2xl font-bold text-white">{course.title}</h2>
        <p className="text-slate-400 text-sm mt-1">{course.description}</p>
      </div>

      {/* Modules */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" /> Modules ({modules.length})
          </h3>
          <button
            onClick={() => setShowAddModule(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Ajouter un module
          </button>
        </div>

        {/* Formulaire ajout module */}
        {showAddModule && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex gap-2">
            <input
              type="text"
              placeholder="Titre du module (ex: Semaine 1 : Introduction)"
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddModule()}
              className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
            />
            <button
              onClick={handleAddModule}
              disabled={!newModuleTitle.trim()}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-medium disabled:opacity-50"
            >
              Ajouter
            </button>
          </div>
        )}

        {/* Liste des modules */}
        {modules.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-xl">
            <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Aucun module pour ce cours</p>
          </div>
        ) : (
          <div className="space-y-4">
            {modules.map((mod) => (
              <div key={mod.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                {/* Header du module */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 font-bold text-sm">
                      {mod.week_number}
                    </div>
                    <h4 className="text-white font-semibold">{mod.title}</h4>
                  </div>
                  <button
                    onClick={() => handleDeleteModule(mod.id)}
                    className="text-red-400 hover:text-red-300 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {/* Contenu du module */}
                <div className="p-4">
                  <ModuleEditor module={mod} onUpdate={fetchModules} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}