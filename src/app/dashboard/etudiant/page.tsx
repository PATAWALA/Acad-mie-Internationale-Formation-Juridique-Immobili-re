'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStudent } from '@/context/StudentContext';
import { CourseProgram } from '@/components/dashboard/etudiant/CourseProgram';
import { StudentCertificates } from '@/components/dashboard/etudiant/StudentCertificates';
import { createClientComponent } from '@/lib/supabase/client';

function DashboardContent() {
  const { profile } = useStudent();
  const searchParams = useSearchParams();
  const certId = searchParams.get('certificat');
  const supabase = createClientComponent();
  const [courses, setCourses] = useState<any[]>([]);
  const [passedAssessments, setPassedAssessments] = useState<string[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!profile || !certId) {
      setCourses([]);
      return;
    }

    const loadData = async () => {
      // Vérifier le statut de l'enrollment pour ce certificat
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('payment_status')
        .eq('student_id', profile.id)
        .eq('certificate_id', certId)
        .maybeSingle();

      if (!enrollment) {
        setEnrollmentStatus(null);
        return;
      }
      setEnrollmentStatus(enrollment.payment_status);

      // Si payé, charger les cours
      if (enrollment.payment_status === 'PAID') {
        const { data: coursesData } = await supabase
          .from('courses')
          .select('id, title, description, modules(id, title, week_number, lessons(id, title, content_type, content_url), assessments(id, title, description, type, max_score))')
          .eq('certificate_id', certId);

        setCourses(coursesData || []);

        // Charger soumissions pour la progression
        const { data: submissions } = await supabase
          .from('submissions')
          .select('assessment_id, status')
          .eq('student_id', profile.id);
        if (submissions) {
          const passed = submissions.filter(s => s.status === 'PASSED').map(s => s.assessment_id);
          setPassedAssessments(passed);
        }
      } else {
        setCourses([]);
      }

      // Charger certificats émis
      const { data: issuedCerts } = await supabase
        .from('issued_certificates')
        .select('id, certificate_url')
        .eq('student_id', profile.id);
      if (issuedCerts) setCertificates(issuedCerts);
    };

    loadData();
  }, [profile, certId]);

  if (!certId) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
        <h2>Sélectionnez une formation dans la barre latérale</h2>
        <p>Ou <a href="/dashboard/etudiant/catalogue" style={{ color: '#38bdf8' }}>parcourez le catalogue</a> pour en ajouter une.</p>
      </div>
    );
  }

  return (
    <div>
      {enrollmentStatus === 'PENDING' && (
        <div style={{ padding: '24px', background: '#7c2d12', borderRadius: '8px', marginBottom: '20px', color: '#fdba74' }}>
          Cette formation est en attente de paiement. <a href={`/dashboard/etudiant/payer/${certId}`} style={{ color: '#fff', textDecoration: 'underline' }}>Payer maintenant</a>.
        </div>
      )}
      {enrollmentStatus === 'PAID' && courses.length > 0 && (
        <>
          <StudentCertificates certificates={certificates} />
          <button onClick={() => window.location.reload()} style={{ marginBottom: '16px', padding: '6px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            🔄 Actualiser la progression
          </button>
          <CourseProgram courses={courses} userStatus="PAID" passedAssessments={passedAssessments} />
        </>
      )}
      {enrollmentStatus === 'PAID' && courses.length === 0 && (
        <p style={{ color: '#94a3b8' }}>Aucun cours disponible pour cette formation pour le moment.</p>
      )}
    </div>
  );
}

export default function StudentDashboardPage() {
  return (
    <Suspense fallback={<div style={{ color: '#fff' }}>Chargement...</div>}>
      <DashboardContent />
    </Suspense>
  );
}