'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, CreditCard, Smartphone, Building2, 
  Shield, Lock, ArrowRight, Check, Loader2,
  Sparkles, AlertCircle
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPay: (method: 'wave' | 'paypal' | 'bank') => void;
  amount: number;
  loading: boolean;
}

export default function PaymentModal({ isOpen, onClose, onPay, amount, loading }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'wave' | 'paypal' | 'bank' | null>(null);
  const [step, setStep] = useState<'select' | 'confirm'>('select');

  // Réinitialiser quand on ferme
  const handleClose = () => {
    setSelectedMethod(null);
    setStep('select');
    onClose();
  };

  const handleConfirm = () => {
    if (selectedMethod) {
      setStep('confirm');
    }
  };

  const handlePay = () => {
    if (selectedMethod) {
      onPay(selectedMethod);
    }
  };

  const paymentMethods = [
    {
      id: 'wave' as const,
      name: 'Wave',
      icon: Smartphone,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      textColor: 'text-blue-400',
      description: 'Paiement mobile instantané',
      available: true,
    },
    {
      id: 'paypal' as const,
      name: 'PayPal',
      icon: CreditCard,
      color: 'from-blue-600 to-indigo-600',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
      textColor: 'text-indigo-400',
      description: 'Paiement sécurisé en ligne',
      available: true,
    },
    {
      id: 'bank' as const,
      name: 'Virement Bancaire',
      icon: Building2,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      textColor: 'text-purple-400',
      description: 'Virement classique 24-48h',
      available: true,
    },
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-md bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="relative p-6 border-b border-[#1e293b]">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 p-2 hover:bg-[#1e293b] rounded-xl transition-colors group"
          >
            <X className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl">
              <CreditCard className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {step === 'select' ? 'Choisissez votre mode de paiement' : 'Confirmer le paiement'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Paiement sécurisé • 100% crypté
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 'select' ? (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Montant */}
                <div className="bg-[#020617] border border-[#1e293b] rounded-xl p-4 text-center">
                  <p className="text-xs text-slate-400 mb-1">Montant à payer</p>
                  <p className="text-2xl lg:text-3xl font-bold text-white">
                    {amount.toLocaleString()}
                    <span className="text-lg font-normal text-slate-400"> FCFA</span>
                  </p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <p className="text-[10px] text-amber-400 font-medium">
                      Prix bourse • Économisez jusqu'à 50%
                    </p>
                  </div>
                </div>

                {/* Méthodes de paiement */}
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <motion.button
                      key={method.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        selectedMethod === method.id
                          ? `${method.borderColor} bg-gradient-to-r ${method.bgColor}`
                          : 'border-[#1e293b] hover:border-slate-600 bg-[#020617]'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl ${method.bgColor} flex-shrink-0`}>
                        <method.icon className={`w-5 h-5 ${method.textColor}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-white">
                          {method.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {method.description}
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        selectedMethod === method.id
                          ? `border-green-400 bg-green-400`
                          : 'border-slate-600'
                      }`}>
                        {selectedMethod === method.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          >
                            <Check className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Bouton Continuer */}
                <motion.button
                  whileHover={{ scale: selectedMethod ? 1.02 : 1 }}
                  whileTap={{ scale: selectedMethod ? 0.98 : 1 }}
                  onClick={handleConfirm}
                  disabled={!selectedMethod}
                  className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                    selectedMethod
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/20'
                      : 'bg-[#1e293b] text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Continuer
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                {/* Sécurité */}
                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500">
                  <Lock className="w-3 h-3" />
                  <span>Paiement sécurisé SSL</span>
                  <Shield className="w-3 h-3" />
                  <span>Protection acheteur</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* Résumé */}
                <div className="bg-[#020617] border border-[#1e293b] rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Méthode</span>
                    <span className="text-sm text-white font-medium">
                      {paymentMethods.find(m => m.id === selectedMethod)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-[#1e293b]">
                    <span className="text-sm text-slate-400">Total</span>
                    <span className="text-lg font-bold text-white">
                      {amount.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex items-start gap-3 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-400">
                    En cliquant sur "Payer", vous serez redirigé vers la page de paiement sécurisée.
                    Votre accès sera débloqué instantanément après validation.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep('select')}
                    className="flex-1 py-3 border border-[#1e293b] text-slate-400 hover:text-white rounded-xl font-medium text-sm transition-all"
                  >
                    Retour
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePay}
                    disabled={loading}
                    className="flex-[2] py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-green-500/50 disabled:to-emerald-500/50 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Traitement en cours...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Payer {amount.toLocaleString()} FCFA
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#1e293b] bg-[#020617]/50">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-green-400" />
              <span className="text-[10px] text-slate-500">SSL</span>
            </div>
            <div className="w-px h-3 bg-[#1e293b]" />
            <div className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-green-400" />
              <span className="text-[10px] text-slate-500">Crypté</span>
            </div>
            <div className="w-px h-3 bg-[#1e293b]" />
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-green-400" />
              <span className="text-[10px] text-slate-500">Instantané</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}