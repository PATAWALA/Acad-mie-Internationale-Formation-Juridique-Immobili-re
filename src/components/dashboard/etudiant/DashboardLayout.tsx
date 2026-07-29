'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponent } from '@/lib/supabase/client';
import { useStudent } from '@/context/StudentContext';
import Sidebar from './Sidebar';
import HomeView from './HomeView';
import FormationView from './FormationView';
import CatalogueView from './CatalogueView';
import ProfilView from './ProfilView';
import SupportView from './SupportForm'; // <-- nouvelle vue
import PaymentModal from './PaymentModal'; // modal de paiement (Wave, PayPal, Virement)

type View = 'home' | 'formation' | 'catalogue' | 'profil' | 'support';

export default function DashboardLayout() {
  const { profile, loading } = useStudent();
  const supabase = createClientComponent();
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedCertId, setSelectedCertId] = useState<number | null>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  // État pour le modal de paiement
  const [paymentModal, setPaymentModal] = useState<{ enrollmentId: number; amount: number } | null>(null);
  const [payLoading, setPayLoading] = useState(false);

  // Fonction de rafraîchissement centralisée des enrollments
  const refreshEnrollments = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('enrollments')
      .select('id, certificate_id, payment_status, remaining_balance, certificates(title)')
      .eq('student_id', profile.id)
      .order('created_at', { ascending: true });
    if (data) setEnrollments(data);
  }, [profile, supabase]);

  // Charger les enrollments au premier chargement
  useEffect(() => {
    refreshEnrollments();
  }, [refreshEnrollments]);

  // Navigation depuis la sidebar
  const handleSelectFormation = (certId: number) => {
    setSelectedCertId(certId);
    setCurrentView('formation');
  };

  const handleAddFormation = () => {
    setCurrentView('catalogue');
  };

  const handleGoHome = () => {
    setCurrentView('home');
    setSelectedCertId(null);
  };

  const handleGoProfil = () => {
    setCurrentView('profil');
  };

  const handleGoSupport = () => {
    setCurrentView('support');
    setSelectedCertId(null);
  };

  // Gestion du paiement via modal
  const handleOpenPaymentModal = (enrollmentId: number, amount: number) => {
    setPaymentModal({ enrollmentId, amount });
  };

  const handlePay = async (method: 'wave' | 'paypal' | 'bank') => {
    if (!paymentModal) return;
    setPayLoading(true);
    const { error } = await supabase
      .from('enrollments')
      .update({
        payment_status: 'PAID',
        amount_paid: paymentModal.amount,
        remaining_balance: 0,
      })
      .eq('id', paymentModal.enrollmentId);

    if (!error) {
      setPaymentModal(null);
      await refreshEnrollments();
    } else {
      alert('Erreur : ' + error.message);
    }
    setPayLoading(false);
  };

  if (loading || !profile) {
    return <div style={{ color: '#fff', padding: '40px' }}>Chargement...</div>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#020617', color: '#fff' }}>
      <Sidebar
        enrollments={enrollments}
        selectedCertId={selectedCertId}
        onSelectFormation={handleSelectFormation}
        onAddFormation={handleAddFormation}
        onGoHome={handleGoHome}
        onGoProfil={handleGoProfil}
        onGoSupport={handleGoSupport}       // nouvelle prop
        onPayClick={handleOpenPaymentModal} // ouvre le modal de paiement
        onLogout={async () => {
          await supabase.auth.signOut();
          window.location.href = '/login';
        }}
      />

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {currentView === 'home' && <HomeView enrollments={enrollments} profile={profile} />}
        {currentView === 'formation' && selectedCertId && (
          <FormationView certId={selectedCertId} onPaymentSuccess={refreshEnrollments} />
        )}
        {currentView === 'catalogue' && (
          <CatalogueView
            profile={profile}
            enrollments={enrollments}
            onNavigateFormation={handleSelectFormation}
            onRefresh={refreshEnrollments}
          />
        )}
        {currentView === 'profil' && <ProfilView />}
        {currentView === 'support' && <SupportView />}
      </main>

      {/* Modal de paiement Wave / PayPal / Virement */}
      {paymentModal && (
        <PaymentModal
          isOpen={!!paymentModal}
          onClose={() => setPaymentModal(null)}
          onPay={handlePay}
          amount={paymentModal.amount}
          loading={payLoading}
        />
      )}
    </div>
  );
}