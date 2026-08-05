'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import { fadeIn, stagger } from '@/lib/animations';
import {
  BookOpen, ShoppingBag, Search, Package, Download, Book, 
  Loader2, Sparkles, Shield, Truck, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/boutique/ProductCard';
import ProductModal from '@/components/boutique/ProductModal';

export default function BoutiquePage() {
  const supabase = createClientComponent();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'physical' | 'digital'>('all');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (data) setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const filtered = products.filter(p => {
    const matchSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filter === 'all' || p.type === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* Hero */}
      <section className="relative pt-28 pb-16 px-4 max-w-7xl mx-auto">
        <motion.div {...fadeIn} className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-400 font-medium">Boutique Officielle</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 font-['Playfair_Display']">
            📚 Livres & Ressources Juridiques
          </h1>
          <p className="text-slate-400 text-lg">
            Découvrez les ouvrages du Dr. Jean-Louis LOBÉ. Livres physiques et numériques pour maîtriser le droit et l&apos;immobilier.
          </p>
        </motion.div>
      </section>

      {/* Barre de recherche + filtres - FIXÉE SOUS LA NAVBAR */}
      <div className="sticky top-[64px] lg:top-[80px] z-30 bg-[#020617]/95 backdrop-blur-xl border-y border-[#1e293b] py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher un livre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#0f172a] border border-[#1e293b] rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'Tout' },
              { key: 'physical', label: '📦 Physiques' },
              { key: 'digital', label: '📱 Numériques' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as any)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === f.key
                    ? 'bg-amber-500 text-white'
                    : 'bg-[#0f172a] text-slate-400 hover:text-white border border-[#1e293b]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grille produits */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Aucun produit trouvé</h3>
            <p className="text-slate-400">Essayez de modifier votre recherche.</p>
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filtered.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onViewDetails={() => setSelectedProduct(product)}
              />
            ))}
          </motion.div>
        )}
      </section>

      {/* Footer boutique */}
      <section className="py-12 px-4 border-t border-[#1e293b]">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-6 text-center">
          <div className="p-4">
            <Shield className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <h4 className="text-white font-semibold mb-1">Paiement Sécurisé</h4>
            <p className="text-slate-400 text-sm">Wave, Orange Money, Cartes</p>
          </div>
          <div className="p-4">
            <Truck className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <h4 className="text-white font-semibold mb-1">Livraison Rapide</h4>
            <p className="text-slate-400 text-sm">Partout en Côte d&apos;Ivoire</p>
          </div>
          <div className="p-4">
            <Download className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <h4 className="text-white font-semibold mb-1">Accès Immédiat</h4>
            <p className="text-slate-400 text-sm">Livres numériques disponibles instantanément</p>
          </div>
        </div>
      </section>

      {/* Modal produit */}
      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}