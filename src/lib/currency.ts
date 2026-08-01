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

// 🆕 Fonction de calcul des réductions
export function calculateReducedPrice(
  totalPriceNormal: number,
  profileType: string,
  numberOfCertificates: number
): {
  finalPrice: number;
  discount: number;
  discountPercent: number;
  showDiscount: boolean;
} {
  const isStagiaire = profileType === 'Stagiaire';
  
  let discountPercent = 0;
  
  if (isStagiaire) {
    // Stagiaire : -25% CACHÉ
    discountPercent = 25;
  } else {
    // Professionnel : réduction visible selon nombre de certifs
    if (numberOfCertificates <= 2) {
      discountPercent = 10;
    } else if (numberOfCertificates <= 4) {
      discountPercent = 15;
    } else {
      discountPercent = 20;
    }
  }
  
  const discount = Math.round(totalPriceNormal * (discountPercent / 100));
  const finalPrice = totalPriceNormal - discount;
  
  return {
    finalPrice,
    discount,
    discountPercent,
    showDiscount: !isStagiaire, // VRAI pour les pros, FAUX pour les stagiaires
  };
}