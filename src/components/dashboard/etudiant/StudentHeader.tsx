'use client';

import { createClientComponent } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function StudentHeader({ profile }: { profile: any }) {
  const supabase = createClientComponent();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #1e293b', paddingBottom: '20px' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '24px' }}>🎓 Espace Étudiant</h1>
        <p style={{ color: '#94a3b8', margin: '5px 0 0 0', fontSize: '14px' }}>
          Bienvenue, {profile?.full_name || profile?.email}
        </p>
      </div>
      <button
        onClick={handleSignOut}
        style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
      >
        Déconnexion
      </button>
    </header>
  );
}