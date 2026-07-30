'use client';

import { motion } from 'framer-motion';
import { 
  Award, Download, ExternalLink, Sparkles, 
  TrendingUp, Shield, Star
} from 'lucide-react';

interface StudentCertificatesProps {
  certificates: any[];
}

export function StudentCertificates({ certificates }: StudentCertificatesProps) {
  if (!certificates || certificates.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-teal-500/10 border border-green-500/20 p-5 lg:p-6"
    >
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-green-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
      
      {/* Sparkles decoration */}
      <div className="absolute top-4 right-4 opacity-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-8 h-8 text-green-400/30" />
        </motion.div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl"
            >
              <Award className="w-7 h-7 text-green-400" />
            </motion.div>
            <div>
              <h3 className="text-lg lg:text-xl font-bold text-green-400">
                🎉 Félicitations !
              </h3>
              <p className="text-sm text-slate-300">
                Vos certificats de réussite sont prêts
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 sm:ml-auto">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
              <Award className="w-4 h-4 text-green-400" />
              <span className="text-sm font-bold text-green-400">
                {certificates.length} certificat{certificates.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Certificate Cards */}
        <div className="grid sm:grid-cols-2 gap-3">
          {certificates.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -2 }}
              className="group relative bg-[#020617] border border-green-500/20 hover:border-green-500/40 rounded-xl p-4 transition-all hover:shadow-lg hover:shadow-green-500/5"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-500/10 rounded-xl flex-shrink-0 group-hover:bg-green-500/20 transition-colors">
                  <Award className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white mb-1">
                    Certificat de Fin de Formation
                  </h4>
                  <p className="text-xs text-slate-400 mb-3">
                    Prêt à être téléchargé et partagé
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <motion.a
                      href={cert.certificate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-colors shadow-lg shadow-green-500/20"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Télécharger PDF
                    </motion.a>
                    
                    <motion.a
                      href={cert.certificate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-1.5 px-3 py-2 border border-green-500/20 hover:border-green-500/40 text-green-400 text-xs font-medium rounded-lg transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Voir
                    </motion.a>
                  </div>
                </div>
              </div>

              {/* Hover glow */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </motion.div>
          ))}
        </div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex flex-col sm:flex-row items-center gap-4 p-4 bg-[#020617] border border-[#1e293b] rounded-xl"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-sm text-slate-300">
              90% des certifiés trouvent un emploi en 3 mois
            </span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-[#1e293b]" />
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-slate-300">
              Certificat reconnu par les cabinets juridiques
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}