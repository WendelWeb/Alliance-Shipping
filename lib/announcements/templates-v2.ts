// ============================================
// ANNOUNCEMENT TEMPLATES V2 - UNIFIED HUB
// 4 Categories × 16 Templates × 4 Languages
// ============================================

export type Locale = 'ht' | 'fr' | 'en' | 'es';
export type TemplateCategory = 'pricing' | 'loyalty' | 'operations' | 'communication';

export interface FormField {
  key: string;
  label: Record<Locale, string>;
  type: 'text' | 'number' | 'date' | 'currency' | 'city_select' | 'city_multi_select' | 'item_select' | 'warehouse_select' | 'textarea';
  placeholder?: string;
  required?: boolean;
  group?: string; // For grouping fields per city/item
}

export interface TemplateV2 {
  id: string;
  category: TemplateCategory;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  type: 'news' | 'alert' | 'promo' | 'maintenance';
  icon: string;
  color: string;
  isAction: boolean;
}

// ─── CATEGORY DEFINITIONS ──────────────────────────────────────
export const TEMPLATE_CATEGORIES: { id: TemplateCategory; name: Record<Locale, string>; icon: string; color: string }[] = [
  { id: 'pricing', name: { en: 'Pricing & Fees', fr: 'Tarifs & Frais', ht: 'Pri & Frè', es: 'Precios & Tarifas' }, icon: '💰', color: 'amber' },
  { id: 'loyalty', name: { en: 'Loyalty Program', fr: 'Programme Fidélité', ht: 'Pwogram Fidelite', es: 'Programa Lealtad' }, icon: '🎁', color: 'emerald' },
  { id: 'operations', name: { en: 'Operations', fr: 'Opérations', ht: 'Operasyon', es: 'Operaciones' }, icon: '⚙️', color: 'blue' },
  { id: 'communication', name: { en: 'Communication', fr: 'Communication', ht: 'Kominikasyon', es: 'Comunicación' }, icon: '📢', color: 'purple' },
];

// ─── ALL 16 TEMPLATES ──────────────────────────────────────────

export const TEMPLATES_V2: TemplateV2[] = [
  // ═══ PRICING & FEES (2) ═══════════════════════════════════════
  {
    id: 'city_fee_change',
    category: 'pricing',
    name: { en: 'City Fee Change', fr: 'Changement Frais Ville', ht: 'Chanjman Frè Vil', es: 'Cambio Tarifa Ciudad' },
    description: {
      en: 'Update service fees and price per pound for one or more cities',
      fr: 'Modifier les frais de service et le prix par livre pour une ou plusieurs villes',
      ht: 'Chanje frè sèvis ak pri pa liv pou youn oswa plizyè vil',
      es: 'Actualizar tarifas de servicio y precio por libra para una o más ciudades',
    },
    type: 'alert',
    icon: '💰',
    color: 'amber',
    isAction: true,
  },
  {
    id: 'delivery_time_change',
    category: 'pricing',
    name: { en: 'Delivery Time Change', fr: 'Changement Délai Livraison', ht: 'Chanjman Tan Livrezon', es: 'Cambio Tiempo Entrega' },
    description: {
      en: 'Update estimated delivery days for a city',
      fr: 'Modifier les jours de livraison estimés pour une ville',
      ht: 'Chanje jou livrezon estime pou yon vil',
      es: 'Actualizar días de entrega estimados para una ciudad',
    },
    type: 'news',
    icon: '📅',
    color: 'blue',
    isAction: true,
  },

  // ═══ LOYALTY (1) ══════════════════════════════════════════════
  {
    id: 'loyalty_rate_change',
    category: 'loyalty',
    name: { en: 'Loyalty Rate Change', fr: 'Changement Taux Fidélité', ht: 'Chanjman To Fidelite', es: 'Cambio Tasa Lealtad' },
    description: {
      en: 'Update loyalty program credit and point rates',
      fr: 'Modifier les taux de crédits et points du programme fidélité',
      ht: 'Chanje to kredi ak pwen pwogram fidelite a',
      es: 'Actualizar tasas de créditos y puntos del programa de lealtad',
    },
    type: 'news',
    icon: '🎁',
    color: 'emerald',
    isAction: true,
  },

  // ═══ OPERATIONS (6) ═══════════════════════════════════════════
  {
    id: 'new_special_item',
    category: 'operations',
    name: { en: 'New Special Item', fr: 'Nouvel Article Spécial', ht: 'Nouvo Atik Espesyal', es: 'Nuevo Artículo Especial' },
    description: {
      en: 'Add a new special item with fixed pricing (phones, tablets, etc.)',
      fr: 'Ajouter un nouvel article spécial avec prix fixe (téléphones, tablettes, etc.)',
      ht: 'Ajoute yon nouvo atik espesyal ak pri fiks (telefòn, tablèt, elatriye)',
      es: 'Agregar un nuevo artículo especial con precio fijo (teléfonos, tabletas, etc.)',
    },
    type: 'news',
    icon: '📱',
    color: 'blue',
    isAction: true,
  },
  {
    id: 'modify_special_item',
    category: 'operations',
    name: { en: 'Modify Special Item', fr: 'Modifier Article Spécial', ht: 'Modifye Atik Espesyal', es: 'Modificar Artículo Especial' },
    description: {
      en: 'Update pricing or details for an existing special item',
      fr: 'Modifier le prix ou les détails d\'un article spécial existant',
      ht: 'Chanje pri oswa detay yon atik espesyal ki egziste',
      es: 'Actualizar precio o detalles de un artículo especial existente',
    },
    type: 'news',
    icon: '✏️',
    color: 'orange',
    isAction: true,
  },
  {
    id: 'remove_special_item',
    category: 'operations',
    name: { en: 'Remove Special Item', fr: 'Retirer Article Spécial', ht: 'Retire Atik Espesyal', es: 'Eliminar Artículo Especial' },
    description: {
      en: 'Deactivate a special item from the pricing list',
      fr: 'Désactiver un article spécial de la liste de prix',
      ht: 'Dezaktive yon atik espesyal nan lis pri a',
      es: 'Desactivar un artículo especial de la lista de precios',
    },
    type: 'alert',
    icon: '🗑️',
    color: 'red',
    isAction: true,
  },
  {
    id: 'new_warehouse',
    category: 'operations',
    name: { en: 'New Warehouse', fr: 'Nouveau Dépôt', ht: 'Nouvo Depo', es: 'Nuevo Almacén' },
    description: {
      en: 'Add a new warehouse/delivery location',
      fr: 'Ajouter un nouveau dépôt de livraison',
      ht: 'Ajoute yon nouvo depo livrezon',
      es: 'Agregar un nuevo almacén/punto de entrega',
    },
    type: 'news',
    icon: '🏢',
    color: 'green',
    isAction: true,
  },
  {
    id: 'modify_warehouse',
    category: 'operations',
    name: { en: 'Modify Warehouse', fr: 'Modifier Dépôt', ht: 'Modifye Depo', es: 'Modificar Almacén' },
    description: {
      en: 'Update warehouse details (address, hours, contact)',
      fr: 'Modifier les détails du dépôt (adresse, horaires, contact)',
      ht: 'Chanje detay depo (adrès, lè, kontak)',
      es: 'Actualizar detalles del almacén (dirección, horario, contacto)',
    },
    type: 'news',
    icon: '🔄',
    color: 'blue',
    isAction: true,
  },
  {
    id: 'close_warehouse',
    category: 'operations',
    name: { en: 'Close Warehouse', fr: 'Fermer Dépôt', ht: 'Fèmen Depo', es: 'Cerrar Almacén' },
    description: {
      en: 'Permanently close a warehouse location',
      fr: 'Fermer définitivement un dépôt',
      ht: 'Fèmen yon depo pèmanantman',
      es: 'Cerrar permanentemente un almacén',
    },
    type: 'alert',
    icon: '🚫',
    color: 'red',
    isAction: true,
  },
  {
    id: 'remove_warehouse',
    category: 'operations',
    name: { en: 'Remove Warehouse', fr: 'Supprimer Dépôt', ht: 'Efase Depo', es: 'Eliminar Almacén' },
    description: {
      en: 'Permanently delete a warehouse from the database',
      fr: 'Supprimer définitivement un dépôt de la base de données',
      ht: 'Efase yon depo pèmanantman nan baz done a',
      es: 'Eliminar permanentemente un almacén de la base de datos',
    },
    type: 'alert',
    icon: '🗑️',
    color: 'red',
    isAction: true,
  },
  {
    id: 'new_city',
    category: 'operations',
    name: { en: 'New City', fr: 'Nouvelle Ville', ht: 'Nouvo Vil', es: 'Nueva Ciudad' },
    description: {
      en: 'Add a new city to the pricing list',
      fr: 'Ajouter une nouvelle ville à la liste de tarification',
      ht: 'Ajoute yon nouvo vil nan lis pri a',
      es: 'Agregar una nueva ciudad a la lista de precios',
    },
    type: 'news',
    icon: '🏙️',
    color: 'green',
    isAction: true,
  },
  {
    id: 'remove_city',
    category: 'operations',
    name: { en: 'Remove City', fr: 'Supprimer Ville', ht: 'Retire Vil', es: 'Eliminar Ciudad' },
    description: {
      en: 'Deactivate a city from the pricing list',
      fr: 'Désactiver une ville de la liste de tarification',
      ht: 'Dezaktive yon vil nan lis pri a',
      es: 'Desactivar una ciudad de la lista de precios',
    },
    type: 'alert',
    icon: '🚫',
    color: 'red',
    isAction: true,
  },

  // ═══ COMMUNICATION (7) ════════════════════════════════════════
  {
    id: 'delivery_delay',
    category: 'communication',
    name: { en: 'Delivery Delay', fr: 'Retard de Livraison', ht: 'Reta Livrezon', es: 'Retraso de Entrega' },
    description: {
      en: 'Notify users about delivery delays on specific routes',
      fr: 'Informer les utilisateurs de retards de livraison sur des routes spécifiques',
      ht: 'Enfòme itilizatè sou reta livrezon nan wout espesifik',
      es: 'Notificar a los usuarios sobre retrasos de entrega en rutas específicas',
    },
    type: 'alert',
    icon: '⏰',
    color: 'red',
    isAction: false,
  },
  {
    id: 'new_service',
    category: 'communication',
    name: { en: 'New Service', fr: 'Nouveau Service', ht: 'Nouvo Sèvis', es: 'Nuevo Servicio' },
    description: {
      en: 'Announce a new shipping service',
      fr: 'Annoncer un nouveau service d\'expédition',
      ht: 'Anonse yon nouvo sèvis anvoy',
      es: 'Anunciar un nuevo servicio de envío',
    },
    type: 'news',
    icon: '🚀',
    color: 'blue',
    isAction: false,
  },
  {
    id: 'promotion',
    category: 'communication',
    name: { en: 'Promotion', fr: 'Promotion', ht: 'Pwomosyon', es: 'Promoción' },
    description: {
      en: 'Share a promotional offer or discount',
      fr: 'Partager une offre promotionnelle ou un rabais',
      ht: 'Pataje yon òf pwomosyonèl oswa rabè',
      es: 'Compartir una oferta promocional o descuento',
    },
    type: 'promo',
    icon: '🎉',
    color: 'purple',
    isAction: false,
  },
  {
    id: 'maintenance',
    category: 'communication',
    name: { en: 'Scheduled Maintenance', fr: 'Maintenance Planifiée', ht: 'Mantyen Planifye', es: 'Mantenimiento Programado' },
    description: {
      en: 'Announce scheduled system maintenance',
      fr: 'Annoncer une maintenance système planifiée',
      ht: 'Anonse mantyen sistèm planifye',
      es: 'Anunciar mantenimiento programado del sistema',
    },
    type: 'maintenance',
    icon: '🔧',
    color: 'orange',
    isAction: false,
  },
  {
    id: 'temporary_closure',
    category: 'communication',
    name: { en: 'Temporary Closure', fr: 'Fermeture Temporaire', ht: 'Fèmti Tanporè', es: 'Cierre Temporal' },
    description: {
      en: 'Announce a temporary location closure',
      fr: 'Annoncer une fermeture temporaire d\'un emplacement',
      ht: 'Anonse yon fèmti tanporè yon anplasman',
      es: 'Anunciar un cierre temporal de una ubicación',
    },
    type: 'alert',
    icon: '🏢',
    color: 'red',
    isAction: false,
  },
  {
    id: 'weather_alert',
    category: 'communication',
    name: { en: 'Weather Alert', fr: 'Alerte Météo', ht: 'Alèt Meteyorolojik', es: 'Alerta Meteorológica' },
    description: {
      en: 'Alert about weather-related shipping disruptions',
      fr: 'Alerte sur les perturbations d\'expédition liées à la météo',
      ht: 'Alèt sou pètibasyon anvoy ki gen rapò ak meteyoloji',
      es: 'Alerta sobre interrupciones de envío relacionadas con el clima',
    },
    type: 'alert',
    icon: '🌀',
    color: 'red',
    isAction: false,
  },
  {
    id: 'new_destination',
    category: 'communication',
    name: { en: 'New Destination', fr: 'Nouvelle Destination', ht: 'Nouvo Destinasyon', es: 'Nuevo Destino' },
    description: {
      en: 'Announce a new delivery destination',
      fr: 'Annoncer une nouvelle destination de livraison',
      ht: 'Anonse yon nouvo destinasyon livrezon',
      es: 'Anunciar un nuevo destino de entrega',
    },
    type: 'news',
    icon: '📍',
    color: 'green',
    isAction: false,
  },
];

// ─── COMMUNICATION TEMPLATE CONTENT ({{variable}} style) ────────

export interface CommunicationTemplateContent {
  variables: { key: string; label: Record<Locale, string>; placeholder: string; type: 'text' | 'number' | 'date' | 'currency' | 'textarea' }[];
  title: Record<Locale, string>;
  content: Record<Locale, string>;
}

export const COMMUNICATION_TEMPLATES: Record<string, CommunicationTemplateContent> = {
  delivery_delay: {
    variables: [
      { key: 'reason', label: { en: 'Reason', fr: 'Raison', ht: 'Rezon', es: 'Razón' }, placeholder: 'Port congestion', type: 'text' },
      { key: 'estimatedDelay', label: { en: 'Estimated Delay', fr: 'Délai Estimé', ht: 'Delè Estime', es: 'Retraso Estimado' }, placeholder: '2-3 days', type: 'text' },
      { key: 'affectedRoutes', label: { en: 'Affected Routes', fr: 'Routes Affectées', ht: 'Wout ki Afekte', es: 'Rutas Afectadas' }, placeholder: 'Miami → Port-au-Prince', type: 'text' },
    ],
    title: {
      en: '⚠️ Delivery Delay Notice - {{affectedRoutes}}',
      fr: '⚠️ Avis de Retard de Livraison - {{affectedRoutes}}',
      ht: '⚠️ Avi Reta Livrezon - {{affectedRoutes}}',
      es: '⚠️ Aviso de Retraso de Entrega - {{affectedRoutes}}',
    },
    content: {
      en: 'Dear customers,\n\nWe regret to inform you that deliveries on the {{affectedRoutes}} route are experiencing delays.\n\n📋 Reason: {{reason}}\n⏰ Estimated Delay: {{estimatedDelay}}\n🚢 Affected Route: {{affectedRoutes}}\n\nWe are working hard to resolve this situation as quickly as possible. All affected packages will be delivered as soon as conditions allow.\n\nWe sincerely apologize for any inconvenience and thank you for your patience.\n\n— Alliance Shipping Team',
      fr: 'Chers clients,\n\nNous avons le regret de vous informer que les livraisons sur la route {{affectedRoutes}} subissent des retards.\n\n📋 Raison: {{reason}}\n⏰ Délai Estimé: {{estimatedDelay}}\n🚢 Route Affectée: {{affectedRoutes}}\n\nNous travaillons activement pour résoudre cette situation le plus rapidement possible. Tous les colis concernés seront livrés dès que les conditions le permettront.\n\nNous vous prions de nous excuser pour tout désagrément et vous remercions de votre patience.\n\n— Équipe Alliance Shipping',
      ht: 'Chè kliyan yo,\n\nNou regrèt pou fè nou konnen livrezon sou wout {{affectedRoutes}} ap fè reta.\n\n📋 Rezon: {{reason}}\n⏰ Reta Estime: {{estimatedDelay}}\n🚢 Wout ki Afekte: {{affectedRoutes}}\n\nNou ap travay di pou rezoud sitiyasyon sa a pi vit posib. Tout pakyè ki afekte yo ap livrè kou kondisyon yo pèmèt.\n\nNou eskize pou tout enkonvenyans epi mèsi pou pasyans ou.\n\n— Ekip Alliance Shipping',
      es: 'Estimados clientes,\n\nLamentamos informarles que las entregas en la ruta {{affectedRoutes}} están experimentando retrasos.\n\n📋 Razón: {{reason}}\n⏰ Retraso Estimado: {{estimatedDelay}}\n🚢 Ruta Afectada: {{affectedRoutes}}\n\nEstamos trabajando arduamente para resolver esta situación lo más rápido posible. Todos los paquetes afectados serán entregados en cuanto las condiciones lo permitan.\n\nPedimos disculpas por cualquier inconveniente y agradecemos su paciencia.\n\n— Equipo Alliance Shipping',
    },
  },
  new_service: {
    variables: [
      { key: 'serviceName', label: { en: 'Service Name', fr: 'Nom du Service', ht: 'Non Sèvis la', es: 'Nombre del Servicio' }, placeholder: 'Express 48h', type: 'text' },
      { key: 'description', label: { en: 'Description', fr: 'Description', ht: 'Deskripsyon', es: 'Descripción' }, placeholder: 'Fast delivery in 48 hours', type: 'textarea' },
      { key: 'availableDate', label: { en: 'Available From', fr: 'Disponible Dès', ht: 'Disponib Depi', es: 'Disponible Desde' }, placeholder: '2026-03-01', type: 'date' },
    ],
    title: {
      en: '🚀 New Service: {{serviceName}} Now Available!',
      fr: '🚀 Nouveau Service: {{serviceName}} Maintenant Disponible!',
      ht: '🚀 Nouvo Sèvis: {{serviceName}} Disponib Kounye a!',
      es: '🚀 Nuevo Servicio: {{serviceName}} ¡Ya Disponible!',
    },
    content: {
      en: 'Great news!\n\nWe are excited to announce our new service: {{serviceName}}!\n\n✨ {{description}}\n\n📅 Available from: {{availableDate}}\n\nThis new service is designed to better serve your shipping needs between the USA and Haiti. Try it today!\n\n— Alliance Shipping Team',
      fr: 'Bonne nouvelle!\n\nNous sommes ravis d\'annoncer notre nouveau service: {{serviceName}}!\n\n✨ {{description}}\n\n📅 Disponible dès le: {{availableDate}}\n\nCe nouveau service est conçu pour mieux répondre à vos besoins d\'expédition entre les États-Unis et Haïti. Essayez-le dès aujourd\'hui!\n\n— Équipe Alliance Shipping',
      ht: 'Bon nouvèl!\n\nNou kontan anpil anonse nouvo sèvis nou an: {{serviceName}}!\n\n✨ {{description}}\n\n📅 Disponib depi: {{availableDate}}\n\nNouvo sèvis sa a fèt pou pi byen sèvi bezwen anvoy ou ant Etazini ak Ayiti. Eseye l jodi a!\n\n— Ekip Alliance Shipping',
      es: '¡Buenas noticias!\n\nNos emociona anunciar nuestro nuevo servicio: {{serviceName}}!\n\n✨ {{description}}\n\n📅 Disponible desde: {{availableDate}}\n\nEste nuevo servicio está diseñado para atender mejor sus necesidades de envío entre EE.UU. y Haití. ¡Pruébelo hoy!\n\n— Equipo Alliance Shipping',
    },
  },
  promotion: {
    variables: [
      { key: 'discountPercent', label: { en: 'Discount %', fr: 'Remise %', ht: 'Rabais %', es: 'Descuento %' }, placeholder: '20', type: 'number' },
      { key: 'promoCode', label: { en: 'Promo Code', fr: 'Code Promo', ht: 'Kòd Pwomo', es: 'Código Promo' }, placeholder: 'SAVE20', type: 'text' },
      { key: 'startDate', label: { en: 'Start Date', fr: 'Date Début', ht: 'Dat Komansman', es: 'Fecha Inicio' }, placeholder: '2026-03-01', type: 'date' },
      { key: 'endDate', label: { en: 'End Date', fr: 'Date Fin', ht: 'Dat Fen', es: 'Fecha Fin' }, placeholder: '2026-03-31', type: 'date' },
      { key: 'conditions', label: { en: 'Conditions', fr: 'Conditions', ht: 'Kondisyon', es: 'Condiciones' }, placeholder: 'Min 5 lbs', type: 'text' },
    ],
    title: {
      en: '🎉 Special Offer: {{discountPercent}}% Off All Shipments!',
      fr: '🎉 Offre Spéciale: {{discountPercent}}% de Réduction sur Tous les Envois!',
      ht: '🎉 Òf Espesyal: {{discountPercent}}% Rabais sou Tout Anvoy!',
      es: '🎉 ¡Oferta Especial: {{discountPercent}}% de Descuento en Todos los Envíos!',
    },
    content: {
      en: 'Don\'t miss out on our amazing promotion!\n\n🎁 Discount: {{discountPercent}}% OFF\n🏷️ Promo Code: {{promoCode}}\n📅 Valid: {{startDate}} to {{endDate}}\n📋 Conditions: {{conditions}}\n\nUse code {{promoCode}} when submitting your package request to enjoy this exclusive discount.\n\nHurry, this offer is for a limited time only!\n\n— Alliance Shipping Team',
      fr: 'Ne manquez pas notre promotion exceptionnelle!\n\n🎁 Remise: {{discountPercent}}% DE RÉDUCTION\n🏷️ Code Promo: {{promoCode}}\n📅 Valide: {{startDate}} au {{endDate}}\n📋 Conditions: {{conditions}}\n\nUtilisez le code {{promoCode}} lors de votre demande de colis pour bénéficier de cette remise exclusive.\n\nDépêchez-vous, cette offre est limitée dans le temps!\n\n— Équipe Alliance Shipping',
      ht: 'Pa rate pwomosyon ekstraòdinè nou an!\n\n🎁 Rabais: {{discountPercent}}% RABAIS\n🏷️ Kòd Pwomo: {{promoCode}}\n📅 Valab: {{startDate}} jiska {{endDate}}\n📋 Kondisyon: {{conditions}}\n\nItilize kòd {{promoCode}} lè ou soumèt demann pakyè ou pou jwi rabais ekskliizif sa a.\n\nFè vit, òf sa a pou yon tan limite sèlman!\n\n— Ekip Alliance Shipping',
      es: '¡No se pierda nuestra increíble promoción!\n\n🎁 Descuento: {{discountPercent}}% DE DESCUENTO\n🏷️ Código Promo: {{promoCode}}\n📅 Válido: {{startDate}} al {{endDate}}\n📋 Condiciones: {{conditions}}\n\nUse el código {{promoCode}} al enviar su solicitud de paquete para disfrutar de este descuento exclusivo.\n\n¡Apresure, esta oferta es por tiempo limitado!\n\n— Equipo Alliance Shipping',
    },
  },
  maintenance: {
    variables: [
      { key: 'startDateTime', label: { en: 'Start Date/Time', fr: 'Date/Heure Début', ht: 'Dat/Lè Komansman', es: 'Fecha/Hora Inicio' }, placeholder: 'March 5, 2026 at 10:00 PM', type: 'text' },
      { key: 'endDateTime', label: { en: 'End Date/Time', fr: 'Date/Heure Fin', ht: 'Dat/Lè Fen', es: 'Fecha/Hora Fin' }, placeholder: 'March 6, 2026 at 6:00 AM', type: 'text' },
      { key: 'affectedServices', label: { en: 'Affected Services', fr: 'Services Affectés', ht: 'Sèvis ki Afekte', es: 'Servicios Afectados' }, placeholder: 'Website, tracking portal', type: 'text' },
    ],
    title: {
      en: '🔧 Scheduled Maintenance - {{startDateTime}}',
      fr: '🔧 Maintenance Planifiée - {{startDateTime}}',
      ht: '🔧 Mantyen Planifye - {{startDateTime}}',
      es: '🔧 Mantenimiento Programado - {{startDateTime}}',
    },
    content: {
      en: 'Dear customers,\n\nWe will be performing scheduled maintenance to improve our services.\n\n🔧 Start: {{startDateTime}}\n✅ End: {{endDateTime}}\n💻 Affected Services: {{affectedServices}}\n\nDuring this time, some services may be temporarily unavailable. All package tracking and shipment processing will resume normally after maintenance is complete.\n\nWe apologize for any inconvenience.\n\n— Alliance Shipping Team',
      fr: 'Chers clients,\n\nNous effectuerons une maintenance planifiée pour améliorer nos services.\n\n🔧 Début: {{startDateTime}}\n✅ Fin: {{endDateTime}}\n💻 Services Affectés: {{affectedServices}}\n\nPendant cette période, certains services peuvent être temporairement indisponibles. Le suivi des colis et le traitement des expéditions reprendront normalement après la maintenance.\n\nNous nous excusons pour tout désagrément.\n\n— Équipe Alliance Shipping',
      ht: 'Chè kliyan yo,\n\nNou pral fè mantyen planifye pou amelyore sèvis nou yo.\n\n🔧 Komansman: {{startDateTime}}\n✅ Fen: {{endDateTime}}\n💻 Sèvis ki Afekte: {{affectedServices}}\n\nPandan tan sa a, kèk sèvis ka pa disponib tanporèman. Swivi pakyè ak tretman anvoy yo ap rekomanse nòmalman aprè mantyen an fini.\n\nNou eskize pou tout enkonvenyans.\n\n— Ekip Alliance Shipping',
      es: 'Estimados clientes,\n\nRealizaremos un mantenimiento programado para mejorar nuestros servicios.\n\n🔧 Inicio: {{startDateTime}}\n✅ Fin: {{endDateTime}}\n💻 Servicios Afectados: {{affectedServices}}\n\nDurante este tiempo, algunos servicios pueden no estar disponibles temporalmente. El seguimiento de paquetes y el procesamiento de envíos se reanudarán normalmente después del mantenimiento.\n\nPedimos disculpas por cualquier inconveniente.\n\n— Equipo Alliance Shipping',
    },
  },
  temporary_closure: {
    variables: [
      { key: 'location', label: { en: 'Location', fr: 'Emplacement', ht: 'Anplasman', es: 'Ubicación' }, placeholder: 'Miami Warehouse', type: 'text' },
      { key: 'startDate', label: { en: 'Closure Start', fr: 'Début Fermeture', ht: 'Komansman Fèmti', es: 'Inicio Cierre' }, placeholder: '2026-03-01', type: 'date' },
      { key: 'endDate', label: { en: 'Reopening Date', fr: 'Date Réouverture', ht: 'Dat Reouvrè', es: 'Fecha Reapertura' }, placeholder: '2026-03-05', type: 'date' },
      { key: 'reason', label: { en: 'Reason', fr: 'Raison', ht: 'Rezon', es: 'Razón' }, placeholder: 'Renovation / Holiday', type: 'text' },
    ],
    title: {
      en: '🏢 Temporary Closure: {{location}}',
      fr: '🏢 Fermeture Temporaire: {{location}}',
      ht: '🏢 Fèmti Tanporè: {{location}}',
      es: '🏢 Cierre Temporal: {{location}}',
    },
    content: {
      en: 'Dear customers,\n\nPlease be informed that our {{location}} location will be temporarily closed.\n\n📅 Closed: {{startDate}} to {{endDate}}\n📋 Reason: {{reason}}\n\n🔄 We will reopen on {{endDate}}.\n\nDuring this period, please use our other locations for drop-offs and pickups. We apologize for any inconvenience.\n\n— Alliance Shipping Team',
      fr: 'Chers clients,\n\nVeuillez noter que notre emplacement {{location}} sera temporairement fermé.\n\n📅 Fermé: {{startDate}} au {{endDate}}\n📋 Raison: {{reason}}\n\n🔄 Nous rouvrirons le {{endDate}}.\n\nPendant cette période, veuillez utiliser nos autres emplacements. Nous nous excusons pour tout désagrément.\n\n— Équipe Alliance Shipping',
      ht: 'Chè kliyan yo,\n\nTanpri pran nòt ke anplasman {{location}} nou an pral fèmen tanporèman.\n\n📅 Fèmen: {{startDate}} jiska {{endDate}}\n📋 Rezon: {{reason}}\n\n🔄 Nou pral reouvrè {{endDate}}.\n\nPandan peryòd sa a, tanpri itilize lòt anplasman nou yo. Nou eskize pou tout enkonvenyans.\n\n— Ekip Alliance Shipping',
      es: 'Estimados clientes,\n\nLe informamos que nuestra ubicación {{location}} estará temporalmente cerrada.\n\n📅 Cerrado: {{startDate}} al {{endDate}}\n📋 Razón: {{reason}}\n\n🔄 Reabriremos el {{endDate}}.\n\nDurante este período, por favor utilice nuestras otras ubicaciones. Pedimos disculpas por cualquier inconveniente.\n\n— Equipo Alliance Shipping',
    },
  },
  weather_alert: {
    variables: [
      { key: 'weatherType', label: { en: 'Weather Type', fr: 'Type de Temps', ht: 'Tip Meteyoloji', es: 'Tipo de Clima' }, placeholder: 'Hurricane / Tropical Storm', type: 'text' },
      { key: 'affectedAreas', label: { en: 'Affected Areas', fr: 'Zones Affectées', ht: 'Zòn ki Afekte', es: 'Áreas Afectadas' }, placeholder: 'Port-au-Prince, Cap-Haïtien', type: 'text' },
      { key: 'estimatedDuration', label: { en: 'Estimated Duration', fr: 'Durée Estimée', ht: 'Dire Estime', es: 'Duración Estimada' }, placeholder: '3-5 days', type: 'text' },
      { key: 'precautions', label: { en: 'Precautions', fr: 'Précautions', ht: 'Prekosyon', es: 'Precauciones' }, placeholder: 'Secure packages, avoid travel', type: 'textarea' },
    ],
    title: {
      en: '🌀 Weather Alert: {{weatherType}} - Deliveries Affected',
      fr: '🌀 Alerte Météo: {{weatherType}} - Livraisons Affectées',
      ht: '🌀 Alèt Meteyolojik: {{weatherType}} - Livrezon Afekte',
      es: '🌀 Alerta Meteorológica: {{weatherType}} - Entregas Afectadas',
    },
    content: {
      en: 'IMPORTANT WEATHER ALERT\n\nDue to {{weatherType}}, our shipping operations in certain areas are affected.\n\n🌊 Weather: {{weatherType}}\n📍 Affected Areas: {{affectedAreas}}\n⏰ Estimated Duration: {{estimatedDuration}}\n\n⚠️ Precautions:\n{{precautions}}\n\nDeliveries to affected areas will be delayed until conditions improve. All packages are safely stored in our warehouses.\n\nYour safety is our priority. Stay safe!\n\n— Alliance Shipping Team',
      fr: 'ALERTE MÉTÉO IMPORTANTE\n\nEn raison de {{weatherType}}, nos opérations d\'expédition dans certaines zones sont affectées.\n\n🌊 Météo: {{weatherType}}\n📍 Zones Affectées: {{affectedAreas}}\n⏰ Durée Estimée: {{estimatedDuration}}\n\n⚠️ Précautions:\n{{precautions}}\n\nLes livraisons vers les zones touchées seront retardées jusqu\'à l\'amélioration des conditions. Tous les colis sont stockés en sécurité dans nos entrepôts.\n\nVotre sécurité est notre priorité. Restez prudents!\n\n— Équipe Alliance Shipping',
      ht: 'ALÈT METEYOLOJIK ENPÒTAN\n\nAkoz {{weatherType}}, operasyon anvoy nou nan kèk zòn afekte.\n\n🌊 Meteyoloji: {{weatherType}}\n📍 Zòn ki Afekte: {{affectedAreas}}\n⏰ Dire Estime: {{estimatedDuration}}\n\n⚠️ Prekosyon:\n{{precautions}}\n\nLivrezon nan zòn ki afekte yo pral fè reta jiskaske kondisyon yo amelyore. Tout pakyè yo estoke an sekirite nan depo nou yo.\n\nSekirite ou se priyorite nou. Rete pridan!\n\n— Ekip Alliance Shipping',
      es: 'ALERTA METEOROLÓGICA IMPORTANTE\n\nDebido a {{weatherType}}, nuestras operaciones de envío en ciertas áreas se ven afectadas.\n\n🌊 Clima: {{weatherType}}\n📍 Áreas Afectadas: {{affectedAreas}}\n⏰ Duración Estimada: {{estimatedDuration}}\n\n⚠️ Precauciones:\n{{precautions}}\n\nLas entregas a las áreas afectadas se retrasarán hasta que mejoren las condiciones. Todos los paquetes están almacenados de forma segura.\n\nSu seguridad es nuestra prioridad. ¡Manténgase seguro!\n\n— Equipo Alliance Shipping',
    },
  },
  new_destination: {
    variables: [
      { key: 'cityName', label: { en: 'City Name', fr: 'Nom de la Ville', ht: 'Non Vil la', es: 'Nombre de la Ciudad' }, placeholder: 'Les Cayes', type: 'text' },
      { key: 'country', label: { en: 'Country', fr: 'Pays', ht: 'Peyi', es: 'País' }, placeholder: 'Haiti', type: 'text' },
      { key: 'availableDate', label: { en: 'Available From', fr: 'Disponible Dès', ht: 'Disponib Depi', es: 'Disponible Desde' }, placeholder: '2026-04-01', type: 'date' },
      { key: 'pricing', label: { en: 'Pricing Info', fr: 'Info Tarifs', ht: 'Enfòmasyon Pri', es: 'Info Precios' }, placeholder: 'Same rates as other destinations', type: 'text' },
    ],
    title: {
      en: '📍 New Destination: {{cityName}}, {{country}}!',
      fr: '📍 Nouvelle Destination: {{cityName}}, {{country}}!',
      ht: '📍 Nouvo Destinasyon: {{cityName}}, {{country}}!',
      es: '📍 ¡Nuevo Destino: {{cityName}}, {{country}}!',
    },
    content: {
      en: 'We\'re expanding!\n\nAlliance Shipping is proud to announce a new delivery destination: {{cityName}}, {{country}}!\n\n📍 Location: {{cityName}}, {{country}}\n📅 Available From: {{availableDate}}\n💰 Pricing: {{pricing}}\n\nYou can now ship your packages directly to {{cityName}}. Select this new destination when submitting your package request.\n\nWe continue to grow to serve you better!\n\n— Alliance Shipping Team',
      fr: 'Nous grandissons!\n\nAlliance Shipping est fier d\'annoncer une nouvelle destination de livraison: {{cityName}}, {{country}}!\n\n📍 Emplacement: {{cityName}}, {{country}}\n📅 Disponible Dès: {{availableDate}}\n💰 Tarifs: {{pricing}}\n\nVous pouvez désormais expédier vos colis directement à {{cityName}}. Sélectionnez cette nouvelle destination lors de votre demande de colis.\n\nNous continuons à grandir pour mieux vous servir!\n\n— Équipe Alliance Shipping',
      ht: 'Nou ap grandi!\n\nAlliance Shipping fyè pou anonse yon nouvo destinasyon livrezon: {{cityName}}, {{country}}!\n\n📍 Anplasman: {{cityName}}, {{country}}\n📅 Disponib Depi: {{availableDate}}\n💰 Pri: {{pricing}}\n\nKounye a ou ka voye pakyè ou dirèkteman nan {{cityName}}. Chwazi nouvo destinasyon sa a lè ou soumèt demann pakyè ou.\n\nNou kontinye grandi pou sèvi ou pi byen!\n\n— Ekip Alliance Shipping',
      es: '¡Estamos creciendo!\n\nAlliance Shipping se enorgullece de anunciar un nuevo destino de entrega: {{cityName}}, {{country}}!\n\n📍 Ubicación: {{cityName}}, {{country}}\n📅 Disponible Desde: {{availableDate}}\n💰 Precios: {{pricing}}\n\nAhora puede enviar sus paquetes directamente a {{cityName}}. Seleccione este nuevo destino al enviar su solicitud de paquete.\n\n¡Seguimos creciendo para servirle mejor!\n\n— Equipo Alliance Shipping',
    },
  },
};

// ─── ACTION TEMPLATE TRANSLATION GENERATORS ─────────────────────

export interface CityFeeChangePayload {
  cities: {
    city: string;
    oldServiceFee: number;
    newServiceFee: number;
    oldPricePerLb: number;
    newPricePerLb: number;
  }[];
}

export interface DeliveryTimeChangePayload {
  city: string;
  oldDeliveryDaysMin: number;
  oldDeliveryDaysMax: number;
  newDeliveryDaysMin: number;
  newDeliveryDaysMax: number;
  oldPerfumeDaysMin: number;
  oldPerfumeDaysMax: number;
  newPerfumeDaysMin: number;
  newPerfumeDaysMax: number;
}

export interface LoyaltyRateChangePayload {
  changes: { key: string; oldValue: number; newValue: number }[];
}

export interface NewSpecialItemPayload {
  category: string;
  brand: string;
  itemName: string;
  minModel?: string;
  maxModel?: string;
  fixedFee: number;
  description?: string;
}

export interface ModifySpecialItemPayload {
  itemId: number;
  itemName: string;
  oldFixedFee: number;
  newFixedFee: number;
  oldMinModel?: string;
  newMinModel?: string;
  oldMaxModel?: string;
  newMaxModel?: string;
}

export interface RemoveSpecialItemPayload {
  itemId: number;
  itemName: string;
  brand: string;
}

export interface NewWarehousePayload {
  name: string;
  city: string;
  address: string;
  phone?: string;
  openingHours?: string;
}

export interface ModifyWarehousePayload {
  warehouseId: number;
  oldName: string;
  newName: string;
  oldCity: string;
  newCity: string;
  oldAddress: string;
  newAddress: string;
  oldPhone: string | null;
  newPhone: string | null;
  oldOpeningHours: string | null;
  newOpeningHours: string | null;
  oldLatitude: string | null;
  newLatitude: string | null;
  oldLongitude: string | null;
  newLongitude: string | null;
}

export interface CloseWarehousePayload {
  warehouseId: number;
  name: string;
  city: string;
  reason?: string;
}

export interface RemoveWarehousePayload {
  warehouseId: number;
  name: string;
  city: string;
  reason?: string;
}

export interface NewCityPayload {
  city: string;
  serviceFee: number;
  pricePerLb: number;
  deliveryDaysMin: number;
  deliveryDaysMax: number;
  perfumeDaysMin: number;
  perfumeDaysMax: number;
}

export interface RemoveCityPayload {
  city: string;
  reason?: string;
}

// Loyalty config labels (4 languages)
const loyaltyConfigLabels: Record<string, Record<Locale, string>> = {
  credit_per_shipment: { en: 'Credit per Shipment', fr: 'Crédit par Expédition', ht: 'Kredi pa Anvoy', es: 'Crédito por Envío' },
  credit_per_lb: { en: 'Credit per Pound', fr: 'Crédit par Livre', ht: 'Kredi pa Liv', es: 'Crédito por Libra' },
  points_per_dollar_spent: { en: 'Points per $1 Spent', fr: 'Points par 1$ Dépensé', ht: 'Pwen pa 1$ Depanse', es: 'Puntos por $1 Gastado' },
  points_to_dollar_rate: { en: 'Points for $1 Credit', fr: 'Points pour 1$ de Crédit', ht: 'Pwen pou 1$ Kredi', es: 'Puntos para $1 de Crédito' },
};

function formatLoyaltyValue(key: string, value: number): string {
  if (key.includes('points')) return `${Math.round(value)} pts`;
  return `$${value.toFixed(2)}`;
}

// Generate translations for all action templates
export function generateActionTranslations(
  templateId: string,
  payload: Record<string, any>
): Record<string, { title: string; content: string }> {
  const locales: Locale[] = ['en', 'fr', 'ht', 'es'];
  const translations: Record<string, { title: string; content: string }> = {};

  for (const locale of locales) {
    const result = generateActionContent(templateId, payload, locale);
    translations[locale] = result;
  }

  return translations;
}

function generateActionContent(
  templateId: string,
  payload: Record<string, any>,
  locale: Locale
): { title: string; content: string } {
  switch (templateId) {
    case 'city_fee_change':
      return generateCityFeeContent(payload as CityFeeChangePayload, locale);
    case 'delivery_time_change':
      return generateDeliveryTimeContent(payload as DeliveryTimeChangePayload, locale);
    case 'loyalty_rate_change':
      return generateLoyaltyRateContent(payload as LoyaltyRateChangePayload, locale);
    case 'new_special_item':
      return generateNewSpecialItemContent(payload as NewSpecialItemPayload, locale);
    case 'modify_special_item':
      return generateModifySpecialItemContent(payload as ModifySpecialItemPayload, locale);
    case 'remove_special_item':
      return generateRemoveSpecialItemContent(payload as RemoveSpecialItemPayload, locale);
    case 'new_warehouse':
      return generateNewWarehouseContent(payload as NewWarehousePayload, locale);
    case 'modify_warehouse':
      return generateModifyWarehouseContent(payload as ModifyWarehousePayload, locale);
    case 'close_warehouse':
      return generateCloseWarehouseContent(payload as CloseWarehousePayload, locale);
    case 'remove_warehouse':
      return generateRemoveWarehouseContent(payload as RemoveWarehousePayload, locale);
    case 'new_city':
      return generateNewCityContent(payload as NewCityPayload, locale);
    case 'remove_city':
      return generateRemoveCityContent(payload as RemoveCityPayload, locale);
    default:
      return { title: '', content: '' };
  }
}

// ─── City Fee Change ────────────────────────────────────────────

function generateCityFeeContent(payload: CityFeeChangePayload, locale: Locale): { title: string; content: string } {
  const cities = payload.cities;
  const cityNames = cities.map((c) => c.city).join(', ');

  const titles: Record<Locale, string> = {
    en: `Shipping Fees Updated - ${cityNames}`,
    fr: `Tarifs d'Expédition Mis à Jour - ${cityNames}`,
    ht: `Pri Anvoy Chanje - ${cityNames}`,
    es: `Tarifas de Envío Actualizadas - ${cityNames}`,
  };

  const intros: Record<Locale, string> = {
    en: 'Dear customers,\n\nWe are updating our shipping fees for the following cities:',
    fr: 'Chers clients,\n\nNous mettons à jour nos tarifs d\'expédition pour les villes suivantes :',
    ht: 'Chè kliyan,\n\nNou ap chanje tarif anvoy nou yo pou vil sa yo :',
    es: 'Estimados clientes,\n\nEstamos actualizando nuestras tarifas de envío para las siguientes ciudades:',
  };

  const serviceFeeLabel: Record<Locale, string> = { en: 'Service Fee', fr: 'Frais de Service', ht: 'Frè Sèvis', es: 'Tarifa de Servicio' };
  const pricePerLbLabel: Record<Locale, string> = { en: 'Price per Pound', fr: 'Prix par Livre', ht: 'Pri pa Liv', es: 'Precio por Libra' };

  const outros: Record<Locale, string> = {
    en: '\n\nThese changes are effective immediately. All packages submitted before this date will be processed at the previous rates.\n\nThank you for your continued trust.\n\n— Alliance Shipping Team',
    fr: '\n\nCes changements sont effectifs immédiatement. Tous les colis soumis avant cette date seront traités aux tarifs précédents.\n\nMerci pour votre confiance continue.\n\n— Équipe Alliance Shipping',
    ht: '\n\nChanjman sa yo ap pran efè touswit. Tout pakyè ki soumèt anvan dat sa a pral trete ak ansyen tarif yo.\n\nMèsi pou konfyans ou.\n\n— Ekip Alliance Shipping',
    es: '\n\nEstos cambios son efectivos de inmediato. Todos los paquetes enviados antes de esta fecha se procesarán con las tarifas anteriores.\n\nGracias por su confianza continua.\n\n— Equipo Alliance Shipping',
  };

  const cityDetails = cities.map((c) => {
    const lines: string[] = [`\n📍 ${c.city}`];
    if (c.oldServiceFee !== c.newServiceFee) {
      lines.push(`   ${serviceFeeLabel[locale]}: $${c.oldServiceFee.toFixed(2)} → $${c.newServiceFee.toFixed(2)}`);
    }
    if (c.oldPricePerLb !== c.newPricePerLb) {
      lines.push(`   ${pricePerLbLabel[locale]}: $${c.oldPricePerLb.toFixed(2)}/lb → $${c.newPricePerLb.toFixed(2)}/lb`);
    }
    return lines.join('\n');
  }).join('\n');

  return {
    title: titles[locale],
    content: `${intros[locale]}\n${cityDetails}${outros[locale]}`,
  };
}

// ─── Delivery Time Change ───────────────────────────────────────

function generateDeliveryTimeContent(payload: DeliveryTimeChangePayload, locale: Locale): { title: string; content: string } {
  const titles: Record<Locale, string> = {
    en: `Delivery Times Updated - ${payload.city}`,
    fr: `Délais de Livraison Mis à Jour - ${payload.city}`,
    ht: `Tan Livrezon Chanje - ${payload.city}`,
    es: `Tiempos de Entrega Actualizados - ${payload.city}`,
  };

  const standardLabel: Record<Locale, string> = { en: 'Standard Delivery', fr: 'Livraison Standard', ht: 'Livrezon Nòmal', es: 'Entrega Estándar' };
  const perfumeLabel: Record<Locale, string> = { en: 'Perfume/Restricted Items', fr: 'Parfums/Articles Restreints', ht: 'Pafen/Atik Restrenn', es: 'Perfumes/Artículos Restringidos' };
  const daysLabel: Record<Locale, string> = { en: 'days', fr: 'jours', ht: 'jou', es: 'días' };

  const intros: Record<Locale, string> = {
    en: `Dear customers,\n\nWe have updated the estimated delivery times for ${payload.city}:`,
    fr: `Chers clients,\n\nNous avons mis à jour les délais de livraison estimés pour ${payload.city} :`,
    ht: `Chè kliyan,\n\nNou fè mizajou sou tan livrezon estime pou ${payload.city} :`,
    es: `Estimados clientes,\n\nHemos actualizado los tiempos de entrega estimados para ${payload.city}:`,
  };

  const outros: Record<Locale, string> = {
    en: '\n\nThese are estimated delivery windows and may vary based on conditions.\n\nThank you for your understanding.\n\n— Alliance Shipping Team',
    fr: '\n\nCe sont des fenêtres de livraison estimées et peuvent varier selon les conditions.\n\nMerci de votre compréhension.\n\n— Équipe Alliance Shipping',
    ht: '\n\nSa yo se tan livrezon estime epi ka varye selon kondisyon yo.\n\nMèsi pou konpreyansyon ou.\n\n— Ekip Alliance Shipping',
    es: '\n\nEstos son tiempos de entrega estimados y pueden variar según las condiciones.\n\nGracias por su comprensión.\n\n— Equipo Alliance Shipping',
  };

  const content = `${intros[locale]}

📦 ${standardLabel[locale]}: ${payload.oldDeliveryDaysMin}-${payload.oldDeliveryDaysMax} ${daysLabel[locale]} → ${payload.newDeliveryDaysMin}-${payload.newDeliveryDaysMax} ${daysLabel[locale]}
🧴 ${perfumeLabel[locale]}: ${payload.oldPerfumeDaysMin}-${payload.oldPerfumeDaysMax} ${daysLabel[locale]} → ${payload.newPerfumeDaysMin}-${payload.newPerfumeDaysMax} ${daysLabel[locale]}${outros[locale]}`;

  return { title: titles[locale], content };
}

// ─── Loyalty Rate Change ────────────────────────────────────────

function generateLoyaltyRateContent(payload: LoyaltyRateChangePayload, locale: Locale): { title: string; content: string } {
  const titles: Record<Locale, string> = {
    en: 'Loyalty Program Rates Updated',
    fr: 'Taux du Programme de Fidélité Mis à Jour',
    ht: 'To Pwogram Fidelite a Chanje',
    es: 'Tasas del Programa de Lealtad Actualizadas',
  };

  const intros: Record<Locale, string> = {
    en: 'Dear customers,\n\nWe have updated our loyalty program rates. Here are the changes:',
    fr: 'Chers clients,\n\nNous avons mis à jour les taux de notre programme de fidélité. Voici les changements :',
    ht: 'Chè kliyan,\n\nNou fè mizajou sou to pwogram fidelite nou. Men chanjman yo :',
    es: 'Estimados clientes,\n\nHemos actualizado las tasas de nuestro programa de lealtad. Estos son los cambios:',
  };

  const outros: Record<Locale, string> = {
    en: '\n\nThese changes are effective immediately.\n\nThank you for your loyalty!\n— Alliance Shipping Team',
    fr: '\n\nCes changements sont effectifs immédiatement.\n\nMerci pour votre fidélité !\n— Équipe Alliance Shipping',
    ht: '\n\nChanjman sa yo ap pran efè touswit.\n\nMèsi pou fidelite ou !\n— Ekip Alliance Shipping',
    es: '\n\nEstos cambios son efectivos de inmediato.\n\n¡Gracias por su lealtad!\n— Equipo Alliance Shipping',
  };

  const changeLines = payload.changes.map((c) => {
    const label = loyaltyConfigLabels[c.key]?.[locale] || c.key;
    return `• ${label}: ${formatLoyaltyValue(c.key, c.oldValue)} → ${formatLoyaltyValue(c.key, c.newValue)}`;
  }).join('\n');

  return {
    title: titles[locale],
    content: `${intros[locale]}\n\n${changeLines}${outros[locale]}`,
  };
}

// ─── New Special Item ───────────────────────────────────────────

function generateNewSpecialItemContent(payload: NewSpecialItemPayload, locale: Locale): { title: string; content: string } {
  const modelRange = payload.minModel && payload.maxModel ? ` (${payload.minModel} - ${payload.maxModel})` : '';

  const titles: Record<Locale, string> = {
    en: `New Special Item: ${payload.brand} ${payload.itemName}`,
    fr: `Nouvel Article Spécial: ${payload.brand} ${payload.itemName}`,
    ht: `Nouvo Atik Espesyal: ${payload.brand} ${payload.itemName}`,
    es: `Nuevo Artículo Especial: ${payload.brand} ${payload.itemName}`,
  };

  const contents: Record<Locale, string> = {
    en: `Dear customers,\n\nWe have added a new special item to our shipping catalog:\n\n📱 ${payload.brand} ${payload.itemName}${modelRange}\n💰 Fixed Fee: $${payload.fixedFee.toFixed(2)}${payload.description ? `\n📋 ${payload.description}` : ''}\n\nThis item has a fixed shipping fee regardless of weight. Check our calculator for details.\n\n— Alliance Shipping Team`,
    fr: `Chers clients,\n\nNous avons ajouté un nouvel article spécial à notre catalogue d'expédition :\n\n📱 ${payload.brand} ${payload.itemName}${modelRange}\n💰 Frais Fixe: $${payload.fixedFee.toFixed(2)}${payload.description ? `\n📋 ${payload.description}` : ''}\n\nCet article a un frais d'expédition fixe quel que soit le poids. Consultez notre calculateur pour plus de détails.\n\n— Équipe Alliance Shipping`,
    ht: `Chè kliyan,\n\nNou ajoute yon nouvo atik espesyal nan katalòg anvoy nou:\n\n📱 ${payload.brand} ${payload.itemName}${modelRange}\n💰 Frè Fiks: $${payload.fixedFee.toFixed(2)}${payload.description ? `\n📋 ${payload.description}` : ''}\n\nAtik sa a gen yon frè anvoy fiks kèlkeswa pwa a. Tcheke kalklatè nou pou plis detay.\n\n— Ekip Alliance Shipping`,
    es: `Estimados clientes,\n\nHemos agregado un nuevo artículo especial a nuestro catálogo de envíos:\n\n📱 ${payload.brand} ${payload.itemName}${modelRange}\n💰 Tarifa Fija: $${payload.fixedFee.toFixed(2)}${payload.description ? `\n📋 ${payload.description}` : ''}\n\nEste artículo tiene una tarifa de envío fija sin importar el peso. Consulte nuestra calculadora para más detalles.\n\n— Equipo Alliance Shipping`,
  };

  return { title: titles[locale], content: contents[locale] };
}

// ─── Modify Special Item ────────────────────────────────────────

function generateModifySpecialItemContent(payload: ModifySpecialItemPayload, locale: Locale): { title: string; content: string } {
  const titles: Record<Locale, string> = {
    en: `Special Item Updated: ${payload.itemName}`,
    fr: `Article Spécial Modifié: ${payload.itemName}`,
    ht: `Atik Espesyal Modifye: ${payload.itemName}`,
    es: `Artículo Especial Actualizado: ${payload.itemName}`,
  };

  const feeLabel: Record<Locale, string> = { en: 'Fixed Fee', fr: 'Frais Fixe', ht: 'Frè Fiks', es: 'Tarifa Fija' };

  let changes = '';
  if (payload.oldFixedFee !== payload.newFixedFee) {
    changes += `\n💰 ${feeLabel[locale]}: $${payload.oldFixedFee.toFixed(2)} → $${payload.newFixedFee.toFixed(2)}`;
  }

  const intros: Record<Locale, string> = {
    en: `Dear customers,\n\nWe have updated the following special item:\n\n📱 ${payload.itemName}${changes}`,
    fr: `Chers clients,\n\nNous avons modifié l'article spécial suivant :\n\n📱 ${payload.itemName}${changes}`,
    ht: `Chè kliyan,\n\nNou modifye atik espesyal sa a :\n\n📱 ${payload.itemName}${changes}`,
    es: `Estimados clientes,\n\nHemos actualizado el siguiente artículo especial:\n\n📱 ${payload.itemName}${changes}`,
  };

  const outros: Record<Locale, string> = {
    en: '\n\nThese changes are effective immediately.\n\n— Alliance Shipping Team',
    fr: '\n\nCes changements sont effectifs immédiatement.\n\n— Équipe Alliance Shipping',
    ht: '\n\nChanjman sa yo ap pran efè touswit.\n\n— Ekip Alliance Shipping',
    es: '\n\nEstos cambios son efectivos de inmediato.\n\n— Equipo Alliance Shipping',
  };

  return { title: titles[locale], content: `${intros[locale]}${outros[locale]}` };
}

// ─── Remove Special Item ────────────────────────────────────────

function generateRemoveSpecialItemContent(payload: RemoveSpecialItemPayload, locale: Locale): { title: string; content: string } {
  const titles: Record<Locale, string> = {
    en: `Special Item Removed: ${payload.brand} ${payload.itemName}`,
    fr: `Article Spécial Retiré: ${payload.brand} ${payload.itemName}`,
    ht: `Atik Espesyal Retire: ${payload.brand} ${payload.itemName}`,
    es: `Artículo Especial Eliminado: ${payload.brand} ${payload.itemName}`,
  };

  const contents: Record<Locale, string> = {
    en: `Dear customers,\n\nPlease note that the following special item has been removed from our shipping catalog:\n\n🗑️ ${payload.brand} ${payload.itemName}\n\nThis item will now be charged at standard weight-based rates.\n\n— Alliance Shipping Team`,
    fr: `Chers clients,\n\nVeuillez noter que l'article spécial suivant a été retiré de notre catalogue :\n\n🗑️ ${payload.brand} ${payload.itemName}\n\nCet article sera désormais facturé aux tarifs standards basés sur le poids.\n\n— Équipe Alliance Shipping`,
    ht: `Chè kliyan,\n\nTanpri pran nòt ke atik espesyal sa a retire nan katalòg nou:\n\n🗑️ ${payload.brand} ${payload.itemName}\n\nAtik sa a pral peye ak tarif nòmal ki baze sou pwa kounye a.\n\n— Ekip Alliance Shipping`,
    es: `Estimados clientes,\n\nTenga en cuenta que el siguiente artículo especial ha sido eliminado de nuestro catálogo:\n\n🗑️ ${payload.brand} ${payload.itemName}\n\nEste artículo ahora se cobrará a las tarifas estándar basadas en peso.\n\n— Equipo Alliance Shipping`,
  };

  return { title: titles[locale], content: contents[locale] };
}

// ─── New Warehouse ──────────────────────────────────────────────

function generateNewWarehouseContent(payload: NewWarehousePayload, locale: Locale): { title: string; content: string } {
  const titles: Record<Locale, string> = {
    en: `New Warehouse: ${payload.name} (${payload.city})`,
    fr: `Nouveau Dépôt: ${payload.name} (${payload.city})`,
    ht: `Nouvo Depo: ${payload.name} (${payload.city})`,
    es: `Nuevo Almacén: ${payload.name} (${payload.city})`,
  };

  const details = [
    `📍 ${payload.address}`,
    payload.phone ? `📞 ${payload.phone}` : '',
    payload.openingHours ? `🕐 ${payload.openingHours}` : '',
  ].filter(Boolean).join('\n');

  const contents: Record<Locale, string> = {
    en: `Great news!\n\nWe have opened a new warehouse in ${payload.city}:\n\n🏢 ${payload.name}\n${details}\n\nYou can now select this location for your package deliveries.\n\n— Alliance Shipping Team`,
    fr: `Bonne nouvelle!\n\nNous avons ouvert un nouveau dépôt à ${payload.city} :\n\n🏢 ${payload.name}\n${details}\n\nVous pouvez maintenant sélectionner cet emplacement pour vos livraisons.\n\n— Équipe Alliance Shipping`,
    ht: `Bon nouvèl!\n\nNou ouvri yon nouvo depo nan ${payload.city} :\n\n🏢 ${payload.name}\n${details}\n\nKounye a ou ka chwazi anplasman sa a pou livrezon pakyè ou yo.\n\n— Ekip Alliance Shipping`,
    es: `¡Buenas noticias!\n\nHemos abierto un nuevo almacén en ${payload.city}:\n\n🏢 ${payload.name}\n${details}\n\nAhora puede seleccionar esta ubicación para sus entregas.\n\n— Equipo Alliance Shipping`,
  };

  return { title: titles[locale], content: contents[locale] };
}

// ─── Modify Warehouse ───────────────────────────────────────────

function generateModifyWarehouseContent(payload: ModifyWarehousePayload, locale: Locale): { title: string; content: string } {
  const titles: Record<Locale, string> = {
    en: `Warehouse Updated: ${payload.newName}`,
    fr: `Dépôt Modifié: ${payload.newName}`,
    ht: `Depo Modifye: ${payload.newName}`,
    es: `Almacén Actualizado: ${payload.newName}`,
  };

  const intros: Record<Locale, string> = {
    en: `Dear customers,\n\nWe have updated the details for ${payload.newName} warehouse:`,
    fr: `Chers clients,\n\nNous avons mis à jour les détails du dépôt ${payload.newName} :`,
    ht: `Chè kliyan,\n\nNou fè mizajou sou detay depo ${payload.newName} :`,
    es: `Estimados clientes,\n\nHemos actualizado los detalles del almacén ${payload.newName}:`,
  };

  const nameLabel: Record<Locale, string> = { en: 'Name', fr: 'Nom', ht: 'Non', es: 'Nombre' };
  const cityLabel: Record<Locale, string> = { en: 'City', fr: 'Ville', ht: 'Vil', es: 'Ciudad' };
  const addressLabel: Record<Locale, string> = { en: 'Address', fr: 'Adresse', ht: 'Adrès', es: 'Dirección' };
  const phoneLabel: Record<Locale, string> = { en: 'Phone', fr: 'Téléphone', ht: 'Telefòn', es: 'Teléfono' };
  const hoursLabel: Record<Locale, string> = { en: 'Opening Hours', fr: 'Horaires', ht: 'Lè Ouvè', es: 'Horario' };
  const coordsLabel: Record<Locale, string> = { en: 'GPS Coordinates', fr: 'Coordonnées GPS', ht: 'Kowòdone GPS', es: 'Coordenadas GPS' };

  const outros: Record<Locale, string> = {
    en: '\n\nPlease note these changes for your next visit.\n\n— Alliance Shipping Team',
    fr: '\n\nVeuillez prendre note de ces changements pour votre prochaine visite.\n\n— Équipe Alliance Shipping',
    ht: '\n\nTanpri pran nòt chanjman sa yo pou pwochen vizit ou.\n\n— Ekip Alliance Shipping',
    es: '\n\nPor favor tome nota de estos cambios para su próxima visita.\n\n— Equipo Alliance Shipping',
  };

  // Build list of changes
  const changes: string[] = [];

  if (payload.oldName !== payload.newName) {
    changes.push(`📝 ${nameLabel[locale]}: ${payload.oldName} → ${payload.newName}`);
  }
  if (payload.oldCity !== payload.newCity) {
    changes.push(`📍 ${cityLabel[locale]}: ${payload.oldCity} → ${payload.newCity}`);
  }
  if (payload.oldAddress !== payload.newAddress) {
    changes.push(`🏢 ${addressLabel[locale]}: ${payload.oldAddress} → ${payload.newAddress}`);
  }
  if (payload.oldPhone !== payload.newPhone) {
    changes.push(`📞 ${phoneLabel[locale]}: ${payload.oldPhone || 'N/A'} → ${payload.newPhone || 'N/A'}`);
  }
  if (payload.oldOpeningHours !== payload.newOpeningHours) {
    changes.push(`🕒 ${hoursLabel[locale]}: ${payload.oldOpeningHours || 'N/A'} → ${payload.newOpeningHours || 'N/A'}`);
  }
  if (payload.oldLatitude !== payload.newLatitude || payload.oldLongitude !== payload.newLongitude) {
    const oldCoords = payload.oldLatitude && payload.oldLongitude ? `${payload.oldLatitude}, ${payload.oldLongitude}` : 'N/A';
    const newCoords = payload.newLatitude && payload.newLongitude ? `${payload.newLatitude}, ${payload.newLongitude}` : 'N/A';
    changes.push(`🗺️ ${coordsLabel[locale]}: ${oldCoords} → ${newCoords}`);
  }

  const changesText = changes.length > 0 ? '\n\n' + changes.join('\n') : '';

  return {
    title: titles[locale],
    content: `${intros[locale]}${changesText}${outros[locale]}`,
  };
}

// ─── Close Warehouse ────────────────────────────────────────────

function generateCloseWarehouseContent(payload: CloseWarehousePayload, locale: Locale): { title: string; content: string } {
  const titles: Record<Locale, string> = {
    en: `Warehouse Closed: ${payload.name} (${payload.city})`,
    fr: `Dépôt Fermé: ${payload.name} (${payload.city})`,
    ht: `Depo Fèmen: ${payload.name} (${payload.city})`,
    es: `Almacén Cerrado: ${payload.name} (${payload.city})`,
  };

  const reasonLine = payload.reason ? {
    en: `\n📋 Reason: ${payload.reason}`,
    fr: `\n📋 Raison: ${payload.reason}`,
    ht: `\n📋 Rezon: ${payload.reason}`,
    es: `\n📋 Razón: ${payload.reason}`,
  } : { en: '', fr: '', ht: '', es: '' };

  const contents: Record<Locale, string> = {
    en: `Dear customers,\n\nWe regret to inform you that our ${payload.name} warehouse in ${payload.city} has been permanently closed.${reasonLine.en}\n\nPlease use our other locations for future deliveries. All packages already at this location will be transferred.\n\n— Alliance Shipping Team`,
    fr: `Chers clients,\n\nNous avons le regret de vous informer que notre dépôt ${payload.name} à ${payload.city} a été définitivement fermé.${reasonLine.fr}\n\nVeuillez utiliser nos autres emplacements pour vos livraisons futures. Tous les colis déjà sur place seront transférés.\n\n— Équipe Alliance Shipping`,
    ht: `Chè kliyan,\n\nNou regrèt pou fè ou konnen ke depo ${payload.name} nan ${payload.city} fèmen pèmanantman.${reasonLine.ht}\n\nTanpri itilize lòt anplasman nou yo pou livrezon alavni. Tout pakyè ki deja la pral transfere.\n\n— Ekip Alliance Shipping`,
    es: `Estimados clientes,\n\nLamentamos informarles que nuestro almacén ${payload.name} en ${payload.city} ha sido cerrado permanentemente.${reasonLine.es}\n\nPor favor utilice nuestras otras ubicaciones para futuras entregas. Todos los paquetes ya en esta ubicación serán transferidos.\n\n— Equipo Alliance Shipping`,
  };

  return { title: titles[locale], content: contents[locale] };
}

// ─── Remove Warehouse ───────────────────────────────────────────

function generateRemoveWarehouseContent(payload: RemoveWarehousePayload, locale: Locale): { title: string; content: string } {
  const titles: Record<Locale, string> = {
    en: `Warehouse Removed: ${payload.name} (${payload.city})`,
    fr: `Dépôt Supprimé: ${payload.name} (${payload.city})`,
    ht: `Depo Efase: ${payload.name} (${payload.city})`,
    es: `Almacén Eliminado: ${payload.name} (${payload.city})`,
  };

  const reasonLine = payload.reason ? {
    en: `\n📋 Reason: ${payload.reason}`,
    fr: `\n📋 Raison: ${payload.reason}`,
    ht: `\n📋 Rezon: ${payload.reason}`,
    es: `\n📋 Razón: ${payload.reason}`,
  } : { en: '', fr: '', ht: '', es: '' };

  const contents: Record<Locale, string> = {
    en: `Dear customers,\n\nOur ${payload.name} warehouse in ${payload.city} has been permanently removed from our system.${reasonLine.en}\n\nPlease use our other active locations for all future deliveries.\n\n— Alliance Shipping Team`,
    fr: `Chers clients,\n\nNotre dépôt ${payload.name} à ${payload.city} a été définitivement supprimé de notre système.${reasonLine.fr}\n\nVeuillez utiliser nos autres emplacements actifs pour toutes vos livraisons futures.\n\n— Équipe Alliance Shipping`,
    ht: `Chè kliyan,\n\nDepo ${payload.name} nan ${payload.city} efase pèmanantman nan sistèm nou an.${reasonLine.ht}\n\nTanpri itilize lòt anplasman aktif nou yo pou tout livrezon alavni.\n\n— Ekip Alliance Shipping`,
    es: `Estimados clientes,\n\nNuestro almacén ${payload.name} en ${payload.city} ha sido eliminado permanentemente de nuestro sistema.${reasonLine.es}\n\nPor favor utilice nuestras otras ubicaciones activas para todas sus futuras entregas.\n\n— Equipo Alliance Shipping`,
  };

  return { title: titles[locale], content: contents[locale] };
}

// ─── New City ───────────────────────────────────────────────────

function generateNewCityContent(payload: NewCityPayload, locale: Locale): { title: string; content: string } {
  const titles: Record<Locale, string> = {
    en: `New Destination: ${payload.city} Now Available!`,
    fr: `Nouvelle Destination: ${payload.city} Maintenant Disponible!`,
    ht: `Nouvo Destinasyon: ${payload.city} Disponib Kounye a!`,
    es: `¡Nuevo Destino: ${payload.city} Ya Disponible!`,
  };

  const contents: Record<Locale, string> = {
    en: `Great news!\n\nWe are expanding our service to ${payload.city}!\n\n📍 City: ${payload.city}\n💰 Service Fee: $${payload.serviceFee.toFixed(2)}\n📦 Price per Pound: $${payload.pricePerLb.toFixed(2)}/lb\n🚚 Delivery Time: ${payload.deliveryDaysMin}-${payload.deliveryDaysMax} days\n🌸 Perfume Items: ${payload.perfumeDaysMin}-${payload.perfumeDaysMax} days\n\nYou can now select ${payload.city} as a delivery destination when submitting your package requests.\n\nWe continue to grow to serve you better!\n\n— Alliance Shipping Team`,
    fr: `Bonne nouvelle!\n\nNous élargissons notre service à ${payload.city}!\n\n📍 Ville: ${payload.city}\n💰 Frais de Service: $${payload.serviceFee.toFixed(2)}\n📦 Prix par Livre: $${payload.pricePerLb.toFixed(2)}/lb\n🚚 Délai de Livraison: ${payload.deliveryDaysMin}-${payload.deliveryDaysMax} jours\n🌸 Articles Parfumés: ${payload.perfumeDaysMin}-${payload.perfumeDaysMax} jours\n\nVous pouvez désormais sélectionner ${payload.city} comme destination de livraison lors de vos demandes de colis.\n\nNous continuons à grandir pour mieux vous servir!\n\n— Équipe Alliance Shipping`,
    ht: `Bon nouvèl!\n\nNou ap agrandi sèvis nou nan ${payload.city}!\n\n📍 Vil: ${payload.city}\n💰 Frè Sèvis: $${payload.serviceFee.toFixed(2)}\n📦 Pri pa Liv: $${payload.pricePerLb.toFixed(2)}/lb\n🚚 Tan Livrezon: ${payload.deliveryDaysMin}-${payload.deliveryDaysMax} jou\n🌸 Atik Pafen: ${payload.perfumeDaysMin}-${payload.perfumeDaysMax} jou\n\nKounye a ou ka chwazi ${payload.city} kòm destinasyon livrezon lè ou soumèt demann pakyè ou.\n\nNou kontinye grandi pou sèvi ou pi byen!\n\n— Ekip Alliance Shipping`,
    es: `¡Buenas noticias!\n\n¡Estamos expandiendo nuestro servicio a ${payload.city}!\n\n📍 Ciudad: ${payload.city}\n💰 Tarifa de Servicio: $${payload.serviceFee.toFixed(2)}\n📦 Precio por Libra: $${payload.pricePerLb.toFixed(2)}/lb\n🚚 Tiempo de Entrega: ${payload.deliveryDaysMin}-${payload.deliveryDaysMax} días\n🌸 Artículos de Perfume: ${payload.perfumeDaysMin}-${payload.perfumeDaysMax} días\n\nAhora puede seleccionar ${payload.city} como destino de entrega al enviar sus solicitudes de paquetes.\n\n¡Seguimos creciendo para servirle mejor!\n\n— Equipo Alliance Shipping`,
  };

  return { title: titles[locale], content: contents[locale] };
}

// ─── Remove City ────────────────────────────────────────────────

function generateRemoveCityContent(payload: RemoveCityPayload, locale: Locale): { title: string; content: string } {
  const titles: Record<Locale, string> = {
    en: `Service Discontinued: ${payload.city}`,
    fr: `Service Interrompu: ${payload.city}`,
    ht: `Sèvis Sispann: ${payload.city}`,
    es: `Servicio Descontinuado: ${payload.city}`,
  };

  const reasonLine = payload.reason ? {
    en: `\n📋 Reason: ${payload.reason}`,
    fr: `\n📋 Raison: ${payload.reason}`,
    ht: `\n📋 Rezon: ${payload.reason}`,
    es: `\n📋 Razón: ${payload.reason}`,
  } : { en: '', fr: '', ht: '', es: '' };

  const contents: Record<Locale, string> = {
    en: `Dear customers,\n\nWe regret to inform you that we are no longer serving ${payload.city}.${reasonLine.en}\n\nPlease select one of our other active destinations for your future shipments. We apologize for any inconvenience.\n\n— Alliance Shipping Team`,
    fr: `Chers clients,\n\nNous avons le regret de vous informer que nous ne desservons plus ${payload.city}.${reasonLine.fr}\n\nVeuillez sélectionner l'une de nos autres destinations actives pour vos futurs envois. Nous nous excusons pour tout désagrément.\n\n— Équipe Alliance Shipping`,
    ht: `Chè kliyan,\n\nNou regrèt pou fè ou konnen ke nou pa sèvi ${payload.city} ankò.${reasonLine.ht}\n\nTanpri chwazi youn nan lòt destinasyon aktif nou yo pou anvoy alavni ou. Nou eskize pou tout enkonvenyans.\n\n— Ekip Alliance Shipping`,
    es: `Estimados clientes,\n\nLamentamos informarles que ya no prestamos servicio a ${payload.city}.${reasonLine.es}\n\nPor favor seleccione uno de nuestros otros destinos activos para sus futuros envíos. Pedimos disculpas por cualquier inconveniente.\n\n— Equipo Alliance Shipping`,
  };

  return { title: titles[locale], content: contents[locale] };
}

// ─── HELPERS ────────────────────────────────────────────────────

export function fillTemplate(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return result;
}

export function generateCommunicationTranslations(
  templateId: string,
  variables: Record<string, string>
): Record<string, { title: string; content: string }> {
  const template = COMMUNICATION_TEMPLATES[templateId];
  if (!template) return {};

  const translations: Record<string, { title: string; content: string }> = {};
  for (const lang of ['en', 'fr', 'ht', 'es']) {
    translations[lang] = {
      title: fillTemplate(template.title[lang as Locale], variables),
      content: fillTemplate(template.content[lang as Locale], variables),
    };
  }
  return translations;
}

export function getTemplateById(id: string): TemplateV2 | undefined {
  return TEMPLATES_V2.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: TemplateCategory): TemplateV2[] {
  return TEMPLATES_V2.filter((t) => t.category === category);
}
