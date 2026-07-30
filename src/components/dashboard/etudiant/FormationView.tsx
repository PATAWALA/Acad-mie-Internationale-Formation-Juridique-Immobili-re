'use client';

import { useEffect, useState } from 'react';
import { createClientComponent } from '@/lib/supabase/client';
import { useStudent } from '@/context/StudentContext';
import { CourseProgram } from './CourseProgram';
import { StudentCertificates } from './StudentCertificates';

interface FormationViewProps {
  certId: number;
  onPaymentSuccess: () => void;
}

export default function FormationView({ certId, onPaymentSuccess }: FormationViewProps) {
  const { profile } = useStudent();
  const supabase = createClientComponent();
  const [courses, setCourses] = useState<any[]>([]);
  const [passedAssessments, setPassedAssessments] = useState<string[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);
  const [submissionsMap, setSubmissionsMap] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!profile) return;
    const load = async () => {
      // Récupérer l'enrollment et son statut
      const { data: enr } = await supabase
        .from('enrollments')
        .select('payment_status')
        .eq('student_id', profile.id)
        .eq('certificate_id', certId)
        .maybeSingle();

      if (!enr) {
        setEnrollmentStatus(null);
        return;
      }
      setEnrollmentStatus(enr.payment_status);

      if (enr.payment_status === 'PAID') {
        // Charger les cours (avec modules, leçons, assessments)
        const { data: coursesData } = await supabase
          .from('courses')
          .select('id, title, description, modules(id, title, week_number, lessons(id, title, content_type, content_url, content_body), assessments(id, title, description, type, max_score))')
          .eq('certificate_id', certId);
        setCourses(coursesData || []);

        // Charger les soumissions de l'étudiant (pour les notes et feedback)
        const { data: subs } = await supabase
          .from('submissions')
          .select('assessment_id, submission_url, status, grade, feedback')
          .eq('student_id', profile.id);

        const map: Record<string, any> = {};
        subs?.forEach((s) => { map[s.assessment_id] = s; });
        setSubmissionsMap(map);

        // Déterminer les assessments validés (PASSED)
        const passed = subs?.filter(s => s.status === 'PASSED').map(s => s.assessment_id) || [];
        setPassedAssessments(passed);
      }

      // Certificats déjà émis pour cet étudiant
      const { data: certs } = await supabase
        .from('issued_certificates')
        .select('id, certificate_url')
        .eq('student_id', profile.id);
      if (certs) setCertificates(certs);
    };
    load();
  }, [certId, profile]);

  if (!enrollmentStatus) {
    return <p style={{ color: '#94a3b8' }}>Vous n'êtes pas inscrit à cette formation.</p>;
  }

  if (enrollmentStatus !== 'PAID') {
    return (
      <div style={{ background: '#7c2d12', padding: '20px', borderRadius: '8px', color: '#fdba74' }}>
        Cette formation est en attente de paiement. Utilisez le bouton <strong>"Payer maintenant"</strong> dans la barre latérale pour la débloquer.
      </div>
    );
  }

  return (
    <div>
      <StudentCertificates certificates={certificates} />
      <button
        onClick={() => window.location.reload()}
        style={{ marginBottom: '16px', padding: '6px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        🔄 Actualiser la progression
      </button>
      <CourseProgram
        courses={courses}
        userStatus="PAID"
        passedAssessments={passedAssessments}
        submissionsMap={submissionsMap}
      />
    </div>
  );
}