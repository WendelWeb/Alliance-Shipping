import { sendEmail } from './service';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// ============================================
// USER SUBMISSION WORKFLOW
// ============================================

// Template: Package Request Submitted Successfully
export const sendRequestSubmittedSuccessEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string,
  estimatedReviewTime: string = '24-48 hours'
) => {
  const subject = '✅ Package Request Submitted Successfully - Alliance Shipping';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .tracking { font-size: 24px; font-weight: bold; color: #10b981; text-align: center; padding: 15px; background: #d1fae5; border-radius: 8px; }
          .success-icon { font-size: 64px; text-align: center; margin: 20px 0; }
          .timeline { margin: 20px 0; }
          .timeline-item { display: flex; align-items: start; margin: 15px 0; padding-left: 30px; position: relative; }
          .timeline-item:before { content: '✓'; position: absolute; left: 0; background: #10b981; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; }
          .timeline-item.pending:before { content: '○'; background: #e5e7eb; color: #6b7280; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="success-icon">✅</div>
            <h1>Request Submitted Successfully!</h1>
          </div>
          <div class="content">
            <p>Excellent, <strong>${userName}</strong>!</p>
            <p>Your package request has been successfully submitted and is now in our system.</p>

            <div class="card">
              <h3>Your External Tracking Number:</h3>
              <div class="tracking">${trackingNumber}</div>
              <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 10px;">
                Save this number for your records
              </p>
            </div>

            <div class="card">
              <h3>What Happens Next?</h3>
              <div class="timeline">
                <div class="timeline-item">
                  <div>
                    <strong>✅ Request Received</strong><br>
                    <span style="color: #6b7280; font-size: 14px;">Completed just now</span>
                  </div>
                </div>
                <div class="timeline-item pending">
                  <div>
                    <strong>Review & Verification</strong><br>
                    <span style="color: #6b7280; font-size: 14px;">Our team will review your request (${estimatedReviewTime})</span>
                  </div>
                </div>
                <div class="timeline-item pending">
                  <div>
                    <strong>Approval & Assignment</strong><br>
                    <span style="color: #6b7280; font-size: 14px;">You'll receive your Alliance Shipping tracking number</span>
                  </div>
                </div>
                <div class="timeline-item pending">
                  <div>
                    <strong>Package Processing</strong><br>
                    <span style="color: #6b7280; font-size: 14px;">Your package will be prepared for shipping to Haiti</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="card">
              <h3>📧 Stay Informed</h3>
              <p>We'll send you email updates at every step:</p>
              <ul>
                <li>When your request is approved</li>
                <li>When your package is received at our warehouse</li>
                <li>When it's in transit to Haiti</li>
                <li>When it's ready for pickup</li>
                <li>When it's delivered</li>
              </ul>
            </div>

            <div class="card" style="background: #f0fdf4;">
              <h3>💡 Pro Tip</h3>
              <p>You can track your request status anytime from your dashboard. We typically review requests within ${estimatedReviewTime}.</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${APP_URL}/dashboard/packages" class="button">
                View Request Status
              </a>
            </div>

            <p style="margin-top: 30px;">Thank you for choosing Alliance Shipping!</p>

            <div class="footer">
              <p>Alliance Shipping - Reliable Shipping from USA to Haiti</p>
              <p>Questions? Contact us at allianceshipping26@gmail.com</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: userEmail, subject, html });
};

// Template: Request Under Review
export const sendRequestUnderReviewEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string,
  reviewerName: string
) => {
  const subject = '🔍 Your Request is Under Review - Alliance Shipping';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .tracking { font-size: 20px; font-weight: bold; color: #3b82f6; text-align: center; padding: 12px; background: #dbeafe; border-radius: 8px; }
          .progress-bar { width: 100%; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; margin: 20px 0; }
          .progress-fill { width: 33%; height: 100%; background: linear-gradient(90deg, #3b82f6, #2563eb); }
          .reviewer { display: flex; align-items: center; gap: 15px; background: #eff6ff; padding: 15px; border-radius: 8px; }
          .reviewer-avatar { width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #2563eb); display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔍 Request Under Review</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            <p>Great news! Your package request is now being reviewed by our team.</p>

            <div class="card">
              <h3>External Tracking Number:</h3>
              <div class="tracking">${trackingNumber}</div>
            </div>

            <div class="card">
              <h3>Review Progress:</h3>
              <div class="progress-bar">
                <div class="progress-fill"></div>
              </div>
              <p style="text-align: center; color: #6b7280; font-size: 14px;">33% Complete - Under Review</p>
            </div>

            <div class="card">
              <h3>Assigned Reviewer:</h3>
              <div class="reviewer">
                <div class="reviewer-avatar">${reviewerName.charAt(0)}</div>
                <div>
                  <strong>${reviewerName}</strong><br>
                  <span style="color: #6b7280; font-size: 14px;">Alliance Shipping Team</span>
                </div>
              </div>
            </div>

            <div class="card">
              <h3>What We're Checking:</h3>
              <ul>
                <li>✓ Package information accuracy</li>
                <li>✓ Destination and recipient details</li>
                <li>✓ Weight and size estimates</li>
                <li>✓ Prohibited items screening</li>
                <li>✓ Shipping requirements verification</li>
              </ul>
            </div>

            <div class="card" style="background: #eff6ff;">
              <h3>📱 We May Contact You</h3>
              <p>If we need any additional information or clarification, we'll reach out via email or phone.</p>
              <p>Please ensure your contact information is up to date.</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${APP_URL}/dashboard/packages" class="button">
                Check Review Status
              </a>
            </div>

            <p style="margin-top: 30px;">You'll receive a notification as soon as the review is complete!</p>

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
// STATUS-SPECIFIC TEMPLATES
// ============================================

// Template: Package Received at Warehouse (Detailed)
export const sendPackageReceivedDetailedEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string,
  warehouseLocation: string,
  receivedDate: string,
  actualWeight: number,
  inspectionNotes?: string
) => {
  const subject = '📦 Package Received at Warehouse - Alliance Shipping';
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
          .tracking { font-size: 24px; font-weight: bold; color: #06b6d4; text-align: center; padding: 15px; background: #cffafe; border-radius: 8px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .info-item { background: #f0fdfa; padding: 15px; border-radius: 8px; border-left: 4px solid #06b6d4; }
          .info-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
          .info-value { font-size: 18px; font-weight: bold; color: #0891b2; margin-top: 5px; }
          .warehouse-badge { background: #06b6d4; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; }
          .notes-box { background: #ecfeff; border-left: 4px solid #06b6d4; padding: 15px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background: #06b6d4; color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Package Received!</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            <p>Great news! Your package has been received at our warehouse and is being processed.</p>

            <div class="card">
              <h3>Alliance Shipping Tracking Number:</h3>
              <div class="tracking">${trackingNumber}</div>
            </div>

            <div class="card">
              <h3>Warehouse Details:</h3>
              <p style="text-align: center; margin: 20px 0;">
                <span class="warehouse-badge">📍 ${warehouseLocation}</span>
              </p>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Received Date</div>
                  <div class="info-value">${receivedDate}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Actual Weight</div>
                  <div class="info-value">${actualWeight} lbs</div>
                </div>
              </div>
            </div>

            ${inspectionNotes ? `
            <div class="card">
              <h3>Inspection Notes:</h3>
              <div class="notes-box">
                ${inspectionNotes}
              </div>
            </div>
            ` : ''}

            <div class="card">
              <h3>✅ What We've Done:</h3>
              <ul>
                <li>Received and logged your package</li>
                <li>Verified package contents</li>
                <li>Confirmed weight and dimensions</li>
                <li>Inspected for damage (all good!)</li>
                <li>Added to shipping queue</li>
              </ul>
            </div>

            <div class="card">
              <h3>📋 Next Steps:</h3>
              <div style="padding: 15px; background: #f0fdfa; border-radius: 8px;">
                <p style="margin: 0;"><strong>1. Quality Check</strong> - Final inspection</p>
                <p style="margin: 10px 0 0 0;"><strong>2. Packaging</strong> - Secure packaging for international shipping</p>
                <p style="margin: 10px 0 0 0;"><strong>3. Customs Preparation</strong> - Documentation for Haiti customs</p>
                <p style="margin: 10px 0 0 0;"><strong>4. Transit to Haiti</strong> - Scheduled for next shipment</p>
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${APP_URL}/dashboard/packages" class="button">
                Track Package
              </a>
            </div>

            <p style="margin-top: 30px;">We'll notify you when your package is in transit!</p>

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

// Template: Package In Transit to Haiti (Detailed)
export const sendPackageInTransitDetailedEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string,
  departureDate: string,
  estimatedArrival: string,
  transitMethod: string,
  currentLocation?: string
) => {
  const subject = '✈️ Package In Transit to Haiti - Alliance Shipping';
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
          .tracking { font-size: 24px; font-weight: bold; color: #8b5cf6; text-align: center; padding: 15px; background: #f3e8ff; border-radius: 8px; }
          .transit-map { text-align: center; font-size: 48px; margin: 30px 0; }
          .location-badge { background: #f3e8ff; color: #7c3aed; padding: 10px 20px; border-radius: 20px; display: inline-block; font-weight: bold; margin: 10px 0; }
          .eta-box { background: #f0fdf4; border: 2px solid #10b981; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .eta-date { font-size: 28px; font-weight: bold; color: #059669; margin: 10px 0; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
          .info-item { text-align: center; padding: 15px; background: #faf5ff; border-radius: 8px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✈️ Package In Transit!</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            <p>Your package is now on its way to Haiti! 🇭🇹</p>

            <div class="card">
              <h3>Tracking Number:</h3>
              <div class="tracking">${trackingNumber}</div>
            </div>

            <div class="card">
              <div class="transit-map">🇺🇸 ✈️ ➡️ 🇭🇹</div>
              <p style="text-align: center; color: #6b7280; font-size: 18px;">
                <strong>USA</strong> → <strong>Haiti</strong>
              </p>
              ${currentLocation ? `
              <p style="text-align: center; margin-top: 20px;">
                <span class="location-badge">📍 Currently: ${currentLocation}</span>
              </p>
              ` : ''}
            </div>

            <div class="card">
              <h3>Transit Information:</h3>
              <div class="info-grid">
                <div class="info-item">
                  <div style="font-size: 14px; color: #6b7280;">Departed</div>
                  <div style="font-size: 18px; font-weight: bold; color: #8b5cf6; margin-top: 5px;">${departureDate}</div>
                </div>
                <div class="info-item">
                  <div style="font-size: 14px; color: #6b7280;">Method</div>
                  <div style="font-size: 18px; font-weight: bold; color: #8b5cf6; margin-top: 5px;">${transitMethod}</div>
                </div>
              </div>
            </div>

            <div class="eta-box">
              <h3 style="margin: 0; color: #059669;">Estimated Arrival in Haiti:</h3>
              <div class="eta-date">${estimatedArrival}</div>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">
                We'll notify you when it arrives!
              </p>
            </div>

            <div class="card">
              <h3>Journey Timeline:</h3>
              <div style="padding: 15px; background: #faf5ff; border-radius: 8px;">
                <p><strong>✅ Package Departed USA</strong><br>
                <span style="color: #6b7280; font-size: 14px;">Left ${departureDate}</span></p>

                <p style="margin-top: 15px;"><strong>🚚 In Transit</strong><br>
                <span style="color: #6b7280; font-size: 14px;">Currently en route to Haiti</span></p>

                <p style="margin-top: 15px;"><strong>○ Customs Clearance</strong><br>
                <span style="color: #6b7280; font-size: 14px;">Upon arrival in Haiti</span></p>

                <p style="margin-top: 15px;"><strong>○ Available for Pickup</strong><br>
                <span style="color: #6b7280; font-size: 14px;">After customs clearance</span></p>
              </div>
            </div>

            <div class="card" style="background: #eff6ff;">
              <h3>💡 What to Expect Next:</h3>
              <ul>
                <li>Real-time tracking updates</li>
                <li>Notification when arriving in Haiti</li>
                <li>Customs clearance status</li>
                <li>Pickup notification with location</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${APP_URL}/dashboard/packages" class="button">
                Track Live Status
              </a>
            </div>

            <p style="margin-top: 30px;">Your package is in good hands and on its way!</p>

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

// Template: Package Arrived in Haiti
export const sendPackageArrivedHaitiEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string,
  arrivalDate: string,
  customsStatus: string,
  estimatedClearance: string
) => {
  const subject = '🇭🇹 Package Arrived in Haiti - Alliance Shipping';
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
          .tracking { font-size: 24px; font-weight: bold; color: #14b8a6; text-align: center; padding: 15px; background: #ccfbf1; border-radius: 8px; }
          .flag { font-size: 80px; text-align: center; margin: 20px 0; }
          .status-badge { background: #ccfbf1; color: #0f766e; padding: 10px 20px; border-radius: 20px; display: inline-block; font-weight: bold; }
          .customs-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background: #14b8a6; color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="flag">🇭🇹</div>
            <h1>Package Arrived in Haiti!</h1>
          </div>
          <div class="content">
            <p>Excellent news, <strong>${userName}</strong>!</p>
            <p>Your package has successfully arrived in Haiti and is now going through customs clearance.</p>

            <div class="card">
              <h3>Tracking Number:</h3>
              <div class="tracking">${trackingNumber}</div>
            </div>

            <div class="card" style="text-align: center;">
              <h3>Arrival Details:</h3>
              <p style="font-size: 18px; color: #6b7280; margin: 10px 0;">
                Arrived on <strong>${arrivalDate}</strong>
              </p>
              <p style="margin-top: 20px;">
                <span class="status-badge">${customsStatus}</span>
              </p>
            </div>

            <div class="customs-box">
              <h3 style="margin-top: 0;">📋 Customs Clearance Process</h3>
              <p>Your package is currently going through the standard customs clearance process in Haiti.</p>
              <p><strong>Estimated Clearance:</strong> ${estimatedClearance}</p>
              <p style="margin-bottom: 0;"><strong>What happens:</strong> Customs authorities verify the package contents and documentation. This is a standard procedure for all international shipments.</p>
            </div>

            <div class="card">
              <h3>What's Happening Now:</h3>
              <ul>
                <li>✅ Package arrived safely in Haiti</li>
                <li>🔄 Going through customs inspection</li>
                <li>📋 Documentation being processed</li>
                <li>⏳ Awaiting customs clearance</li>
                <li>📦 Will be transferred to pickup location</li>
              </ul>
            </div>

            <div class="card" style="background: #f0fdf4;">
              <h3>📱 Stay Updated</h3>
              <p>We're monitoring the customs clearance process and will notify you immediately when your package is cleared and ready for pickup.</p>
              <p>No action is needed from you at this time.</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${APP_URL}/dashboard/packages" class="button">
                Track Customs Status
              </a>
            </div>

            <p style="margin-top: 30px;">Almost there! We'll have your package ready for you soon.</p>

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

// Template: Customs Cleared
export const sendCustomsClearedEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string,
  clearanceDate: string,
  destinationOffice: string,
  estimatedAvailability: string
) => {
  const subject = '✅ Customs Cleared - Package Ready Soon - Alliance Shipping';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .tracking { font-size: 24px; font-weight: bold; color: #10b981; text-align: center; padding: 15px; background: #d1fae5; border-radius: 8px; }
          .success-icon { font-size: 64px; text-align: center; margin: 20px 0; }
          .office-badge { background: #d1fae5; color: #047857; padding: 12px 24px; border-radius: 20px; display: inline-block; font-weight: bold; font-size: 18px; }
          .progress { background: #d1fae5; height: 8px; border-radius: 4px; overflow: hidden; margin: 20px 0; }
          .progress-bar { width: 90%; height: 100%; background: linear-gradient(90deg, #10b981, #059669); }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="success-icon">✅</div>
            <h1>Customs Cleared!</h1>
          </div>
          <div class="content">
            <p>Great news, <strong>${userName}</strong>!</p>
            <p>Your package has successfully cleared customs and is now being transferred to the pickup location.</p>

            <div class="card">
              <h3>Tracking Number:</h3>
              <div class="tracking">${trackingNumber}</div>
            </div>

            <div class="card">
              <h3>Clearance Status:</h3>
              <p style="text-align: center; font-size: 18px; color: #6b7280; margin: 15px 0;">
                Cleared on <strong>${clearanceDate}</strong>
              </p>
              <div class="progress">
                <div class="progress-bar"></div>
              </div>
              <p style="text-align: center; font-size: 14px; color: #6b7280;">
                90% Complete - Almost Ready!
              </p>
            </div>

            <div class="card" style="text-align: center;">
              <h3>Destination:</h3>
              <p style="margin: 20px 0;">
                <span class="office-badge">📍 ${destinationOffice}</span>
              </p>
            </div>

            <div class="card">
              <h3>Next Steps:</h3>
              <div style="background: #f0fdf4; padding: 20px; border-radius: 8px;">
                <p><strong>1. Final Processing</strong><br>
                <span style="color: #6b7280; font-size: 14px;">Package being prepared for delivery</span></p>

                <p style="margin-top: 15px;"><strong>2. Transfer to Office</strong><br>
                <span style="color: #6b7280; font-size: 14px;">Moving to ${destinationOffice}</span></p>

                <p style="margin-top: 15px; margin-bottom: 0;"><strong>3. Available for Pickup</strong><br>
                <span style="color: #6b7280; font-size: 14px;">Estimated: ${estimatedAvailability}</span></p>
              </div>
            </div>

            <div class="card" style="background: #ecfeff;">
              <h3>💡 Get Ready for Pickup!</h3>
              <p><strong>What to bring:</strong></p>
              <ul>
                <li>Valid government-issued ID</li>
                <li>This email or tracking number</li>
                <li>Payment for any fees (if applicable)</li>
              </ul>
              <p style="margin-bottom: 0;">We'll send you another email with full pickup details when your package is ready!</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${APP_URL}/dashboard/packages" class="button">
                View Package Details
              </a>
            </div>

            <p style="margin-top: 30px;">Your package will be ready for pickup very soon!</p>

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
// CONFIRMATION TEMPLATES
// ============================================

// Template: Information Updated Confirmation
export const sendInfoUpdatedConfirmationEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string,
  updatedFields: string[],
  updatedBy: string
) => {
  const subject = '✅ Package Information Updated - Alliance Shipping';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .tracking { font-size: 20px; font-weight: bold; color: #10b981; text-align: center; padding: 12px; background: #d1fae5; border-radius: 8px; }
          .field-list { list-style: none; padding: 0; }
          .field-list li { padding: 12px; background: #f0fdf4; margin: 8px 0; border-radius: 6px; border-left: 4px solid #10b981; }
          .field-list li:before { content: "✓ "; color: #10b981; font-weight: bold; margin-right: 8px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Information Updated</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            <p>The information for your package has been successfully updated.</p>

            <div class="card">
              <h3>Tracking Number:</h3>
              <div class="tracking">${trackingNumber}</div>
            </div>

            <div class="card">
              <h3>Updated Fields:</h3>
              <ul class="field-list">
                ${updatedFields.map(field => `<li>${field}</li>`).join('')}
              </ul>
              <p style="text-align: right; color: #6b7280; font-size: 14px; margin-top: 20px;">
                Updated by: <strong>${updatedBy}</strong>
              </p>
            </div>

            <div class="card" style="background: #eff6ff;">
              <h3>📋 Please Review</h3>
              <p>Please review the updated information in your dashboard to ensure everything is correct.</p>
              <p style="margin-bottom: 0;">If you notice any discrepancies, please contact us immediately.</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${APP_URL}/dashboard/packages" class="button">
                View Updated Details
              </a>
            </div>

            <div class="footer">
              <p>Alliance Shipping - Reliable Shipping from USA to Haiti</p>
              <p>Questions? Contact us at allianceshipping26@gmail.com</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: userEmail, subject, html });
};

// Template: First Package Congratulations
export const sendFirstPackageEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string
) => {
  const subject = '🎉 Congratulations on Your First Package! - Alliance Shipping';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .tracking { font-size: 24px; font-weight: bold; color: #f59e0b; text-align: center; padding: 15px; background: #fef3c7; border-radius: 8px; }
          .celebration { font-size: 80px; text-align: center; margin: 20px 0; }
          .tip-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 6px; margin: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="celebration">🎉🎊🎈</div>
            <h1>Congratulations!</h1>
            <p style="font-size: 18px; margin-top: 10px;">You've submitted your first package!</p>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            <p>This is a special milestone! You've just submitted your very first package request with Alliance Shipping, and we're thrilled to be part of your journey.</p>

            <div class="card">
              <h3>Your First Package:</h3>
              <div class="tracking">${trackingNumber}</div>
            </div>

            <div class="card" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);">
              <h3>🎁 Welcome Bonus!</h3>
              <p>As a thank you for choosing Alliance Shipping, here's what you can expect:</p>
              <ul>
                <li>✅ Priority review of your first package</li>
                <li>📧 Email support for any questions</li>
                <li>📦 Real-time tracking updates</li>
                <li>🎯 Dedicated customer service</li>
              </ul>
            </div>

            <div class="tip-box">
              <h3>💡 Pro Tips for New Shippers:</h3>
              <ul style="margin-bottom: 0;">
                <li><strong>Save Your Tracking Number:</strong> Keep it handy to track your package anytime</li>
                <li><strong>Check Your Dashboard:</strong> See real-time updates on your package status</li>
                <li><strong>Enable Notifications:</strong> Get instant alerts for every status change</li>
                <li><strong>Prepare for Pickup:</strong> Have your ID ready when your package arrives</li>
              </ul>
            </div>

            <div class="card">
              <h3>What Happens Next?</h3>
              <p>1. <strong>Review (24-48 hours):</strong> Our team will review your request</p>
              <p>2. <strong>Approval:</strong> You'll get your Alliance Shipping tracking number</p>
              <p>3. <strong>Processing:</strong> Your package will be prepared for shipping</p>
              <p>4. <strong>Transit:</strong> We'll ship it to Haiti</p>
              <p style="margin-bottom: 0;">5. <strong>Delivery:</strong> You'll pick it up at our Haiti office</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${APP_URL}/dashboard/packages" class="button">
                Track Your Package
              </a>
              <a href="${APP_URL}/help" class="button" style="background: #3b82f6;">
                Get Help & Support
              </a>
            </div>

            <p style="margin-top: 30px; text-align: center; font-size: 18px;">
              <strong>Welcome to the Alliance Shipping family! 🤝</strong>
            </p>

            <div class="footer">
              <p>Alliance Shipping - Reliable Shipping from USA to Haiti</p>
              <p>Need help? We're here! allianceshipping26@gmail.com</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: userEmail, subject, html });
};

// Template: Package Inspection Complete
export const sendInspectionCompleteEmail = async (
  userEmail: string,
  userName: string,
  trackingNumber: string,
  inspectionResult: 'passed' | 'issues_found',
  inspectionNotes: string,
  nextSteps: string
) => {
  const isPassed = inspectionResult === 'passed';
  const subject = `${isPassed ? '✅' : '⚠️'} Package Inspection ${isPassed ? 'Complete' : 'Report'} - Alliance Shipping`;
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, ${isPassed ? '#10b981' : '#f59e0b'} 0%, ${isPassed ? '#059669' : '#d97706'} 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .tracking { font-size: 20px; font-weight: bold; color: ${isPassed ? '#10b981' : '#f59e0b'}; text-align: center; padding: 12px; background: ${isPassed ? '#d1fae5' : '#fef3c7'}; border-radius: 8px; }
          .result-badge { background: ${isPassed ? '#d1fae5' : '#fef3c7'}; color: ${isPassed ? '#047857' : '#b45309'}; padding: 12px 24px; border-radius: 20px; display: inline-block; font-weight: bold; font-size: 18px; }
          .notes-box { background: ${isPassed ? '#f0fdf4' : '#fef3c7'}; border-left: 4px solid ${isPassed ? '#10b981' : '#f59e0b'}; padding: 20px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background: ${isPassed ? '#10b981' : '#f59e0b'}; color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isPassed ? '✅' : '⚠️'} Package Inspection ${isPassed ? 'Complete' : 'Report'}</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            <p>Your package has been inspected at our warehouse.</p>

            <div class="card">
              <h3>Tracking Number:</h3>
              <div class="tracking">${trackingNumber}</div>
            </div>

            <div class="card" style="text-align: center;">
              <h3>Inspection Result:</h3>
              <p style="margin: 20px 0;">
                <span class="result-badge">${isPassed ? '✅ PASSED' : '⚠️ ISSUES FOUND'}</span>
              </p>
            </div>

            <div class="card">
              <h3>Inspection Notes:</h3>
              <div class="notes-box">
                ${inspectionNotes.replace(/\n/g, '<br>')}
              </div>
            </div>

            <div class="card">
              <h3>Next Steps:</h3>
              <div style="background: ${isPassed ? '#f0fdf4' : '#fef3c7'}; padding: 20px; border-radius: 8px;">
                ${nextSteps.replace(/\n/g, '<br>')}
              </div>
            </div>

            ${!isPassed ? `
            <div class="card" style="background: #fee2e2;">
              <h3>📞 We May Contact You</h3>
              <p>If action is required from your side, our team will contact you shortly with more details.</p>
              <p style="margin-bottom: 0;">Please keep your phone available.</p>
            </div>
            ` : ''}

            <div style="text-align: center; margin: 30px 0;">
              <a href="${APP_URL}/dashboard/packages" class="button">
                View Package Status
              </a>
            </div>

            <div class="footer">
              <p>Alliance Shipping - Reliable Shipping from USA to Haiti</p>
              <p>Questions? Contact us at allianceshipping26@gmail.com</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: userEmail, subject, html });
};
