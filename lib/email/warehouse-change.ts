// ==================== WAREHOUSE CHANGE EMAIL TRANSLATIONS ====================

type Locale = 'ht' | 'fr' | 'en' | 'es';

interface WarehouseChangeStrings {
  subject: string;
  headerTitle: string;
  greeting: string;
  body: string;
  previousLabel: string;
  newLabel: string;
  warehouseInfo: string;
  addressLabel: string;
  phoneLabel: string;
  hoursLabel: string;
  mapButton: string;
  importantTitle: string;
  importantMessage: string;
  buttonLabel: string;
  questions: string;
  footer: string;
  automated: string;
}

const warehouseChangeStrings: Record<Locale, WarehouseChangeStrings> = {
  ht: {
    subject: 'Depo Resepsyon Chanje - Alliance Shipping',
    headerTitle: 'Depo Resepsyon Chanje',
    greeting: 'Bonjou',
    body: 'Depo resepsyon ou a chanje avèk siksè. Tout koli ou yo pral rive nan nouvo depo sa a.',
    previousLabel: 'Ansyen Depo:',
    newLabel: 'Nouvo Depo:',
    warehouseInfo: 'Enfòmasyon sou Depo',
    addressLabel: 'Adrès:',
    phoneLabel: 'Telefòn:',
    hoursLabel: 'Lè louvri:',
    mapButton: 'Wè sou Maps',
    importantTitle: 'Enpòtan!',
    importantMessage: 'Tout koli ou yo k ap vini pral rive nan nouvo depo sa a. Si ou genyen koli k ap tann lakay ansyen depo a, ale pran yo anvan ou chanje.',
    buttonLabel: 'Wè Koli Mwen Yo',
    questions: 'Si ou gen nenpòt kesyon oswa ou bezwen èd, pa ezite kontakte nou.',
    footer: 'Alliance Shipping - Livrezon Fyab soti nan USA pou ale an Ayiti',
    automated: 'Sa a se yon mesaj otomatik, tanpri pa reponn imèl sa a.',
  },
  fr: {
    subject: 'Dépôt de Réception Modifié - Alliance Shipping',
    headerTitle: 'Dépôt de Réception Modifié',
    greeting: 'Bonjour',
    body: 'Votre dépôt de réception a été modifié avec succès. Tous vos futurs colis seront disponibles à ce nouveau dépôt.',
    previousLabel: 'Ancien Dépôt:',
    newLabel: 'Nouveau Dépôt:',
    warehouseInfo: 'Informations du Dépôt',
    addressLabel: 'Adresse:',
    phoneLabel: 'Téléphone:',
    hoursLabel: 'Heures d\'ouverture:',
    mapButton: 'Voir sur Maps',
    importantTitle: 'Important!',
    importantMessage: 'Tous vos futurs colis seront disponibles à ce nouveau dépôt. Si vous avez des colis en attente à l\'ancien dépôt, veuillez les récupérer avant le changement.',
    buttonLabel: 'Voir Mes Colis',
    questions: 'Si vous avez des questions ou besoin d\'aide, n\'hésitez pas à nous contacter.',
    footer: 'Alliance Shipping - Expédition Fiable des USA vers Haïti',
    automated: 'Ceci est un message automatique, merci de ne pas répondre à cet e-mail.',
  },
  en: {
    subject: 'Pickup Warehouse Changed - Alliance Shipping',
    headerTitle: 'Pickup Warehouse Changed',
    greeting: 'Hello',
    body: 'Your pickup warehouse has been successfully changed. All your future packages will be available at this new warehouse.',
    previousLabel: 'Previous Warehouse:',
    newLabel: 'New Warehouse:',
    warehouseInfo: 'Warehouse Information',
    addressLabel: 'Address:',
    phoneLabel: 'Phone:',
    hoursLabel: 'Opening Hours:',
    mapButton: 'View on Maps',
    importantTitle: 'Important!',
    importantMessage: 'All your future packages will be available at this new warehouse. If you have any pending packages at the old warehouse, please pick them up before the change.',
    buttonLabel: 'View My Packages',
    questions: 'If you have any questions or need assistance, please don\'t hesitate to contact us.',
    footer: 'Alliance Shipping - Reliable Shipping from USA to Haiti',
    automated: 'This is an automated message, please do not reply to this email.',
  },
  es: {
    subject: 'Almacén de Recogida Cambiado - Alliance Shipping',
    headerTitle: 'Almacén de Recogida Cambiado',
    greeting: 'Hola',
    body: 'Su almacén de recogida ha sido cambiado exitosamente. Todos sus futuros paquetes estarán disponibles en este nuevo almacén.',
    previousLabel: 'Almacén Anterior:',
    newLabel: 'Nuevo Almacén:',
    warehouseInfo: 'Información del Almacén',
    addressLabel: 'Dirección:',
    phoneLabel: 'Teléfono:',
    hoursLabel: 'Horario de Apertura:',
    mapButton: 'Ver en Maps',
    importantTitle: '¡Importante!',
    importantMessage: 'Todos sus futuros paquetes estarán disponibles en este nuevo almacén. Si tiene paquetes pendientes en el almacén anterior, por favor recójalos antes del cambio.',
    buttonLabel: 'Ver Mis Paquetes',
    questions: 'Si tiene alguna pregunta o necesita ayuda, no dude en contactarnos.',
    footer: 'Alliance Shipping - Envíos Confiables de USA a Haití',
    automated: 'Este es un mensaje automático, por favor no responda a este correo.',
  },
};

import { sendEmail } from './service';

// Template: Warehouse Changed
export const sendWarehouseChangeEmail = async (
  userEmail: string,
  userName: string,
  previousWarehouse: { name: string; city: string },
  newWarehouse: { name: string; city: string; address: string; phone?: string; openingHours?: string; latitude: string; longitude: string },
  locale: string = 'fr'
) => {
  const lang = (['ht', 'fr', 'en', 'es'].includes(locale) ? locale : 'fr') as Locale;
  const s = warehouseChangeStrings[lang];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Create Google Maps link
  const mapsLink = `https://maps.google.com/?q=${newWarehouse.latitude},${newWarehouse.longitude}&entry=gps&g_st=awb`;

  const html = `
    <!DOCTYPE html>
    <html lang="${lang}">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background: #f3f4f6; }
          .wrapper { padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
          .content { background: #ffffff; padding: 32px 24px; border-radius: 0 0 12px 12px; }
          .card { background: #f9fafb; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #e5e7eb; }
          .warehouse-name { font-size: 18px; font-weight: bold; color: #1e40af; padding: 12px; background: #eff6ff; border-radius: 8px; text-align: center; margin: 10px 0; }
          .info-row { display: flex; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .info-row:last-child { border-bottom: none; }
          .info-label { font-weight: 600; color: #6b7280; min-width: 120px; }
          .info-value { color: #374151; }
          .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 8px; }
          .alert-box h3 { margin: 0 0 8px 0; color: #92400e; }
          .alert-box p { margin: 0; color: #78350f; }
          .btn-container { text-align: center; margin: 24px 0; }
          .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 5px; }
          .button-map { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
          .footer { text-align: center; padding: 24px; color: #9ca3af; font-size: 12px; }
          .divider { height: 1px; background: #e5e7eb; margin: 24px 0; }
          h3 { color: #1f2937; font-size: 16px; margin: 0 0 12px; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <h1>📍 ${s.headerTitle}</h1>
            </div>
            <div class="content">
              <p>${s.greeting} <strong>${userName}</strong>,</p>
              <p>${s.body}</p>

              <div class="card">
                <h3>${s.previousLabel}</h3>
                <div style="color: #6b7280; font-size: 14px;">
                  ${previousWarehouse.name} - ${previousWarehouse.city}
                </div>
              </div>

              <div style="text-align: center; margin: 20px 0; font-size: 24px; color: #f59e0b;">
                ↓
              </div>

              <div class="card">
                <h3>${s.newLabel}</h3>
                <div class="warehouse-name">
                  📦 ${newWarehouse.name}
                </div>

                <div style="margin-top: 20px;">
                  <h3>${s.warehouseInfo}</h3>

                  <div class="info-row">
                    <div class="info-label">${s.addressLabel}</div>
                    <div class="info-value">${newWarehouse.address}</div>
                  </div>

                  ${newWarehouse.phone ? `
                  <div class="info-row">
                    <div class="info-label">${s.phoneLabel}</div>
                    <div class="info-value">${newWarehouse.phone}</div>
                  </div>
                  ` : ''}

                  ${newWarehouse.openingHours ? `
                  <div class="info-row">
                    <div class="info-label">${s.hoursLabel}</div>
                    <div class="info-value">${newWarehouse.openingHours}</div>
                  </div>
                  ` : ''}
                </div>

                <div class="btn-container">
                  <a href="${mapsLink}" class="button button-map" target="_blank">
                    🗺️ ${s.mapButton}
                  </a>
                </div>
              </div>

              <div class="alert-box">
                <h3>⚠️ ${s.importantTitle}</h3>
                <p>${s.importantMessage}</p>
              </div>

              <div class="btn-container">
                <a href="${appUrl}/packages" class="button">
                  ${s.buttonLabel}
                </a>
              </div>

              <div class="divider"></div>
              <p style="color: #6b7280; font-size: 14px;">${s.questions}</p>
            </div>
            <div class="footer">
              <p><strong>${s.footer}</strong></p>
              <p>${s.automated}</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: userEmail, subject: s.subject, html });
};
