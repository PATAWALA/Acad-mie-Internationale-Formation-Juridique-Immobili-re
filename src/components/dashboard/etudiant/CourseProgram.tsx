'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SubmissionModal } from './SubmissionModal';
import ContentViewer from './ContentViewer';
import SubmissionViewer from "./SubmissionViewer";

interface CourseProgramProps {
  courses: any[];
  userStatus: string;
  passedAssessments: string[];
  submissionsMap: Record<string, any>; // nouvelle prop
}

export function CourseProgram({ courses, userStatus, passedAssessments, submissionsMap }: CourseProgramProps) {
  const isPaid = userStatus?.trim().toUpperCase() === 'PAID';
  const [selectedAssessment, setSelectedAssessment] = useState<{ id: string; title: string } | null>(null);

  if (!courses || courses.length === 0) {
    return (
      <div style={{ background: '#0f172a', padding: '20px', borderRadius: '8px', color: '#94a3b8' }}>
        Aucune formation disponible pour le moment.
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      {!isPaid && (
        <div style={{ background: 'linear-gradient(135deg, #7c2d12 0%, #451a03 100%)', border: '2px solid #ea580c', borderRadius: '12px', padding: '24px', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ fontSize: '28px' }}>🔒</span>
            <h3 style={{ margin: 0, fontSize: '20px', color: '#fdba74' }}>Votre inscription est en attente de validation</h3>
          </div>
          <p style={{ margin: '0 0 16px 0', color: '#fed7aa', fontSize: '14px', lineHeight: '1.5' }}>
            Vous avez fait le premier pas ! Pour débloquer immédiatement l'accès à tous les modules, télécharger les supports et obtenir votre <strong>Certificat de Fin de Formation</strong>, finalisez votre règlement dès maintenant.
          </p>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/checkout"
              style={{
                padding: '12px 24px',
                background: '#ea580c',
                color: '#fff',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '14px',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.4)'
              }}
            >
              🚀 Valider mon paiement & Débloquer mes accès
            </Link>
            <span style={{ fontSize: '12px', color: '#fdba74' }}>⚡ Accès instantané après validation</span>
          </div>
        </div>
      )}

      {isPaid && (
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 16px',
            background: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            alignSelf: 'flex-start',
            fontSize: '13px'
          }}
        >
          🔄 Actualiser ma progression
        </button>
      )}

      {courses.map((course) => (
        <div key={course.id} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ color: '#38bdf8' }}>{course.title}</h3>
          <p style={{ color: '#94a3b8' }}>{course.description}</p>

          <div style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
            {course.modules?.map((mod: any, index: number, arr: any[]) => {
              const isFirstModule = index === 0;
              const prevModule = !isFirstModule ? arr[index - 1] : null;
              const prevAssessmentId = prevModule?.assessments?.[0]?.id;
              const isUnlocked = isFirstModule || (prevAssessmentId && passedAssessments.includes(prevAssessmentId));

              return (
                <div key={mod.id} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '16px', opacity: isUnlocked ? 1 : 0.6 }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#f8fafc' }}>
                    🗓️ Semaine {mod.week_number} : {mod.title}
                  </h4>

                  {!isUnlocked && (
                    <div style={{ color: '#ef4444', marginBottom: '8px', fontSize: '13px' }}>
                      🔒 Vous devez valider la semaine {mod.week_number - 1} pour accéder à celle-ci.
                    </div>
                  )}

                  {/* Leçons */}
                  <div style={{ display: 'grid', gap: '12px', opacity: isUnlocked ? 1 : 0.5 }}>
                    {mod.lessons?.map((lesson: any) => (
                      <div key={lesson.id} style={{ background: '#0f172a', padding: '10px 14px', borderRadius: '6px', fontSize: '13px' }}>
                        <span>📖 {lesson.title} ({lesson.content_type})</span>
                        {isPaid && isUnlocked ? (
                          <ContentViewer
                            contentType={lesson.content_type}
                            contentUrl={lesson.content_url}
                            contentBody={lesson.content_body}
                            title={lesson.title}
                          />
                        ) : (
                          <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                            {!isPaid ? '🔒 Réservé aux membres payants' : '🔒 Module verrouillé'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Évaluations : affichage des notes et feedback */}
                  {mod.assessments?.length > 0 && (
                    <div style={{ marginTop: '12px' }}>
                      {mod.assessments.map((ass: any) => {
                        const sub = submissionsMap[ass.id];
                        return (
                          <div key={ass.id} style={{ fontSize: '13px', marginBottom: '6px' }}>
                            {!sub && isUnlocked && (
                              <span style={{ color: '#94a3b8' }}>📝 {ass.title} (pas encore soumis)</span>
                            )}
                            {sub && sub.status === 'PENDING' && (
                              <span style={{ color: '#f59e0b' }}>⏳ En attente de correction</span>
                            )}
                            {sub && sub.status !== 'PENDING' && (
                              <div>
                                <span style={{ color: sub.status === 'PASSED' ? '#22c55e' : '#ef4444', fontWeight: 'bold' }}>
                                  {sub.status === 'PASSED' ? '✅ Validé' : '❌ Non validé'} — Note : {sub.grade}/20
                                </span>
                                {sub.feedback && (
                                  <p style={{ color: '#94a3b8', margin: '4px 0 0' }}>💬 {sub.feedback}</p>
                                )}
                                <p style={{ margin: '4px 0 0' }}>
                                  <SubmissionViewer submissionUrl={sub.submission_url} />
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Bouton de soumission (visible uniquement si débloqué, payé, et au moins un assessment) */}
                  {isPaid && isUnlocked && mod.assessments?.length > 0 && (
                    <button
                      onClick={() => setSelectedAssessment({ id: mod.assessments[0].id, title: mod.assessments[0].title })}
                      style={{
                        marginTop: '12px',
                        padding: '8px 16px',
                        background: '#22c55e',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      📤 Soumettre le TP de cette semaine
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {selectedAssessment && (
        <SubmissionModal
          isOpen={!!selectedAssessment}
          onClose={() => setSelectedAssessment(null)}
          assessmentId={selectedAssessment.id}
          userStatus={userStatus}
        />
      )}
    </div>
  );
}