// app/dashboard/etudiant/layout.tsx
import { StudentProvider } from '@/context/StudentContext';
import DashboardLayout from '@/components/dashboard/etudiant/DashboardLayout';

export default function EtudiantLayout({ children }: { children: React.ReactNode }) {
  return (
    <StudentProvider>
      <DashboardLayout />
    </StudentProvider>
  );
}