'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponent } from '@/lib/supabase/client';
import CountrySelect from './CountrySelect';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

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
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Chargement des certificats depuis Supabase
  const [certificates, setCertificates] = useState<any[]>([]);
  const [certsLoading, setCertsLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      setCertsLoading(true);
      const { data } = await supabase.from('certificates').select('*').order('title');
      if (data) setCertificates(data);
      setCertsLoading(false);
    };
    fetchCertificates();
  }, []);

  // Pré‑sélection depuis la grille (événement personnalisé)
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

  // Calculs dynamiques des totaux et réductions
  const selectedDetails = formData.selectedCerts.map((id) =>
    certificates.find((c) => c.id === id)
  ).filter(Boolean);

  const totalNormal = selectedDetails.reduce(
    (sum, cert) => sum + (cert?.price_normal || 0),
    0
  );
  const totalBourse = selectedDetails.reduce(
    (sum, cert) => sum + (cert?.price_bourse || 0),
    0
  );
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
      // 1. Création du compte Auth
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

      // 2. Insérer le profil PENDING_PAYMENT
      const { error: profileError } = await supabase.from('profiles').insert({
        id: userId,
        email: formData.email,
        full_name: fullName,
        phone: fullPhone,
        role: 'STUDENT',
        status: 'PENDING_PAYMENT',
      });

      if (profileError) {
        setError(profileError.message);
        setSubmitting(false);
        return;
      }

      // 3. Insérer les enrollments avec les prix dynamiques
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

      // 4. Connexion automatique
      if (authData.session) {
        await supabase.auth.setSession(authData.session);
      } else {
        let signedIn = false;
        for (let attempt = 0; attempt < 3; attempt++) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });
          if (!signInError) {
            signedIn = true;
            break;
          }
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
    <section id="registration-form" className="py-20 px-4 md:px-8 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-display text-white mb-4">
          🔥 Votre avenir commence ici
        </h2>
        <p className="text-gray-400 text-lg">
          La Bourse Mamadou TOURÉ vous offre jusqu'à <span className="text-[#D4AF37] font-bold">50% de réduction</span>. Les places sont limitées.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (step === 1) setStep(2);
          else if (step === 2) handleSubmit();
        }}
        className="bg-[#0f172a] border border-[#1E293B] rounded-2xl p-8 space-y-6"
      >
        {/* Step 1 : Infos personnelles */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-2">1. Qui êtes-vous ?</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <input type="text" placeholder="Nom" value={formData.lastName} onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))} className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]" required />
              <input type="text" placeholder="Prénom" value={formData.firstName} onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))} className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]" required />
            </div>
            <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]" required />
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Pays</label>
              <CountrySelect value={formData.dialCode} onChange={(dial) => setFormData((p) => ({ ...p, dialCode: dial }))} />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Numéro WhatsApp</label>
              <div className="flex items-center">
                <span className="bg-[#0B0F19] border border-[#1E293B] rounded-l-xl px-3 py-3 text-gray-400 border-r-0">{formData.dialCode}</span>
                <input type="tel" placeholder="XX XX XX XX" value={formData.whatsapp} onChange={(e) => setFormData((p) => ({ ...p, whatsapp: e.target.value }))} className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-r-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]" required />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Mot de passe</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} placeholder="6 caractères minimum" value={formData.password} onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))} className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-xl px-4 py-3 pr-10 text-white focus:outline-none focus:border-[#D4AF37]" required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Confirmer le mot de passe</label>
              <input type="password" placeholder="Répéter le mot de passe" value={formData.confirmPassword} onChange={(e) => setFormData((p) => ({ ...p, confirmPassword: e.target.value }))} className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]" required />
            </div>
            <button type="submit" className="w-full py-3 bg-[#D4AF37] text-[#0B0F19] font-semibold rounded-xl hover:bg-[#C5A028] transition">Continuer</button>
          </div>
        )}

        {/* Step 2 : Choix des certificats */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-2">2. Choisissez vos certifications</h3>
            <p className="text-gray-400 text-sm mb-4">Cochez les modules qui vous intéressent. Vous pouvez en prendre plusieurs.</p>
            {certsLoading ? (
              <p className="text-gray-400">Chargement des formations...</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {certificates.map((cert) => {
                  const discount = cert.price_normal > 0
                    ? Math.round(((cert.price_normal - cert.price_bourse) / cert.price_normal) * 100)
                    : 0;
                  return (
                    <label key={cert.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${formData.selectedCerts.includes(cert.id) ? 'border-[#D4AF37]/40 bg-[#D4AF37]/5' : 'border-[#1E293B] hover:border-[#D4AF37]/20'}`}>
                      <input type="checkbox" checked={formData.selectedCerts.includes(cert.id)} onChange={() => toggleCert(cert.id)} className="accent-[#D4AF37]" />
                      <div className="flex-1">
                        <p className="text-white text-sm">{cert.title}</p>
                        <p className="text-xs text-gray-500">
                          {cert.price_bourse.toLocaleString()} FCFA (au lieu de {cert.price_normal.toLocaleString()})
                        </p>
                      </div>
                      {discount > 0 && (
                        <span className="text-green-400 text-xs font-semibold">-{discount}%</span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
            <div className="bg-[#0B0F19] border border-[#1E293B] rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-400">Total normal</span><span className="text-gray-500 line-through">{totalNormal.toLocaleString()} FCFA</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Prix Bourse</span><span className="text-[#D4AF37] font-bold">{totalBourse.toLocaleString()} FCFA</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Votre économie</span><span className="text-green-400 font-semibold">-{savings.toLocaleString()} FCFA ({savingsPercent}%)</span></div>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-4">
              <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 border border-[#1E293B] text-gray-400 rounded-xl hover:text-white transition">Retour</button>
              <button type="submit" disabled={submitting || formData.selectedCerts.length === 0} className="flex-1 py-3 bg-[#D4AF37] text-[#0B0F19] font-semibold rounded-xl hover:bg-[#C5A028] transition disabled:opacity-50">
                {submitting ? 'Inscription...' : 'Valider mon inscription'}
              </button>
            </div>
          </div>
        )}
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Déjà inscrit ?{' '}
        <Link href="/login" className="text-[#D4AF37] hover:underline">
          Connectez-vous à votre espace
        </Link>
      </p>
    </section>
  );
}