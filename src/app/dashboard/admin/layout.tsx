'use client';

import { AdminProvider, useAdmin } from '@/context/AdminContext';
import AdminSidebar from '@/components/dashboard/admin/AdminSidebar';
import { cn } from '@/lib/utils';

function MainContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useAdmin();

  return (
    <main
      className={cn(
        'flex-1 overflow-y-auto transition-all duration-300',
        collapsed ? 'ml-[72px]' : 'ml-[260px]'
      )}
    >
      <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-1 w-1 rounded-full bg-violet-500 animate-pulse" />
          <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">
            Espace Administration
          </p>
        </div>
        {children}
      </div>
    </main>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <div className="flex min-h-screen bg-slate-950">
        <AdminSidebar />
        <MainContent>{children}</MainContent>
      </div>
    </AdminProvider>
  );
}