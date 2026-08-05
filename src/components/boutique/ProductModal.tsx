'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { scaleIn } from '@/lib/animations';
import {
  X, Book, Download, Package, ShoppingBag, 
  Truck, Shield, CreditCard, Sparkles
} from 'lucide-react';

interface ProductModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            variants={scaleIn}
            initial="initial"
            animate="animate"
            exit="initial"
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {/* Image */}
            <div className="h-56 bg-[#1e293b] rounded-t-2xl overflow-hidden relative">
              {product.image_url ? (
                <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Book className="w-16 h-16 text-slate-600" />
                </div>
              )}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute top-3 left-3">
                {product.type === 'digital' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-500/90 text-white rounded-full text-[10px] font-bold backdrop-blur-sm">
                    <Download className="w-3 h-3" /> Numérique
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/90 text-white rounded-full text-[10px] font-bold backdrop-blur-sm">
                    <Package className="w-3 h-3" /> Physique
                  </span>
                )}
              </div>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">{product.title}</h2>
                {product.description && (
                  <p className="text-slate-400 text-sm leading-relaxed">{product.description}</p>
                )}
              </div>

              {/* Prix */}
              <div className="flex items-center justify-between p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                <span className="text-slate-400 text-sm">Prix</span>
                <span className="text-2xl font-bold text-amber-400">{product.price.toLocaleString()} FCFA</span>
              </div>

              {/* Infos livraison */}
              <div className="grid grid-cols-2 gap-3">
                {product.type === 'physical' ? (
                  <>
                    <div className="flex items-center gap-2 p-3 bg-[#020617] rounded-xl">
                      <Truck className="w-4 h-4 text-amber-400" />
                      <span className="text-xs text-slate-400">Livraison sous 3-5 jours</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-[#020617] rounded-xl">
                      <Package className="w-4 h-4 text-amber-400" />
                      <span className="text-xs text-slate-400">Stock : {product.stock || 0}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 p-3 bg-[#020617] rounded-xl">
                      <Download className="w-4 h-4 text-purple-400" />
                      <span className="text-xs text-slate-400">Téléchargement immédiat</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-[#020617] rounded-xl">
                      <Shield className="w-4 h-4 text-purple-400" />
                      <span className="text-xs text-slate-400">Format PDF</span>
                    </div>
                  </>
                )}
              </div>

              {/* Bouton Acheter */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20"
              >
                <ShoppingBag className="w-5 h-5" /> Acheter maintenant
                <CreditCard className="w-5 h-5" />
              </motion.button>

              <p className="text-center text-xs text-slate-500">
                Paiement sécurisé via Wave, Orange Money, Cartes bancaires
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}