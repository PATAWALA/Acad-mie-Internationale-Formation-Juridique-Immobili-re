'use client';
import { useState, useRef } from 'react';
import { createClientComponent } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Upload, Link, Camera,Send, 
  Loader2, Check, AlertCircle, Lock, File
} from 'lucide-react';

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessmentId: string;
  userStatus: string;
}

export function SubmissionModal({ isOpen, onClose, assessmentId, userStatus }: SubmissionModalProps) {
  const supabase = createClientComponent();
  const [mode, setMode] = useState<'upload' | 'link'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPaid = userStatus?.trim().toUpperCase() === 'PAID';

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setLinkUrl('');
    setError('');
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    
    // Vérifier la taille (max 10MB)
    if (selected.size > 10 * 1024 * 1024) {
      setError('Le fichier est trop volumineux. Maximum 10MB.');
      return;
    }
    
    setFile(selected);
    setError('');
    
    // Prévisualisation pour les images
    if (selected.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(selected);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async (): Promise<string | null> => {
    if (!file) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Non authentifié');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${assessmentId}_${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage
      .from('submissions')
      .upload(fileName, file);

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from('submissions')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPaid) {
      setError('Seuls les étudiants ayant validé leur règlement peuvent soumettre leurs travaux.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let finalUrl = '';

      if (mode === 'upload' && file) {
        finalUrl = await handleUpload() || '';
        if (!finalUrl) throw new Error("Échec de l'upload.");
      } else if (mode === 'link') {
        if (!linkUrl.trim()) throw new Error("Veuillez fournir un lien valide.");
        finalUrl = linkUrl.trim();
      } else {
        throw new Error("Veuillez choisir un fichier ou entrer un lien.");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { error: insertError } = await supabase.from('submissions').insert({
        assessment_id: assessmentId,
        student_id: user.id,
        submission_url: finalUrl,
        status: 'PENDING',
      });

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 lg:p-6 border-b border-[#1e293b]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-xl">
              <Upload className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {success ? 'Travail envoyé !' : 'Soumettre votre travail'}
              </h3>
              <p className="text-xs text-slate-400">
                {success ? 'Votre formateur va le corriger.' : 'Photo, PDF ou lien externe'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-[#1e293b] rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 lg:p-6">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4"
                >
                  <Check className="w-8 h-8 text-green-400" />
                </motion.div>
                <h4 className="text-lg font-bold text-white mb-2">
                  Soumission réussie !
                </h4>
                <p className="text-sm text-slate-400">
                  Votre travail a été transmis au formateur pour correction.
                </p>
              </motion.div>
            ) : !isPaid ? (
              <motion.div
                key="locked"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-amber-400" />
                </div>
                <h4 className="text-lg font-bold text-amber-400 mb-2">
                  Option Verrouillée
                </h4>
                <p className="text-sm text-slate-400">
                  Vous devez régler vos frais d'inscription pour pouvoir soumettre vos devoirs.
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Mode Selector */}
                <div className="flex gap-2 p-1 bg-[#020617] rounded-xl">
                  <button
                    type="button"
                    onClick={() => setMode('upload')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      mode === 'upload'
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    Fichier
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('link')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      mode === 'link'
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Link className="w-4 h-4" />
                    Lien
                  </button>
                </div>

                {/* Mode Upload */}
                {mode === 'upload' && (
                  <div>
                    <p className="text-xs text-slate-400 mb-3">
                      Formats acceptés : JPG, PNG, PDF • Max 10MB
                    </p>
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-[#1e293b] hover:border-blue-500/50 rounded-xl transition-all bg-[#020617] group"
                    >
                      {file ? (
                        <>
                          {preview ? (
                            <img
                              src={preview}
                              alt="Aperçu"
                              className="max-h-40 rounded-lg"
                            />
                          ) : (
                            <File className="w-12 h-12 text-blue-400" />
                          )}
                          <div className="text-center">
                            <p className="text-sm font-medium text-white">{file.name}</p>
                            <p className="text-xs text-slate-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                            <Upload className="w-6 h-6 text-blue-400" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-slate-400">
                              Cliquez pour sélectionner un fichier
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              ou glissez-déposez ici
                            </p>
                          </div>
                        </>
                      )}
                    </motion.button>
                  </div>
                )}

                {/* Mode Lien */}
                {mode === 'link' && (
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">
                      Lien de votre rendu (Google Drive, GitHub, etc.)
                    </label>
                    <div className="relative">
                      <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="url"
                        required
                        placeholder="https://..."
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-[#020617] border border-[#1e293b] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl"
                    >
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-400">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClose}
                    className="flex-1 py-3 border border-[#1e293b] text-slate-400 hover:text-white rounded-xl font-medium text-sm transition-all"
                  >
                    Annuler
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading || (!file && !linkUrl)}
                    className="flex-[2] py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-green-500/50 disabled:to-emerald-500/50 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Envoyer le travail
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
