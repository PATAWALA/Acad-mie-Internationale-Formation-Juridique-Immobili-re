'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponent } from '@/lib/supabase/client';
import CountrySelect from './CountrySelect';

const certificates = [
  { id: 1, title: 'Droit des Affaires OHADA', boursePrice: 40000, normalPrice: 50000, discount: 20, category: 'juridique' },
  { id: 2, title: 'Droit Immobilier', boursePrice: 25000, normalPrice: 50000, discount: 50, category: 'immobilier' },
  { id: 3, title: 'Procédure Civile', boursePrice: 40000, normalPrice: 50000, discount: 20, category: 'juridique' },
  { id: 4, title: 'Droit du Travail', boursePrice: 40000, normalPrice: 50000, discount: 20, category: 'juridique' },
  { id: 5, title: 'Droit Bancaire', boursePrice: 40000, normalPrice: 50000, discount: 20, category: 'juridique' },
  { id: 6, title: 'Droit des Assurances', boursePrice: 40000, normalPrice: 50000, discount: 20, category: 'juridique' },
  { id: 7, title: 'Fiscalité', boursePrice: 40000, normalPrice: 50000, discount: 20, category: 'juridique' },
  { id: 8, title: 'Droit Pénal des Affaires', boursePrice: 40000, normalPrice: 50000, discount: 20, category: 'juridique' },
  { id: 9, title: 'Gestion Immobilière', boursePrice: 25000, normalPrice: 50000, discount: 50, category: 'immobilier' },
];

export default function DynamicRegistrationForm() {
  const router = useRouter();
  const supabase = createClientComponent();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsapp: '',
    dialCode: '+225',
    selectedCerts: [] as number[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Écouter l'événement de pré‑sélection depuis la grille
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

  const totalNormal = formData.selectedCerts.reduce((sum, id) => {
    const cert = certificates.find((c) => c.id === id);
    return sum + (cert?.normalPrice || 0);
  }, 0);

  const totalBourse = formData.selectedCerts.reduce((sum, id) => {
    const cert = certificates.find((c) => c.id === id);
    return sum + (cert?.boursePrice || 0);
  }, 0);

  const savings = totalNormal - totalBourse;
  const savingsPercent = totalNormal > 0 ? Math.round((savings / totalNormal) * 100) : 0;

  const formatPhone = (dial: string, number: string) => {
    if (number.startsWith('+')) return number;
    return `${dial}${number}`;
  };

  const handleSubmit = async () => {
    if (formData.selectedCerts.length === 0) {
      setError('Veuillez sélectionner au moins un certificat.');
      return;
    }
    setSubmitting(true);
    setError('');

    const fullPhone = formatPhone(formData.dialCode, formData.whatsapp);

    const { data: enrollments, error: insertError } = await supabase
      .from('enrollments')
      .insert(
        formData.selectedCerts.map((certId) => ({
          student_name: formData.fullName,
          certificate_id: certId,
          phone: fullPhone,
          email: formData.email,
          amount_paid: 0,
          remaining_balance: certificates.find((c) => c.id === certId)?.boursePrice || 30000,
          payment_status: 'PENDING',
        }))
      )
      .select('id');

    setSubmitting(false);

    if (insertError) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      return;
    }

    if (enrollments && enrollments.length > 0) {
      router.push(`/paiement?enrollment_id=${enrollments[0].id}`);
    }
  };

  return (
    <section id="registration-form" className="py-20 px-4 md:px-8 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-display text-white mb-4">
          🔥 Votre avenir commence ici
        </h2>
        <p className="text-gray-400 text-lg">
          La Bourse Mamadou TOURÉ vous offre jusqu&apos;à <span className="text-[#D4AF37] font-bold">50% de réduction</span>. Les places sont limitées.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (step === 1) {
            setStep(2);
          } else if (step === 2) {
            handleSubmit();
          }
        }}
        className="bg-[#0f172a] border border-[#1E293B] rounded-2xl p-8 space-y-6"
      >
        {/* Step 1 : Infos personnelles */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-2">1. Qui êtes-vous ?</h3>
            <input
              type="text"
              placeholder="Nom complet"
              value={formData.fullName}
              onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
              className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
              required
            />
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Pays</label>
              <CountrySelect
                value={formData.dialCode}
                onChange={(dial) => setFormData((p) => ({ ...p, dialCode: dial }))}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Numéro WhatsApp</label>
              <div className="flex items-center">
                <span className="bg-[#0B0F19] border border-[#1E293B] rounded-l-xl px-3 py-3 text-gray-400 border-r-0">
                  {formData.dialCode}
                </span>
                <input
                  type="tel"
                  placeholder="XX XX XX XX"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData((p) => ({ ...p, whatsapp: e.target.value }))}
                  className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-r-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>
            </div>
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
              required
            />
            <button
              type="submit"
              className="w-full py-3 bg-[#D4AF37] text-[#0B0F19] font-semibold rounded-xl hover:bg-[#C5A028] transition"
            >
              Continuer
            </button>
          </div>
        )}

        {/* Step 2 : Choix des certificats + soumission directe */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-2">2. Choisissez vos certifications</h3>
            <p className="text-gray-400 text-sm mb-4">
              Cochez les modules qui vous intéressent. Vous pouvez en prendre plusieurs.
            </p>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {certificates.map((cert) => (
                <label
                  key={cert.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    formData.selectedCerts.includes(cert.id)
                      ? 'border-[#D4AF37]/40 bg-[#D4AF37]/5'
                      : 'border-[#1E293B] hover:border-[#D4AF37]/20'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.selectedCerts.includes(cert.id)}
                    onChange={() => toggleCert(cert.id)}
                    className="accent-[#D4AF37]"
                  />
                  <div className="flex-1">
                    <p className="text-white text-sm">{cert.title}</p>
                    <p className="text-xs text-gray-500">
                      {cert.boursePrice.toLocaleString()} FCFA (au lieu de {cert.normalPrice.toLocaleString()})
                    </p>
                  </div>
                  <span className="text-green-400 text-xs font-semibold">-{cert.discount}%</span>
                </label>
              ))}
            </div>

            {/* Résumé */}
            <div className="bg-[#0B0F19] border border-[#1E293B] rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total normal</span>
                <span className="text-gray-500 line-through">{totalNormal.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Prix Bourse</span>
                <span className="text-[#D4AF37] font-bold">{totalBourse.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Votre économie</span>
                <span className="text-green-400 font-semibold">
                  -{savings.toLocaleString()} FCFA ({savingsPercent}%)
                </span>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-[#1E293B] text-gray-400 rounded-xl hover:text-white transition"
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={submitting || formData.selectedCerts.length === 0}
                className="flex-1 py-3 bg-[#D4AF37] text-[#0B0F19] font-semibold rounded-xl hover:bg-[#C5A028] transition disabled:opacity-50"
              >
                {submitting ? 'Envoi...' : 'Valider mon inscription'}
              </button>
            </div>
          </div>
        )}
      </form>
    </section>
  );
}