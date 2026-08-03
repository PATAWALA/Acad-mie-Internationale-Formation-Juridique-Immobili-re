'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponent } from '@/lib/supabase/client';
import { useStudent } from '@/context/StudentContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Loader2, Trophy, Award } from 'lucide-react';
import Sidebar from './Sidebar';
import HomeView from './HomeView';
import FormationView from './FormationView';
import CatalogueView from './CatalogueView';
import MesFormationsView from './MesFormationsView';
import CertificatesView from './CertificatesView'; // 🆕
import ProfilView from './ProfilView';
import SupportView from './SupportForm';
import PaymentModal from './PaymentModal';
import NotificationBell from '@/components/notifications/NotificationBell';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';

type View = 'home' | 'formation' | 'catalogue' | 'mesformations' | 'pending' | 'certificates' | 'profil' | 'support';

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
  const [notifOpen, setNotifOpen] = useState(false);
  
  const [globalStats, setGlobalStats] = useState({
    completedCourses: 0,
    totalCourses: 0,
    hasCertificatAvailable: false,
  });

  const refreshEnrollments = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('enrollments')
      .select('id, certificate_id, payment_status, amount_paid, remaining_balance, certificates(title, image_url)')
      .eq('student_id', profile.id)
      .order('created_at', { ascending: true });
    if (data) setEnrollments(data);
  }, [profile, supabase]);

  const computeGlobalStats = useCallback(async () => {
    if (!profile) return;
    const paidEnrollments = enrollments.filter(e => e.payment_status === 'PAID');
    let totalCourses = 0;
    let completedCourses = 0;

    for (const enr of paidEnrollments) {
      const { data: courses } = await supabase
        .from('courses')
        .select('id')
        .eq('certificate_id', enr.certificate_id);
      
      if (courses) {
        for (const course of courses) {
          totalCourses++;
          const { data: assessments } = await supabase
            .from('assessments')
            .select('id')
            .eq('course_id', course.id);
          const assessmentIds = assessments?.map(a => a.id) ?? [];
          
          if (assessmentIds.length > 0) {
            const { data: submissions } = await supabase
              .from('submissions')
              .select('status')
              .eq('student_id', profile.id)
              .in('assessment_id', assessmentIds);
            
            if (submissions && submissions.every(s => s.status === 'PASSED') && submissions.length === assessmentIds.length) {
              completedCourses++;
            }
          }
        }
      }
    }

    setGlobalStats({
      completedCourses,
      totalCourses,
      hasCertificatAvailable: completedCourses > 0 && completedCourses === totalCourses && totalCourses > 0,
    });
  }, [profile, enrollments, supabase]);

  useEffect(() => {
    refreshEnrollments();
  }, [refreshEnrollments]);

  useEffect(() => {
    computeGlobalStats();
  }, [enrollments, computeGlobalStats]);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading || !profile) {
    return (
      <div className="h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
      </div>
    );
  }

  const sidebarProps = {
    enrollments,
    selectedCertId,
    onSelectFormation: (certId: number) => navigate('formation', 'Formation', certId),
    onAddFormation: () => navigate('catalogue', 'Catalogue des formations'),
    onGoHome: () => navigate('home', 'Tableau de bord'),
    onGoMesFormations: () => navigate('mesformations', 'Mes formations'),
    onGoPending: () => navigate('pending', 'Formations en attente'),
    onGoCertificates: () => navigate('certificates', 'Mes Certificats'), // 🆕
    onGoProfil: () => navigate('profil', 'Mon Profil'),
    onGoSupport: () => navigate('support', 'Aide & Support'),
    onPayClick: (enrollmentId: number, amount: number) => setPaymentModal({ enrollmentId, amount }),
    onLogout: handleLogout,
  };

  return (
    <div className="h-screen bg-[#020617] flex overflow-hidden">
      {/* ===== SIDEBAR DESKTOP ===== */}
      <div className="hidden lg:block flex-shrink-0">
        <Sidebar {...sidebarProps} />
      </div>

      {/* ===== SIDEBAR MOBILE ===== */}
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
              <Sidebar {...sidebarProps} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== ZONE PRINCIPALE ===== */}
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

            {/* Badges + Notifications */}
            <div className="flex items-center gap-3">
              {globalStats.hasCertificatAvailable && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs text-amber-400 font-bold">Certificat disponible</span>
                </motion.div>
              )}
              {globalStats.totalCourses > 0 && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                  <Award className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs text-blue-400 font-medium">
                    {globalStats.completedCourses}/{globalStats.totalCourses} cours
                  </span>
                </div>
              )}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-green-400 font-medium">
                  {enrollments.filter(e => e.payment_status === 'PAID').length} actives
                </span>
              </div>

              {/* 🔔 Cloche de notifications */}
              <div className="relative">
                <NotificationBell 
                  userId={profile.id} 
                  onClick={() => setNotifOpen(!notifOpen)} 
                />
                <NotificationDropdown 
                  userId={profile.id}
                  isOpen={notifOpen}
                  onClose={() => setNotifOpen(false)}
                />
              </div>

              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                {profile?.full_name?.charAt(0) || 'E'}
              </div>
            </div>
          </div>
        </header>

        {/* CONTENU */}
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
                {currentView === 'home' && (
                  <HomeView
                    enrollments={enrollments}
                    profile={profile}
                    onSelectFormation={(certId) => navigate('formation', 'Formation', certId)}
                    onPayClick={(enrollmentId, amount) => setPaymentModal({ enrollmentId, amount })}
                  />
                )}
                {currentView === 'mesformations' && (
                  <MesFormationsView
                    enrollments={enrollments}
                    profile={profile}
                    onSelectFormation={(certId) => navigate('formation', 'Formation', certId)}
                    onPayClick={(enrollmentId, amount) => setPaymentModal({ enrollmentId, amount })}
                    onAddFormation={() => navigate('catalogue', 'Catalogue des formations')}
                  />
                )}
                {currentView === 'pending' && (
                  <MesFormationsView
                    enrollments={enrollments.filter(e => e.payment_status !== 'PAID')}
                    profile={profile}
                    onSelectFormation={(certId) => navigate('formation', 'Formation', certId)}
                    onPayClick={(enrollmentId, amount) => setPaymentModal({ enrollmentId, amount })}
                    onAddFormation={() => navigate('catalogue', 'Catalogue des formations')}
                  />
                )}
                {/* 🆕 Certificats */}
                {currentView === 'certificates' && <CertificatesView />}
                {currentView === 'formation' && selectedCertId && (
                  <FormationView 
                    certId={selectedCertId} 
                    onPaymentSuccess={refreshEnrollments}
                    onPayClick={(enrollmentId, amount) => setPaymentModal({ enrollmentId, amount })}
                  />
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

      {/* MODAL PAIEMENT */}
      <AnimatePresence>
        {paymentModal && (
          <PaymentModal
            isOpen={!!paymentModal}
            onClose={() => setPaymentModal(null)}
            onPay={handlePay}
            amount={paymentModal.amount}
            loading={payLoading}
            profileType={profile?.profile_type || 'Etudiant'}
            totalFormations={enrollments.length}
          />
        )}
      </AnimatePresence>
    </div>
  );
}