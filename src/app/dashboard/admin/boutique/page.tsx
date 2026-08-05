'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import { fadeIn, stagger } from '@/lib/animations';
import {
  Package, Plus, Pencil, Trash2, Loader2,
  CheckCircle2, XCircle, ImageIcon, Download,
  Book, ShoppingBag, Eye
} from 'lucide-react';
import ProductFormModal from '@/components/dashboard/admin/ProductFormModal';

export default function AdminBoutiquePage() {
  const supabase = createClientComponent();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) fetchProducts();
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditingProduct(null);
    fetchProducts();
  };

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeIn} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-xl">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">📦 Boutique</h1>
            <p className="text-slate-400 text-sm mt-0.5">Gérez les livres et ressources</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" /> Ajouter un produit
        </motion.button>
      </motion.div>

      {/* Stats rapides */}
      <motion.div variants={fadeIn} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: products.length, icon: Package, color: 'blue' },
          { label: 'Physiques', value: products.filter(p => p.type === 'physical').length, icon: Book, color: 'amber' },
          { label: 'Numériques', value: products.filter(p => p.type === 'digital').length, icon: Download, color: 'purple' },
          { label: 'Actifs', value: products.filter(p => p.is_active).length, icon: CheckCircle2, color: 'green' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider">{stat.label}</span>
              <stat.icon className={`w-4 h-4 text-${stat.color}-400`} />
            </div>
            <span className="text-2xl font-bold text-white">{stat.value}</span>
          </div>
        ))}
      </motion.div>

      {/* Tableau */}
      <motion.div variants={fadeIn} className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Aucun produit</h3>
            <p className="text-slate-400 text-sm mb-4">Ajoutez votre premier livre à la boutique.</p>
            <button onClick={handleAdd}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition-colors">
              <Plus className="w-4 h-4" /> Ajouter un produit
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e293b]">
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">Produit</th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">Type</th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">Prix</th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">Stock</th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">Statut</th>
                  <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-[#1e293b]/50 hover:bg-[#1e293b]/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#1e293b] overflow-hidden flex-shrink-0">
                          {product.image_url ? (
                            <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Book className="w-5 h-5 text-slate-600" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{product.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {product.type === 'digital' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-500/10 text-purple-400 text-xs font-bold rounded-full border border-purple-500/20">
                          <Download className="w-3 h-3" /> Numérique
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-full border border-amber-500/20">
                          <Package className="w-3 h-3" /> Physique
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-white font-bold">{product.price.toLocaleString()} FCFA</td>
                    <td className="px-6 py-4">
                      {product.type === 'physical' ? product.stock : '∞'}
                    </td>
                    <td className="px-6 py-4">
                      {product.is_active ? (
                        <span className="inline-flex items-center gap-1 text-green-400 text-xs font-medium">
                          <CheckCircle2 className="w-3 h-3" /> Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 text-xs font-medium">
                          <XCircle className="w-3 h-3" /> Inactif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(product)}
                          className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(product.id)}
                          className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Modal formulaire */}
      {showForm && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => { setShowForm(false); setEditingProduct(null); }}
          onSaved={handleSaved}
        />
      )}
    </motion.div>
  );
}