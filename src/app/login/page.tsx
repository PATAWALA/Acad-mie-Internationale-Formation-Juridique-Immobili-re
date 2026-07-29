'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponent } from '@/lib/supabase/client'; // 👈 Ajuste le chemin vers ton fichier client

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const supabase = createClientComponent();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Authentification
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error('Utilisateur non trouvé');

      // 2. Récupération du rôle dans la table profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        throw new Error('Impossible de récupérer le profil utilisateur.');
      }

      // 3. Redirection conditionnelle selon le rôle
      switch (profile.role) {
        case 'SUPER_ADMIN':
          router.push('/dashboard/admin');
          break;
        case 'TEACHER':
          router.push('/dashboard/enseignant');
          break;
        case 'STUDENT':
        default:
          router.push('/dashboard/etudiant');
          break;
      }
    } catch (err: any) {
      setError(err.message || 'Identifiants incorrects.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '20px', border: '1px solid #334155', borderRadius: '8px', background: '#0f172a', color: '#fff' }}>
      <h2>Espace de Connexion</h2>
      {error && <p style={{ color: '#ef4444' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Adresse Email :</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', background: '#1e293b', border: '1px solid #475569', color: '#fff', borderRadius: '4px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Mot de passe :</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', background: '#1e293b', border: '1px solid #475569', color: '#fff', borderRadius: '4px' }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', background: '#d97706', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Connexion en cours...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}