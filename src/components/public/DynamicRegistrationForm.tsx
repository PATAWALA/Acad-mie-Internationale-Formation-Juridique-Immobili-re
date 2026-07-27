'use client';

import { useState, useEffect } from 'react';
import { createClientComponent } from '@/lib/supabase/client';
import RegistrationModal from './RegistrationModal';

const certificates = [
  { id: 1, title: 'Droit des Affaires OHADA', boursePrice: 30000 },
  { id: 2, title: 'Droit Immobilier', boursePrice: 30000 },
  { id: 3, title: 'Procédure Civile', boursePrice: 30000 },
  { id: 4, title: 'Droit du Travail', boursePrice: 30000 },
  { id: 5, title: 'Droit Bancaire', boursePrice: 30000 },
  { id: 6, title: 'Droit des Assurances', boursePrice: 30000 },
  { id: 7, title: 'Fiscalité', boursePrice: 30000 },
  { id: 8, title: 'Droit Pénal des Affaires', boursePrice: 30000 },
  { id: 9, title: 'Gestion Immobilière', boursePrice: 30000 },
];

export default function DynamicRegistrationForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    selectedCerts: [] as number[],
    paymentMethod: 'wave' as 'wave' | 'bank',
  });
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const supabase = createClientComponent();

  const toggleCert = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedCerts: prev.selectedCerts.includes(id)
        ? prev.selectedCerts.filter((c) => c !== id)
        : [...prev.selectedCerts, id],
    }));
  };

  const total = formData.selectedCerts.reduce((sum, id) => {
    const cert = certificates.find((c) => c.id === id);
    return sum + (cert?.boursePrice || 0);
  }, 0);

  const totalNormal = formData.selectedCerts.reduce((sum, id) => {
    return sum + 50000;
  }, 0);

  const savings = totalNormal - total;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.selectedCerts.length === 0) {
      setError('Veuillez sélectionner au moins un certificat.');
      return;
    }
    setSubmitting(true);
    setError('');

    const { error: insertError } = await supabase.from('enrollments').insert(
      formData.selectedCerts.map((certId) => ({
        student_name: formData.fullName,
        certificate_id: certId,
        amount_paid: 0,
        remaining_balance: certificates.find((c) => c.id === certId)?.boursePrice || 30000,
        payment_status: 'PENDING',
      }))
    );

    setSubmitting(false);

    if (insertError) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <section id="registration-form" className="py-20 px-4 md:px-8 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-display text-white mb-4">
            Postulez à la Bourse Mamadou TOURÉ
          </h2>
          <p className="text-gray-400 text-lg">
            Remplissez le formulaire et bénéficiez de tarifs réduits
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#0f172a] border border-[#1E293B] rounded-2xl p-8 space-y-6">
          {/* Step 1: Infos personnelles */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">1. Vos informations</h3>
              <input
                type="text"
                placeholder="Nom complet"
                value={formData.fullName}
                onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                required
              />
              <input
                type="tel"
                placeholder="Téléphone"
                value={formData.phone}
                onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                required
              />
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-3 bg-[#D4AF37] text-[#0B0F19] font-semibold rounded-xl hover:bg-[#C5A028] transition"
              >
                Continuer
              </button>
            </div>
          )}

          {/* Step 2: Choix des certificats */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">2. Choisissez vos certificats</h3>
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
                    <span className="text-white flex-1">{cert.title}</span>
                    <span className="text-[#D4AF37] font-bold">{cert.boursePrice.toLocaleString()} FCFA</span>
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
                  <span className="text-[#D4AF37] font-bold">{total.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Économie</span>
                  <span className="text-green-400 font-semibold">-{savings.toLocaleString()} FCFA</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-[#1E293B] text-gray-400 rounded-xl hover:text-white transition"
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={formData.selectedCerts.length === 0}
                  className="flex-1 py-3 bg-[#D4AF37] text-[#0B0F19] font-semibold rounded-xl hover:bg-[#C5A028] transition disabled:opacity-50"
                >
                  Continuer
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Paiement */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">3. Mode de paiement</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-[#1E293B] cursor-pointer hover:border-[#D4AF37]/20">
                  <input
                    type="radio"
                    name="payment"
                    value="wave"
                    checked={formData.paymentMethod === 'wave'}
                    onChange={() => setFormData((p) => ({ ...p, paymentMethod: 'wave' }))}
                    className="accent-[#D4AF37]"
                  />
                  <span className="text-white">Wave Mobile Money</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-xl border border-[#1E293B] cursor-pointer hover:border-[#D4AF37]/20">
                  <input
                    type="radio"
                    name="payment"
                    value="bank"
                    checked={formData.paymentMethod === 'bank'}
                    onChange={() => setFormData((p) => ({ ...p, paymentMethod: 'bank' }))}
                    className="accent-[#D4AF37]"
                  />
                  <span className="text-white">Virement Bancaire</span>
                </label>
              </div>

              <div className="bg-[#0B0F19] border border-[#1E293B] rounded-xl p-4">
                <p className="text-white font-bold text-lg">Total à payer : {total.toLocaleString()} FCFA</p>
                <p className="text-green-400 text-sm">Vous économisez {savings.toLocaleString()} FCFA</p>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 border border-[#1E293B] text-gray-400 rounded-xl hover:text-white transition"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-[#D4AF37] text-[#0B0F19] font-semibold rounded-xl hover:bg-[#C5A028] transition disabled:opacity-50"
                >
                  {submitting ? 'Envoi...' : 'Valider l\'inscription'}
                </button>
              </div>
            </div>
          )}
        </form>
      </section>

      {showModal && (
        <RegistrationModal
          studentName={formData.fullName}
          total={total}
          paymentMethod={formData.paymentMethod}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}