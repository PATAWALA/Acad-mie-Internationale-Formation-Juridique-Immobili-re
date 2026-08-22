import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const platformBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.apiad-lobe.com';

type SendSubmissionEmailParams = {
  to: string[];
  studentName: string;
  formationTitle: string;
  moduleTitle: string;
  submissionUrl: string; // gardé en secours, mais plus affiché directement
};

export async function sendSubmissionEmail({
  to,
  studentName,
  formationTitle,
  moduleTitle
}: SendSubmissionEmailParams) {
  const correctionLink = `${platformBaseUrl}/dashboard/enseignant`;

  const { data, error } = await resend.emails.send({
    from: 'APIAD <notifications@apiad-lobe.com>',
    to,
    subject: `📝 Nouvelle soumission de ${studentName} – ${moduleTitle}`,
    html: `
      <h2>Nouvelle copie à corriger</h2>
      <p><strong>Étudiant :</strong> ${studentName}</p>
      <p><strong>Formation :</strong> ${formationTitle}</p>
      <p><strong>Module / Examen :</strong> ${moduleTitle}</p>
      <p><a href="${correctionLink}">Accéder à l'espace de correction</a></p>
      <p style="color:#666; font-size:12px;">Connectez-vous à votre espace enseignant pour consulter et corriger la copie.</p>
    `,
  });

  if (error) {
    console.error('Erreur envoi email:', error);
    return false;
  }
  return true;
}