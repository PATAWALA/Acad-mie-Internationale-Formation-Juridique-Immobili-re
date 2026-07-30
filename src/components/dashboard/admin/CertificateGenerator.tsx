'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { scaleIn } from '@/lib/animations';
import { Printer, X, Award, Shield, Calendar, Hash } from 'lucide-react';

interface CertificateProps {
  studentName: string;
  courseTitle: string;
  issueDate: string;
  certificateId: string;
  onClose: () => void;
}

export function CertificateGenerator({
  studentName,
  courseTitle,
  issueDate,
  certificateId,
  onClose,
}: CertificateProps) {
  const certRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4"
    >
      {/* Barre d'actions */}
      <motion.div
        variants={scaleIn}
        initial="initial"
        animate="animate"
        className="flex items-center gap-3 mb-6 bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-2 shadow-2xl"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Printer className="w-4 h-4" />
          Imprimer / Sauvegarder en PDF
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-colors"
        >
          <X className="w-4 h-4" />
          Fermer
        </motion.button>
      </motion.div>

      {/* Certificat */}
      <motion.div
        ref={certRef}
        variants={scaleIn}
        initial="initial"
        animate="animate"
        className="certificate-print-area w-full max-w-[1000px] aspect-[1.414/1] bg-white shadow-2xl shadow-black/50 overflow-hidden relative"
        style={{
          background: 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)',
        }}
      >
        {/* Bordure décorative extérieure */}
        <div className="absolute inset-4 border-[3px] border-slate-800" />
        
        {/* Bordure intérieure */}
        <div className="absolute inset-6 border border-slate-300" />

        {/* Ornements d'angle */}
        <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-amber-500" />
        <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-amber-500" />
        <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-amber-500" />
        <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-amber-500" />

        {/* Contenu principal */}
        <div className="relative z-10 h-full flex flex-col items-center justify-between px-20 py-16">
          
          {/* En-tête */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="w-12 h-[1px] bg-amber-500" />
              <Award className="w-8 h-8 text-amber-500" />
              <div className="w-12 h-[1px] bg-amber-500" />
            </div>
            <h1
              className="text-4xl font-bold tracking-[0.3em] text-slate-900 uppercase"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              Certificat de Réussite
            </h1>
            <p
              className="text-sm text-slate-500 italic tracking-wide"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              Ce document officiel atteste que
            </p>
          </div>

          {/* Nom de l'étudiant */}
          <div className="text-center space-y-2">
            <h2
              className="text-5xl font-bold text-slate-800 tracking-wide capitalize"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                textShadow: '0 2px 4px rgba(0,0,0,0.05)',
              }}
            >
              {studentName}
            </h2>
            <div className="w-64 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto" />
          </div>

          {/* Détails de la formation */}
          <div className="text-center space-y-3 max-w-2xl">
            <p
              className="text-base text-slate-600 leading-relaxed"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              a suivi avec succès la formation professionnelle et validé
              l&apos;ensemble des modules obligatoires de la formation
            </p>
            <h3
              className="text-2xl font-bold text-slate-800 italic"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              « {courseTitle} »
            </h3>
          </div>

          {/* Footer avec date, ID et signature */}
          <div className="w-full flex items-end justify-between">
            {/* Gauche - Date et ID */}
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                <span className="uppercase tracking-wider font-medium">Délivré le</span>
              </div>
              <p
                className="text-sm font-bold text-slate-700"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                {issueDate}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-3">
                <Hash className="w-3 h-3" />
                <span className="uppercase tracking-wider font-medium">ID de vérification</span>
              </div>
              <p className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                {certificateId}
              </p>
            </div>

            {/* Centre - Sceau */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full border-2 border-amber-500/40 flex items-center justify-center relative">
                <div className="w-20 h-20 rounded-full border border-amber-500/30 flex items-center justify-center">
                  <Shield className="w-10 h-10 text-amber-500/60" />
                </div>
                <div className="absolute inset-0 rounded-full border border-dashed border-amber-500/20" />
              </div>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-2 text-center">
                Sceau officiel
              </p>
            </div>

            {/* Droite - Signature */}
            <div className="text-center space-y-1">
              <div className="w-44 h-[1px] bg-slate-400 mb-2" />
              <p
                className="text-sm font-bold text-slate-700"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                La Direction
              </p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                Signature autorisée
              </p>
            </div>
          </div>
        </div>

        {/* Filigrane */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03]"
          style={{ transform: 'rotate(-15deg)' }}
        >
          <Award className="w-96 h-96 text-slate-900" />
        </div>
      </motion.div>

      {/* Styles d'impression */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }
          
          body * {
            visibility: hidden;
          }
          
          .certificate-print-area,
          .certificate-print-area * {
            visibility: visible;
          }
          
          .certificate-print-area {
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw !important;
            height: 100vh !important;
            max-width: 100vw !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
        }
      `}</style>
    </motion.div>
  );
}