'use client';

import { useEffect, useState } from 'react';
import { createClientComponent } from '@/lib/supabase/client';
import { useStudent } from '@/context/StudentContext';
import { CourseProgram } from './CourseProgram';
import { StudentCertificates } from './StudentCertificates';

interface FormationViewProps {
  certId: number;
  onPaymentSuccess: () => void; // conservé mais pas utilisé pour le paiement direct
}

export default function FormationView({ certId, onPaymentSuccess }: FormationViewProps) {
  const { profile } = useStudent();
  const supabase = createClientComponent();
  const [courses, setCourses] = useState<any[]>([]);
  const [passedAssessments, setPassedAssessments] = useState<string[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    const load = async () => {
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
        const { data: coursesData } = await supabase
          .from('courses')
          .select('id, title, description, modules(id, title, week_number, lessons(id, title, content_type, content_url), assessments(id, title, description, type, max_score))')
          .eq('certificate_id', certId);
        setCourses(coursesData || []);

        const { data: subs } = await supabase
          .from('submissions')
          .select('assessment_id, status')
          .eq('student_id', profile.id);
        if (subs) {
          setPassedAssessments(subs.filter(s => s.status === 'PASSED').map(s => s.assessment_id));
        }
      }

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
      <CourseProgram courses={courses} userStatus="PAID" passedAssessments={passedAssessments} />
    </div>
  );
}