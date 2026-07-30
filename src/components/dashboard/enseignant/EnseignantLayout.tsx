'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEnseignant } from '@/context/EnseignantContext';
import EnseignantSidebar from './EnseignantSidebar';
import EnseignantDashboardView from './EnseignantDashboardView';
import CourseContentManager from './CourseContentManager';
import FormationsListView from './FormationsListView';
import { fadeIn } from '@/lib/animations';
import { cn } from '@/lib/utils';
import {
  GraduationCap,
  Menu,
  LogOut,
  User,
  Settings,
  ChevronDown,
} from 'lucide-react';

type ViewType = 'dashboard' | 'formations' | 'content';

export default function EnseignantLayout() {
  const { profile, loading, assignedCertificates } = useEnseignant();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedCertId, setSelectedCertId] = useState<number | 'all'>('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // --- LOADING STATE ---
  if (loading || !profile) {
    return (
      <div className="flex h-screen bg-slate-950 items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <GraduationCap className="w-10 h-10 text-slate-600" />
          </motion.div>
          <p className="text-sm text-slate-500 font-mono">Chargement...</p>
        </motion.div>
      </div>
    );
  }

  // --- HANDLERS ---
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
    window.location.href = '/login';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // --- RENDER ---
  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 antialiased">
      {/* ========== TOP BAR ========== */}
      <header className="flex items-center justify-between h-12 px-4 border-b border-slate-800 bg-slate-950 flex-shrink-0 z-50">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 -ml-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5">
            <GraduationCap className="w-5 h-5 text-slate-500" />
            <span className="font-semibold text-sm tracking-tight">
              Enseignant
            </span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1">
          {/* Profil */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <div className="w-6 h-6 bg-slate-700 rounded-md flex items-center justify-center text-white text-[10px] font-bold tracking-tight">
                {getInitials(profile.full_name || '??')}
              </div>
              <span className="text-sm text-slate-400 hidden sm:block">
                {profile.full_name?.split(' ')[0]}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-600 hidden sm:block" />
            </button>

            {/* Dropdown */}
            <AnimatePresence>
              {showUserMenu && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowUserMenu(false)}
                    className="fixed inset-0 z-40"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute right-0 mt-2 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="px-3 py-2.5 border-b border-slate-700">
                      <p className="text-sm font-medium text-white">{profile.full_name}</p>
                      <p className="text-xs text-slate-500">{profile.email}</p>
                    </div>
                    <div className="p-1">
                      <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                        <User className="w-4 h-4 text-slate-500" />
                        Paramètres du profil
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ========== BODY ========== */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <div
          className={cn(
            "fixed lg:relative z-50 h-full w-56",
            "transform transition-transform duration-200 ease-out",
            "lg:transform-none",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <EnseignantSidebar
            currentView={currentView}
            onShowAll={handleShowAll}
            onShowFormations={handleShowFormations}
            onCloseMobile={() => setSidebarOpen(false)}
            formationsCount={assignedCertificates.length}
          />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          <div className="p-5 lg:p-8">
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
                <motion.div
                  key="no-cert"
                  {...fadeIn}
                  className="flex flex-col items-center justify-center min-h-[60vh] text-center"
                >
                  <GraduationCap className="w-12 h-12 text-slate-700 mb-5" />
                  <h2 className="text-lg font-semibold text-white mb-2">
                    Aucune formation sélectionnée
                  </h2>
                  <p className="text-sm text-slate-500 max-w-sm">
                    Veuillez choisir une formation dans le menu latéral pour accéder à son contenu.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}