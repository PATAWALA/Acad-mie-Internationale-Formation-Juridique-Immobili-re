'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import { ArrowRight, BookOpen, ShoppingBag, Sparkles, Book, Download, Package } from 'lucide-react';
import Link from 'next/link';

export default function BoutiqueSection() {
  const supabase = createClientComponent();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);
      if (data) setFeaturedProducts(data);
    };
    fetchFeatured();
  }, []);

  if (featuredProducts.length === 0) return null;

  return (
    <section className="py-20 px-4 max-w-7xl mx-auto">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-6">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-sm text-amber-400 font-medium">📚 Ressources exclusives</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-['Playfair_Display'] text-white mb-4">
          Approfondissez vos connaissances
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Découvrez les ouvrages du Dr. Jean-Louis LOBÉ. Des livres physiques et numériques pour maîtriser le droit et l&apos;immobilier.
        </p>
      </motion.div>

      {/* Grille des livres vedettes */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {featuredProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
            className="group bg-[#0f172a] border border-[#1e293b] hover:border-amber-500/30 rounded-2xl overflow-hidden transition-all duration-300"
          >
            {/* Image */}
            <div className="h-48 bg-[#1e293b] overflow-hidden relative">
              {product.image_url ? (
                <img src={product.image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Book className="w-12 h-12 text-slate-600" />
                </div>
              )}
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
            <div className="p-5">
              <h3 className="text-white font-bold text-sm mb-2 line-clamp-2 group-hover:text-amber-400 transition-colors">
                {product.title}
              </h3>
              <div className="flex items-end justify-between">
                <p className="text-lg font-bold text-amber-400">{product.price.toLocaleString()} FCFA</p>
                <Link
                  href="/boutique"
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors"
                >
                  Voir plus <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA Boutique */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <Link
          href="/boutique"
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 text-lg group"
        >
          <ShoppingBag className="w-6 h-6" />
          <span>Découvrir toute la boutique</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
        <p className="text-slate-500 text-sm mt-3">
          Livraison partout en Côte d&apos;Ivoire • Paiement sécurisé
        </p>
      </motion.div>
    </section>
  );
}