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
    const data = await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    // Log success
    logEmailAttempt(to, subject, 'SUCCESS', data);
    return { success: true, data };
  } catch (error: any) {
    // Log error with details
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
    subject: '📦 Demann Koli Soumèt - Alliance Shipping',
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
    subject: '📦 Demande de Colis Soumise - Alliance Shipping',
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
    subject: '📦 Package Request Submitted - Alliance Shipping',
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
    subject: '📦 Solicitud de Paquete Enviada - Alliance Shipping',
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
  const subject = '✅ Package Request Approved - Alliance Shipping';
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
  const subject = '❌ Package Request Rejected - Alliance Shipping';
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

// Template: Package Status Changed
export const sendPackageStatusChangeEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string,
  newStatus: string,
  statusMessage: string
) => {
  const statusColors: { [key: string]: string } = {
    'received': '#3b82f6',
    'in-transit': '#8b5cf6',
    'available': '#10b981',
    'delivered': '#059669',
  };

  const statusEmojis: { [key: string]: string } = {
    'received': '📦',
    'in-transit': '🚚',
    'available': '✅',
    'delivered': '🎉',
  };

  const statusLabels: { [key: string]: string } = {
    'received': 'Received',
    'in-transit': 'In Transit',
    'available': 'Available for Pickup',
    'delivered': 'Delivered',
  };

  const color = statusColors[newStatus] || '#667eea';
  const emoji = statusEmojis[newStatus] || '📦';
  const label = statusLabels[newStatus] || newStatus;

  const subject = `${emoji} Package Status Update - ${label}`;
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .tracking { font-size: 24px; font-weight: bold; color: ${color}; text-align: center; padding: 15px; background: #f3f4f6; border-radius: 8px; }
          .status-badge { background: ${color}22; color: ${color}; padding: 10px 20px; border-radius: 20px; display: inline-block; font-weight: bold; font-size: 18px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background: ${color}; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${emoji} Package Status Updated</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            <p>Your package status has been updated!</p>

            <div class="card">
              <h3>Tracking Number:</h3>
              <div class="tracking">${trackingNumber}</div>
            </div>

            <div class="card" style="text-align: center;">
              <h3>New Status:</h3>
              <div class="status-badge">${emoji} ${label}</div>
              <p style="margin-top: 20px; color: #6b7280;">${statusMessage}</p>
            </div>

            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/packages" class="button">
                Track Your Package
              </a>
            </div>

            <p style="margin-top: 30px;">Thank you for using Alliance Shipping!</p>

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

// Template: Package Available for Pickup
export const sendPackageAvailableEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string,
  pickupLocation: string
) => {
  const subject = '✅ Package Available for Pickup - Alliance Shipping';
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
          .location { background: #d1fae5; padding: 15px; border-radius: 8px; text-align: center; font-size: 18px; font-weight: bold; color: #065f46; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Package Ready for Pickup!</h1>
          </div>
          <div class="content">
            <p>Excellent news, <strong>${userName}</strong>!</p>
            <p>Your package has arrived in Haiti and is now available for pickup.</p>

            <div class="card">
              <h3>Tracking Number:</h3>
              <div class="tracking">${trackingNumber}</div>
            </div>

            <div class="card">
              <h3>Pickup Location:</h3>
              <div class="location">📍 ${pickupLocation}</div>
            </div>

            <div class="card">
              <h3>What to Bring:</h3>
              <ul>
                <li>This email or tracking number</li>
                <li>Valid government-issued ID</li>
                <li>Payment for any remaining fees (if applicable)</li>
              </ul>
            </div>

            <div class="card">
              <h3>Pickup Hours:</h3>
              <p><strong>Monday - Friday:</strong> 8:00 AM - 5:00 PM</p>
              <p><strong>Saturday:</strong> 9:00 AM - 2:00 PM</p>
              <p><strong>Sunday:</strong> Closed</p>
            </div>

            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/packages" class="button">
                View Package Details
              </a>
            </div>

            <p style="margin-top: 30px;">We look forward to seeing you soon!</p>

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

// Template: Package Delivered
export const sendPackageDeliveredEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string,
  recipientName: string
) => {
  const subject = '🎉 Package Delivered Successfully - Alliance Shipping';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .tracking { font-size: 24px; font-weight: bold; color: #059669; text-align: center; padding: 15px; background: #f3f4f6; border-radius: 8px; }
          .success { background: #d1fae5; padding: 20px; border-radius: 8px; text-align: center; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background: #059669; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Package Delivered!</h1>
          </div>
          <div class="content">
            <p>Congratulations, <strong>${userName}</strong>!</p>
            <p>Your package has been successfully delivered.</p>

            <div class="card">
              <h3>Tracking Number:</h3>
              <div class="tracking">${trackingNumber}</div>
            </div>

            <div class="success">
              <h2 style="color: #065f46; margin: 0;">✅ Delivery Confirmed</h2>
              <p style="color: #047857; margin-top: 10px;">Received by: <strong>${recipientName}</strong></p>
            </div>

            <div class="card">
              <h3>Thank You for Choosing Alliance Shipping!</h3>
              <p>We hope you're satisfied with our service. Your feedback helps us improve.</p>
              <p>We look forward to serving you again soon!</p>
            </div>

            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/packages" class="button">
                View Package History
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
