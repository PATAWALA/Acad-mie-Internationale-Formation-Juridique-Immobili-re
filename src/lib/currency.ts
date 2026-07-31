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