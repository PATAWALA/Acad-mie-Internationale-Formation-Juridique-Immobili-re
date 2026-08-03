import { createClientComponent } from '@/lib/supabase/client';

const supabase = createClientComponent();

// Types
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
}

/**
 * Créer une notification in-app
 */
export async function createNotification({
  userId,
  title,
  message,
  type = 'info',
  link,
}: CreateNotificationParams) {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title,
      message,
      type,
      link,
    })
    .select()
    .single();

  if (error) {
    console.error('Erreur création notification:', error);
    return null;
  }

  return data;
}

/**
 * Récupérer les notifications non lues d'un utilisateur
 */
export async function getUnreadNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('read', false)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Erreur récupération notifications:', error);
    return [];
  }

  return data || [];
}

/**
 * Récupérer toutes les notifications d'un utilisateur
 */
export async function getAllNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Erreur récupération notifications:', error);
    return [];
  }

  return data || [];
}

/**
 * Marquer une notification comme lue
 */
export async function markAsRead(notificationId: number) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Erreur marquage lu:', error);
  }
}

/**
 * Marquer toutes les notifications comme lues
 */
export async function markAllAsRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    console.error('Erreur marquage tout lu:', error);
  }
}

/**
 * Compter les notifications non lues
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    console.error('Erreur comptage notifications:', error);
    return 0;
  }

  return count || 0;
}

/**
 * S'abonner aux nouvelles notifications en temps réel
 */
export function subscribeToNotifications(
  userId: string,
  onNewNotification: (notification: any) => void
) {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onNewNotification(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ══════════════════════════════════════════════
// FONCTIONS SPÉCIFIQUES PAR RÔLE
// ══════════════════════════════════════════════

/**
 * 🔔 ÉTUDIANT : TP corrigé par l'enseignant
 */
export async function notifyTPCorrige(
  studentId: string,
  courseTitle: string,
  grade: number
) {
  return createNotification({
    userId: studentId,
    title: '✅ TP corrigé !',
    message: `Votre devoir « ${courseTitle} » a été corrigé. Note obtenue : ${grade}/20. Cliquez pour voir les détails.`,
    type: 'success',
    link: '/dashboard/etudiant',
  });
}

/**
 * 🔔 ÉTUDIANT : Semaine débloquée après validation
 */
export async function notifySemaineDebloquee(
  studentId: string,
  weekNumber: number,
  certificateTitle: string
) {
  return createNotification({
    userId: studentId,
    title: '🔓 Nouvelle semaine débloquée !',
    message: `Félicitations ! La Semaine ${weekNumber} de « ${certificateTitle} » est maintenant accessible. Continuez votre progression !`,
    type: 'success',
    link: '/dashboard/etudiant',
  });
}

/**
 * 🔔 ÉTUDIANT : Certificat émis par l'admin
 */
export async function notifyCertificatDisponible(
  studentId: string,
  certificateTitle: string
) {
  return createNotification({
    userId: studentId,
    title: '🎓 Votre certificat est prêt !',
    message: `Félicitations ! Votre certificat « ${certificateTitle} » a été émis avec succès. Téléchargez-le depuis votre espace étudiant.`,
    type: 'success',
    link: '/dashboard/etudiant',
  });
}

/**
 * 🔔 ÉTUDIANT : Rappel de paiement
 */
export async function notifyRappelPaiement(
  studentId: string,
  certificateTitle: string,
  amount: number
) {
  return createNotification({
    userId: studentId,
    title: '⏳ Paiement en attente',
    message: `Votre inscription à « ${certificateTitle} » est en attente de paiement (${amount.toLocaleString()} FCFA). Finalisez-la pour accéder à la formation.`,
    type: 'warning',
    link: '/dashboard/etudiant',
  });
}

/**
 * 🔔 ENSEIGNANT : Nouveau TP soumis par un étudiant
 */
export async function notifyNouveauTP(
  teacherId: string,
  studentName: string,
  courseTitle: string
) {
  return createNotification({
    userId: teacherId,
    title: '📝 Nouvelle copie à corriger',
    message: `${studentName} vient de soumettre son devoir pour le cours « ${courseTitle} ». Cliquez pour accéder à la correction.`,
    type: 'info',
    link: '/dashboard/enseignant',
  });
}

/**
 * 🔔 ENSEIGNANT : Résumé hebdomadaire des copies en attente
 */
export async function notifyResumeCopies(
  teacherId: string,
  pendingCount: number
) {
  return createNotification({
    userId: teacherId,
    title: '📊 Copies en attente',
    message: `Vous avez ${pendingCount} copie${pendingCount > 1 ? 's' : ''} en attente de correction. Pensez à les corriger rapidement pour ne pas retarder vos étudiants.`,
    type: 'warning',
    link: '/dashboard/enseignant',
  });
}

/**
 * 🔔 ADMIN : Nouvelle inscription d'un étudiant
 */
export async function notifyNouvelleInscription(
  adminId: string,
  studentName: string,
  certNames?: string,
  profileType?: string
) {
  const details = certNames ? ` à : ${certNames}` : ' à une formation';
  const type = profileType ? ` (${profileType})` : '';
  
  return createNotification({
    userId: adminId,
    title: '🆕 Nouvelle inscription',
    message: `${studentName}${type} vient de s'inscrire${details}. Consultez la liste des inscriptions.`,
    type: 'info',
    link: '/dashboard/admin/inscriptions',
  });
}

/**
 * 🔔 ADMIN : Étudiant éligible pour recevoir son certificat
 */
export async function notifyEligibleCertificat(
  adminId: string,
  studentName: string,
  certificateTitle: string
) {
  return createNotification({
    userId: adminId,
    title: '🏆 Certificat à émettre',
    message: `${studentName} a terminé tous les modules de « ${certificateTitle} » avec succès. Le certificat est prêt à être émis.`,
    type: 'warning',
    link: '/dashboard/admin/certificats/emettre',
  });
}

/**
 * 🔔 ADMIN : Paiement confirmé
 */
export async function notifyPaiementConfirme(
  adminId: string,
  studentName: string,
  amount: number
) {
  return createNotification({
    userId: adminId,
    title: '💰 Paiement reçu',
    message: `${studentName} a effectué un paiement de ${amount.toLocaleString()} FCFA. Son accès aux formations est maintenant débloqué.`,
    type: 'success',
    link: '/dashboard/admin/inscriptions',
  });
}

// ══════════════════════════════════════════════
// FONCTIONS EMAIL (Supabase Email)
// ══════════════════════════════════════════════

/**
 * 📧 Envoyer un email via Supabase Edge Function
 */
export async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string
) {
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: { to, subject, html: htmlContent },
  });

  if (error) {
    console.error('Erreur envoi email:', error);
    return false;
  }

  return true;
}

/**
 * 📧 ÉTUDIANT : Relance paiement (J+3 après inscription)
 */
export async function sendRelancePaiement(
  email: string,
  studentName: string,
  amount: number,
  certificateNames: string
) {
  const subject = `⏳ Finalisez votre inscription - ${certificateNames}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0B0F19; color: #fff; padding: 30px; border-radius: 16px;">
      <h2 style="color: #D4AF37; text-align: center;">Université d'Été 2026</h2>
      <p>Bonjour <strong>${studentName}</strong>,</p>
      <p>Votre inscription à <strong>${certificateNames}</strong> est en attente de paiement depuis 3 jours.</p>
      <div style="background: #1e293b; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
        <p style="margin: 0; color: #94a3b8;">Montant à régler</p>
        <p style="font-size: 24px; font-weight: bold; color: #D4AF37; margin: 8px 0;">${amount.toLocaleString()} FCFA</p>
      </div>
      <p>Finalisez votre paiement pour débloquer immédiatement l'accès à votre formation.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/etudiant" 
           style="display: inline-block; padding: 14px 32px; background: #D4AF37; color: #0B0F19; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px;">
          Accéder à mon espace
        </a>
      </div>
      <p style="color: #64748b; font-size: 12px; text-align: center;">Université d'Été — Début le 08 Août 2026</p>
    </div>
  `;

  return sendEmail(email, subject, html);
}

/**
 * 📧 ÉTUDIANT : Certificat disponible
 */
export async function sendEmailCertificat(
  email: string,
  studentName: string,
  certificateTitle: string
) {
  const subject = `🎓 Votre certificat est prêt - ${certificateTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0B0F19; color: #fff; padding: 30px; border-radius: 16px;">
      <h2 style="color: #D4AF37; text-align: center;">🎉 Félicitations !</h2>
      <p>Bonjour <strong>${studentName}</strong>,</p>
      <p>Votre certificat <strong>« ${certificateTitle} »</strong> a été émis avec succès !</p>
      <p>Vous pouvez dès maintenant le télécharger depuis votre espace étudiant.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/etudiant" 
           style="display: inline-block; padding: 14px 32px; background: #D4AF37; color: #0B0F19; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px;">
          Télécharger mon certificat
        </a>
      </div>
      <p style="color: #64748b; font-size: 12px; text-align: center;">Université d'Été — Fierté & Excellence</p>
    </div>
  `;

  return sendEmail(email, subject, html);
}

/**
 * 📧 Résumé hebdomadaire (tous les rôles)
 */
export async function sendResumeHebdomadaire(
  email: string,
  name: string,
  stats: { label: string; value: string }[]
) {
  const subject = '📊 Votre récap hebdomadaire - Université d\'Été';
  const statsHtml = stats
    .map((s) => `<tr><td style="padding: 10px; border-bottom: 1px solid #1e293b;">${s.label}</td><td style="padding: 10px; border-bottom: 1px solid #1e293b; font-weight: bold; text-align: right;">${s.value}</td></tr>`)
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0B0F19; color: #fff; padding: 30px; border-radius: 16px;">
      <h2 style="color: #D4AF37; text-align: center;">Récapitulatif de la semaine</h2>
      <p>Bonjour <strong>${name}</strong>,</p>
      <p>Voici votre récapitulatif de la semaine :</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        ${statsHtml}
      </table>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" 
           style="display: inline-block; padding: 14px 32px; background: #D4AF37; color: #0B0F19; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px;">
          Voir mon tableau de bord
        </a>
      </div>
      <p style="color: #64748b; font-size: 12px; text-align: center;">Université d'Été — Chaque semaine compte</p>
    </div>
  `;

  return sendEmail(email, subject, html);
}