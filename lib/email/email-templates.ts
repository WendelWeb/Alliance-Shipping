import { sendEmail } from './service';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// ============================================
// PACKAGE MODIFICATION TEMPLATES
// ============================================

// Template: Weight Modified
export const sendWeightModifiedEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string,
  oldWeight: number,
  newWeight: number,
  oldCost: number,
  newCost: number,
  locale: string = 'fr'
) => {
  const costDiff = newCost - oldCost;
  const weightDiff = Math.abs(newWeight - oldWeight);

  const translations: Record<string, any> = {
    fr: {
      subject: `⚖️ Poids du colis mis à jour - Alliance Shipping`,
      title: 'Poids du Colis Mis à Jour',
      greeting: `Bonjour ${userName},`,
      message: 'Le poids de votre colis a été mis à jour après vérification dans notre entrepôt.',
      trackingLabel: 'Numéro de Suivi :',
      weightChangeLabel: 'Changement de Poids :',
      weightIncreased: `Le poids a augmenté de ${weightDiff} lbs`,
      weightDecreased: `Le poids a diminué de ${weightDiff} lbs`,
      costUpdateLabel: 'Mise à Jour du Coût :',
      additionalCharge: '(Frais supplémentaires)',
      creditApplied: '(Crédit appliqué)',
      whyAdjustedTitle: 'Pourquoi cet ajustement ?',
      whyAdjustedText: 'Nous vérifions le poids de tous les colis dans notre entrepôt pour garantir des frais d\'expédition précis. Le poids réel peut différer de l\'estimation initiale.',
      buttonLabel: 'Voir les Détails',
      questionsText: 'Si vous avez des questions concernant cet ajustement, veuillez nous contacter.',
      companyFooter: 'Alliance Shipping - Expédition Fiable des USA vers Haïti',
      automated: 'Ceci est un message automatique, merci de ne pas répondre.',
    },
    en: {
      subject: `⚖️ Package Weight Updated - Alliance Shipping`,
      title: 'Package Weight Updated',
      greeting: `Hello ${userName},`,
      message: 'The weight of your package has been updated after inspection at our warehouse.',
      trackingLabel: 'Tracking Number:',
      weightChangeLabel: 'Weight Change:',
      weightIncreased: `Weight increased by ${weightDiff} lbs`,
      weightDecreased: `Weight decreased by ${weightDiff} lbs`,
      costUpdateLabel: 'Cost Update:',
      additionalCharge: '(Additional charge)',
      creditApplied: '(Credit applied)',
      whyAdjustedTitle: 'Why was this adjusted?',
      whyAdjustedText: 'We verify all package weights at our warehouse to ensure accurate shipping costs. The actual weight may differ from the initial estimate.',
      buttonLabel: 'View Package Details',
      questionsText: 'If you have any questions about this adjustment, please contact us.',
      companyFooter: 'Alliance Shipping - Reliable Shipping from USA to Haiti',
      automated: 'This is an automated message, please do not reply to this email.',
    },
    ht: {
      subject: `⚖️ Pwa koli a mete ajou - Alliance Shipping`,
      title: 'Pwa Koli a Mete Ajou',
      greeting: `Bonjou ${userName},`,
      message: 'Pwa koli w la mete ajou apre verifikasyon nan depo nou an.',
      trackingLabel: 'Nimewo Tracking :',
      weightChangeLabel: 'Chanjman Pwa :',
      weightIncreased: `Pwa a ogmante de ${weightDiff} lbs`,
      weightDecreased: `Pwa a diminye de ${weightDiff} lbs`,
      costUpdateLabel: 'Miz Ajou Koût :',
      additionalCharge: '(Frè anplis)',
      creditApplied: '(Kredi aplike)',
      whyAdjustedTitle: 'Poukisa ajisteman sa a ?',
      whyAdjustedText: 'Nou verifye pwa tout koli nan depo nou an pou asire frè ekspedisyon yo kòrèk. Pwa reyèl la ka diferan de estimasyon inisyal la.',
      buttonLabel: 'Wè Detay Koli',
      questionsText: 'Si w gen kesyon sou ajisteman sa a, tanpri kontakte nou.',
      companyFooter: 'Alliance Shipping - Livrezon Fyab soti nan USA pou ale an Ayiti',
      automated: 'Sa a se yon mesaj otomatik, tanpri pa reponn imèl sa a.',
    },
    es: {
      subject: `⚖️ Peso del paquete actualizado - Alliance Shipping`,
      title: 'Peso del Paquete Actualizado',
      greeting: `Hola ${userName},`,
      message: 'El peso de su paquete ha sido actualizado después de la inspección en nuestro almacén.',
      trackingLabel: 'Número de Seguimiento:',
      weightChangeLabel: 'Cambio de Peso:',
      weightIncreased: `El peso aumentó en ${weightDiff} lbs`,
      weightDecreased: `El peso disminuyó en ${weightDiff} lbs`,
      costUpdateLabel: 'Actualización de Costo:',
      additionalCharge: '(Cargo adicional)',
      creditApplied: '(Crédito aplicado)',
      whyAdjustedTitle: '¿Por qué se ajustó?',
      whyAdjustedText: 'Verificamos el peso de todos los paquetes en nuestro almacén para garantizar costos de envío precisos. El peso real puede diferir de la estimación inicial.',
      buttonLabel: 'Ver Detalles del Paquete',
      questionsText: 'Si tiene alguna pregunta sobre este ajuste, por favor contáctenos.',
      companyFooter: 'Alliance Shipping - Envíos Confiables de USA a Haití',
      automated: 'Este es un mensaje automático, por favor no responda.',
    },
  };

  const t = translations[locale] || translations.fr;
  const subject = t.subject;
  const html = `
    <!DOCTYPE html>
    <html lang="${locale}">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .tracking { font-size: 20px; font-weight: bold; color: #f59e0b; text-align: center; padding: 12px; background: #fef3c7; border-radius: 8px; }
          .comparison { display: flex; justify-content: space-around; margin: 20px 0; }
          .old-value { text-decoration: line-through; color: #9ca3af; }
          .new-value { color: #f59e0b; font-weight: bold; font-size: 20px; }
          .cost-increase { color: #ef4444; font-weight: bold; }
          .cost-decrease { color: #10b981; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚖️ ${t.title}</h1>
          </div>
          <div class="content">
            <p>${t.greeting}</p>
            <p>${t.message}</p>

            <div class="card">
              <h3>${t.trackingLabel}</h3>
              <div class="tracking">${trackingNumber}</div>
            </div>

            <div class="card">
              <h3>${t.weightChangeLabel}</h3>
              <div style="text-align: center; margin: 20px 0;">
                <div style="margin-bottom: 10px;">
                  <span class="old-value" style="font-size: 18px;">${oldWeight} lbs</span>
                  <span style="margin: 0 10px;">→</span>
                  <span class="new-value">${newWeight} lbs</span>
                </div>
                <p style="color: #6b7280; font-size: 14px;">
                  ${newWeight > oldWeight ? t.weightIncreased : t.weightDecreased}
                </p>
              </div>
            </div>

            <div class="card">
              <h3>${t.costUpdateLabel}</h3>
              <div style="text-align: center; margin: 20px 0;">
                <div style="margin-bottom: 10px;">
                  <span class="old-value" style="font-size: 18px;">$${oldCost.toFixed(2)}</span>
                  <span style="margin: 0 10px;">→</span>
                  <span class="new-value">$${newCost.toFixed(2)}</span>
                </div>
                ${costDiff !== 0 ? `
                <p class="${costDiff > 0 ? 'cost-increase' : 'cost-decrease'}" style="font-size: 16px;">
                  ${costDiff > 0 ? '+' : ''}$${costDiff.toFixed(2)}
                  ${costDiff > 0 ? t.additionalCharge : t.creditApplied}
                </p>
                ` : ''}
              </div>
            </div>

            <div class="card">
              <h3>${t.whyAdjustedTitle}</h3>
              <p>${t.whyAdjustedText}</p>
            </div>

            <div style="text-align: center;">
              <a href="${APP_URL}/dashboard/packages" class="button">
                ${t.buttonLabel}
              </a>
            </div>

            <p style="margin-top: 30px;">${t.questionsText}</p>

            <div class="footer">
              <p>${t.companyFooter}</p>
              <p>${t.automated}</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: userEmail, subject, html });
};

// Template: Fees Modified
export const sendFeesModifiedEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string,
  oldTotal: number,
  newTotal: number,
  reason: string,
  locale: string = 'fr'
) => {
  const costDiff = newTotal - oldTotal;

  const translations: Record<string, any> = {
    fr: {
      subject: '💰 Frais du colis mis à jour - Alliance Shipping',
      title: 'Frais du Colis Mis à Jour',
      greeting: `Bonjour ${userName},`,
      message: 'Les frais de votre colis ont été mis à jour.',
      trackingLabel: 'Numéro de Suivi :',
      costUpdateLabel: 'Mise à Jour du Coût Total :',
      additional: 'Supplément :',
      discount: 'Réduction :',
      reasonLabel: 'Raison de l\'Ajustement :',
      buttonLabel: 'Voir la Facture Mise à Jour',
      questionsText: 'Si vous avez des questions concernant cet ajustement de frais, veuillez contacter notre équipe de support.',
      companyFooter: 'Alliance Shipping - Expédition Fiable des USA vers Haïti',
      automated: 'Ceci est un message automatique, merci de ne pas répondre.',
    },
    en: {
      subject: '💰 Package Fees Updated - Alliance Shipping',
      title: 'Package Fees Updated',
      greeting: `Hello ${userName},`,
      message: 'The fees for your package have been updated.',
      trackingLabel: 'Tracking Number:',
      costUpdateLabel: 'Total Cost Update:',
      additional: 'Additional:',
      discount: 'Discount:',
      reasonLabel: 'Reason for Adjustment:',
      buttonLabel: 'View Updated Invoice',
      questionsText: 'If you have questions about this fee adjustment, please contact our support team.',
      companyFooter: 'Alliance Shipping - Reliable Shipping from USA to Haiti',
      automated: 'This is an automated message, please do not reply to this email.',
    },
    ht: {
      subject: '💰 Frè koli a mete ajou - Alliance Shipping',
      title: 'Frè Koli a Mete Ajou',
      greeting: `Bonjou ${userName},`,
      message: 'Frè koli w la mete ajou.',
      trackingLabel: 'Nimewo Tracking :',
      costUpdateLabel: 'Miz Ajou Koût Total :',
      additional: 'Anplis :',
      discount: 'Rabè :',
      reasonLabel: 'Rezon pou Ajisteman an :',
      buttonLabel: 'Wè Fakti Mete Ajou',
      questionsText: 'Si w gen kesyon sou ajisteman frè sa a, tanpri kontakte ekip sipò nou an.',
      companyFooter: 'Alliance Shipping - Livrezon Fyab soti nan USA pou ale an Ayiti',
      automated: 'Sa a se yon mesaj otomatik, tanpri pa reponn imèl sa a.',
    },
    es: {
      subject: '💰 Tarifas del paquete actualizadas - Alliance Shipping',
      title: 'Tarifas del Paquete Actualizadas',
      greeting: `Hola ${userName},`,
      message: 'Las tarifas de su paquete han sido actualizadas.',
      trackingLabel: 'Número de Seguimiento:',
      costUpdateLabel: 'Actualización del Costo Total:',
      additional: 'Adicional:',
      discount: 'Descuento:',
      reasonLabel: 'Razón del Ajuste:',
      buttonLabel: 'Ver Factura Actualizada',
      questionsText: 'Si tiene preguntas sobre este ajuste de tarifas, por favor contacte a nuestro equipo de soporte.',
      companyFooter: 'Alliance Shipping - Envíos Confiables de USA a Haití',
      automated: 'Este es un mensaje automático, por favor no responda.',
    },
  };

  const t = translations[locale] || translations.fr;
  const subject = t.subject;
  const html = `
    <!DOCTYPE html>
    <html lang="${locale}">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .tracking { font-size: 20px; font-weight: bold; color: #8b5cf6; text-align: center; padding: 12px; background: #f3e8ff; border-radius: 8px; }
          .old-value { text-decoration: line-through; color: #9ca3af; font-size: 18px; }
          .new-value { color: #8b5cf6; font-weight: bold; font-size: 24px; }
          .cost-increase { color: #ef4444; font-weight: bold; }
          .cost-decrease { color: #10b981; font-weight: bold; }
          .reason-box { background: #ede9fe; border-left: 4px solid #8b5cf6; padding: 15px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 ${t.title}</h1>
          </div>
          <div class="content">
            <p>${t.greeting}</p>
            <p>${t.message}</p>

            <div class="card">
              <h3>${t.trackingLabel}</h3>
              <div class="tracking">${trackingNumber}</div>
            </div>

            <div class="card">
              <h3>${t.costUpdateLabel}</h3>
              <div style="text-align: center; margin: 20px 0;">
                <div style="margin-bottom: 10px;">
                  <span class="old-value">$${oldTotal.toFixed(2)}</span>
                  <span style="margin: 0 10px;">→</span>
                  <span class="new-value">$${newTotal.toFixed(2)}</span>
                </div>
                ${costDiff !== 0 ? `
                <p class="${costDiff > 0 ? 'cost-increase' : 'cost-decrease'}" style="font-size: 18px; margin-top: 15px;">
                  ${costDiff > 0 ? t.additional : t.discount} ${costDiff > 0 ? '+' : ''}$${Math.abs(costDiff).toFixed(2)}
                </p>
                ` : ''}
              </div>
            </div>

            <div class="card">
              <h3>${t.reasonLabel}</h3>
              <div class="reason-box">
                ${reason}
              </div>
            </div>

            <div style="text-align: center;">
              <a href="${APP_URL}/dashboard/packages" class="button">
                ${t.buttonLabel}
              </a>
            </div>

            <p style="margin-top: 30px;">${t.questionsText}</p>

            <div class="footer">
              <p>${t.companyFooter}</p>
              <p>${t.automated}</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: userEmail, subject, html });
};

// Template: Package Information Modified
export const sendPackageInfoModifiedEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string,
  modifiedFields: string[],
  locale: string = 'fr'
) => {
  const translations: Record<string, any> = {
    fr: {
      subject: '📝 Informations du colis mises à jour - Alliance Shipping',
      title: 'Informations du Colis Mises à Jour',
      greeting: `Bonjour ${userName},`,
      message: 'Certaines informations de votre colis ont été mises à jour par notre équipe.',
      trackingLabel: 'Numéro de Suivi :',
      updatedFieldsLabel: 'Champs Mis à Jour :',
      whatsNextTitle: 'Quelle est la suite ?',
      whatsNextText1: 'Veuillez vérifier les informations mises à jour dans votre tableau de bord pour vous assurer que tout est correct.',
      whatsNextText2: 'Si vous remarquez des erreurs, veuillez nous contacter immédiatement.',
      buttonLabel: 'Voir les Détails Mis à Jour',
      companyFooter: 'Alliance Shipping - Expédition Fiable des USA vers Haïti',
      automated: 'Ceci est un message automatique, merci de ne pas répondre.',
    },
    en: {
      subject: '📝 Package Information Updated - Alliance Shipping',
      title: 'Package Information Updated',
      greeting: `Hello ${userName},`,
      message: 'Some information about your package has been updated by our team.',
      trackingLabel: 'Tracking Number:',
      updatedFieldsLabel: 'Updated Fields:',
      whatsNextTitle: 'What\'s Next?',
      whatsNextText1: 'Please review the updated information in your dashboard to ensure everything is correct.',
      whatsNextText2: 'If you notice any discrepancies, please contact us immediately.',
      buttonLabel: 'View Updated Details',
      companyFooter: 'Alliance Shipping - Reliable Shipping from USA to Haiti',
      automated: 'This is an automated message, please do not reply to this email.',
    },
    ht: {
      subject: '📝 Enfòmasyon koli a mete ajou - Alliance Shipping',
      title: 'Enfòmasyon Koli a Mete Ajou',
      greeting: `Bonjou ${userName},`,
      message: 'Kèk enfòmasyon sou koli w la mete ajou pa ekip nou an.',
      trackingLabel: 'Nimewo Tracking :',
      updatedFieldsLabel: 'Chan ki Mete Ajou :',
      whatsNextTitle: 'Kisa ki swiv ?',
      whatsNextText1: 'Tanpri verifye enfòmasyon ki mete ajou yo nan tablo bò w la pou asire tout bagay kòrèk.',
      whatsNextText2: 'Si w wè yon erè, tanpri kontakte nou imedyatman.',
      buttonLabel: 'Wè Detay Mete Ajou',
      companyFooter: 'Alliance Shipping - Livrezon Fyab soti nan USA pou ale an Ayiti',
      automated: 'Sa a se yon mesaj otomatik, tanpri pa reponn imèl sa a.',
    },
    es: {
      subject: '📝 Información del paquete actualizada - Alliance Shipping',
      title: 'Información del Paquete Actualizada',
      greeting: `Hola ${userName},`,
      message: 'Alguna información de su paquete ha sido actualizada por nuestro equipo.',
      trackingLabel: 'Número de Seguimiento:',
      updatedFieldsLabel: 'Campos Actualizados:',
      whatsNextTitle: '¿Qué sigue?',
      whatsNextText1: 'Por favor revise la información actualizada en su panel de control para asegurarse de que todo esté correcto.',
      whatsNextText2: 'Si nota alguna discrepancia, por favor contáctenos de inmediato.',
      buttonLabel: 'Ver Detalles Actualizados',
      companyFooter: 'Alliance Shipping - Envíos Confiables de USA a Haití',
      automated: 'Este es un mensaje automático, por favor no responda.',
    },
  };

  const t = translations[locale] || translations.fr;
  const subject = t.subject;
  const html = `
    <!DOCTYPE html>
    <html lang="${locale}">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .tracking { font-size: 20px; font-weight: bold; color: #3b82f6; text-align: center; padding: 12px; background: #dbeafe; border-radius: 8px; }
          .field-list { list-style: none; padding: 0; }
          .field-list li { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .field-list li:before { content: "✓ "; color: #10b981; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📝 ${t.title}</h1>
          </div>
          <div class="content">
            <p>${t.greeting}</p>
            <p>${t.message}</p>

            <div class="card">
              <h3>${t.trackingLabel}</h3>
              <div class="tracking">${trackingNumber}</div>
            </div>

            <div class="card">
              <h3>${t.updatedFieldsLabel}</h3>
              <ul class="field-list">
                ${modifiedFields.map(field => `<li>${field}</li>`).join('')}
              </ul>
            </div>

            <div class="card">
              <h3>${t.whatsNextTitle}</h3>
              <p>${t.whatsNextText1}</p>
              <p>${t.whatsNextText2}</p>
            </div>

            <div style="text-align: center;">
              <a href="${APP_URL}/dashboard/packages" class="button">
                ${t.buttonLabel}
              </a>
            </div>

            <div class="footer">
              <p>${t.companyFooter}</p>
              <p>${t.automated}</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: userEmail, subject, html });
};

// ============================================
// SPECIAL ITEMS TEMPLATES
// ============================================

// Template: Special Item Added
export const sendSpecialItemAddedEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string,
  itemName: string,
  itemFee: number,
  newTotal: number,
  locale: string = 'fr'
) => {
  const translations: Record<string, any> = {
    fr: {
      subject: '🎁 Article spécial ajouté au colis - Alliance Shipping',
      title: 'Article Spécial Ajouté',
      greeting: `Bonjour ${userName},`,
      message: 'Un article spécial a été ajouté à votre colis.',
      trackingLabel: 'Numéro de Suivi :',
      addedItemLabel: 'Article Ajouté :',
      additionalFee: 'Frais supplémentaires :',
      newTotalLabel: 'Nouveau Coût Total :',
      includesNote: 'Ce montant inclut les frais de l\'article spécial',
      buttonLabel: 'Voir les Détails',
      companyFooter: 'Alliance Shipping - Expédition Fiable des USA vers Haïti',
      automated: 'Ceci est un message automatique, merci de ne pas répondre.',
    },
    en: {
      subject: '🎁 Special Item Added to Package - Alliance Shipping',
      title: 'Special Item Added',
      greeting: `Hello ${userName},`,
      message: 'A special item has been added to your package.',
      trackingLabel: 'Tracking Number:',
      addedItemLabel: 'Added Item:',
      additionalFee: 'Additional Fee:',
      newTotalLabel: 'New Total Cost:',
      includesNote: 'This includes the special item fee',
      buttonLabel: 'View Package Details',
      companyFooter: 'Alliance Shipping - Reliable Shipping from USA to Haiti',
      automated: 'This is an automated message, please do not reply to this email.',
    },
    ht: {
      subject: '🎁 Atik espesyal ajoute nan koli - Alliance Shipping',
      title: 'Atik Espesyal Ajoute',
      greeting: `Bonjou ${userName},`,
      message: 'Yo ajoute yon atik espesyal nan koli w la.',
      trackingLabel: 'Nimewo Tracking :',
      addedItemLabel: 'Atik Ajoute :',
      additionalFee: 'Frè anplis :',
      newTotalLabel: 'Nouvo Koût Total :',
      includesNote: 'Sa a enkli frè atik espesyal la',
      buttonLabel: 'Wè Detay Koli',
      companyFooter: 'Alliance Shipping - Livrezon Fyab soti nan USA pou ale an Ayiti',
      automated: 'Sa a se yon mesaj otomatik, tanpri pa reponn imèl sa a.',
    },
    es: {
      subject: '🎁 Artículo especial agregado al paquete - Alliance Shipping',
      title: 'Artículo Especial Agregado',
      greeting: `Hola ${userName},`,
      message: 'Se ha agregado un artículo especial a su paquete.',
      trackingLabel: 'Número de Seguimiento:',
      addedItemLabel: 'Artículo Agregado:',
      additionalFee: 'Tarifa adicional:',
      newTotalLabel: 'Nuevo Costo Total:',
      includesNote: 'Esto incluye la tarifa del artículo especial',
      buttonLabel: 'Ver Detalles del Paquete',
      companyFooter: 'Alliance Shipping - Envíos Confiables de USA a Haití',
      automated: 'Este es un mensaje automático, por favor no responda.',
    },
  };

  const t = translations[locale] || translations.fr;
  const subject = t.subject;
  const html = `
    <!DOCTYPE html>
    <html lang="${locale}">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ec4899 0%, #be185d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .tracking { font-size: 20px; font-weight: bold; color: #ec4899; text-align: center; padding: 12px; background: #fce7f3; border-radius: 8px; }
          .item-badge { background: #fce7f3; color: #be185d; padding: 10px 20px; border-radius: 20px; display: inline-block; font-weight: bold; margin: 10px 0; }
          .total { font-size: 28px; font-weight: bold; color: #ec4899; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background: #ec4899; color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎁 ${t.title}</h1>
          </div>
          <div class="content">
            <p>${t.greeting}</p>
            <p>${t.message}</p>

            <div class="card">
              <h3>${t.trackingLabel}</h3>
              <div class="tracking">${trackingNumber}</div>
            </div>

            <div class="card" style="text-align: center;">
              <h3>${t.addedItemLabel}</h3>
              <div class="item-badge">${itemName}</div>
              <p style="font-size: 18px; color: #6b7280; margin-top: 10px;">
                ${t.additionalFee} <strong>$${itemFee.toFixed(2)}</strong>
              </p>
            </div>

            <div class="card">
              <h3>${t.newTotalLabel}</h3>
              <div class="total">$${newTotal.toFixed(2)}</div>
              <p style="text-align: center; color: #6b7280; font-size: 14px;">
                ${t.includesNote}
              </p>
            </div>

            <div style="text-align: center;">
              <a href="${APP_URL}/dashboard/packages" class="button">
                ${t.buttonLabel}
              </a>
            </div>

            <div class="footer">
              <p>${t.companyFooter}</p>
              <p>${t.automated}</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: userEmail, subject, html });
};

// Template: Special Item Removed
export const sendSpecialItemRemovedEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string,
  itemName: string,
  refundAmount: number,
  newTotal: number,
  locale: string = 'fr'
) => {
  const translations: Record<string, any> = {
    fr: {
      subject: '🔄 Article spécial retiré du colis - Alliance Shipping',
      title: 'Article Spécial Retiré',
      greeting: `Bonjour ${userName},`,
      message: 'Un article spécial a été retiré de votre colis.',
      trackingLabel: 'Numéro de Suivi :',
      removedItemLabel: 'Article Retiré :',
      refunded: 'Remboursé',
      newTotalLabel: 'Nouveau Coût Total :',
      deductedNote: 'Les frais de l\'article ont été déduits',
      buttonLabel: 'Voir les Détails',
      companyFooter: 'Alliance Shipping - Expédition Fiable des USA vers Haïti',
      automated: 'Ceci est un message automatique, merci de ne pas répondre.',
    },
    en: {
      subject: '🔄 Special Item Removed from Package - Alliance Shipping',
      title: 'Special Item Removed',
      greeting: `Hello ${userName},`,
      message: 'A special item has been removed from your package.',
      trackingLabel: 'Tracking Number:',
      removedItemLabel: 'Removed Item:',
      refunded: 'Refunded',
      newTotalLabel: 'New Total Cost:',
      deductedNote: 'The item fee has been deducted',
      buttonLabel: 'View Package Details',
      companyFooter: 'Alliance Shipping - Reliable Shipping from USA to Haiti',
      automated: 'This is an automated message, please do not reply to this email.',
    },
    ht: {
      subject: '🔄 Atik espesyal retire nan koli - Alliance Shipping',
      title: 'Atik Espesyal Retire',
      greeting: `Bonjou ${userName},`,
      message: 'Yo retire yon atik espesyal nan koli w la.',
      trackingLabel: 'Nimewo Tracking :',
      removedItemLabel: 'Atik Retire :',
      refunded: 'Ranbouse',
      newTotalLabel: 'Nouvo Koût Total :',
      deductedNote: 'Frè atik la dedui',
      buttonLabel: 'Wè Detay Koli',
      companyFooter: 'Alliance Shipping - Livrezon Fyab soti nan USA pou ale an Ayiti',
      automated: 'Sa a se yon mesaj otomatik, tanpri pa reponn imèl sa a.',
    },
    es: {
      subject: '🔄 Artículo especial removido del paquete - Alliance Shipping',
      title: 'Artículo Especial Removido',
      greeting: `Hola ${userName},`,
      message: 'Se ha removido un artículo especial de su paquete.',
      trackingLabel: 'Número de Seguimiento:',
      removedItemLabel: 'Artículo Removido:',
      refunded: 'Reembolsado',
      newTotalLabel: 'Nuevo Costo Total:',
      deductedNote: 'La tarifa del artículo ha sido deducida',
      buttonLabel: 'Ver Detalles del Paquete',
      companyFooter: 'Alliance Shipping - Envíos Confiables de USA a Haití',
      automated: 'Este es un mensaje automático, por favor no responda.',
    },
  };

  const t = translations[locale] || translations.fr;
  const subject = t.subject;
  const html = `
    <!DOCTYPE html>
    <html lang="${locale}">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .tracking { font-size: 20px; font-weight: bold; color: #6366f1; text-align: center; padding: 12px; background: #e0e7ff; border-radius: 8px; }
          .refund { font-size: 24px; font-weight: bold; color: #10b981; text-align: center; margin: 20px 0; }
          .total { font-size: 28px; font-weight: bold; color: #6366f1; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔄 ${t.title}</h1>
          </div>
          <div class="content">
            <p>${t.greeting}</p>
            <p>${t.message}</p>

            <div class="card">
              <h3>${t.trackingLabel}</h3>
              <div class="tracking">${trackingNumber}</div>
            </div>

            <div class="card" style="text-align: center;">
              <h3>${t.removedItemLabel}</h3>
              <p style="font-size: 18px; color: #6b7280;">${itemName}</p>
              <div class="refund">-$${refundAmount.toFixed(2)} ${t.refunded}</div>
            </div>

            <div class="card">
              <h3>${t.newTotalLabel}</h3>
              <div class="total">$${newTotal.toFixed(2)}</div>
              <p style="text-align: center; color: #6b7280; font-size: 14px;">
                ${t.deductedNote}
              </p>
            </div>

            <div style="text-align: center;">
              <a href="${APP_URL}/dashboard/packages" class="button">
                ${t.buttonLabel}
              </a>
            </div>

            <div class="footer">
              <p>${t.companyFooter}</p>
              <p>${t.automated}</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: userEmail, subject, html });
};

// ============================================
// ADMIN MESSAGES & COMMUNICATION TEMPLATES
// ============================================

// Template: Admin Message
export const sendAdminMessageEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string,
  message: string,
  adminName: string,
  locale: string = 'fr'
) => {
  const translations: Record<string, any> = {
    fr: {
      subject: 'Message de l\'\u00e9quipe Alliance Shipping',
      title: 'Message de Notre \u00c9quipe',
      greeting: `Bonjour ${userName},`,
      body: 'Notre \u00e9quipe vous a envoy\u00e9 un message concernant votre colis.',
      packageLabel: 'Colis :',
      messageLabel: 'Message :',
      teamSuffix: '\u00c9quipe Alliance Shipping',
      respondTitle: 'Besoin de r\u00e9pondre ?',
      respondBody: 'Veuillez r\u00e9pondre \u00e0 cet e-mail ou nous contacter via votre tableau de bord.',
      buttonLabel: 'Voir le Colis',
      footer: 'Alliance Shipping - Exp\u00e9dition Fiable des USA vers Ha\u00efti',
      replyNote: 'Vous pouvez r\u00e9pondre \u00e0 cet e-mail pour contacter notre \u00e9quipe.',
    },
    en: {
      subject: 'Message from Alliance Shipping Team',
      title: 'Message from Our Team',
      greeting: `Hello ${userName},`,
      body: 'Our team has sent you a message regarding your package.',
      packageLabel: 'Package:',
      messageLabel: 'Message:',
      teamSuffix: 'Alliance Shipping Team',
      respondTitle: 'Need to respond?',
      respondBody: 'Please reply to this email or contact us through your dashboard.',
      buttonLabel: 'View Package',
      footer: 'Alliance Shipping - Reliable Shipping from USA to Haiti',
      replyNote: 'You can reply to this email to contact our team.',
    },
    ht: {
      subject: 'Mesaj Ekip Alliance Shipping',
      title: 'Mesaj Ekip Nou An',
      greeting: `Bonjou ${userName},`,
      body: 'Ekip nou an voye yon mesaj ba ou konsènan kolis ou.',
      packageLabel: 'Kolis :',
      messageLabel: 'Mesaj :',
      teamSuffix: 'Ekip Alliance Shipping',
      respondTitle: 'Bezwen reponn ?',
      respondBody: 'Tanpri reponn im\u00e8l sa a oswa kontakte nou nan tableau de bord ou.',
      buttonLabel: 'W\u00e8 Kolis',
      footer: 'Alliance Shipping - Livrezon Fyab soti nan USA pou ale an Ayiti',
      replyNote: 'Ou ka reponn im\u00e8l sa a pou kontakte ekip nou an.',
    },
    es: {
      subject: 'Mensaje del Equipo Alliance Shipping',
      title: 'Mensaje de Nuestro Equipo',
      greeting: `Hola ${userName},`,
      body: 'Nuestro equipo le ha enviado un mensaje sobre su paquete.',
      packageLabel: 'Paquete:',
      messageLabel: 'Mensaje:',
      teamSuffix: 'Equipo Alliance Shipping',
      respondTitle: '\u00bfNecesita responder?',
      respondBody: 'Por favor responda a este correo o cont\u00e1ctenos a trav\u00e9s de su panel.',
      buttonLabel: 'Ver Paquete',
      footer: 'Alliance Shipping - Env\u00edos Confiables de USA a Hait\u00ed',
      replyNote: 'Puede responder a este correo para contactar a nuestro equipo.',
    },
  };
  const t = translations[locale] || translations.fr;

  const html = `
    <!DOCTYPE html>
    <html lang="${locale}">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background: #f3f4f6; }
          .wrapper { padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
          .content { background: #ffffff; padding: 32px 24px; border-radius: 0 0 12px 12px; }
          .card { background: #f9fafb; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #e5e7eb; }
          .tracking { font-size: 18px; font-weight: bold; color: #06b6d4; text-align: center; padding: 12px; background: #cffafe; border-radius: 8px; font-family: 'Courier New', monospace; }
          .message-box { background: #f0fdfa; border-left: 4px solid #06b6d4; padding: 20px; margin: 12px 0; font-size: 16px; line-height: 1.8; }
          .signature { text-align: right; color: #6b7280; font-style: italic; margin-top: 15px; }
          .btn-container { text-align: center; margin: 24px 0; }
          .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; }
          .footer { text-align: center; padding: 24px; color: #9ca3af; font-size: 12px; }
          .footer p { margin: 4px 0; }
          h3 { color: #1f2937; font-size: 15px; margin: 0 0 12px; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <h1>\u{1F4AC} ${t.title}</h1>
            </div>
            <div class="content">
              <p>${t.greeting}</p>
              <p>${t.body}</p>

              <div class="card">
                <h3>${t.packageLabel}</h3>
                <div class="tracking">${trackingNumber}</div>
              </div>

              <div class="card">
                <h3>${t.messageLabel}</h3>
                <div class="message-box">
                  ${message.replace(/\n/g, '<br>')}
                  <div class="signature">- ${adminName}, ${t.teamSuffix}</div>
                </div>
              </div>

              <div class="card">
                <p><strong>${t.respondTitle}</strong></p>
                <p>${t.respondBody}</p>
              </div>

              <div class="btn-container">
                <a href="${APP_URL}/packages" class="button">${t.buttonLabel}</a>
              </div>
            </div>
            <div class="footer">
              <p><strong>${t.footer}</strong></p>
              <p>${t.replyNote}</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: userEmail, subject: '\u{1F4AC} ' + t.subject, html });
};

// Template: Important Notification
export const sendImportantNotificationEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string,
  title: string,
  message: string,
  priority: 'high' | 'medium' | 'low' = 'medium'
) => {
  const colors = {
    high: { primary: '#ef4444', secondary: '#dc2626', bg: '#fef2f2' },
    medium: { primary: '#f59e0b', secondary: '#d97706', bg: '#fef3c7' },
    low: { primary: '#3b82f6', secondary: '#2563eb', bg: '#dbeafe' },
  };
  const color = colors[priority];

  const subject = `${priority === 'high' ? '🚨' : priority === 'medium' ? '⚠️' : 'ℹ️'} ${title} - Alliance Shipping`;
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, ${color.primary} 0%, ${color.secondary} 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .tracking { font-size: 18px; font-weight: bold; color: ${color.primary}; text-align: center; padding: 12px; background: ${color.bg}; border-radius: 8px; }
          .alert-box { background: ${color.bg}; border-left: 4px solid ${color.primary}; padding: 20px; margin: 20px 0; }
          .priority-badge { background: ${color.primary}; color: white; padding: 5px 15px; border-radius: 15px; font-size: 12px; font-weight: bold; display: inline-block; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background: ${color.primary}; color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${priority === 'high' ? '🚨' : priority === 'medium' ? '⚠️' : 'ℹ️'} ${title}</h1>
            <span class="priority-badge">${priority.toUpperCase()} PRIORITY</span>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>

            <div class="card">
              <h3>Package:</h3>
              <div class="tracking">${trackingNumber}</div>
            </div>

            <div class="alert-box">
              ${message.replace(/\n/g, '<br>')}
            </div>

            ${priority === 'high' ? `
            <div class="card" style="background: #fef2f2;">
              <p style="color: #991b1b; font-weight: bold;">⚠️ This requires your immediate attention!</p>
              <p>Please contact us or check your dashboard as soon as possible.</p>
            </div>
            ` : ''}

            <div style="text-align: center;">
              <a href="${APP_URL}/dashboard/packages" class="button">
                View Package
              </a>
            </div>

            <div class="footer">
              <p>Alliance Shipping - Reliable Shipping from USA to Haiti</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: userEmail, subject, html });
};

// ============================================
// SPECIAL EVENTS TEMPLATES
// ============================================

// Template: Delivery Delayed
export const sendDeliveryDelayedEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string,
  reason: string,
  estimatedDelay: string,
  newEstimatedDate?: string
) => {
  const subject = '⏰ Package Delivery Delayed - Alliance Shipping';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .tracking { font-size: 20px; font-weight: bold; color: #f59e0b; text-align: center; padding: 12px; background: #fef3c7; border-radius: 8px; }
          .delay-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; }
          .new-date { font-size: 24px; font-weight: bold; color: #f59e0b; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Delivery Delayed</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            <p>We're writing to inform you that your package delivery has been delayed.</p>

            <div class="card">
              <h3>Tracking Number:</h3>
              <div class="tracking">${trackingNumber}</div>
            </div>

            <div class="card">
              <h3>Reason for Delay:</h3>
              <div class="delay-box">
                ${reason}
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">
                Expected delay: <strong>${estimatedDelay}</strong>
              </p>
            </div>

            ${newEstimatedDate ? `
            <div class="card">
              <h3>New Estimated Delivery:</h3>
              <div class="new-date">${newEstimatedDate}</div>
            </div>
            ` : ''}

            <div class="card">
              <h3>What We're Doing:</h3>
              <ul>
                <li>Our team is working to resolve this issue</li>
                <li>You'll receive updates on your package status</li>
                <li>We're monitoring the situation closely</li>
                <li>Contact us if you have urgent concerns</li>
              </ul>
            </div>

            <div style="text-align: center;">
              <a href="${APP_URL}/dashboard/packages" class="button">
                Track Package
              </a>
            </div>

            <p style="margin-top: 30px;">We apologize for any inconvenience and appreciate your patience.</p>

            <div class="footer">
              <p>Alliance Shipping - Reliable Shipping from USA to Haiti</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: userEmail, subject, html });
};

// Template: Package Issue Reported
export const sendPackageIssueEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string,
  issueType: string,
  issueDescription: string,
  resolutionSteps: string
) => {
  const subject = '⚠️ Package Issue Reported - Alliance Shipping';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .tracking { font-size: 20px; font-weight: bold; color: #ef4444; text-align: center; padding: 12px; background: #fee2e2; border-radius: 8px; }
          .issue-badge { background: #ef4444; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; }
          .issue-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; }
          .resolution-box { background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Package Issue Reported</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            <p>We've identified an issue with your package and are working to resolve it.</p>

            <div class="card">
              <h3>Tracking Number:</h3>
              <div class="tracking">${trackingNumber}</div>
            </div>

            <div class="card" style="text-align: center;">
              <h3>Issue Type:</h3>
              <span class="issue-badge">${issueType}</span>
            </div>

            <div class="card">
              <h3>Issue Details:</h3>
              <div class="issue-box">
                ${issueDescription.replace(/\n/g, '<br>')}
              </div>
            </div>

            <div class="card">
              <h3>Resolution Steps:</h3>
              <div class="resolution-box">
                ${resolutionSteps.replace(/\n/g, '<br>')}
              </div>
            </div>

            <div class="card">
              <h3>Need Help?</h3>
              <p>Our support team is here to assist you. Please contact us if you have any questions or concerns.</p>
              <p><strong>📞 Phone:</strong> (+509) 4881-2652</p>
              <p><strong>📧 Email:</strong> allianceshipping26@gmail.com</p>
            </div>

            <div style="text-align: center;">
              <a href="${APP_URL}/dashboard/packages" class="button">
                View Package Status
              </a>
            </div>

            <p style="margin-top: 30px;">We apologize for this inconvenience and are committed to resolving this quickly.</p>

            <div class="footer">
              <p>Alliance Shipping - Reliable Shipping from USA to Haiti</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: userEmail, subject, html });
};

// ============================================
// ANNOUNCEMENTS & GENERAL TEMPLATES
// ============================================

// Template: General Announcement
export const sendAnnouncementEmail = async (
  userEmail: string,
  userName: string,
  title: string,
  content: string,
  actionLabel?: string,
  actionUrl?: string
) => {
  const subject = `📢 ${title} - Alliance Shipping`;
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .announcement-box { background: #f0fdfa; border-left: 4px solid #14b8a6; padding: 20px; margin: 20px 0; font-size: 16px; line-height: 1.8; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background: #14b8a6; color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📢 ${title}</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>

            <div class="announcement-box">
              ${content.replace(/\n/g, '<br>')}
            </div>

            ${actionLabel && actionUrl ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${actionUrl}" class="button">
                ${actionLabel}
              </a>
            </div>
            ` : ''}

            <p style="margin-top: 30px;">Thank you for being a valued customer of Alliance Shipping!</p>

            <div class="footer">
              <p>Alliance Shipping - Reliable Shipping from USA to Haiti</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: userEmail, subject, html });
};

// ============================================
// ACCOUNT & LIFECYCLE TEMPLATES
// ============================================

// Template: Welcome Email
export const sendWelcomeEmail = async (
  userEmail: string,
  userName: string
) => {
  const subject = '🎉 Welcome to Alliance Shipping!';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .feature { display: flex; align-items: start; margin: 15px 0; }
          .feature-icon { font-size: 24px; margin-right: 15px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="font-size: 32px; margin: 0;">🎉 Welcome to Alliance Shipping!</h1>
            <p style="font-size: 18px; margin-top: 10px;">We're excited to have you on board</p>
          </div>
          <div class="content">
            <p style="font-size: 18px;">Hello <strong>${userName}</strong>,</p>
            <p>Thank you for choosing Alliance Shipping for your shipping needs between USA and Haiti!</p>

            <div class="card">
              <h3>🚀 Get Started in 3 Easy Steps:</h3>
              <ol style="line-height: 2;">
                <li><strong>Submit a Package Request</strong> - Tell us what you're shipping</li>
                <li><strong>We Review & Approve</strong> - Get your tracking number within 24 hours</li>
                <li><strong>Track Your Package</strong> - Follow your package from USA to Haiti</li>
              </ol>
            </div>

            <div class="card">
              <h3>✨ What Makes Us Special:</h3>
              <div class="feature">
                <div class="feature-icon">🔒</div>
                <div>
                  <strong>Secure Shipping</strong><br>
                  Your packages are fully insured and tracked
                </div>
              </div>
              <div class="feature">
                <div class="feature-icon">⚡</div>
                <div>
                  <strong>Fast Delivery</strong><br>
                  Regular shipments to Haiti every week
                </div>
              </div>
              <div class="feature">
                <div class="feature-icon">💰</div>
                <div>
                  <strong>Transparent Pricing</strong><br>
                  No hidden fees - $5 service fee + $4/lb shipping
                </div>
              </div>
              <div class="feature">
                <div class="feature-icon">📱</div>
                <div>
                  <strong>Real-Time Tracking</strong><br>
                  Track your package every step of the way
                </div>
              </div>
            </div>

            <div class="card">
              <h3>📍 Our Locations:</h3>
              <p><strong>USA Warehouse:</strong> Miami, Florida</p>
              <p><strong>Haiti Offices:</strong> Port-au-Prince, Cap-Haïtien, and more</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${APP_URL}/dashboard" class="button">
                Go to Dashboard
              </a>
              <a href="${APP_URL}/dashboard/packages/new" class="button" style="background: #10b981;">
                Send Your First Package
              </a>
            </div>

            <div class="card" style="background: #f0fdf4;">
              <h3>💡 Pro Tip:</h3>
              <p>Use our Miami warehouse address when shopping online! We'll receive your packages and ship them directly to Haiti.</p>
            </div>

            <p style="margin-top: 30px;">If you have any questions, our support team is here to help!</p>
            <p>
              📞 <strong>Phone:</strong> +509 4881-2652<br>
              📧 <strong>Email:</strong> allianceshipping26@gmail.com<br>
              💬 <strong>WhatsApp:</strong> +509 4881 26-52
            </p>

            <div class="footer">
              <p style="font-size: 16px; color: #667eea; font-weight: bold;">Welcome to the Alliance Shipping family! 🎉</p>
              <p>Alliance Shipping - Reliable Shipping from USA to Haiti</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: userEmail, subject, html });
};

// Template: Feedback Request
export const sendFeedbackRequestEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string
) => {
  const subject = '⭐ How was your experience? - Alliance Shipping';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .tracking { font-size: 18px; font-weight: bold; color: #f59e0b; text-align: center; padding: 12px; background: #fef3c7; border-radius: 8px; }
          .stars { text-align: center; font-size: 48px; margin: 20px 0; }
          .rating-buttons { display: flex; justify-content: center; gap: 10px; margin: 20px 0; }
          .rating-button { padding: 15px 25px; background: #fbbf24; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="stars">⭐⭐⭐⭐⭐</div>
            <h1>How was your experience?</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            <p>Your package has been delivered! We hope everything went smoothly.</p>

            <div class="card">
              <h3>Delivered Package:</h3>
              <div class="tracking">${trackingNumber}</div>
            </div>

            <div class="card">
              <h3>We'd love to hear from you!</h3>
              <p>Your feedback helps us improve our service and serve you better.</p>
              <p>How would you rate your experience with Alliance Shipping?</p>
            </div>

            <div class="card" style="text-align: center;">
              <h3>Quick Questions:</h3>
              <ul style="text-align: left; line-height: 2;">
                <li>Was your package delivered on time?</li>
                <li>Was your package in good condition?</li>
                <li>How was the tracking experience?</li>
                <li>How would you rate our customer service?</li>
                <li>Would you recommend us to others?</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <p style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">Rate Your Experience:</p>
              <a href="${APP_URL}/feedback?package=${trackingNumber}&rating=5" class="rating-button">
                ⭐⭐⭐⭐⭐ Excellent
              </a>
            </div>

            <p style="text-align: center; margin-top: 20px;">
              <a href="${APP_URL}/feedback?package=${trackingNumber}" style="color: #667eea;">Leave detailed feedback →</a>
            </p>

            <p style="margin-top: 30px; text-align: center;">Thank you for choosing Alliance Shipping!</p>

            <div class="footer">
              <p>Alliance Shipping - Reliable Shipping from USA to Haiti</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: userEmail, subject, html });
};

// Template: Package Reminder
export const sendPackageReminderEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string,
  status: string,
  daysWaiting: number
) => {
  const subject = '🔔 Package Status Reminder - Alliance Shipping';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .tracking { font-size: 20px; font-weight: bold; color: #8b5cf6; text-align: center; padding: 12px; background: #f3e8ff; border-radius: 8px; }
          .status-badge { background: #f3e8ff; color: #7c3aed; padding: 10px 20px; border-radius: 20px; display: inline-block; font-weight: bold; }
          .days-waiting { font-size: 32px; font-weight: bold; color: #8b5cf6; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Package Status Reminder</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            <p>Just a friendly reminder about your package!</p>

            <div class="card">
              <h3>Tracking Number:</h3>
              <div class="tracking">${trackingNumber}</div>
            </div>

            <div class="card" style="text-align: center;">
              <h3>Current Status:</h3>
              <span class="status-badge">${status.toUpperCase()}</span>
              <div class="days-waiting">${daysWaiting} days</div>
              <p style="color: #6b7280;">Your package has been in this status</p>
            </div>

            ${status === 'available' ? `
            <div class="card" style="background: #fef3c7;">
              <h3>⚠️ Your Package is Ready for Pickup!</h3>
              <p>Your package has been waiting for pickup. Please visit our office to collect it at your earliest convenience.</p>
              <p><strong>Pickup Location:</strong> Haiti Office</p>
              <p><strong>Hours:</strong> Monday-Friday 8:00 AM - 5:00 PM, Saturday 9:00 AM - 2:00 PM</p>
            </div>
            ` : ''}

            <div style="text-align: center;">
              <a href="${APP_URL}/dashboard/packages" class="button">
                Check Package Status
              </a>
            </div>

            <p style="margin-top: 30px;">If you have any questions, please don't hesitate to contact us.</p>

            <div class="footer">
              <p>Alliance Shipping - Reliable Shipping from USA to Haiti</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: userEmail, subject, html });
};

// ==================== BUNDLE DELIVERED EMAIL ====================

interface BundlePackageInfo {
  trackingNumber: string;
  weight: number;
  serviceFee: number;
  weightCost: number;
  customsFees: number;
  totalCost: number;
  bundleTotalCost: number;
}

export const sendBundleDeliveredEmail = async (
  userEmail: string,
  userName: string,
  bundlePackages: BundlePackageInfo[],
  savings: number,
  totalPoints: number,
  locale: string = 'fr'
) => {
  type Loc = 'ht' | 'fr' | 'en' | 'es';
  const lang = (['ht', 'fr', 'en', 'es'].includes(locale) ? locale : 'fr') as Loc;
  const count = bundlePackages.length;

  const translations: Record<Loc, Record<string, string>> = {
    fr: {
      subject: '\u{1F4E6}\u2728 Bundle Livr\u00e9 \u2014 ' + count + ' colis - Alliance Shipping',
      headerTitle: 'Bundle Livr\u00e9 !',
      greeting: 'F\u00e9licitations ' + userName + ' !',
      body: 'Vos ' + count + ' colis ont \u00e9t\u00e9 livr\u00e9s ensemble en bundle.',
      packagesTitle: 'Colis dans le Bundle',
      trackingCol: 'Tracking',
      weightCol: 'Poids',
      serviceCol: 'Service',
      totalCol: 'Total',
      firstPkg: '1er colis',
      extraPkg: 'Service $0',
      savingsTitle: '\u00c9conomie Bundle',
      originalLabel: 'Total original :',
      savingsLabel: '\u00c9conomie :',
      bundleTotalLabel: 'Total Bundle :',
      oneFeeNote: '1 seul frais de service au lieu de ' + count,
      pointsTitle: 'Points de Fid\u00e9lit\u00e9',
      pointsEarned: 'Vous avez gagn\u00e9 ' + totalPoints + ' points avec ce bundle !',
      buttonLabel: 'Voir Mes Colis',
      thankYou: 'Merci d\'avoir choisi Alliance Shipping !',
      footerText: 'Alliance Shipping - Exp\u00e9dition Fiable des USA vers Ha\u00efti',
      automated: 'Ceci est un message automatique, merci de ne pas r\u00e9pondre.',
    },
    en: {
      subject: '\u{1F4E6}\u2728 Bundle Delivered \u2014 ' + count + ' packages - Alliance Shipping',
      headerTitle: 'Bundle Delivered!',
      greeting: 'Congratulations ' + userName + '!',
      body: 'Your ' + count + ' packages have been delivered together as a bundle.',
      packagesTitle: 'Packages in Bundle',
      trackingCol: 'Tracking',
      weightCol: 'Weight',
      serviceCol: 'Service',
      totalCol: 'Total',
      firstPkg: '1st package',
      extraPkg: 'Service $0',
      savingsTitle: 'Bundle Savings',
      originalLabel: 'Original total:',
      savingsLabel: 'Savings:',
      bundleTotalLabel: 'Bundle total:',
      oneFeeNote: '1 service fee instead of ' + count,
      pointsTitle: 'Loyalty Points',
      pointsEarned: 'You earned ' + totalPoints + ' points with this bundle!',
      buttonLabel: 'View My Packages',
      thankYou: 'Thank you for choosing Alliance Shipping!',
      footerText: 'Alliance Shipping - Reliable Shipping from USA to Haiti',
      automated: 'This is an automated message, please do not reply to this email.',
    },
    ht: {
      subject: '\u{1F4E6}\u2728 Bundle Livre \u2014 ' + count + ' kolis - Alliance Shipping',
      headerTitle: 'Bundle Livre !',
      greeting: 'Felisitasyon ' + userName + ' !',
      body: count + ' kolis ou yo livre ansanm nan yon bundle.',
      packagesTitle: 'Kolis nan Bundle',
      trackingCol: 'Tracking',
      weightCol: 'Pwa',
      serviceCol: 'S\u00e8vis',
      totalCol: 'Total',
      firstPkg: '1ye kolis',
      extraPkg: 'S\u00e8vis $0',
      savingsTitle: 'Ekonomi Bundle',
      originalLabel: 'Total orijinal :',
      savingsLabel: 'Ekonomi :',
      bundleTotalLabel: 'Total Bundle :',
      oneFeeNote: '1 s\u00e8l fr\u00e8 s\u00e8vis olye de ' + count,
      pointsTitle: 'Pwen Fidelite',
      pointsEarned: 'Ou genyen ' + totalPoints + ' pwen av\u00e8k bundle sa a !',
      buttonLabel: 'W\u00e8 Kolis Mwen Yo',
      thankYou: 'M\u00e8si paske ou chwazi Alliance Shipping !',
      footerText: 'Alliance Shipping - Livrezon Fyab soti nan USA pou ale an Ayiti',
      automated: 'Sa a se yon mesaj otomatik, tanpri pa reponn im\u00e8l sa a.',
    },
    es: {
      subject: '\u{1F4E6}\u2728 Bundle Entregado \u2014 ' + count + ' paquetes - Alliance Shipping',
      headerTitle: '\u00a1Bundle Entregado!',
      greeting: '\u00a1Felicidades ' + userName + '!',
      body: 'Sus ' + count + ' paquetes han sido entregados juntos como bundle.',
      packagesTitle: 'Paquetes en el Bundle',
      trackingCol: 'Seguimiento',
      weightCol: 'Peso',
      serviceCol: 'Servicio',
      totalCol: 'Total',
      firstPkg: '1er paquete',
      extraPkg: 'Servicio $0',
      savingsTitle: 'Ahorro Bundle',
      originalLabel: 'Total original:',
      savingsLabel: 'Ahorro:',
      bundleTotalLabel: 'Total Bundle:',
      oneFeeNote: '1 tarifa de servicio en vez de ' + count,
      pointsTitle: 'Puntos de Fidelidad',
      pointsEarned: '\u00a1Gan\u00f3 ' + totalPoints + ' puntos con este bundle!',
      buttonLabel: 'Ver Mis Paquetes',
      thankYou: '\u00a1Gracias por elegir Alliance Shipping!',
      footerText: 'Alliance Shipping - Env\u00edos Confiables de USA a Hait\u00ed',
      automated: 'Este es un mensaje autom\u00e1tico, por favor no responda.',
    },
  };

  const s = translations[lang];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const originalTotal = bundlePackages.reduce((sum, p) => sum + p.totalCost, 0);
  const bundleTotal = originalTotal - savings;

  const packageRows = bundlePackages.map((pkg, i) => {
    const bgColor = i === 0 ? '#ffffff' : '#f0fdf4';
    const serviceHtml = i === 0
      ? '<span style="font-size:13px;">$' + pkg.serviceFee.toFixed(2) + '</span>'
      : '<span style="color:#16a34a;font-weight:600;font-size:13px;">$0.00</span>';
    const badge = i === 0 ? s.firstPkg : s.extraPkg;
    const strikethrough = i > 0
      ? '<span style="text-decoration:line-through;color:#9ca3af;font-size:11px;">$' + pkg.totalCost.toFixed(2) + '</span><br>'
      : '';
    return '<tr style="background:' + bgColor + ';">'
      + '<td style="padding:10px 12px;font-family:monospace;font-size:13px;font-weight:600;">' + pkg.trackingNumber + '</td>'
      + '<td style="padding:10px 8px;text-align:center;font-size:13px;">' + pkg.weight + ' lbs</td>'
      + '<td style="padding:10px 8px;text-align:center;">' + serviceHtml + '<br><span style="font-size:10px;color:#9ca3af;">' + badge + '</span></td>'
      + '<td style="padding:10px 12px;text-align:right;font-weight:600;font-size:13px;">' + strikethrough + '$' + pkg.bundleTotalCost.toFixed(2) + '</td>'
      + '</tr>';
  }).join('');

  const pointsSection = totalPoints > 0
    ? '<div class="card" style="text-align:center;"><h3>\u{1F31F} ' + s.pointsTitle + '</h3><p style="font-size:24px;font-weight:800;color:#7c3aed;">' + totalPoints + ' pts</p><p style="color:#6b7280;font-size:14px;">' + s.pointsEarned + '</p></div>'
    : '';

  const colisLabel = lang === 'en' ? 'packages' : lang === 'es' ? 'paquetes' : 'colis';

  const html = '<!DOCTYPE html><html lang="' + lang + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>'
    + 'body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;line-height:1.6;color:#1f2937;margin:0;padding:0;background:#f3f4f6;}'
    + '.wrapper{padding:20px;}'
    + '.container{max-width:600px;margin:0 auto;}'
    + '.header{background:linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%);color:white;padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;}'
    + '.header h1{margin:0;font-size:22px;font-weight:700;}'
    + '.header p{margin:8px 0 0;font-size:14px;opacity:0.9;}'
    + '.content{background:#ffffff;padding:32px 24px;border-radius:0 0 12px 12px;}'
    + '.card{background:#f9fafb;padding:20px;border-radius:10px;margin:20px 0;border:1px solid #e5e7eb;}'
    + '.savings-card{background:linear-gradient(135deg,#ecfdf5,#d1fae5);padding:20px;border-radius:10px;margin:20px 0;border:2px solid #86efac;}'
    + '.btn-container{text-align:center;margin:24px 0;}'
    + '.button{display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%);color:#ffffff !important;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;}'
    + '.footer{text-align:center;padding:24px;color:#9ca3af;font-size:12px;}'
    + '.footer p{margin:4px 0;}'
    + '.divider{height:1px;background:#e5e7eb;margin:24px 0;}'
    + 'h3{color:#1f2937;font-size:15px;margin:0 0 12px;}'
    + '</style></head><body><div class="wrapper"><div class="container">'
    + '<div class="header"><h1>\u{1F4E6}\u2728 ' + s.headerTitle + '</h1><p>' + count + ' ' + colisLabel + ' \u2022 Bundle Delivery</p></div>'
    + '<div class="content">'
    + '<p>' + s.greeting + '</p><p>' + s.body + '</p>'
    + '<div class="card"><h3>' + s.packagesTitle + '</h3>'
    + '<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">'
    + '<thead><tr style="background:#f3f4f6;">'
    + '<th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">' + s.trackingCol + '</th>'
    + '<th style="padding:10px 8px;text-align:center;font-size:12px;color:#6b7280;text-transform:uppercase;">' + s.weightCol + '</th>'
    + '<th style="padding:10px 8px;text-align:center;font-size:12px;color:#6b7280;text-transform:uppercase;">' + s.serviceCol + '</th>'
    + '<th style="padding:10px 12px;text-align:right;font-size:12px;color:#6b7280;text-transform:uppercase;">' + s.totalCol + '</th>'
    + '</tr></thead><tbody>' + packageRows + '</tbody></table></div>'
    + '<div class="savings-card"><h3 style="color:#065f46;">\u{1F389} ' + s.savingsTitle + '</h3>'
    + '<table width="100%" cellpadding="0" cellspacing="0">'
    + '<tr><td style="padding:6px 0;color:#6b7280;">' + s.originalLabel + '</td><td style="padding:6px 0;text-align:right;color:#9ca3af;text-decoration:line-through;">$' + originalTotal.toFixed(2) + '</td></tr>'
    + '<tr><td style="padding:6px 0;color:#16a34a;font-weight:600;">' + s.savingsLabel + '</td><td style="padding:6px 0;text-align:right;color:#16a34a;font-weight:700;font-size:18px;">-$' + savings.toFixed(2) + '</td></tr>'
    + '<tr style="border-top:2px solid #86efac;"><td style="padding:10px 0 6px;font-weight:800;color:#065f46;font-size:16px;">' + s.bundleTotalLabel + '</td><td style="padding:10px 0 6px;text-align:right;font-weight:800;color:#065f46;font-size:20px;">$' + bundleTotal.toFixed(2) + '</td></tr>'
    + '</table><div style="text-align:center;margin-top:12px;"><span style="display:inline-block;padding:6px 16px;background:#dcfce7;color:#16a34a;border-radius:20px;font-size:13px;font-weight:600;">\u2728 ' + s.oneFeeNote + '</span></div></div>'
    + pointsSection
    + '<div class="btn-container"><a href="' + appUrl + '/packages" class="button">' + s.buttonLabel + '</a></div>'
    + '<div class="divider"></div><p style="color:#6b7280;font-size:14px;text-align:center;">' + s.thankYou + '</p>'
    + '</div>'
    + '<div class="footer"><p><strong>' + s.footerText + '</strong></p><p>' + s.automated + '</p></div>'
    + '</div></div></body></html>';

  return sendEmail({ to: userEmail, subject: s.subject, html });
};
