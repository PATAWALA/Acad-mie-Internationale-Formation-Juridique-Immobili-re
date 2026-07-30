'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { fadeIn } from '@/lib/animations';
import {
  Settings,
  User,
  Phone,
  Mail,
  Lock,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Shield,
  Key,
  Eye,
  EyeOff,
  UserPlus,
  Users,
} from 'lucide-react';

type Tab = 'profile' | 'security' | 'team';

export default function AdminParametresPage() {
  const supabase = createClientComponent();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // États pour l'ajout d'un admin
  const [newAdminFullName, setNewAdminFullName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [adminMessage, setAdminMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!prof || (prof.role !== 'ADMIN' && prof.role !== 'SUPER_ADMIN')) {
        router.push('/dashboard/etudiant');
        return;
      }

      setProfile(prof);
      setFullName(prof.full_name || '');
      setPhone(prof.phone || '');
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    setSavingProfile(true);
    setMessage(null);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone })
      .eq('id', profile?.id ?? '');
    setSavingProfile(false);
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès.' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleChangePassword = async () => {
    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Minimum 6 caractères requis.' });
      return;
    }
    setSavingPassword(true);
    setMessage(null);
    const { error } = await supabase.auth.updateUser({ password });
    setSavingPassword(false);
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Mot de passe changé avec succès.' });
      setPassword('');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Fonction pour créer un nouvel administrateur
  const handleAddAdmin = async () => {
    if (!newAdminFullName.trim() || !newAdminEmail.trim()) {
      setAdminMessage({ type: 'error', text: 'Le nom et l\'email sont obligatoires.' });
      return;
    }
    if (newAdminPassword.length < 6) {
      setAdminMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caractères.' });
      return;
    }

    setAddingAdmin(true);
    setAdminMessage(null);

    try {
      const res = await fetch('/api/admin/create-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newAdminFullName,
          email: newAdminEmail,
          phone: newAdminPhone,
          password: newAdminPassword,
          role: 'ADMIN',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la création');
      }

      setAdminMessage({ type: 'success', text: 'Administrateur créé avec succès !' });
      setNewAdminFullName('');
      setNewAdminEmail('');
      setNewAdminPhone('');
      setNewAdminPassword('');
      setTimeout(() => setAdminMessage(null), 3000);
    } catch (err: any) {
      setAdminMessage({ type: 'error', text: err.message });
    } finally {
      setAddingAdmin(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-800 rounded-lg w-1/2" />
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="h-6 bg-slate-800 rounded-lg w-1/3" />
            <div className="space-y-3">
              <div className="h-12 bg-slate-800 rounded-xl" />
              <div className="h-12 bg-slate-800 rounded-xl" />
              <div className="h-10 bg-slate-800 rounded-xl w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'profile' as Tab, label: 'Mon profil', icon: User },
    { key: 'security' as Tab, label: 'Sécurité', icon: Lock },
    { key: 'team' as Tab, label: 'Équipe', icon: Users },
  ];

  return (
    <motion.div initial="initial" animate="animate" variants={fadeIn} className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-slate-700 rounded-xl">
            <Settings className="w-5 h-5 text-slate-300" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Paramètres
          </h1>
        </div>
        <p className="text-slate-400 text-sm ml-14">
          Gérez votre profil administrateur et votre sécurité.
        </p>
      </div>

      {/* Message global (profil/sécurité) */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className={cn(
              'flex items-center gap-3 p-4 rounded-xl border',
              message.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-red-500/10 border-red-500/30'
            )}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              )}
              <p className={cn('text-sm', message.type === 'success' ? 'text-emerald-300' : 'text-red-300')}>
                {message.text}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onglets */}
      <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-2 flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              activeTab === tab.key
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      <AnimatePresence mode="wait">
        {activeTab === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <User className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">Informations personnelles</h2>
                <p className="text-xs text-slate-500 mt-0.5">Modifiez vos informations de profil</p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                  <span className="text-xl font-bold text-white">
                    {(profile?.full_name || 'A')[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">{profile?.full_name || 'Administrateur'}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-slate-400 mt-0.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{profile?.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Shield className="w-3 h-3 text-violet-400" />
                    <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">
                      {profile?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Administrateur'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                  <User className="w-3.5 h-3.5" />
                  Nom complet
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                  <Phone className="w-3.5 h-3.5" />
                  Téléphone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+225 0700000000"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
              </div>

              <div className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpdateProfile}
                  disabled={savingProfile}
                  className={cn(
                    'inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-blue-500/20',
                    savingProfile && 'opacity-70 cursor-not-allowed'
                  )}
                >
                  {savingProfile ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sauvegarde...</>
                  ) : (
                    <><Save className="w-4 h-4" /> Mettre à jour le profil</>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'security' && (
          <motion.div
            key="security"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Lock className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">Changer le mot de passe</h2>
                <p className="text-xs text-slate-500 mt-0.5">Utilisez un mot de passe fort et unique</p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                  <Key className="w-3.5 h-3.5" />
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-12 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleChangePassword}
                  disabled={savingPassword || password.length < 6}
                  className={cn(
                    'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all',
                    password.length >= 6
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed',
                    savingPassword && 'opacity-70'
                  )}
                >
                  {savingPassword ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Changement...</>
                  ) : (
                    <><Key className="w-4 h-4" /> Changer le mot de passe</>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'team' && (
          <motion.div
            key="team"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <UserPlus className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">Ajouter un Administrateur</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Créez un compte avec accès complet au tableau de bord
                </p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Message */}
              <AnimatePresence>
                {adminMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className={cn(
                      'flex items-center gap-3 p-3 rounded-xl border',
                      adminMessage.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    )}>
                      {adminMessage.type === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      )}
                      <p className={cn('text-sm', adminMessage.type === 'success' ? 'text-emerald-300' : 'text-red-300')}>
                        {adminMessage.text}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                  <User className="w-3.5 h-3.5" />
                  Nom complet *
                </label>
                <input
                  type="text"
                  value={newAdminFullName}
                  onChange={(e) => setNewAdminFullName(e.target.value)}
                  placeholder="ex: Jean Kouassi"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                  <Mail className="w-3.5 h-3.5" />
                  Email *
                </label>
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="admin@exemple.com"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                  <Phone className="w-3.5 h-3.5" />
                  Téléphone
                </label>
                <input
                  type="text"
                  value={newAdminPhone}
                  onChange={(e) => setNewAdminPhone(e.target.value)}
                  placeholder="+225 0700000000"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                  <Lock className="w-3.5 h-3.5" />
                  Mot de passe *
                </label>
                <input
                  type="password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="Minimum 6 caractères"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all"
                />
              </div>

              <div className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddAdmin}
                  disabled={addingAdmin}
                  className={cn(
                    'inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-amber-500/20',
                    addingAdmin && 'opacity-70 cursor-not-allowed'
                  )}
                >
                  {addingAdmin ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Création...</>
                  ) : (
                    <><UserPlus className="w-4 h-4" /> Créer l'Administrateur</>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}