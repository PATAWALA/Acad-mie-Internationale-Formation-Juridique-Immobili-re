'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClientComponent } from '@/lib/supabase/client';
import { useStudent } from '@/context/StudentContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Lock, AlertCircle,
  RefreshCw, Loader2, Upload,
  GraduationCap, ChevronRight, Trophy,
  Award, FileCheck2
} from 'lucide-react';
import { CourseProgram } from './CourseProgram';
import { StudentCertificates } from './StudentCertificates';

interface FormationViewProps {
  certId: number;
  onPaymentSuccess: () => void;
  onPayClick?: (enrollmentId: number, amount: number) => void;
}

export default function FormationView({ certId, onPaymentSuccess, onPayClick }: FormationViewProps) {
  const { profile } = useStudent();
  const supabase = createClientComponent();
  const [courses, setCourses] = useState<any[]>([]);
  const [passedAssessments, setPassedAssessments] = useState<string[]>([]);
  const [courseCertificate, setCourseCertificate] = useState<any>(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [submissionsMap, setSubmissionsMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [certificateInfo, setCertificateInfo] = useState<any>(null);

  const [certStats, setCertStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalAssessments: 0,
    passedCount: 0,
    isFullyCompleted: false,
    progressPercent: 0,
  });

  const computeCertStats = useCallback((coursesData: any[], passed: string[]) => {
    let totalCourses = coursesData.length;
    let completedCourses = 0;
    let totalAssessments = 0;
    let passedCount = passed.length;

    for (const course of coursesData) {
      const courseAssessments = course.modules?.reduce((sum: number, mod: any) => {
        return sum + (mod.assessments?.length || 0);
      }, 0) || 0;
      totalAssessments += courseAssessments;

      const courseAssessmentIds = course.modules?.flatMap((mod: any) =>
        mod.assessments?.map((ass: any) => ass.id) || []
      ) || [];
      const allPassed = courseAssessmentIds.length > 0 &&
        courseAssessmentIds.every((id: string) => passed.includes(id));
      if (allPassed) completedCourses++;
    }

    const progressPercent = totalAssessments > 0
      ? Math.round((passedCount / totalAssessments) * 100)
      : 0;

    setCertStats({
      totalCourses,
      completedCourses,
      totalAssessments,
      passedCount,
      isFullyCompleted: completedCourses === totalCourses && totalCourses > 0,
      progressPercent,
    });
  }, []);

  const loadData = useCallback(async () => {
    if (!profile) return;

    setLoading(true);

    // 1. Récupérer l'enrollment avec receipt_url
    const { data: enr } = await supabase
      .from('enrollments')
      .select('id, payment_status, remaining_balance, receipt_url')
      .eq('student_id', profile.id)
      .eq('certificate_id', certId)
      .maybeSingle();

    if (!enr) {
      setEnrollmentStatus(null);
      setCourseCertificate(null);
      setLoading(false);
      return;
    }
    setEnrollmentStatus(enr.payment_status);
    setEnrollment(enr);

    // 2. Récupérer les infos du certificat
    const { data: certInfo } = await supabase
      .from('certificates')
      .select('slogan, skills, target_audience, benefits, brochure_url')
      .eq('id', certId)
      .single();
    if (certInfo) setCertificateInfo(certInfo);

    // 3. Si payé, charger les cours et soumissions
    if (enr.payment_status === 'PAID') {
      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, title, description, modules(id, title, week_number, lessons(id, title, content_type, content_url, content_body, category), assessments(id, title, description, type, max_score))')
        .eq('certificate_id', certId)
        .order('id');
      setCourses(coursesData || []);

      const { data: subs } = await supabase
        .from('submissions')
        .select('assessment_id, submission_url, status, grade, feedback')
        .eq('student_id', profile.id);

      const map: Record<string, any> = {};
      subs?.forEach((s) => {
        const aid = s.assessment_id ?? '';
        if (aid) map[aid] = s;
      });
      setSubmissionsMap(map);

      const passed = subs?.filter(s => s.status === 'PASSED' && s.assessment_id).map(s => s.assessment_id!) || [];
      setPassedAssessments(passed);

      computeCertStats(coursesData || [], passed);

      // 4. Charger le certificat de CETTE formation uniquement
      if (coursesData && coursesData.length > 0) {
        const courseIds = coursesData.map((c: any) => c.id);
        const { data: certs } = await supabase
          .from('issued_certificates')
          .select('id, certificate_url, course_id, issued_at')
          .eq('student_id', profile.id)
          .in('course_id', courseIds)
          .order('issued_at', { ascending: false })
          .limit(1);

        if (certs && certs.length > 0) {
          setCourseCertificate(certs[0]);
        } else {
          setCourseCertificate(null);
        }
      }
    } else {
      setCourseCertificate(null);
    }

    setLoading(false);
  }, [certId, profile, supabase, computeCertStats]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (profile) {
      const { data: subs } = await supabase
        .from('submissions')
        .select('assessment_id, submission_url, status, grade, feedback')
        .eq('student_id', profile.id);

      const map: Record<string, any> = {};
      subs?.forEach((s) => {
        const aid = s.assessment_id ?? '';
        if (aid) map[aid] = s;
      });
      setSubmissionsMap(map);

      const passed = subs?.filter(s => s.status === 'PASSED' && s.assessment_id).map(s => s.assessment_id!) || [];
      setPassedAssessments(passed);
      computeCertStats(courses, passed);

      // Rafraîchir le certificat de cette formation
      if (courses.length > 0) {
        const courseIds = courses.map((c: any) => c.id);
        const { data: certs } = await supabase
          .from('issued_certificates')
          .select('id, certificate_url, course_id, issued_at')
          .eq('student_id', profile.id)
          .in('course_id', courseIds)
          .order('issued_at', { ascending: false })
          .limit(1);

        if (certs && certs.length > 0) {
          setCourseCertificate(certs[0]);
        }
      }
    }
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-[#1e293b] rounded-lg w-64 mb-4" />
          <div className="h-4 bg-[#1e293b] rounded-lg w-96 mb-8" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 mb-4">
              <div className="h-5 bg-[#1e293b] rounded w-48 mb-3" />
              <div className="h-4 bg-[#1e293b] rounded w-full mb-2" />
              <div className="h-4 bg-[#1e293b] rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!enrollmentStatus) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Formation non disponible</h3>
        <p className="text-sm text-slate-400">Vous n&apos;êtes pas inscrit à cette formation. Parcourez le catalogue pour vous inscrire.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Certificat de CETTE formation uniquement */}
      <AnimatePresence>
        {courseCertificate && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <StudentCertificates certificates={[courseCertificate]} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alerte "Tous les cours validés" */}
      {enrollmentStatus === 'PAID' && certStats.isFullyCompleted && !courseCertificate && (
        <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-yellow-500/10 border border-amber-500/30 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 rounded-xl"><Trophy className="w-5 h-5 text-amber-400" /></div>
            <div>
              <p className="text-sm font-bold text-amber-400">🎉 Tous les cours sont validés !</p>
              <p className="text-xs text-slate-400 mt-0.5">Votre certificat sera disponible dans votre espace après validation par l&apos;administration.</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Barre d'actions */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-400" /> Votre Formation
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {enrollmentStatus === 'PAID'
              ? `${certStats.totalCourses} cours • ${certStats.passedCount}/${certStats.totalAssessments} évaluations validées`
              : 'En attente de validation'}
          </p>
        </div>
        {enrollmentStatus === 'PAID' && (
          <div className="flex items-center gap-3">
            {certStats.totalAssessments > 0 && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                <Award className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-blue-400 font-bold">{certStats.progressPercent}%</span>
              </div>
            )}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleRefresh} disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-blue-500/20">
              {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Actualiser
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Contenu selon le statut */}
      <AnimatePresence mode="wait">
        {enrollmentStatus !== 'PAID' ? (
          <motion.div key="pending" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-6 lg:p-8">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-amber-500/10 rounded-2xl flex-shrink-0">
                  {enrollment?.receipt_url ? (
                    <FileCheck2 className="w-6 h-6 text-blue-400" />
                  ) : (
                    <Lock className="w-6 h-6 text-amber-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg lg:text-xl font-bold text-amber-400 mb-2">
                    {enrollment?.receipt_url
                      ? 'Preuve envoyée - en attente de validation'
                      : 'Votre inscription est en attente de paiement'}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {enrollment?.receipt_url
                      ? 'Votre reçu a bien été transmis. Vous recevrez une notification dès validation par l\'administration.'
                      : 'Vous avez fait le premier pas ! Pour débloquer l\'accès à tous les modules, envoyez votre preuve de paiement.'}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                {enrollment?.receipt_url ? (
                  <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
                    <FileCheck2 className="w-5 h-5" /> Preuve envoyée - en attente de validation
                  </div>
                ) : (
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => { if (enrollment && onPayClick) { onPayClick(enrollment.id, enrollment.remaining_balance || 0); } }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all">
                    <Upload className="w-5 h-5" /> Envoyer une preuve de paiement <ChevronRight className="w-5 h-5" />
                  </motion.button>
                )}
                {!enrollment?.receipt_url && (
                  <span className="text-xs text-amber-400/80 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Accès après validation par l&apos;administration
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ) : courses.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Aucun cours disponible</h3>
            <p className="text-sm text-slate-400">Le contenu de cette formation sera bientôt disponible.</p>
          </motion.div>
        ) : (
          <motion.div key="content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <CourseProgram
              courses={courses}
              userStatus="PAID"
              passedAssessments={passedAssessments}
              submissionsMap={submissionsMap}
              certificateInfo={certificateInfo}
              courseCertificate={courseCertificate}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}