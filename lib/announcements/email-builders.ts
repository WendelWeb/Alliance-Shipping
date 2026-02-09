// ============================================
// UNIFIED EMAIL BUILDERS - Professional HTML emails
// Action emails: before/after tables with context
// Communication emails: announcement-style with variables
// ============================================

import type { Locale, CityFeeChangePayload, LoyaltyRateChangePayload, DeliveryTimeChangePayload } from './templates-v2';
import type { ActionChange } from './action-executors';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// ─── SHARED EMAIL STRINGS ───────────────────────────────────────

const greetings: Record<Locale, string> = {
  en: 'Hello', fr: 'Bonjour', ht: 'Bonjou', es: 'Hola',
};

const footers: Record<Locale, string> = {
  en: 'Alliance Shipping - Reliable Shipping from USA to Haiti',
  fr: 'Alliance Shipping - Expédition Fiable des USA vers Haïti',
  ht: 'Alliance Shipping - Livrezon Fyab soti nan USA pou ale an Ayiti',
  es: 'Alliance Shipping - Envíos Confiables de USA a Haití',
};

const automated: Record<Locale, string> = {
  en: 'This is an automated message, please do not reply.',
  fr: 'Ceci est un message automatique, merci de ne pas répondre.',
  ht: 'Sa a se yon mesaj otomatik, tanpri pa reponn.',
  es: 'Este es un mensaje automático, por favor no responda.',
};

const viewAllNews: Record<Locale, string> = {
  en: 'View All News', fr: 'Voir Toutes les Actualités', ht: 'Wè Tout Nouvèl', es: 'Ver Todas las Noticias',
};

const effectiveNow: Record<Locale, string> = {
  en: 'These changes are effective immediately.',
  fr: 'Ces changements sont effectifs immédiatement.',
  ht: 'Chanjman sa yo ap pran efè touswit.',
  es: 'Estos cambios son efectivos de inmediato.',
};

const prevLabel: Record<Locale, string> = { en: 'Previous', fr: 'Avant', ht: 'Avan', es: 'Anterior' };
const newLabel: Record<Locale, string> = { en: 'New', fr: 'Nouveau', ht: 'Nouvo', es: 'Nuevo' };

// Template-specific colors
const templateColors: Record<string, { gradient: string; badge: string }> = {
  city_fee_change: { gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)', badge: '#d97706' },
  delivery_time_change: { gradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', badge: '#1e40af' },
  loyalty_rate_change: { gradient: 'linear-gradient(135deg, #059669 0%, #d97706 100%)', badge: '#059669' },
  new_special_item: { gradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', badge: '#1e40af' },
  modify_special_item: { gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)', badge: '#d97706' },
  remove_special_item: { gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)', badge: '#dc2626' },
  new_warehouse: { gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', badge: '#059669' },
  modify_warehouse: { gradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', badge: '#1e40af' },
  close_warehouse: { gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)', badge: '#dc2626' },
  // Communication
  news: { gradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', badge: '#1e40af' },
  alert: { gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)', badge: '#dc2626' },
  promo: { gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)', badge: '#7c3aed' },
  maintenance: { gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)', badge: '#d97706' },
};

// Badge labels per template
const templateBadges: Record<string, Record<Locale, string>> = {
  city_fee_change: { en: 'FEE UPDATE', fr: 'MISE À JOUR TARIFS', ht: 'MIZAJOU TARIF', es: 'ACTUALIZACIÓN TARIFAS' },
  delivery_time_change: { en: 'DELIVERY UPDATE', fr: 'MISE À JOUR LIVRAISON', ht: 'MIZAJOU LIVREZON', es: 'ACTUALIZACIÓN ENTREGA' },
  loyalty_rate_change: { en: 'LOYALTY UPDATE', fr: 'MISE À JOUR FIDÉLITÉ', ht: 'MIZAJOU FIDELITE', es: 'ACTUALIZACIÓN LEALTAD' },
  new_special_item: { en: 'NEW ITEM', fr: 'NOUVEL ARTICLE', ht: 'NOUVO ATIK', es: 'NUEVO ARTÍCULO' },
  modify_special_item: { en: 'ITEM UPDATE', fr: 'ARTICLE MODIFIÉ', ht: 'ATIK MODIFYE', es: 'ARTÍCULO ACTUALIZADO' },
  remove_special_item: { en: 'ITEM REMOVED', fr: 'ARTICLE RETIRÉ', ht: 'ATIK RETIRE', es: 'ARTÍCULO ELIMINADO' },
  new_warehouse: { en: 'NEW LOCATION', fr: 'NOUVEAU DÉPÔT', ht: 'NOUVO DEPO', es: 'NUEVA UBICACIÓN' },
  modify_warehouse: { en: 'LOCATION UPDATE', fr: 'DÉPÔT MODIFIÉ', ht: 'DEPO MODIFYE', es: 'UBICACIÓN ACTUALIZADA' },
  close_warehouse: { en: 'LOCATION CLOSED', fr: 'DÉPÔT FERMÉ', ht: 'DEPO FÈMEN', es: 'UBICACIÓN CERRADA' },
};

// Communication badges
const commBadges: Record<string, Record<Locale, string>> = {
  news: { en: 'NEWS', fr: 'ACTUALITÉ', ht: 'NOUVÈL', es: 'NOTICIA' },
  alert: { en: 'ALERT', fr: 'ALERTE', ht: 'ALÈT', es: 'ALERTA' },
  promo: { en: 'PROMOTION', fr: 'PROMOTION', ht: 'PWOMOSYON', es: 'PROMOCIÓN' },
  maintenance: { en: 'MAINTENANCE', fr: 'MAINTENANCE', ht: 'MANTYEN', es: 'MANTENIMIENTO' },
};

// Email subjects
export const actionEmailSubjects: Record<string, Record<Locale, string>> = {
  city_fee_change: { en: 'Shipping Fee Update', fr: 'Mise à jour des Tarifs', ht: 'Mizajou Tarif Anvoy', es: 'Actualización de Tarifas' },
  delivery_time_change: { en: 'Delivery Time Update', fr: 'Mise à jour Délai de Livraison', ht: 'Mizajou Tan Livrezon', es: 'Actualización Tiempo de Entrega' },
  loyalty_rate_change: { en: 'Loyalty Program Update', fr: 'Mise à jour Programme Fidélité', ht: 'Mizajou Pwogram Fidelite', es: 'Actualización Programa Lealtad' },
  new_special_item: { en: 'New Special Item', fr: 'Nouvel Article Spécial', ht: 'Nouvo Atik Espesyal', es: 'Nuevo Artículo Especial' },
  modify_special_item: { en: 'Special Item Updated', fr: 'Article Spécial Modifié', ht: 'Atik Espesyal Modifye', es: 'Artículo Especial Actualizado' },
  remove_special_item: { en: 'Special Item Removed', fr: 'Article Spécial Retiré', ht: 'Atik Espesyal Retire', es: 'Artículo Especial Eliminado' },
  new_warehouse: { en: 'New Warehouse Location', fr: 'Nouveau Dépôt', ht: 'Nouvo Depo', es: 'Nueva Ubicación' },
  modify_warehouse: { en: 'Warehouse Updated', fr: 'Dépôt Modifié', ht: 'Depo Modifye', es: 'Almacén Actualizado' },
  close_warehouse: { en: 'Warehouse Closed', fr: 'Dépôt Fermé', ht: 'Depo Fèmen', es: 'Almacén Cerrado' },
};

export const communicationEmailSubjects: Record<string, Record<Locale, string>> = {
  news: { en: 'New Announcement', fr: 'Nouvelle Annonce', ht: 'Nouvo Anons', es: 'Nuevo Anuncio' },
  alert: { en: 'Important Alert', fr: 'Alerte Importante', ht: 'Alèt Enpòtan', es: 'Alerta Importante' },
  promo: { en: 'Special Offer', fr: 'Offre Spéciale', ht: 'Òf Espesyal', es: 'Oferta Especial' },
  maintenance: { en: 'Service Update', fr: 'Mise à jour Service', ht: 'Mizajou Sèvis', es: 'Actualización Servicio' },
};

// ─── BASE EMAIL WRAPPER ─────────────────────────────────────────

function wrapEmail(
  locale: Locale,
  gradient: string,
  badge: string,
  emoji: string,
  title: string,
  userName: string,
  bodyHtml: string,
  buttonUrl: string,
  buttonText: string
): string {
  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.7; color: #1f2937; margin: 0; padding: 0; background: #f3f4f6; }
    .wrapper { padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: ${gradient}; color: white; padding: 36px 24px; text-align: center; border-radius: 16px 16px 0 0; }
    .header h1 { margin: 0 0 8px; font-size: 22px; font-weight: 800; }
    .type-badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 12px; }
    .content { background: #ffffff; padding: 32px 28px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .greeting { font-size: 16px; color: #374151; margin-bottom: 20px; }
    .body-text { font-size: 15px; color: #4b5563; line-height: 1.8; }
    .changes-table { width: 100%; border-collapse: collapse; margin: 20px 0; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; }
    .changes-table th { background: #f9fafb; padding: 10px 16px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; text-align: left; }
    .changes-table th:not(:first-child) { text-align: center; }
    .changes-table td { padding: 12px 16px; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
    .effective { font-size: 14px; color: #059669; font-weight: 600; margin: 20px 0; padding: 12px 16px; background: #ecfdf5; border-radius: 8px; text-align: center; }
    .info-card { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .info-card h3 { margin: 0 0 8px; font-size: 16px; color: #0369a1; }
    .info-card p { margin: 4px 0; font-size: 14px; color: #374151; }
    .btn-container { text-align: center; margin: 28px 0 16px; }
    .button { display: inline-block; padding: 14px 36px; background: ${gradient}; color: #ffffff !important; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px; }
    .footer { text-align: center; padding: 24px; color: #9ca3af; font-size: 12px; }
    .footer p { margin: 4px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="type-badge">${badge}</div>
        <h1>${emoji} ${title}</h1>
      </div>
      <div class="content">
        <p class="greeting">${greetings[locale]} <strong>${userName}</strong>,</p>
        ${bodyHtml}
        <div class="btn-container">
          <a href="${buttonUrl}" class="button">${buttonText}</a>
        </div>
      </div>
      <div class="footer">
        <p><strong>${footers[locale]}</strong></p>
        <p>${automated[locale]}</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ─── ACTION EMAIL BUILDER ───────────────────────────────────────

export function buildActionEmailHtml(
  templateId: string,
  payload: Record<string, any>,
  title: string,
  userName: string,
  locale: Locale
): string {
  const colors = templateColors[templateId] || templateColors.news;
  const badge = templateBadges[templateId]?.[locale] || 'UPDATE';
  const emoji = getTemplateEmoji(templateId);
  const bodyHtml = buildActionBodyHtml(templateId, payload, locale);

  return wrapEmail(
    locale,
    colors.gradient,
    badge,
    emoji,
    title,
    userName,
    bodyHtml,
    `${APP_URL}/news`,
    viewAllNews[locale]
  );
}

function getTemplateEmoji(templateId: string): string {
  const emojis: Record<string, string> = {
    city_fee_change: '💰',
    delivery_time_change: '📅',
    loyalty_rate_change: '🎁',
    new_special_item: '📱',
    modify_special_item: '✏️',
    remove_special_item: '🗑️',
    new_warehouse: '🏢',
    modify_warehouse: '🔄',
    close_warehouse: '🚫',
  };
  return emojis[templateId] || '📢';
}

function buildActionBodyHtml(templateId: string, payload: Record<string, any>, locale: Locale): string {
  switch (templateId) {
    case 'city_fee_change':
      return buildCityFeeBodyHtml(payload as CityFeeChangePayload, locale);
    case 'delivery_time_change':
      return buildDeliveryTimeBodyHtml(payload as DeliveryTimeChangePayload, locale);
    case 'loyalty_rate_change':
      return buildLoyaltyRateBodyHtml(payload as LoyaltyRateChangePayload, locale);
    case 'new_special_item':
      return buildNewSpecialItemBodyHtml(payload, locale);
    case 'modify_special_item':
      return buildModifySpecialItemBodyHtml(payload, locale);
    case 'remove_special_item':
      return buildRemoveSpecialItemBodyHtml(payload, locale);
    case 'new_warehouse':
      return buildNewWarehouseBodyHtml(payload, locale);
    case 'modify_warehouse':
      return buildModifyWarehouseBodyHtml(payload, locale);
    case 'close_warehouse':
      return buildCloseWarehouseBodyHtml(payload, locale);
    default:
      return '<p>Update details are available on our website.</p>';
  }
}

// ─── CITY FEE CHANGE BODY ───────────────────────────────────────

function buildCityFeeBodyHtml(payload: CityFeeChangePayload, locale: Locale): string {
  const intros: Record<Locale, string> = {
    en: 'We are updating our shipping fees for the following cities:',
    fr: 'Nous mettons à jour nos tarifs d\'expédition pour les villes suivantes :',
    ht: 'Nou ap chanje tarif anvoy nou yo pou vil sa yo :',
    es: 'Estamos actualizando nuestras tarifas de envío para las siguientes ciudades:',
  };

  const cityLabel: Record<Locale, string> = { en: 'City', fr: 'Ville', ht: 'Vil', es: 'Ciudad' };
  const sfLabel: Record<Locale, string> = { en: 'Service Fee', fr: 'Frais Service', ht: 'Frè Sèvis', es: 'Tarifa Servicio' };
  const plLabel: Record<Locale, string> = { en: 'Price/lb', fr: 'Prix/lb', ht: 'Pri/lb', es: 'Precio/lb' };

  const rows = payload.cities.map((c) => {
    const sfChanged = c.oldServiceFee !== c.newServiceFee;
    const plChanged = c.oldPricePerLb !== c.newPricePerLb;
    const sfColor = sfChanged ? (c.newServiceFee > c.oldServiceFee ? '#dc2626' : '#059669') : '#6b7280';
    const plColor = plChanged ? (c.newPricePerLb > c.oldPricePerLb ? '#dc2626' : '#059669') : '#6b7280';

    return `<tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #374151;">📍 ${c.city}</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; text-align: center; color: ${sfColor}; font-weight: 600;">
        ${sfChanged ? `$${c.oldServiceFee.toFixed(2)} → $${c.newServiceFee.toFixed(2)}` : `$${c.oldServiceFee.toFixed(2)}`}
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; text-align: center; color: ${plColor}; font-weight: 600;">
        ${plChanged ? `$${c.oldPricePerLb.toFixed(2)} → $${c.newPricePerLb.toFixed(2)}` : `$${c.oldPricePerLb.toFixed(2)}`}
      </td>
    </tr>`;
  }).join('');

  return `
    <p class="body-text">${intros[locale]}</p>
    <table class="changes-table">
      <thead>
        <tr>
          <th>${cityLabel[locale]}</th>
          <th style="text-align: center;">${sfLabel[locale]}</th>
          <th style="text-align: center;">${plLabel[locale]}</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="effective">✅ ${effectiveNow[locale]}</div>`;
}

// ─── DELIVERY TIME CHANGE BODY ──────────────────────────────────

function buildDeliveryTimeBodyHtml(payload: DeliveryTimeChangePayload, locale: Locale): string {
  const intros: Record<Locale, string> = {
    en: `We have updated the estimated delivery times for <strong>${payload.city}</strong>:`,
    fr: `Nous avons mis à jour les délais de livraison estimés pour <strong>${payload.city}</strong> :`,
    ht: `Nou fè mizajou sou tan livrezon estime pou <strong>${payload.city}</strong> :`,
    es: `Hemos actualizado los tiempos de entrega estimados para <strong>${payload.city}</strong>:`,
  };

  const typeLabel: Record<Locale, string> = { en: 'Type', fr: 'Type', ht: 'Tip', es: 'Tipo' };
  const standardLabel: Record<Locale, string> = { en: 'Standard', fr: 'Standard', ht: 'Nòmal', es: 'Estándar' };
  const perfumeLabel: Record<Locale, string> = { en: 'Perfume/Restricted', fr: 'Parfums/Restreints', ht: 'Pafen/Restrenn', es: 'Perfumes/Restringidos' };
  const daysLabel: Record<Locale, string> = { en: 'days', fr: 'jours', ht: 'jou', es: 'días' };

  return `
    <p class="body-text">${intros[locale]}</p>
    <table class="changes-table">
      <thead>
        <tr>
          <th>${typeLabel[locale]}</th>
          <th style="text-align: center;">${prevLabel[locale]}</th>
          <th style="text-align: center;">${newLabel[locale]}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; font-weight: 600;">📦 ${standardLabel[locale]}</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; text-align: center; color: #6b7280;">${payload.oldDeliveryDaysMin}-${payload.oldDeliveryDaysMax} ${daysLabel[locale]}</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; text-align: center; color: #1e40af; font-weight: 700;">${payload.newDeliveryDaysMin}-${payload.newDeliveryDaysMax} ${daysLabel[locale]}</td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; font-weight: 600;">🧴 ${perfumeLabel[locale]}</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; text-align: center; color: #6b7280;">${payload.oldPerfumeDaysMin}-${payload.oldPerfumeDaysMax} ${daysLabel[locale]}</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; text-align: center; color: #1e40af; font-weight: 700;">${payload.newPerfumeDaysMin}-${payload.newPerfumeDaysMax} ${daysLabel[locale]}</td>
        </tr>
      </tbody>
    </table>
    <div class="effective">✅ ${effectiveNow[locale]}</div>`;
}

// ─── LOYALTY RATE CHANGE BODY ───────────────────────────────────

const loyaltyLabels: Record<string, Record<Locale, string>> = {
  credit_per_shipment: { en: 'Credit per Shipment', fr: 'Crédit par Expédition', ht: 'Kredi pa Anvoy', es: 'Crédito por Envío' },
  credit_per_lb: { en: 'Credit per Pound', fr: 'Crédit par Livre', ht: 'Kredi pa Liv', es: 'Crédito por Libra' },
  points_per_dollar_spent: { en: 'Points per $1 Spent', fr: 'Points par 1$ Dépensé', ht: 'Pwen pa 1$ Depanse', es: 'Puntos por $1 Gastado' },
  points_to_dollar_rate: { en: 'Points for $1 Credit', fr: 'Points pour 1$ de Crédit', ht: 'Pwen pou 1$ Kredi', es: 'Puntos para $1 de Crédito' },
};

function formatLoyaltyVal(key: string, value: number): string {
  if (key.includes('points')) return `${Math.round(value)} pts`;
  return `$${value.toFixed(2)}`;
}

function buildLoyaltyRateBodyHtml(payload: LoyaltyRateChangePayload, locale: Locale): string {
  const intros: Record<Locale, string> = {
    en: 'We have updated our loyalty program rates. Here are the details:',
    fr: 'Nous avons mis à jour les taux de notre programme de fidélité. Voici les détails :',
    ht: 'Nou fè mizajou sou to pwogram fidelite nou. Men detay yo :',
    es: 'Hemos actualizado las tasas de nuestro programa de lealtad. Aquí están los detalles:',
  };

  const rateLabel: Record<Locale, string> = { en: 'Rate', fr: 'Taux', ht: 'To', es: 'Tasa' };

  const rows = payload.changes.map((c) => {
    const label = loyaltyLabels[c.key]?.[locale] || c.key;
    const increased = c.newValue > c.oldValue;
    const color = increased ? '#059669' : '#dc2626';
    const arrow = increased ? '↑' : '↓';
    return `<tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #374151;">${label}</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; text-align: center; color: #6b7280;">${formatLoyaltyVal(c.key, c.oldValue)}</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; text-align: center; color: ${color}; font-weight: 700;">${arrow} ${formatLoyaltyVal(c.key, c.newValue)}</td>
    </tr>`;
  }).join('');

  return `
    <p class="body-text">${intros[locale]}</p>
    <table class="changes-table">
      <thead>
        <tr>
          <th>${rateLabel[locale]}</th>
          <th style="text-align: center;">${prevLabel[locale]}</th>
          <th style="text-align: center;">${newLabel[locale]}</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="effective">✅ ${effectiveNow[locale]}</div>`;
}

// ─── SPECIAL ITEM BODIES ────────────────────────────────────────

function buildNewSpecialItemBodyHtml(payload: Record<string, any>, locale: Locale): string {
  const intros: Record<Locale, string> = {
    en: 'We have added a new special item to our shipping catalog:',
    fr: 'Nous avons ajouté un nouvel article spécial à notre catalogue :',
    ht: 'Nou ajoute yon nouvo atik espesyal nan katalòg anvoy nou:',
    es: 'Hemos agregado un nuevo artículo especial a nuestro catálogo:',
  };

  const modelRange = payload.minModel && payload.maxModel ? ` (${payload.minModel} - ${payload.maxModel})` : '';

  return `
    <p class="body-text">${intros[locale]}</p>
    <div class="info-card">
      <h3>📱 ${payload.brand} ${payload.itemName}${modelRange}</h3>
      <p>💰 <strong>$${Number(payload.fixedFee).toFixed(2)}</strong></p>
      ${payload.description ? `<p>📋 ${payload.description}</p>` : ''}
    </div>
    <div class="effective">✅ ${effectiveNow[locale]}</div>`;
}

function buildModifySpecialItemBodyHtml(payload: Record<string, any>, locale: Locale): string {
  const intros: Record<Locale, string> = {
    en: 'We have updated the following special item:',
    fr: 'Nous avons modifié l\'article spécial suivant :',
    ht: 'Nou modifye atik espesyal sa a :',
    es: 'Hemos actualizado el siguiente artículo especial:',
  };

  const feeChanged = payload.oldFixedFee !== payload.newFixedFee;
  const feeColor = feeChanged ? (payload.newFixedFee > payload.oldFixedFee ? '#dc2626' : '#059669') : '#6b7280';

  return `
    <p class="body-text">${intros[locale]}</p>
    <div class="info-card">
      <h3>📱 ${payload.itemName}</h3>
      ${feeChanged ? `<p style="color: ${feeColor}; font-weight: 600;">💰 $${Number(payload.oldFixedFee).toFixed(2)} → $${Number(payload.newFixedFee).toFixed(2)}</p>` : ''}
    </div>
    <div class="effective">✅ ${effectiveNow[locale]}</div>`;
}

function buildRemoveSpecialItemBodyHtml(payload: Record<string, any>, locale: Locale): string {
  const intros: Record<Locale, string> = {
    en: 'The following special item has been removed from our catalog:',
    fr: 'L\'article spécial suivant a été retiré de notre catalogue :',
    ht: 'Atik espesyal sa a retire nan katalòg nou:',
    es: 'El siguiente artículo especial ha sido eliminado de nuestro catálogo:',
  };
  const weightBased: Record<Locale, string> = {
    en: 'This item will now be charged at standard weight-based rates.',
    fr: 'Cet article sera désormais facturé aux tarifs standards basés sur le poids.',
    ht: 'Atik sa a pral peye ak tarif nòmal ki baze sou pwa kounye a.',
    es: 'Este artículo ahora se cobrará a las tarifas estándar basadas en peso.',
  };

  return `
    <p class="body-text">${intros[locale]}</p>
    <div class="info-card" style="background: #fef2f2; border-color: #fecaca;">
      <h3>🗑️ ${payload.brand} ${payload.itemName}</h3>
    </div>
    <p class="body-text">${weightBased[locale]}</p>`;
}

// ─── WAREHOUSE BODIES ───────────────────────────────────────────

function buildNewWarehouseBodyHtml(payload: Record<string, any>, locale: Locale): string {
  const intros: Record<Locale, string> = {
    en: `We have opened a new warehouse in <strong>${payload.city}</strong>:`,
    fr: `Nous avons ouvert un nouveau dépôt à <strong>${payload.city}</strong> :`,
    ht: `Nou ouvri yon nouvo depo nan <strong>${payload.city}</strong> :`,
    es: `Hemos abierto un nuevo almacén en <strong>${payload.city}</strong>:`,
  };

  return `
    <p class="body-text">${intros[locale]}</p>
    <div class="info-card">
      <h3>🏢 ${payload.name}</h3>
      <p>📍 ${payload.address}</p>
      ${payload.phone ? `<p>📞 ${payload.phone}</p>` : ''}
      ${payload.openingHours ? `<p>🕐 ${payload.openingHours}</p>` : ''}
    </div>`;
}

function buildModifyWarehouseBodyHtml(payload: Record<string, any>, locale: Locale): string {
  const intros: Record<Locale, string> = {
    en: `We have updated the details for <strong>${payload.name}</strong>:`,
    fr: `Nous avons mis à jour les détails de <strong>${payload.name}</strong> :`,
    ht: `Nou fè mizajou sou detay <strong>${payload.name}</strong> :`,
    es: `Hemos actualizado los detalles de <strong>${payload.name}</strong>:`,
  };

  return `
    <p class="body-text">${intros[locale]}</p>
    <div class="info-card">
      <h3>🔄 ${payload.name}</h3>
      <p>${payload.changes}</p>
    </div>`;
}

function buildCloseWarehouseBodyHtml(payload: Record<string, any>, locale: Locale): string {
  const intros: Record<Locale, string> = {
    en: `Our <strong>${payload.name}</strong> warehouse in ${payload.city} has been permanently closed.`,
    fr: `Notre dépôt <strong>${payload.name}</strong> à ${payload.city} a été définitivement fermé.`,
    ht: `Depo <strong>${payload.name}</strong> nan ${payload.city} fèmen pèmanantman.`,
    es: `Nuestro almacén <strong>${payload.name}</strong> en ${payload.city} ha sido cerrado permanentemente.`,
  };

  const useOther: Record<Locale, string> = {
    en: 'Please use our other locations for future deliveries.',
    fr: 'Veuillez utiliser nos autres emplacements pour vos livraisons futures.',
    ht: 'Tanpri itilize lòt anplasman nou yo pou livrezon alavni.',
    es: 'Por favor utilice nuestras otras ubicaciones para futuras entregas.',
  };

  return `
    <p class="body-text">${intros[locale]}</p>
    ${payload.reason ? `<div class="info-card" style="background: #fef2f2; border-color: #fecaca;"><p>📋 ${payload.reason}</p></div>` : ''}
    <p class="body-text">${useOther[locale]}</p>`;
}

// ─── COMMUNICATION EMAIL BUILDER ────────────────────────────────

export function buildCommunicationEmailHtml(
  title: string,
  content: string,
  type: string,
  userName: string,
  locale: Locale
): string {
  const colors = templateColors[type] || templateColors.news;
  const badge = commBadges[type]?.[locale] || type.toUpperCase();
  const emojis: Record<string, string> = { news: '📢', alert: '⚠️', promo: '🎉', maintenance: '🔧' };
  const emoji = emojis[type] || '📢';

  const htmlContent = content.replace(/\n/g, '<br>');

  const bodyHtml = `<div class="body-text" style="padding: 20px 0; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; margin: 16px 0;">${htmlContent}</div>`;

  return wrapEmail(
    locale,
    colors.gradient,
    badge,
    emoji,
    title,
    userName,
    bodyHtml,
    `${APP_URL}/news`,
    viewAllNews[locale]
  );
}

// ─── UNIFIED EMAIL BUILDER ──────────────────────────────────────

export function getEmailSubject(templateId: string, type: string, locale: Locale): string {
  const actionSubject = actionEmailSubjects[templateId]?.[locale];
  if (actionSubject) return `${actionSubject} - Alliance Shipping`;

  const commSubject = communicationEmailSubjects[type]?.[locale];
  if (commSubject) return `${commSubject} - Alliance Shipping`;

  return 'Alliance Shipping Update';
}
