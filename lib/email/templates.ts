/**
 * Email Templates for Alliance Shipping
 * Professional HTML email templates with inline CSS
 */

interface EmailData {
  userName: string;
  trackingNumber?: string;
  status?: string;
  estimatedDelivery?: string;
  recipientName?: string;
  recipientCity?: string;
}

const baseStyles = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #f9fafb;
  margin: 0;
  padding: 0;
`;

const containerStyles = `
  max-width: 600px;
  margin: 0 auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
`;

const cardStyles = `
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

export const emailTemplates = {
  // Email de confirmation de nouveau colis
  newPackage: ({ userName, trackingNumber, recipientName, recipientCity }: EmailData) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nouveau colis enregistré</title>
    </head>
    <body style="${baseStyles}">
      <div style="${containerStyles}">
        <div style="${cardStyles}">
          <img src="https://via.placeholder.com/150x50/0066CC/FFFFFF?text=Alliance+Shipping" alt="Alliance Shipping" style="margin-bottom: 30px;" />

          <h1 style="color: #1f2937; font-size: 28px; margin-bottom: 20px;">
            Votre colis est enregistré! 📦
          </h1>

          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Bonjour <strong>${userName}</strong>,
          </p>

          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Nous avons bien reçu votre colis et il est maintenant en cours de traitement.
          </p>

          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 24px; margin: 30px 0; text-align: center;">
            <p style="color: white; font-size: 14px; margin-bottom: 8px;">Numéro de suivi</p>
            <h2 style="color: white; font-size: 32px; margin: 0; font-weight: bold; letter-spacing: 1px;">
              ${trackingNumber}
            </h2>
          </div>

          <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1f2937; font-size: 18px; margin-bottom: 15px;">Détails de l'envoi</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Destinataire:</td>
                <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${recipientName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Destination:</td>
                <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${recipientCity}, Haïti</td>
              </tr>
            </table>
          </div>

          <a href="https://allianceshipping.com/packages" style="display: inline-block; background: #0066CC; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px;">
            Suivre mon colis
          </a>

          <p style="color: #9ca3af; font-size: 14px; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
            Vous recevrez des notifications à chaque étape du transport.
          </p>
        </div>

        <p style="text-align: center; color: white; font-size: 12px; margin-top: 20px;">
          © 2026 Alliance Shipping. Tous droits réservés.
        </p>
      </div>
    </body>
    </html>
  `,

  // Email de mise à jour du statut
  statusUpdate: ({ userName, trackingNumber, status, estimatedDelivery }: EmailData) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Mise à jour de votre colis</title>
    </head>
    <body style="${baseStyles}">
      <div style="${containerStyles}">
        <div style="${cardStyles}">
          <img src="https://via.placeholder.com/150x50/0066CC/FFFFFF?text=Alliance+Shipping" alt="Alliance Shipping" style="margin-bottom: 30px;" />

          <h1 style="color: #1f2937; font-size: 28px; margin-bottom: 20px;">
            Votre colis est en mouvement! 🚀
          </h1>

          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Bonjour <strong>${userName}</strong>,
          </p>

          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Le statut de votre colis <strong>${trackingNumber}</strong> a été mis à jour.
          </p>

          <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 8px;">
            <p style="color: #1e40af; font-size: 14px; margin: 0; font-weight: 600;">
              Nouveau statut: ${status}
            </p>
          </div>

          ${estimatedDelivery ? `
            <div style="background: #dcfce7; border-left: 4px solid #22c55e; padding: 20px; margin: 30px 0; border-radius: 8px;">
              <p style="color: #166534; font-size: 14px; margin: 0; font-weight: 600;">
                Livraison prévue: ${estimatedDelivery}
              </p>
            </div>
          ` : ''}

          <a href="https://allianceshipping.com/packages" style="display: inline-block; background: #0066CC; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px;">
            Voir les détails
          </a>

          <p style="color: #9ca3af; font-size: 14px; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
            Nous vous tiendrons informé de chaque étape.
          </p>
        </div>

        <p style="text-align: center; color: white; font-size: 12px; margin-top: 20px;">
          © 2026 Alliance Shipping. Tous droits réservés.
        </p>
      </div>
    </body>
    </html>
  `,

  // Email de livraison confirmée
  delivered: ({ userName, trackingNumber, recipientName }: EmailData) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Colis livré!</title>
    </head>
    <body style="${baseStyles}">
      <div style="${containerStyles}">
        <div style="${cardStyles}">
          <div style="text-align: center;">
            <div style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); width: 80px; height: 80px; border-radius: 50%; margin-bottom: 20px; padding: 20px;">
              <span style="font-size: 40px;">✓</span>
            </div>
          </div>

          <h1 style="color: #1f2937; font-size: 32px; margin-bottom: 20px; text-align: center;">
            Livraison réussie! 🎉
          </h1>

          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px; text-align: center;">
            Bonjour <strong>${userName}</strong>,
          </p>

          <p style="color: #4b5563; font-size: 18px; line-height: 1.6; margin-bottom: 30px; text-align: center; font-weight: 600;">
            Votre colis a été livré avec succès à <strong>${recipientName}</strong>!
          </p>

          <div style="background: #dcfce7; border-radius: 12px; padding: 24px; margin: 30px 0; text-align: center;">
            <p style="color: #166534; font-size: 14px; margin-bottom: 8px;">Numéro de suivi</p>
            <h2 style="color: #166534; font-size: 24px; margin: 0; font-weight: bold;">
              ${trackingNumber}
            </h2>
          </div>

          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 30px 0; text-align: center;">
            Merci d'avoir choisi Alliance Shipping! 🙏
          </p>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://allianceshipping.com/calculator" style="display: inline-block; background: #0066CC; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Envoyer un nouveau colis
            </a>
          </div>
        </div>

        <p style="text-align: center; color: white; font-size: 12px; margin-top: 20px;">
          © 2026 Alliance Shipping. Tous droits réservés.
        </p>
      </div>
    </body>
    </html>
  `,
};
