'use client';

import { useState, useEffect } from 'react';
import { useStudent } from '@/context/StudentContext';
import { createClientComponent } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, Lock, Save, Key, 
  Check, AlertCircle, Loader2, Camera,
  Shield, Eye, EyeOff
} from 'lucide-react';

export default function ProfilView() {
  const { profile, refreshProfile } = useStudent();
  const supabase = createClientComponent();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setEmail(profile.email || '');
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    setMessage(null);
    setSavingProfile(true);

    const updates: any = { full_name: fullName, phone };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile?.id ?? '');

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès.' });
      refreshProfile();
    }
    
    setSavingProfile(false);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleChangePassword = async () => {
    setMessage(null);
    
    if (!password || password.length < 6) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caractères.' });
      return;
    }

    setSavingPassword(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Mot de passe changé avec succès.' });
      setPassword('');
    }

    setSavingPassword(false);
    setTimeout(() => setMessage(null), 3000);
  };

  const createdDate = profile?.created_at 
    ? new Date(profile.created_at).toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'Inconnue';

  return (
    <div className="max-w-2xl mx-auto space-y-6 lg:space-y-8">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="relative">
          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <User className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
          </div>
          <button className="absolute -bottom-1 -right-1 p-1.5 bg-[#0f172a] border border-[#1e293b] rounded-lg hover:border-blue-500/50 transition-colors">
            <Camera className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white">
            {fullName || 'Mon Profil'}
          </h1>
          <p className="text-sm text-slate-400">
            Membre depuis {createdDate}
          </p>
        </div>
      </motion.div>

      {/* Message de feedback */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`flex items-start gap-2 p-3 rounded-xl border ${
              message.type === 'success'
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            )}
            <span className="text-sm">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section Informations Personnelles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden"
      >
        <div className="flex items-center gap-3 p-5 lg:p-6 border-b border-[#1e293b]">
          <div className="p-2 bg-blue-500/10 rounded-xl">
            <User className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Informations Personnelles
            </h3>
            <p className="text-xs text-slate-400">
              Modifiez vos coordonnées
            </p>
          </div>
        </div>

        <div className="p-5 lg:p-6 space-y-4">
          {/* Nom complet */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <User className="w-4 h-4 inline mr-1.5" />
              Nom complet
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Votre nom complet"
              className="w-full px-4 py-3 bg-[#020617] border border-[#1e293b] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-sm"
            />
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Phone className="w-4 h-4 inline mr-1.5" />
              Téléphone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+225 XX XX XX XX XX"
              className="w-full px-4 py-3 bg-[#020617] border border-[#1e293b] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-sm"
            />
          </div>

          {/* Email (non modifiable) */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Mail className="w-4 h-4 inline mr-1.5" />
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-3 bg-[#020617]/50 border border-[#1e293b] rounded-xl text-slate-500 cursor-not-allowed text-sm"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 bg-[#1e293b] rounded-lg">
                <Lock className="w-3 h-3 text-slate-500" />
                <span className="text-xs text-slate-500">Non modifiable</span>
              </div>
            </div>
          </div>

          {/* Bouton Sauvegarder */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleUpdateProfile}
            disabled={savingProfile}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20"
          >
            {savingProfile ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sauvegarde en cours...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Mettre à jour le profil
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Section Sécurité */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden"
      >
        <div className="flex items-center gap-3 p-5 lg:p-6 border-b border-[#1e293b]">
          <div className="p-2 bg-red-500/10 rounded-xl">
            <Shield className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Sécurité
            </h3>
            <p className="text-xs text-slate-400">
              Modifiez votre mot de passe
            </p>
          </div>
        </div>

        <div className="p-5 lg:p-6 space-y-4">
          {/* Nouveau mot de passe */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Key className="w-4 h-4 inline mr-1.5" />
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
                className="w-full px-4 py-3 pr-12 bg-[#020617] border border-[#1e293b] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {/* Force du mot de passe */}
            {password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`flex-1 h-1 rounded-full ${
                        password.length >= level * 2
                          ? password.length >= 8
                            ? 'bg-green-500'
                            : 'bg-amber-500'
                          : 'bg-[#1e293b]'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs ${
                  password.length >= 8 ? 'text-green-400' : 
                  password.length >= 4 ? 'text-amber-400' : 
                  'text-slate-500'
                }`}>
                  {password.length >= 8 
                    ? 'Mot de passe fort' 
                    : password.length >= 4 
                    ? 'Mot de passe moyen' 
                    : 'Force du mot de passe'}
                </p>
              </div>
            )}
          </div>

          {/* Bouton Changer mot de passe */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleChangePassword}
            disabled={savingPassword || !password}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white font-semibold rounded-xl transition-all shadow-lg shadow-red-500/20"
          >
            {savingPassword ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Changement en cours...
              </>
            ) : (
              <>
                <Key className="w-5 h-5" />
                Changer le mot de passe
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}