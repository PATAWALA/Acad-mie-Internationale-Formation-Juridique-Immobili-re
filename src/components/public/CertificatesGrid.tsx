'use client';

import { useState, useEffect } from 'react';
import { Check, Clock, BookOpen, ImageIcon } from 'lucide-react';
import { createClientComponent } from '@/lib/supabase/client';

export default function CertificatesGrid() {
  const supabase = createClientComponent();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCerts = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('certificates')
        .select('*')
        .order('id');
      if (data) setCertificates(data);
      setLoading(false);
    };
    fetchCerts();
  }, []);

  const toggleCert = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
    const event = new CustomEvent('preselect-cert', { detail: { id } });
    window.dispatchEvent(event);
    setTimeout(() => {
      document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const totalNormal = selected.reduce((sum, id) => {
    const cert = certificates.find((c) => c.id === id);
    return sum + (cert?.price_normal || 0);
  }, 0);

  const totalBourse = selected.reduce((sum, id) => {
    const cert = certificates.find((c) => c.id === id);
    return sum + (cert?.price_bourse || 0);
  }, 0);

  if (loading) {
    return (
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto text-center">
        <p className="text-gray-400">Chargement des certifications...</p>
      </section>
    );
  }

  return (
    <section id="certificates" className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-display text-white mb-4">
          Nos 9 Certifications d&apos;Excellence
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Sélectionnez vos modules et rejoignez l&apos;élite juridique et immobilière grâce à la Bourse Mamadou TOURÉ
        </p>
        <p className="text-[#D4AF37] text-sm mt-2 font-medium">
          🎓 Université d'Été 2026 — Début le 08 Août
        </p>
      </div>

      {/* Résumé sélection (barre sticky) */}
      {selected.length > 0 && (
        <div className="sticky top-20 z-30 bg-[#0B0F19]/95 backdrop-blur-xl border border-[#1E293B] rounded-2xl p-4 mb-8 flex items-center justify-between flex-wrap gap-4">
          <span className="text-white">
            {selected.length} certificat(s) sélectionné(s)
          </span>
          <div className="flex items-center gap-4">
            <span className="text-gray-500 line-through text-sm">
              {totalNormal.toLocaleString()} FCFA
            </span>
            <span className="text-[#D4AF37] font-bold text-lg">
              {totalBourse.toLocaleString()} FCFA
            </span>
            <span className="text-green-400 text-sm font-semibold">
              -{totalNormal - totalBourse > 0 ? Math.round(((totalNormal - totalBourse) / totalNormal) * 100) : 0}%
            </span>
            <a
              href="#registration-form"
              className="px-5 py-2 bg-[#D4AF37] text-[#0B0F19] rounded-xl font-semibold text-sm hover:bg-[#C5A028] transition"
            >
              Continuer l&apos;inscription
            </a>
          </div>
        </div>
      )}

      {/* Grille */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert) => {
          const discount =
            cert.price_normal > 0
              ? Math.round(((cert.price_normal - cert.price_bourse) / cert.price_normal) * 100)
              : 0;
          return (
            <div
              key={cert.id}
              className={`relative bg-[#0f172a] border rounded-2xl p-6 transition-all duration-300 hover:shadow-xl ${
                selected.includes(cert.id)
                  ? 'border-[#D4AF37]/40 shadow-lg shadow-[#D4AF37]/10'
                  : 'border-[#1E293B] hover:border-[#D4AF37]/20'
              }`}
            >
              {selected.includes(cert.id) && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-[#0B0F19]" />
                </div>
              )}
              {/* Image du certificat ou icône par défaut */}
              <div className="mb-4 rounded-xl overflow-hidden bg-[#1E293B] h-40 flex items-center justify-center">
                {cert.image_url ? (
                  <img
                    src={cert.image_url}
                    alt={cert.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-10 h-10 text-gray-600" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{cert.title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <Clock className="w-4 h-4" />
                4 semaines
              </div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-gray-500 line-through text-sm">
                  {cert.price_normal.toLocaleString()} FCFA
                </span>
                <span className="text-[#D4AF37] font-bold">
                  {cert.price_bourse.toLocaleString()} FCFA
                </span>
                {discount > 0 && (
                  <span className="text-green-400 text-xs font-semibold">
                    -{discount}%
                  </span>
                )}
              </div>
              <button
                onClick={() => toggleCert(cert.id)}
                className="w-full py-2 border border-[#D4AF37]/30 text-[#D4AF37] rounded-xl text-sm font-medium hover:bg-[#D4AF37]/10 transition"
              >
                {selected.includes(cert.id) ? 'Retirer' : 'Choisir ce module'}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}