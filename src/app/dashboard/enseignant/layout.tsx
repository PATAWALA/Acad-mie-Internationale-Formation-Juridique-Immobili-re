import { EnseignantProvider } from '@/context/EnseignantContext';
import EnseignantLayout from '@/components/dashboard/enseignant/EnseignantLayout';

export default function EnseignantDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <EnseignantProvider>
      <EnseignantLayout />
    </EnseignantProvider>
  );
}