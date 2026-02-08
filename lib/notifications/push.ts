import { db } from '@/lib/db';
import { users, notifications } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

type Locale = 'ht' | 'fr' | 'en' | 'es';

interface PushMessage {
  to: string;
  sound: 'default';
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

// Multilingual notification templates
const pushTemplates: Record<string, Record<Locale, { title: string; body: string }>> = {
  package_received: {
    en: { title: 'Package Received', body: 'Your package {{tracking}} has been received at our warehouse.' },
    fr: { title: 'Colis Reçu', body: 'Votre colis {{tracking}} a été reçu dans notre entrepôt.' },
    ht: { title: 'Kolis Resevwa', body: 'Kolis ou {{tracking}} resevwa nan depo nou an.' },
    es: { title: 'Paquete Recibido', body: 'Su paquete {{tracking}} ha sido recibido en nuestro almacén.' },
  },
  package_in_transit: {
    en: { title: 'Package In Transit', body: 'Your package {{tracking}} is on its way to Haiti!' },
    fr: { title: 'Colis En Transit', body: 'Votre colis {{tracking}} est en route vers Haïti !' },
    ht: { title: 'Kolis An Wout', body: 'Kolis ou {{tracking}} ap vwayaje pou ale an Ayiti !' },
    es: { title: 'Paquete En Tránsito', body: 'Su paquete {{tracking}} está en camino a Haití!' },
  },
  package_available: {
    en: { title: 'Ready for Pickup!', body: 'Your package {{tracking}} is ready for pickup at our Haiti office.' },
    fr: { title: 'Prêt à Retirer !', body: 'Votre colis {{tracking}} est prêt à retirer dans notre bureau en Haïti.' },
    ht: { title: 'Pare pou Ranmase !', body: 'Kolis ou {{tracking}} pare pou ranmase nan biwo nou an Ayiti.' },
    es: { title: '¡Listo para Recoger!', body: 'Su paquete {{tracking}} está listo para recoger en nuestra oficina en Haití.' },
  },
  package_delivered: {
    en: { title: 'Package Delivered', body: 'Your package {{tracking}} has been delivered. Thank you!' },
    fr: { title: 'Colis Livré', body: 'Votre colis {{tracking}} a été livré. Merci !' },
    ht: { title: 'Kolis Livre', body: 'Kolis ou {{tracking}} livre. Mèsi !' },
    es: { title: 'Paquete Entregado', body: 'Su paquete {{tracking}} ha sido entregado. ¡Gracias!' },
  },
  request_approved: {
    en: { title: 'Request Approved', body: 'Your package request has been approved! Tracking: {{tracking}}' },
    fr: { title: 'Demande Approuvée', body: 'Votre demande de colis a été approuvée ! Suivi : {{tracking}}' },
    ht: { title: 'Demann Apwouve', body: 'Demann kolis ou a apwouve ! Swivi : {{tracking}}' },
    es: { title: 'Solicitud Aprobada', body: 'Su solicitud de paquete ha sido aprobada. Seguimiento: {{tracking}}' },
  },
  request_rejected: {
    en: { title: 'Request Rejected', body: 'Your package request has been rejected. Check your account for details.' },
    fr: { title: 'Demande Rejetée', body: 'Votre demande de colis a été rejetée. Consultez votre compte pour les détails.' },
    ht: { title: 'Demann Rejte', body: 'Demann kolis ou a rejte. Tcheke kont ou pou plis detay.' },
    es: { title: 'Solicitud Rechazada', body: 'Su solicitud de paquete ha sido rechazada. Consulte su cuenta para más detalles.' },
  },
  new_announcement: {
    en: { title: 'New Announcement', body: '{{title}}' },
    fr: { title: 'Nouvelle Annonce', body: '{{title}}' },
    ht: { title: 'Nouvo Anons', body: '{{title}}' },
    es: { title: 'Nuevo Anuncio', body: '{{title}}' },
  },
  price_change: {
    en: { title: 'Price Update', body: 'Shipping rates have been updated. Check our pricing page for details.' },
    fr: { title: 'Mise à jour des prix', body: 'Les tarifs d\'expédition ont été mis à jour. Consultez notre page de tarifs.' },
    ht: { title: 'Mizajou Pri', body: 'Tarif livrezon yo mete ajou. Tcheke paj pri nou an.' },
    es: { title: 'Actualización de Precios', body: 'Las tarifas de envío han sido actualizadas. Consulte nuestra página de precios.' },
  },
};

function fillVars(text: string, vars: Record<string, string>): string {
  let result = text;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return result;
}

/**
 * Send push notification to a specific user.
 * Also saves the notification to the database.
 */
export async function sendPushNotification(params: {
  userId: number;
  templateKey: string;
  variables?: Record<string, string>;
  packageId?: number;
  data?: Record<string, unknown>;
}): Promise<boolean> {
  const { userId, templateKey, variables = {}, packageId, data = {} } = params;

  try {
    // Get user's push token and language preference
    const [user] = await db
      .select({
        expoPushToken: users.expoPushToken,
        preferredLanguage: users.preferredLanguage,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) return false;

    const locale = (['ht', 'fr', 'en', 'es'].includes(user.preferredLanguage)
      ? user.preferredLanguage
      : 'fr') as Locale;

    const template = pushTemplates[templateKey]?.[locale];
    if (!template) return false;

    const title = fillVars(template.title, variables);
    const body = fillVars(template.body, variables);

    // Save notification to database
    await db.insert(notifications).values({
      userId,
      packageId: packageId || null,
      type: templateKey,
      title,
      message: body,
    });

    // Send push notification if token exists
    if (user.expoPushToken) {
      const message: PushMessage = {
        to: user.expoPushToken,
        sound: 'default',
        title,
        body,
        data: { type: templateKey, packageId, ...data },
      };

      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
    }

    return true;
  } catch (error) {
    console.error('Failed to send push notification:', error);
    return false;
  }
}

/**
 * Send push notification to all users (for announcements).
 */
export async function sendPushToAllUsers(params: {
  templateKey: string;
  variables?: Record<string, string>;
  data?: Record<string, unknown>;
}): Promise<{ sent: number; failed: number }> {
  const { templateKey, variables = {}, data = {} } = params;

  const allUsers = await db
    .select({
      id: users.id,
      expoPushToken: users.expoPushToken,
      preferredLanguage: users.preferredLanguage,
    })
    .from(users);

  const messages: PushMessage[] = [];
  let failed = 0;

  for (const user of allUsers) {
    const locale = (['ht', 'fr', 'en', 'es'].includes(user.preferredLanguage)
      ? user.preferredLanguage
      : 'fr') as Locale;

    const template = pushTemplates[templateKey]?.[locale];
    if (!template) {
      failed++;
      continue;
    }

    const title = fillVars(template.title, variables);
    const body = fillVars(template.body, variables);

    // Save notification to DB
    await db.insert(notifications).values({
      userId: user.id,
      type: templateKey,
      title,
      message: body,
    });

    // Queue push message if token exists
    if (user.expoPushToken) {
      messages.push({
        to: user.expoPushToken,
        sound: 'default',
        title,
        body,
        data: { type: templateKey, ...data },
      });
    }
  }

  // Send push notifications in batches of 100 (Expo limit)
  let sent = 0;
  for (let i = 0; i < messages.length; i += 100) {
    const batch = messages.slice(i, i + 100);
    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch),
      });
      sent += batch.length;
    } catch {
      failed += batch.length;
    }
  }

  return { sent, failed };
}
