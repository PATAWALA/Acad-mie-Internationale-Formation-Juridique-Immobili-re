'use client';

import { useState, useEffect } from 'react';
import { useStudent } from '@/context/StudentContext';
import { createClientComponent } from '@/lib/supabase/client';

export default function ProfilView() {
  const { profile, refreshProfile } = useStudent();
  const supabase = createClientComponent();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setEmail(profile.email || '');
    }
  }, [profile]);

  const handleUpdate = async () => {
    setMessage('');
    const updates: any = { full_name: fullName, phone };

    const { error } = await supabase.from('profiles').update(updates).eq('id', profile?.id);
    if (error) {
      setMessage('Erreur : ' + error.message);
    } else {
      setMessage('✅ Profil mis à jour.');
      refreshProfile();
    }
  };

  const handleChangePassword = async () => {
    if (!password || password.length < 6) {
      setMessage('Mot de passe trop court (6 caractères min).');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage('Erreur mot de passe : ' + error.message);
    } else {
      setMessage('✅ Mot de passe changé avec succès.');
      setPassword('');
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', color: '#fff' }}>
      <h1 style={{ fontSize: '22px', marginBottom: '20px' }}>👤 Mon profil</h1>
      {message && (
        <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px', marginBottom: '16px', color: '#94a3b8' }}>
          {message}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Nom complet</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={{ width: '100%', padding: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Téléphone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ width: '100%', padding: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Email (non modifiable)</label>
          <input
            value={email}
            disabled
            style={{ width: '100%', padding: '8px', background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', borderRadius: '4px' }}
          />
        </div>

        <button
          onClick={handleUpdate}
          style={{ padding: '10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Mettre à jour le profil
        </button>

        <hr style={{ borderColor: '#1e293b', margin: '10px 0' }} />

        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Nouveau mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
            style={{ width: '100%', padding: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px' }}
          />
        </div>
        <button
          onClick={handleChangePassword}
          style={{ padding: '10px', background: '#7c2d12', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Changer le mot de passe
        </button>
      </div>
    </div>
  );
}