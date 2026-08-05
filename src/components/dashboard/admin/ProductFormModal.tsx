'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import { scaleIn } from '@/lib/animations';
import { cn } from '@/lib/utils';
import {
  X, Book, DollarSign, FileText, Image as ImageIcon,
  Upload, Save, Loader2, AlertCircle, CheckCircle2,
  Download, Package
} from 'lucide-react';

interface ProductFormModalProps {
  product: any | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function ProductFormModal({ product, onClose, onSaved }: ProductFormModalProps) {
  const supabase = createClientComponent();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [type, setType] = useState<'physical' | 'digital'>('physical');
  const [stock, setStock] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!product;

  useEffect(() => {
    if (product) {
      setTitle(product.title || '');
      setDescription(product.description || '');
      setPrice(product.price || 0);
      setType(product.type || 'physical');
      setStock(product.stock || 0);
      setIsActive(product.is_active ?? true);
      setImagePreview(product.image_url || null);
    }
  }, [product]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Format image requis (JPG, PNG, WebP)'); return; }
    if (file.size > 2 * 1024 * 1024) { setError('Image trop volumineuse (max 2 Mo)'); return; }
    setImageFile(file);
    setError('');
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return product?.image_url || null;
    setUploading(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `products/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { error } = await supabase.storage.from('products').upload(fileName, imageFile);
      if (error) throw error;
      const { data: publicUrlData } = supabase.storage.from('products').getPublicUrl(fileName);
      return publicUrlData.publicUrl;
    } catch (err: any) {
      throw new Error('Erreur upload : ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Le titre est obligatoire'); return; }
    if (price <= 0) { setError('Le prix doit être supérieur à 0'); return; }
    setLoading(true);
    setError('');

    try {
      const imageUrl = await uploadImage();
      const payload = { title, description, price, type, stock: type === 'digital' ? 0 : stock, is_active: isActive, image_url: imageUrl };

      if (isEditing) {
        await supabase.from('products').update(payload).eq('id', product.id);
      } else {
        await supabase.from('products').insert(payload);
      }
      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}>
        <motion.div variants={scaleIn} initial="initial" animate="animate" exit="initial"
          onClick={(e) => e.stopPropagation()}
          className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="sticky top-0 bg-[#0f172a] px-6 py-5 border-b border-[#1e293b] flex items-center justify-between rounded-t-2xl z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-xl">
                {isEditing ? <Book className="w-5 h-5 text-amber-400" /> : <Book className="w-5 h-5 text-amber-400" />}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{isEditing ? 'Modifier le produit' : 'Nouveau produit'}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{isEditing ? 'Modifier les informations' : 'Ajouter un livre à la boutique'}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {error && (
              <div className="flex items-center gap-3 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Image */}
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                  <ImageIcon className="w-3.5 h-3.5" /> Image du produit
                </label>
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-[#1e293b] h-40 mb-2">
                    <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="absolute top-2 right-2 p-1.5 bg-red-500/80 rounded-lg text-white hover:bg-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#1e293b] hover:border-amber-500/30 rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer transition-colors mb-2">
                    <Upload className="w-8 h-8 text-slate-600 mb-2" />
                    <p className="text-sm text-slate-400">Cliquez pour ajouter une image</p>
                    <p className="text-xs text-slate-500 mt-1">JPG, PNG, WebP • Max 2 Mo</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              </div>

              {/* Titre */}
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                  <FileText className="w-3.5 h-3.5" /> Titre *
                </label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                  placeholder="Ex: Guide Pratique du Droit Immobilier"
                  className="w-full px-4 py-2.5 bg-[#1e293b] border border-[#1e293b] rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-all" />
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                  <FileText className="w-3.5 h-3.5" /> Description
                </label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                  placeholder="Description du livre..."
                  className="w-full px-4 py-2.5 bg-[#1e293b] border border-[#1e293b] rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-all resize-none" />
              </div>

              {/* Prix */}
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                  <DollarSign className="w-3.5 h-3.5" /> Prix (FCFA) *
                </label>
                <input type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))} required
                  className="w-full px-4 py-2.5 bg-[#1e293b] border border-[#1e293b] rounded-xl text-white text-sm focus:outline-none focus:border-amber-500/50 transition-all" />
              </div>

              {/* Type + Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-[#1e293b] border border-[#1e293b] rounded-xl text-white text-sm focus:outline-none focus:border-amber-500/50 transition-all">
                    <option value="physical">📦 Physique</option>
                    <option value="digital">📱 Numérique</option>
                  </select>
                </div>
                {type === 'physical' && (
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Stock</label>
                    <input type="number" min={0} value={stock} onChange={(e) => setStock(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-[#1e293b] border border-[#1e293b] rounded-xl text-white text-sm focus:outline-none focus:border-amber-500/50 transition-all" />
                  </div>
                )}
              </div>

              {/* Actif / Inactif */}
              <div className="flex items-center justify-between p-4 bg-[#1e293b] rounded-xl">
                <span className="text-sm text-slate-300">Produit visible dans la boutique</span>
                <button type="button" onClick={() => setIsActive(!isActive)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${isActive ? 'bg-green-500' : 'bg-slate-600'}`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${isActive ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1e293b]">
                <button type="button" onClick={onClose}
                  className="px-4 py-2.5 bg-[#1e293b] text-slate-300 text-sm font-medium rounded-xl hover:bg-[#334155] transition-colors">Annuler</button>
                <button type="submit" disabled={loading || uploading}
                  className={cn("px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20", (loading || uploading) && "opacity-70")}>
                  {loading || uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isEditing ? 'Mettre à jour' : 'Créer le produit'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}