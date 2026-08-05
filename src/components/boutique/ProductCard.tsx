'use client';

import { motion } from 'framer-motion';
import { Book, Download, Package, ShoppingBag, Eye } from 'lucide-react';
import { scaleIn } from '@/lib/animations';

interface ProductCardProps {
  product: any;
  onViewDetails?: (product: any) => void;
}

export default function ProductCard({ product, onViewDetails }: ProductCardProps) {
  return (
    <motion.div
      variants={scaleIn}
      whileHover={{ y: -4 }}
      className="group relative bg-[#0f172a] border border-[#1e293b] hover:border-amber-500/30 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5"
    >
      {/* Image */}
      <div className="h-48 bg-[#1e293b] overflow-hidden relative">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Book className="w-12 h-12 text-slate-600" />
          </div>
        )}
        
        {/* Badge type */}
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

        {/* Stock épuisé */}
        {product.type === 'physical' && product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-bold text-sm bg-red-500/90 px-4 py-2 rounded-full">
              Rupture de stock
            </span>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-5">
        <h3 className="text-white font-bold text-sm mb-2 line-clamp-2 group-hover:text-amber-400 transition-colors">
          {product.title}
        </h3>
        
        {product.description && (
          <p className="text-slate-500 text-xs mb-4 line-clamp-2">{product.description}</p>
        )}

        <div className="flex items-end justify-between">
          <div>
            <p className="text-lg font-bold text-amber-400">
              {product.price.toLocaleString()} FCFA
            </p>
          </div>

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onViewDetails?.(product)}
              className="p-2 rounded-xl bg-[#1e293b] text-slate-400 hover:text-white hover:bg-[#334155] transition-colors"
              title="Voir détails"
            >
              <Eye className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onViewDetails?.(product)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-amber-500/20"
            >
              <ShoppingBag className="w-4 h-4" /> Acheter
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}