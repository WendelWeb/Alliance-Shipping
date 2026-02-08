import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { announcements, users } from '@/lib/db/schema';
import { getAdminSession } from '@/lib/auth/admin';
import { eq } from 'drizzle-orm';
import { sendEmail } from '@/lib/email/service';
import { sendPushToAllUsers } from '@/lib/notifications/push';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

type Locale = 'ht' | 'fr' | 'en' | 'es';

// Multilingual email subject lines
const emailSubjects: Record<Locale, Record<string, string>> = {
  en: { news: 'New Announcement', alert: 'Important Alert', promo: 'Special Offer', maintenance: 'Service Update' },
  fr: { news: 'Nouvelle Annonce', alert: 'Alerte Importante', promo: 'Offre Sp\u00e9ciale', maintenance: 'Mise \u00e0 jour Service' },
  ht: { news: 'Nouvo Anons', alert: 'Al\u00e8t Enpòtan', promo: '\u00d2f Espesyal', maintenance: 'Mizajou S\u00e8vis' },
  es: { news: 'Nuevo Anuncio', alert: 'Alerta Importante', promo: 'Oferta Especial', maintenance: 'Actualizaci\u00f3n Servicio' },
};

// Build a beautiful announcement email HTML
function buildAnnouncementEmailHtml(
  title: string,
  content: string,
  type: string,
  userName: string,
  locale: Locale
): string {
  const typeColors: Record<string, { gradient: string; badge: string }> = {
    news: { gradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', badge: '#1e40af' },
    alert: { gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)', badge: '#dc2626' },
    promo: { gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)', badge: '#7c3aed' },
    maintenance: { gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)', badge: '#d97706' },
  };

  const typeEmojis: Record<string, string> = { news: '\ud83d\udce2', alert: '\u26a0\ufe0f', promo: '\ud83c\udf89', maintenance: '\ud83d\udd27' };
  const typeLabels: Record<Locale, Record<string, string>> = {
    en: { news: 'NEWS', alert: 'ALERT', promo: 'PROMOTION', maintenance: 'MAINTENANCE' },
    fr: { news: 'ACTUALIT\u00c9', alert: 'ALERTE', promo: 'PROMOTION', maintenance: 'MAINTENANCE' },
    ht: { news: 'NOUV\u00c8L', alert: 'AL\u00c8T', promo: 'PWOMOSYON', maintenance: 'MANTYEN' },
    es: { news: 'NOTICIA', alert: 'ALERTA', promo: 'PROMOCI\u00d3N', maintenance: 'MANTENIMIENTO' },
  };

  const greetings: Record<Locale, string> = {
    en: 'Hello', fr: 'Bonjour', ht: 'Bonjou', es: 'Hola',
  };
  const footers: Record<Locale, string> = {
    en: 'Alliance Shipping - Reliable Shipping from USA to Haiti',
    fr: 'Alliance Shipping - Exp\u00e9dition Fiable des USA vers Ha\u00efti',
    ht: 'Alliance Shipping - Livrezon Fyab soti nan USA pou ale an Ayiti',
    es: 'Alliance Shipping - Env\u00edos Confiables de USA a Hait\u00ed',
  };
  const automated: Record<Locale, string> = {
    en: 'This is an automated message, please do not reply.',
    fr: 'Ceci est un message automatique, merci de ne pas r\u00e9pondre.',
    ht: 'Sa a se yon mesaj otomatik, tanpri pa reponn.',
    es: 'Este es un mensaje autom\u00e1tico, por favor no responda.',
  };
  const viewNews: Record<Locale, string> = {
    en: 'View All News', fr: 'Voir Toutes les Actualit\u00e9s', ht: 'W\u00e8 Tout Nouv\u00e8l', es: 'Ver Todas las Noticias',
  };

  const colors = typeColors[type] || typeColors.news;
  const emoji = typeEmojis[type] || '\ud83d\udce2';
  const label = typeLabels[locale]?.[type] || type.toUpperCase();

  // Convert newlines in content to HTML
  const htmlContent = content.replace(/\n/g, '<br>');

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.7; color: #1f2937; margin: 0; padding: 0; background: #f3f4f6; }
    .wrapper { padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: ${colors.gradient}; color: white; padding: 36px 24px; text-align: center; border-radius: 16px 16px 0 0; }
    .header h1 { margin: 0 0 8px; font-size: 24px; font-weight: 800; }
    .type-badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 12px; }
    .content { background: #ffffff; padding: 32px 28px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .greeting { font-size: 16px; color: #374151; margin-bottom: 20px; }
    .announcement-body { font-size: 15px; color: #4b5563; line-height: 1.8; padding: 20px 0; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; margin: 16px 0; }
    .btn-container { text-align: center; margin: 28px 0 16px; }
    .button { display: inline-block; padding: 14px 36px; background: ${colors.gradient}; color: #ffffff !important; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px; }
    .footer { text-align: center; padding: 24px; color: #9ca3af; font-size: 12px; }
    .footer p { margin: 4px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="type-badge">${label}</div>
        <h1>${emoji} ${title}</h1>
      </div>
      <div class="content">
        <p class="greeting">${greetings[locale]} <strong>${userName}</strong>,</p>
        <div class="announcement-body">${htmlContent}</div>
        <div class="btn-container">
          <a href="${APP_URL}/news" class="button">${viewNews[locale]}</a>
        </div>
      </div>
      <div class="footer">
        <p><strong>${footers[locale]}</strong></p>
        <p>${automated[locale]}</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * POST /api/admin/announcements/broadcast
 * Send announcement email to all users in their preferred language.
 * Uses streaming to report progress in real-time.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await request.json();
    const { announcementId } = body;

    if (!announcementId) {
      return new Response(JSON.stringify({ error: 'announcementId is required' }), { status: 400 });
    }

    // Fetch the announcement
    const [announcement] = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, announcementId))
      .limit(1);

    if (!announcement) {
      return new Response(JSON.stringify({ error: 'Announcement not found' }), { status: 404 });
    }

    // Fetch all users
    const allUsers = await db.select().from(users);

    if (allUsers.length === 0) {
      return new Response(JSON.stringify({ error: 'No users to send to' }), { status: 400 });
    }

    const translations = announcement.translations as Record<string, { title: string; content: string }> | null;

    // Stream progress to client
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: object) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        send({ type: 'start', total: allUsers.length });

        let sent = 0;
        let failed = 0;

        for (const user of allUsers) {
          const userLang = (user.preferredLanguage || 'fr') as Locale;
          const validLang = (['ht', 'fr', 'en', 'es'].includes(userLang) ? userLang : 'fr') as Locale;

          // Get translated content for this user's language
          const translated = translations?.[validLang];
          const title = translated?.title || announcement.title;
          const content = translated?.content || announcement.content;

          const userName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Customer';
          const subjectPrefix = emailSubjects[validLang]?.[announcement.type] || emailSubjects.en.news;
          const subject = `${subjectPrefix} - Alliance Shipping`;

          const html = buildAnnouncementEmailHtml(title, content, announcement.type, userName, validLang);

          try {
            await sendEmail({ to: user.email, subject, html });
            sent++;
            send({
              type: 'progress',
              sent,
              failed,
              total: allUsers.length,
              lastEmail: user.email,
              lastUser: userName,
              lastLang: validLang,
              status: 'sent',
            });
          } catch {
            failed++;
            send({
              type: 'progress',
              sent,
              failed,
              total: allUsers.length,
              lastEmail: user.email,
              lastUser: userName,
              lastLang: validLang,
              status: 'failed',
            });
          }

          // Small delay to avoid rate limiting
          await new Promise((r) => setTimeout(r, 200));
        }

        // Update the announcement with email sent info
        await db.update(announcements)
          .set({ emailSentAt: new Date(), emailSentCount: sent })
          .where(eq(announcements.id, announcementId));

        // Also send push notification to all users
        await sendPushToAllUsers({
          templateKey: 'new_announcement',
          variables: { title: announcement.title },
          data: { announcementId: announcement.id },
        }).catch(() => {});

        send({ type: 'complete', sent, failed, total: allUsers.length });
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error broadcasting announcement:', error);
    return new Response(JSON.stringify({ error: 'Failed to broadcast' }), { status: 500 });
  }
}
