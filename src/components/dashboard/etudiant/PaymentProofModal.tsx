'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import {
  X, Upload, FileText, Loader2, Check, AlertCircle, Camera
} from 'lucide-react';

interface PaymentProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollmentId: number;
  amount: number;
}

export default function PaymentProofModal({
  isOpen,
  onClose,
  enrollmentId,
  amount,
}: PaymentProofModalProps) {
  const supabase = createClientComponent();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setError('');
    setSuccess(false);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith('image/') && selected.type !== 'application/pdf') {
      setError('Veuillez sélectionner une image (JPG, PNG) ou un PDF.');
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setError('Le fichier est trop volumineux. Maximum 5MB.');
      return;
    }

    setFile(selected);
    setError('');

    if (selected.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(selected);
    } else {
      setPreview(null);
    }
  };

  const uploadReceipt = async (): Promise<string | null> => {
    if (!file) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Non authentifié');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${enrollmentId}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('payment-receipts')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from('payment-receipts')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Veuillez choisir un fichier.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const receiptUrl = await uploadReceipt();
      if (!receiptUrl) throw new Error("Échec de l'upload.");

      const { error: updateError } = await supabase
        .from('enrollments')
        .update({ receipt_url: receiptUrl })
        .eq('id', enrollmentId);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => {
        handleClose();
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1e293b]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl">
              <Camera className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {success ? 'Preuve envoyée !' : 'Envoyer une preuve de paiement'}
              </h3>
              <p className="text-xs text-slate-400">
                {success ? 'Votre demande est en attente de validation.' : 'Image ou PDF de votre reçu'}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-[#1e293b] rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
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
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4"
                >
                  <Check className="w-8 h-8 text-green-400" />
                </motion.div>
                <h4 className="text-lg font-bold text-white mb-2">Preuve envoyée !</h4>
                <p className="text-sm text-slate-400">
                  Votre reçu a été transmis à l&apos;administration. Vous recevrez une notification dès que votre paiement sera validé.
                </p>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {/* Montant */}
                <div className="bg-[#020617] border border-[#1e293b] rounded-xl p-4 text-center">
                  <p className="text-xs text-slate-400 mb-1">Montant à payer</p>
                  <p className="text-2xl font-bold text-white">
                    {amount.toLocaleString()} FCFA
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Veuillez effectuer le paiement puis envoyer la preuve ci-dessous.
                  </p>
                </div>

                {/* Zone de fichier */}
                <div>
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
                    className="w-full flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-[#1e293b] hover:border-amber-500/50 rounded-xl transition-all bg-[#020617] group"
                  >
                    {file ? (
                      <>
                        {preview ? (
                          <img src={preview} alt="Aperçu" className="max-h-40 rounded-lg" />
                        ) : (
                          <FileText className="w-12 h-12 text-amber-400" />
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
                        <div className="p-3 bg-amber-500/10 rounded-xl group-hover:bg-amber-500/20 transition-colors">
                          <Upload className="w-6 h-6 text-amber-400" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-slate-400">
                            Cliquez pour sélectionner votre reçu
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            JPG, PNG ou PDF • Max 5MB
                          </p>
                        </div>
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Erreur */}
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

                {/* Boutons */}
                <div className="flex gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClose}
                    className="flex-1 py-3 border border-[#1e293b] text-slate-400 hover:text-white rounded-xl font-medium text-sm transition-all"
                  >
                    Annuler
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={loading || !file}
                    className="flex-[2] py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-amber-500/50 disabled:to-orange-500/50 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Envoyer la preuve
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}