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
  newCost: number
) => {
  const costDiff = newCost - oldCost;
  const subject = '⚖️ Package Weight Updated - Alliance Shipping';
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
            <h1>⚖️ Package Weight Updated</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            <p>The weight of your package has been updated after inspection at our warehouse.</p>

            <div class="card">
              <h3>Tracking Number:</h3>
              <div class="tracking">${trackingNumber}</div>
            </div>

            <div class="card">
              <h3>Weight Change:</h3>
              <div style="text-align: center; margin: 20px 0;">
                <div style="margin-bottom: 10px;">
                  <span class="old-value" style="font-size: 18px;">${oldWeight} lbs</span>
                  <span style="margin: 0 10px;">→</span>
                  <span class="new-value">${newWeight} lbs</span>
                </div>
                <p style="color: #6b7280; font-size: 14px;">
                  ${newWeight > oldWeight ? 'Weight increased' : 'Weight decreased'} by ${Math.abs(newWeight - oldWeight)} lbs
                </p>
              </div>
            </div>

            <div class="card">
              <h3>Cost Update:</h3>
              <div style="text-align: center; margin: 20px 0;">
                <div style="margin-bottom: 10px;">
                  <span class="old-value" style="font-size: 18px;">$${oldCost.toFixed(2)}</span>
                  <span style="margin: 0 10px;">→</span>
                  <span class="new-value">$${newCost.toFixed(2)}</span>
                </div>
                ${costDiff !== 0 ? `
                <p class="${costDiff > 0 ? 'cost-increase' : 'cost-decrease'}" style="font-size: 16px;">
                  ${costDiff > 0 ? '+' : ''}$${costDiff.toFixed(2)}
                  ${costDiff > 0 ? '(Additional charge)' : '(Credit applied)'}
                </p>
                ` : ''}
              </div>
            </div>

            <div class="card">
              <h3>Why was this adjusted?</h3>
              <p>We verify all package weights at our warehouse to ensure accurate shipping costs. The actual weight may differ from the initial estimate.</p>
            </div>

            <div style="text-align: center;">
              <a href="${APP_URL}/dashboard/packages" class="button">
                View Package Details
              </a>
            </div>

            <p style="margin-top: 30px;">If you have any questions about this adjustment, please contact us.</p>

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

// Template: Fees Modified
export const sendFeesModifiedEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string,
  oldTotal: number,
  newTotal: number,
  reason: string
) => {
  const costDiff = newTotal - oldTotal;
  const subject = '💰 Package Fees Updated - Alliance Shipping';
  const html = `
    <!DOCTYPE html>
    <html>
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
            <h1>💰 Package Fees Updated</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            <p>The fees for your package have been updated.</p>

            <div class="card">
              <h3>Tracking Number:</h3>
              <div class="tracking">${trackingNumber}</div>
            </div>

            <div class="card">
              <h3>Total Cost Update:</h3>
              <div style="text-align: center; margin: 20px 0;">
                <div style="margin-bottom: 10px;">
                  <span class="old-value">$${oldTotal.toFixed(2)}</span>
                  <span style="margin: 0 10px;">→</span>
                  <span class="new-value">$${newTotal.toFixed(2)}</span>
                </div>
                ${costDiff !== 0 ? `
                <p class="${costDiff > 0 ? 'cost-increase' : 'cost-decrease'}" style="font-size: 18px; margin-top: 15px;">
                  ${costDiff > 0 ? 'Additional:' : 'Discount:'} ${costDiff > 0 ? '+' : ''}$${Math.abs(costDiff).toFixed(2)}
                </p>
                ` : ''}
              </div>
            </div>

            <div class="card">
              <h3>Reason for Adjustment:</h3>
              <div class="reason-box">
                ${reason}
              </div>
            </div>

            <div style="text-align: center;">
              <a href="${APP_URL}/dashboard/packages" class="button">
                View Updated Invoice
              </a>
            </div>

            <p style="margin-top: 30px;">If you have questions about this fee adjustment, please contact our support team.</p>

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

// Template: Package Information Modified
export const sendPackageInfoModifiedEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string,
  modifiedFields: string[]
) => {
  const subject = '📝 Package Information Updated - Alliance Shipping';
  const html = `
    <!DOCTYPE html>
    <html>
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
            <h1>📝 Package Information Updated</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            <p>Some information about your package has been updated by our team.</p>

            <div class="card">
              <h3>Tracking Number:</h3>
              <div class="tracking">${trackingNumber}</div>
            </div>

            <div class="card">
              <h3>Updated Fields:</h3>
              <ul class="field-list">
                ${modifiedFields.map(field => `<li>${field}</li>`).join('')}
              </ul>
            </div>

            <div class="card">
              <h3>What's Next?</h3>
              <p>Please review the updated information in your dashboard to ensure everything is correct.</p>
              <p>If you notice any discrepancies, please contact us immediately.</p>
            </div>

            <div style="text-align: center;">
              <a href="${APP_URL}/dashboard/packages" class="button">
                View Updated Details
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
// SPECIAL ITEMS TEMPLATES
// ============================================

// Template: Special Item Added
export const sendSpecialItemAddedEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string,
  itemName: string,
  itemFee: number,
  newTotal: number
) => {
  const subject = '🎁 Special Item Added to Package - Alliance Shipping';
  const html = `
    <!DOCTYPE html>
    <html>
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
            <h1>🎁 Special Item Added</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            <p>A special item has been added to your package.</p>

            <div class="card">
              <h3>Tracking Number:</h3>
              <div class="tracking">${trackingNumber}</div>
            </div>

            <div class="card" style="text-align: center;">
              <h3>Added Item:</h3>
              <div class="item-badge">${itemName}</div>
              <p style="font-size: 18px; color: #6b7280; margin-top: 10px;">
                Additional Fee: <strong>$${itemFee.toFixed(2)}</strong>
              </p>
            </div>

            <div class="card">
              <h3>New Total Cost:</h3>
              <div class="total">$${newTotal.toFixed(2)}</div>
              <p style="text-align: center; color: #6b7280; font-size: 14px;">
                This includes the special item fee
              </p>
            </div>

            <div style="text-align: center;">
              <a href="${APP_URL}/dashboard/packages" class="button">
                View Package Details
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

// Template: Special Item Removed
export const sendSpecialItemRemovedEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string,
  itemName: string,
  refundAmount: number,
  newTotal: number
) => {
  const subject = '🔄 Special Item Removed from Package - Alliance Shipping';
  const html = `
    <!DOCTYPE html>
    <html>
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
            <h1>🔄 Special Item Removed</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            <p>A special item has been removed from your package.</p>

            <div class="card">
              <h3>Tracking Number:</h3>
              <div class="tracking">${trackingNumber}</div>
            </div>

            <div class="card" style="text-align: center;">
              <h3>Removed Item:</h3>
              <p style="font-size: 18px; color: #6b7280;">${itemName}</p>
              <div class="refund">-$${refundAmount.toFixed(2)} Refunded</div>
            </div>

            <div class="card">
              <h3>New Total Cost:</h3>
              <div class="total">$${newTotal.toFixed(2)}</div>
              <p style="text-align: center; color: #6b7280; font-size: 14px;">
                The item fee has been deducted
              </p>
            </div>

            <div style="text-align: center;">
              <a href="${APP_URL}/dashboard/packages" class="button">
                View Package Details
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
// ADMIN MESSAGES & COMMUNICATION TEMPLATES
// ============================================

// Template: Admin Message
export const sendAdminMessageEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string,
  message: string,
  adminName: string
) => {
  const subject = '💬 Message from Alliance Shipping Team';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .tracking { font-size: 18px; font-weight: bold; color: #06b6d4; text-align: center; padding: 12px; background: #cffafe; border-radius: 8px; }
          .message-box { background: #f0fdfa; border-left: 4px solid #06b6d4; padding: 20px; margin: 20px 0; font-size: 16px; line-height: 1.8; }
          .signature { text-align: right; color: #6b7280; font-style: italic; margin-top: 15px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background: #06b6d4; color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💬 Message from Our Team</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            <p>Our team has sent you a message regarding your package.</p>

            <div class="card">
              <h3>Package:</h3>
              <div class="tracking">${trackingNumber}</div>
            </div>

            <div class="card">
              <h3>Message:</h3>
              <div class="message-box">
                ${message.replace(/\n/g, '<br>')}
                <div class="signature">- ${adminName}, Alliance Shipping Team</div>
              </div>
            </div>

            <div class="card">
              <p><strong>Need to respond?</strong></p>
              <p>Please reply to this email or contact us through your dashboard.</p>
            </div>

            <div style="text-align: center;">
              <a href="${APP_URL}/dashboard/packages" class="button">
                View Package
              </a>
            </div>

            <div class="footer">
              <p>Alliance Shipping - Reliable Shipping from USA to Haiti</p>
              <p>You can reply to this email to contact our team.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: userEmail, subject, html });
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
