import { Resend } from 'resend';
import { emailTemplates } from './templates';

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not defined. Email functionality will be disabled.');
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@allianceshipping.com';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!resend) {
    console.log('Email not sent (Resend not configured):', { to, subject });
    return { success: false, error: 'Resend not configured' };
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

// Email functions
export const emailService = {
  // Email de nouveau colis
  sendNewPackageEmail: async (params: {
    to: string;
    userName: string;
    trackingNumber: string;
    recipientName: string;
    recipientCity: string;
  }) => {
    return sendEmail({
      to: params.to,
      subject: `Nouveau colis enregistré - ${params.trackingNumber}`,
      html: emailTemplates.newPackage(params),
    });
  },

  // Email de mise à jour de statut
  sendStatusUpdateEmail: async (params: {
    to: string;
    userName: string;
    trackingNumber: string;
    status: string;
    estimatedDelivery?: string;
  }) => {
    return sendEmail({
      to: params.to,
      subject: `Mise à jour: ${params.trackingNumber} - ${params.status}`,
      html: emailTemplates.statusUpdate(params),
    });
  },

  // Email de livraison confirmée
  sendDeliveredEmail: async (params: {
    to: string;
    userName: string;
    trackingNumber: string;
    recipientName: string;
  }) => {
    return sendEmail({
      to: params.to,
      subject: `✅ Livraison confirmée - ${params.trackingNumber}`,
      html: emailTemplates.delivered(params),
    });
  },
};
