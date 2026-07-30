'use client';

import { useEffect, useState } from 'react';
import { createClientComponent } from '@/lib/supabase/client';
import { useStudent } from '@/context/StudentContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Lock, AlertCircle, 
  RefreshCw, Loader2,  CreditCard,
  GraduationCap, ChevronRight
} from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!profile) return;
    
    const load = async () => {
      setLoading(true);
      
      // Récupérer l'enrollment et son statut
      const { data: enr } = await supabase
        .from('enrollments')
        .select('payment_status')
        .eq('student_id', profile.id)
        .eq('certificate_id', certId)
        .maybeSingle();

      if (!enr) {
        setEnrollmentStatus(null);
        setLoading(false);
        return;
      }
      setEnrollmentStatus(enr.payment_status);

      if (enr.payment_status === 'PAID') {
        // Charger les cours
        const { data: coursesData } = await supabase
          .from('courses')
          .select('id, title, description, modules(id, title, week_number, lessons(id, title, content_type, content_url, content_body), assessments(id, title, description, type, max_score))')
          .eq('certificate_id', certId)
          .order('id');
        setCourses(coursesData || []);

        // Charger les soumissions
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

        // Déterminer les assessments validés
        const passed = subs?.filter(s => s.status === 'PASSED' && s.assessment_id).map(s => s.assessment_id!) || [];
        setPassedAssessments(passed);
      }

      // Certificats déjà émis
      const { data: certs } = await supabase
        .from('issued_certificates')
        .select('id, certificate_url')
        .eq('student_id', profile.id);
      if (certs) setCertificates(certs);

      setLoading(false);
    };
    
    load();
  }, [certId, profile, supabase]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Recharger les soumissions
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
    }
    setRefreshing(false);
  };

  // Loading State
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

  // Non inscrit
  if (!enrollmentStatus) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Formation non disponible
        </h3>
        <p className="text-sm text-slate-400">
          Vous n'êtes pas inscrit à cette formation. Parcourez le catalogue pour vous inscrire.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Certificats obtenus */}
      <AnimatePresence>
        {certificates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <StudentCertificates certificates={certificates} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barre d'actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between"
      >
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-400" />
            Votre Formation
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {enrollmentStatus === 'PAID' 
              ? `${courses.length} cours disponibles` 
              : 'Paiement requis'}
          </p>
        </div>

        {enrollmentStatus === 'PAID' && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-blue-500/20"
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Actualiser ma progression
          </motion.button>
        )}
      </motion.div>

      {/* Contenu selon le statut */}
      <AnimatePresence mode="wait">
        {enrollmentStatus !== 'PAID' ? (
          <motion.div
            key="pending"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-6 lg:p-8"
          >
            {/* Glow Background */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-amber-500/10 rounded-2xl flex-shrink-0">
                  <Lock className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg lg:text-xl font-bold text-amber-400 mb-2">
                    Votre inscription est en attente de validation
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Vous avez fait le premier pas ! Pour débloquer immédiatement l'accès à tous les modules, 
                    télécharger les supports et obtenir votre <strong className="text-white">Certificat de Fin de Formation</strong>, 
                    finalisez votre règlement dès maintenant.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all"
                >
                  <CreditCard className="w-5 h-5" />
                  Valider mon paiement
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
                <span className="text-xs text-amber-400/80 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Accès instantané après validation
                </span>
              </div>
            </div>
          </motion.div>
        ) : courses.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Aucun cours disponible
            </h3>
            <p className="text-sm text-slate-400">
              Le contenu de cette formation sera bientôt disponible.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <CourseProgram
              courses={courses}
              userStatus="PAID"
              passedAssessments={passedAssessments}
              submissionsMap={submissionsMap}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}