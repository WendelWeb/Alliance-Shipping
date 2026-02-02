import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/service';

/**
 * TEST EMAIL ENDPOINT
 *
 * Usage:
 * 1. Visitez: http://localhost:3000/api/test-email?to=votre-email@example.com
 * 2. Ou avec curl:
 *    curl http://localhost:3000/api/test-email?to=votre-email@example.com
 *
 * Cet endpoint envoie un email de test pour vérifier la configuration.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const testEmail = searchParams.get('to');

  // Vérifier configuration
  const config = {
    hasResendKey: !!process.env.RESEND_API_KEY,
    resendKeyLength: process.env.RESEND_API_KEY?.length || 0,
    resendKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 3) || 'N/A',
    smtpFrom: process.env.SMTP_FROM || 'Not configured',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'Not configured',
  };

  console.log('\n🔧 EMAIL CONFIGURATION CHECK:');
  console.log('================================');
  console.log(`RESEND_API_KEY: ${config.hasResendKey ? '✅ Present' : '❌ Missing'}`);
  console.log(`Key Length: ${config.resendKeyLength}`);
  console.log(`Key Prefix: ${config.resendKeyPrefix}`);
  console.log(`SMTP_FROM: ${config.smtpFrom}`);
  console.log(`APP_URL: ${config.appUrl}`);
  console.log('================================\n');

  // Vérifier si API key est présente
  if (!config.hasResendKey) {
    return NextResponse.json({
      success: false,
      error: 'RESEND_API_KEY is not configured',
      hint: 'Add RESEND_API_KEY=re_your_key to .env.local',
      config,
    }, { status: 500 });
  }

  // Vérifier si email destinataire est fourni
  if (!testEmail) {
    return NextResponse.json({
      success: false,
      error: 'Email address required',
      usage: 'Visit: /api/test-email?to=your-email@example.com',
      config,
    }, { status: 400 });
  }

  // Vérifier format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(testEmail)) {
    return NextResponse.json({
      success: false,
      error: 'Invalid email format',
      provided: testEmail,
      config,
    }, { status: 400 });
  }

  console.log(`\n📧 Sending test email to: ${testEmail}\n`);

  // Envoyer email de test
  const result = await sendEmail({
    to: testEmail,
    subject: '✅ Test Email - Alliance Shipping Configuration',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .success { background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .info { background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Email Configuration Test</h1>
            </div>
            <div class="content">
              <div class="success">
                <h2 style="color: #047857; margin: 0;">🎉 Success!</h2>
                <p style="margin: 10px 0 0 0;">If you're reading this, your email configuration is working correctly!</p>
              </div>

              <div class="info">
                <h3>📧 Configuration Details:</h3>
                <p><strong>API Key:</strong> ${config.hasResendKey ? '✅ Configured' : '❌ Missing'}</p>
                <p><strong>From Email:</strong> ${config.smtpFrom}</p>
                <p><strong>App URL:</strong> ${config.appUrl}</p>
                <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
              </div>

              <div class="info">
                <h3>✨ Next Steps:</h3>
                <ul>
                  <li>Your Resend configuration is working</li>
                  <li>Emails will be sent automatically for package events</li>
                  <li>Check the terminal for detailed logs</li>
                  <li>You can now test with real package requests</li>
                </ul>
              </div>

              <div class="footer">
                <p>Alliance Shipping - Email System Test</p>
                <p>This is a test email from your development environment</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  });

  if (result.success) {
    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully! Check your inbox (and spam folder).',
      emailSentTo: testEmail,
      emailId: (result.data as any)?.id || 'N/A',
      config,
      logs: 'Check your terminal/console for detailed logs',
    });
  } else {
    return NextResponse.json({
      success: false,
      error: 'Failed to send test email',
      details: result.error?.message || 'Unknown error',
      config,
      troubleshooting: 'Check the terminal logs for detailed error information',
    }, { status: 500 });
  }
}
