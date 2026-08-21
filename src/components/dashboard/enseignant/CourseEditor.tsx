'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponent } from '@/lib/supabase/client';
import ModuleEditor from './ModuleEditor';
import {
  ArrowLeft, Plus, Loader2, Layers, Trash2,
  Upload, X, Pencil, Star, FileText
} from 'lucide-react';

/* eslint-disable @next/next/no-img-element */

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

  // Examen final
  const [finalExam, setFinalExam] = useState<any | null>(null);
  const [showFinalExamForm, setShowFinalExamForm] = useState(false);
  const [finalTitle, setFinalTitle] = useState('');
  const [finalDescription, setFinalDescription] = useState('');
  const [finalImages, setFinalImages] = useState<string[]>([]);
  const [finalFiles, setFinalFiles] = useState<string[]>([]);
  const [uploadingFinalFile, setUploadingFinalFile] = useState(false);

  // fetchModules en useCallback pour stabilité et dépendance
  const fetchModules = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('modules')
      .select('*')
      .eq('course_id', course.id)
      .order('week_number', { ascending: true });
    if (data) setModules(data);
    setLoading(false);
  }, [supabase, course.id]);

  const fetchFinalExam = useCallback(async () => {
    const { data } = await supabase
      .from('assessments')
      .select('id, title, description, type')
      .eq('course_id', course.id)
      .eq('type', 'FINAL')
      .maybeSingle();
    setFinalExam(data);
  }, [supabase, course.id]);

  // Chargement initial avec setTimeout pour éviter l'erreur "setState synchronously"
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchModules();
      fetchFinalExam();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchModules, fetchFinalExam]);

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

  const handleFinalFileUpload = async (file: File) => {
    if (!file) return;
    setUploadingFinalFile(true);
    const cleanName = file.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const fileName = `${Date.now()}_${cleanName}`;
    const { error: uploadError } = await supabase.storage
      .from('course-pdfs')
      .upload(fileName, file);
    if (uploadError) {
      alert('Upload échoué : ' + uploadError.message);
      setUploadingFinalFile(false);
      return;
    }
    const { data: publicUrlData } = supabase.storage
      .from('course-pdfs')
      .getPublicUrl(fileName);
    if (file.type.startsWith('image/')) {
      setFinalImages(prev => [...prev, publicUrlData.publicUrl]);
    } else {
      setFinalFiles(prev => [...prev, publicUrlData.publicUrl]);
    }
    setUploadingFinalFile(false);
  };

  const handleSaveFinalExam = async () => {
    if (!finalTitle.trim()) return;
    let fullDescription = finalDescription.trim() || '';
    if (finalImages.length > 0) {
      fullDescription += '\n\n📷 DOCUMENTS IMAGES :\n';
      finalImages.forEach((url, i) => {
        fullDescription += `Image ${i + 1}: ${url}\n`;
      });
    }
    if (finalFiles.length > 0) {
      fullDescription += '\n📄 DOCUMENTS PDF :\n';
      finalFiles.forEach((url, i) => {
        fullDescription += `PDF ${i + 1}: ${url}\n`;
      });
    }

    if (finalExam) {
      await supabase.from('assessments').update({
        title: finalTitle,
        description: fullDescription.trim() || null,
      }).eq('id', finalExam.id);
    } else {
      await supabase.from('assessments').insert({
        course_id: course.id,
        module_id: null,
        title: finalTitle,
        description: fullDescription.trim() || null,
        type: 'FINAL',
      });
    }

    setShowFinalExamForm(false);
    setFinalTitle('');
    setFinalDescription('');
    setFinalImages([]);
    setFinalFiles([]);
    fetchFinalExam();
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

        {modules.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-xl">
            <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Aucun module pour ce cours</p>
          </div>
        ) : (
          <div className="space-y-4">
            {modules.map((mod) => (
              <div key={mod.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
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
                <div className="p-4">
                  <ModuleEditor module={mod} onUpdate={fetchModules} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Examen final */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400" />
            Examen final de formation
          </h3>
          {finalExam ? (
            <button
              onClick={() => {
                setFinalTitle(finalExam.title || '');
                setFinalDescription(finalExam.description || '');
                setFinalImages([]);
                setFinalFiles([]);
                setShowFinalExamForm(true);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
            >
              <Pencil className="w-4 h-4" /> Modifier
            </button>
          ) : (
            <button
              onClick={() => {
                setFinalTitle('');
                setFinalDescription('');
                setFinalImages([]);
                setFinalFiles([]);
                setShowFinalExamForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> Ajouter l'examen final
            </button>
          )}
        </div>

        {finalExam && !showFinalExamForm && (
          <div className="text-sm text-slate-300">
            <p className="font-medium">{finalExam.title}</p>
            {finalExam.description && (
              <p className="text-xs text-slate-500 mt-1">
                {finalExam.description.substring(0, 100)}...
              </p>
            )}
          </div>
        )}

        {showFinalExamForm && (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Titre de l'examen final"
              value={finalTitle}
              onChange={(e) => setFinalTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            <textarea
              placeholder="Consignes de l'examen final..."
              value={finalDescription}
              onChange={(e) => setFinalDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
            />

            <div className="space-y-2">
              <p className="text-xs text-slate-400 font-medium">Documents à joindre :</p>
              <label className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-slate-400 transition-colors">
                <Upload className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-400">
                  {uploadingFinalFile ? 'Upload en cours...' : 'Ajouter une image ou un PDF'}
                </span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFinalFileUpload(file);
                  }}
                />
              </label>
              {uploadingFinalFile && <Loader2 className="w-4 h-4 text-blue-400 animate-spin mx-auto" />}

              {finalImages.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {finalImages.map((url, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-700">
                      <img src={url} alt={`Image ${i+1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => setFinalImages(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {finalFiles.length > 0 && (
                <div className="space-y-1">
                  {finalFiles.map((url, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-900 rounded-lg p-2">
                      <span className="text-xs text-slate-400 flex items-center gap-2">
                        <FileText className="w-3 h-3" /> PDF {i+1}
                      </span>
                      <button
                        onClick={() => setFinalFiles(prev => prev.filter((_, idx) => idx !== i))}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveFinalExam}
                disabled={!finalTitle.trim() || uploadingFinalFile}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {finalExam ? 'Enregistrer' : 'Créer l’examen final'}
              </button>
              <button
                onClick={() => setShowFinalExamForm(false)}
                className="px-4 py-2 bg-slate-700 text-slate-400 hover:text-white rounded-lg text-sm"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}