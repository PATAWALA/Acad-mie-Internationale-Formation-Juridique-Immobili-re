'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Unlock, CheckCircle2, AlertCircle, 
  Clock, FileText, Video, Link as LinkIcon, 
  Send, ChevronDown, ChevronRight, Award,
  BookOpen, Loader2, Trophy, Star, PenTool,
  Calendar, Play, Target, Users, Download,
  Shield, Zap
} from 'lucide-react';
import { SubmissionModal } from './SubmissionModal';
import ContentViewer from './ContentViewer';
import SubmissionViewer from "./SubmissionViewer";

interface CourseProgramProps {
  courses: any[];
  userStatus: string;
  passedAssessments: string[];
  submissionsMap: Record<string, any>;
  certificateInfo?: {
    slogan?: string;
    skills?: string;
    targetAudience?: string;
    benefits?: string;
    brochureUrl?: string;
  } | null;
}

export function CourseProgram({ courses, userStatus, passedAssessments, submissionsMap, certificateInfo }: CourseProgramProps) {
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

  const getLessonType = (lesson: any, index: number) => {
    const title = (lesson.title || '').toLowerCase();
    if (title.includes('théorie') || title.includes('theorie') || index === 0) return 'theorie';
    if (title.includes('pratique') || title.includes('exercice') || index === 1) return 'pratique';
    return 'standard';
  };

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
      {/* 4 icônes clés */}
      {isPaid && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {[
            { icon: Calendar, label: '4 semaines', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
            { icon: Play, label: '8 séances', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
            { icon: Target, label: '4 étapes', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
            { icon: Shield, label: '100% pratique', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border ${item.border} ${item.bg} text-center`}
            >
              <item.icon className={`w-6 h-6 ${item.color}`} />
              <span className={`text-sm font-bold ${item.color}`}>{item.label}</span>
            </motion.div>
          ))}
        </motion.div>
      )}

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
              <h3 className="text-lg font-bold text-amber-400 mb-1">🎉 Félicitations !</h3>
              <p className="text-sm text-slate-300 mb-3">
                Vous avez terminé tous les cours. Votre certificat est en cours de génération.
              </p>
              <div className="flex items-center gap-2 text-xs text-amber-400/80">
                <Star className="w-4 h-4" />
                <span>Les cabinets s'arrachent nos certifiés</span>
              </div>
            </div>
          </div>
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
                Finalisez votre paiement pour accéder à tous les modules.
              </p>
              <Link href="/checkout" className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors">
                Débloquer l'accès maintenant <ChevronRight className="w-4 h-4" />
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
              <button onClick={() => toggleCourse(course.id)} className="w-full flex items-center justify-between p-5 lg:p-6 hover:bg-[#1e293b]/50 transition-colors">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${courseProgress.isCompleted ? 'bg-green-500/10' : 'bg-blue-500/10'}`}>
                    {courseProgress.isCompleted ? <Trophy className="w-5 h-5 text-green-400" /> : <BookOpen className="w-5 h-5 text-blue-400" />}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base lg:text-lg font-bold text-white truncate">{course.title}</h3>
                      {courseProgress.isCompleted && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] font-bold rounded-full border border-green-500/20 flex-shrink-0">
                          <CheckCircle2 className="w-3 h-3" /> Terminé
                        </span>
                      )}
                    </div>
                    {courseProgress.total > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[#1e293b] rounded-full overflow-hidden max-w-[200px]">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${courseProgress.percent}%` }}
                            className={`h-full rounded-full ${courseProgress.isCompleted ? 'bg-green-500' : 'bg-blue-500'}`} />
                        </div>
                        <span className={`text-xs font-medium ${courseProgress.isCompleted ? 'text-green-400' : 'text-blue-400'}`}>{courseProgress.percent}%</span>
                      </div>
                    )}
                  </div>
                </div>
                <motion.div animate={{ rotate: isCourseExpanded ? 180 : 0 }}><ChevronDown className="w-5 h-5 text-slate-400" /></motion.div>
              </button>

              <AnimatePresence>
                {isCourseExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="border-t border-[#1e293b]">
                    <div className="p-5 lg:p-6 space-y-3">
                      {course.modules?.map((mod: any, index: number, arr: any[]) => {
                        const isFirstModule = index === 0;
                        const prevModule = !isFirstModule ? arr[index - 1] : null;
                        const prevAssessmentId = prevModule?.assessments?.[0]?.id;
                        const isUnlocked = isFirstModule || (prevAssessmentId && passedAssessments.includes(prevAssessmentId));
                        const isModuleExpanded = expandedModules[mod.id] ?? isUnlocked;
                        const moduleAssessmentId = mod.assessments?.[0]?.id;
                        const isModulePassed = moduleAssessmentId && passedAssessments.includes(moduleAssessmentId);

                        return (
                          <div key={mod.id} className={`rounded-xl border transition-all ${isUnlocked ? 'bg-[#020617] border-[#1e293b]' : 'bg-[#020617]/50 border-[#1e293b]/50 opacity-75'}`}>
                            <button onClick={() => isUnlocked && toggleModule(mod.id)} className="w-full flex items-center justify-between p-4">
                              <div className="flex items-center gap-3">
                                <div className={`p-1.5 rounded-lg ${isUnlocked ? 'bg-blue-500/10' : 'bg-slate-700/50'}`}>
                                  {isUnlocked ? <Unlock className="w-4 h-4 text-blue-400" /> : <Lock className="w-4 h-4 text-slate-500" />}
                                </div>
                                <div className="text-left">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-semibold text-white">Semaine {mod.week_number} : {mod.title}</h4>
                                    {isModulePassed && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-500/10 text-green-400 text-[10px] font-bold rounded-full border border-green-500/20">
                                        <CheckCircle2 className="w-3 h-3" /> Validée
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {isUnlocked && <ChevronDown className="w-4 h-4 text-slate-400" />}
                            </button>
                            {/* Contenu leçons/TP (inchangé) */}
                            {isModuleExpanded && isUnlocked && (
                              <div className="border-t border-[#1e293b] p-4 space-y-4">
                                {mod.lessons?.map((lesson: any, lessonIndex: number) => {
                                  const lessonType = getLessonType(lesson, lessonIndex);
                                  return (
                                    <div key={lesson.id} className="bg-[#0f172a] rounded-xl p-4 border border-[#1e293b]">
                                      <div className="flex items-center gap-2 mb-3">
                                        {lessonType === 'theorie' && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded-full border border-blue-500/20">📚 Théorie</span>}
                                        {lessonType === 'pratique' && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-500/10 text-orange-400 text-[10px] font-bold rounded-full border border-orange-500/20">✍️ Pratique</span>}
                                        <span className="text-sm font-medium text-white">{lesson.title}</span>
                                      </div>
                                      {isPaid ? <ContentViewer contentType={lesson.content_type} contentUrl={lesson.content_url} contentBody={lesson.content_body} title={lesson.title} />
                                        : <div className="text-amber-400 text-sm"><Lock className="w-4 h-4 inline mr-1" />Réservé aux membres payants</div>}
                                    </div>
                                  );
                                })}
                                {mod.assessments?.map((ass: any) => {
                                  const sub = submissionsMap[ass.id];
                                  return (
                                    <div key={ass.id} className="bg-[#0f172a] rounded-xl p-4 border border-[#1e293b]">
                                      <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                          <PenTool className="w-4 h-4 text-yellow-400" />
                                          <span className="text-sm font-medium text-white">{ass.title}</span>
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 text-yellow-400 text-[10px] font-bold rounded-full border border-yellow-500/20">🎯 Validation</span>
                                        </div>
                                        {sub ? (
                                          sub.status === 'PENDING' ? <span className="text-amber-400 text-xs">⏳ En attente</span>
                                          : sub.status === 'PASSED' ? <span className="text-green-400 text-xs">✅ Validé • {sub.grade}/20</span>
                                          : <span className="text-red-400 text-xs">❌ Non validé • {sub.grade}/20</span>
                                        ) : <span className="text-slate-500 text-xs">Non soumis</span>}
                                      </div>
                                      {sub?.feedback && <div className="mb-3 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl"><p className="text-xs text-blue-400">Feedback : {sub.feedback}</p></div>}
                                      {sub?.submission_url && <div className="mb-3"><SubmissionViewer submissionUrl={sub.submission_url} /></div>}
                                      {isPaid && !sub && (
                                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                          onClick={() => setSelectedAssessment({ id: ass.id, title: ass.title })}
                                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-green-500/20 transition-all">
                                          <Send className="w-4 h-4" /> Soumettre mon travail
                                        </motion.button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            {!isUnlocked && <div className="px-4 pb-4"><div className="flex items-center gap-2 text-xs text-slate-500"><Lock className="w-3 h-3" /> Validez la semaine {mod.week_number - 1} pour débloquer</div></div>}
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

      {/* Blocs inférieurs : Compétences, Public, Avantages, Brochure */}
      {isPaid && certificateInfo && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Compétences acquises */}
          {certificateInfo.skills && (
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 lg:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-xl"><Award className="w-5 h-5 text-blue-400" /></div>
                <h3 className="text-base font-bold text-white">Compétences Acquises</h3>
              </div>
              <ul className="space-y-2">
                {certificateInfo.skills.split('\n').filter(Boolean).map((skill, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    {skill.replace(/^[•\-]\s*/, '')}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Public cible */}
          {certificateInfo.targetAudience && (
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 lg:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/10 rounded-xl"><Users className="w-5 h-5 text-purple-400" /></div>
                <h3 className="text-base font-bold text-white">Pour qui ?</h3>
              </div>
              <ul className="space-y-2">
                {certificateInfo.targetAudience.split('\n').filter(Boolean).map((audience, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <Zap className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    {audience.replace(/^[•\-]\s*/, '')}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Avantages + Brochure */}
          {(certificateInfo.benefits || certificateInfo.brochureUrl) && (
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 lg:p-6">
              {certificateInfo.benefits && (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-500/10 rounded-xl"><Star className="w-5 h-5 text-amber-400" /></div>
                    <h3 className="text-base font-bold text-white">Avantages</h3>
                  </div>
                  <ul className="space-y-2 mb-4">
                    {certificateInfo.benefits.split('\n').filter(Boolean).map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <Star className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                        {benefit.replace(/^[•\-]\s*/, '')}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {certificateInfo.brochureUrl && (
                <a href={certificateInfo.brochureUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/20">
                  <Download className="w-4 h-4" />
                  Télécharger le programme détaillé (PDF)
                </a>
              )}
            </div>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {selectedAssessment && (
          <SubmissionModal isOpen={!!selectedAssessment} onClose={() => setSelectedAssessment(null)}
            assessmentId={selectedAssessment.id} userStatus={userStatus} />
        )}
      </AnimatePresence>
    </div>
  );
}