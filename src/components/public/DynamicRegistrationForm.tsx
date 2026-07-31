'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponent } from '@/lib/supabase/client';
import CountrySelect from './CountrySelect';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, EyeOff, ArrowRight, ArrowLeft, Check, 
  GraduationCap, User, Phone, Mail, Lock, 
  CreditCard, Sparkles, TrendingUp, Shield,
  ChevronRight, Loader2
} from 'lucide-react';
import { formatEUR } from '@/lib/currency';

export default function RegistrationForm() {
  const router = useRouter();
  const supabase = createClientComponent();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    whatsapp: '',
    dialCode: '+225',
    selectedCerts: [] as number[],
    password: '',
    confirmPassword: '',
    profileType: 'Etudiant',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [certificates, setCertificates] = useState<any[]>([]);
  const [certsLoading, setCertsLoading] = useState(true);

  const profileTypes = [
    'Etudiant',
    'Stagiaire',
    'En activité dans le secteur juridique',
    'En activité dans le secteur immobilier',
    'En quête d\'emploi',
    'Autres',
  ];

  useEffect(() => {
    const fetchCertificates = async () => {
      setCertsLoading(true);
      const { data } = await supabase.from('certificates').select('*').order('title');
      if (data) setCertificates(data);
      setCertsLoading(false);
    };
    fetchCertificates();
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const { id } = (e as CustomEvent).detail;
      if (!formData.selectedCerts.includes(id)) {
        setFormData((prev) => ({
          ...prev,
          selectedCerts: [...prev.selectedCerts, id],
        }));
      }
    };
    window.addEventListener('preselect-cert', handler);
    return () => window.removeEventListener('preselect-cert', handler);
  }, [formData.selectedCerts]);

  const toggleCert = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedCerts: prev.selectedCerts.includes(id)
        ? prev.selectedCerts.filter((c) => c !== id)
        : [...prev.selectedCerts, id],
    }));
  };

  const selectedDetails = formData.selectedCerts.map((id) =>
    certificates.find((c) => c.id === id)
  ).filter(Boolean);

  const totalNormal = selectedDetails.reduce((sum, cert) => sum + (cert?.price_normal || 0), 0);
  const totalBourse = selectedDetails.reduce((sum, cert) => sum + (cert?.price_bourse || 0), 0);
  const savings = totalNormal - totalBourse;
  const savingsPercent = totalNormal > 0 ? Math.round((savings / totalNormal) * 100) : 0;

  const formatPhone = (dial: string, number: string) => {
    if (number.startsWith('+')) return number;
    return `${dial}${number}`;
  };

  const handleSubmit = async () => {
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (formData.selectedCerts.length === 0) {
      setError('Veuillez sélectionner au moins un certificat.');
      return;
    }

    setSubmitting(true);
    setError('');

    const fullPhone = formatPhone(formData.dialCode, formData.whatsapp);
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        setError(authError.message);
        setSubmitting(false);
        return;
      }

      const userId = authData.user?.id;
      if (!userId) {
        setError("Erreur lors de la création du compte.");
        setSubmitting(false);
        return;
      }

      const { error: profileError } = await (supabase as any).from('profiles').insert({
  id: userId,
  email: formData.email,
  full_name: fullName,
  phone: fullPhone,
  role: 'STUDENT',
  status: 'PENDING_PAYMENT',
  profile_type: formData.profileType,
});

      if (profileError) {
        setError(profileError.message);
        setSubmitting(false);
        return;
      }

      const { error: enrollError } = await supabase.from('enrollments').insert(
        formData.selectedCerts.map((certId) => {
          const cert = certificates.find((c) => c.id === certId);
          return {
            student_id: userId,
            student_name: fullName,
            certificate_id: certId,
            phone: fullPhone,
            email: formData.email,
            amount_paid: 0,
            remaining_balance: cert?.price_bourse || 30000,
            payment_status: 'PENDING',
          };
        })
      );

      if (enrollError) {
        setError(enrollError.message);
        setSubmitting(false);
        return;
      }

      if (authData.session) {
        await supabase.auth.setSession(authData.session);
      } else {
        let signedIn = false;
        for (let attempt = 0; attempt < 3; attempt++) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });
          if (!signInError) { signedIn = true; break; }
          await new Promise((r) => setTimeout(r, 500));
        }
        if (!signedIn) {
          setError('Compte créé mais connexion impossible. Veuillez vous connecter manuellement.');
          setSubmitting(false);
          return;
        }
      }

      router.push('/dashboard/etudiant');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="registration-form" className="relative py-12 md:py-20 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-xl mx-auto relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Bourse Mamadou TOURÉ - Jusqu&apos;à 50% de réduction</span>
          </motion.div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 font-['Playfair_Display']">Votre Insertion professionnelle commence ici</h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto">
            Rejoignez l&apos;élite juridique. <span className="text-amber-400 font-semibold">90% de nos certifiés</span> décrochent un emploi dans les 3 mois.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-300 ${step >= 1 ? 'bg-blue-500 text-white' : 'bg-[#1e293b] text-slate-500'}`}>
                {step > 1 ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : '1'}
              </div>
              <span className={`text-xs sm:text-sm font-medium hidden sm:inline ${step >= 1 ? 'text-white' : 'text-slate-600'}`}>Informations</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-700 flex-shrink-0" />
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-300 ${step === 2 ? 'bg-blue-500 text-white' : 'bg-[#1e293b] text-slate-500'}`}>2</div>
              <span className={`text-xs sm:text-sm font-medium hidden sm:inline ${step === 2 ? 'text-white' : 'text-slate-600'}`}>Formations</span>
            </div>
          </div>
          <div className="h-1 bg-[#1e293b] rounded-full overflow-hidden">
            <motion.div initial={{ width: '50%' }} animate={{ width: step === 1 ? '50%' : '100%' }} className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" />
          </div>
        </div>

        {/* Form Card */}
        <motion.div key={step} initial={{ opacity: 0, x: step === 1 ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
          className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 sm:p-6 md:p-8 shadow-2xl shadow-black/20">
          <form onSubmit={(e) => { e.preventDefault(); if (step === 1) setStep(2); else if (step === 2) handleSubmit(); }} className="space-y-4 sm:space-y-5">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 sm:space-y-5">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-white">Qui êtes-vous ?</h3>
                      <p className="text-xs sm:text-sm text-slate-400">Ces informations restent confidentielles</p>
                    </div>
                  </div>

                  {/* Champ Qualité */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Qualité *</label>
                    <select
                      value={formData.profileType}
                      onChange={(e) => setFormData((p) => ({ ...p, profileType: e.target.value }))}
                      className="w-full bg-[#020617] border border-[#1e293b] rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    >
                      {profileTypes.map((type) => (
                        <option key={type} value={type} className="bg-[#0f172a]">{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Nom</label>
                      <input type="text" placeholder="Koné" value={formData.lastName} onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))}
                        className="w-full bg-[#020617] border border-[#1e293b] rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Prénom</label>
                      <input type="text" placeholder="Awa" value={formData.firstName} onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))}
                        className="w-full bg-[#020617] border border-[#1e293b] rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all" required />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5"><Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1" />Email</label>
                    <input type="email" placeholder="awa.kone@email.com" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                      className="w-full bg-[#020617] border border-[#1e293b] rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all" required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Pays</label>
                    <CountrySelect value={formData.dialCode} onChange={(dial) => setFormData((p) => ({ ...p, dialCode: dial }))} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5"><Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1" />WhatsApp</label>
                    <div className="flex items-stretch">
                      <span className="inline-flex items-center bg-[#020617] border border-r-0 border-[#1e293b] rounded-l-xl px-2.5 sm:px-3 py-2.5 sm:py-3 text-slate-400 text-xs sm:text-sm whitespace-nowrap flex-shrink-0">{formData.dialCode}</span>
                      <input type="tel" placeholder="01 02 03 04 05" value={formData.whatsapp} onChange={(e) => setFormData((p) => ({ ...p, whatsapp: e.target.value }))}
                        className="flex-1 min-w-0 bg-[#020617] border border-[#1e293b] rounded-r-xl px-3 py-2.5 sm:py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all" required />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5"><Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1" />Mot de passe</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} placeholder="Minimum 6 caractères" value={formData.password} onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                        className="w-full bg-[#020617] border border-[#1e293b] rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 pr-10 sm:pr-12 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all" required minLength={6} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirmer le mot de passe</label>
                    <input type="password" placeholder="Répétez le mot de passe" value={formData.confirmPassword} onChange={(e) => setFormData((p) => ({ ...p, confirmPassword: e.target.value }))}
                      className="w-full bg-[#020617] border border-[#1e293b] rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all" required />
                  </div>

                  <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    className="w-full py-3 sm:py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg shadow-blue-500/20">
                    <span>Continuer</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 sm:space-y-5">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-white">Choisissez vos certifications</h3>
                      <p className="text-xs sm:text-sm text-slate-400">Sélectionnez une ou plusieurs formations</p>
                    </div>
                  </div>

                  {certsLoading ? (
                    <div className="space-y-2 sm:space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse bg-[#020617] rounded-xl p-3 sm:p-4 border border-[#1e293b]">
                          <div className="h-4 bg-slate-700 rounded w-3/4 mb-2" />
                          <div className="h-3 bg-slate-700 rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
                      {certificates.map((cert) => {
                        const discount = cert.price_normal > 0 ? Math.round(((cert.price_normal - cert.price_bourse) / cert.price_normal) * 100) : 0;
                        const isSelected = formData.selectedCerts.includes(cert.id);
                        return (
                          <motion.label key={cert.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                            className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-amber-500/50 bg-amber-500/5 shadow-lg shadow-amber-500/5' : 'border-[#1e293b] hover:border-amber-500/20 bg-[#020617]'}`}>
                            <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? 'bg-amber-500 border-amber-500' : 'border-slate-600'}`}>
                              {isSelected && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />}
                            </div>
                            <input type="checkbox" checked={isSelected} onChange={() => toggleCert(cert.id)} className="hidden" />
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-xs sm:text-sm font-medium truncate">{cert.title}</p>
                              <div className="text-xs">
                                <span className="text-slate-400">{cert.price_bourse?.toLocaleString()} FCFA</span>
                                <span className="text-slate-500 ml-1">({formatEUR(cert.price_bourse)})</span>
                                <span className="line-through text-slate-600 ml-2">{cert.price_normal?.toLocaleString()} FCFA</span>
                                <span className="text-slate-600 ml-1">({formatEUR(cert.price_normal)})</span>
                              </div>
                            </div>
                            {discount > 0 && (
                              <div className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-green-500/10 border border-green-500/20 flex-shrink-0">
                                <span className="text-green-400 text-xs font-bold">-{discount}%</span>
                              </div>
                            )}
                          </motion.label>
                        );
                      })}
                    </div>
                  )}

                  {formData.selectedCerts.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#020617] border border-[#1e293b] rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-slate-400">Prix normal</span>
                        <div className="text-right">
                          <span className="text-slate-500 line-through block">{totalNormal.toLocaleString()} FCFA</span>
                          <span className="text-slate-600 text-[10px]">{formatEUR(totalNormal)}</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-slate-400">Prix Bourse</span>
                        <div className="text-right">
                          <span className="text-amber-400 font-bold block">{totalBourse.toLocaleString()} FCFA</span>
                          <span className="text-slate-500 text-[10px]">{formatEUR(totalBourse)}</span>
                        </div>
                      </div>
                      <div className="border-t border-[#1e293b] pt-2 sm:pt-3 flex justify-between items-center">
                        <div className="flex items-center gap-1.5 sm:gap-2"><TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400" /><span className="text-xs sm:text-sm text-slate-400">Votre économie</span></div>
                        <div className="text-right">
                          <span className="text-green-400 font-bold text-xs sm:text-sm block">-{savings.toLocaleString()} FCFA ({savingsPercent}%)</span>
                          <span className="text-green-500/70 text-[10px]">{formatEUR(savings)}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs sm:text-sm flex items-start gap-2">
                        <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex gap-2 sm:gap-3">
                    <motion.button type="button" onClick={() => setStep(1)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                      className="flex-1 py-2.5 sm:py-3.5 border border-[#1e293b] text-slate-400 hover:text-white hover:border-slate-600 rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-sm">
                      <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Retour</span>
                    </motion.button>
                    <motion.button type="submit" disabled={submitting || formData.selectedCerts.length === 0} whileHover={{ scale: submitting ? 1 : 1.01 }} whileTap={{ scale: submitting ? 1 : 0.99 }}
                      className="flex-[2] py-2.5 sm:py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-amber-500/50 disabled:to-amber-500/50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base shadow-lg shadow-amber-500/20">
                      {submitting ? (
                        <><Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /><span className="hidden sm:inline">Inscription en cours...</span><span className="sm:hidden">Patientez...</span></>
                      ) : (
                        <><CreditCard className="w-4 h-4 sm:w-5 sm:h-5" /><span className="hidden sm:inline">Valider mon inscription</span><span className="sm:hidden">Valider</span></>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-center text-xs sm:text-sm text-slate-500 mt-6 sm:mt-8 pb-20 lg:pb-0">
          Déjà inscrit ?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Connectez-vous à votre espace
          </Link>
        </motion.p>
      </div>
    </section>
  );
}