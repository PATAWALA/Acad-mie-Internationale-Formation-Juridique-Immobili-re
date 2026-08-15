'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEnseignant } from '@/context/EnseignantContext';
import EnseignantSidebar from './EnseignantSidebar';
import EnseignantDashboardView from './EnseignantDashboardView';
import CourseContentManager from './CourseContentManager';
import FormationsListView from './FormationsListView';
import NotificationBell from '@/components/notifications/NotificationBell';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';
import ProfileSettingsModal from './ProfileSettingsModal';
import { fadeIn } from '@/lib/animations';
import {
  GraduationCap,
  Menu,
  Award,
} from 'lucide-react';

type ViewType = 'dashboard' | 'formations' | 'content';

export default function EnseignantLayout() {
  const { profile, loading, assignedCertificates } = useEnseignant();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedCertId, setSelectedCertId] = useState<number | 'all'>('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  if (loading || !profile) {
    return (
      <div className="h-screen bg-[#020617] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <GraduationCap className="w-10 h-10 text-blue-400" />
          </motion.div>
          <p className="text-slate-400 text-sm">Chargement de votre espace...</p>
        </motion.div>
      </div>
    );
  }

  const handleShowAll = () => {
    setSelectedCertId('all');
    setCurrentView('dashboard');
    setSidebarOpen(false);
  };

  const handleShowFormations = () => {
    setCurrentView('formations');
    setSidebarOpen(false);
  };

  const handleSelectCert = (certId: number) => {
    setSelectedCertId(certId);
    setCurrentView('dashboard');
    setSidebarOpen(false);
  };

  const handleManageContent = (certId: number) => {
    setSelectedCertId(certId);
    setCurrentView('content');
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    const { createClientComponent } = await import('@/lib/supabase/client');
    const supabase = createClientComponent();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="h-screen bg-[#020617] flex overflow-hidden">
      {/* ===== SIDEBAR DESKTOP ===== */}
      <div className="hidden lg:block flex-shrink-0">
        <EnseignantSidebar
          currentView={currentView}
          onShowAll={handleShowAll}
          onShowFormations={handleShowFormations}
          onCloseMobile={() => setSidebarOpen(false)}
          formationsCount={assignedCertificates.length}
          onLogout={handleLogout}
        />
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
              <EnseignantSidebar
                currentView={currentView}
                onShowAll={handleShowAll}
                onShowFormations={handleShowFormations}
                onCloseMobile={() => setSidebarOpen(false)}
                formationsCount={assignedCertificates.length}
                onLogout={handleLogout}
              />
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
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 hover:bg-[#1e293b] rounded-xl transition-colors"
              >
                <Menu className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Award className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg lg:text-xl font-bold text-white">Espace Formateur</h1>
                  <p className="text-xs text-slate-400 hidden sm:block">{profile.full_name || profile.email}</p>
                </div>
              </div>
            </div>

            {/* 🔔 Notifications + Avatar */}
            <div className="flex items-center gap-3">
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
                {getInitials(profile.full_name || '??')}
              </div>
            </div>
          </div>
        </header>

        {/* CONTENU SCROLLABLE */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8">
            <AnimatePresence mode="wait">
              {currentView === 'dashboard' && (
                <motion.div key="dashboard" {...fadeIn}>
                  <EnseignantDashboardView
                    certId={selectedCertId}
                    profile={profile}
                    onManageContent={handleManageContent}
                    assignedCertificates={assignedCertificates}
                    onSelectCert={handleSelectCert}
                    onShowAll={handleShowAll}
                  />
                </motion.div>
              )}

              {currentView === 'formations' && (
                <motion.div key="formations" {...fadeIn}>
                  <FormationsListView
                    formations={assignedCertificates}
                    onSelectFormation={handleSelectCert}
                    onManageContent={handleManageContent}
                    selectedCertId={selectedCertId}
                  />
                </motion.div>
              )}

              {currentView === 'content' && selectedCertId !== 'all' && (
                <motion.div key="content" {...fadeIn}>
                  <CourseContentManager
                    certId={selectedCertId as number}
                    profile={profile}
                  />
                </motion.div>
              )}

              {currentView === 'content' && selectedCertId === 'all' && (
                <motion.div key="no-cert" {...fadeIn} className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                  <GraduationCap className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <h2 className="text-lg font-semibold text-white mb-2">Aucune formation sélectionnée</h2>
                  <p className="text-sm text-slate-400 max-w-sm">Veuillez choisir une formation dans le menu latéral pour accéder à son contenu.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}