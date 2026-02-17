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
  channelId?: string;
}

// Multilingual notification templates
const pushTemplates: Record<string, Record<Locale, { title: string; body: string }>> = {
  package_received: {
    en: { title: 'Package Received', body: 'Your package {{tracking}} has been received at our Miami warehouse. Weight: {{weight}} lbs.' },
    fr: { title: 'Colis Re\u00e7u', body: 'Votre colis {{tracking}} a \u00e9t\u00e9 re\u00e7u dans notre entrep\u00f4t \u00e0 Miami. Poids : {{weight}} lbs.' },
    ht: { title: 'Kolis Resevwa', body: 'Kolis ou {{tracking}} resevwa nan depo Miami. Pwa : {{weight}} lbs.' },
    es: { title: 'Paquete Recibido', body: 'Su paquete {{tracking}} ha sido recibido en nuestro almac\u00e9n en Miami. Peso: {{weight}} lbs.' },
  },
  package_in_transit: {
    en: { title: 'Package In Transit!', body: 'Your package {{tracking}} is on its way to Haiti! Estimated arrival: soon.' },
    fr: { title: 'Colis En Transit !', body: 'Votre colis {{tracking}} est en route vers Ha\u00efti ! Arriv\u00e9e estim\u00e9e : bient\u00f4t.' },
    ht: { title: 'Kolis An Wout !', body: 'Kolis ou {{tracking}} ap vwayaje pou ale an Ayiti ! L ap rive talè.' },
    es: { title: '\u00a1Paquete En Tr\u00e1nsito!', body: 'Su paquete {{tracking}} est\u00e1 en camino a Hait\u00ed. Llegada estimada: pronto.' },
  },
  package_available: {
    en: { title: 'Ready for Pickup!', body: 'Your package {{tracking}} is ready! Pick it up at {{location}}. Cost: ${{total}}.' },
    fr: { title: 'Pr\u00eat \u00e0 Retirer !', body: 'Votre colis {{tracking}} est pr\u00eat ! Venez le chercher \u00e0 {{location}}. Co\u00fbt : ${{total}}.' },
    ht: { title: 'Par\u00e8 pou Ranmase !', body: 'Kolis ou {{tracking}} par\u00e8 ! Vin pran li nan {{location}}. Ko\u00fbt : ${{total}}.' },
    es: { title: '\u00a1Listo para Recoger!', body: 'Su paquete {{tracking}} est\u00e1 listo. Rec\u00f3jalo en {{location}}. Costo: ${{total}}.' },
  },
  package_delivered: {
    en: { title: 'Package Delivered!', body: 'Your package {{tracking}} has been delivered successfully. Thank you for choosing Alliance Shipping!' },
    fr: { title: 'Colis Livr\u00e9 !', body: 'Votre colis {{tracking}} a \u00e9t\u00e9 livr\u00e9 avec succ\u00e8s. Merci d\'avoir choisi Alliance Shipping !' },
    ht: { title: 'Kolis Livre !', body: 'Kolis ou {{tracking}} livre av\u00e8k sikse. M\u00e8si paske ou chwazi Alliance Shipping !' },
    es: { title: '\u00a1Paquete Entregado!', body: 'Su paquete {{tracking}} ha sido entregado exitosamente. \u00a1Gracias por elegir Alliance Shipping!' },
  },
  request_approved: {
    en: { title: 'Request Approved!', body: 'Your request for {{tracking}} is approved! Total: ${{total}}. Check your dashboard.' },
    fr: { title: 'Demande Approuv\u00e9e !', body: 'Votre demande pour {{tracking}} est approuv\u00e9e ! Total: ${{total}}. Consultez votre tableau de bord.' },
    ht: { title: 'Demann Apwouve !', body: 'Demann ou pou {{tracking}} apwouve ! Total: ${{total}}. Tcheke tablo b\u00f2 ou.' },
    es: { title: '\u00a1Solicitud Aprobada!', body: 'Su solicitud para {{tracking}} fue aprobada. Total: ${{total}}. Revise su panel.' },
  },
  request_rejected: {
    en: { title: 'Request Rejected', body: 'Your request for {{tracking}} was rejected. Check your account for details.' },
    fr: { title: 'Demande Rejet\u00e9e', body: 'Votre demande pour {{tracking}} a \u00e9t\u00e9 rejet\u00e9e. V\u00e9rifiez votre compte pour les d\u00e9tails.' },
    ht: { title: 'Demann Rejte', body: 'Demann ou pou {{tracking}} rejte. Tcheke kont ou pou detay.' },
    es: { title: 'Solicitud Rechazada', body: 'Su solicitud para {{tracking}} fue rechazada. Consulte su cuenta.' },
  },
  customs_fees_added: {
    en: { title: 'Customs Fees Added', body: 'Customs fees of ${{customs}} have been added to your package {{tracking}}. New total: ${{total}}.' },
    fr: { title: 'Frais de Douane Ajout\u00e9s', body: 'Des frais de douane de ${{customs}} ont \u00e9t\u00e9 ajout\u00e9s \u00e0 votre colis {{tracking}}. Nouveau total : ${{total}}.' },
    ht: { title: 'Fr\u00e8 Dwan Ajoute', body: 'Fr\u00e8 dwan ${{customs}} ajoute nan kolis ou {{tracking}}. Nouvo total : ${{total}}.' },
    es: { title: 'Tasas Aduaneras Agregadas', body: 'Se agregaron tasas aduaneras de ${{customs}} a su paquete {{tracking}}. Nuevo total: ${{total}}.' },
  },
  weight_updated: {
    en: { title: 'Weight Updated', body: 'The weight of your package {{tracking}} has been updated to {{weight}} lbs. New total: ${{total}}.' },
    fr: { title: 'Poids Mis \u00e0 Jour', body: 'Le poids de votre colis {{tracking}} a \u00e9t\u00e9 mis \u00e0 jour : {{weight}} lbs. Nouveau total : ${{total}}.' },
    ht: { title: 'Pwa Mete Ajou', body: 'Pwa kolis ou {{tracking}} mete ajou : {{weight}} lbs. Nouvo total : ${{total}}.' },
    es: { title: 'Peso Actualizado', body: 'El peso de su paquete {{tracking}} ha sido actualizado a {{weight}} lbs. Nuevo total: ${{total}}.' },
  },
  special_item_added: {
    en: { title: 'Special Item Added', body: 'A special item has been added to {{tracking}}. Fee: ${{fee}}. New total: ${{total}}.' },
    fr: { title: 'Article Sp\u00e9cial Ajout\u00e9', body: 'Un article sp\u00e9cial a \u00e9t\u00e9 ajout\u00e9 \u00e0 {{tracking}}. Frais : ${{fee}}. Nouveau total : ${{total}}.' },
    ht: { title: 'Atik Espesyal Ajoute', body: 'Yon atik espesyal ajoute nan {{tracking}}. Fr\u00e8 : ${{fee}}. Nouvo total : ${{total}}.' },
    es: { title: 'Art\u00edculo Especial Agregado', body: 'Se agreg\u00f3 un art\u00edculo especial a {{tracking}}. Tarifa: ${{fee}}. Nuevo total: ${{total}}.' },
  },
  admin_message: {
    en: { title: 'Message from Alliance Shipping', body: 'You have a new message about your package {{tracking}}. Check your account.' },
    fr: { title: 'Message d\'Alliance Shipping', body: 'Vous avez un nouveau message concernant votre colis {{tracking}}. Consultez votre compte.' },
    ht: { title: 'Mesaj Alliance Shipping', body: 'Ou gen yon nouvo mesaj konsènan kolis ou {{tracking}}. Tcheke kont ou.' },
    es: { title: 'Mensaje de Alliance Shipping', body: 'Tiene un nuevo mensaje sobre su paquete {{tracking}}. Revise su cuenta.' },
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

    if (!user) {
      console.log(`[PUSH] User ${userId} not found`);
      return false;
    }

    console.log(`[PUSH] User ${userId}: token=${user.expoPushToken ? 'YES' : 'NO'}, lang=${user.preferredLanguage}`);

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
        channelId: 'default',
      };

      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      };

      if (process.env.EXPO_ACCESS_TOKEN) {
        headers['Authorization'] = `Bearer ${process.env.EXPO_ACCESS_TOKEN}`;
      }

      try {
        console.log(`[PUSH] Sending to ${user.expoPushToken} | template=${templateKey} | EXPO_TOKEN=${process.env.EXPO_ACCESS_TOKEN ? 'SET' : 'NOT SET'}`);
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers,
          body: JSON.stringify(message),
        });

        const responseBody = await response.text();
        console.log(`[PUSH] Response: ${response.status} | ${responseBody}`);

        if (!response.ok) {
          console.error(`[PUSH] Failed. Status: ${response.status}. Error: ${responseBody}`);
        }
      } catch (fetchError) {
        console.error('[PUSH] Network error:', fetchError);
      }
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
        channelId: 'default',
      });
    }
  }

  // Send push notifications in batches of 100 (Expo limit)
  let sent = 0;
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Accept-encoding': 'gzip, deflate',
    'Content-Type': 'application/json',
  };

  if (process.env.EXPO_ACCESS_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.EXPO_ACCESS_TOKEN}`;
  }

  for (let i = 0; i < messages.length; i += 100) {
    const batch = messages.slice(i, i + 100);
    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers,
        body: JSON.stringify(batch),
      });

      if (!response.ok) {
        console.error(`Batch push failed. Status: ${response.status}`);
        failed += batch.length;
      } else {
        sent += batch.length;
      }
    } catch {
      failed += batch.length;
    }
  }

  return { sent, failed };
}
