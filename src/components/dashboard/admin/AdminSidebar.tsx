'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientComponent } from '@/lib/supabase/client';

export default function AdminSidebar() {
  const supabase = createClientComponent();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside style={{
      width: '240px',
      background: '#0f172a',
      borderRight: '1px solid #1e293b',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      minHeight: '100vh',
      boxSizing: 'border-box'
    }}>
      <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '20px' }}>
        ⚙️ Admin Panel
      </div>
      <Link href="/dashboard/admin" style={linkStyle}>
  📊 Tableau de bord
</Link>
<Link href="/dashboard/admin/users" style={linkStyle}>
  👥 Utilisateurs
</Link>
<Link href="/dashboard/admin/cours" style={linkStyle}>
  📚 Cours
</Link>
<Link href="/dashboard/admin/certificats" style={linkStyle}>
  🎓 Certificats
</Link>
<Link href="/dashboard/admin/certificats/emettre" style={linkStyle}>
  📜 Émettre certificats
</Link>

<Link href="/dashboard/admin/assignations" style={linkStyle}>
  👨‍🏫 Assignations
</Link>
<Link href="/dashboard/admin/questions" style={linkStyle}>
  ❓ Support
</Link>
<Link href="/dashboard/admin/parametres" style={linkStyle}>
  ⚙️ Paramètres
</Link>
      <div style={{ marginTop: 'auto' }}>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '8px 0', textAlign: 'left', width: '100%' }}>
          🚪 Déconnexion
        </button>
      </div>
    </aside>
  );
}

const linkStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: '6px',
  color: '#cbd5e1',
  textDecoration: 'none',
  fontSize: '14px',
  display: 'block',
};