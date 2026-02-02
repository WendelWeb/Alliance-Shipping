interface FeeChange {
  oldServiceFee: number;
  newServiceFee: number;
  oldPricePerLb: number;
  newPricePerLb: number;
  effectiveDate: Date;
}

interface AnnouncementTemplate {
  title: string;
  content: string;
}

/**
 * Format date in a localized, readable format
 */
function formatDate(date: Date, locale: string = 'en-US'): string {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Multilingual templates for fee change announcements
 * Supports: English (en), French (fr), Haitian Creole (ht), Spanish (es)
 */
export const feeChangeTemplates = {
  en: (change: FeeChange): AnnouncementTemplate => ({
    title: `Shipping Fees Updated - Effective ${formatDate(change.effectiveDate, 'en-US')}`,
    content: `
Dear customers,

We are updating our shipping fees effective ${formatDate(change.effectiveDate, 'en-US')}:

**Service Fee**: $${change.oldServiceFee.toFixed(2)} → $${change.newServiceFee.toFixed(2)}
**Price per Pound**: $${change.oldPricePerLb.toFixed(2)}/lb → $${change.newPricePerLb.toFixed(2)}/lb

${
  change.effectiveDate > new Date()
    ? `This change will take effect on ${formatDate(change.effectiveDate, 'en-US')}.`
    : 'This change is effective immediately.'
}

Thank you for your understanding and continued trust in Alliance Shipping.

— Alliance Shipping Team
    `.trim(),
  }),

  fr: (change: FeeChange): AnnouncementTemplate => ({
    title: `Tarifs d'expédition mis à jour - En vigueur le ${formatDate(change.effectiveDate, 'fr-FR')}`,
    content: `
Chers clients,

Nous mettons à jour nos tarifs d'expédition à compter du ${formatDate(change.effectiveDate, 'fr-FR')} :

**Frais de service** : ${change.oldServiceFee.toFixed(2)}$ → ${change.newServiceFee.toFixed(2)}$
**Prix par livre** : ${change.oldPricePerLb.toFixed(2)}$/lb → ${change.newPricePerLb.toFixed(2)}$/lb

${
  change.effectiveDate > new Date()
    ? `Ce changement prendra effet le ${formatDate(change.effectiveDate, 'fr-FR')}.`
    : 'Ce changement est effectif immédiatement.'
}

Merci de votre compréhension et de votre confiance continue envers Alliance Shipping.

— Équipe Alliance Shipping
    `.trim(),
  }),

  ht: (change: FeeChange): AnnouncementTemplate => ({
    title: `Pri transpò chanje - Kòmanse ${formatDate(change.effectiveDate, 'fr-HT')}`,
    content: `
Chè kliyann,

N ap chanje pri transpò nou yo kòmanse ${formatDate(change.effectiveDate, 'fr-HT')} :

**Frè sèvis** : $${change.oldServiceFee.toFixed(2)} → $${change.newServiceFee.toFixed(2)}
**Pri pa liv** : $${change.oldPricePerLb.toFixed(2)}/lb → $${change.newPricePerLb.toFixed(2)}/lb

${
  change.effectiveDate > new Date()
    ? `Chanjman sa a pral kòmanse ${formatDate(change.effectiveDate, 'fr-HT')}.`
    : 'Chanjman sa a aktif kounye a.'
}

Mèsi pou konpreyansyon ou ak konfyans ou nan Alliance Shipping.

— Ekip Alliance Shipping
    `.trim(),
  }),

  es: (change: FeeChange): AnnouncementTemplate => ({
    title: `Tarifas de envío actualizadas - Vigente desde ${formatDate(change.effectiveDate, 'es-ES')}`,
    content: `
Estimados clientes,

Estamos actualizando nuestras tarifas de envío con vigencia desde ${formatDate(change.effectiveDate, 'es-ES')}:

**Tarifa de servicio**: $${change.oldServiceFee.toFixed(2)} → $${change.newServiceFee.toFixed(2)}
**Precio por libra**: $${change.oldPricePerLb.toFixed(2)}/lb → $${change.newPricePerLb.toFixed(2)}/lb

${
  change.effectiveDate > new Date()
    ? `Este cambio entrará en vigencia el ${formatDate(change.effectiveDate, 'es-ES')}.`
    : 'Este cambio es efectivo inmediatamente.'
}

Gracias por su comprensión y confianza continua en Alliance Shipping.

— Equipo Alliance Shipping
    `.trim(),
  }),
};

/**
 * Determine if an announcement should be created
 * Only create if at least one fee value changes
 */
export function shouldCreateAnnouncement(change: FeeChange): boolean {
  const serviceFeeChanged = change.oldServiceFee !== change.newServiceFee;
  const pricePerLbChanged = change.oldPricePerLb !== change.newPricePerLb;

  return serviceFeeChanged || pricePerLbChanged;
}

/**
 * Supported languages for announcements
 */
export const SUPPORTED_LANGUAGES = ['en', 'fr', 'ht', 'es'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
