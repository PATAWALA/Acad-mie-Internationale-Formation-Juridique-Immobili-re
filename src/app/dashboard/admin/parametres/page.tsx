'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponent } from '@/lib/supabase/client';

export default function AdminParametresPage() {
  const supabase = createClientComponent();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!prof || (prof.role !== 'ADMIN' && prof.role !== 'SUPER_ADMIN')) {
        router.push('/dashboard/etudiant');
        return;
      }

      setProfile(prof);
      setFullName(prof.full_name || '');
      setPhone(prof.phone || '');
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    setMessage('');
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone })
      .eq('id', profile.id);
    if (error) {
      setMessage('Erreur : ' + error.message);
    } else {
      setMessage('✅ Profil mis à jour.');
    }
  };

  const handleChangePassword = async () => {
    if (password.length < 6) {
      setMessage('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage('Erreur : ' + error.message);
    } else {
      setMessage('✅ Mot de passe changé.');
      setPassword('');
    }
  };

  if (loading) return <div style={{ color: '#fff', padding: '32px' }}>Chargement...</div>;

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '24px' }}>⚙️ Paramètres administrateur</h1>

      <section style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>👤 Mon profil</h2>
        {message && (
          <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px', marginBottom: '16px', color: '#94a3b8' }}>
            {message}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Nom complet</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Téléphone</label>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
          </div>
          <button onClick={handleUpdateProfile} style={primaryBtnStyle}>Mettre à jour</button>

          <hr style={{ borderColor: '#1e293b', margin: '12px 0' }} />

          <div>
            <label style={labelStyle}>Nouveau mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" style={inputStyle} />
          </div>
          <button onClick={handleChangePassword} style={{ ...primaryBtnStyle, background: '#7c2d12' }}>Changer le mot de passe</button>
        </div>
      </section>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px' };
const primaryBtnStyle: React.CSSProperties = { padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', alignSelf: 'flex-start' };