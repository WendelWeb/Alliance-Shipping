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

// Multilingual notification templates — rich, detailed, professional with emojis
// Variables: {{tracking}} = AS tracking, {{externalTracking}} = carrier tracking, {{depot}} = warehouse/office name
// {{categoryLine}} and {{specialItemLine}} are auto-built by sendPushNotification based on locale
const pushTemplates: Record<string, Record<Locale, { title: string; body: string }>> = {
  package_received: {
    en: { title: '\ud83d\udce6 Package Received!', body: 'Great news! Your package {{tracking}} ({{weight}} lbs) has arrived safely at our Miami warehouse.\n\ud83c\udff7\ufe0f Carrier tracking: {{externalTracking}}{{categoryLine}}{{specialItemLine}}\n\ud83d\udccd Destination: {{city}} \u2014 {{depot}}\n\ud83d\udcb0 Estimated total: ${{total}}\nWe\'ll notify you at every step. Thank you for trusting Alliance Shipping!' },
    fr: { title: '\ud83d\udce6 Colis Re\u00e7u !', body: 'Bonne nouvelle ! Votre colis {{tracking}} ({{weight}} lbs) est bien arriv\u00e9 \u00e0 notre entrep\u00f4t de Miami.\n\ud83c\udff7\ufe0f Suivi transporteur : {{externalTracking}}{{categoryLine}}{{specialItemLine}}\n\ud83d\udccd Destination : {{city}} \u2014 {{depot}}\n\ud83d\udcb0 Total estim\u00e9 : ${{total}}\nNous vous tiendrons inform\u00e9 \u00e0 chaque \u00e9tape. Merci de faire confiance \u00e0 Alliance Shipping !' },
    ht: { title: '\ud83d\udce6 Kolis Resevwa !', body: 'Bon nouv\u00e8l ! Kolis ou {{tracking}} ({{weight}} lbs) rive nan depo Miami nou an.\n\ud83c\udff7\ufe0f Suivi transp\u00f2t\u00e8 : {{externalTracking}}{{categoryLine}}{{specialItemLine}}\n\ud83d\udccd Destinasyon : {{city}} \u2014 {{depot}}\n\ud83d\udcb0 Total estime : ${{total}}\nN ap kenbe ou enf\u00f2me chak etap. M\u00e8si paske ou f\u00e8 konfyans ak Alliance Shipping !' },
    es: { title: '\ud83d\udce6 \u00a1Paquete Recibido!', body: '\u00a1Buenas noticias! Su paquete {{tracking}} ({{weight}} lbs) lleg\u00f3 a nuestro almac\u00e9n en Miami.\n\ud83c\udff7\ufe0f Seguimiento transportista: {{externalTracking}}{{categoryLine}}{{specialItemLine}}\n\ud83d\udccd Destino: {{city}} \u2014 {{depot}}\n\ud83d\udcb0 Total estimado: ${{total}}\nLe notificaremos en cada paso. \u00a1Gracias por confiar en Alliance Shipping!' },
  },
  package_in_transit: {
    en: { title: '\u2708\ufe0f Package In Transit!', body: 'Your package {{tracking}} ({{weight}} lbs) is on its way to {{city}}!\n\ud83c\udff7\ufe0f Carrier tracking: {{externalTracking}}{{categoryLine}}{{specialItemLine}}\n\ud83c\udfe2 Depot: {{depot}}\n\ud83d\udcb0 Total: ${{total}}\n\ud83d\udcc5 Estimated delivery: {{days}} days\nWe\'ll let you know as soon as it arrives. Thank you for your patience!' },
    fr: { title: '\u2708\ufe0f Colis En Transit !', body: 'Votre colis {{tracking}} ({{weight}} lbs) est en route vers {{city}} !\n\ud83c\udff7\ufe0f Suivi transporteur : {{externalTracking}}{{categoryLine}}{{specialItemLine}}\n\ud83c\udfe2 D\u00e9p\u00f4t : {{depot}}\n\ud83d\udcb0 Total : ${{total}}\n\ud83d\udcc5 Livraison estim\u00e9e : {{days}} jours\nNous vous pr\u00e9viendrons d\u00e8s son arriv\u00e9e. Merci de votre patience !' },
    ht: { title: '\u2708\ufe0f Kolis An Wout !', body: 'Kolis ou {{tracking}} ({{weight}} lbs) an wout pou {{city}} !\n\ud83c\udff7\ufe0f Suivi transp\u00f2t\u00e8 : {{externalTracking}}{{categoryLine}}{{specialItemLine}}\n\ud83c\udfe2 Depo : {{depot}}\n\ud83d\udcb0 Total : ${{total}}\n\ud83d\udcc5 Livrezon estime : {{days}} jou\nN ap f\u00e8 ou konnen l\u00e8 li rive. M\u00e8si pou pasyans ou !' },
    es: { title: '\u2708\ufe0f \u00a1Paquete En Tr\u00e1nsito!', body: 'Su paquete {{tracking}} ({{weight}} lbs) est\u00e1 en camino a {{city}}.\n\ud83c\udff7\ufe0f Seguimiento transportista: {{externalTracking}}{{categoryLine}}{{specialItemLine}}\n\ud83c\udfe2 Dep\u00f3sito: {{depot}}\n\ud83d\udcb0 Total: ${{total}}\n\ud83d\udcc5 Entrega estimada: {{days}} d\u00edas\nLe avisaremos cuando llegue. \u00a1Gracias por su paciencia!' },
  },
  package_available: {
    en: { title: '\u2705 Ready for Pickup!', body: 'Your package {{tracking}} ({{weight}} lbs) is ready to be picked up!\n\ud83c\udff7\ufe0f Carrier tracking: {{externalTracking}}{{categoryLine}}{{specialItemLine}}\n\ud83c\udfe2 Depot: {{depot}}\n\ud83d\udccd Location: {{location}}\n\ud83d\udd52 Hours: {{hours}}\n\ud83d\udcb0 Amount due: ${{total}}\nPlease bring a valid ID. We look forward to seeing you!' },
    fr: { title: '\u2705 Pr\u00eat \u00e0 Retirer !', body: 'Votre colis {{tracking}} ({{weight}} lbs) est pr\u00eat \u00e0 \u00eatre r\u00e9cup\u00e9r\u00e9 !\n\ud83c\udff7\ufe0f Suivi transporteur : {{externalTracking}}{{categoryLine}}{{specialItemLine}}\n\ud83c\udfe2 D\u00e9p\u00f4t : {{depot}}\n\ud83d\udccd Adresse : {{location}}\n\ud83d\udd52 Horaires : {{hours}}\n\ud83d\udcb0 Montant d\u00fb : ${{total}}\nVeuillez apporter une pi\u00e8ce d\'identit\u00e9. Au plaisir de vous accueillir !' },
    ht: { title: '\u2705 Pare pou Ranmase !', body: 'Kolis ou {{tracking}} ({{weight}} lbs) pare pou ou vin pran li !\n\ud83c\udff7\ufe0f Suivi transp\u00f2t\u00e8 : {{externalTracking}}{{categoryLine}}{{specialItemLine}}\n\ud83c\udfe2 Depo : {{depot}}\n\ud83d\udccd Adr\u00e8s : {{location}}\n\ud83d\udd52 Or\u00e8 : {{hours}}\n\ud83d\udcb0 Montan pou peye : ${{total}}\nTanpri pote yon py\u00e8s idantite. N ap tann ou !' },
    es: { title: '\u2705 \u00a1Listo para Recoger!', body: 'Su paquete {{tracking}} ({{weight}} lbs) est\u00e1 listo para recoger.\n\ud83c\udff7\ufe0f Seguimiento transportista: {{externalTracking}}{{categoryLine}}{{specialItemLine}}\n\ud83c\udfe2 Dep\u00f3sito: {{depot}}\n\ud83d\udccd Direcci\u00f3n: {{location}}\n\ud83d\udd52 Horario: {{hours}}\n\ud83d\udcb0 Monto a pagar: ${{total}}\nPor favor traiga una identificaci\u00f3n v\u00e1lida. \u00a1Le esperamos!' },
  },
  package_delivered: {
    en: { title: '\ud83c\udf89 Package Delivered!', body: 'Your package {{tracking}} has been delivered successfully!\n\ud83c\udff7\ufe0f Carrier tracking: {{externalTracking}}{{categoryLine}}{{specialItemLine}}\n\ud83c\udfe2 Delivered from: {{depot}}\n\ud83c\udf1f You earned {{points}} loyalty points with this shipment.\nThank you for choosing Alliance Shipping \u2014 we appreciate your trust and look forward to serving you again!' },
    fr: { title: '\ud83c\udf89 Colis Livr\u00e9 !', body: 'Votre colis {{tracking}} a \u00e9t\u00e9 livr\u00e9 avec succ\u00e8s !\n\ud83c\udff7\ufe0f Suivi transporteur : {{externalTracking}}{{categoryLine}}{{specialItemLine}}\n\ud83c\udfe2 Livr\u00e9 depuis : {{depot}}\n\ud83c\udf1f Vous avez gagn\u00e9 {{points}} points de fid\u00e9lit\u00e9 avec cet envoi.\nMerci d\'avoir choisi Alliance Shipping \u2014 votre confiance nous honore et nous avons h\u00e2te de vous servir \u00e0 nouveau !' },
    ht: { title: '\ud83c\udf89 Kolis Livre !', body: 'Kolis ou {{tracking}} livre av\u00e8k siks\u00e8 !\n\ud83c\udff7\ufe0f Suivi transp\u00f2t\u00e8 : {{externalTracking}}{{categoryLine}}{{specialItemLine}}\n\ud83c\udfe2 Livre soti nan : {{depot}}\n\ud83c\udf1f Ou genyen {{points}} pwen fidelite ak anvwa sa a.\nM\u00e8si paske ou chwazi Alliance Shipping \u2014 konfyans ou enp\u00f2tan pou nou e n ap kontan s\u00e8vi ou ank\u00f2 !' },
    es: { title: '\ud83c\udf89 \u00a1Paquete Entregado!', body: 'Su paquete {{tracking}} ha sido entregado exitosamente.\n\ud83c\udff7\ufe0f Seguimiento transportista: {{externalTracking}}{{categoryLine}}{{specialItemLine}}\n\ud83c\udfe2 Entregado desde: {{depot}}\n\ud83c\udf1f Gan\u00f3 {{points}} puntos de fidelidad con este env\u00edo.\n\u00a1Gracias por elegir Alliance Shipping \u2014 valoramos su confianza y esperamos servirle nuevamente!' },
  },
  request_approved: {
    en: { title: '\ud83c\udf1f Request Approved!', body: 'Great news! Your package request for {{tracking}} has been approved.\n\ud83c\udff7\ufe0f Carrier tracking: {{externalTracking}}{{categoryLine}}{{specialItemLine}}\n\ud83c\udfe2 Depot: {{depot}}\n\ud83d\udccd Destination: {{city}}\n\ud83d\udcb0 Total: ${{total}}\nYour package is now in our system and being processed. We\'ll keep you updated!' },
    fr: { title: '\ud83c\udf1f Demande Approuv\u00e9e !', body: 'Bonne nouvelle ! Votre demande pour le colis {{tracking}} a \u00e9t\u00e9 approuv\u00e9e.\n\ud83c\udff7\ufe0f Suivi transporteur : {{externalTracking}}{{categoryLine}}{{specialItemLine}}\n\ud83c\udfe2 D\u00e9p\u00f4t : {{depot}}\n\ud83d\udccd Destination : {{city}}\n\ud83d\udcb0 Total : ${{total}}\nVotre colis est maintenant dans notre syst\u00e8me et en cours de traitement. Nous vous tiendrons inform\u00e9 !' },
    ht: { title: '\ud83c\udf1f Demann Apwouve !', body: 'Bon nouv\u00e8l ! Demann ou pou kolis {{tracking}} apwouve.\n\ud83c\udff7\ufe0f Suivi transp\u00f2t\u00e8 : {{externalTracking}}{{categoryLine}}{{specialItemLine}}\n\ud83c\udfe2 Depo : {{depot}}\n\ud83d\udccd Destinasyon : {{city}}\n\ud83d\udcb0 Total : ${{total}}\nKolis ou nan sist\u00e8m nou kounye a e l ap trete. N ap kenbe ou enf\u00f2me !' },
    es: { title: '\ud83c\udf1f \u00a1Solicitud Aprobada!', body: '\u00a1Buenas noticias! Su solicitud para el paquete {{tracking}} fue aprobada.\n\ud83c\udff7\ufe0f Seguimiento transportista: {{externalTracking}}{{categoryLine}}{{specialItemLine}}\n\ud83c\udfe2 Dep\u00f3sito: {{depot}}\n\ud83d\udccd Destino: {{city}}\n\ud83d\udcb0 Total: ${{total}}\nSu paquete est\u00e1 en nuestro sistema y siendo procesado. \u00a1Le mantendremos informado!' },
  },
  request_rejected: {
    en: { title: '\u274c Request Not Approved', body: 'We\'re sorry, your package request for {{tracking}} could not be approved at this time.\nPlease contact our support team for more details or to submit a new request.\n\ud83d\udcde We\'re here to help!' },
    fr: { title: '\u274c Demande Non Approuv\u00e9e', body: 'Nous sommes d\u00e9sol\u00e9s, votre demande pour le colis {{tracking}} n\'a pas pu \u00eatre approuv\u00e9e.\nVeuillez contacter notre \u00e9quipe de support pour plus de d\u00e9tails ou soumettre une nouvelle demande.\n\ud83d\udcde Nous sommes l\u00e0 pour vous aider !' },
    ht: { title: '\u274c Demann Pa Apwouve', body: 'Nou regr\u00e8t, demann ou pou kolis {{tracking}} pa t kapab apwouve pou kounye a.\nTanpri kontakte ekip sip\u00f2 nou an pou plis detay oswa pou soum\u00e8t yon nouvo demann.\n\ud83d\udcde Nou la pou ede ou !' },
    es: { title: '\u274c Solicitud No Aprobada', body: 'Lo sentimos, su solicitud para el paquete {{tracking}} no pudo ser aprobada en este momento.\nPor favor contacte a nuestro equipo de soporte para m\u00e1s detalles o enviar una nueva solicitud.\n\ud83d\udcde \u00a1Estamos aqu\u00ed para ayudarle!' },
  },
  customs_fees_added: {
    en: { title: '\ud83d\udee3\ufe0f Customs Fees Added', body: 'Customs fees have been applied to your package {{tracking}}.\n\ud83c\udff7\ufe0f Carrier tracking: {{externalTracking}}{{categoryLine}}{{specialItemLine}}\n\ud83d\udcdd Customs fee: ${{customs}}\n\ud83d\udcb0 New total: ${{total}}\nThese fees are required by Haitian customs authorities. Contact us if you have any questions.' },
    fr: { title: '\ud83d\udee3\ufe0f Frais de Douane Ajout\u00e9s', body: 'Des frais de douane ont \u00e9t\u00e9 appliqu\u00e9s \u00e0 votre colis {{tracking}}.\n\ud83c\udff7\ufe0f Suivi transporteur : {{externalTracking}}{{categoryLine}}{{specialItemLine}}\n\ud83d\udcdd Frais de douane : ${{customs}}\n\ud83d\udcb0 Nouveau total : ${{total}}\nCes frais sont exig\u00e9s par les autorit\u00e9s douani\u00e8res ha\u00eftiennes. Contactez-nous pour toute question.' },
    ht: { title: '\ud83d\udee3\ufe0f Fr\u00e8 Dwan Ajoute', body: 'Fr\u00e8 dwan ajoute nan kolis ou {{tracking}}.\n\ud83c\udff7\ufe0f Suivi transp\u00f2t\u00e8 : {{externalTracking}}{{categoryLine}}{{specialItemLine}}\n\ud83d\udcdd Fr\u00e8 dwan : ${{customs}}\n\ud83d\udcb0 Nouvo total : ${{total}}\nFr\u00e8 sa yo obligatwa pa otorite dwan ayisyen yo. Kontakte nou si ou gen kesyon.' },
    es: { title: '\ud83d\udee3\ufe0f Tasas Aduaneras Agregadas', body: 'Se aplicaron tasas aduaneras a su paquete {{tracking}}.\n\ud83c\udff7\ufe0f Seguimiento transportista: {{externalTracking}}{{categoryLine}}{{specialItemLine}}\n\ud83d\udcdd Tasa aduanera: ${{customs}}\n\ud83d\udcb0 Nuevo total: ${{total}}\nEstas tasas son requeridas por las autoridades aduaneras haitianas. Cont\u00e1ctenos si tiene alguna pregunta.' },
  },
  weight_updated: {
    en: { title: '\u2696\ufe0f Weight Updated', body: 'The weight of your package {{tracking}} has been verified and updated.\n\ud83c\udff7\ufe0f Carrier tracking: {{externalTracking}}{{categoryLine}}{{specialItemLine}}\n\u2696\ufe0f New weight: {{weight}} lbs\n\ud83d\udcb0 New total: ${{total}}\nThis adjustment is based on our verified weighing at the warehouse.' },
    fr: { title: '\u2696\ufe0f Poids Mis \u00e0 Jour', body: 'Le poids de votre colis {{tracking}} a \u00e9t\u00e9 v\u00e9rifi\u00e9 et mis \u00e0 jour.\n\ud83c\udff7\ufe0f Suivi transporteur : {{externalTracking}}{{categoryLine}}{{specialItemLine}}\n\u2696\ufe0f Nouveau poids : {{weight}} lbs\n\ud83d\udcb0 Nouveau total : ${{total}}\nCet ajustement est bas\u00e9 sur notre pes\u00e9e v\u00e9rifi\u00e9e \u00e0 l\'entrep\u00f4t.' },
    ht: { title: '\u2696\ufe0f Pwa Mete Ajou', body: 'Pwa kolis ou {{tracking}} verifye e mete ajou.\n\ud83c\udff7\ufe0f Suivi transp\u00f2t\u00e8 : {{externalTracking}}{{categoryLine}}{{specialItemLine}}\n\u2696\ufe0f Nouvo pwa : {{weight}} lbs\n\ud83d\udcb0 Nouvo total : ${{total}}\nAjisteman sa a baze sou peze nou verifye nan depo a.' },
    es: { title: '\u2696\ufe0f Peso Actualizado', body: 'El peso de su paquete {{tracking}} ha sido verificado y actualizado.\n\ud83c\udff7\ufe0f Seguimiento transportista: {{externalTracking}}{{categoryLine}}{{specialItemLine}}\n\u2696\ufe0f Nuevo peso: {{weight}} lbs\n\ud83d\udcb0 Nuevo total: ${{total}}\nEste ajuste se basa en nuestro pesaje verificado en el almac\u00e9n.' },
  },
  special_item_added: {
    en: { title: '\ud83d\udcf1 Special Item Detected', body: 'A special item ({{itemName}}) has been identified in your package {{tracking}}.\n\ud83c\udff7\ufe0f Carrier tracking: {{externalTracking}}{{categoryLine}}\n\ud83d\udcdd Special item fee: ${{fee}}\n\ud83d\udcb0 New total: ${{total}}\nSpecial items require specific handling for safe delivery.' },
    fr: { title: '\ud83d\udcf1 Article Sp\u00e9cial D\u00e9tect\u00e9', body: 'Un article sp\u00e9cial ({{itemName}}) a \u00e9t\u00e9 identifi\u00e9 dans votre colis {{tracking}}.\n\ud83c\udff7\ufe0f Suivi transporteur : {{externalTracking}}{{categoryLine}}\n\ud83d\udcdd Frais article sp\u00e9cial : ${{fee}}\n\ud83d\udcb0 Nouveau total : ${{total}}\nLes articles sp\u00e9ciaux n\u00e9cessitent une manutention sp\u00e9cifique pour une livraison en toute s\u00e9curit\u00e9.' },
    ht: { title: '\ud83d\udcf1 Atik Espesyal Detekte', body: 'Yon atik espesyal ({{itemName}}) idantifye nan kolis ou {{tracking}}.\n\ud83c\udff7\ufe0f Suivi transp\u00f2t\u00e8 : {{externalTracking}}{{categoryLine}}\n\ud83d\udcdd Fr\u00e8 atik espesyal : ${{fee}}\n\ud83d\udcb0 Nouvo total : ${{total}}\nAtik espesyal yo bezwen tretman espesyal pou livrezon an sekirite.' },
    es: { title: '\ud83d\udcf1 Art\u00edculo Especial Detectado', body: 'Se identific\u00f3 un art\u00edculo especial ({{itemName}}) en su paquete {{tracking}}.\n\ud83c\udff7\ufe0f Seguimiento transportista: {{externalTracking}}{{categoryLine}}\n\ud83d\udcdd Tarifa art\u00edculo especial: ${{fee}}\n\ud83d\udcb0 Nuevo total: ${{total}}\nLos art\u00edculos especiales requieren un manejo espec\u00edfico para una entrega segura.' },
  },
  admin_message: {
    en: { title: '\ud83d\udce9 Message from Alliance Shipping', body: '{{message}}\n\nRegarding your package {{tracking}}. Open the app for more details or contact our support team.' },
    fr: { title: '\ud83d\udce9 Message d\'Alliance Shipping', body: '{{message}}\n\nConcernant votre colis {{tracking}}. Ouvrez l\'app pour plus de d\u00e9tails ou contactez notre \u00e9quipe de support.' },
    ht: { title: '\ud83d\udce9 Mesaj Alliance Shipping', body: '{{message}}\n\nKons\u00e8nan kolis ou {{tracking}}. Ouvri app la pou plis detay oswa kontakte ekip sip\u00f2 nou an.' },
    es: { title: '\ud83d\udce9 Mensaje de Alliance Shipping', body: '{{message}}\n\nRespecto a su paquete {{tracking}}. Abra la app para m\u00e1s detalles o contacte a nuestro equipo de soporte.' },
  },
  new_announcement: {
    en: { title: '\ud83d\udce2 Alliance Shipping News', body: '{{title}}\n\n{{summary}}\n\nOpen the app for full details.' },
    fr: { title: '\ud83d\udce2 Nouvelles Alliance Shipping', body: '{{title}}\n\n{{summary}}\n\nOuvrez l\'app pour tous les d\u00e9tails.' },
    ht: { title: '\ud83d\udce2 Nouv\u00e8l Alliance Shipping', body: '{{title}}\n\n{{summary}}\n\nOuvri app la pou tout detay yo.' },
    es: { title: '\ud83d\udce2 Noticias Alliance Shipping', body: '{{title}}\n\n{{summary}}\n\nAbra la app para todos los detalles.' },
  },
  price_change: {
    en: { title: '\ud83d\udcb2 Shipping Rates Updated', body: 'Our shipping rates have been updated.\n\n{{details}}\n\nThese changes are effective immediately. Check the app for the complete pricing table.' },
    fr: { title: '\ud83d\udcb2 Tarifs Mis \u00e0 Jour', body: 'Nos tarifs d\'exp\u00e9dition ont \u00e9t\u00e9 mis \u00e0 jour.\n\n{{details}}\n\nCes changements sont effectifs imm\u00e9diatement. Consultez l\'app pour le tableau complet des tarifs.' },
    ht: { title: '\ud83d\udcb2 Tarif Livrezon Mete Ajou', body: 'Tarif livrezon nou yo mete ajou.\n\n{{details}}\n\nChanjman sa yo efektif imedyatman. Tcheke app la pou tablo konpl\u00e8 tarif yo.' },
    es: { title: '\ud83d\udcb2 Tarifas Actualizadas', body: 'Nuestras tarifas de env\u00edo han sido actualizadas.\n\n{{details}}\n\nEstos cambios son efectivos de inmediato. Consulte la app para la tabla completa de tarifas.' },
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

    // Auto-build category line based on locale (only when category is passed)
    if (variables.category) {
      const catLabels: Record<Locale, string> = {
        en: '\ud83d\udce6 Category',
        fr: '\ud83d\udce6 Cat\u00e9gorie',
        ht: '\ud83d\udce6 Kategori',
        es: '\ud83d\udce6 Categor\u00eda',
      };
      variables.categoryLine = `\n${catLabels[locale]}: ${variables.category}`;
    } else {
      variables.categoryLine = '';
    }

    // Auto-build special item line based on locale (only when specialItem is passed)
    if (variables.specialItem) {
      const specialLabels: Record<Locale, string> = {
        en: '\ud83d\udcf1 Special item',
        fr: '\ud83d\udcf1 Article sp\u00e9cial',
        ht: '\ud83d\udcf1 Atik espesyal',
        es: '\ud83d\udcf1 Art\u00edculo especial',
      };
      variables.specialItemLine = `\n${specialLabels[locale]}: ${variables.specialItem}`;
    } else {
      variables.specialItemLine = '';
    }

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
