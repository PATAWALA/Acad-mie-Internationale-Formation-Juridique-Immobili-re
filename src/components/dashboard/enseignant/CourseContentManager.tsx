'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import CourseEditor from './CourseEditor';
import { Plus, BookOpen, ArrowRight, Loader2 } from 'lucide-react';

interface Props {
  certId: number;
  profile: any;
}

export default function CourseContentManager({ certId, profile }: Props) {
  const supabase = createClientComponent();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('certificate_id', certId)
      .order('created_at', { ascending: false });
    if (data) setCourses(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, [certId]);

  const handleCreateCourse = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    const { data, error } = await supabase
      .from('courses')
      .insert({
        title: newTitle,
        description: newDescription,
        certificate_id: certId,
        created_by: profile.id,
        is_published: true,
      })
      .select('*')
      .single();

    if (!error && data) {
      setNewTitle('');
      setNewDescription('');
      setShowAddForm(false);
      setSelectedCourse(data);
      fetchCourses();
    } else {
      alert(error?.message || 'Erreur');
    }
    setCreating(false);
  };

  if (selectedCourse) {
    return <CourseEditor course={selectedCourse} onBack={() => setSelectedCourse(null)} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header simple */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Cours de la formation</h2>
          <p className="text-slate-400 text-sm mt-1">{courses.length} cours</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Nouveau cours
        </button>
      </div>

      {/* Formulaire rapide */}
      {showAddForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <input
            type="text"
            placeholder="Titre du cours (ex: Introduction au droit)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
          />
          <textarea
            placeholder="Description (optionnel)"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            rows={2}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreateCourse}
              disabled={!newTitle.trim() || creating}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-medium disabled:opacity-50"
            >
              {creating ? 'Création...' : 'Créer le cours'}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Liste des cours */}
      {courses.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-xl">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Aucun cours pour le moment</p>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <button
              key={course.id}
              onClick={() => setSelectedCourse(course)}
              className="w-full flex items-center justify-between bg-slate-900 border border-slate-800 hover:border-blue-500/30 rounded-xl p-4 transition-colors group"
            >
              <div className="text-left">
                <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                  {course.title}
                </h3>
                <p className="text-slate-500 text-sm mt-0.5 line-clamp-1">
                  {course.description || 'Aucune description'}
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}