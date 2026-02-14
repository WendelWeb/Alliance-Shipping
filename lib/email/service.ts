import { Resend } from 'resend';

// Lazy init — avoids crash at build time when env vars are not yet available
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error('RESEND_API_KEY is not configured');
    _resend = new Resend(key);
  }
  return _resend;
}

const FROM_EMAIL = process.env.SMTP_FROM || 'Alliance Shipping <noreply@allianceshipping.com>';

// Logger helper pour debugging
const logEmailAttempt = (to: string, subject: string, status: 'START' | 'SUCCESS' | 'ERROR', details?: any) => {
  const timestamp = new Date().toISOString();
  const separator = '='.repeat(80);

  console.log('\n' + separator);
  console.log(`[EMAIL ${status}] ${timestamp}`);
  console.log(separator);

  // Configuration info
  console.log('📧 EMAIL CONFIGURATION:');
  console.log(`   API Key: ${process.env.RESEND_API_KEY ? '✅ Present (length: ' + process.env.RESEND_API_KEY.length + ')' : '❌ MISSING'}`);
  console.log(`   From Email: ${FROM_EMAIL}`);
  console.log(`   To: ${to}`);
  console.log(`   Subject: ${subject}`);

  // Status specific details
  if (status === 'START') {
    console.log('\n🚀 ATTEMPTING TO SEND EMAIL...');
  } else if (status === 'SUCCESS') {
    console.log('\n✅ EMAIL SENT SUCCESSFULLY!');
    console.log('   Response:', JSON.stringify(details, null, 2));
  } else if (status === 'ERROR') {
    console.log('\n❌ EMAIL SEND FAILED!');
    console.log('   Error Type:', details?.name || 'Unknown');
    console.log('   Error Message:', details?.message || 'No message');

    // Log full error details for debugging
    if (details?.response) {
      console.log('   API Response:', JSON.stringify(details.response, null, 2));
    }
    if (details?.statusCode) {
      console.log('   Status Code:', details.statusCode);
    }

    // Common issues hints
    console.log('\n💡 TROUBLESHOOTING HINTS:');
    if (!process.env.RESEND_API_KEY) {
      console.log('   ⚠️  RESEND_API_KEY is missing in .env.local');
      console.log('   → Get your key from: https://resend.com/api-keys');
    } else if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith('re_')) {
      console.log('   ⚠️  RESEND_API_KEY might be invalid (should start with "re_")');
    }

    if (details?.message?.includes('401') || details?.message?.includes('unauthorized')) {
      console.log('   ⚠️  Authentication failed - Check your API key');
    }
    if (details?.message?.includes('domain')) {
      console.log('   ⚠️  Domain not verified - Verify your domain in Resend dashboard');
      console.log('   → Or use: onboarding@resend.dev for testing');
    }

    console.log('\n📋 COPY THIS LOG TO SHARE:');
    console.log(JSON.stringify({
      timestamp,
      status: 'ERROR',
      to,
      subject,
      from: FROM_EMAIL,
      hasApiKey: !!process.env.RESEND_API_KEY,
      apiKeyLength: process.env.RESEND_API_KEY?.length,
      error: {
        name: details?.name,
        message: details?.message,
        statusCode: details?.statusCode,
      }
    }, null, 2));
  }

  console.log(separator + '\n');
};

export interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: EmailParams) => {
  // Log attempt
  logEmailAttempt(to, subject, 'START');

  try {
    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      logEmailAttempt(to, subject, 'ERROR', error);
      return { success: false, error };
    }

    logEmailAttempt(to, subject, 'SUCCESS', data);
    return { success: true, data };
  } catch (error: any) {
    logEmailAttempt(to, subject, 'ERROR', error);
    return { success: false, error };
  }
};

// ==================== MULTILINGUAL EMAIL HELPERS ====================

type Locale = 'ht' | 'fr' | 'en' | 'es';

interface EmailStrings {
  subject: string;
  greeting: string;
  body: string;
  trackingLabel: string;
  trackingSave: string;
  nextStepsTitle: string;
  nextSteps: string[];
  buttonLabel: string;
  questions: string;
  footer: string;
  automated: string;
}

const packageRequestStrings: Record<Locale, EmailStrings> = {
  ht: {
    subject: 'Demann Koli Soumèt - Alliance Shipping',
    greeting: 'Bonjou',
    body: 'Mèsi paske ou soumèt demann koli ou avèk Alliance Shipping. Nou resevwa demann ou an epi n ap trete li kounye a.',
    trackingLabel: 'Nimewo Tracking Ou:',
    trackingSave: 'Konsève nimewo sa a pou swiv koli ou',
    nextStepsTitle: 'Ki sa k ap pase apre sa?',
    nextSteps: [
      'Ekip nou an ap revize demann koli ou',
      'W ap resevwa yon imèl konfimasyon lè li apwouve',
      'Ou kapab swiv estati koli ou nan tableau de bord ou',
      'N ap avèti ou pou tout chanjman estati',
    ],
    buttonLabel: 'Wè Koli Mwen Yo',
    questions: 'Si ou gen nenpòt kesyon, pa ezite kontakte nou.',
    footer: 'Alliance Shipping - Livrezon Fyab soti nan USA pou ale an Ayiti',
    automated: 'Sa a se yon mesaj otomatik, tanpri pa reponn imèl sa a.',
  },
  fr: {
    subject: 'Demande de Colis Soumise - Alliance Shipping',
    greeting: 'Bonjour',
    body: 'Merci d\'avoir soumis votre demande de colis avec Alliance Shipping. Nous avons bien reçu votre demande et elle est en cours de traitement.',
    trackingLabel: 'Votre Numéro de Suivi :',
    trackingSave: 'Conservez ce numéro pour suivre votre colis',
    nextStepsTitle: 'Prochaines Étapes',
    nextSteps: [
      'Notre équipe va examiner votre demande de colis',
      'Vous recevrez un e-mail de confirmation une fois approuvée',
      'Vous pouvez suivre le statut de votre colis depuis votre tableau de bord',
      'Nous vous informerons de tout changement de statut',
    ],
    buttonLabel: 'Voir Mes Colis',
    questions: 'Si vous avez des questions, n\'hésitez pas à nous contacter.',
    footer: 'Alliance Shipping - Expédition Fiable des USA vers Haïti',
    automated: 'Ceci est un message automatique, merci de ne pas répondre à cet e-mail.',
  },
  en: {
    subject: 'Package Request Submitted - Alliance Shipping',
    greeting: 'Hello',
    body: 'Thank you for submitting your package request with Alliance Shipping. We have received your request and it is now being processed.',
    trackingLabel: 'Your Tracking Number:',
    trackingSave: 'Save this number to track your package',
    nextStepsTitle: 'What\'s Next?',
    nextSteps: [
      'Our team will review your package request',
      'You will receive a confirmation email once approved',
      'You can track your package status in your dashboard',
      'We\'ll notify you of any status changes',
    ],
    buttonLabel: 'View My Packages',
    questions: 'If you have any questions, please don\'t hesitate to contact us.',
    footer: 'Alliance Shipping - Reliable Shipping from USA to Haiti',
    automated: 'This is an automated message, please do not reply to this email.',
  },
  es: {
    subject: 'Solicitud de Paquete Enviada - Alliance Shipping',
    greeting: 'Hola',
    body: 'Gracias por enviar su solicitud de paquete con Alliance Shipping. Hemos recibido su solicitud y se está procesando.',
    trackingLabel: 'Su Número de Seguimiento:',
    trackingSave: 'Guarde este número para rastrear su paquete',
    nextStepsTitle: '¿Qué Sigue?',
    nextSteps: [
      'Nuestro equipo revisará su solicitud de paquete',
      'Recibirá un correo de confirmación una vez aprobada',
      'Puede seguir el estado de su paquete desde su panel',
      'Le notificaremos cualquier cambio de estado',
    ],
    buttonLabel: 'Ver Mis Paquetes',
    questions: 'Si tiene alguna pregunta, no dude en contactarnos.',
    footer: 'Alliance Shipping - Envíos Confiables de USA a Haití',
    automated: 'Este es un mensaje automático, por favor no responda a este correo.',
  },
};

// Template: Package Request Submitted
export const sendPackageRequestEmail = async (userEmail: string, userName: string, trackingNumber: string, locale: string = 'ht') => {
  const lang = (['ht', 'fr', 'en', 'es'].includes(locale) ? locale : 'ht') as Locale;
  const s = packageRequestStrings[lang];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

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
          .header { background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); color: white; padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
          .header p { margin: 8px 0 0; font-size: 14px; opacity: 0.9; }
          .content { background: #ffffff; padding: 32px 24px; border-radius: 0 0 12px 12px; }
          .card { background: #f9fafb; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #e5e7eb; }
          .tracking { font-size: 26px; font-weight: 800; color: #1e40af; text-align: center; padding: 16px; background: #eff6ff; border-radius: 8px; letter-spacing: 1px; font-family: 'Courier New', monospace; }
          .tracking-hint { text-align: center; color: #6b7280; font-size: 13px; margin-top: 8px; }
          .steps { padding-left: 0; list-style: none; }
          .steps li { padding: 8px 0 8px 28px; position: relative; color: #374151; }
          .steps li:before { content: '✓'; position: absolute; left: 0; color: #1e40af; font-weight: bold; }
          .btn-container { text-align: center; margin: 24px 0; }
          .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; }
          .footer { text-align: center; padding: 24px; color: #9ca3af; font-size: 12px; }
          .footer p { margin: 4px 0; }
          .divider { height: 1px; background: #e5e7eb; margin: 24px 0; }
          h3 { color: #1f2937; font-size: 15px; margin: 0 0 12px; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <h1>📦 Alliance Shipping</h1>
              <p>${s.subject.replace('📦 ', '').replace(' - Alliance Shipping', '')}</p>
            </div>
            <div class="content">
              <p>${s.greeting} <strong>${userName}</strong>,</p>
              <p>${s.body}</p>

              <div class="card">
                <h3>${s.trackingLabel}</h3>
                <div class="tracking">${trackingNumber}</div>
                <p class="tracking-hint">${s.trackingSave}</p>
              </div>

              <div class="card">
                <h3>${s.nextStepsTitle}</h3>
                <ul class="steps">
                  ${s.nextSteps.map(step => `<li>${step}</li>`).join('')}
                </ul>
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

// ==================== APPROVED EMAIL TRANSLATIONS ====================

interface ApprovedStrings {
  subject: string;
  headerTitle: string;
  greeting: string;
  body: string;
  trackingLabel: string;
  totalCostLabel: string;
  feeBreakdownTitle: string;
  serviceFeeLabel: string;
  weightCostLabel: string;
  specialItemLabel: string;
  customsFeesLabel: string;
  totalLabel: string;
  weightInfo: string;
  cityInfo: string;
  nextStepsTitle: string;
  nextSteps: string[];
  buttonLabel: string;
  thanks: string;
  footer: string;
  automated: string;
}

const approvedStrings: Record<Locale, ApprovedStrings> = {
  ht: {
    subject: 'Demann Koli Apwouve - Alliance Shipping',
    headerTitle: 'Demann Koli Apwouve!',
    greeting: 'B\u00f2n nouv\u00e8l',
    body: 'Demann koli ou a apwouve epi konfime. Koli ou an ap trete kounye a.',
    trackingLabel: 'Nimewo Tracking:',
    totalCostLabel: 'Ko\u00fbt Total:',
    feeBreakdownTitle: 'Detay Fr\u00e8',
    serviceFeeLabel: 'Fr\u00e8 s\u00e8vis:',
    weightCostLabel: 'Fr\u00e8 pwa:',
    specialItemLabel: 'Atik espesyal:',
    customsFeesLabel: 'Fr\u00e8 dwan:',
    totalLabel: 'TOTAL:',
    weightInfo: 'Pwa',
    cityInfo: 'Vil livrezon',
    nextStepsTitle: 'Ki sa k ap pase apr\u00e8 sa?',
    nextSteps: [
      'Koli ou ap prepare pou transp\u00f2te',
      'W ap resevwa mizajou l\u00e8 estati a chanje',
      'Swiv koli ou an tan rey\u00e8l nan tableau de bord ou',
      'N ap av\u00e8ti ou l\u00e8 li pr\u00e8 pou pran',
    ],
    buttonLabel: 'Swiv Koli Ou',
    thanks: 'M\u00e8si paske ou chwazi Alliance Shipping!',
    footer: 'Alliance Shipping - Livrezon Fyab soti nan USA pou ale an Ayiti',
    automated: 'Sa a se yon mesaj otomatik, tanpri pa reponn im\u00e8l sa a.',
  },
  fr: {
    subject: 'Demande de Colis Approuv\u00e9e - Alliance Shipping',
    headerTitle: 'Demande de Colis Approuv\u00e9e !',
    greeting: 'Excellente nouvelle',
    body: 'Votre demande de colis a \u00e9t\u00e9 approuv\u00e9e et confirm\u00e9e. Votre colis est maintenant en cours de traitement.',
    trackingLabel: 'Num\u00e9ro de Suivi :',
    totalCostLabel: 'Co\u00fbt Total :',
    feeBreakdownTitle: 'D\u00e9tail des Frais',
    serviceFeeLabel: 'Frais de service :',
    weightCostLabel: 'Frais de poids :',
    specialItemLabel: 'Article sp\u00e9cial :',
    customsFeesLabel: 'Frais de douane :',
    totalLabel: 'TOTAL :',
    weightInfo: 'Poids',
    cityInfo: 'Ville de livraison',
    nextStepsTitle: 'Prochaines \u00c9tapes',
    nextSteps: [
      'Votre colis sera pr\u00e9par\u00e9 pour le transit',
      'Vous recevrez des mises \u00e0 jour lors des changements de statut',
      'Suivez votre colis en temps r\u00e9el depuis votre tableau de bord',
      'Nous vous avertirons quand il sera pr\u00eat pour le retrait',
    ],
    buttonLabel: 'Suivre Mon Colis',
    thanks: 'Merci d\'avoir choisi Alliance Shipping !',
    footer: 'Alliance Shipping - Exp\u00e9dition Fiable des USA vers Ha\u00efti',
    automated: 'Ceci est un message automatique, merci de ne pas r\u00e9pondre.',
  },
  en: {
    subject: 'Package Request Approved - Alliance Shipping',
    headerTitle: 'Package Request Approved!',
    greeting: 'Great news',
    body: 'Your package request has been approved and confirmed. Your package is now being processed.',
    trackingLabel: 'Tracking Number:',
    totalCostLabel: 'Total Cost:',
    feeBreakdownTitle: 'Fee Breakdown',
    serviceFeeLabel: 'Service fee:',
    weightCostLabel: 'Weight cost:',
    specialItemLabel: 'Special item:',
    customsFeesLabel: 'Customs fees:',
    totalLabel: 'TOTAL:',
    weightInfo: 'Weight',
    cityInfo: 'Delivery city',
    nextStepsTitle: 'Next Steps',
    nextSteps: [
      'Your package will be prepared for transit',
      'You\'ll receive updates as the status changes',
      'Track your package in real-time from your dashboard',
      'You\'ll be notified when it\'s ready for pickup',
    ],
    buttonLabel: 'Track My Package',
    thanks: 'Thank you for choosing Alliance Shipping!',
    footer: 'Alliance Shipping - Reliable Shipping from USA to Haiti',
    automated: 'This is an automated message, please do not reply to this email.',
  },
  es: {
    subject: 'Solicitud de Paquete Aprobada - Alliance Shipping',
    headerTitle: '\u00a1Solicitud de Paquete Aprobada!',
    greeting: '\u00a1Excelente noticia',
    body: 'Su solicitud de paquete ha sido aprobada y confirmada. Su paquete est\u00e1 siendo procesado.',
    trackingLabel: 'N\u00famero de Seguimiento:',
    totalCostLabel: 'Costo Total:',
    feeBreakdownTitle: 'Desglose de Tarifas',
    serviceFeeLabel: 'Tarifa de servicio:',
    weightCostLabel: 'Costo por peso:',
    specialItemLabel: 'Art\u00edculo especial:',
    customsFeesLabel: 'Tasas aduaneras:',
    totalLabel: 'TOTAL:',
    weightInfo: 'Peso',
    cityInfo: 'Ciudad de entrega',
    nextStepsTitle: 'Pr\u00f3ximos Pasos',
    nextSteps: [
      'Su paquete ser\u00e1 preparado para el tr\u00e1nsito',
      'Recibir\u00e1 actualizaciones cuando cambie el estado',
      'Rastree su paquete en tiempo real desde su panel',
      'Le notificaremos cuando est\u00e9 listo para recoger',
    ],
    buttonLabel: 'Rastrear Mi Paquete',
    thanks: '\u00a1Gracias por elegir Alliance Shipping!',
    footer: 'Alliance Shipping - Env\u00edos Confiables de USA a Hait\u00ed',
    automated: 'Este es un mensaje autom\u00e1tico, por favor no responda.',
  },
};

// Template: Package Request Approved
export const sendPackageApprovedEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string,
  totalCost: number,
  locale: string = 'fr',
  feeBreakdown?: {
    serviceFee: number;
    weightCost: number;
    specialItemFee: number;
    customsFees: number;
    weight: number;
    city: string;
  }
) => {
  const lang = (['ht', 'fr', 'en', 'es'].includes(locale) ? locale : 'fr') as Locale;
  const s = approvedStrings[lang];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Build fee breakdown HTML if provided
  let feeBreakdownHtml = '';
  if (feeBreakdown) {
    const rows: string[] = [];
    if (feeBreakdown.serviceFee > 0) {
      rows.push(`<tr><td style="padding:8px 12px;color:#6b7280;">${s.serviceFeeLabel}</td><td style="padding:8px 12px;text-align:right;font-weight:600;">$${feeBreakdown.serviceFee.toFixed(2)}</td></tr>`);
    }
    if (feeBreakdown.weightCost > 0) {
      rows.push(`<tr><td style="padding:8px 12px;color:#6b7280;">${s.weightCostLabel}</td><td style="padding:8px 12px;text-align:right;font-weight:600;">$${feeBreakdown.weightCost.toFixed(2)}</td></tr>`);
    }
    if (feeBreakdown.specialItemFee > 0) {
      rows.push(`<tr style="background:#faf5ff;"><td style="padding:8px 12px;color:#7c3aed;font-weight:600;">${s.specialItemLabel}</td><td style="padding:8px 12px;text-align:right;color:#7c3aed;font-weight:700;">$${feeBreakdown.specialItemFee.toFixed(2)}</td></tr>`);
    }
    if (feeBreakdown.customsFees > 0) {
      rows.push(`<tr style="background:#fef2f2;"><td style="padding:8px 12px;color:#dc2626;font-weight:600;">${s.customsFeesLabel}</td><td style="padding:8px 12px;text-align:right;color:#dc2626;font-weight:700;">$${feeBreakdown.customsFees.toFixed(2)}</td></tr>`);
    }
    rows.push(`<tr style="border-top:2px solid #10b981;background:#ecfdf5;"><td style="padding:10px 12px;font-weight:800;color:#059669;font-size:16px;">${s.totalLabel}</td><td style="padding:10px 12px;text-align:right;font-weight:800;color:#059669;font-size:18px;">$${totalCost.toFixed(2)}</td></tr>`);

    const infoItems: string[] = [];
    if (feeBreakdown.weight) infoItems.push(`${s.weightInfo}: ${feeBreakdown.weight} lbs`);
    if (feeBreakdown.city) infoItems.push(`${s.cityInfo}: ${feeBreakdown.city}`);

    feeBreakdownHtml = `
              <div class="card">
                <h3>${s.feeBreakdownTitle}</h3>
                ${infoItems.length > 0 ? `<p style="color:#6b7280;font-size:13px;margin:0 0 12px;">${infoItems.join(' &bull; ')}</p>` : ''}
                <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
                  ${rows.join('')}
                </table>
              </div>`;
  }

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
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
          .content { background: #ffffff; padding: 32px 24px; border-radius: 0 0 12px 12px; }
          .card { background: #f9fafb; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #e5e7eb; }
          .tracking { font-size: 26px; font-weight: 800; color: #10b981; text-align: center; padding: 16px; background: #ecfdf5; border-radius: 8px; letter-spacing: 1px; font-family: 'Courier New', monospace; }
          .total-cost { font-size: 32px; font-weight: 800; color: #059669; text-align: center; margin: 12px 0; }
          .steps { padding-left: 0; list-style: none; }
          .steps li { padding: 8px 0 8px 28px; position: relative; color: #374151; }
          .steps li:before { content: '\u2713'; position: absolute; left: 0; color: #10b981; font-weight: bold; }
          .btn-container { text-align: center; margin: 24px 0; }
          .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; }
          .footer { text-align: center; padding: 24px; color: #9ca3af; font-size: 12px; }
          .footer p { margin: 4px 0; }
          .divider { height: 1px; background: #e5e7eb; margin: 24px 0; }
          h3 { color: #1f2937; font-size: 15px; margin: 0 0 12px; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <h1>\u2705 ${s.headerTitle}</h1>
            </div>
            <div class="content">
              <p>${s.greeting}, <strong>${userName}</strong>!</p>
              <p>${s.body}</p>

              <div class="card">
                <h3>${s.trackingLabel}</h3>
                <div class="tracking">${trackingNumber}</div>
              </div>

              <div class="card" style="text-align: center;">
                <h3>${s.totalCostLabel}</h3>
                <div class="total-cost">$${totalCost.toFixed(2)}</div>
              </div>

              ${feeBreakdownHtml}

              <div class="card">
                <h3>${s.nextStepsTitle}</h3>
                <ul class="steps">
                  ${s.nextSteps.map(step => `<li>${step}</li>`).join('')}
                </ul>
              </div>

              <div class="btn-container">
                <a href="${appUrl}/packages" class="button">${s.buttonLabel}</a>
              </div>

              <div class="divider"></div>
              <p style="color: #6b7280; font-size: 14px;">${s.thanks}</p>
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

// ==================== REJECTED EMAIL TRANSLATIONS ====================

interface RejectedStrings {
  subject: string;
  headerTitle: string;
  greeting: string;
  body: string;
  trackingLabel: string;
  reasonTitle: string;
  whatNextTitle: string;
  whatNextItems: string[];
  buttonLabel: string;
  questions: string;
  footer: string;
  automated: string;
}

const rejectedStrings: Record<Locale, RejectedStrings> = {
  ht: {
    subject: 'Mizajou Demann Koli - Alliance Shipping',
    headerTitle: 'Demann Koli Rejte',
    greeting: 'Bonjou',
    body: 'Nou regr\u00e8t enf\u00f2me ou ke demann koli ou a te rejte.',
    trackingLabel: 'Nimewo Tracking:',
    reasonTitle: 'Rezon Rej\u00e8:',
    whatNextTitle: 'Ki sa ou ka f\u00e8?',
    whatNextItems: [
      'Revize rezon rej\u00e8 a anl\u00e8 a',
      'Kontakte ekip sip\u00f2 nou an pou plis enf\u00f2masyon',
      'Soum\u00e8t yon nouvo demann ak enf\u00f2masyon kor\u00e8k',
      'Asire ou tout detay koli yo egzak',
    ],
    buttonLabel: 'W\u00e8 Tableau de Bord',
    questions: 'Si ou gen kesyon oswa enkyetid, tanpri kontakte ekip sip\u00f2 nou an.',
    footer: 'Alliance Shipping - Livrezon Fyab soti nan USA pou ale an Ayiti',
    automated: 'Sa a se yon mesaj otomatik, tanpri pa reponn im\u00e8l sa a.',
  },
  fr: {
    subject: 'Mise \u00e0 jour Demande de Colis - Alliance Shipping',
    headerTitle: 'Demande de Colis Rejet\u00e9e',
    greeting: 'Bonjour',
    body: 'Nous avons le regret de vous informer que votre demande de colis a \u00e9t\u00e9 rejet\u00e9e.',
    trackingLabel: 'Num\u00e9ro de Suivi :',
    reasonTitle: 'Raison du Rejet :',
    whatNextTitle: 'Que pouvez-vous faire ?',
    whatNextItems: [
      'Consultez la raison du rejet ci-dessus',
      'Contactez notre \u00e9quipe de support pour plus d\'informations',
      'Soumettez une nouvelle demande avec les informations correctes',
      'Assurez-vous que tous les d\u00e9tails du colis sont exacts',
    ],
    buttonLabel: 'Voir le Tableau de Bord',
    questions: 'Si vous avez des questions ou pr\u00e9occupations, veuillez contacter notre \u00e9quipe de support.',
    footer: 'Alliance Shipping - Exp\u00e9dition Fiable des USA vers Ha\u00efti',
    automated: 'Ceci est un message automatique, merci de ne pas r\u00e9pondre.',
  },
  en: {
    subject: 'Package Request Update - Alliance Shipping',
    headerTitle: 'Package Request Rejected',
    greeting: 'Hello',
    body: 'We regret to inform you that your package request has been rejected.',
    trackingLabel: 'Tracking Number:',
    reasonTitle: 'Reason for Rejection:',
    whatNextTitle: 'What Can You Do?',
    whatNextItems: [
      'Review the reason for rejection above',
      'Contact our support team for more information',
      'Submit a new request with the correct information',
      'Ensure all package details are accurate',
    ],
    buttonLabel: 'View Dashboard',
    questions: 'If you have any questions or concerns, please contact our support team.',
    footer: 'Alliance Shipping - Reliable Shipping from USA to Haiti',
    automated: 'This is an automated message, please do not reply to this email.',
  },
  es: {
    subject: 'Actualizaci\u00f3n de Solicitud de Paquete - Alliance Shipping',
    headerTitle: 'Solicitud de Paquete Rechazada',
    greeting: 'Hola',
    body: 'Lamentamos informarle que su solicitud de paquete ha sido rechazada.',
    trackingLabel: 'N\u00famero de Seguimiento:',
    reasonTitle: 'Raz\u00f3n del Rechazo:',
    whatNextTitle: '\u00bfQu\u00e9 puede hacer?',
    whatNextItems: [
      'Revise la raz\u00f3n del rechazo arriba',
      'Contacte a nuestro equipo de soporte para m\u00e1s informaci\u00f3n',
      'Env\u00ede una nueva solicitud con la informaci\u00f3n correcta',
      'Aseg\u00farese de que todos los detalles del paquete sean exactos',
    ],
    buttonLabel: 'Ver Panel',
    questions: 'Si tiene alguna pregunta o inquietud, por favor contacte a nuestro equipo de soporte.',
    footer: 'Alliance Shipping - Env\u00edos Confiables de USA a Hait\u00ed',
    automated: 'Este es un mensaje autom\u00e1tico, por favor no responda.',
  },
};

// Template: Package Request Rejected
export const sendPackageRejectedEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string,
  reason?: string,
  locale: string = 'fr'
) => {
  const lang = (['ht', 'fr', 'en', 'es'].includes(locale) ? locale : 'fr') as Locale;
  const s = rejectedStrings[lang];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

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
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
          .content { background: #ffffff; padding: 32px 24px; border-radius: 0 0 12px 12px; }
          .card { background: #f9fafb; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #e5e7eb; }
          .tracking { font-size: 24px; font-weight: 800; color: #ef4444; text-align: center; padding: 16px; background: #fef2f2; border-radius: 8px; font-family: 'Courier New', monospace; letter-spacing: 1px; }
          .reason-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; color: #991b1b; }
          .steps { padding-left: 0; list-style: none; }
          .steps li { padding: 8px 0 8px 28px; position: relative; color: #374151; }
          .steps li:before { content: '\u2192'; position: absolute; left: 0; color: #6366f1; font-weight: bold; }
          .btn-container { text-align: center; margin: 24px 0; }
          .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; }
          .footer { text-align: center; padding: 24px; color: #9ca3af; font-size: 12px; }
          .footer p { margin: 4px 0; }
          .divider { height: 1px; background: #e5e7eb; margin: 24px 0; }
          h3 { color: #1f2937; font-size: 15px; margin: 0 0 12px; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <h1>\u274c ${s.headerTitle}</h1>
            </div>
            <div class="content">
              <p>${s.greeting} <strong>${userName}</strong>,</p>
              <p>${s.body}</p>

              <div class="card">
                <h3>${s.trackingLabel}</h3>
                <div class="tracking">${trackingNumber}</div>
              </div>

              ${reason ? `
              <div class="card">
                <h3>${s.reasonTitle}</h3>
                <div class="reason-box">${reason}</div>
              </div>
              ` : ''}

              <div class="card">
                <h3>${s.whatNextTitle}</h3>
                <ul class="steps">
                  ${s.whatNextItems.map(item => `<li>${item}</li>`).join('')}
                </ul>
              </div>

              <div class="btn-container">
                <a href="${appUrl}/packages" class="button">${s.buttonLabel}</a>
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

// ==================== STATUS CHANGE EMAIL TRANSLATIONS ====================

interface StatusChangeStrings {
  subject: (label: string) => string;
  headerTitle: string;
  greeting: string;
  body: string;
  trackingLabel: string;
  newStatusLabel: string;
  buttonLabel: string;
  thanks: string;
  footer: string;
  automated: string;
  statusLabels: Record<string, string>;
  statusMessages: Record<string, string>;
}

const statusChangeStrings: Record<Locale, StatusChangeStrings> = {
  ht: {
    subject: (label) => `Mizajou Estati Koli: ${label} - Alliance Shipping`,
    headerTitle: 'Estati Koli Mizajou',
    greeting: 'Bonjou',
    body: 'Estati koli ou a chanje!',
    trackingLabel: 'Nimewo Tracking:',
    newStatusLabel: 'Nouvo Estati:',
    buttonLabel: 'Swiv Koli Ou',
    thanks: 'Mèsi paske ou itilize Alliance Shipping!',
    footer: 'Alliance Shipping - Livrezon Fyab soti nan USA pou ale an Ayiti',
    automated: 'Sa a se yon mesaj otomatik, tanpri pa reponn imèl sa a.',
    statusLabels: { 'received': 'Resevwa', 'in-transit': 'An Tranzit', 'available': 'Disponib', 'delivered': 'Livre' },
    statusMessages: { 'received': 'Koli ou a resevwa nan depo nou an epi l ap trete.', 'in-transit': 'Koli ou an wout pou Ayiti epi l ap rive byento.' },
  },
  fr: {
    subject: (label) => `Mise \u00e0 jour du statut: ${label} - Alliance Shipping`,
    headerTitle: 'Statut du Colis Mis \u00e0 Jour',
    greeting: 'Bonjour',
    body: 'Le statut de votre colis a \u00e9t\u00e9 mis \u00e0 jour !',
    trackingLabel: 'Num\u00e9ro de Suivi :',
    newStatusLabel: 'Nouveau Statut :',
    buttonLabel: 'Suivre Votre Colis',
    thanks: 'Merci d\'utiliser Alliance Shipping !',
    footer: 'Alliance Shipping - Exp\u00e9dition Fiable des USA vers Ha\u00efti',
    automated: 'Ceci est un message automatique, merci de ne pas r\u00e9pondre.',
    statusLabels: { 'received': 'Re\u00e7u', 'in-transit': 'En Transit', 'available': 'Disponible', 'delivered': 'Livr\u00e9' },
    statusMessages: { 'received': 'Votre colis a \u00e9t\u00e9 re\u00e7u dans notre entrep\u00f4t et est en cours de traitement.', 'in-transit': 'Votre colis est en route vers Ha\u00efti et arrivera bient\u00f4t.' },
  },
  en: {
    subject: (label) => `Package Status Update: ${label} - Alliance Shipping`,
    headerTitle: 'Package Status Updated',
    greeting: 'Hello',
    body: 'Your package status has been updated!',
    trackingLabel: 'Tracking Number:',
    newStatusLabel: 'New Status:',
    buttonLabel: 'Track Your Package',
    thanks: 'Thank you for using Alliance Shipping!',
    footer: 'Alliance Shipping - Reliable Shipping from USA to Haiti',
    automated: 'This is an automated message, please do not reply to this email.',
    statusLabels: { 'received': 'Received', 'in-transit': 'In Transit', 'available': 'Available for Pickup', 'delivered': 'Delivered' },
    statusMessages: { 'received': 'Your package has been received at our warehouse and is being processed.', 'in-transit': 'Your package is on its way to Haiti and will arrive soon.' },
  },
  es: {
    subject: (label) => `Actualizaci\u00f3n de Estado: ${label} - Alliance Shipping`,
    headerTitle: 'Estado del Paquete Actualizado',
    greeting: 'Hola',
    body: '\u00a1El estado de su paquete ha sido actualizado!',
    trackingLabel: 'N\u00famero de Seguimiento:',
    newStatusLabel: 'Nuevo Estado:',
    buttonLabel: 'Rastrear Su Paquete',
    thanks: '\u00a1Gracias por usar Alliance Shipping!',
    footer: 'Alliance Shipping - Env\u00edos Confiables de USA a Hait\u00ed',
    automated: 'Este es un mensaje autom\u00e1tico, por favor no responda.',
    statusLabels: { 'received': 'Recibido', 'in-transit': 'En Tr\u00e1nsito', 'available': 'Disponible', 'delivered': 'Entregado' },
    statusMessages: { 'received': 'Su paquete ha sido recibido en nuestro almac\u00e9n y est\u00e1 siendo procesado.', 'in-transit': 'Su paquete est\u00e1 en camino a Hait\u00ed y llegar\u00e1 pronto.' },
  },
};

// Template: Package Status Changed
export const sendPackageStatusChangeEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string,
  newStatus: string,
  statusMessage: string,
  locale: string = 'fr'
) => {
  const lang = (['ht', 'fr', 'en', 'es'].includes(locale) ? locale : 'fr') as Locale;
  const s = statusChangeStrings[lang];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const statusColors: { [key: string]: string } = {
    'received': '#3b82f6',
    'in-transit': '#8b5cf6',
    'available': '#10b981',
    'delivered': '#059669',
  };

  const statusEmojis: { [key: string]: string } = {
    'received': '\u{1F4E6}',
    'in-transit': '\u{1F69A}',
    'available': '\u2705',
    'delivered': '\u{1F389}',
  };

  const color = statusColors[newStatus] || '#667eea';
  const emoji = statusEmojis[newStatus] || '\u{1F4E6}';
  const label = s.statusLabels[newStatus] || newStatus;
  const localizedMessage = s.statusMessages[newStatus] || statusMessage;

  const subject = s.subject(label);
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
          .header { background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%); color: white; padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { background: #ffffff; padding: 32px 24px; border-radius: 0 0 12px 12px; }
          .card { background: #f9fafb; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #e5e7eb; }
          .tracking { font-size: 24px; font-weight: 800; color: ${color}; text-align: center; padding: 16px; background: #f3f4f6; border-radius: 8px; font-family: 'Courier New', monospace; letter-spacing: 1px; }
          .status-badge { background: ${color}22; color: ${color}; padding: 10px 20px; border-radius: 20px; display: inline-block; font-weight: bold; font-size: 18px; }
          .btn-container { text-align: center; margin: 24px 0; }
          .button { display: inline-block; padding: 14px 32px; background: ${color}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; }
          .footer { text-align: center; padding: 24px; color: #9ca3af; font-size: 12px; }
          .divider { height: 1px; background: #e5e7eb; margin: 24px 0; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <h1>${emoji} ${s.headerTitle}</h1>
            </div>
            <div class="content">
              <p>${s.greeting} <strong>${userName}</strong>,</p>
              <p>${s.body}</p>

              <div class="card">
                <h3>${s.trackingLabel}</h3>
                <div class="tracking">${trackingNumber}</div>
              </div>

              <div class="card" style="text-align: center;">
                <h3>${s.newStatusLabel}</h3>
                <div class="status-badge">${emoji} ${label}</div>
                <p style="margin-top: 20px; color: #6b7280;">${localizedMessage}</p>
              </div>

              <div class="btn-container">
                <a href="${appUrl}/packages" class="button">${s.buttonLabel}</a>
              </div>

              <div class="divider"></div>
              <p style="color: #6b7280; font-size: 14px;">${s.thanks}</p>
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

  return sendEmail({ to: userEmail, subject, html });
};

// ==================== AVAILABLE EMAIL TRANSLATIONS ====================

interface AvailableStrings {
  subject: string;
  headerTitle: string;
  greeting: string;
  body: string;
  trackingLabel: string;
  pickupLabel: string;
  bringTitle: string;
  bringItems: string[];
  hoursTitle: string;
  hoursWeekday: string;
  hoursSaturday: string;
  hoursSunday: string;
  buttonLabel: string;
  seeYou: string;
  footer: string;
  automated: string;
}

const availableStrings: Record<Locale, AvailableStrings> = {
  ht: {
    subject: 'Koli Disponib pou Pran - Alliance Shipping',
    headerTitle: 'Koli Pare pou Pran!',
    greeting: 'Bòn nouvèl',
    body: 'Koli ou rive an Ayiti epi li disponib pou pran.',
    trackingLabel: 'Nimewo Tracking:',
    pickupLabel: 'Kote pou Pran:',
    bringTitle: 'Sa pou Pote:',
    bringItems: ['Imèl sa a oswa nimewo tracking', 'Yon pyès idantite valid', 'Peman pou tout frè ki rete (si sa aplike)'],
    hoursTitle: 'Lè Pou Pran:',
    hoursWeekday: 'Lendi - Vandredi: 8:00 AM - 5:00 PM',
    hoursSaturday: 'Samdi: 9:00 AM - 2:00 PM',
    hoursSunday: 'Dimanch: Fèmen',
    buttonLabel: 'Wè Detay Koli',
    seeYou: 'Nou espere wè ou byento!',
    footer: 'Alliance Shipping - Livrezon Fyab soti nan USA pou ale an Ayiti',
    automated: 'Sa a se yon mesaj otomatik, tanpri pa reponn imèl sa a.',
  },
  fr: {
    subject: 'Colis Disponible pour Retrait - Alliance Shipping',
    headerTitle: 'Colis Pr\u00eat pour le Retrait !',
    greeting: 'Excellente nouvelle',
    body: 'Votre colis est arriv\u00e9 en Ha\u00efti et est disponible pour le retrait.',
    trackingLabel: 'Num\u00e9ro de Suivi :',
    pickupLabel: 'Lieu de Retrait :',
    bringTitle: '\u00c0 Apporter :',
    bringItems: ['Cet e-mail ou num\u00e9ro de suivi', 'Une pi\u00e8ce d\'identit\u00e9 valide', 'Paiement des frais restants (si applicable)'],
    hoursTitle: 'Heures de Retrait :',
    hoursWeekday: 'Lundi - Vendredi : 8h00 - 17h00',
    hoursSaturday: 'Samedi : 9h00 - 14h00',
    hoursSunday: 'Dimanche : Ferm\u00e9',
    buttonLabel: 'Voir les D\u00e9tails',
    seeYou: 'Nous avons h\u00e2te de vous voir !',
    footer: 'Alliance Shipping - Exp\u00e9dition Fiable des USA vers Ha\u00efti',
    automated: 'Ceci est un message automatique, merci de ne pas r\u00e9pondre.',
  },
  en: {
    subject: 'Package Available for Pickup - Alliance Shipping',
    headerTitle: 'Package Ready for Pickup!',
    greeting: 'Excellent news',
    body: 'Your package has arrived in Haiti and is now available for pickup.',
    trackingLabel: 'Tracking Number:',
    pickupLabel: 'Pickup Location:',
    bringTitle: 'What to Bring:',
    bringItems: ['This email or tracking number', 'Valid government-issued ID', 'Payment for any remaining fees (if applicable)'],
    hoursTitle: 'Pickup Hours:',
    hoursWeekday: 'Monday - Friday: 8:00 AM - 5:00 PM',
    hoursSaturday: 'Saturday: 9:00 AM - 2:00 PM',
    hoursSunday: 'Sunday: Closed',
    buttonLabel: 'View Package Details',
    seeYou: 'We look forward to seeing you soon!',
    footer: 'Alliance Shipping - Reliable Shipping from USA to Haiti',
    automated: 'This is an automated message, please do not reply to this email.',
  },
  es: {
    subject: 'Paquete Disponible para Recoger - Alliance Shipping',
    headerTitle: '\u00a1Paquete Listo para Recoger!',
    greeting: '\u00a1Excelente noticia',
    body: 'Su paquete ha llegado a Hait\u00ed y est\u00e1 disponible para recoger.',
    trackingLabel: 'N\u00famero de Seguimiento:',
    pickupLabel: 'Lugar de Recogida:',
    bringTitle: 'Qu\u00e9 Traer:',
    bringItems: ['Este correo o n\u00famero de seguimiento', 'Identificaci\u00f3n oficial vigente', 'Pago de cargos pendientes (si aplica)'],
    hoursTitle: 'Horario de Recogida:',
    hoursWeekday: 'Lunes - Viernes: 8:00 AM - 5:00 PM',
    hoursSaturday: 'S\u00e1bado: 9:00 AM - 2:00 PM',
    hoursSunday: 'Domingo: Cerrado',
    buttonLabel: 'Ver Detalles del Paquete',
    seeYou: '\u00a1Esperamos verle pronto!',
    footer: 'Alliance Shipping - Env\u00edos Confiables de USA a Hait\u00ed',
    automated: 'Este es un mensaje autom\u00e1tico, por favor no responda.',
  },
};

// Template: Package Available for Pickup
export const sendPackageAvailableEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string,
  pickupLocation: string,
  locale: string = 'fr'
) => {
  const lang = (['ht', 'fr', 'en', 'es'].includes(locale) ? locale : 'fr') as Locale;
  const s = availableStrings[lang];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

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
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { background: #ffffff; padding: 32px 24px; border-radius: 0 0 12px 12px; }
          .card { background: #f9fafb; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #e5e7eb; }
          .tracking { font-size: 24px; font-weight: 800; color: #10b981; text-align: center; padding: 16px; background: #f3f4f6; border-radius: 8px; font-family: 'Courier New', monospace; letter-spacing: 1px; }
          .location { background: #d1fae5; padding: 15px; border-radius: 8px; text-align: center; font-size: 18px; font-weight: bold; color: #065f46; }
          .btn-container { text-align: center; margin: 24px 0; }
          .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; }
          .footer { text-align: center; padding: 24px; color: #9ca3af; font-size: 12px; }
          .divider { height: 1px; background: #e5e7eb; margin: 24px 0; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <h1>\u2705 ${s.headerTitle}</h1>
            </div>
            <div class="content">
              <p>${s.greeting}, <strong>${userName}</strong>!</p>
              <p>${s.body}</p>

              <div class="card">
                <h3>${s.trackingLabel}</h3>
                <div class="tracking">${trackingNumber}</div>
              </div>

              <div class="card">
                <h3>${s.pickupLabel}</h3>
                <div class="location">\u{1F4CD} ${pickupLocation}</div>
              </div>

              <div class="card">
                <h3>${s.bringTitle}</h3>
                <ul>
                  ${s.bringItems.map(item => `<li>${item}</li>`).join('')}
                </ul>
              </div>

              <div class="card">
                <h3>${s.hoursTitle}</h3>
                <p><strong>${s.hoursWeekday}</strong></p>
                <p><strong>${s.hoursSaturday}</strong></p>
                <p><strong>${s.hoursSunday}</strong></p>
              </div>

              <div class="btn-container">
                <a href="${appUrl}/packages" class="button">${s.buttonLabel}</a>
              </div>

              <div class="divider"></div>
              <p style="color: #6b7280; font-size: 14px;">${s.seeYou}</p>
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

// ==================== DELIVERED EMAIL TRANSLATIONS ====================

interface DeliveredStrings {
  subject: string;
  headerTitle: string;
  greeting: string;
  body: string;
  trackingLabel: string;
  deliveryConfirmed: string;
  receivedBy: string;
  thankTitle: string;
  thankBody: string;
  thankReturn: string;
  buttonLabel: string;
  footer: string;
  automated: string;
}

const deliveredStrings: Record<Locale, DeliveredStrings> = {
  ht: {
    subject: 'Koli Livre Avèk Siksè - Alliance Shipping',
    headerTitle: 'Koli Livre!',
    greeting: 'Felisitasyon',
    body: 'Koli ou a livre avèk siksè.',
    trackingLabel: 'Nimewo Tracking:',
    deliveryConfirmed: 'Livrezon Konfime',
    receivedBy: 'Resevwa pa:',
    thankTitle: 'Mèsi paske ou chwazi Alliance Shipping!',
    thankBody: 'Nou espere ou satisfè ak sèvis nou an. Kòmantè ou ede nou amelyore.',
    thankReturn: 'Nou espere sèvi ou ankò byento!',
    buttonLabel: 'Wè Istorik Koli',
    footer: 'Alliance Shipping - Livrezon Fyab soti nan USA pou ale an Ayiti',
    automated: 'Sa a se yon mesaj otomatik, tanpri pa reponn imèl sa a.',
  },
  fr: {
    subject: 'Colis Livr\u00e9 avec Succ\u00e8s - Alliance Shipping',
    headerTitle: 'Colis Livr\u00e9 !',
    greeting: 'F\u00e9licitations',
    body: 'Votre colis a \u00e9t\u00e9 livr\u00e9 avec succ\u00e8s.',
    trackingLabel: 'Num\u00e9ro de Suivi :',
    deliveryConfirmed: 'Livraison Confirm\u00e9e',
    receivedBy: 'Re\u00e7u par :',
    thankTitle: 'Merci d\'avoir choisi Alliance Shipping !',
    thankBody: 'Nous esp\u00e9rons que vous \u00eates satisfait de notre service. Vos commentaires nous aident \u00e0 nous am\u00e9liorer.',
    thankReturn: 'Nous avons h\u00e2te de vous servir \u00e0 nouveau !',
    buttonLabel: 'Voir l\'Historique',
    footer: 'Alliance Shipping - Exp\u00e9dition Fiable des USA vers Ha\u00efti',
    automated: 'Ceci est un message automatique, merci de ne pas r\u00e9pondre.',
  },
  en: {
    subject: 'Package Delivered Successfully - Alliance Shipping',
    headerTitle: 'Package Delivered!',
    greeting: 'Congratulations',
    body: 'Your package has been successfully delivered.',
    trackingLabel: 'Tracking Number:',
    deliveryConfirmed: 'Delivery Confirmed',
    receivedBy: 'Received by:',
    thankTitle: 'Thank You for Choosing Alliance Shipping!',
    thankBody: 'We hope you\'re satisfied with our service. Your feedback helps us improve.',
    thankReturn: 'We look forward to serving you again soon!',
    buttonLabel: 'View Package History',
    footer: 'Alliance Shipping - Reliable Shipping from USA to Haiti',
    automated: 'This is an automated message, please do not reply to this email.',
  },
  es: {
    subject: 'Paquete Entregado Exitosamente - Alliance Shipping',
    headerTitle: '\u00a1Paquete Entregado!',
    greeting: '\u00a1Felicidades',
    body: 'Su paquete ha sido entregado exitosamente.',
    trackingLabel: 'N\u00famero de Seguimiento:',
    deliveryConfirmed: 'Entrega Confirmada',
    receivedBy: 'Recibido por:',
    thankTitle: '\u00a1Gracias por elegir Alliance Shipping!',
    thankBody: 'Esperamos que est\u00e9 satisfecho con nuestro servicio. Sus comentarios nos ayudan a mejorar.',
    thankReturn: '\u00a1Esperamos servirle nuevamente pronto!',
    buttonLabel: 'Ver Historial del Paquete',
    footer: 'Alliance Shipping - Env\u00edos Confiables de USA a Hait\u00ed',
    automated: 'Este es un mensaje autom\u00e1tico, por favor no responda.',
  },
};

// Template: Package Delivered
export const sendPackageDeliveredEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string,
  recipientName: string,
  locale: string = 'fr'
) => {
  const lang = (['ht', 'fr', 'en', 'es'].includes(locale) ? locale : 'fr') as Locale;
  const s = deliveredStrings[lang];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

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
          .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { background: #ffffff; padding: 32px 24px; border-radius: 0 0 12px 12px; }
          .card { background: #f9fafb; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #e5e7eb; }
          .tracking { font-size: 24px; font-weight: 800; color: #059669; text-align: center; padding: 16px; background: #f3f4f6; border-radius: 8px; font-family: 'Courier New', monospace; letter-spacing: 1px; }
          .success { background: #d1fae5; padding: 20px; border-radius: 10px; text-align: center; }
          .btn-container { text-align: center; margin: 24px 0; }
          .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; }
          .footer { text-align: center; padding: 24px; color: #9ca3af; font-size: 12px; }
          .divider { height: 1px; background: #e5e7eb; margin: 24px 0; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <h1>\u{1F389} ${s.headerTitle}</h1>
            </div>
            <div class="content">
              <p>${s.greeting}, <strong>${userName}</strong>!</p>
              <p>${s.body}</p>

              <div class="card">
                <h3>${s.trackingLabel}</h3>
                <div class="tracking">${trackingNumber}</div>
              </div>

              <div class="success">
                <h2 style="color: #065f46; margin: 0;">\u2705 ${s.deliveryConfirmed}</h2>
                <p style="color: #047857; margin-top: 10px;">${s.receivedBy} <strong>${recipientName}</strong></p>
              </div>

              <div class="card">
                <h3>${s.thankTitle}</h3>
                <p>${s.thankBody}</p>
                <p>${s.thankReturn}</p>
              </div>

              <div class="btn-container">
                <a href="${appUrl}/packages" class="button">${s.buttonLabel}</a>
              </div>
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

/**
 * Send customs fees notification email
 */
export const sendCustomsFeesEmail = async (
  to: string,
  userName: string,
  trackingNumber: string,
  oldTotal: number,
  newTotal: number,
  customsFees: number,
  locale: string = 'fr'
): Promise<any> => {
  const translations: Record<string, any> = {
    fr: {
      subject: `⚠️ Frais de douane ajoutés - Colis ${trackingNumber}`,
      title: 'Frais de Douane Ajoutés',
      greeting: `Bonjour ${userName},`,
      message: 'Des frais de douane ont été ajoutés à votre colis.',
      trackingLabel: 'Numéro de suivi',
      oldTotalLabel: 'Ancien total:',
      customsLabel: 'Frais de douane:',
      newTotalLabel: 'Nouveau total:',
      footer: 'Vous pouvez voir les détails de votre colis dans votre compte.',
      buttonLabel: 'Voir Mon Colis',
      automated: 'Ceci est un email automatique. Ne répondez pas directement.',
      companyFooter: '© 2026 Alliance Shipping. Tous droits réservés.',
    },
    ht: {
      subject: `⚠️ Frè dwan ajoute - Pakè ${trackingNumber}`,
      title: 'Frè Dwan Ajoute',
      greeting: `Bonjou ${userName},`,
      message: 'Yo ajoute frè dwan nan pakè w la.',
      trackingLabel: 'Nimewo pakè',
      oldTotalLabel: 'Ansyen total:',
      customsLabel: 'Frè dwan:',
      newTotalLabel: 'Nouvo total:',
      footer: 'Ou ka gade detay pakè w la nan kont ou.',
      buttonLabel: 'Gade Pakè Mwen',
      automated: 'Sa se yon imèl otomatik. Pa reponn dirèkteman.',
      companyFooter: '© 2026 Alliance Shipping. Tout dwa rezève.',
    },
    en: {
      subject: `⚠️ Customs fees added - Package ${trackingNumber}`,
      title: 'Customs Fees Added',
      greeting: `Hello ${userName},`,
      message: 'Customs fees have been added to your package.',
      trackingLabel: 'Tracking number',
      oldTotalLabel: 'Previous total:',
      customsLabel: 'Customs fees:',
      newTotalLabel: 'New total:',
      footer: 'You can view your package details in your account.',
      buttonLabel: 'View My Package',
      automated: 'This is an automated email. Please do not reply directly.',
      companyFooter: '© 2026 Alliance Shipping. All rights reserved.',
    },
    es: {
      subject: `⚠️ Tasas aduaneras agregadas - Paquete ${trackingNumber}`,
      title: 'Tasas Aduaneras Agregadas',
      greeting: `Hola ${userName},`,
      message: 'Se han agregado tasas aduaneras a su paquete.',
      trackingLabel: 'Número de seguimiento',
      oldTotalLabel: 'Total anterior:',
      customsLabel: 'Tasas aduaneras:',
      newTotalLabel: 'Nuevo total:',
      footer: 'Puede ver los detalles de su paquete en su cuenta.',
      buttonLabel: 'Ver Mi Paquete',
      automated: 'Este es un correo automático. No responda directamente.',
      companyFooter: '© 2026 Alliance Shipping. Todos los derechos reservados.',
    },
  };

  const t = translations[locale] || translations.fr;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://allianceshipping.com';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${t.title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #f9fafb;
          padding: 40px 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
          padding: 32px;
          text-align: center;
        }
        .warning-icon {
          display: inline-block;
          width: 64px;
          height: 64px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          margin-bottom: 16px;
          line-height: 64px;
          font-size: 32px;
        }
        .header h1 {
          color: white;
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 32px;
        }
        .greeting {
          font-size: 16px;
          color: #4b5563;
          margin-bottom: 24px;
        }
        .tracking-box {
          background: #f3f4f6;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 24px;
          text-align: center;
        }
        .tracking-label {
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 8px;
        }
        .tracking-number {
          color: #1f2937;
          font-size: 20px;
          font-weight: bold;
          font-family: monospace;
        }
        .price-breakdown {
          border: 2px solid #fee2e2;
          border-radius: 12px;
          padding: 20px;
          background: #fef2f2;
          margin-bottom: 24px;
        }
        .price-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .price-row.customs {
          padding: 12px;
          background: white;
          border-radius: 8px;
          margin-bottom: 12px;
        }
        .price-row.customs .label {
          color: #dc2626;
          font-weight: 600;
        }
        .price-row.customs .amount {
          color: #dc2626;
          font-weight: bold;
        }
        .price-row.total {
          padding-top: 12px;
          border-top: 2px solid #fecaca;
        }
        .price-row.total .label {
          font-weight: bold;
          color: #1f2937;
        }
        .price-row.total .amount {
          font-weight: bold;
          font-size: 20px;
          color: #dc2626;
        }
        .label { color: #6b7280; }
        .amount { font-weight: 600; color: #1f2937; }
        .footer-text {
          color: #6b7280;
          font-size: 14px;
          text-align: center;
          margin-bottom: 24px;
        }
        .button {
          display: inline-block;
          background: #dc2626;
          color: white;
          padding: 14px 32px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
        }
        .button-container {
          text-align: center;
        }
        .footer {
          background: #f9fafb;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .footer p {
          color: #9ca3af;
          font-size: 12px;
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="warning-icon">⚠️</div>
          <h1>${t.title}</h1>
        </div>

        <div class="content">
          <p class="greeting">${t.greeting}</p>
          <p class="greeting">${t.message}</p>

          <div class="tracking-box">
            <p class="tracking-label">${t.trackingLabel}</p>
            <p class="tracking-number">${trackingNumber}</p>
          </div>

          <div class="price-breakdown">
            <div class="price-row">
              <span class="label">${t.oldTotalLabel}</span>
              <span class="amount">$${oldTotal.toFixed(2)}</span>
            </div>
            <div class="price-row customs">
              <span class="label">${t.customsLabel}</span>
              <span class="amount">+$${customsFees.toFixed(2)}</span>
            </div>
            <div class="price-row total">
              <span class="label">${t.newTotalLabel}</span>
              <span class="amount">$${newTotal.toFixed(2)}</span>
            </div>
          </div>

          <p class="footer-text">${t.footer}</p>

          <div class="button-container">
            <a href="${appUrl}/packages" class="button">${t.buttonLabel}</a>
          </div>
        </div>

        <div class="footer">
          <p><strong>${t.companyFooter}</strong></p>
          <p>${t.automated}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to, subject: t.subject, html });
};

// Re-export warehouse change email
export { sendWarehouseChangeEmail } from './warehouse-change';
