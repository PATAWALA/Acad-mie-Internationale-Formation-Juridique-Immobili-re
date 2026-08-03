'use client';

import { useState, useEffect } from 'react';
import { AdminProvider, useAdmin } from '@/context/AdminContext';
import AdminSidebar from '@/components/dashboard/admin/AdminSidebar';
import NotificationBell from '@/components/notifications/NotificationBell';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';
import { createClientComponent } from '@/lib/supabase/client';
import { Search } from 'lucide-react';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifKey, setNotifKey] = useState(0);
  const [adminId, setAdminId] = useState<string>('');
  const [adminName, setAdminName] = useState<string>('');
  const supabase = createClientComponent();
  const { collapsed } = useAdmin();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAdminId(user.id);
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        if (profile?.full_name) setAdminName(profile.full_name);
      }
    };
    getUser();
  }, []);

  return (
    <div className="h-screen bg-slate-950 flex overflow-hidden">
      {/* ===== SIDEBAR FIXE ===== */}
      <AdminSidebar />

      {/* ===== ZONE PRINCIPALE ===== */}
      <div 
        className="flex-1 flex flex-col min-w-0 transition-all duration-300"
        style={{ marginLeft: collapsed ? '72px' : '260px' }}
      >
        
        {/* ===== NAVBAR FIXE (même hauteur que le header sidebar) ===== */}
        <header className="flex-shrink-0 h-[73px] bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-5 lg:px-6">
          {/* Gauche */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
              <span className="text-[11px] text-slate-500 font-medium tracking-wide uppercase">
                Administration
              </span>
            </div>
          </div>

          {/* Droite */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Recherche */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-800/80 border border-slate-700/50 rounded-lg px-3 py-1.5 hover:border-slate-600 transition-colors">
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Recherche..."
                className="bg-transparent text-white text-sm placeholder-slate-500 outline-none w-32"
              />
            </div>

            {/* Notifications */}
            {adminId && (
              <div className="relative">
                <NotificationBell 
                  userId={adminId}
                  onClick={() => {
                    setNotifOpen(!notifOpen);
                    setNotifKey(prev => prev + 1);
                  }} 
                />
                <NotificationDropdown 
                  key={notifKey}
                  userId={adminId}
                  isOpen={notifOpen}
                  onClose={() => setNotifOpen(false)}
                />
              </div>
            )}

            {/* Avatar */}
            <div className="flex items-center gap-2 pl-2 lg:pl-3 border-l border-slate-700/50">
              <span className="text-white text-xs font-medium hidden lg:inline">{adminName || 'Admin'}</span>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-violet-500/20 ring-1 ring-slate-700">
                {adminName?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* ===== CONTENU SCROLLABLE ===== */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminProvider>
  );
}