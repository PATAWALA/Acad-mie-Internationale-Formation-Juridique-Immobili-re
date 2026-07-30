'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponent } from '@/lib/supabase/client';
import { useStudent } from '@/context/StudentContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Loader2 } from 'lucide-react';
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
    <div className="min-h-screen bg-[#020617] flex">
      {/* Mobile Menu Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-[#0f172a] border border-[#1e293b] rounded-xl text-white hover:border-blue-500/50 transition-all shadow-lg"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </motion.button>

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:flex
      `}>
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

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-y-auto">
        {/* Top Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-20 bg-[#020617]/80 backdrop-blur-xl border-b border-[#1e293b] px-4 lg:px-8 py-4"
        >
          <div className="flex items-center justify-between">
            <div className="ml-12 lg:ml-0">
              <h1 className="text-xl font-bold text-white">{currentTitle}</h1>
              <p className="text-sm text-slate-400 mt-0.5">
                {profile.full_name || profile.email}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-green-400 font-medium">
                  {enrollments.filter(e => e.payment_status === 'PAID').length} formations actives
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Page Content */}
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