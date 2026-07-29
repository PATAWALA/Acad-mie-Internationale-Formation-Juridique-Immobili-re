'use client';

import { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';

export function CreateTeacherModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { refreshUsers } = useAdmin();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/create-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la création');
      }

      alert(`✅ Compte Enseignant créé avec succès pour ${fullName} !`);
      
      // Réinitialisation et fermeture
      setFullName('');
      setEmail('');
      setPhone('');
      setPassword('');
      refreshUsers();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '28px', width: '100%', maxWidth: '480px', color: '#fff'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>👨‍🏫 Créer un nouveau Formateur / Enseignant</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#f87171', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Nom complet *</label>
            <input
              type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="ex: Prof. Kouassi Jean"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Adresse Email *</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="enseignant@academie.com"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Téléphone</label>
            <input
              type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+225 0700000000"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Mot de passe initial *</label>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button" onClick={onClose}
              style={{ padding: '8px 16px', borderRadius: '6px', background: '#334155', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              Annuler
            </button>
            <button
              type="submit" disabled={loading}
              style={{ padding: '8px 16px', borderRadius: '6px', background: '#8b5cf6', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {loading ? 'Création en cours...' : 'Créer l\'Enseignant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}