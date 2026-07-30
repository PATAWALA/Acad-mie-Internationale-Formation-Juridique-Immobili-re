'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEnseignant } from '@/context/EnseignantContext';
import EnseignantSidebar from './EnseignantSidebar';
import EnseignantDashboardView from './EnseignantDashboardView';
import CourseContentManager from './CourseContentManager';
import { fadeIn } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { BookOpen, GraduationCap, Loader2 } from 'lucide-react';

export default function EnseignantLayout() {
  const { profile, loading, assignedCertificates } = useEnseignant();
  const [currentView, setCurrentView] = useState<'dashboard' | 'content'>('dashboard');
  const [selectedCertId, setSelectedCertId] = useState<number | 'all'>('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading || !profile) {
    return (
      <div className="flex min-h-screen bg-slate-950 items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mx-auto mb-6"
          >
            <GraduationCap className="w-16 h-16 text-violet-500" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Chargement de votre espace
          </h1>
          <p className="text-slate-400 text-sm">
            Préparation de votre tableau de bord...
          </p>
          <div className="mt-6 flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-violet-500 rounded-full"
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  const handleSelectCert = (id: number) => {
    setSelectedCertId(id);
    setCurrentView('dashboard');
    setSidebarOpen(false);
  };

  const handleShowAll = () => {
    setSelectedCertId('all');
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

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen",
          "transform transition-transform duration-300 ease-in-out",
          "lg:transform-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
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
      </div>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-sm font-medium">Menu</span>
          </button>
        </div>

        <div className="p-4 lg:p-8">
          <AnimatePresence mode="wait">
            {currentView === 'dashboard' && (
              <motion.div
                key="dashboard"
                {...fadeIn}
              >
                <EnseignantDashboardView certId={selectedCertId} profile={profile} />
              </motion.div>
            )}

            {currentView === 'content' && selectedCertId !== 'all' && (
              <motion.div
                key="content"
                {...fadeIn}
              >
                <CourseContentManager certId={selectedCertId} profile={profile} />
              </motion.div>
            )}

            {currentView === 'content' && selectedCertId === 'all' && (
              <motion.div
                key="no-cert"
                {...fadeIn}
                className="flex flex-col items-center justify-center min-h-[60vh] text-center"
              >
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                  <BookOpen className="w-10 h-10 text-slate-600" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Sélectionnez un certificat
                </h2>
                <p className="text-slate-400 max-w-md">
                  Choisissez une formation dans la sidebar pour gérer son contenu pédagogique.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}