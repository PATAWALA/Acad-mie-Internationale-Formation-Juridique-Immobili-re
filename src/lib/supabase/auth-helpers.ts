import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * Récupère le statut du profil d'un utilisateur
 */
export async function getProfileStatus(userId: string) {
  const { createClientComponent } = await import('./client');
  const supabase = createClientComponent();
  const { data, error } = await supabase
    .from('profiles')
    .select('status, role')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Redirige en fonction du rôle
 */
export function redirectBasedOnRole(role: string, router: AppRouterInstance) {
  switch (role) {
    case 'SUPER_ADMIN':
      router.push('/dashboard/super-admin');
      break;
    case 'TEACHER':
      router.push('/dashboard/enseignant');
      break;
    case 'STUDENT':
    default:
      router.push('/dashboard/etudiant');
      break;
  }
}