/**
 * Génère un tracking number Alliance Shipping unique
 * Format: AS-XXXXXXXXXX (AS + 10 chiffres)
 * @returns string - Le tracking number généré
 */
export function generateASTrackingNumber(): string {
  // Génère 10 chiffres aléatoires
  const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
  return `AS-${randomDigits}`;
}

/**
 * Valide un tracking number Alliance Shipping
 * @param tracking - Le tracking number à valider
 * @returns boolean - True si valide
 */
export function validateASTrackingNumber(tracking: string): boolean {
  const regex = /^AS-\d{10}$/;
  return regex.test(tracking);
}

/**
 * Formate un tracking number pour l'affichage
 * @param tracking - Le tracking number à formater
 * @returns string - Le tracking number formaté
 */
export function formatTrackingNumber(tracking: string): string {
  if (!tracking) return '';

  // Si c'est un tracking AS, on le formate joliment
  if (tracking.startsWith('AS-')) {
    const digits = tracking.replace('AS-', '');
    // Format: AS-XXXX XXXX XX
    return `AS-${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 10)}`;
  }

  return tracking;
}
