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

// Template: Package Request Approved
export const sendPackageApprovedEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string,
  totalCost: number
) => {
  const subject = 'Package Request Approved - Alliance Shipping';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .tracking { font-size: 24px; font-weight: bold; color: #10b981; text-align: center; padding: 15px; background: #f3f4f6; border-radius: 8px; }
          .cost { font-size: 28px; font-weight: bold; color: #059669; text-align: center; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .success-badge { background: #d1fae5; color: #065f46; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Package Request Approved!</h1>
          </div>
          <div class="content">
            <p>Great news, <strong>${userName}</strong>!</p>
            <p>Your package request has been approved and confirmed. Your package is now being processed.</p>

            <div class="card">
              <h3>Tracking Number:</h3>
              <div class="tracking">${trackingNumber}</div>

              <h3 style="margin-top: 20px;">Total Cost:</h3>
              <div class="cost">$${totalCost.toFixed(2)}</div>
            </div>

            <div class="card">
              <h3>Package Status:</h3>
              <p><span class="success-badge">RECEIVED</span></p>
              <p style="margin-top: 15px;">Your package has been received at our warehouse and will be processed for shipping to Haiti.</p>
            </div>

            <div class="card">
              <h3>Next Steps:</h3>
              <ul>
                <li>Your package will be prepared for transit</li>
                <li>You'll receive updates as the status changes</li>
                <li>Track your package in real-time from your dashboard</li>
                <li>You'll be notified when it's ready for pickup</li>
              </ul>
            </div>

            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/packages" class="button">
                Track Your Package
              </a>
            </div>

            <p style="margin-top: 30px;">Thank you for choosing Alliance Shipping!</p>

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

// Template: Package Request Rejected
export const sendPackageRejectedEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string,
  reason?: string
) => {
  const subject = 'Package Request Update - Alliance Shipping';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .tracking { font-size: 20px; font-weight: bold; color: #ef4444; text-align: center; padding: 15px; background: #fee2e2; border-radius: 8px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .reason-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Package Request Rejected</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            <p>We regret to inform you that your package request has been rejected.</p>

            <div class="card">
              <h3>Tracking Number:</h3>
              <div class="tracking">${trackingNumber}</div>
            </div>

            ${reason ? `
            <div class="card">
              <h3>Reason for Rejection:</h3>
              <div class="reason-box">
                ${reason}
              </div>
            </div>
            ` : ''}

            <div class="card">
              <h3>What Can You Do?</h3>
              <ul>
                <li>Review the reason for rejection above</li>
                <li>Contact our support team for more information</li>
                <li>Submit a new request with the correct information</li>
                <li>Ensure all package details are accurate</li>
              </ul>
            </div>

            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/packages" class="button">
                View Dashboard
              </a>
            </div>

            <p style="margin-top: 30px;">If you have any questions or concerns, please contact our support team.</p>

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

// Re-export warehouse change email
export { sendWarehouseChangeEmail } from './warehouse-change';
