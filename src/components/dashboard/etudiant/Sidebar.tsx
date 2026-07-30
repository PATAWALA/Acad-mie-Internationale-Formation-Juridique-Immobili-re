'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponent } from '@/lib/supabase/client';
import { useStudent } from '@/context/StudentContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Loader2, GraduationCap } from 'lucide-react';
import Sidebar from './Sidebar';
import HomeView from './HomeView';
import FormationView from './FormationView';
import CatalogueView from './CatalogueView';
import ProfilView from './ProfilView';
import SupportView from './SupportForm';
import PaymentModal from './PaymentModal';

type View = 'home' | 'formation' | 'catalogue' | 'profil' | 'support';

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
  const [scrolled, setScrolled] = useState(false);

  const refreshEnrollments = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('enrollments')
      .select('id, certificate_id, payment_status, remaining_balance, certificates(title)')
      .eq('student_id', profile.id)
      .order('created_at', { ascending: true });
    if (data) setEnrollments(data);
  }, [profile, supabase]);

  useEffect(() => {
    refreshEnrollments();
  }, [refreshEnrollments]);

  // Détecter le scroll pour l'ombre du header
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      setScrolled(target.scrollTop > 10);
    };
    
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.addEventListener('scroll', handleScroll);
      return () => mainContent.removeEventListener('scroll', handleScroll);
    }
  }, []);

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

  // Loading State
  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-10 h-10 text-blue-400" />
          </motion.div>
          <p className="text-slate-400 text-sm font-medium">Préparation de votre espace...</p>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-blue-500 rounded-full"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#020617] flex overflow-hidden">
      {/* ========== SIDEBAR FIXE ========== */}
      {/* Desktop Sidebar */}
      <div className="hidden lg:block flex-shrink-0 h-screen sticky top-0">
        <Sidebar
          enrollments={enrollments}
          selectedCertId={selectedCertId}
          onSelectFormation={(certId) => navigate('formation', 'Formation', certId)}
          onAddFormation={() => navigate('catalogue', 'Catalogue')}
          onGoHome={() => navigate('home', 'Tableau de bord')}
          onGoProfil={() => navigate('profil', 'Mon Profil')}
          onGoSupport={() => navigate('support', 'Support')}
          onPayClick={(enrollmentId, amount) => setPaymentModal({ enrollmentId, amount })}
          onLogout={async () => {
            await supabase.auth.signOut();
            window.location.href = '/login';
          }}
        />
      </div>

      {/* Mobile Sidebar (Overlay) */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            
            {/* Sidebar Mobile */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72"
            >
              <Sidebar
                enrollments={enrollments}
                selectedCertId={selectedCertId}
                onSelectFormation={(certId) => navigate('formation', 'Formation', certId)}
                onAddFormation={() => navigate('catalogue', 'Catalogue')}
                onGoHome={() => navigate('home', 'Tableau de bord')}
                onGoProfil={() => navigate('profil', 'Mon Profil')}
                onGoSupport={() => navigate('support', 'Support')}
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

      {/* ========== ZONE PRINCIPALE (HEADER FIXE + CONTENU SCROLLABLE) ========== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ===== HEADER FIXE ===== */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`sticky top-0 z-30 bg-[#020617]/95 backdrop-blur-xl border-b transition-all ${
            scrolled 
              ? 'border-[#1e293b] shadow-lg shadow-black/10' 
              : 'border-transparent'
          }`}
        >
          <div className="flex items-center justify-between px-4 lg:px-8 py-3 lg:py-4">
            <div className="flex items-center gap-3">
              {/* Burger Menu Mobile */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 hover:bg-[#1e293b] rounded-xl transition-colors"
              >
                <Menu className="w-5 h-5 text-white" />
              </motion.button>

              {/* Logo Mobile */}
              <div className="lg:hidden flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
              </div>

              <div>
                <h1 className="text-lg lg:text-xl font-bold text-white">
                  {currentTitle}
                </h1>
                <p className="text-xs text-slate-400 hidden sm:block">
                  {profile.full_name || profile.email}
                </p>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Badge Formations Actives */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-green-400 font-medium">
                  {enrollments.filter(e => e.payment_status === 'PAID').length} actives
                </span>
              </div>

              {/* User Avatar Mini */}
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                {profile?.full_name?.charAt(0) || 'E'}
              </div>
            </div>
          </div>
        </motion.header>

        {/* ===== CONTENU SCROLLABLE ===== */}
        <main 
          id="main-content"
          className="flex-1 overflow-y-auto overflow-x-hidden"
        >
          <div className="p-4 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView + (selectedCertId || '')}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentView === 'home' && <HomeView enrollments={enrollments} profile={profile} />}
                {currentView === 'formation' && selectedCertId && (
                  <FormationView certId={selectedCertId} onPaymentSuccess={refreshEnrollments} />
                )}
                {currentView === 'catalogue' && (
                  <CatalogueView
                    profile={profile}
                    enrollments={enrollments}
                    onNavigateFormation={(certId) => navigate('formation', 'Formation', certId)}
                    onRefresh={refreshEnrollments}
                  />
                )}
                {currentView === 'profil' && <ProfilView />}
                {currentView === 'support' && <SupportView />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Payment Modal */}
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