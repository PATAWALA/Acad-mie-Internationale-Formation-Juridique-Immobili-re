const EUR_RATE = 655.96;

export function formatFCFA(amount: number): string {
  return `${Math.round(amount).toLocaleString('fr-FR')} FCFA`;
}

export function formatEUR(amount: number): string {
  const eur = amount / EUR_RATE;
  return `≈ ${eur.toFixed(2).replace('.', ',')} €`;
}

export function getEUR(amount: number): number {
  return amount / EUR_RATE;
}

// 🆕 Calcul du prix réduit selon le profil et le nombre de certificats
export function calculateReducedPrice(
  totalPriceNormal: number,
  profileType: string,
  numberOfCertificates: number
): {
  finalPrice: number;
  discount: number;
  discountPercent: number;
} {
  let discountPercent = 0;

  if (profileType === 'Stagiaire') {
    // Stagiaire : -25% CACHÉ
    discountPercent = 25;
  } else if (
    profileType === 'En activité dans le secteur juridique' ||
    profileType === 'En activité dans le secteur immobilier' ||
    profileType === 'En quête d\'emploi' ||
    profileType === 'Autres'
  ) {
    // Professionnel : réduction selon le nombre de certificats
    if (numberOfCertificates <= 2) {
      discountPercent = 10;
    } else if (numberOfCertificates <= 4) {
      discountPercent = 15;
    } else {
      discountPercent = 20;
    }
  }
  // Étudiant : 0% (utilise price_bourse déjà en base)

  const discount = Math.round(totalPriceNormal * (discountPercent / 100));
  const finalPrice = totalPriceNormal - discount;

  return {
    finalPrice,
    discount,
    discountPercent,
  };
}

// 🆕 Vérifie si le profil est un professionnel (réduction visible)
export function isProfessional(profileType: string): boolean {
  return (
    profileType === 'En activité dans le secteur juridique' ||
    profileType === 'En activité dans le secteur immobilier' ||
    profileType === 'En quête d\'emploi' ||
    profileType === 'Autres'
  );
}

// 🆕 Vérifie si le profil est un stagiaire (réduction cachée)
export function isStagiaire(profileType: string): boolean {
  return profileType === 'Stagiaire';
}

// 🆕 Vérifie si le profil est un étudiant (prix bourse)
export function isEtudiant(profileType: string): boolean {
  return profileType === 'Etudiant';
}