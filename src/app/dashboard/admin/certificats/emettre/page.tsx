'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import { CertificateGenerator } from '@/components/dashboard/admin/CertificateGenerator';
import { cn } from '@/lib/utils';
import { fadeIn, stagger } from '@/lib/animations';
import {
  ScrollText,
  Zap,
  Upload,
  FileText,
  CheckCircle,
  Loader2,
  ExternalLink,
  GraduationCap,
  Mail,
  Users,
  AlertCircle,
} from 'lucide-react';

export default function AdminEmissionPage() {
  const supabase = createClientComponent();
  const [loading, setLoading] = useState(true);
  const [eligibleStudents, setEligibleStudents] = useState<any[]>([]);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [selectedCert, setSelectedCert] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEligibleStudents();
  }, []);

  const fetchEligibleStudents = async () => {
    setLoading(true);
    const { data: courses } = await supabase
      .from('courses')
      .select('id, title, certificate_id');

    if (!courses) {
      setLoading(false);
      return;
    }

    const eligible: any[] = [];

    for (const course of courses) {
      const { data: assessments } = await supabase
        .from('assessments')
        .select('id')
        .eq('course_id', course.id);
      const assessmentIds = assessments?.map((a) => a.id) ?? [];
      if (assessmentIds.length === 0) continue;

      const { data: submissions } = await supabase
        .from('submissions')
        .select('student_id, status')
        .in('assessment_id', assessmentIds);
      if (!submissions) continue;

      const studentMap = new Map<string, { passed: number; total: number }>();
      for (const sub of submissions) {
        if (!studentMap.has(sub.student_id)) {
          studentMap.set(sub.student_id, { passed: 0, total: 0 });
        }
        const rec = studentMap.get(sub.student_id)!;
        rec.total++;
        if (sub.status === 'PASSED') rec.passed++;
      }

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

          const { data: studentSubs } = await supabase
            .from('submissions')
            .select('submission_url, assessment_id, assessments(title)')
            .eq('student_id', studentId)
            .in('assessment_id', assessmentIds);

          eligible.push({
            studentId,
            studentName: profile?.full_name || 'Inconnu',
            email: profile?.email || '',
            courseId: course.id,
            courseTitle: course.title,
            certificateId: course.certificate_id,
            hasCert: !!existingCert,
            certUrl: existingCert?.certificate_url || '',
            issueDate: new Date().toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }),
            tempCertId: `CERT-${studentId.slice(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
            submissions: studentSubs || [],
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
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);
      const { error: insertError } = await supabase
        .from('issued_certificates')
        .upsert(
          {
            student_id: studentId,
            course_id: courseId,
            certificate_url: publicUrlData.publicUrl,
          },
          { onConflict: 'student_id,course_id' }
        );
      if (insertError) throw insertError;

      fetchEligibleStudents();
    } catch (err: any) {
      alert('Erreur upload : ' + err.message);
    } finally {
      setUploadingId(null);
    }
  };

  const filteredStudents = eligibleStudents.filter((student) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      student.studentName.toLowerCase().includes(term) ||
      student.email.toLowerCase().includes(term) ||
      student.courseTitle.toLowerCase().includes(term)
    );
  });

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeIn}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-amber-500/10 rounded-xl">
            <ScrollText className="w-5 h-5 text-amber-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Émettre des certificats
          </h1>
        </div>
        <p className="text-slate-400 text-sm ml-14">
          Générez ou uploadez les certificats pour les étudiants ayant validé tous leurs travaux.
        </p>
      </motion.div>

      {/* Stats rapides */}
      {!loading && (
        <motion.div variants={fadeIn} className="grid grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-slate-400 uppercase tracking-wider">Éligibles</span>
            </div>
            <span className="text-2xl font-bold text-white">{eligibleStudents.length}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-400 uppercase tracking-wider">Déjà émis</span>
            </div>
            <span className="text-2xl font-bold text-white">
              {eligibleStudents.filter((s) => s.hasCert).length}
            </span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-slate-400 uppercase tracking-wider">En attente</span>
            </div>
            <span className="text-2xl font-bold text-white">
              {eligibleStudents.filter((s) => !s.hasCert).length}
            </span>
          </div>
        </motion.div>
      )}

      {/* Barre de recherche */}
      <motion.div variants={fadeIn} className="relative">
        <input
          type="text"
          placeholder="Rechercher un étudiant, un email ou un cours..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 pl-12 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
        />
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </motion.div>

      {/* Liste des étudiants */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-slate-800 rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-slate-800 rounded-lg w-1/3" />
                  <div className="h-4 bg-slate-800 rounded-lg w-1/4" />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-10 bg-slate-800 rounded-xl w-40" />
                <div className="h-10 bg-slate-800 rounded-xl w-40" />
              </div>
            </motion.div>
          ))}
        </div>
      ) : filteredStudents.length === 0 ? (
        <motion.div variants={fadeIn} className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 bg-slate-800 rounded-2xl flex items-center justify-center">
            <GraduationCap className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">
            {eligibleStudents.length === 0
              ? 'Aucun étudiant éligible'
              : 'Aucun résultat trouvé'}
          </h3>
          <p className="text-slate-400 text-sm">
            {eligibleStudents.length === 0
              ? 'Les étudiants apparaîtront ici une fois tous leurs travaux validés.'
              : 'Essayez de modifier votre recherche.'}
          </p>
        </motion.div>
      ) : (
        <motion.div variants={stagger} className="space-y-4">
          <AnimatePresence>
            {filteredStudents.map((item, index) => (
              <motion.div
                key={item.studentId + item.courseId}
                variants={fadeIn}
                initial="initial"
                animate="animate"
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all duration-300 group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Infos étudiant */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-amber-300">
                          {(item.studentName || '?')[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold flex items-center gap-2">
                          {item.studentName}
                          {item.hasCert && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/30">
                              <CheckCircle className="w-3 h-3" />
                              Certificat émis
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3.5 h-3.5" />
                          {item.email}
                        </p>
                        <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                          <GraduationCap className="w-3.5 h-3.5" />
                          {item.courseTitle}
                        </p>
                      </div>
                    </div>

                    {/* Liens copies */}
                    {item.submissions.length > 0 && (
                      <div className="ml-16 flex flex-wrap gap-2">
                        {item.submissions.map((sub: any) => (
                          <a
                            key={sub.assessment_id}
                            href={sub.submission_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-lg transition-colors border border-slate-700 hover:border-slate-600"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            {sub.assessments?.title || 'Copie'}
                            <ExternalLink className="w-3 h-3 opacity-50" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 lg:flex-shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        setSelectedCert({
                          studentName: item.studentName,
                          courseTitle: item.courseTitle,
                          issueDate: item.issueDate,
                          certificateId: item.tempCertId,
                        })
                      }
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
                    >
                      <Zap className="w-4 h-4" />
                      <span className="hidden sm:inline">Générer Certificat</span>
                      <span className="sm:hidden">Générer</span>
                    </motion.button>

                    <label
                      className={cn(
                        'inline-flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer shadow-lg shadow-blue-500/20',
                        uploadingId === item.studentId && 'opacity-70 cursor-not-allowed'
                      )}
                    >
                      {uploadingId === item.studentId ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Upload...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span className="hidden sm:inline">Uploader PDF</span>
                          <span className="sm:hidden">Upload</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        disabled={uploadingId === item.studentId}
                        onChange={(e) => {
                          if (e.target.files?.[0])
                            handleFileUpload(item.studentId, item.courseId, e.target.files[0]);
                        }}
                      />
                    </label>

                    {item.hasCert && item.certUrl && (
                      <a
                        href={item.certUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2.5 text-slate-400 hover:text-white transition-colors"
                        title="Voir le certificat existant"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Certificate Generator Modal */}
      <AnimatePresence>
        {selectedCert && (
          <CertificateGenerator
            studentName={selectedCert.studentName}
            courseTitle={selectedCert.courseTitle}
            issueDate={selectedCert.issueDate}
            certificateId={selectedCert.certificateId}
            onClose={() => setSelectedCert(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}