import { EnseignantProvider } from '@/context/EnseignantContext';
import EnseignantLayout from '@/components/dashboard/enseignant/EnseignantLayout';

export default function EnseignantDashboardPage() {
  return (
    <EnseignantProvider>
      <EnseignantLayout />
    </EnseignantProvider>
  );
}