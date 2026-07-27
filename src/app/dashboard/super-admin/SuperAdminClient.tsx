'use client';

import { useState, useEffect } from 'react';
import { createClientComponent } from '@/lib/supabase/client';
import MetricsCards from '@/components/super-admin/MetricsCards';
import StudentsList from '@/components/super-admin/StudentsList';
import TeachersList from '@/components/super-admin/TeachersList';
import CertificatesList from '@/components/super-admin/CertificatesList';
import FinancesList from '@/components/super-admin/FinancesList';

interface Metrics {
  totalStudents: number;
  totalTeachers: number;
  totalCertificates: number;
  totalPaid: number;
}

type Tab = 'students' | 'teachers' | 'certificates' | 'finances';

export default function SuperAdminClient() {
  const [metrics, setMetrics] = useState<Metrics>({
    totalStudents: 0,
    totalTeachers: 0,
    totalCertificates: 0,
    totalPaid: 0,
  });
  const [activeTab, setActiveTab] = useState<Tab>('students');
  const supabase = createClientComponent();

  useEffect(() => {
    const fetchMetrics = async () => {
      const { count: students } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'STUDENT');
      const { count: teachers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'TEACHER');
      const { count: certificates } = await supabase.from('certificates').select('*', { count: 'exact', head: true });
      const { count: paid } = await supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('payment_status', 'PAID');

      setMetrics({
        totalStudents: students || 0,
        totalTeachers: teachers || 0,
        totalCertificates: certificates || 0,
        totalPaid: paid || 0,
      });
    };
    fetchMetrics();
  }, []);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'students', label: 'Étudiants' },
    { id: 'teachers', label: 'Enseignants' },
    { id: 'certificates', label: 'Certificats' },
    { id: 'finances', label: 'Finances' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-display text-white">Super Admin Dashboard</h1>

      {/* Métriques */}
      <MetricsCards metrics={metrics} />

      {/* Onglets */}
      <div className="flex gap-2 border-b border-dark-700 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab.id
                ? 'bg-gold-500/15 text-gold-400 border border-gold-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu de l'onglet actif */}
      <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6">
        {activeTab === 'students' && <StudentsList />}
        {activeTab === 'teachers' && <TeachersList />}
        {activeTab === 'certificates' && <CertificatesList />}
        {activeTab === 'finances' && <FinancesList />}
      </div>
    </div>
  );
}