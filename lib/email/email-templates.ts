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
  priority: 'high' | 'medium' | 'low' = 'medium',
  locale: string = 'fr'
) => {
  const colors = {
    high: { primary: '#ef4444', secondary: '#dc2626', bg: '#fef2f2' },
    medium: { primary: '#f59e0b', secondary: '#d97706', bg: '#fef3c7' },
    low: { primary: '#3b82f6', secondary: '#2563eb', bg: '#dbeafe' },
  };
  const color = colors[priority];

  const priorityEmoji = priority === 'high' ? '🚨' : priority === 'medium' ? '⚠️' : 'ℹ️';

  const translations: Record<string, any> = {
    fr: {
      subject: `${priorityEmoji} ${title} - Alliance Shipping`,
      priorityBadge: priority === 'high' ? 'PRIORITÉ HAUTE' : priority === 'medium' ? 'PRIORITÉ MOYENNE' : 'PRIORITÉ BASSE',
      greeting: `Bonjour ${userName},`,
      packageLabel: 'Colis :',
      alertRequiresAttention: 'Cela nécessite votre attention immédiate !',
      pleaseContact: 'Veuillez nous contacter ou vérifier votre tableau de bord dès que possible.',
      buttonLabel: 'Voir le Colis',
      companyFooter: 'Alliance Shipping - Expédition Fiable des USA vers Haïti',
      automated: 'Ceci est un message automatique, merci de ne pas répondre.',
    },
    en: {
      subject: `${priorityEmoji} ${title} - Alliance Shipping`,
      priorityBadge: `${priority.toUpperCase()} PRIORITY`,
      greeting: `Hello ${userName},`,
      packageLabel: 'Package:',
      alertRequiresAttention: 'This requires your immediate attention!',
      pleaseContact: 'Please contact us or check your dashboard as soon as possible.',
      buttonLabel: 'View Package',
      companyFooter: 'Alliance Shipping - Reliable Shipping from USA to Haiti',
      automated: 'This is an automated message, please do not reply to this email.',
    },
    ht: {
      subject: `${priorityEmoji} ${title} - Alliance Shipping`,
      priorityBadge: priority === 'high' ? 'PRIYORITE WO' : priority === 'medium' ? 'PRIYORITE MWAYEN' : 'PRIYORITE BA',
      greeting: `Bonjou ${userName},`,
      packageLabel: 'Koli :',
      alertRequiresAttention: 'Sa a mande atansyon imedya ou !',
      pleaseContact: 'Tanpri kontakte nou oswa tcheke tablo bò w pi vit posib.',
      buttonLabel: 'Wè Koli',
      companyFooter: 'Alliance Shipping - Livrezon Fyab soti nan USA pou ale an Ayiti',
      automated: 'Sa a se yon mesaj otomatik, tanpri pa reponn imèl sa a.',
    },
    es: {
      subject: `${priorityEmoji} ${title} - Alliance Shipping`,
      priorityBadge: priority === 'high' ? 'PRIORIDAD ALTA' : priority === 'medium' ? 'PRIORIDAD MEDIA' : 'PRIORIDAD BAJA',
      greeting: `Hola ${userName},`,
      packageLabel: 'Paquete:',
      alertRequiresAttention: '¡Esto requiere su atención inmediata!',
      pleaseContact: 'Por favor contáctenos o revise su panel de control lo antes posible.',
      buttonLabel: 'Ver Paquete',
      companyFooter: 'Alliance Shipping - Envíos Confiables de USA a Haití',
      automated: 'Este es un mensaje automático, por favor no responda.',
    },
  };

  const t = translations[locale] || translations.fr;

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
            <h1>${priorityEmoji} ${title}</h1>
            <span class="priority-badge">${t.priorityBadge}</span>
          </div>
          <div class="content">
            <p>${t.greeting.replace(userName, `<strong>${userName}</strong>`)}</p>

            <div class="card">
              <h3>${t.packageLabel}</h3>
              <div class="tracking">${trackingNumber}</div>
            </div>

            <div class="alert-box">
              ${message.replace(/\n/g, '<br>')}
            </div>

            ${priority === 'high' ? `
            <div class="card" style="background: #fef2f2;">
              <p style="color: #991b1b; font-weight: bold;">⚠️ ${t.alertRequiresAttention}</p>
              <p>${t.pleaseContact}</p>
            </div>
            ` : ''}

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

  return sendEmail({ to: userEmail, subject: t.subject, html });
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
  newEstimatedDate?: string,
  locale: string = 'fr'
) => {
  const translations: Record<string, any> = {
    fr: {
      subject: '⏰ Livraison du colis retardée - Alliance Shipping',
      headerTitle: 'Livraison Retardée',
      greeting: `Bonjour ${userName},`,
      message: 'Nous vous écrivons pour vous informer que la livraison de votre colis a été retardée.',
      trackingLabel: 'Numéro de Suivi :',
      reasonLabel: 'Raison du Retard :',
      delayLabel: 'Retard estimé :',
      newDateLabel: 'Nouvelle Date de Livraison Estimée :',
      whatWeDoTitle: 'Ce que nous faisons :',
      bullet1: 'Notre équipe travaille à résoudre ce problème',
      bullet2: 'Vous recevrez des mises à jour sur le statut de votre colis',
      bullet3: 'Nous surveillons la situation de près',
      bullet4: 'Contactez-nous si vous avez des préoccupations urgentes',
      buttonLabel: 'Suivre le Colis',
      apologyText: 'Nous nous excusons pour tout inconvénient et apprécions votre patience.',
      companyFooter: 'Alliance Shipping - Expédition Fiable des USA vers Haïti',
      automated: 'Ceci est un message automatique, merci de ne pas répondre.',
    },
    en: {
      subject: '⏰ Package Delivery Delayed - Alliance Shipping',
      headerTitle: 'Delivery Delayed',
      greeting: `Hello ${userName},`,
      message: 'We\'re writing to inform you that your package delivery has been delayed.',
      trackingLabel: 'Tracking Number:',
      reasonLabel: 'Reason for Delay:',
      delayLabel: 'Expected delay:',
      newDateLabel: 'New Estimated Delivery:',
      whatWeDoTitle: 'What We\'re Doing:',
      bullet1: 'Our team is working to resolve this issue',
      bullet2: 'You\'ll receive updates on your package status',
      bullet3: 'We\'re monitoring the situation closely',
      bullet4: 'Contact us if you have urgent concerns',
      buttonLabel: 'Track Package',
      apologyText: 'We apologize for any inconvenience and appreciate your patience.',
      companyFooter: 'Alliance Shipping - Reliable Shipping from USA to Haiti',
      automated: 'This is an automated message, please do not reply to this email.',
    },
    ht: {
      subject: '⏰ Livrezon koli a an reta - Alliance Shipping',
      headerTitle: 'Livrezon an Reta',
      greeting: `Bonjou ${userName},`,
      message: 'Nou ekri w pou enfòme w ke livrezon koli w la an reta.',
      trackingLabel: 'Nimewo Tracking :',
      reasonLabel: 'Rezon pou Reta a :',
      delayLabel: 'Reta estime :',
      newDateLabel: 'Nouvo Dat Livrezon Estime :',
      whatWeDoTitle: 'Kisa Nou Ap Fè :',
      bullet1: 'Ekip nou ap travay pou rezoud pwoblèm sa a',
      bullet2: 'Ou pral resevwa mizajou sou estati koli w la',
      bullet3: 'Nou ap siveye sitiyasyon an de prè',
      bullet4: 'Kontakte nou si w gen enkyetid ijan',
      buttonLabel: 'Swiv Koli',
      apologyText: 'Nou eskize pou tout enkonvenyans epi nou apresye pasyans ou.',
      companyFooter: 'Alliance Shipping - Livrezon Fyab soti nan USA pou ale an Ayiti',
      automated: 'Sa a se yon mesaj otomatik, tanpri pa reponn imèl sa a.',
    },
    es: {
      subject: '⏰ Entrega del paquete retrasada - Alliance Shipping',
      headerTitle: 'Entrega Retrasada',
      greeting: `Hola ${userName},`,
      message: 'Le escribimos para informarle que la entrega de su paquete se ha retrasado.',
      trackingLabel: 'Número de Seguimiento:',
      reasonLabel: 'Razón del Retraso:',
      delayLabel: 'Retraso estimado:',
      newDateLabel: 'Nueva Fecha de Entrega Estimada:',
      whatWeDoTitle: 'Lo que Estamos Haciendo:',
      bullet1: 'Nuestro equipo está trabajando para resolver este problema',
      bullet2: 'Recibirá actualizaciones sobre el estado de su paquete',
      bullet3: 'Estamos monitoreando la situación de cerca',
      bullet4: 'Contáctenos si tiene preocupaciones urgentes',
      buttonLabel: 'Rastrear Paquete',
      apologyText: 'Nos disculpamos por cualquier inconveniente y agradecemos su paciencia.',
      companyFooter: 'Alliance Shipping - Envíos Confiables de USA a Haití',
      automated: 'Este es un mensaje automático, por favor no responda.',
    },
  };

  const t = translations[locale] || translations.fr;

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
            <h1>⏰ ${t.headerTitle}</h1>
          </div>
          <div class="content">
            <p>${t.greeting.replace(userName, `<strong>${userName}</strong>`)}</p>
            <p>${t.message}</p>

            <div class="card">
              <h3>${t.trackingLabel}</h3>
              <div class="tracking">${trackingNumber}</div>
            </div>

            <div class="card">
              <h3>${t.reasonLabel}</h3>
              <div class="delay-box">
                ${reason}
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">
                ${t.delayLabel} <strong>${estimatedDelay}</strong>
              </p>
            </div>

            ${newEstimatedDate ? `
            <div class="card">
              <h3>${t.newDateLabel}</h3>
              <div class="new-date">${newEstimatedDate}</div>
            </div>
            ` : ''}

            <div class="card">
              <h3>${t.whatWeDoTitle}</h3>
              <ul>
                <li>${t.bullet1}</li>
                <li>${t.bullet2}</li>
                <li>${t.bullet3}</li>
                <li>${t.bullet4}</li>
              </ul>
            </div>

            <div style="text-align: center;">
              <a href="${APP_URL}/dashboard/packages" class="button">
                ${t.buttonLabel}
              </a>
            </div>

            <p style="margin-top: 30px;">${t.apologyText}</p>

            <div class="footer">
              <p>${t.companyFooter}</p>
              <p>${t.automated}</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: userEmail, subject: t.subject, html });
};

// Template: Package Issue Reported
export const sendPackageIssueEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string,
  issueType: string,
  issueDescription: string,
  resolutionSteps: string,
  locale: string = 'fr'
) => {
  const translations: Record<string, any> = {
    fr: {
      subject: '⚠️ Problème Signalé sur le Colis - Alliance Shipping',
      headerTitle: 'Problème Signalé sur le Colis',
      greeting: `Bonjour <strong>${userName}</strong>,`,
      message: 'Nous avons identifié un problème avec votre colis et nous travaillons à le résoudre.',
      trackingLabel: 'Numéro de Suivi :',
      issueTypeLabel: 'Type de Problème :',
      issueDetailsLabel: 'Détails du Problème :',
      resolutionLabel: 'Étapes de Résolution :',
      needHelpTitle: 'Besoin d\'Aide ?',
      needHelpText: 'Notre équipe de support est là pour vous aider. Contactez-nous si vous avez des questions.',
      buttonLabel: 'Voir le Statut du Colis',
      apologyText: 'Nous nous excusons pour cet inconvénient et nous nous engageons à résoudre cela rapidement.',
      companyFooter: 'Alliance Shipping - Expédition Fiable des USA vers Haïti',
      automated: 'Ceci est un message automatique, merci de ne pas répondre.',
    },
    en: {
      subject: '⚠️ Package Issue Reported - Alliance Shipping',
      headerTitle: 'Package Issue Reported',
      greeting: `Hello <strong>${userName}</strong>,`,
      message: 'We\'ve identified an issue with your package and are working to resolve it.',
      trackingLabel: 'Tracking Number:',
      issueTypeLabel: 'Issue Type:',
      issueDetailsLabel: 'Issue Details:',
      resolutionLabel: 'Resolution Steps:',
      needHelpTitle: 'Need Help?',
      needHelpText: 'Our support team is here to assist you. Please contact us if you have any questions or concerns.',
      buttonLabel: 'View Package Status',
      apologyText: 'We apologize for this inconvenience and are committed to resolving this quickly.',
      companyFooter: 'Alliance Shipping - Reliable Shipping from USA to Haiti',
      automated: 'This is an automated message, please do not reply to this email.',
    },
    ht: {
      subject: '⚠️ Pwoblèm sou Koli a Rapòte - Alliance Shipping',
      headerTitle: 'Pwoblèm sou Koli a Rapòte',
      greeting: `Bonjou <strong>${userName}</strong>,`,
      message: 'Nou idantifye yon pwoblèm ak koli w la epi nou ap travay pou rezoud li.',
      trackingLabel: 'Nimewo Tracking :',
      issueTypeLabel: 'Tip Pwoblèm :',
      issueDetailsLabel: 'Detay Pwoblèm :',
      resolutionLabel: 'Etap Rezolisyon :',
      needHelpTitle: 'Bezwen Èd ?',
      needHelpText: 'Ekip sipò nou la pou ede w. Kontakte nou si w gen kesyon oswa enkyetid.',
      buttonLabel: 'Wè Estati Koli',
      apologyText: 'Nou eskize pou enkonvenyans sa a epi nou angaje pou rezoud sa vit.',
      companyFooter: 'Alliance Shipping - Livrezon Fyab soti nan USA pou ale an Ayiti',
      automated: 'Sa a se yon mesaj otomatik, tanpri pa reponn imèl sa a.',
    },
    es: {
      subject: '⚠️ Problema Reportado en el Paquete - Alliance Shipping',
      headerTitle: 'Problema Reportado en el Paquete',
      greeting: `Hola <strong>${userName}</strong>,`,
      message: 'Hemos identificado un problema con su paquete y estamos trabajando para resolverlo.',
      trackingLabel: 'Número de Seguimiento:',
      issueTypeLabel: 'Tipo de Problema:',
      issueDetailsLabel: 'Detalles del Problema:',
      resolutionLabel: 'Pasos de Resolución:',
      needHelpTitle: '¿Necesita Ayuda?',
      needHelpText: 'Nuestro equipo de soporte está aquí para asistirle. Contáctenos si tiene preguntas o inquietudes.',
      buttonLabel: 'Ver Estado del Paquete',
      apologyText: 'Nos disculpamos por este inconveniente y estamos comprometidos a resolverlo rápidamente.',
      companyFooter: 'Alliance Shipping - Envíos Confiables de USA a Haití',
      automated: 'Este es un mensaje automático, por favor no responda.',
    },
  };

  const t = translations[locale] || translations.fr;

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
            <h1>⚠️ ${t.headerTitle}</h1>
          </div>
          <div class="content">
            <p>${t.greeting}</p>
            <p>${t.message}</p>

            <div class="card">
              <h3>${t.trackingLabel}</h3>
              <div class="tracking">${trackingNumber}</div>
            </div>

            <div class="card" style="text-align: center;">
              <h3>${t.issueTypeLabel}</h3>
              <span class="issue-badge">${issueType}</span>
            </div>

            <div class="card">
              <h3>${t.issueDetailsLabel}</h3>
              <div class="issue-box">
                ${issueDescription.replace(/\n/g, '<br>')}
              </div>
            </div>

            <div class="card">
              <h3>${t.resolutionLabel}</h3>
              <div class="resolution-box">
                ${resolutionSteps.replace(/\n/g, '<br>')}
              </div>
            </div>

            <div class="card">
              <h3>${t.needHelpTitle}</h3>
              <p>${t.needHelpText}</p>
              <p><strong>📞 Phone:</strong> (+509) 4881-2652</p>
              <p><strong>📧 Email:</strong> allianceshipping26@gmail.com</p>
            </div>

            <div style="text-align: center;">
              <a href="${APP_URL}/dashboard/packages" class="button">
                ${t.buttonLabel}
              </a>
            </div>

            <p style="margin-top: 30px;">${t.apologyText}</p>

            <div class="footer">
              <p>${t.companyFooter}</p>
              <p>${t.automated}</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: userEmail, subject: t.subject, html });
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
  actionUrl?: string,
  locale: string = 'fr'
) => {
  const translations: Record<string, any> = {
    fr: {
      subject: `📢 ${title} - Alliance Shipping`,
      greeting: `Bonjour <strong>${userName}</strong>,`,
      thankYouText: 'Merci d\'être un client fidèle d\'Alliance Shipping !',
      companyFooter: 'Alliance Shipping - Expédition Fiable des USA vers Haïti',
      automated: 'Ceci est un message automatique, merci de ne pas répondre.',
    },
    en: {
      subject: `📢 ${title} - Alliance Shipping`,
      greeting: `Hello <strong>${userName}</strong>,`,
      thankYouText: 'Thank you for being a valued customer of Alliance Shipping!',
      companyFooter: 'Alliance Shipping - Reliable Shipping from USA to Haiti',
      automated: 'This is an automated message, please do not reply to this email.',
    },
    ht: {
      subject: `📢 ${title} - Alliance Shipping`,
      greeting: `Bonjou <strong>${userName}</strong>,`,
      thankYouText: 'Mèsi paske ou se yon kliyan fidèl Alliance Shipping !',
      companyFooter: 'Alliance Shipping - Livrezon Fyab soti nan USA pou ale an Ayiti',
      automated: 'Sa a se yon mesaj otomatik, tanpri pa reponn imèl sa a.',
    },
    es: {
      subject: `📢 ${title} - Alliance Shipping`,
      greeting: `Hola <strong>${userName}</strong>,`,
      thankYouText: '¡Gracias por ser un cliente valioso de Alliance Shipping!',
      companyFooter: 'Alliance Shipping - Envíos Confiables de USA a Haití',
      automated: 'Este es un mensaje automático, por favor no responda.',
    },
  };

  const t = translations[locale] || translations.fr;

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
            <p>${t.greeting}</p>

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

            <p style="margin-top: 30px;">${t.thankYouText}</p>

            <div class="footer">
              <p>${t.companyFooter}</p>
              <p>${t.automated}</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: userEmail, subject: t.subject, html });
};

// ============================================
// ACCOUNT & LIFECYCLE TEMPLATES
// ============================================

// Template: Welcome Email
export const sendWelcomeEmail = async (
  userEmail: string,
  userName: string,
  locale: string = 'fr'
) => {
  const translations: Record<string, any> = {
    fr: {
      subject: '🎉 Bienvenue chez Alliance Shipping !',
      headerTitle: '🎉 Bienvenue chez Alliance Shipping !',
      headerSubtitle: 'Nous sommes ravis de vous accueillir',
      greeting: `Bonjour <strong>${userName}</strong>,`,
      thankYouText: 'Merci d\'avoir choisi Alliance Shipping pour vos besoins d\'expédition entre les USA et Haïti !',
      getStartedTitle: '🚀 Commencez en 3 Étapes Simples :',
      step1: 'Soumettre une Demande de Colis',
      step1Detail: 'Dites-nous ce que vous expédiez',
      step2: 'Nous Vérifions et Approuvons',
      step2Detail: 'Recevez votre numéro de suivi sous 24 heures',
      step3: 'Suivez Votre Colis',
      step3Detail: 'Suivez votre colis des USA jusqu\'en Haïti',
      whatMakesUsTitle: '✨ Ce Qui Nous Distingue :',
      secureTitle: 'Expédition Sécurisée',
      secureText: 'Vos colis sont entièrement assurés et suivis',
      fastTitle: 'Livraison Rapide',
      fastText: 'Envois réguliers vers Haïti chaque semaine',
      pricingTitle: 'Tarifs Transparents',
      pricingText: 'Pas de frais cachés - $5 frais de service + $4/lb expédition',
      trackingTitle: 'Suivi en Temps Réel',
      trackingText: 'Suivez votre colis à chaque étape',
      locationsTitle: '📍 Nos Emplacements :',
      usaWarehouse: 'Entrepôt USA :',
      haitiOffices: 'Bureaux Haïti :',
      haitiOfficesText: 'Port-au-Prince, Cap-Haïtien, et plus',
      dashboardButton: 'Aller au Tableau de Bord',
      firstPackageButton: 'Envoyer Votre Premier Colis',
      proTipTitle: '💡 Astuce :',
      proTipText: 'Utilisez l\'adresse de notre entrepôt Miami lors de vos achats en ligne ! Nous recevrons vos colis et les expédierons directement en Haïti.',
      questionsText: 'Si vous avez des questions, notre équipe de support est là pour vous aider !',
      welcomeFamily: 'Bienvenue dans la famille Alliance Shipping ! 🎉',
      companyFooter: 'Alliance Shipping - Expédition Fiable des USA vers Haïti',
    },
    en: {
      subject: '🎉 Welcome to Alliance Shipping!',
      headerTitle: '🎉 Welcome to Alliance Shipping!',
      headerSubtitle: 'We\'re excited to have you on board',
      greeting: `Hello <strong>${userName}</strong>,`,
      thankYouText: 'Thank you for choosing Alliance Shipping for your shipping needs between USA and Haiti!',
      getStartedTitle: '🚀 Get Started in 3 Easy Steps:',
      step1: 'Submit a Package Request',
      step1Detail: 'Tell us what you\'re shipping',
      step2: 'We Review & Approve',
      step2Detail: 'Get your tracking number within 24 hours',
      step3: 'Track Your Package',
      step3Detail: 'Follow your package from USA to Haiti',
      whatMakesUsTitle: '✨ What Makes Us Special:',
      secureTitle: 'Secure Shipping',
      secureText: 'Your packages are fully insured and tracked',
      fastTitle: 'Fast Delivery',
      fastText: 'Regular shipments to Haiti every week',
      pricingTitle: 'Transparent Pricing',
      pricingText: 'No hidden fees - $5 service fee + $4/lb shipping',
      trackingTitle: 'Real-Time Tracking',
      trackingText: 'Track your package every step of the way',
      locationsTitle: '📍 Our Locations:',
      usaWarehouse: 'USA Warehouse:',
      haitiOffices: 'Haiti Offices:',
      haitiOfficesText: 'Port-au-Prince, Cap-Haïtien, and more',
      dashboardButton: 'Go to Dashboard',
      firstPackageButton: 'Send Your First Package',
      proTipTitle: '💡 Pro Tip:',
      proTipText: 'Use our Miami warehouse address when shopping online! We\'ll receive your packages and ship them directly to Haiti.',
      questionsText: 'If you have any questions, our support team is here to help!',
      welcomeFamily: 'Welcome to the Alliance Shipping family! 🎉',
      companyFooter: 'Alliance Shipping - Reliable Shipping from USA to Haiti',
    },
    ht: {
      subject: '🎉 Byenveni nan Alliance Shipping !',
      headerTitle: '🎉 Byenveni nan Alliance Shipping !',
      headerSubtitle: 'Nou kontan akèyi ou',
      greeting: `Bonjou <strong>${userName}</strong>,`,
      thankYouText: 'Mèsi paske ou chwazi Alliance Shipping pou bezwen livrezon ou ant USA ak Ayiti !',
      getStartedTitle: '🚀 Kòmanse an 3 Etap Fasil :',
      step1: 'Soumèt yon Demann Koli',
      step1Detail: 'Di nou kisa w ap voye',
      step2: 'Nou Verifye epi Apwouve',
      step2Detail: 'Resevwa nimewo tracking ou nan 24 èdtan',
      step3: 'Swiv Koli Ou',
      step3Detail: 'Swiv koli ou soti nan USA jouk an Ayiti',
      whatMakesUsTitle: '✨ Sa Ki Fè Nou Espesyal :',
      secureTitle: 'Livrezon Sekirize',
      secureText: 'Koli ou yo konplètman asire epi swiv',
      fastTitle: 'Livrezon Rapid',
      fastText: 'Anvwa regilye nan Ayiti chak semèn',
      pricingTitle: 'Tarif Transparan',
      pricingText: 'Pa gen frè kache - $5 frè sèvis + $4/lb livrezon',
      trackingTitle: 'Suivi an Tan Reyèl',
      trackingText: 'Swiv koli ou a chak etap',
      locationsTitle: '📍 Anplasman Nou Yo :',
      usaWarehouse: 'Depo USA :',
      haitiOffices: 'Biwo Ayiti :',
      haitiOfficesText: 'Pòtoprens, Okap, ak plis ankò',
      dashboardButton: 'Ale nan Tablo Bò',
      firstPackageButton: 'Voye Premye Koli Ou',
      proTipTitle: '💡 Konsèy :',
      proTipText: 'Itilize adrès depo Miami nou an lè w ap achte sou entènèt ! N ap resevwa koli ou yo epi voye yo dirèkteman an Ayiti.',
      questionsText: 'Si ou gen kesyon, ekip sipò nou la pou ede ou !',
      welcomeFamily: 'Byenveni nan fanmi Alliance Shipping ! 🎉',
      companyFooter: 'Alliance Shipping - Livrezon Fyab soti nan USA pou ale an Ayiti',
    },
    es: {
      subject: '🎉 ¡Bienvenido a Alliance Shipping!',
      headerTitle: '🎉 ¡Bienvenido a Alliance Shipping!',
      headerSubtitle: 'Estamos encantados de tenerle a bordo',
      greeting: `Hola <strong>${userName}</strong>,`,
      thankYouText: '¡Gracias por elegir Alliance Shipping para sus necesidades de envío entre USA y Haití!',
      getStartedTitle: '🚀 Comience en 3 Pasos Fáciles:',
      step1: 'Enviar una Solicitud de Paquete',
      step1Detail: 'Díganos qué está enviando',
      step2: 'Revisamos y Aprobamos',
      step2Detail: 'Reciba su número de seguimiento en 24 horas',
      step3: 'Rastree Su Paquete',
      step3Detail: 'Siga su paquete desde USA hasta Haití',
      whatMakesUsTitle: '✨ Lo Que Nos Hace Especiales:',
      secureTitle: 'Envío Seguro',
      secureText: 'Sus paquetes están completamente asegurados y rastreados',
      fastTitle: 'Entrega Rápida',
      fastText: 'Envíos regulares a Haití cada semana',
      pricingTitle: 'Precios Transparentes',
      pricingText: 'Sin tarifas ocultas - $5 tarifa de servicio + $4/lb envío',
      trackingTitle: 'Seguimiento en Tiempo Real',
      trackingText: 'Rastree su paquete en cada paso',
      locationsTitle: '📍 Nuestras Ubicaciones:',
      usaWarehouse: 'Almacén USA:',
      haitiOffices: 'Oficinas Haití:',
      haitiOfficesText: 'Port-au-Prince, Cap-Haïtien, y más',
      dashboardButton: 'Ir al Panel',
      firstPackageButton: 'Enviar Su Primer Paquete',
      proTipTitle: '💡 Consejo:',
      proTipText: '¡Use la dirección de nuestro almacén en Miami al comprar en línea! Recibiremos sus paquetes y los enviaremos directamente a Haití.',
      questionsText: '¡Si tiene alguna pregunta, nuestro equipo de soporte está aquí para ayudarle!',
      welcomeFamily: '¡Bienvenido a la familia Alliance Shipping! 🎉',
      companyFooter: 'Alliance Shipping - Envíos Confiables de USA a Haití',
    },
  };

  const t = translations[locale] || translations.fr;

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
            <h1 style="font-size: 32px; margin: 0;">${t.headerTitle}</h1>
            <p style="font-size: 18px; margin-top: 10px;">${t.headerSubtitle}</p>
          </div>
          <div class="content">
            <p style="font-size: 18px;">${t.greeting}</p>
            <p>${t.thankYouText}</p>

            <div class="card">
              <h3>${t.getStartedTitle}</h3>
              <ol style="line-height: 2;">
                <li><strong>${t.step1}</strong> - ${t.step1Detail}</li>
                <li><strong>${t.step2}</strong> - ${t.step2Detail}</li>
                <li><strong>${t.step3}</strong> - ${t.step3Detail}</li>
              </ol>
            </div>

            <div class="card">
              <h3>${t.whatMakesUsTitle}</h3>
              <div class="feature">
                <div class="feature-icon">🔒</div>
                <div>
                  <strong>${t.secureTitle}</strong><br>
                  ${t.secureText}
                </div>
              </div>
              <div class="feature">
                <div class="feature-icon">⚡</div>
                <div>
                  <strong>${t.fastTitle}</strong><br>
                  ${t.fastText}
                </div>
              </div>
              <div class="feature">
                <div class="feature-icon">💰</div>
                <div>
                  <strong>${t.pricingTitle}</strong><br>
                  ${t.pricingText}
                </div>
              </div>
              <div class="feature">
                <div class="feature-icon">📱</div>
                <div>
                  <strong>${t.trackingTitle}</strong><br>
                  ${t.trackingText}
                </div>
              </div>
            </div>

            <div class="card">
              <h3>${t.locationsTitle}</h3>
              <p><strong>${t.usaWarehouse}</strong> Miami, Florida</p>
              <p><strong>${t.haitiOffices}</strong> ${t.haitiOfficesText}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${APP_URL}/dashboard" class="button">
                ${t.dashboardButton}
              </a>
              <a href="${APP_URL}/dashboard/packages/new" class="button" style="background: #10b981;">
                ${t.firstPackageButton}
              </a>
            </div>

            <div class="card" style="background: #f0fdf4;">
              <h3>${t.proTipTitle}</h3>
              <p>${t.proTipText}</p>
            </div>

            <p style="margin-top: 30px;">${t.questionsText}</p>
            <p>
              📞 <strong>Phone:</strong> +509 4881-2652<br>
              📧 <strong>Email:</strong> allianceshipping26@gmail.com<br>
              💬 <strong>WhatsApp:</strong> +509 4881 26-52
            </p>

            <div class="footer">
              <p style="font-size: 16px; color: #667eea; font-weight: bold;">${t.welcomeFamily}</p>
              <p>${t.companyFooter}</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: userEmail, subject: t.subject, html });
};

// Template: Feedback Request
export const sendFeedbackRequestEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string,
  locale: string = 'fr'
) => {
  const translations: Record<string, any> = {
    fr: {
      subject: '⭐ Comment était votre expérience ? - Alliance Shipping',
      headerTitle: 'Comment était votre expérience ?',
      greeting: `Bonjour <strong>${userName}</strong>,`,
      deliveredText: 'Votre colis a été livré ! Nous espérons que tout s\'est bien passé.',
      deliveredPackageLabel: 'Colis Livré :',
      loveToHearTitle: 'Nous aimerions avoir votre avis !',
      feedbackHelps: 'Vos commentaires nous aident à améliorer notre service et à mieux vous servir.',
      rateQuestion: 'Comment évalueriez-vous votre expérience avec Alliance Shipping ?',
      quickQuestionsTitle: 'Questions Rapides :',
      q1: 'Votre colis a-t-il été livré à temps ?',
      q2: 'Votre colis était-il en bon état ?',
      q3: 'Comment était l\'expérience de suivi ?',
      q4: 'Comment évaluez-vous notre service client ?',
      q5: 'Nous recommanderiez-vous à d\'autres ?',
      rateExpLabel: 'Évaluez Votre Expérience :',
      excellentLabel: '⭐⭐⭐⭐⭐ Excellent',
      detailedFeedbackLink: 'Laisser un avis détaillé →',
      thankYouText: 'Merci d\'avoir choisi Alliance Shipping !',
      companyFooter: 'Alliance Shipping - Expédition Fiable des USA vers Haïti',
      automated: 'Ceci est un message automatique, merci de ne pas répondre.',
    },
    en: {
      subject: '⭐ How was your experience? - Alliance Shipping',
      headerTitle: 'How was your experience?',
      greeting: `Hello <strong>${userName}</strong>,`,
      deliveredText: 'Your package has been delivered! We hope everything went smoothly.',
      deliveredPackageLabel: 'Delivered Package:',
      loveToHearTitle: 'We\'d love to hear from you!',
      feedbackHelps: 'Your feedback helps us improve our service and serve you better.',
      rateQuestion: 'How would you rate your experience with Alliance Shipping?',
      quickQuestionsTitle: 'Quick Questions:',
      q1: 'Was your package delivered on time?',
      q2: 'Was your package in good condition?',
      q3: 'How was the tracking experience?',
      q4: 'How would you rate our customer service?',
      q5: 'Would you recommend us to others?',
      rateExpLabel: 'Rate Your Experience:',
      excellentLabel: '⭐⭐⭐⭐⭐ Excellent',
      detailedFeedbackLink: 'Leave detailed feedback →',
      thankYouText: 'Thank you for choosing Alliance Shipping!',
      companyFooter: 'Alliance Shipping - Reliable Shipping from USA to Haiti',
      automated: 'This is an automated message, please do not reply to this email.',
    },
    ht: {
      subject: '⭐ Kijan eksperyans ou te ye ? - Alliance Shipping',
      headerTitle: 'Kijan eksperyans ou te ye ?',
      greeting: `Bonjou <strong>${userName}</strong>,`,
      deliveredText: 'Koli ou livré ! Nou espere tout te pase byen.',
      deliveredPackageLabel: 'Koli Livre :',
      loveToHearTitle: 'Nou ta renmen tande opinyon ou !',
      feedbackHelps: 'Kòmantè ou yo ede nou amelyore sèvis nou epi sèvi ou pi byen.',
      rateQuestion: 'Kijan ou ta evalye eksperyans ou ak Alliance Shipping ?',
      quickQuestionsTitle: 'Kesyon Rapid :',
      q1: 'Èske koli ou te livre alè ?',
      q2: 'Èske koli ou te nan bon eta ?',
      q3: 'Kijan eksperyans suivi a te ye ?',
      q4: 'Kijan ou evalye sèvis kliyan nou ?',
      q5: 'Èske ou ta rekòmande nou bay lòt moun ?',
      rateExpLabel: 'Evalye Eksperyans Ou :',
      excellentLabel: '⭐⭐⭐⭐⭐ Ekselan',
      detailedFeedbackLink: 'Bay yon kòmantè detaye →',
      thankYouText: 'Mèsi paske ou chwazi Alliance Shipping !',
      companyFooter: 'Alliance Shipping - Livrezon Fyab soti nan USA pou ale an Ayiti',
      automated: 'Sa a se yon mesaj otomatik, tanpri pa reponn imèl sa a.',
    },
    es: {
      subject: '⭐ ¿Cómo fue su experiencia? - Alliance Shipping',
      headerTitle: '¿Cómo fue su experiencia?',
      greeting: `Hola <strong>${userName}</strong>,`,
      deliveredText: '¡Su paquete ha sido entregado! Esperamos que todo haya ido bien.',
      deliveredPackageLabel: 'Paquete Entregado:',
      loveToHearTitle: '¡Nos encantaría saber de usted!',
      feedbackHelps: 'Sus comentarios nos ayudan a mejorar nuestro servicio y atenderle mejor.',
      rateQuestion: '¿Cómo calificaría su experiencia con Alliance Shipping?',
      quickQuestionsTitle: 'Preguntas Rápidas:',
      q1: '¿Su paquete fue entregado a tiempo?',
      q2: '¿Su paquete estaba en buenas condiciones?',
      q3: '¿Cómo fue la experiencia de seguimiento?',
      q4: '¿Cómo calificaría nuestro servicio al cliente?',
      q5: '¿Nos recomendaría a otros?',
      rateExpLabel: 'Califique Su Experiencia:',
      excellentLabel: '⭐⭐⭐⭐⭐ Excelente',
      detailedFeedbackLink: 'Dejar comentarios detallados →',
      thankYouText: '¡Gracias por elegir Alliance Shipping!',
      companyFooter: 'Alliance Shipping - Envíos Confiables de USA a Haití',
      automated: 'Este es un mensaje automático, por favor no responda.',
    },
  };

  const t = translations[locale] || translations.fr;

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
          .rating-button { padding: 15px 25px; background: #fbbf24; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="stars">⭐⭐⭐⭐⭐</div>
            <h1>${t.headerTitle}</h1>
          </div>
          <div class="content">
            <p>${t.greeting}</p>
            <p>${t.deliveredText}</p>

            <div class="card">
              <h3>${t.deliveredPackageLabel}</h3>
              <div class="tracking">${trackingNumber}</div>
            </div>

            <div class="card">
              <h3>${t.loveToHearTitle}</h3>
              <p>${t.feedbackHelps}</p>
              <p>${t.rateQuestion}</p>
            </div>

            <div class="card" style="text-align: center;">
              <h3>${t.quickQuestionsTitle}</h3>
              <ul style="text-align: left; line-height: 2;">
                <li>${t.q1}</li>
                <li>${t.q2}</li>
                <li>${t.q3}</li>
                <li>${t.q4}</li>
                <li>${t.q5}</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <p style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">${t.rateExpLabel}</p>
              <a href="${APP_URL}/feedback?package=${trackingNumber}&rating=5" class="rating-button">
                ${t.excellentLabel}
              </a>
            </div>

            <p style="text-align: center; margin-top: 20px;">
              <a href="${APP_URL}/feedback?package=${trackingNumber}" style="color: #667eea;">${t.detailedFeedbackLink}</a>
            </p>

            <p style="margin-top: 30px; text-align: center;">${t.thankYouText}</p>

            <div class="footer">
              <p>${t.companyFooter}</p>
              <p>${t.automated}</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: userEmail, subject: t.subject, html });
};

// Template: Package Reminder
export const sendPackageReminderEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string,
  status: string,
  daysWaiting: number,
  locale: string = 'fr'
) => {
  const translations: Record<string, any> = {
    fr: {
      subject: '🔔 Rappel Statut du Colis - Alliance Shipping',
      headerTitle: '🔔 Rappel Statut du Colis',
      greeting: `Bonjour <strong>${userName}</strong>,`,
      reminderText: 'Juste un petit rappel concernant votre colis !',
      trackingLabel: 'Numéro de Suivi :',
      statusLabel: 'Statut Actuel :',
      daysText: `${daysWaiting} jours`,
      daysExplain: 'Votre colis est dans ce statut depuis',
      pickupReadyTitle: '⚠️ Votre Colis est Prêt à Retirer !',
      pickupReadyText: 'Votre colis est en attente de retrait. Veuillez vous rendre à notre bureau pour le récupérer dès que possible.',
      pickupLocationLabel: 'Lieu de Retrait :',
      pickupLocationText: 'Bureau Haïti',
      hoursLabel: 'Horaires :',
      hoursText: 'Lundi-Vendredi 8h00 - 17h00, Samedi 9h00 - 14h00',
      buttonLabel: 'Vérifier le Statut du Colis',
      questionsText: 'Si vous avez des questions, n\'hésitez pas à nous contacter.',
      companyFooter: 'Alliance Shipping - Expédition Fiable des USA vers Haïti',
      automated: 'Ceci est un message automatique, merci de ne pas répondre.',
    },
    en: {
      subject: '🔔 Package Status Reminder - Alliance Shipping',
      headerTitle: '🔔 Package Status Reminder',
      greeting: `Hello <strong>${userName}</strong>,`,
      reminderText: 'Just a friendly reminder about your package!',
      trackingLabel: 'Tracking Number:',
      statusLabel: 'Current Status:',
      daysText: `${daysWaiting} days`,
      daysExplain: 'Your package has been in this status',
      pickupReadyTitle: '⚠️ Your Package is Ready for Pickup!',
      pickupReadyText: 'Your package has been waiting for pickup. Please visit our office to collect it at your earliest convenience.',
      pickupLocationLabel: 'Pickup Location:',
      pickupLocationText: 'Haiti Office',
      hoursLabel: 'Hours:',
      hoursText: 'Monday-Friday 8:00 AM - 5:00 PM, Saturday 9:00 AM - 2:00 PM',
      buttonLabel: 'Check Package Status',
      questionsText: 'If you have any questions, please don\'t hesitate to contact us.',
      companyFooter: 'Alliance Shipping - Reliable Shipping from USA to Haiti',
      automated: 'This is an automated message, please do not reply to this email.',
    },
    ht: {
      subject: '🔔 Rapèl Estati Koli - Alliance Shipping',
      headerTitle: '🔔 Rapèl Estati Koli',
      greeting: `Bonjou <strong>${userName}</strong>,`,
      reminderText: 'Jis yon ti rapèl konsènan koli ou !',
      trackingLabel: 'Nimewo Tracking :',
      statusLabel: 'Estati Aktyèl :',
      daysText: `${daysWaiting} jou`,
      daysExplain: 'Koli ou nan estati sa a depi',
      pickupReadyTitle: '⚠️ Koli Ou Pare pou Ranmase !',
      pickupReadyText: 'Koli ou ap tann pou yo ranmase li. Tanpri vizite biwo nou pou vin pran li pi vit posib.',
      pickupLocationLabel: 'Kote pou Ranmase :',
      pickupLocationText: 'Biwo Ayiti',
      hoursLabel: 'Orè :',
      hoursText: 'Lendi-Vandredi 8è AM - 5è PM, Samdi 9è AM - 2è PM',
      buttonLabel: 'Tcheke Estati Koli',
      questionsText: 'Si ou gen kesyon, pa ezite kontakte nou.',
      companyFooter: 'Alliance Shipping - Livrezon Fyab soti nan USA pou ale an Ayiti',
      automated: 'Sa a se yon mesaj otomatik, tanpri pa reponn imèl sa a.',
    },
    es: {
      subject: '🔔 Recordatorio de Estado del Paquete - Alliance Shipping',
      headerTitle: '🔔 Recordatorio de Estado del Paquete',
      greeting: `Hola <strong>${userName}</strong>,`,
      reminderText: '¡Solo un recordatorio amigable sobre su paquete!',
      trackingLabel: 'Número de Seguimiento:',
      statusLabel: 'Estado Actual:',
      daysText: `${daysWaiting} días`,
      daysExplain: 'Su paquete ha estado en este estado',
      pickupReadyTitle: '⚠️ ¡Su Paquete Está Listo para Recoger!',
      pickupReadyText: 'Su paquete está esperando para ser recogido. Por favor visite nuestra oficina para recogerlo lo antes posible.',
      pickupLocationLabel: 'Lugar de Recogida:',
      pickupLocationText: 'Oficina Haití',
      hoursLabel: 'Horario:',
      hoursText: 'Lunes-Viernes 8:00 AM - 5:00 PM, Sábado 9:00 AM - 2:00 PM',
      buttonLabel: 'Verificar Estado del Paquete',
      questionsText: 'Si tiene alguna pregunta, no dude en contactarnos.',
      companyFooter: 'Alliance Shipping - Envíos Confiables de USA a Haití',
      automated: 'Este es un mensaje automático, por favor no responda.',
    },
  };

  const t = translations[locale] || translations.fr;

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
            <h1>${t.headerTitle}</h1>
          </div>
          <div class="content">
            <p>${t.greeting}</p>
            <p>${t.reminderText}</p>

            <div class="card">
              <h3>${t.trackingLabel}</h3>
              <div class="tracking">${trackingNumber}</div>
            </div>

            <div class="card" style="text-align: center;">
              <h3>${t.statusLabel}</h3>
              <span class="status-badge">${status.toUpperCase()}</span>
              <div class="days-waiting">${t.daysText}</div>
              <p style="color: #6b7280;">${t.daysExplain}</p>
            </div>

            ${status === 'available' ? `
            <div class="card" style="background: #fef3c7;">
              <h3>${t.pickupReadyTitle}</h3>
              <p>${t.pickupReadyText}</p>
              <p><strong>${t.pickupLocationLabel}</strong> ${t.pickupLocationText}</p>
              <p><strong>${t.hoursLabel}</strong> ${t.hoursText}</p>
            </div>
            ` : ''}

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

  return sendEmail({ to: userEmail, subject: t.subject, html });
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

// ==================== BUNDLE CANCELLED EMAIL ====================

export const sendBundleCancelledEmail = async (
  userEmail: string,
  userName: string,
  trackingNumbers: string[],
  locale: string = 'fr'
) => {
  const count = trackingNumbers.length;
  const trackingList = trackingNumbers.join(', ');

  const translations: Record<string, any> = {
    fr: {
      subject: `📦 Livraison Bundle Annulée — ${count} colis - Alliance Shipping`,
      headerTitle: 'Livraison Bundle Annulée',
      greeting: `Bonjour <strong>${userName}</strong>,`,
      message: `Votre livraison bundle de <strong>${count} colis</strong> a été annulée. Vos colis sont de retour au statut <strong>"Disponible"</strong> et peuvent être récupérés individuellement.`,
      packagesTitle: 'Colis Concernés :',
      whatHappensTitle: 'Que se passe-t-il maintenant ?',
      bullet1: 'Vos colis sont de nouveau disponibles au retrait',
      bullet2: 'Les frais de service originaux ont été restaurés sur chaque colis',
      bullet3: 'Les points de fidélité du bundle ont été annulés',
      bullet4: 'Vous pouvez venir récupérer vos colis individuellement ou demander un nouveau bundle',
      questionsText: 'Si vous avez des questions, n\'hésitez pas à nous contacter.',
      buttonLabel: 'Voir Mes Colis',
      companyFooter: 'Alliance Shipping - Expédition Fiable des USA vers Haïti',
      automated: 'Ceci est un message automatique, merci de ne pas répondre.',
    },
    en: {
      subject: `📦 Bundle Delivery Cancelled — ${count} packages - Alliance Shipping`,
      headerTitle: 'Bundle Delivery Cancelled',
      greeting: `Hello <strong>${userName}</strong>,`,
      message: `Your bundle delivery of <strong>${count} packages</strong> has been cancelled. Your packages are back to <strong>"Available"</strong> status and can be picked up individually.`,
      packagesTitle: 'Affected Packages:',
      whatHappensTitle: 'What happens now?',
      bullet1: 'Your packages are available for pickup again',
      bullet2: 'Original service fees have been restored on each package',
      bullet3: 'Bundle loyalty points have been reversed',
      bullet4: 'You can pick up your packages individually or request a new bundle',
      questionsText: 'If you have any questions, please don\'t hesitate to contact us.',
      buttonLabel: 'View My Packages',
      companyFooter: 'Alliance Shipping - Reliable Shipping from USA to Haiti',
      automated: 'This is an automated message, please do not reply to this email.',
    },
    ht: {
      subject: `📦 Livrezon Bundle Anile — ${count} kolis - Alliance Shipping`,
      headerTitle: 'Livrezon Bundle Anile',
      greeting: `Bonjou <strong>${userName}</strong>,`,
      message: `Livrezon bundle <strong>${count} kolis</strong> ou yo anile. Kolis ou yo retounen nan estati <strong>"Disponib"</strong> epi ou ka vin pran yo endividyèlman.`,
      packagesTitle: 'Kolis Konsène :',
      whatHappensTitle: 'Kisa ki pase kounye a ?',
      bullet1: 'Kolis ou yo disponib pou ranmase ankò',
      bullet2: 'Frè sèvis orijinal yo restore sou chak koli',
      bullet3: 'Pwen fidelite bundle yo anile',
      bullet4: 'Ou ka vin pran kolis ou yo endividyèlman oswa mande yon nouvo bundle',
      questionsText: 'Si ou gen kesyon, pa ezite kontakte nou.',
      buttonLabel: 'Wè Kolis Mwen Yo',
      companyFooter: 'Alliance Shipping - Livrezon Fyab soti nan USA pou ale an Ayiti',
      automated: 'Sa a se yon mesaj otomatik, tanpri pa reponn imèl sa a.',
    },
    es: {
      subject: `📦 Entrega Bundle Cancelada — ${count} paquetes - Alliance Shipping`,
      headerTitle: 'Entrega Bundle Cancelada',
      greeting: `Hola <strong>${userName}</strong>,`,
      message: `Su entrega bundle de <strong>${count} paquetes</strong> ha sido cancelada. Sus paquetes volvieron al estado <strong>"Disponible"</strong> y pueden ser recogidos individualmente.`,
      packagesTitle: 'Paquetes Afectados:',
      whatHappensTitle: '¿Qué sucede ahora?',
      bullet1: 'Sus paquetes están disponibles para recoger nuevamente',
      bullet2: 'Las tarifas de servicio originales han sido restauradas en cada paquete',
      bullet3: 'Los puntos de fidelidad del bundle han sido revertidos',
      bullet4: 'Puede recoger sus paquetes individualmente o solicitar un nuevo bundle',
      questionsText: 'Si tiene alguna pregunta, no dude en contactarnos.',
      buttonLabel: 'Ver Mis Paquetes',
      companyFooter: 'Alliance Shipping - Envíos Confiables de USA a Haití',
      automated: 'Este es un mensaje automático, por favor no responda.',
    },
  };

  const t = translations[locale] || translations.fr;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const trackingItems = trackingNumbers.map(tn =>
    `<li style="padding: 4px 0; font-family: monospace; font-weight: 600;">${tn}</li>`
  ).join('');

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
          .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 ${t.headerTitle}</h1>
          </div>
          <div class="content">
            <p>${t.greeting}</p>

            <div class="alert-box">
              <p>${t.message}</p>
            </div>

            <div class="card">
              <h3>${t.packagesTitle}</h3>
              <ul>${trackingItems}</ul>
            </div>

            <div class="card">
              <h3>${t.whatHappensTitle}</h3>
              <ul style="line-height: 2;">
                <li>${t.bullet1}</li>
                <li>${t.bullet2}</li>
                <li>${t.bullet3}</li>
                <li>${t.bullet4}</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${appUrl}/dashboard/packages" class="button">
                ${t.buttonLabel}
              </a>
            </div>

            <p>${t.questionsText}</p>
            <p>
              📞 <strong>Phone:</strong> (+509) 4881-2652<br>
              📧 <strong>Email:</strong> allianceshipping26@gmail.com
            </p>

            <div class="footer">
              <p>${t.companyFooter}</p>
              <p>${t.automated}</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: userEmail, subject: t.subject, html });
};

// ==================== BUNDLE AVAILABLE EMAIL ====================

export const sendBundleAvailableEmail = async (
  userEmail: string,
  userName: string,
  trackingNumbers: string[],
  potentialSavings: number,
  depotName: string,
  depotAddress: string,
  locale: string = 'fr'
) => {
  const count = trackingNumbers.length;

  const translations: Record<string, any> = {
    fr: {
      subject: `\u{1F4E6} ${count} colis pr\u00EAts \u2014 \u00C9conomisez $${potentialSavings.toFixed(2)} avec un Bundle ! - Alliance Shipping`,
      headerTitle: 'Vos Colis Sont Pr\u00EAts !',
      headerSub: count + ' colis disponibles au retrait',
      greeting: 'Bonjour <strong>' + userName + '</strong>,',
      message: 'Vous avez <strong>' + count + ' colis</strong> disponibles pour le retrait. En les r\u00E9cup\u00E9rant ensemble avec notre <strong>Livraison Bundle</strong>, vous ne payez qu\'<strong>un seul frais de service</strong> au lieu de ' + count + ' !',
      savingsTitle: 'Votre \u00C9conomie Bundle',
      savingsLabel: '\u00C9conomie estim\u00E9e :',
      insteadOf: 'Au lieu de payer ' + count + ' frais de service s\u00E9par\u00E9s',
      packagesTitle: 'Vos Colis Disponibles :',
      depotTitle: 'Lieu de Retrait',
      depotLabel: 'D\u00E9p\u00F4t :',
      addressLabel: 'Adresse :',
      hoursLabel: 'Horaires :',
      hoursValue: 'Lun-Sam : 8h00 - 17h00',
      ctaTitle: 'Comment \u00E7a marche ?',
      step1: 'Rendez-vous \u00E0 notre d\u00E9p\u00F4t',
      step2: 'Demandez la livraison Bundle',
      step3: 'Payez un seul frais de service pour tous vos colis',
      buttonLabel: 'Voir Mes Colis',
      questionsText: 'Des questions ? Contactez-nous !',
      companyFooter: 'Alliance Shipping - Exp\u00E9dition Fiable des USA vers Ha\u00EFti',
      automated: 'Ceci est un message automatique, merci de ne pas r\u00E9pondre.',
    },
    en: {
      subject: '\u{1F4E6} ' + count + ' packages ready \u2014 Save $' + potentialSavings.toFixed(2) + ' with Bundle! - Alliance Shipping',
      headerTitle: 'Your Packages Are Ready!',
      headerSub: count + ' packages available for pickup',
      greeting: 'Hello <strong>' + userName + '</strong>,',
      message: 'You have <strong>' + count + ' packages</strong> available for pickup. Pick them up together with our <strong>Bundle Delivery</strong> and pay only <strong>one service fee</strong> instead of ' + count + '!',
      savingsTitle: 'Your Bundle Savings',
      savingsLabel: 'Estimated savings:',
      insteadOf: 'Instead of paying ' + count + ' separate service fees',
      packagesTitle: 'Your Available Packages:',
      depotTitle: 'Pickup Location',
      depotLabel: 'Depot:',
      addressLabel: 'Address:',
      hoursLabel: 'Hours:',
      hoursValue: 'Mon-Sat: 8:00 AM - 5:00 PM',
      ctaTitle: 'How does it work?',
      step1: 'Visit our depot',
      step2: 'Request a Bundle Delivery',
      step3: 'Pay just one service fee for all your packages',
      buttonLabel: 'View My Packages',
      questionsText: 'Questions? Contact us!',
      companyFooter: 'Alliance Shipping - Reliable Shipping from USA to Haiti',
      automated: 'This is an automated message, please do not reply.',
    },
    ht: {
      subject: '\u{1F4E6} ' + count + ' kolis pare \u2014 Ekonomize $' + potentialSavings.toFixed(2) + ' ak Bundle ! - Alliance Shipping',
      headerTitle: 'Kolis Ou Yo Pare !',
      headerSub: count + ' kolis disponib pou ranmase',
      greeting: 'Bonjou <strong>' + userName + '</strong>,',
      message: 'Ou gen <strong>' + count + ' kolis</strong> disponib pou ranmase. Pran yo ansanm ak <strong>Livrezon Bundle</strong> nou an epi peye s\u00E8lman <strong>yon s\u00E8l fr\u00E8 s\u00E8vis</strong> olye de ' + count + ' !',
      savingsTitle: 'Ekonomi Bundle Ou',
      savingsLabel: 'Ekonomi estime :',
      insteadOf: 'Olye de peye ' + count + ' fr\u00E8 s\u00E8vis separe',
      packagesTitle: 'Kolis Disponib Ou Yo :',
      depotTitle: 'Kote pou Ranmase',
      depotLabel: 'Depo :',
      addressLabel: 'Adr\u00E8s :',
      hoursLabel: 'L\u00E8 :',
      hoursValue: 'Lendi-Samdi : 8\u00E8 AM - 5\u00E8 PM',
      ctaTitle: 'Kijan sa fonksyone ?',
      step1: 'Vizite depo nou an',
      step2: 'Mande yon Livrezon Bundle',
      step3: 'Peye yon s\u00E8l fr\u00E8 s\u00E8vis pou tout kolis ou yo',
      buttonLabel: 'W\u00E8 Kolis Mwen Yo',
      questionsText: 'Kesyon ? Kontakte nou !',
      companyFooter: 'Alliance Shipping - Livrezon Fyab soti nan USA pou ale an Ayiti',
      automated: 'Sa a se yon mesaj otomatik, tanpri pa reponn.',
    },
    es: {
      subject: '\u{1F4E6} ' + count + ' paquetes listos \u2014 \u00A1Ahorre $' + potentialSavings.toFixed(2) + ' con Bundle! - Alliance Shipping',
      headerTitle: '\u00A1Sus Paquetes Est\u00E1n Listos!',
      headerSub: count + ' paquetes disponibles para recoger',
      greeting: 'Hola <strong>' + userName + '</strong>,',
      message: 'Tiene <strong>' + count + ' paquetes</strong> disponibles para recoger. Rec\u00F3jalos juntos con nuestra <strong>Entrega Bundle</strong> y pague solo <strong>una tarifa de servicio</strong> en vez de ' + count + '!',
      savingsTitle: 'Su Ahorro Bundle',
      savingsLabel: 'Ahorro estimado:',
      insteadOf: 'En vez de pagar ' + count + ' tarifas de servicio separadas',
      packagesTitle: 'Sus Paquetes Disponibles:',
      depotTitle: 'Lugar de Recogida',
      depotLabel: 'Dep\u00F3sito:',
      addressLabel: 'Direcci\u00F3n:',
      hoursLabel: 'Horario:',
      hoursValue: 'Lun-S\u00E1b: 8:00 AM - 5:00 PM',
      ctaTitle: '\u00BFC\u00F3mo funciona?',
      step1: 'Visite nuestro dep\u00F3sito',
      step2: 'Solicite una Entrega Bundle',
      step3: 'Pague solo una tarifa de servicio por todos sus paquetes',
      buttonLabel: 'Ver Mis Paquetes',
      questionsText: '\u00BFPreguntas? \u00A1Cont\u00E1ctenos!',
      companyFooter: 'Alliance Shipping - Env\u00EDos Confiables de USA a Hait\u00ED',
      automated: 'Este es un mensaje autom\u00E1tico, por favor no responda.',
    },
  };

  const t = translations[locale] || translations.fr;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const trackingItems = trackingNumbers.map(tn =>
    '<li style="padding:4px 0;font-family:monospace;font-weight:600;">' + tn + '</li>'
  ).join('');

  const html = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>'
    + 'body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;line-height:1.6;color:#1f2937;margin:0;padding:0;background:#f3f4f6;}'
    + '.wrapper{padding:20px;}.container{max-width:600px;margin:0 auto;}'
    + '.header{background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:white;padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;}'
    + '.header h1{margin:0;font-size:22px;}.header p{margin:8px 0 0;opacity:0.9;font-size:14px;}'
    + '.content{background:#fff;padding:32px 24px;border-radius:0 0 12px 12px;}'
    + '.card{background:#f9fafb;padding:20px;border-radius:10px;margin:20px 0;border:1px solid #e5e7eb;}'
    + '.savings-card{background:linear-gradient(135deg,#ecfdf5,#d1fae5);padding:24px;border-radius:10px;margin:20px 0;border:2px solid #86efac;text-align:center;}'
    + '.btn-container{text-align:center;margin:24px 0;}'
    + '.button{display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:#ffffff !important;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;}'
    + '.footer{text-align:center;padding:24px;color:#9ca3af;font-size:12px;}'
    + '</style></head><body><div class="wrapper"><div class="container">'
    + '<div class="header"><h1>\u{1F4E6}\u2728 ' + t.headerTitle + '</h1><p>' + t.headerSub + '</p></div>'
    + '<div class="content">'
    + '<p>' + t.greeting + '</p>'
    + '<p>' + t.message + '</p>'
    + '<div class="savings-card">'
    + '<h3 style="color:#065f46;margin:0 0 8px;">\u{1F389} ' + t.savingsTitle + '</h3>'
    + '<p style="font-size:36px;font-weight:800;color:#059669;margin:8px 0;">-$' + potentialSavings.toFixed(2) + '</p>'
    + '<p style="color:#065f46;font-size:13px;margin:4px 0;">' + t.savingsLabel + '</p>'
    + '<p style="color:#6b7280;font-size:12px;margin:4px 0;">' + t.insteadOf + '</p>'
    + '</div>'
    + '<div class="card"><h3>' + t.packagesTitle + '</h3><ul style="margin:0;padding-left:20px;">' + trackingItems + '</ul></div>'
    + '<div class="card">'
    + '<h3>\u{1F4CD} ' + t.depotTitle + '</h3>'
    + '<p style="margin:4px 0;"><strong>' + t.depotLabel + '</strong> ' + depotName + '</p>'
    + '<p style="margin:4px 0;"><strong>' + t.addressLabel + '</strong> ' + depotAddress + '</p>'
    + '<p style="margin:4px 0;"><strong>' + t.hoursLabel + '</strong> ' + t.hoursValue + '</p>'
    + '</div>'
    + '<div class="card">'
    + '<h3>\u{1F4A1} ' + t.ctaTitle + '</h3>'
    + '<p style="margin:6px 0;">1\uFE0F\u20E3 ' + t.step1 + '</p>'
    + '<p style="margin:6px 0;">2\uFE0F\u20E3 ' + t.step2 + '</p>'
    + '<p style="margin:6px 0;">3\uFE0F\u20E3 ' + t.step3 + '</p>'
    + '</div>'
    + '<div class="btn-container"><a href="' + appUrl + '/dashboard/packages" class="button">' + t.buttonLabel + '</a></div>'
    + '<p style="color:#6b7280;font-size:14px;">' + t.questionsText + '</p>'
    + '<p style="font-size:14px;">\u{1F4DE} <strong>Phone:</strong> (+509) 4881-2652<br>\u{1F4E7} <strong>Email:</strong> allianceshipping26@gmail.com</p>'
    + '</div>'
    + '<div class="footer"><p><strong>' + t.companyFooter + '</strong></p><p>' + t.automated + '</p></div>'
    + '</div></div></body></html>';

  return sendEmail({ to: userEmail, subject: t.subject, html });
};

// ==================== BUNDLE REMINDER EMAIL ====================

export const sendBundleReminderEmail = async (
  userEmail: string,
  userName: string,
  trackingNumbers: string[],
  potentialSavings: number,
  daysSinceAvailable: number,
  depotName: string,
  locale: string = 'fr'
) => {
  const count = trackingNumbers.length;

  const translations: Record<string, any> = {
    fr: {
      subject: '\u23F0 Rappel : ' + count + ' colis vous attendent \u2014 \u00C9conomisez avec le Bundle ! - Alliance Shipping',
      headerTitle: 'Vos Colis Vous Attendent !',
      headerSub: 'Depuis ' + daysSinceAvailable + ' jours',
      greeting: 'Bonjour <strong>' + userName + '</strong>,',
      message: 'Vos <strong>' + count + ' colis</strong> sont disponibles au retrait depuis <strong>' + daysSinceAvailable + ' jours</strong> \u00E0 notre d\u00E9p\u00F4t <strong>' + depotName + '</strong>. N\'oubliez pas de venir les r\u00E9cup\u00E9rer !',
      bundleTip: 'Astuce Bundle',
      bundleMessage: 'En r\u00E9cup\u00E9rant vos ' + count + ' colis ensemble, vous ne payez qu\'<strong>un seul frais de service</strong> et \u00E9conomisez <strong>$' + potentialSavings.toFixed(2) + '</strong> !',
      packagesTitle: 'Colis en Attente :',
      urgentTitle: 'Important',
      urgentMessage: 'Nous vous recommandons de r\u00E9cup\u00E9rer vos colis d\u00E8s que possible pour \u00E9viter tout encombrement \u00E0 notre entrep\u00F4t.',
      buttonLabel: 'Voir Mes Colis',
      questionsText: 'Des questions ? Contactez-nous !',
      companyFooter: 'Alliance Shipping - Exp\u00E9dition Fiable des USA vers Ha\u00EFti',
      automated: 'Ceci est un message automatique, merci de ne pas r\u00E9pondre.',
    },
    en: {
      subject: '\u23F0 Reminder: ' + count + ' packages waiting \u2014 Save with Bundle! - Alliance Shipping',
      headerTitle: 'Your Packages Are Waiting!',
      headerSub: 'For ' + daysSinceAvailable + ' days',
      greeting: 'Hello <strong>' + userName + '</strong>,',
      message: 'Your <strong>' + count + ' packages</strong> have been available for pickup for <strong>' + daysSinceAvailable + ' days</strong> at our <strong>' + depotName + '</strong> depot. Don\'t forget to come pick them up!',
      bundleTip: 'Bundle Tip',
      bundleMessage: 'Pick up your ' + count + ' packages together and pay only <strong>one service fee</strong>, saving <strong>$' + potentialSavings.toFixed(2) + '</strong>!',
      packagesTitle: 'Waiting Packages:',
      urgentTitle: 'Important',
      urgentMessage: 'We recommend picking up your packages as soon as possible to avoid any storage issues at our warehouse.',
      buttonLabel: 'View My Packages',
      questionsText: 'Questions? Contact us!',
      companyFooter: 'Alliance Shipping - Reliable Shipping from USA to Haiti',
      automated: 'This is an automated message, please do not reply.',
    },
    ht: {
      subject: '\u23F0 Rap\u00E8l : ' + count + ' kolis ap tann ou \u2014 Ekonomize ak Bundle ! - Alliance Shipping',
      headerTitle: 'Kolis Ou Yo Ap Tann Ou !',
      headerSub: 'Depi ' + daysSinceAvailable + ' jou',
      greeting: 'Bonjou <strong>' + userName + '</strong>,',
      message: '<strong>' + count + ' kolis</strong> ou yo disponib pou ranmase depi <strong>' + daysSinceAvailable + ' jou</strong> nan depo <strong>' + depotName + '</strong> nou an. Pa bliye vin pran yo !',
      bundleTip: 'Kons\u00E8y Bundle',
      bundleMessage: 'Pran ' + count + ' kolis ou yo ansanm epi peye s\u00E8lman <strong>yon s\u00E8l fr\u00E8 s\u00E8vis</strong>, ekonomize <strong>$' + potentialSavings.toFixed(2) + '</strong> !',
      packagesTitle: 'Kolis Ap Tann :',
      urgentTitle: 'Enp\u00F2tan',
      urgentMessage: 'Nou rek\u00F2mande pou vin pran kolis ou yo le pli vit posib pou evite pwob\u00E8m estokaj nan depo nou an.',
      buttonLabel: 'W\u00E8 Kolis Mwen Yo',
      questionsText: 'Kesyon ? Kontakte nou !',
      companyFooter: 'Alliance Shipping - Livrezon Fyab soti nan USA pou ale an Ayiti',
      automated: 'Sa a se yon mesaj otomatik, tanpri pa reponn.',
    },
    es: {
      subject: '\u23F0 Recordatorio: ' + count + ' paquetes esperando \u2014 \u00A1Ahorre con Bundle! - Alliance Shipping',
      headerTitle: '\u00A1Sus Paquetes Lo Esperan!',
      headerSub: 'Desde hace ' + daysSinceAvailable + ' d\u00EDas',
      greeting: 'Hola <strong>' + userName + '</strong>,',
      message: 'Sus <strong>' + count + ' paquetes</strong> est\u00E1n disponibles para recoger desde hace <strong>' + daysSinceAvailable + ' d\u00EDas</strong> en nuestro dep\u00F3sito <strong>' + depotName + '</strong>. \u00A1No olvide venir a recogerlos!',
      bundleTip: 'Consejo Bundle',
      bundleMessage: 'Recoja sus ' + count + ' paquetes juntos y pague solo <strong>una tarifa de servicio</strong>, \u00A1ahorrando <strong>$' + potentialSavings.toFixed(2) + '</strong>!',
      packagesTitle: 'Paquetes en Espera:',
      urgentTitle: 'Importante',
      urgentMessage: 'Le recomendamos recoger sus paquetes lo antes posible para evitar problemas de almacenamiento.',
      buttonLabel: 'Ver Mis Paquetes',
      questionsText: '\u00BFPreguntas? \u00A1Cont\u00E1ctenos!',
      companyFooter: 'Alliance Shipping - Env\u00EDos Confiables de USA a Hait\u00ED',
      automated: 'Este es un mensaje autom\u00E1tico, por favor no responda.',
    },
  };

  const t = translations[locale] || translations.fr;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const trackingItems = trackingNumbers.map(tn =>
    '<li style="padding:4px 0;font-family:monospace;font-weight:600;">' + tn + '</li>'
  ).join('');

  const html = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>'
    + 'body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;line-height:1.6;color:#1f2937;margin:0;padding:0;background:#f3f4f6;}'
    + '.wrapper{padding:20px;}.container{max-width:600px;margin:0 auto;}'
    + '.header{background:linear-gradient(135deg,#f59e0b 0%,#ea580c 100%);color:white;padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;}'
    + '.header h1{margin:0;font-size:22px;}.header p{margin:8px 0 0;opacity:0.9;font-size:14px;}'
    + '.content{background:#fff;padding:32px 24px;border-radius:0 0 12px 12px;}'
    + '.card{background:#f9fafb;padding:20px;border-radius:10px;margin:20px 0;border:1px solid #e5e7eb;}'
    + '.tip-card{background:linear-gradient(135deg,#ecfdf5,#d1fae5);padding:20px;border-radius:10px;margin:20px 0;border:2px solid #86efac;}'
    + '.urgent-card{background:#fef3c7;padding:16px 20px;border-radius:10px;margin:20px 0;border-left:4px solid #f59e0b;}'
    + '.btn-container{text-align:center;margin:24px 0;}'
    + '.button{display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#f59e0b 0%,#ea580c 100%);color:#ffffff !important;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;}'
    + '.footer{text-align:center;padding:24px;color:#9ca3af;font-size:12px;}'
    + '</style></head><body><div class="wrapper"><div class="container">'
    + '<div class="header"><h1>\u23F0 ' + t.headerTitle + '</h1><p>' + t.headerSub + '</p></div>'
    + '<div class="content">'
    + '<p>' + t.greeting + '</p>'
    + '<p>' + t.message + '</p>'
    + '<div class="tip-card">'
    + '<h3 style="color:#065f46;margin:0 0 8px;">\u{1F4A1} ' + t.bundleTip + '</h3>'
    + '<p style="color:#065f46;margin:0;">' + t.bundleMessage + '</p>'
    + '<p style="text-align:center;margin:12px 0 0;"><span style="display:inline-block;padding:6px 16px;background:#dcfce7;color:#16a34a;border-radius:20px;font-size:14px;font-weight:700;">-$' + potentialSavings.toFixed(2) + '</span></p>'
    + '</div>'
    + '<div class="card"><h3>\u{1F4E6} ' + t.packagesTitle + '</h3><ul style="margin:0;padding-left:20px;">' + trackingItems + '</ul></div>'
    + '<div class="urgent-card">'
    + '<h3 style="color:#92400e;margin:0 0 4px;">\u26A0\uFE0F ' + t.urgentTitle + '</h3>'
    + '<p style="color:#92400e;margin:0;font-size:14px;">' + t.urgentMessage + '</p>'
    + '</div>'
    + '<div class="btn-container"><a href="' + appUrl + '/dashboard/packages" class="button">' + t.buttonLabel + '</a></div>'
    + '<p style="color:#6b7280;font-size:14px;">' + t.questionsText + '</p>'
    + '<p style="font-size:14px;">\u{1F4DE} <strong>Phone:</strong> (+509) 4881-2652<br>\u{1F4E7} <strong>Email:</strong> allianceshipping26@gmail.com</p>'
    + '</div>'
    + '<div class="footer"><p><strong>' + t.companyFooter + '</strong></p><p>' + t.automated + '</p></div>'
    + '</div></div></body></html>';

  return sendEmail({ to: userEmail, subject: t.subject, html });
};
