// ============================================
// ANNOUNCEMENT TEMPLATES - ALL 8 TYPES × 4 LANGUAGES
// ============================================

export interface TemplateVariable {
  key: string;
  label: Record<string, string>;
  placeholder: string;
  type?: 'text' | 'number' | 'date' | 'currency';
}

export interface AnnouncementTemplate {
  id: string;
  name: Record<string, string>;
  type: string; // maps to announcement type: news, alert, promo, maintenance
  icon: string;
  color: string;
  variables: TemplateVariable[];
  title: Record<string, string>;
  content: Record<string, string>;
}

export const ANNOUNCEMENT_TEMPLATES: AnnouncementTemplate[] = [
  // ─── 1. PRICE CHANGE ──────────────────────────────────────────
  {
    id: 'price_change',
    name: {
      en: 'Price Change',
      fr: 'Changement de Prix',
      ht: 'Chanjman Pri',
      es: 'Cambio de Precio',
    },
    type: 'alert',
    icon: '💰',
    color: 'amber',
    variables: [
      { key: 'oldServiceFee', label: { en: 'Old Service Fee', fr: 'Ancien Frais de Service', ht: 'Ansyen Frè Sèvis', es: 'Tarifa Anterior' }, placeholder: '5', type: 'currency' },
      { key: 'newServiceFee', label: { en: 'New Service Fee', fr: 'Nouveau Frais de Service', ht: 'Nouvo Frè Sèvis', es: 'Nueva Tarifa' }, placeholder: '7', type: 'currency' },
      { key: 'oldPricePerLb', label: { en: 'Old Price/lb', fr: 'Ancien Prix/lb', ht: 'Ansyen Pri/lb', es: 'Precio Anterior/lb' }, placeholder: '4', type: 'currency' },
      { key: 'newPricePerLb', label: { en: 'New Price/lb', fr: 'Nouveau Prix/lb', ht: 'Nouvo Pri/lb', es: 'Nuevo Precio/lb' }, placeholder: '5', type: 'currency' },
      { key: 'effectiveDate', label: { en: 'Effective Date', fr: 'Date d\'Effet', ht: 'Dat Efektif', es: 'Fecha Efectiva' }, placeholder: '2026-03-01', type: 'date' },
    ],
    title: {
      en: 'Shipping Rate Update - Effective {{effectiveDate}}',
      fr: 'Mise \u00e0 Jour des Tarifs - Effectif le {{effectiveDate}}',
      ht: 'Chanjman Tarif Anvoy - Efektif {{effectiveDate}}',
      es: 'Actualizaci\u00f3n de Tarifas - Efectiva {{effectiveDate}}',
    },
    content: {
      en: 'Dear customers,\n\nWe would like to inform you of an update to our shipping rates.\n\n\ud83d\udce6 Service Fee: ${{oldServiceFee}} \u2192 ${{newServiceFee}}\n\u2696\ufe0f Price per Pound: ${{oldPricePerLb}}/lb \u2192 ${{newPricePerLb}}/lb\n\n\ud83d\udcc5 These new rates will take effect on {{effectiveDate}}.\n\nAll packages submitted before this date will be processed at the current rates. We remain committed to providing you with the best shipping service between the USA and Haiti.\n\nThank you for your continued trust.\n\n\u2014 Alliance Shipping Team',
      fr: 'Chers clients,\n\nNous souhaitons vous informer d\'une mise \u00e0 jour de nos tarifs d\'exp\u00e9dition.\n\n\ud83d\udce6 Frais de Service: ${{oldServiceFee}} \u2192 ${{newServiceFee}}\n\u2696\ufe0f Prix par Livre: ${{oldPricePerLb}}/lb \u2192 ${{newPricePerLb}}/lb\n\n\ud83d\udcc5 Ces nouveaux tarifs entreront en vigueur le {{effectiveDate}}.\n\nTous les colis soumis avant cette date seront trait\u00e9s aux tarifs actuels. Nous restons engag\u00e9s \u00e0 vous offrir le meilleur service d\'exp\u00e9dition entre les \u00c9tats-Unis et Ha\u00efti.\n\nMerci pour votre confiance.\n\n\u2014 \u00c9quipe Alliance Shipping',
      ht: 'Ch\u00e8 kliyan yo,\n\nNou ta renmen f\u00e8 nou konnen gen yon mizajou nan tarif anvoy nou yo.\n\n\ud83d\udce6 Fr\u00e8 S\u00e8vis: ${{oldServiceFee}} \u2192 ${{newServiceFee}}\n\u2696\ufe0f Pri pou chak Liv: ${{oldPricePerLb}}/lb \u2192 ${{newPricePerLb}}/lb\n\n\ud83d\udcc5 Nouvo tarif sa yo ap antre an vig\u00e8 {{effectiveDate}}.\n\nTout paky\u00e8 ki soum\u00e8t anvan dat sa a pral trete ak tarif akty\u00e8l yo. Nou rete angaje pou bay ou pi bon s\u00e8vis anvoy ant Etazini ak Ayiti.\n\nM\u00e8si pou konfyans ou.\n\n\u2014 Ekip Alliance Shipping',
      es: 'Estimados clientes,\n\nNos gustar\u00eda informarles sobre una actualizaci\u00f3n de nuestras tarifas de env\u00edo.\n\n\ud83d\udce6 Tarifa de Servicio: ${{oldServiceFee}} \u2192 ${{newServiceFee}}\n\u2696\ufe0f Precio por Libra: ${{oldPricePerLb}}/lb \u2192 ${{newPricePerLb}}/lb\n\n\ud83d\udcc5 Estas nuevas tarifas entrar\u00e1n en vigor el {{effectiveDate}}.\n\nTodos los paquetes enviados antes de esta fecha se procesar\u00e1n con las tarifas actuales. Seguimos comprometidos en brindarle el mejor servicio de env\u00edo entre EE.UU. y Hait\u00ed.\n\nGracias por su confianza.\n\n\u2014 Equipo Alliance Shipping',
    },
  },

  // ─── 2. DELIVERY DELAY ────────────────────────────────────────
  {
    id: 'delivery_delay',
    name: {
      en: 'Delivery Delay',
      fr: 'Retard de Livraison',
      ht: 'Reta Livrezon',
      es: 'Retraso de Entrega',
    },
    type: 'alert',
    icon: '⏰',
    color: 'red',
    variables: [
      { key: 'reason', label: { en: 'Reason', fr: 'Raison', ht: 'Rezon', es: 'Raz\u00f3n' }, placeholder: 'Port congestion / Weather', type: 'text' },
      { key: 'estimatedDelay', label: { en: 'Estimated Delay', fr: 'D\u00e9lai Estim\u00e9', ht: 'Delè Estime', es: 'Retraso Estimado' }, placeholder: '2-3 days', type: 'text' },
      { key: 'affectedRoutes', label: { en: 'Affected Routes', fr: 'Routes Affect\u00e9es', ht: 'Wout ki Afekte', es: 'Rutas Afectadas' }, placeholder: 'Miami \u2192 Port-au-Prince', type: 'text' },
    ],
    title: {
      en: '\u26a0\ufe0f Delivery Delay Notice - {{affectedRoutes}}',
      fr: '\u26a0\ufe0f Avis de Retard de Livraison - {{affectedRoutes}}',
      ht: '\u26a0\ufe0f Avi Reta Livrezon - {{affectedRoutes}}',
      es: '\u26a0\ufe0f Aviso de Retraso de Entrega - {{affectedRoutes}}',
    },
    content: {
      en: 'Dear customers,\n\nWe regret to inform you that deliveries on the {{affectedRoutes}} route are experiencing delays.\n\n\ud83d\udccb Reason: {{reason}}\n\u23f0 Estimated Delay: {{estimatedDelay}}\n\ud83d\udea2 Affected Route: {{affectedRoutes}}\n\nWe are working hard to resolve this situation as quickly as possible. All affected packages will be delivered as soon as conditions allow.\n\nWe sincerely apologize for any inconvenience and thank you for your patience.\n\n\u2014 Alliance Shipping Team',
      fr: 'Chers clients,\n\nNous avons le regret de vous informer que les livraisons sur la route {{affectedRoutes}} subissent des retards.\n\n\ud83d\udccb Raison: {{reason}}\n\u23f0 D\u00e9lai Estim\u00e9: {{estimatedDelay}}\n\ud83d\udea2 Route Affect\u00e9e: {{affectedRoutes}}\n\nNous travaillons activement pour r\u00e9soudre cette situation le plus rapidement possible. Tous les colis concern\u00e9s seront livr\u00e9s d\u00e8s que les conditions le permettront.\n\nNous vous prions de nous excuser pour tout d\u00e9sagr\u00e9ment et vous remercions de votre patience.\n\n\u2014 \u00c9quipe Alliance Shipping',
      ht: 'Ch\u00e8 kliyan yo,\n\nNou regrèt pou f\u00e8 nou konnen livrezon sou wout {{affectedRoutes}} ap f\u00e8 reta.\n\n\ud83d\udccb Rezon: {{reason}}\n\u23f0 Reta Estime: {{estimatedDelay}}\n\ud83d\udea2 Wout ki Afekte: {{affectedRoutes}}\n\nNou ap travay di pou rezoud sitiyasyon sa a pi vit posib. Tout paky\u00e8 ki afekte yo ap livr\u00e8 kou kondisyon yo p\u00e8m\u00e8t.\n\nNou eskize pou tout enkonvenyans epi m\u00e8si pou pasyans ou.\n\n\u2014 Ekip Alliance Shipping',
      es: 'Estimados clientes,\n\nLamentamos informarles que las entregas en la ruta {{affectedRoutes}} est\u00e1n experimentando retrasos.\n\n\ud83d\udccb Raz\u00f3n: {{reason}}\n\u23f0 Retraso Estimado: {{estimatedDelay}}\n\ud83d\udea2 Ruta Afectada: {{affectedRoutes}}\n\nEstamos trabajando arduamente para resolver esta situaci\u00f3n lo m\u00e1s r\u00e1pido posible. Todos los paquetes afectados ser\u00e1n entregados en cuanto las condiciones lo permitan.\n\nPedimos disculpas por cualquier inconveniente y agradecemos su paciencia.\n\n\u2014 Equipo Alliance Shipping',
    },
  },

  // ─── 3. NEW SERVICE ────────────────────────────────────────────
  {
    id: 'new_service',
    name: {
      en: 'New Service',
      fr: 'Nouveau Service',
      ht: 'Nouvo S\u00e8vis',
      es: 'Nuevo Servicio',
    },
    type: 'news',
    icon: '🚀',
    color: 'blue',
    variables: [
      { key: 'serviceName', label: { en: 'Service Name', fr: 'Nom du Service', ht: 'Non S\u00e8vis la', es: 'Nombre del Servicio' }, placeholder: 'Express 48h', type: 'text' },
      { key: 'description', label: { en: 'Description', fr: 'Description', ht: 'Deskripsyon', es: 'Descripci\u00f3n' }, placeholder: 'Fast delivery in 48 hours', type: 'text' },
      { key: 'availableDate', label: { en: 'Available From', fr: 'Disponible D\u00e8s', ht: 'Disponib Depi', es: 'Disponible Desde' }, placeholder: '2026-03-01', type: 'date' },
    ],
    title: {
      en: '\ud83d\ude80 New Service: {{serviceName}} Now Available!',
      fr: '\ud83d\ude80 Nouveau Service: {{serviceName}} Maintenant Disponible!',
      ht: '\ud83d\ude80 Nouvo S\u00e8vis: {{serviceName}} Disponib Kounye a!',
      es: '\ud83d\ude80 Nuevo Servicio: {{serviceName}} \u00a1Ya Disponible!',
    },
    content: {
      en: 'Great news!\n\nWe are excited to announce our new service: {{serviceName}}!\n\n\u2728 {{description}}\n\n\ud83d\udcc5 Available from: {{availableDate}}\n\nThis new service is designed to better serve your shipping needs between the USA and Haiti. Try it today!\n\nVisit our website or contact us for more details.\n\n\u2014 Alliance Shipping Team',
      fr: 'Bonne nouvelle!\n\nNous sommes ravis d\'annoncer notre nouveau service: {{serviceName}}!\n\n\u2728 {{description}}\n\n\ud83d\udcc5 Disponible d\u00e8s le: {{availableDate}}\n\nCe nouveau service est con\u00e7u pour mieux r\u00e9pondre \u00e0 vos besoins d\'exp\u00e9dition entre les \u00c9tats-Unis et Ha\u00efti. Essayez-le d\u00e8s aujourd\'hui!\n\nVisitez notre site ou contactez-nous pour plus de d\u00e9tails.\n\n\u2014 \u00c9quipe Alliance Shipping',
      ht: 'Bon nouv\u00e8l!\n\nNou kontan anpil anonse nouvo s\u00e8vis nou an: {{serviceName}}!\n\n\u2728 {{description}}\n\n\ud83d\udcc5 Disponib depi: {{availableDate}}\n\nNouvo s\u00e8vis sa a f\u00e8t pou pi byen s\u00e8vi bezwen anvoy ou ant Etazini ak Ayiti. Eseye l jodi a!\n\nVizite sit n\u00f2t oswa kontakte nou pou plis detay.\n\n\u2014 Ekip Alliance Shipping',
      es: '\u00a1Buenas noticias!\n\nNos emociona anunciar nuestro nuevo servicio: {{serviceName}}!\n\n\u2728 {{description}}\n\n\ud83d\udcc5 Disponible desde: {{availableDate}}\n\nEste nuevo servicio est\u00e1 dise\u00f1ado para atender mejor sus necesidades de env\u00edo entre EE.UU. y Hait\u00ed. \u00a1Pru\u00e9belo hoy!\n\nVisite nuestro sitio web o cont\u00e1ctenos para m\u00e1s detalles.\n\n\u2014 Equipo Alliance Shipping',
    },
  },

  // ─── 4. PROMOTION ──────────────────────────────────────────────
  {
    id: 'promotion',
    name: {
      en: 'Promotion',
      fr: 'Promotion',
      ht: 'Pwomosyon',
      es: 'Promoci\u00f3n',
    },
    type: 'promo',
    icon: '🎉',
    color: 'purple',
    variables: [
      { key: 'discountPercent', label: { en: 'Discount %', fr: 'Remise %', ht: 'Rabais %', es: 'Descuento %' }, placeholder: '20', type: 'number' },
      { key: 'promoCode', label: { en: 'Promo Code', fr: 'Code Promo', ht: 'K\u00f2d Pwomo', es: 'C\u00f3digo Promo' }, placeholder: 'SAVE20', type: 'text' },
      { key: 'startDate', label: { en: 'Start Date', fr: 'Date D\u00e9but', ht: 'Dat Komansman', es: 'Fecha Inicio' }, placeholder: '2026-03-01', type: 'date' },
      { key: 'endDate', label: { en: 'End Date', fr: 'Date Fin', ht: 'Dat Fen', es: 'Fecha Fin' }, placeholder: '2026-03-31', type: 'date' },
      { key: 'conditions', label: { en: 'Conditions', fr: 'Conditions', ht: 'Kondisyon', es: 'Condiciones' }, placeholder: 'Min 5 lbs, max 50 lbs', type: 'text' },
    ],
    title: {
      en: '\ud83c\udf89 Special Offer: {{discountPercent}}% Off All Shipments!',
      fr: '\ud83c\udf89 Offre Sp\u00e9ciale: {{discountPercent}}% de R\u00e9duction sur Tous les Envois!',
      ht: '\ud83c\udf89 \u00d2f Espesyal: {{discountPercent}}% Rabais sou Tout Anvoy!',
      es: '\ud83c\udf89 \u00a1Oferta Especial: {{discountPercent}}% de Descuento en Todos los Env\u00edos!',
    },
    content: {
      en: 'Don\'t miss out on our amazing promotion!\n\n\ud83c\udf81 Discount: {{discountPercent}}% OFF\n\ud83c\udff7\ufe0f Promo Code: {{promoCode}}\n\ud83d\udcc5 Valid: {{startDate}} to {{endDate}}\n\ud83d\udccb Conditions: {{conditions}}\n\nUse code {{promoCode}} when submitting your package request to enjoy this exclusive discount.\n\nHurry, this offer is for a limited time only!\n\n\u2014 Alliance Shipping Team',
      fr: 'Ne manquez pas notre promotion exceptionnelle!\n\n\ud83c\udf81 Remise: {{discountPercent}}% DE R\u00c9DUCTION\n\ud83c\udff7\ufe0f Code Promo: {{promoCode}}\n\ud83d\udcc5 Valide: {{startDate}} au {{endDate}}\n\ud83d\udccb Conditions: {{conditions}}\n\nUtilisez le code {{promoCode}} lors de votre demande de colis pour b\u00e9n\u00e9ficier de cette remise exclusive.\n\nD\u00e9p\u00eachez-vous, cette offre est limit\u00e9e dans le temps!\n\n\u2014 \u00c9quipe Alliance Shipping',
      ht: 'Pa rate pwomosyon ekstraòdin\u00e8 nou an!\n\n\ud83c\udf81 Rabais: {{discountPercent}}% RABAIS\n\ud83c\udff7\ufe0f K\u00f2d Pwomo: {{promoCode}}\n\ud83d\udcc5 Valab: {{startDate}} jiska {{endDate}}\n\ud83d\udccb Kondisyon: {{conditions}}\n\nItilize k\u00f2d {{promoCode}} l\u00e8 ou soum\u00e8t demann paky\u00e8 ou pou jwi rabais ekskl\u00fczif sa a.\n\nF\u00e8 vit, \u00f2f sa a pou yon tan limite s\u00e8lman!\n\n\u2014 Ekip Alliance Shipping',
      es: '\u00a1No se pierda nuestra incre\u00edble promoci\u00f3n!\n\n\ud83c\udf81 Descuento: {{discountPercent}}% DE DESCUENTO\n\ud83c\udff7\ufe0f C\u00f3digo Promo: {{promoCode}}\n\ud83d\udcc5 V\u00e1lido: {{startDate}} al {{endDate}}\n\ud83d\udccb Condiciones: {{conditions}}\n\nUse el c\u00f3digo {{promoCode}} al enviar su solicitud de paquete para disfrutar de este descuento exclusivo.\n\n\u00a1Apresure, esta oferta es por tiempo limitado!\n\n\u2014 Equipo Alliance Shipping',
    },
  },

  // ─── 5. MAINTENANCE ────────────────────────────────────────────
  {
    id: 'maintenance',
    name: {
      en: 'Scheduled Maintenance',
      fr: 'Maintenance Planifi\u00e9e',
      ht: 'Mantyen Planifye',
      es: 'Mantenimiento Programado',
    },
    type: 'maintenance',
    icon: '🔧',
    color: 'orange',
    variables: [
      { key: 'startDateTime', label: { en: 'Start Date/Time', fr: 'Date/Heure D\u00e9but', ht: 'Dat/L\u00e8 Komansman', es: 'Fecha/Hora Inicio' }, placeholder: 'March 5, 2026 at 10:00 PM', type: 'text' },
      { key: 'endDateTime', label: { en: 'End Date/Time', fr: 'Date/Heure Fin', ht: 'Dat/L\u00e8 Fen', es: 'Fecha/Hora Fin' }, placeholder: 'March 6, 2026 at 6:00 AM', type: 'text' },
      { key: 'affectedServices', label: { en: 'Affected Services', fr: 'Services Affect\u00e9s', ht: 'S\u00e8vis ki Afekte', es: 'Servicios Afectados' }, placeholder: 'Website, tracking portal', type: 'text' },
    ],
    title: {
      en: '\ud83d\udd27 Scheduled Maintenance - {{startDateTime}}',
      fr: '\ud83d\udd27 Maintenance Planifi\u00e9e - {{startDateTime}}',
      ht: '\ud83d\udd27 Mantyen Planifye - {{startDateTime}}',
      es: '\ud83d\udd27 Mantenimiento Programado - {{startDateTime}}',
    },
    content: {
      en: 'Dear customers,\n\nWe will be performing scheduled maintenance to improve our services.\n\n\ud83d\udd27 Start: {{startDateTime}}\n\u2705 End: {{endDateTime}}\n\ud83d\udcbb Affected Services: {{affectedServices}}\n\nDuring this time, some services may be temporarily unavailable. All package tracking and shipment processing will resume normally after maintenance is complete.\n\nWe apologize for any inconvenience.\n\n\u2014 Alliance Shipping Team',
      fr: 'Chers clients,\n\nNous effectuerons une maintenance planifi\u00e9e pour am\u00e9liorer nos services.\n\n\ud83d\udd27 D\u00e9but: {{startDateTime}}\n\u2705 Fin: {{endDateTime}}\n\ud83d\udcbb Services Affect\u00e9s: {{affectedServices}}\n\nPendant cette p\u00e9riode, certains services peuvent \u00eatre temporairement indisponibles. Le suivi des colis et le traitement des exp\u00e9ditions reprendront normalement apr\u00e8s la maintenance.\n\nNous nous excusons pour tout d\u00e9sagr\u00e9ment.\n\n\u2014 \u00c9quipe Alliance Shipping',
      ht: 'Ch\u00e8 kliyan yo,\n\nNou pral f\u00e8 mantyen planifye pou amelyore s\u00e8vis nou yo.\n\n\ud83d\udd27 Komansman: {{startDateTime}}\n\u2705 Fen: {{endDateTime}}\n\ud83d\udcbb S\u00e8vis ki Afekte: {{affectedServices}}\n\nPandan tan sa a, k\u00e8k s\u00e8vis ka pa disponib tanpor\u00e8man. Swivi paky\u00e8 ak tretman anvoy yo ap rekomanse n\u00f2malman apr\u00e8 mantyen an fini.\n\nNou eskize pou tout enkonvenyans.\n\n\u2014 Ekip Alliance Shipping',
      es: 'Estimados clientes,\n\nRealizaremos un mantenimiento programado para mejorar nuestros servicios.\n\n\ud83d\udd27 Inicio: {{startDateTime}}\n\u2705 Fin: {{endDateTime}}\n\ud83d\udcbb Servicios Afectados: {{affectedServices}}\n\nDurante este tiempo, algunos servicios pueden no estar disponibles temporalmente. El seguimiento de paquetes y el procesamiento de env\u00edos se reanudar\u00e1n normalmente despu\u00e9s del mantenimiento.\n\nPedimos disculpas por cualquier inconveniente.\n\n\u2014 Equipo Alliance Shipping',
    },
  },

  // ─── 6. TEMPORARY CLOSURE ─────────────────────────────────────
  {
    id: 'temporary_closure',
    name: {
      en: 'Temporary Closure',
      fr: 'Fermeture Temporaire',
      ht: 'F\u00e8mti Tanpor\u00e8',
      es: 'Cierre Temporal',
    },
    type: 'alert',
    icon: '🏢',
    color: 'red',
    variables: [
      { key: 'location', label: { en: 'Location', fr: 'Emplacement', ht: 'Anplasman', es: 'Ubicaci\u00f3n' }, placeholder: 'Miami Warehouse', type: 'text' },
      { key: 'startDate', label: { en: 'Closure Start', fr: 'D\u00e9but Fermeture', ht: 'Komansman F\u00e8mti', es: 'Inicio Cierre' }, placeholder: '2026-03-01', type: 'date' },
      { key: 'endDate', label: { en: 'Reopening Date', fr: 'Date R\u00e9ouverture', ht: 'Dat Reouv\u00e8ti', es: 'Fecha Reapertura' }, placeholder: '2026-03-05', type: 'date' },
      { key: 'reason', label: { en: 'Reason', fr: 'Raison', ht: 'Rezon', es: 'Raz\u00f3n' }, placeholder: 'Renovation / Holiday', type: 'text' },
    ],
    title: {
      en: '\ud83c\udfe2 Temporary Closure: {{location}}',
      fr: '\ud83c\udfe2 Fermeture Temporaire: {{location}}',
      ht: '\ud83c\udfe2 F\u00e8mti Tanpor\u00e8: {{location}}',
      es: '\ud83c\udfe2 Cierre Temporal: {{location}}',
    },
    content: {
      en: 'Dear customers,\n\nPlease be informed that our {{location}} location will be temporarily closed.\n\n\ud83d\udcc5 Closed: {{startDate}} to {{endDate}}\n\ud83d\udccb Reason: {{reason}}\n\n\ud83d\udd04 We will reopen on {{endDate}}.\n\nDuring this period, please use our other locations for drop-offs and pickups. We apologize for any inconvenience.\n\n\u2014 Alliance Shipping Team',
      fr: 'Chers clients,\n\nVeuillez noter que notre emplacement {{location}} sera temporairement ferm\u00e9.\n\n\ud83d\udcc5 Ferm\u00e9: {{startDate}} au {{endDate}}\n\ud83d\udccb Raison: {{reason}}\n\n\ud83d\udd04 Nous rouvrirons le {{endDate}}.\n\nPendant cette p\u00e9riode, veuillez utiliser nos autres emplacements. Nous nous excusons pour tout d\u00e9sagr\u00e9ment.\n\n\u2014 \u00c9quipe Alliance Shipping',
      ht: 'Ch\u00e8 kliyan yo,\n\nTanpri pran n\u00f2t ke anplasman {{location}} nou an pral f\u00e8men tanpor\u00e8man.\n\n\ud83d\udcc5 F\u00e8men: {{startDate}} jiska {{endDate}}\n\ud83d\udccb Rezon: {{reason}}\n\n\ud83d\udd04 Nou pral reouv\u00e8 {{endDate}}.\n\nPandan pery\u00f2d sa a, tanpri itilize l\u00f2t anplasman nou yo. Nou eskize pou tout enkonvenyans.\n\n\u2014 Ekip Alliance Shipping',
      es: 'Estimados clientes,\n\nLe informamos que nuestra ubicaci\u00f3n {{location}} estar\u00e1 temporalmente cerrada.\n\n\ud83d\udcc5 Cerrado: {{startDate}} al {{endDate}}\n\ud83d\udccb Raz\u00f3n: {{reason}}\n\n\ud83d\udd04 Reabriremos el {{endDate}}.\n\nDurante este per\u00edodo, por favor utilice nuestras otras ubicaciones. Pedimos disculpas por cualquier inconveniente.\n\n\u2014 Equipo Alliance Shipping',
    },
  },

  // ─── 7. WEATHER ALERT ─────────────────────────────────────────
  {
    id: 'weather_alert',
    name: {
      en: 'Weather Alert',
      fr: 'Alerte M\u00e9t\u00e9o',
      ht: 'Al\u00e8t Meteyorolojik',
      es: 'Alerta Meteorol\u00f3gica',
    },
    type: 'alert',
    icon: '🌀',
    color: 'red',
    variables: [
      { key: 'weatherType', label: { en: 'Weather Type', fr: 'Type de Temps', ht: 'Tip Meteyoloji', es: 'Tipo de Clima' }, placeholder: 'Hurricane / Tropical Storm', type: 'text' },
      { key: 'affectedAreas', label: { en: 'Affected Areas', fr: 'Zones Affect\u00e9es', ht: 'Z\u00f2n ki Afekte', es: '\u00c1reas Afectadas' }, placeholder: 'Port-au-Prince, Cap-Ha\u00eftien', type: 'text' },
      { key: 'estimatedDuration', label: { en: 'Estimated Duration', fr: 'Dur\u00e9e Estim\u00e9e', ht: 'Dire Estime', es: 'Duraci\u00f3n Estimada' }, placeholder: '3-5 days', type: 'text' },
      { key: 'precautions', label: { en: 'Precautions', fr: 'Pr\u00e9cautions', ht: 'Prekosyon', es: 'Precauciones' }, placeholder: 'Secure packages, avoid travel', type: 'text' },
    ],
    title: {
      en: '\ud83c\udf00 Weather Alert: {{weatherType}} - Deliveries Affected',
      fr: '\ud83c\udf00 Alerte M\u00e9t\u00e9o: {{weatherType}} - Livraisons Affect\u00e9es',
      ht: '\ud83c\udf00 Al\u00e8t Meteyolojik: {{weatherType}} - Livrezon Afekte',
      es: '\ud83c\udf00 Alerta Meteorol\u00f3gica: {{weatherType}} - Entregas Afectadas',
    },
    content: {
      en: 'IMPORTANT WEATHER ALERT\n\nDue to {{weatherType}}, our shipping operations in certain areas are affected.\n\n\ud83c\udf0a Weather: {{weatherType}}\n\ud83d\udccd Affected Areas: {{affectedAreas}}\n\u23f0 Estimated Duration: {{estimatedDuration}}\n\n\u26a0\ufe0f Precautions:\n{{precautions}}\n\nDeliveries to affected areas will be delayed until conditions improve. All packages are safely stored in our warehouses.\n\nYour safety is our priority. Stay safe!\n\n\u2014 Alliance Shipping Team',
      fr: 'ALERTE M\u00c9T\u00c9O IMPORTANTE\n\nEn raison de {{weatherType}}, nos op\u00e9rations d\'exp\u00e9dition dans certaines zones sont affect\u00e9es.\n\n\ud83c\udf0a M\u00e9t\u00e9o: {{weatherType}}\n\ud83d\udccd Zones Affect\u00e9es: {{affectedAreas}}\n\u23f0 Dur\u00e9e Estim\u00e9e: {{estimatedDuration}}\n\n\u26a0\ufe0f Pr\u00e9cautions:\n{{precautions}}\n\nLes livraisons vers les zones touch\u00e9es seront retard\u00e9es jusqu\'\u00e0 l\'am\u00e9lioration des conditions. Tous les colis sont stock\u00e9s en s\u00e9curit\u00e9 dans nos entrep\u00f4ts.\n\nVotre s\u00e9curit\u00e9 est notre priorit\u00e9. Restez prudents!\n\n\u2014 \u00c9quipe Alliance Shipping',
      ht: 'AL\u00c8T METEYOLOJIK ENPÒTAN\n\nAkoz {{weatherType}}, operasyon anvoy nou nan k\u00e8k z\u00f2n afekte.\n\n\ud83c\udf0a Meteyoloji: {{weatherType}}\n\ud83d\udccd Z\u00f2n ki Afekte: {{affectedAreas}}\n\u23f0 Dire Estime: {{estimatedDuration}}\n\n\u26a0\ufe0f Prekosyon:\n{{precautions}}\n\nLivrezon nan z\u00f2n ki afekte yo pral f\u00e8 reta jiskaske kondisyon yo amelyore. Tout paky\u00e8 yo estoke an sekirite nan depo nou yo.\n\nSekirite ou se priyorite nou. Rete pridan!\n\n\u2014 Ekip Alliance Shipping',
      es: 'ALERTA METEOROL\u00d3GICA IMPORTANTE\n\nDebido a {{weatherType}}, nuestras operaciones de env\u00edo en ciertas \u00e1reas se ven afectadas.\n\n\ud83c\udf0a Clima: {{weatherType}}\n\ud83d\udccd \u00c1reas Afectadas: {{affectedAreas}}\n\u23f0 Duraci\u00f3n Estimada: {{estimatedDuration}}\n\n\u26a0\ufe0f Precauciones:\n{{precautions}}\n\nLas entregas a las \u00e1reas afectadas se retrasar\u00e1n hasta que mejoren las condiciones. Todos los paquetes est\u00e1n almacenados de forma segura.\n\nSu seguridad es nuestra prioridad. \u00a1Mant\u00e9ngase seguro!\n\n\u2014 Equipo Alliance Shipping',
    },
  },

  // ─── 8. NEW DESTINATION ────────────────────────────────────────
  {
    id: 'new_destination',
    name: {
      en: 'New Destination',
      fr: 'Nouvelle Destination',
      ht: 'Nouvo Destinasyon',
      es: 'Nuevo Destino',
    },
    type: 'news',
    icon: '📍',
    color: 'green',
    variables: [
      { key: 'cityName', label: { en: 'City Name', fr: 'Nom de la Ville', ht: 'Non Vil la', es: 'Nombre de la Ciudad' }, placeholder: 'Les Cayes', type: 'text' },
      { key: 'country', label: { en: 'Country', fr: 'Pays', ht: 'Peyi', es: 'Pa\u00eds' }, placeholder: 'Haiti', type: 'text' },
      { key: 'availableDate', label: { en: 'Available From', fr: 'Disponible D\u00e8s', ht: 'Disponib Depi', es: 'Disponible Desde' }, placeholder: '2026-04-01', type: 'date' },
      { key: 'pricing', label: { en: 'Pricing Info', fr: 'Info Tarifs', ht: 'Enf\u00f2masyon Pri', es: 'Info Precios' }, placeholder: 'Same rates as other destinations', type: 'text' },
    ],
    title: {
      en: '\ud83d\udccd New Destination: {{cityName}}, {{country}}!',
      fr: '\ud83d\udccd Nouvelle Destination: {{cityName}}, {{country}}!',
      ht: '\ud83d\udccd Nouvo Destinasyon: {{cityName}}, {{country}}!',
      es: '\ud83d\udccd \u00a1Nuevo Destino: {{cityName}}, {{country}}!',
    },
    content: {
      en: 'We\'re expanding!\n\nAlliance Shipping is proud to announce a new delivery destination: {{cityName}}, {{country}}!\n\n\ud83d\udccd Location: {{cityName}}, {{country}}\n\ud83d\udcc5 Available From: {{availableDate}}\n\ud83d\udcb0 Pricing: {{pricing}}\n\nYou can now ship your packages directly to {{cityName}}. Select this new destination when submitting your package request.\n\nWe continue to grow to serve you better!\n\n\u2014 Alliance Shipping Team',
      fr: 'Nous grandissons!\n\nAlliance Shipping est fier d\'annoncer une nouvelle destination de livraison: {{cityName}}, {{country}}!\n\n\ud83d\udccd Emplacement: {{cityName}}, {{country}}\n\ud83d\udcc5 Disponible D\u00e8s: {{availableDate}}\n\ud83d\udcb0 Tarifs: {{pricing}}\n\nVous pouvez d\u00e9sormais exp\u00e9dier vos colis directement \u00e0 {{cityName}}. S\u00e9lectionnez cette nouvelle destination lors de votre demande de colis.\n\nNous continuons \u00e0 grandir pour mieux vous servir!\n\n\u2014 \u00c9quipe Alliance Shipping',
      ht: 'Nou ap grandi!\n\nAlliance Shipping fyè pou anonse yon nouvo destinasyon livrezon: {{cityName}}, {{country}}!\n\n\ud83d\udccd Anplasman: {{cityName}}, {{country}}\n\ud83d\udcc5 Disponib Depi: {{availableDate}}\n\ud83d\udcb0 Pri: {{pricing}}\n\nKounye a ou ka voye paky\u00e8 ou dirèkteman nan {{cityName}}. Chwazi nouvo destinasyon sa a l\u00e8 ou soum\u00e8t demann paky\u00e8 ou.\n\nNou kontinye grandi pou s\u00e8vi ou pi byen!\n\n\u2014 Ekip Alliance Shipping',
      es: '\u00a1Estamos creciendo!\n\nAlliance Shipping se enorgullece de anunciar un nuevo destino de entrega: {{cityName}}, {{country}}!\n\n\ud83d\udccd Ubicaci\u00f3n: {{cityName}}, {{country}}\n\ud83d\udcc5 Disponible Desde: {{availableDate}}\n\ud83d\udcb0 Precios: {{pricing}}\n\nAhora puede enviar sus paquetes directamente a {{cityName}}. Seleccione este nuevo destino al enviar su solicitud de paquete.\n\n\u00a1Seguimos creciendo para servirle mejor!\n\n\u2014 Equipo Alliance Shipping',
    },
  },
];

// Helper: Fill template variables
export function fillTemplate(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return result;
}

// Helper: Generate all translations for a template with given variables
export function generateTranslations(
  template: AnnouncementTemplate,
  variables: Record<string, string>
): Record<string, { title: string; content: string }> {
  const translations: Record<string, { title: string; content: string }> = {};
  for (const lang of ['en', 'fr', 'ht', 'es']) {
    translations[lang] = {
      title: fillTemplate(template.title[lang], variables),
      content: fillTemplate(template.content[lang], variables),
    };
  }
  return translations;
}
