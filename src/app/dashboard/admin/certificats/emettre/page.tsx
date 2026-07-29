'use client';

import { useState, useEffect } from 'react';
import { createClientComponent } from '@/lib/supabase/client';
import { CertificateGenerator } from '@/components/dashboard/admin/CertificateGenerator';

export default function AdminEmissionPage() {
  const supabase = createClientComponent();
  const [loading, setLoading] = useState(true);
  const [eligibleStudents, setEligibleStudents] = useState<any[]>([]);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [selectedCert, setSelectedCert] = useState<any | null>(null);

  useEffect(() => { fetchEligibleStudents(); }, []);

  const fetchEligibleStudents = async () => {
    setLoading(true);
    // Récupérer tous les cours avec leurs assessments
    const { data: courses } = await supabase
      .from('courses')
      .select('id, title, certificate_id, assessments(id)');

    if (!courses) { setLoading(false); return; }

    const eligible: any[] = [];

    for (const course of courses) {
      const assessmentIds = course.assessments?.map((a: any) => a.id) ?? [];
      if (assessmentIds.length === 0) continue;

      // Soumissions des étudiants pour ces assessments
      const { data: submissions } = await supabase
        .from('submissions')
        .select('student_id, status')
        .in('assessment_id', assessmentIds);

      if (!submissions) continue;

      // Grouper par étudiant
      const studentMap = new Map<string, { passed: number; total: number }>();
      for (const sub of submissions) {
        if (!studentMap.has(sub.student_id)) {
          studentMap.set(sub.student_id, { passed: 0, total: 0 });
        }
        const rec = studentMap.get(sub.student_id)!;
        rec.total++;
        if (sub.status === 'PASSED') rec.passed++;
      }

      // Filtrer ceux qui ont tout réussi
      for (const [studentId, rec] of studentMap.entries()) {
        if (rec.passed === assessmentIds.length && rec.total === assessmentIds.length) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', studentId)
            .single();

          const { data: existingCert } = await supabase
            .from('issued_certificates')
            .select('id, certificate_url')
            .eq('student_id', studentId)
            .eq('course_id', course.id)
            .maybeSingle();

          eligible.push({
            studentId,
            studentName: profile?.full_name || 'Inconnu',
            email: profile?.email || '',
            courseId: course.id,
            courseTitle: course.title,
            certificateId: course.certificate_id,
            hasCert: !!existingCert,
            certUrl: existingCert?.certificate_url || '',
            issueDate: new Date().toLocaleDateString('fr-FR'),
            tempCertId: `CERT-${studentId.slice(0, 8).toUpperCase()}`,
          });
        }
      }
    }

    setEligibleStudents(eligible);
    setLoading(false);
  };

  const handleFileUpload = async (studentId: string, courseId: string, file: File) => {
    setUploadingId(studentId);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `certificats/${studentId}_${courseId}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(fileName);
      const { error: insertError } = await supabase.from('issued_certificates').upsert({
        student_id: studentId,
        course_id: courseId,
        certificate_url: publicUrlData.publicUrl,
      }, { onConflict: 'student_id,course_id' });
      if (insertError) throw insertError;

      alert('Certificat uploadé avec succès !');
      fetchEligibleStudents();
    } catch (err: any) {
      alert('Erreur upload : ' + err.message);
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '22px', marginBottom: '20px' }}>📜 Émettre des certificats</h1>
      <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
        Étudiants ayant terminé tous les travaux d&apos;un cours. Générez ou uploadez leur certificat.
      </p>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Chargement...</p>
      ) : eligibleStudents.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>Aucun étudiant éligible pour le moment.</p>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {eligibleStudents.map((item) => (
            <div key={item.studentId + item.courseId} style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '20px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#38bdf8' }}>{item.studentName} ({item.email})</h3>
                <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#cbd5e1' }}>Cours : <strong>{item.courseTitle}</strong></p>
                {item.hasCert && (
                  <p style={{ fontSize: '13px', color: '#22c55e' }}>Déjà émis – <a href={item.certUrl} target="_blank" style={{ color: '#38bdf8' }}>Voir PDF</a></p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button
                  onClick={() => setSelectedCert({ studentName: item.studentName, courseTitle: item.courseTitle, issueDate: item.issueDate, certificateId: item.tempCertId })}
                  style={{ padding: '8px 14px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  ⚡ Générer Certificat
                </button>
                <label style={{ padding: '8px 14px', background: '#3b82f6', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {uploadingId === item.studentId ? 'Upload...' : '📤 Uploader PDF'}
                  <input type="file" accept="application/pdf" style={{ display: 'none' }} onChange={(e) => { if (e.target.files?.[0]) handleFileUpload(item.studentId, item.courseId, e.target.files[0]); }} />
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCert && (
        <CertificateGenerator
          studentName={selectedCert.studentName}
          courseTitle={selectedCert.courseTitle}
          issueDate={selectedCert.issueDate}
          certificateId={selectedCert.certificateId}
          onClose={() => setSelectedCert(null)}
        />
      )}
    </div>
  );
}