'use client';

import { useEffect, useState } from 'react';
import { createClientComponent } from '@/lib/supabase/client';
import { useStudent } from '@/context/StudentContext';
import { motion } from 'framer-motion';
import { Award, Download, ExternalLink, FileText } from 'lucide-react';

export default function CertificatesView() {
  const { profile } = useStudent();
  const supabase = createClientComponent();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const load = async () => {
      const { data } = await supabase
        .from('issued_certificates')
        .select('id, certificate_url, course_id, issued_at')
        .eq('student_id', profile.id)
        .order('issued_at', { ascending: false });
      if (data) setCertificates(data);
      setLoading(false);
    };
    load();
  }, [profile]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Chargement de vos certificats...</p>
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="text-center py-20">
        <Award className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Aucun certificat pour le moment</h3>
        <p className="text-slate-400 text-sm">
          Terminez une formation pour obtenir votre certificat.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
        <Award className="w-7 h-7 text-amber-400" />
        🎓 Mes Certificats
      </h2>
      <p className="text-slate-400 text-sm">
        {certificates.length} certificat{certificates.length > 1 ? 's' : ''} obtenu{certificates.length > 1 ? 's' : ''}
      </p>

      <div className="space-y-4">
        {certificates.map((cert) => (
          <motion.div
            key={cert.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0f172a] border border-green-500/20 rounded-2xl p-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-2xl">
                <Award className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-bold">Certificat de Fin de Formation</h3>
                <p className="text-slate-400 text-sm">
                  Délivré le {new Date(cert.issued_at).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={cert.certificate_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <Download className="w-4 h-4" /> Télécharger PDF
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}