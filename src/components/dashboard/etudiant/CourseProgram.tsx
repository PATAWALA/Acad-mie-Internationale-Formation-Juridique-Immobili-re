'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Unlock, CheckCircle2, AlertCircle, 
  Clock, FileText, Video, Link as LinkIcon, 
  Send, ChevronDown, ChevronRight, Award,
  BookOpen, Loader2, Trophy, Star
} from 'lucide-react';
import { SubmissionModal } from './SubmissionModal';
import ContentViewer from './ContentViewer';
import SubmissionViewer from "./SubmissionViewer";

interface CourseProgramProps {
  courses: any[];
  userStatus: string;
  passedAssessments: string[];
  submissionsMap: Record<string, any>;
}

export function CourseProgram({ courses, userStatus, passedAssessments, submissionsMap }: CourseProgramProps) {
  const isPaid = userStatus?.trim().toUpperCase() === 'PAID';
  const [selectedAssessment, setSelectedAssessment] = useState<{ id: string; title: string } | null>(null);
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({});
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  const toggleCourse = (courseId: string) => {
    setExpandedCourses(prev => ({ ...prev, [courseId]: !prev[courseId] }));
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  // Calculer la progression pour un cours spécifique
  const getCourseProgress = (course: any) => {
    const totalAssessments = course.modules?.reduce((sum: number, mod: any) => {
      return sum + (mod.assessments?.length || 0);
    }, 0) || 0;
    
    const passedCount = course.modules?.reduce((sum: number, mod: any) => {
      return sum + (mod.assessments?.filter((ass: any) => passedAssessments.includes(ass.id)).length || 0);
    }, 0) || 0;
    
    const percent = totalAssessments > 0 ? Math.round((passedCount / totalAssessments) * 100) : 0;
    const isCompleted = totalAssessments > 0 && passedCount === totalAssessments;
    
    return { total: totalAssessments, passed: passedCount, percent, isCompleted };
  };

  // Calculer la progression globale
  const totalAssessments = courses.reduce((sum, course) => sum + getCourseProgress(course).total, 0);
  const totalPassed = courses.reduce((sum, course) => sum + getCourseProgress(course).passed, 0);
  const globalPercent = totalAssessments > 0 ? Math.round((totalPassed / totalAssessments) * 100) : 0;
  const allCoursesCompleted = courses.length > 0 && courses.every(course => getCourseProgress(course).isCompleted);

  if (!courses || courses.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
        <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">Aucune formation disponible pour le moment.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Certificat disponible */}
      {isPaid && allCoursesCompleted && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-yellow-500/10 border border-amber-500/30 p-5 lg:p-6"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="relative flex items-start gap-4">
            <div className="p-3 bg-amber-500/10 rounded-2xl flex-shrink-0">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-400 mb-1">
                🎉 Félicitations !
              </h3>
              <p className="text-sm text-slate-300 mb-3">
                Vous avez terminé tous les cours de cette formation. Votre certificat est en cours de génération.
              </p>
              <div className="flex items-center gap-2 text-xs text-amber-400/80">
                <Star className="w-4 h-4" />
                <span>Les cabinets s'arrachent nos certifiés</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Barre de progression globale (seulement si plusieurs cours) */}
      {isPaid && courses.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 lg:p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium text-white">Progression Globale</span>
            </div>
            <span className="text-sm font-bold text-blue-400">{globalPercent}%</span>
          </div>
          <div className="h-2 bg-[#1e293b] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${globalPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {totalPassed}/{totalAssessments} évaluations validées
          </p>
        </motion.div>
      )}

      {/* Message Non Payé */}
      {!isPaid && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-6"
        >
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-amber-500/10 rounded-xl flex-shrink-0">
              <Lock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-400 mb-2">Contenu Verrouillé</h3>
              <p className="text-sm text-slate-300 mb-4">
                Finalisez votre paiement pour accéder à tous les modules, vidéos, PDF et évaluations.
              </p>
              <Link
                href="/checkout"
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Débloquer l'accès maintenant
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Liste des Cours */}
      <div className="space-y-4">
        {courses.map((course, courseIndex) => {
          const courseProgress = getCourseProgress(course);
          const isCourseExpanded = expandedCourses[course.id] ?? true;
          
          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: courseIndex * 0.1 }}
              className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden"
            >
              {/* En-tête du cours */}
              <button
                onClick={() => toggleCourse(course.id)}
                className="w-full flex items-center justify-between p-5 lg:p-6 hover:bg-[#1e293b]/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                    courseProgress.isCompleted ? 'bg-green-500/10' : 'bg-blue-500/10'
                  }`}>
                    {courseProgress.isCompleted ? (
                      <Trophy className="w-5 h-5 text-green-400" />
                    ) : (
                      <BookOpen className="w-5 h-5 text-blue-400" />
                    )}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base lg:text-lg font-bold text-white truncate">
                        {course.title}
                      </h3>
                      {courseProgress.isCompleted && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] font-bold rounded-full border border-green-500/20 flex-shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          Terminé
                        </span>
                      )}
                    </div>
                    {/* Barre de progression du cours */}
                    {courseProgress.total > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[#1e293b] rounded-full overflow-hidden max-w-[200px]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${courseProgress.percent}%` }}
                            className={`h-full rounded-full ${
                              courseProgress.isCompleted ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                          />
                        </div>
                        <span className={`text-xs font-medium ${
                          courseProgress.isCompleted ? 'text-green-400' : 'text-blue-400'
                        }`}>
                          {courseProgress.percent}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: isCourseExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                </motion.div>
              </button>

              {/* Modules */}
              <AnimatePresence>
                {isCourseExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-[#1e293b]"
                  >
                    <div className="p-5 lg:p-6 space-y-3">
                      {course.modules?.map((mod: any, index: number, arr: any[]) => {
                        const isFirstModule = index === 0;
                        const prevModule = !isFirstModule ? arr[index - 1] : null;
                        const prevAssessmentId = prevModule?.assessments?.[0]?.id;
                        const isUnlocked = isFirstModule || (prevAssessmentId && passedAssessments.includes(prevAssessmentId));
                        const isModuleExpanded = expandedModules[mod.id] ?? isUnlocked;

                        return (
                          <div
                            key={mod.id}
                            className={`rounded-xl border transition-all ${
                              isUnlocked
                                ? 'bg-[#020617] border-[#1e293b]'
                                : 'bg-[#020617]/50 border-[#1e293b]/50 opacity-75'
                            }`}
                          >
                            {/* En-tête du module */}
                            <button
                              onClick={() => isUnlocked && toggleModule(mod.id)}
                              className="w-full flex items-center justify-between p-4"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`p-1.5 rounded-lg ${
                                  isUnlocked ? 'bg-blue-500/10' : 'bg-slate-700/50'
                                }`}>
                                  {isUnlocked ? (
                                    <Unlock className="w-4 h-4 text-blue-400" />
                                  ) : (
                                    <Lock className="w-4 h-4 text-slate-500" />
                                  )}
                                </div>
                                <div className="text-left">
                                  <h4 className="text-sm font-semibold text-white">
                                    Semaine {mod.week_number} : {mod.title}
                                  </h4>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                      <FileText className="w-3 h-3" />
                                      {mod.lessons?.length || 0} leçons
                                    </span>
                                    {mod.assessments?.length > 0 && (
                                      <span className="text-xs text-slate-500 flex items-center gap-1">
                                        <Award className="w-3 h-3" />
                                        {mod.assessments.length} évaluation(s)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {isUnlocked && (
                                <motion.div
                                  animate={{ rotate: isModuleExpanded ? 180 : 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <ChevronDown className="w-4 h-4 text-slate-400" />
                                </motion.div>
                              )}
                            </button>

                            {/* Contenu du module */}
                            <AnimatePresence>
                              {isModuleExpanded && isUnlocked && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="border-t border-[#1e293b]"
                                >
                                  <div className="p-4 space-y-4">
                                    {/* Leçons */}
                                    {mod.lessons?.map((lesson: any) => (
                                      <div
                                        key={lesson.id}
                                        className="bg-[#0f172a] rounded-xl p-4 border border-[#1e293b]"
                                      >
                                        <div className="flex items-center gap-2 mb-3">
                                          {lesson.content_type === 'VIDEO' && <Video className="w-4 h-4 text-red-400" />}
                                          {lesson.content_type === 'PDF' && <FileText className="w-4 h-4 text-blue-400" />}
                                          {lesson.content_type === 'TEXT' && <FileText className="w-4 h-4 text-green-400" />}
                                          {lesson.content_type === 'LINK' && <LinkIcon className="w-4 h-4 text-purple-400" />}
                                          <span className="text-sm font-medium text-white">{lesson.title}</span>
                                          <span className="text-xs text-slate-500 px-2 py-0.5 bg-[#1e293b] rounded-full">{lesson.content_type}</span>
                                        </div>
                                        {isPaid ? (
                                          <ContentViewer contentType={lesson.content_type} contentUrl={lesson.content_url} contentBody={lesson.content_body} title={lesson.title} />
                                        ) : (
                                          <div className="flex items-center gap-2 text-amber-400 text-sm">
                                            <Lock className="w-4 h-4" /> Réservé aux membres payants
                                          </div>
                                        )}
                                      </div>
                                    ))}

                                    {/* Évaluations */}
                                    {mod.assessments?.map((ass: any) => {
                                      const sub = submissionsMap[ass.id];
                                      return (
                                        <div key={ass.id} className="bg-[#0f172a] rounded-xl p-4 border border-[#1e293b]">
                                          <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                              <Award className="w-4 h-4 text-yellow-400" />
                                              <span className="text-sm font-medium text-white">{ass.title}</span>
                                            </div>
                                            {sub ? (
                                              sub.status === 'PENDING' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs">
                                                  <Clock className="w-3 h-3" /> En attente
                                                </span>
                                              ) : sub.status === 'PASSED' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-400 rounded-full text-xs">
                                                  <CheckCircle2 className="w-3 h-3" /> Validé • {sub.grade}/20
                                                </span>
                                              ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-400 rounded-full text-xs">
                                                  <AlertCircle className="w-3 h-3" /> Non validé • {sub.grade}/20
                                                </span>
                                              )
                                            ) : (
                                              <span className="text-xs text-slate-500">Non soumis</span>
                                            )}
                                          </div>
                                          {sub?.feedback && (
                                            <div className="mb-3 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                                              <p className="text-xs text-blue-400 font-medium mb-1">Feedback du formateur :</p>
                                              <p className="text-sm text-slate-300">{sub.feedback}</p>
                                            </div>
                                          )}
                                          {sub?.submission_url && (
                                            <div className="mb-3">
                                              <SubmissionViewer submissionUrl={sub.submission_url} />
                                            </div>
                                          )}
                                          {isPaid && !sub && (
                                            <motion.button
                                              whileHover={{ scale: 1.02 }}
                                              whileTap={{ scale: 0.98 }}
                                              onClick={() => setSelectedAssessment({ id: ass.id, title: ass.title })}
                                              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-green-500/20 transition-all"
                                            >
                                              <Send className="w-4 h-4" /> Soumettre mon travail
                                            </motion.button>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {!isUnlocked && (
                              <div className="px-4 pb-4">
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <Lock className="w-3 h-3" /> Validez la semaine {mod.week_number - 1} pour débloquer
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Modal de soumission */}
      <AnimatePresence>
        {selectedAssessment && (
          <SubmissionModal
            isOpen={!!selectedAssessment}
            onClose={() => setSelectedAssessment(null)}
            assessmentId={selectedAssessment.id}
            userStatus={userStatus}
          />
        )}
      </AnimatePresence>
    </div>
  );
}