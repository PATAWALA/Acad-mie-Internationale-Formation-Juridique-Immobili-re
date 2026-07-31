'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { scaleIn } from '@/lib/animations';
import { formatEUR } from '@/lib/currency';
import {
  X,
  GraduationCap,
  DollarSign,
  TrendingDown,
  UserCheck,
  AlertCircle,
  Loader2,
  Save,
  PlusCircle,
  Edit3,
  Upload,
  ImageIcon,
  Quote,
  ListChecks,
  Users,
  Star,
  FileText,
  ChevronDown,
} from 'lucide-react';

interface CertificateFormModalProps {
  certificate: any | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function CertificateFormModal({
  certificate,
  onClose,
  onSaved,
}: CertificateFormModalProps) {
  const supabase = createClientComponent();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState('');
  const [priceNormal, setPriceNormal] = useState<number>(50000);
  const [priceBourse, setPriceBourse] = useState<number>(40000);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Nouveaux champs
  const [slogan, setSlogan] = useState('');
  const [skills, setSkills] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [benefits, setBenefits] = useState('');
  const [brochureUrl, setBrochureUrl] = useState('');
  
  // États pour l'image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // UI states
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isEditing = !!certificate;

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'TEACHER')
      .order('full_name')
      .then(({ data }) => {
        if (data) setTeachers(data);
      });

    if (certificate) {
      setTitle(certificate.title || '');
      setPriceNormal(certificate.price_normal || 0);
      setPriceBourse(certificate.price_bourse || 0);
      setExistingImageUrl(certificate.image_url || null);
      setImagePreview(certificate.image_url || null);
      setSlogan(certificate.slogan || '');
      setSkills(certificate.skills || '');
      setTargetAudience(certificate.target_audience || '');
      setBenefits(certificate.benefits || '');
      setBrochureUrl(certificate.brochure_url || '');
      supabase
        .from('certificate_teachers')
        .select('teacher_id')
        .eq('certificate_id', certificate.id)
        .then(({ data }) => {
          if (data) setSelectedTeachers(data.map((a: any) => a.teacher_id));
        });
    } else {
      setTitle('');
      setPriceNormal(50000);
      setPriceBourse(40000);
      setSelectedTeachers([]);
      setImageFile(null);
      setImagePreview(null);
      setExistingImageUrl(null);
      setSlogan('');
      setSkills('');
      setTargetAudience('');
      setBenefits('');
      setBrochureUrl('');
    }
  }, [certificate]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image (JPG, PNG, WebP).');
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 2 Mo.');
      return;
    }
    
    setImageFile(file);
    setError('');
    
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return existingImageUrl;
    
    setUploading(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `certificates/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('certificates')
        .upload(fileName, imageFile);
      
      if (error) throw error;
      
      const { data: publicUrlData } = supabase.storage
        .from('certificates')
        .getPublicUrl(fileName);
      
      return publicUrlData.publicUrl;
    } catch (err: any) {
      throw new Error('Erreur upload image : ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const discountPercent = priceNormal > 0 ? ((priceNormal - priceBourse) / priceNormal) * 100 : 0;
  const savings = priceNormal - priceBourse;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Le titre est obligatoire.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const imageUrl = await uploadImage();
      
      const certPayload = { 
        title, 
        price_normal: priceNormal, 
        price_bourse: priceBourse,
        image_url: imageUrl,
        slogan,
        skills,
        target_audience: targetAudience,
        benefits,
        brochure_url: brochureUrl || null,
      };
      
      let certId = certificate?.id;

      if (isEditing) {
        await (supabase as any).from('certificates').update(certPayload).eq('id', certId);
      } else {
        const { data: newCert, error: insertError } = await (supabase as any)
          .from('certificates')
          .insert({ ...certPayload, slug: title.toLowerCase().replace(/\s+/g, '-') })
          .select('id')
          .single();
        if (insertError) {
          setError(insertError.message);
          setLoading(false);
          return;
        }
        certId = newCert?.id;
      }

      if (certId) {
        await supabase.from('certificate_teachers').delete().eq('certificate_id', certId);
        if (selectedTeachers.length > 0) {
          const inserts = selectedTeachers.map((teacherId) => ({
            certificate_id: certId,
            teacher_id: teacherId,
          }));
          await supabase.from('certificate_teachers').insert(inserts);
        }
      }

      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleTeacher = (teacherId: string) => {
    setSelectedTeachers((prev) =>
      prev.includes(teacherId) ? prev.filter((id) => id !== teacherId) : [...prev, teacherId]
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          variants={scaleIn}
          initial="initial"
          animate="animate"
          exit="initial"
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl shadow-black/50 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-slate-900 px-6 py-5 border-b border-slate-800 flex items-center justify-between rounded-t-2xl z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                {isEditing ? <Edit3 className="w-5 h-5 text-emerald-400" /> : <PlusCircle className="w-5 h-5 text-emerald-400" />}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {isEditing ? 'Modifier le certificat' : 'Nouveau certificat'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isEditing ? 'Modifier les informations du certificat' : 'Créer un nouveau certificat de formation'}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Body */}
          <div className="p-6">
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-4">
                  <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Image + Titre côte à côte */}
              <div className="grid sm:grid-cols-3 gap-4">
                {/* Image */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                    <ImageIcon className="w-3.5 h-3.5" />
                    Image
                  </label>
                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-700 h-32">
                      <img src={imagePreview} alt="Aperçu" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); setExistingImageUrl(null); }}
                        className="absolute top-1 right-1 p-1 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer transition-colors">
                      <Upload className="w-5 h-5 text-slate-500 mb-1" />
                      <span className="text-xs text-slate-500">Upload</span>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                </div>

                {/* Titre + Slogan */}
                <div className="sm:col-span-2 space-y-3">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                      <GraduationCap className="w-3.5 h-3.5" />
                      Titre du certificat *
                    </label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                      placeholder="Ex: Certification en Rédaction des Contrats"
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                      <Quote className="w-3.5 h-3.5" />
                      Slogan
                    </label>
                    <input type="text" value={slogan} onChange={(e) => setSlogan(e.target.value)}
                      placeholder="Ex: Maîtriser – Comprendre – Rédiger – Sécuriser"
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all" />
                  </div>
                </div>
              </div>

              {/* Prix */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                    <DollarSign className="w-3.5 h-3.5" /> Prix normal (FCFA)
                  </label>
                  <input type="number" min={0} value={priceNormal} onChange={(e) => setPriceNormal(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all" />
                  {priceNormal > 0 && (
                    <p className="text-xs text-slate-500 mt-1">{formatEUR(priceNormal)}</p>
                  )}
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                    <DollarSign className="w-3.5 h-3.5" /> Prix bourse (FCFA)
                  </label>
                  <input type="number" min={0} value={priceBourse} onChange={(e) => setPriceBourse(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all" />
                  {priceBourse > 0 && (
                    <p className="text-xs text-slate-500 mt-1">{formatEUR(priceBourse)}</p>
                  )}
                </div>
              </div>

              {/* Calcul réduction */}
              <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <TrendingDown className="w-3.5 h-3.5" /> Réduction
                  </span>
                  <span className={cn('text-lg font-bold', discountPercent > 0 ? 'text-emerald-400' : 'text-slate-500')}>
                    -{Math.round(discountPercent)}%
                  </span>
                </div>
                {savings > 0 && (
                  <div className="mt-1">
                    <p className="text-xs text-slate-500">
                      Économie : <span className="text-emerald-400 font-medium">{savings.toLocaleString()} FCFA</span>
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {formatEUR(savings)}
                    </p>
                  </div>
                )}
              </div>

              {/* Détails avancés (pliables) */}
              <div>
                <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-slate-400 hover:text-white transition-colors">
                  <span className="flex items-center gap-2">
                    <Star className="w-4 h-4" /> Détails avancés (compétences, public, brochure...)
                  </span>
                  <motion.div animate={{ rotate: showAdvanced ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="p-4 space-y-4 border border-t-0 border-slate-700 rounded-b-xl">
                        {/* Compétences acquises */}
                        <div>
                          <label className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                            <ListChecks className="w-3.5 h-3.5" /> Compétences acquises
                          </label>
                          <textarea value={skills} onChange={(e) => setSkills(e.target.value)} rows={3}
                            placeholder="Ex: Identifier l'acte adapté, Maîtriser la rédaction..."
                            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none" />
                        </div>

                        {/* Public cible */}
                        <div>
                          <label className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                            <Users className="w-3.5 h-3.5" /> Public cible
                          </label>
                          <textarea value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} rows={2}
                            placeholder="Ex: Étudiants en droit, Juristes d'entreprise..."
                            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none" />
                        </div>

                        {/* Avantages */}
                        <div>
                          <label className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                            <Star className="w-3.5 h-3.5" /> Avantages de la formation
                          </label>
                          <textarea value={benefits} onChange={(e) => setBenefits(e.target.value)} rows={2}
                            placeholder="Ex: Formateurs experts, 100% en ligne, suivi personnalisé..."
                            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none" />
                        </div>

                        {/* Brochure PDF */}
                        <div>
                          <label className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                            <FileText className="w-3.5 h-3.5" /> Lien brochure PDF
                          </label>
                          <input type="url" value={brochureUrl} onChange={(e) => setBrochureUrl(e.target.value)}
                            placeholder="https://... ou uploader dans la section brochures"
                            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Enseignants assignés */}
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
                  <UserCheck className="w-3.5 h-3.5" /> Enseignants assignés
                </label>
                {teachers.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Aucun enseignant disponible.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                    {teachers.map((teacher) => (
                      <motion.label key={teacher.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all',
                          selectedTeachers.includes(teacher.id)
                            ? 'bg-violet-500/10 border-violet-500/30 text-violet-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                        )}>
                        <input type="checkbox" checked={selectedTeachers.includes(teacher.id)} onChange={() => toggleTeacher(teacher.id)} className="sr-only" />
                        <div className={cn('w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all',
                          selectedTeachers.includes(teacher.id) ? 'bg-violet-500 border-violet-500' : 'border-slate-600')}>
                          {selectedTeachers.includes(teacher.id) && (
                            <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </motion.svg>
                          )}
                        </div>
                        <span className="text-xs font-medium truncate">{teacher.full_name || teacher.email}</span>
                      </motion.label>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClose}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors">
                  Annuler
                </motion.button>
                <motion.button type="submit" disabled={loading || uploading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className={cn('px-5 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-xl transition-all flex items-center gap-2',
                    'hover:bg-emerald-600 shadow-lg shadow-emerald-500/20', (loading || uploading) && 'opacity-70 cursor-not-allowed')}>
                  {loading || uploading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />{uploading ? 'Upload...' : 'Enregistrement...'}</>
                  ) : (
                    <><Save className="w-4 h-4" />{isEditing ? 'Mettre à jour' : 'Créer le certificat'}</>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}