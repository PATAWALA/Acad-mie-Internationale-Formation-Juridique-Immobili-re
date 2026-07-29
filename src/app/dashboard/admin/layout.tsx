import { AdminProvider } from '@/context/AdminContext';
import AdminSidebar from '@/components/dashboard/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#020617', color: '#fff' }}>
        <AdminSidebar />
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>{children}</main>
      </div>
    </AdminProvider>
  );
}