import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

type SendSubmissionEmailParams = {
  to: string[];
  studentName: string;
  formationTitle: string;
  moduleTitle: string;
  submissionUrl: string;
};

export async function sendSubmissionEmail({
  to,
  studentName,
  formationTitle,
  moduleTitle,
  submissionUrl,
}: SendSubmissionEmailParams) {
  const { data, error } = await resend.emails.send({
    from: 'APIAD <notifications@apiad-lobe.com>',
    to,
    subject: `📝 Nouvelle soumission de ${studentName} – ${moduleTitle}`,
    html: `
      <h2>Nouvelle copie à corriger</h2>
      <p><strong>Étudiant :</strong> ${studentName}</p>
      <p><strong>Formation :</strong> ${formationTitle}</p>
      <p><strong>Module / Examen :</strong> ${moduleTitle}</p>
      <p><a href="${submissionUrl}">Voir la copie</a></p>
    `,
  });

  if (error) {
    console.error('Erreur envoi email:', error);
    return false;
  }
  return true;
}

type SendGradingEmailParams = {
  to: string;
  studentName: string;
  formationTitle: string;
  moduleTitle: string;
  grade: number;
  maxScore: number;
  status: 'PASSED' | 'FAILED';
  feedback?: string;
};

export async function sendGradingEmail({
  to,
  studentName,
  formationTitle,
  moduleTitle,
  grade,
  maxScore,
  status,
  feedback,
}: SendGradingEmailParams) {
  const isPassed = status === 'PASSED';
  const subject = `${isPassed ? '✅' : '❌'} Résultat : ${moduleTitle}`;
  const html = `
    <h2>Résultat de votre évaluation</h2>
    <p><strong>Étudiant :</strong> ${studentName}</p>
    <p><strong>Formation :</strong> ${formationTitle}</p>
    <p><strong>Épreuve :</strong> ${moduleTitle}</p>
    <p><strong>Note :</strong> ${grade} / ${maxScore}</p>
    <p><strong>Statut :</strong> ${isPassed ? 'Validé ✔' : 'Non validé ✘'}</p>
    ${feedback ? `<p><strong>Commentaire du formateur :</strong> ${feedback}</p>` : ''}
    ${isPassed
      ? '<p>Félicitations ! Vous pouvez accéder à la suite de votre formation.</p>'
      : '<p>Nous vous encourageons à réviser et à repasser l’épreuve.</p>'}
  `;

  const { data, error } = await resend.emails.send({
    from: 'APIAD <notifications@apiad-lobe.com>',
    to,
    subject,
    html,
  });

  if (error) {
    console.error('Erreur envoi email de correction:', error);
    return false;
  }
  return true;
}