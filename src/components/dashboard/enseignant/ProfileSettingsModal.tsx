'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { scaleIn } from '@/lib/animations';
import {
  X,
  User,
  Lock,
  Mail,
  Loader2,
  Check,
  AlertCircle,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  onProfileUpdated: () => void; // pour rafraîchir le contexte
}

export default function ProfileSettingsModal({
  isOpen,
  onClose,
  profile,
  onProfileUpdated,
}: Props) {
  const supabase = createClientComponent();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !profile) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation du mot de passe
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas.');
        return;
      }
      if (newPassword.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères.');
        return;
      }
    }

    setLoading(true);

    try {
      // 1. Mise à jour du nom dans la table profiles
      if (fullName.trim() !== profile.full_name) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ full_name: fullName.trim() })
          .eq('id', profile.id);

        if (profileError) throw profileError;
      }

      // 2. Mise à jour de l'email si modifié
      if (email.trim() !== profile.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email.trim(),
        });
        if (emailError) throw emailError;
      }

      // 3. Mise à jour du mot de passe si fourni
      if (newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (passwordError) throw passwordError;
      }

      setSuccess(true);
      // Rafraîchir le profil dans le contexte
      onProfileUpdated();
      // Fermer après un court délai
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            variants={scaleIn}
            initial="initial"
            animate="animate"
            exit="initial"
            className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-violet-500/5 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Paramètres du profil
                  </h3>
                  <p className="text-sm text-slate-400">
                    Modifiez vos informations personnelles
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Message d'erreur */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Message de succès */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm"
                  >
                    <Check className="w-4 h-4 flex-shrink-0" />
                    Profil mis à jour avec succès !
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Nom complet */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <User className="w-4 h-4 text-slate-500" />
                  Nom complet
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className={cn(
                    "w-full px-3 py-2 rounded-lg text-sm text-white",
                    "bg-slate-800 border border-slate-700",
                    "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500",
                    "placeholder-slate-500 transition-all"
                  )}
                  placeholder="Votre nom complet"
                />
              </div>

              {/* Email (lecture seule pour l'instant, mais modifiable) */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Mail className="w-4 h-4 text-slate-500" />
                  Adresse email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={cn(
                    "w-full px-3 py-2 rounded-lg text-sm text-white",
                    "bg-slate-800 border border-slate-700",
                    "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500",
                    "placeholder-slate-500 transition-all"
                  )}
                  placeholder="votre@email.com"
                />
              </div>

              {/* Séparateur */}
              <div className="border-t border-slate-800 pt-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">
                  Changer le mot de passe
                </p>
              </div>

              {/* Nouveau mot de passe */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Lock className="w-4 h-4 text-slate-500" />
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg text-sm text-white",
                    "bg-slate-800 border border-slate-700",
                    "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500",
                    "placeholder-slate-500 transition-all"
                  )}
                  placeholder="Laissez vide pour ne pas changer"
                />
              </div>

              {/* Confirmation */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Lock className="w-4 h-4 text-slate-500" />
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg text-sm text-white",
                    "bg-slate-800 border border-slate-700",
                    "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500",
                    "placeholder-slate-500 transition-all"
                  )}
                  placeholder="Confirmez le nouveau mot de passe"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  Annuler
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium",
                    "bg-gradient-to-r from-violet-500 to-purple-600 text-white",
                    "shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30",
                    "hover:from-violet-400 hover:to-purple-500 transition-all duration-200",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Enregistrer
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}