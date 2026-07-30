'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponent } from '@/lib/supabase/client';
import { useStudent } from '@/context/StudentContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Loader2 } from 'lucide-react';
import Sidebar from './Sidebar';
import HomeView from './HomeView';
import FormationView from './FormationView';
import CatalogueView from './CatalogueView';
import MesFormationsView from './MesFormationsView';
import ProfilView from './ProfilView';
import SupportView from './SupportForm';
import PaymentModal from './PaymentModal';

type View = 'home' | 'formation' | 'catalogue' | 'mesformations' | 'pending' | 'profil' | 'support';

export default function DashboardLayout() {
  const { profile, loading } = useStudent();
  const supabase = createClientComponent();
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedCertId, setSelectedCertId] = useState<number | null>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [paymentModal, setPaymentModal] = useState<{ enrollmentId: number; amount: number } | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTitle, setCurrentTitle] = useState('Tableau de bord');

  const refreshEnrollments = useCallback(async () => {
  if (!profile) return;
  const { data } = await supabase
    .from('enrollments')
    .select('id, certificate_id, payment_status, amount_paid, remaining_balance, certificates(title)')
    .eq('student_id', profile.id)
    .order('created_at', { ascending: true });
  if (data) setEnrollments(data);
}, [profile, supabase]);

  useEffect(() => {
    refreshEnrollments();
  }, [refreshEnrollments]);

  const navigate = (view: View, title: string, certId?: number) => {
    setCurrentView(view);
    setCurrentTitle(title);
    if (certId) setSelectedCertId(certId);
    else setSelectedCertId(null);
    setSidebarOpen(false);
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
    return (
      <div className="h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#020617] flex overflow-hidden">
      {/* SIDEBAR DESKTOP */}
      <div className="hidden lg:block flex-shrink-0">
        <Sidebar
          enrollments={enrollments}
          selectedCertId={selectedCertId}
          onSelectFormation={(certId) => navigate('formation', 'Formation', certId)}
          onAddFormation={() => navigate('catalogue', 'Catalogue des formations')}
          onGoHome={() => navigate('home', 'Tableau de bord')}
          onGoMesFormations={() => navigate('mesformations', 'Mes formations')}
          onGoPending={() => navigate('pending', 'Formations en attente')}
          onGoProfil={() => navigate('profil', 'Mon Profil')}
          onGoSupport={() => navigate('support', 'Aide & Support')}
          onPayClick={(enrollmentId, amount) => setPaymentModal({ enrollmentId, amount })}
          onLogout={async () => {
            await supabase.auth.signOut();
            window.location.href = '/login';
          }}
        />
      </div>

      {/* SIDEBAR MOBILE */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50"
            >
              <Sidebar
                enrollments={enrollments}
                selectedCertId={selectedCertId}
                onSelectFormation={(certId) => navigate('formation', 'Formation', certId)}
                onAddFormation={() => navigate('catalogue', 'Catalogue des formations')}
                onGoHome={() => navigate('home', 'Tableau de bord')}
                onGoMesFormations={() => navigate('mesformations', 'Mes formations')}
                onGoPending={() => navigate('pending', 'Formations en attente')}
                onGoProfil={() => navigate('profil', 'Mon Profil')}
                onGoSupport={() => navigate('support', 'Aide & Support')}
                onPayClick={(enrollmentId, amount) => setPaymentModal({ enrollmentId, amount })}
                onLogout={async () => {
                  await supabase.auth.signOut();
                  window.location.href = '/login';
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ZONE PRINCIPALE */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER */}
        <header className="flex-shrink-0 bg-[#020617]/95 backdrop-blur-xl border-b border-[#1e293b]">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2">
                <Menu className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-lg lg:text-xl font-bold text-white">{currentTitle}</h1>
                <p className="text-xs text-slate-400 hidden sm:block">{profile.full_name || profile.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-green-400 font-medium">
                  {enrollments.filter(e => e.payment_status === 'PAID').length} actives
                </span>
              </div>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                {profile?.full_name?.charAt(0) || 'E'}
              </div>
            </div>
          </div>
        </header>

        {/* CONTENU SCROLLABLE */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView + (selectedCertId || '')}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* ===== TABLEAU DE BORD ===== */}
                {currentView === 'home' && (
                  <HomeView 
                    enrollments={enrollments} 
                    profile={profile} 
                    onSelectFormation={(certId) => navigate('formation', 'Formation', certId)}
                    onPayClick={(enrollmentId, amount) => setPaymentModal({ enrollmentId, amount })}
                  />
                )}

                {/* ===== MES FORMATIONS ===== */}
                {currentView === 'mesformations' && (
                  <MesFormationsView
                    enrollments={enrollments}
                    onSelectFormation={(certId) => navigate('formation', 'Formation', certId)}
                    onPayClick={(enrollmentId, amount) => setPaymentModal({ enrollmentId, amount })}
                  />
                )}

                {/* ===== EN ATTENTE ===== */}
                {currentView === 'pending' && (
                  <MesFormationsView
                    enrollments={enrollments.filter(e => e.payment_status !== 'PAID')}
                    onSelectFormation={(certId) => navigate('formation', 'Formation', certId)}
                    onPayClick={(enrollmentId, amount) => setPaymentModal({ enrollmentId, amount })}
                  />
                )}

                {/* ===== VUE FORMATION ===== */}
                {currentView === 'formation' && selectedCertId && (
                  <FormationView certId={selectedCertId} onPaymentSuccess={refreshEnrollments} />
                )}

                {/* ===== CATALOGUE ===== */}
                {currentView === 'catalogue' && (
                  <CatalogueView
                    profile={profile}
                    enrollments={enrollments}
                    onNavigateFormation={(certId) => navigate('formation', 'Formation', certId)}
                    onRefresh={refreshEnrollments}
                  />
                )}

                {/* ===== PROFIL ===== */}
                {currentView === 'profil' && <ProfilView />}

                {/* ===== SUPPORT ===== */}
                {currentView === 'support' && <SupportView />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* MODAL PAIEMENT */}
      <AnimatePresence>
        {paymentModal && (
          <PaymentModal
            isOpen={!!paymentModal}
            onClose={() => setPaymentModal(null)}
            onPay={handlePay}
            amount={paymentModal.amount}
            loading={payLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}