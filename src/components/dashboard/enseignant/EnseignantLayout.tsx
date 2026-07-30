'use client';

import { useState } from 'react';
import { useEnseignant } from '@/context/EnseignantContext';
import EnseignantSidebar from './EnseignantSidebar';
import EnseignantDashboardView from './EnseignantDashboardView';
import CourseContentManager from './CourseContentManager';

export default function EnseignantLayout() {
  const { profile, loading, assignedCertificates } = useEnseignant();
  const [currentView, setCurrentView] = useState<'dashboard' | 'content'>('dashboard');
  const [selectedCertId, setSelectedCertId] = useState<number | 'all'>('all');

  if (loading || !profile) {
    return <div style={{ color: '#fff', padding: '40px' }}>Chargement...</div>;
  }

  const handleSelectCert = (id: number) => {
    setSelectedCertId(id);
    setCurrentView('dashboard');
  };

  const handleShowAll = () => {
    setSelectedCertId('all');
    setCurrentView('dashboard');
  };

  const handleManageContent = (certId: number) => {
    setSelectedCertId(certId);
    setCurrentView('content');
  };

  const handleLogout = async () => {
    const { createClientComponent } = await import('@/lib/supabase/client');
    const supabase = createClientComponent();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#020617', color: '#fff' }}>
      <EnseignantSidebar
        assignedCertificates={assignedCertificates}
        selectedCertId={selectedCertId}
        currentView={currentView}
        onSelectCert={handleSelectCert}
        onShowAll={handleShowAll}
        onManageContent={handleManageContent}
        onLogout={handleLogout}
        profile={profile}
      />
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {currentView === 'dashboard' && (
          <EnseignantDashboardView certId={selectedCertId} profile={profile} />
        )}
        {currentView === 'content' && selectedCertId !== 'all' && (
          <CourseContentManager certId={selectedCertId} profile={profile} />
        )}
        {currentView === 'content' && selectedCertId === 'all' && (
          <p style={{ color: '#94a3b8' }}>Sélectionnez un certificat pour gérer son contenu.</p>
        )}
      </main>
    </div>
  );
}