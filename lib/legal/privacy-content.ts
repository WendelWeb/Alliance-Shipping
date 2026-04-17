import type { Locale } from '@/types';

export type Block =
  | { kind: 'p'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'h3'; text: string };

export type Section = {
  id: string;
  title: string;
  blocks: Block[];
};

export type PrivacyContent = {
  title: string;
  lastUpdated: string;
  intro: string;
  tocLabel: string;
  appInfo: {
    label: string;
    appNameLabel: string;
    appName: string;
    packageLabel: string;
    packageId: string;
    publisherLabel: string;
    publisher: string;
    addressLabel: string;
    address: string;
    emailLabel: string;
    email: string;
    phoneLabel: string;
    phone: string;
  };
  sections: Section[];
  footerNote: string;
};

const COMMON = {
  email: 'allianceshipping26@gmail.com',
  phoneHT: '+509 4881 26-52',
  phoneUS: '+1 (954) 607-8226',
  addressUS: '8298 Northwest 68th Street, Miami, Florida 33195, USA',
  publisher: 'Alliance Shipping S.A.',
  appName: 'Alliance Shipping',
  packageId: 'com.allianceshipping.mobile',
  lastUpdatedISO: '2026-04-16',
};

// ---------------- FRENCH ----------------
const fr: PrivacyContent = {
  title: 'Politique de Confidentialité',
  lastUpdated: `Dernière mise à jour : 16 avril 2026`,
  intro:
    "La présente Politique de Confidentialité décrit comment Alliance Shipping collecte, utilise, partage et protège vos données personnelles lorsque vous utilisez notre application mobile « Alliance Shipping » et notre site web https://allianceshipping.company (ensemble, le « Service »). Nous respectons le Règlement Général sur la Protection des Données (RGPD), le California Consumer Privacy Act (CCPA) et la législation haïtienne applicable à la protection des données personnelles.",
  tocLabel: 'Table des matières',
  appInfo: {
    label: "Informations sur l'application",
    appNameLabel: "Nom de l'application",
    appName: COMMON.appName,
    packageLabel: 'Identifiant du package',
    packageId: COMMON.packageId,
    publisherLabel: 'Éditeur / Responsable du traitement',
    publisher: COMMON.publisher,
    addressLabel: 'Adresse postale',
    address: COMMON.addressUS,
    emailLabel: 'Email de contact',
    email: COMMON.email,
    phoneLabel: 'Téléphone',
    phone: `${COMMON.phoneUS} (USA) / ${COMMON.phoneHT} (Haïti)`,
  },
  sections: [
    {
      id: 'identity',
      title: '1. Identité du responsable du traitement',
      blocks: [
        {
          kind: 'p',
          text: "Alliance Shipping S.A. (« nous », « notre », « Alliance Shipping ») est le responsable du traitement de vos données personnelles. Notre société exploite un service de transport maritime de colis entre les États-Unis d'Amérique et la République d'Haïti.",
        },
        {
          kind: 'list',
          items: [
            `Éditeur : ${COMMON.publisher}`,
            `Adresse postale : ${COMMON.addressUS}`,
            `Email : ${COMMON.email}`,
            `Téléphone (USA) : ${COMMON.phoneUS}`,
            `Téléphone (Haïti) : ${COMMON.phoneHT}`,
            `Application mobile : ${COMMON.appName} (package ${COMMON.packageId})`,
            'Site web : https://allianceshipping.company',
          ],
        },
      ],
    },
    {
      id: 'data-collected',
      title: '2. Données que nous collectons',
      blocks: [
        {
          kind: 'p',
          text: "Nous collectons uniquement les données nécessaires à la fourniture de notre Service. Les catégories de données suivantes peuvent être collectées :",
        },
        { kind: 'h3', text: "a) Données d'identité" },
        {
          kind: 'list',
          items: [
            'Nom et prénom',
            'Adresse email',
            'Numéros de téléphone (USA et Haïti)',
            'Photo de profil (facultatif)',
            "Date de création et d'activité du compte",
          ],
        },
        { kind: 'h3', text: 'b) Données d\'adresse' },
        {
          kind: 'list',
          items: [
            "Adresse d'expédition aux États-Unis (entrepôt de Miami et/ou adresse personnelle)",
            'Adresse de livraison en Haïti (ville, quartier, points de repère)',
            'Coordonnées du destinataire lorsque vous envoyez un colis à un tiers',
          ],
        },
        { kind: 'h3', text: 'c) Données de paiement' },
        {
          kind: 'list',
          items: [
            "Nous ne stockons pas vos numéros de carte bancaire complets sur nos serveurs.",
            "Les paiements sont traités par des prestataires tiers conformes PCI-DSS (par exemple Stripe, PayPal, MonCash ou équivalent selon votre pays).",
            "Nous recevons uniquement un identifiant de transaction, le montant, la devise et un statut (réussi/échec).",
          ],
        },
        { kind: 'h3', text: 'd) Données de localisation' },
        {
          kind: 'list',
          items: [
            "Localisation approximative (ville, pays) dérivée de votre adresse IP — utilisée pour afficher le dépôt le plus proche et la devise appropriée.",
            "Localisation précise (GPS) — uniquement si vous activez explicitement cette fonction pour trouver l'entrepôt le plus proche ou partager votre position de livraison. Désactivable à tout moment dans les paramètres du système d'exploitation.",
          ],
        },
        { kind: 'h3', text: "e) Identifiants d'appareil et techniques" },
        {
          kind: 'list',
          items: [
            "Identifiant publicitaire Android/iOS (AAID/IDFA) si vous n'avez pas activé le suivi limité",
            "Identifiant du jeton de notification push (FCM / Expo Push Token)",
            'Adresse IP',
            'Type, modèle, langue et système d\'exploitation de l\'appareil',
            'Version de l\'application',
          ],
        },
        { kind: 'h3', text: 'f) Données d\'utilisation' },
        {
          kind: 'list',
          items: [
            "Pages consultées, écrans ouverts, actions effectuées (ex : créer une requête de colis)",
            'Logs techniques (horodatage, URL, erreurs)',
            'Préférences (langue, thème, notifications)',
          ],
        },
        { kind: 'h3', text: 'g) Photos et caméra' },
        {
          kind: 'list',
          items: [
            "L'application peut demander l'accès à votre caméra ou à votre galerie si vous choisissez de téléverser une photo de profil, scanner un numéro de suivi ou photographier un colis/document. Ces images sont stockées de manière sécurisée et ne sont utilisées que pour le but expressément indiqué.",
          ],
        },
        { kind: 'h3', text: 'h) Contacts' },
        {
          kind: 'list',
          items: [
            "Nous ne lisons pas votre carnet d'adresses. Si vous choisissez de partager un suivi avec un proche, vous devez saisir manuellement l'email ou le numéro concerné.",
          ],
        },
      ],
    },
    {
      id: 'purposes',
      title: '3. Finalités du traitement',
      blocks: [
        { kind: 'p', text: "Nous utilisons vos données uniquement pour :" },
        {
          kind: 'list',
          items: [
            "Créer et gérer votre compte utilisateur",
            "Traiter, expédier, suivre et livrer vos colis entre les USA et Haïti",
            "Vous facturer et traiter vos paiements via nos prestataires",
            "Vous envoyer des notifications transactionnelles (statut du colis, arrivée à destination, problèmes douaniers)",
            "Calculer les frais de transport, les taxes et les délais d'expédition",
            "Fournir un support client (email, téléphone, WhatsApp)",
            "Améliorer et sécuriser le Service (détection de fraude, prévention des abus)",
            "Respecter nos obligations légales (douane, comptabilité, lutte contre le blanchiment)",
          ],
        },
      ],
    },
    {
      id: 'legal-basis',
      title: '4. Base légale du traitement (RGPD)',
      blocks: [
        {
          kind: 'p',
          text: "Chaque traitement repose sur l'une des bases légales suivantes :",
        },
        {
          kind: 'list',
          items: [
            "Exécution contractuelle (art. 6.1.b RGPD) : création du compte, expédition et livraison des colis, paiements, support.",
            "Obligation légale (art. 6.1.c RGPD) : déclarations douanières, obligations comptables et fiscales, lutte contre le blanchiment d'argent.",
            "Intérêt légitime (art. 6.1.f RGPD) : sécurité du Service, prévention des fraudes, amélioration du produit.",
            "Consentement (art. 6.1.a RGPD) : localisation précise, notifications push marketing, cookies non essentiels. Révocable à tout moment.",
          ],
        },
      ],
    },
    {
      id: 'third-parties',
      title: '5. Destinataires et partage des données',
      blocks: [
        {
          kind: 'p',
          text: "Nous ne vendons jamais vos données. Nous partageons des données uniquement avec les catégories de destinataires suivantes, dans la stricte mesure nécessaire :",
        },
        {
          kind: 'list',
          items: [
            "Prestataires de paiement : Stripe, PayPal, MonCash et équivalents (certifiés PCI-DSS).",
            "Services Google : Firebase Cloud Messaging (notifications push), Firebase Analytics (usage anonymisé), Google Maps (géolocalisation des dépôts), reCAPTCHA (prévention des bots).",
            "Fournisseur d'authentification : Clerk Inc. (gestion des comptes et sessions).",
            "Plateforme mobile : Expo / EAS (compilation et distribution OTA des mises à jour de l'application).",
            "Hébergement cloud : Vercel Inc. (hébergement du site et des API), Neon (base de données PostgreSQL).",
            "Transporteurs et partenaires logistiques : compagnies maritimes, transitaires, transporteurs locaux en Haïti nécessaires à la livraison.",
            "Autorités douanières et fiscales : Customs and Border Protection (USA), Administration Générale des Douanes (AGD, Haïti) lorsqu'une déclaration est requise.",
            "Autorités judiciaires et administratives : uniquement sur demande légale valide.",
            "Conseils externes : avocats, experts-comptables, auditeurs soumis au secret professionnel.",
          ],
        },
        {
          kind: 'p',
          text: "Chaque sous-traitant est lié par un contrat imposant des obligations de sécurité et de confidentialité au moins équivalentes à celles de la présente politique.",
        },
      ],
    },
    {
      id: 'transfers',
      title: '6. Transferts internationaux de données',
      blocks: [
        {
          kind: 'p',
          text: "Votre activité implique par nature un transfert de données entre les États-Unis et Haïti. Certains sous-traitants peuvent également traiter des données dans d'autres pays (par exemple en Union européenne pour des services d'hébergement ou d'analytique).",
        },
        {
          kind: 'list',
          items: [
            "Transferts USA ↔ Haïti : encadrés par des clauses contractuelles de confidentialité et par nos obligations douanières respectives.",
            "Transferts depuis l'Union européenne : encadrés par les Clauses Contractuelles Types de la Commission européenne (CCT) et, lorsque nécessaire, des mesures supplémentaires (chiffrement en transit, minimisation).",
            "Vous pouvez obtenir une copie de ces garanties en écrivant à " + COMMON.email + ".",
          ],
        },
      ],
    },
    {
      id: 'security',
      title: '7. Sécurité des données',
      blocks: [
        {
          kind: 'p',
          text: "Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données contre la perte, l'altération ou l'accès non autorisé :",
        },
        {
          kind: 'list',
          items: [
            "Chiffrement TLS 1.2+ pour toutes les communications réseau.",
            "Chiffrement au repos des bases de données sensibles.",
            "Authentification forte pour les administrateurs, hachage bcrypt/argon2 des secrets.",
            "Traitement des paiements exclusivement par des prestataires certifiés PCI-DSS Niveau 1.",
            "Cloisonnement des environnements (production / préproduction / développement).",
            "Journalisation et surveillance des accès aux données.",
            "Revue périodique des accès et des habilitations.",
          ],
        },
      ],
    },
    {
      id: 'retention',
      title: '8. Durées de conservation',
      blocks: [
        { kind: 'p', text: 'Nous conservons vos données selon les durées suivantes :' },
        {
          kind: 'list',
          items: [
            "Données de compte : pendant toute la durée de la relation contractuelle, puis 12 mois après la suppression.",
            "Données d'expédition et de livraison : 10 ans (obligation comptable et douanière).",
            "Données de paiement (identifiants de transaction) : 10 ans (obligation comptable).",
            "Logs techniques et analytiques : 13 mois maximum.",
            "Jetons de notification push : jusqu'à révocation ou désinstallation de l'application.",
            "Données de support client : 3 ans après le dernier échange.",
            "Documents d'identification (si exigés par la loi) : selon la durée imposée par la réglementation applicable.",
          ],
        },
      ],
    },
    {
      id: 'rights',
      title: '9. Vos droits',
      blocks: [
        {
          kind: 'p',
          text: "Conformément au RGPD, au CCPA et à la législation haïtienne applicable, vous disposez des droits suivants :",
        },
        {
          kind: 'list',
          items: [
            "Droit d'accès à vos données et d'obtenir une copie.",
            "Droit de rectification des données inexactes ou incomplètes.",
            "Droit à l'effacement (« droit à l'oubli »).",
            "Droit à la limitation du traitement.",
            "Droit à la portabilité dans un format structuré et lisible.",
            "Droit d'opposition, notamment au profilage et à la prospection.",
            "Droit de retirer votre consentement à tout moment (sans effet rétroactif).",
            "Droit de ne pas faire l'objet d'une décision entièrement automatisée.",
            "Droit d'introduire une réclamation auprès d'une autorité de contrôle (CNIL en France, EDPB en Europe, California Privacy Protection Agency, autorité haïtienne compétente).",
            "Résidents de Californie (CCPA/CPRA) : droit de savoir, droit de supprimer, droit de corriger, droit de se désinscrire de la vente/partage — nous ne vendons pas vos données.",
          ],
        },
        {
          kind: 'p',
          text: `Pour exercer ces droits, écrivez à ${COMMON.email}. Nous répondons dans un délai maximum de 30 jours.`,
        },
      ],
    },
    {
      id: 'account-deletion',
      title: '10. Suppression du compte et des données',
      blocks: [
        {
          kind: 'p',
          text: "Conformément aux exigences de Google Play (2023+), vous pouvez supprimer votre compte et vos données sans avoir à réinstaller l'application ni à contacter le support :",
        },
        { kind: 'h3', text: 'Depuis l\'application mobile ou le site web' },
        {
          kind: 'list',
          items: [
            "Ouvrez l'application ou le site, rendez-vous sur la page « Supprimer mon compte » : https://allianceshipping.company/delete-account",
            "Saisissez l'email du compte et confirmez la demande.",
            "Une confirmation vous est envoyée par email.",
          ],
        },
        { kind: 'h3', text: 'Par email' },
        {
          kind: 'list',
          items: [
            `Envoyez un email à ${COMMON.email} avec pour objet « Suppression de compte » depuis l'adresse email associée à votre compte.`,
            'Nous pouvons demander une pièce justificative pour prévenir la fraude.',
          ],
        },
        { kind: 'h3', text: 'Délai et périmètre' },
        {
          kind: 'list',
          items: [
            "Délai : votre demande est traitée sous 30 jours maximum.",
            "Données supprimées : nom, email, téléphones, adresses personnelles, photo de profil, préférences, jetons de notification, identifiants techniques.",
            "Données conservées (anonymisées ou sous obligation légale) : historique d'expédition lié aux obligations comptables et douanières (10 ans), documents exigés par la loi anti-blanchiment, logs de sécurité nécessaires à la défense en justice.",
            "Après suppression, les données sont irréversiblement effacées ou anonymisées dans nos sauvegardes dans un délai maximum de 90 jours supplémentaires.",
          ],
        },
      ],
    },
    {
      id: 'cookies',
      title: '11. Cookies et technologies similaires',
      blocks: [
        {
          kind: 'p',
          text: "Le site web utilise des cookies et technologies équivalentes (localStorage, SDK) pour les finalités suivantes :",
        },
        {
          kind: 'list',
          items: [
            "Cookies strictement nécessaires : authentification, préférences de langue/thème, sécurité. Ils ne peuvent pas être désactivés.",
            "Cookies de mesure d'audience : Firebase Analytics, anonymisés, pour comprendre l'usage du site.",
            "Cookies tiers essentiels : Clerk (session), Vercel (hébergement), reCAPTCHA (sécurité).",
          ],
        },
        {
          kind: 'p',
          text: "Vous pouvez configurer votre navigateur pour refuser les cookies non essentiels. L'application mobile n'utilise pas de cookies HTTP traditionnels mais un stockage sécurisé équivalent.",
        },
      ],
    },
    {
      id: 'push',
      title: '12. Notifications push',
      blocks: [
        {
          kind: 'p',
          text: "Nous envoyons des notifications push via Firebase Cloud Messaging (Android) et APNs (iOS) pour vous informer du statut de vos colis, des arrivées, des problèmes douaniers et, avec votre consentement, d'annonces importantes.",
        },
        {
          kind: 'list',
          items: [
            "À l'installation, iOS/Android vous demande explicitement l'autorisation.",
            "Vous pouvez désactiver les notifications à tout moment dans les paramètres du système d'exploitation ou dans l'application (Profil → Notifications).",
            "Les notifications transactionnelles liées à l'exécution d'un contrat d'expédition actif restent toujours envoyées par email même si le push est désactivé.",
          ],
        },
      ],
    },
    {
      id: 'children',
      title: '13. Enfants',
      blocks: [
        {
          kind: 'p',
          text: "Alliance Shipping n'est pas destiné aux enfants. Nous ne collectons pas sciemment de données auprès d'enfants :",
        },
        {
          kind: 'list',
          items: [
            "Âgés de moins de 13 ans (COPPA, USA).",
            "Âgés de moins de 16 ans sans consentement parental (RGPD, Union européenne).",
          ],
        },
        {
          kind: 'p',
          text: `Si vous êtes parent ou tuteur légal et pensez que votre enfant nous a fourni des données, écrivez à ${COMMON.email} : nous supprimerons le compte immédiatement.`,
        },
      ],
    },
    {
      id: 'breach',
      title: '14. Violation de données',
      blocks: [
        {
          kind: 'p',
          text: "En cas de violation de données à caractère personnel susceptible d'engendrer un risque pour vos droits et libertés, nous nous engageons à :",
        },
        {
          kind: 'list',
          items: [
            "Notifier l'autorité de contrôle compétente dans un délai de 72 heures après en avoir pris connaissance (RGPD art. 33).",
            "Vous informer dans les meilleurs délais si la violation est susceptible d'engendrer un risque élevé pour vos droits (RGPD art. 34).",
            "Prendre immédiatement toutes mesures techniques et organisationnelles pour limiter les conséquences de la violation.",
          ],
        },
      ],
    },
    {
      id: 'changes',
      title: '15. Modifications de la politique',
      blocks: [
        {
          kind: 'p',
          text: "Nous pouvons mettre à jour la présente Politique pour refléter des évolutions légales, techniques ou commerciales. Toute modification substantielle sera notifiée par email et/ou par notification dans l'application au moins 15 jours avant son entrée en vigueur. La date de « Dernière mise à jour » en haut de cette page indique la version en vigueur.",
        },
      ],
    },
    {
      id: 'dpo',
      title: '16. Délégué à la protection des données (DPO)',
      blocks: [
        { kind: 'p', text: "Pour toute question relative à la protection de vos données, contactez notre responsable de la protection des données :" },
        {
          kind: 'list',
          items: [
            `Email : ${COMMON.email}`,
            `Courrier : Alliance Shipping — DPO, ${COMMON.addressUS}`,
            `Téléphone (USA) : ${COMMON.phoneUS}`,
            `Téléphone (Haïti) : ${COMMON.phoneHT}`,
          ],
        },
      ],
    },
    {
      id: 'jurisdiction',
      title: '17. Droit applicable et juridiction',
      blocks: [
        {
          kind: 'p',
          text: "La présente Politique est régie, selon la résidence de l'utilisateur, par les lois applicables en République d'Haïti, par le droit de l'État de Floride (USA) pour les utilisateurs résidant aux États-Unis, et par les règlements européens pour les utilisateurs résidant dans l'Union européenne. Tout litige sera soumis en priorité à une tentative de règlement amiable ; à défaut, les juridictions compétentes du lieu de résidence du consommateur seront compétentes lorsque la loi le prévoit.",
        },
      ],
    },
  ],
  footerNote:
    `Pour toute question relative à cette Politique, contactez-nous à ${COMMON.email} ou par courrier à ${COMMON.addressUS}.`,
};

// ---------------- ENGLISH ----------------
const en: PrivacyContent = {
  title: 'Privacy Policy',
  lastUpdated: 'Last updated: April 16, 2026',
  intro:
    'This Privacy Policy describes how Alliance Shipping collects, uses, shares and protects your personal data when you use our "Alliance Shipping" mobile application and our website https://allianceshipping.company (together, the "Service"). We comply with the EU General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA) and Haitian data protection law.',
  tocLabel: 'Table of contents',
  appInfo: {
    label: 'Application information',
    appNameLabel: 'App name',
    appName: COMMON.appName,
    packageLabel: 'Package ID',
    packageId: COMMON.packageId,
    publisherLabel: 'Publisher / Data Controller',
    publisher: COMMON.publisher,
    addressLabel: 'Postal address',
    address: COMMON.addressUS,
    emailLabel: 'Contact email',
    email: COMMON.email,
    phoneLabel: 'Phone',
    phone: `${COMMON.phoneUS} (USA) / ${COMMON.phoneHT} (Haiti)`,
  },
  sections: [
    {
      id: 'identity',
      title: '1. Data controller identity',
      blocks: [
        {
          kind: 'p',
          text: 'Alliance Shipping S.A. ("we", "us", "Alliance Shipping") is the data controller for your personal data. We operate a shipping service for parcels between the United States and the Republic of Haiti.',
        },
        {
          kind: 'list',
          items: [
            `Publisher: ${COMMON.publisher}`,
            `Postal address: ${COMMON.addressUS}`,
            `Email: ${COMMON.email}`,
            `Phone (USA): ${COMMON.phoneUS}`,
            `Phone (Haiti): ${COMMON.phoneHT}`,
            `Mobile app: ${COMMON.appName} (package ${COMMON.packageId})`,
            'Website: https://allianceshipping.company',
          ],
        },
      ],
    },
    {
      id: 'data-collected',
      title: '2. Data we collect',
      blocks: [
        { kind: 'p', text: 'We only collect data necessary to deliver our Service. The following categories may be collected:' },
        { kind: 'h3', text: 'a) Identity data' },
        {
          kind: 'list',
          items: [
            'First and last name',
            'Email address',
            'Phone numbers (USA and Haiti)',
            'Profile picture (optional)',
            'Account creation and activity dates',
          ],
        },
        { kind: 'h3', text: 'b) Address data' },
        {
          kind: 'list',
          items: [
            'US shipping address (our Miami warehouse and/or personal address)',
            'Haiti delivery address (city, neighborhood, landmarks)',
            'Recipient details when you send a parcel to a third party',
          ],
        },
        { kind: 'h3', text: 'c) Payment data' },
        {
          kind: 'list',
          items: [
            'We do not store full credit card numbers on our servers.',
            'Payments are processed by PCI-DSS compliant third-party processors (e.g. Stripe, PayPal, MonCash or equivalent).',
            'We only receive a transaction ID, amount, currency and status (success/failure).',
          ],
        },
        { kind: 'h3', text: 'd) Location data' },
        {
          kind: 'list',
          items: [
            'Approximate location (city, country) derived from your IP address — used to display the nearest depot and appropriate currency.',
            'Precise location (GPS) — only if you explicitly enable it to find the nearest warehouse or share a delivery location. You can revoke at any time in your operating system settings.',
          ],
        },
        { kind: 'h3', text: 'e) Device & technical identifiers' },
        {
          kind: 'list',
          items: [
            'Android/iOS advertising identifier (AAID/IDFA) unless you have opted out of tracking',
            'Push notification token (FCM / Expo Push Token)',
            'IP address',
            'Device type, model, language and operating system',
            'App version',
          ],
        },
        { kind: 'h3', text: 'f) Usage data' },
        {
          kind: 'list',
          items: [
            'Pages viewed, screens opened, actions taken (e.g. creating a parcel request)',
            'Technical logs (timestamps, URLs, errors)',
            'Preferences (language, theme, notifications)',
          ],
        },
        { kind: 'h3', text: 'g) Photos & camera' },
        {
          kind: 'list',
          items: [
            'The app may request access to your camera or photo library if you choose to upload a profile picture, scan a tracking number or photograph a parcel/document. Such images are stored securely and only used for the purpose you indicated.',
          ],
        },
        { kind: 'h3', text: 'h) Contacts' },
        {
          kind: 'list',
          items: [
            'We do not read your address book. If you choose to share a tracking link with someone, you must manually enter their email or phone number.',
          ],
        },
      ],
    },
    {
      id: 'purposes',
      title: '3. Purposes of processing',
      blocks: [
        { kind: 'p', text: 'We use your data only to:' },
        {
          kind: 'list',
          items: [
            'Create and manage your user account',
            'Process, ship, track and deliver your parcels between the USA and Haiti',
            'Bill you and process payments via our providers',
            'Send transactional notifications (parcel status, arrival at destination, customs issues)',
            'Calculate shipping fees, taxes and delivery estimates',
            'Provide customer support (email, phone, WhatsApp)',
            'Improve and secure the Service (fraud detection, abuse prevention)',
            'Comply with legal obligations (customs, accounting, anti-money-laundering)',
          ],
        },
      ],
    },
    {
      id: 'legal-basis',
      title: '4. Legal basis (GDPR)',
      blocks: [
        { kind: 'p', text: 'Each processing activity relies on one of the following legal bases:' },
        {
          kind: 'list',
          items: [
            'Performance of a contract (GDPR art. 6.1.b): account creation, parcel shipping and delivery, payments, support.',
            'Legal obligation (GDPR art. 6.1.c): customs declarations, accounting and tax obligations, anti-money-laundering.',
            'Legitimate interest (GDPR art. 6.1.f): Service security, fraud prevention, product improvement.',
            'Consent (GDPR art. 6.1.a): precise location, marketing push notifications, non-essential cookies. Revocable at any time.',
          ],
        },
      ],
    },
    {
      id: 'third-parties',
      title: '5. Recipients & data sharing',
      blocks: [
        { kind: 'p', text: 'We never sell your data. We only share data with the following categories of recipients, strictly as necessary:' },
        {
          kind: 'list',
          items: [
            'Payment processors: Stripe, PayPal, MonCash and equivalents (PCI-DSS certified).',
            'Google services: Firebase Cloud Messaging (push notifications), Firebase Analytics (anonymized usage), Google Maps (depot geolocation), reCAPTCHA (bot prevention).',
            'Authentication provider: Clerk Inc. (account and session management).',
            'Mobile platform: Expo / EAS (build and OTA distribution of app updates).',
            'Cloud hosting: Vercel Inc. (web & API hosting), Neon (managed PostgreSQL).',
            'Carriers and logistics partners: shipping lines, freight forwarders, last-mile carriers in Haiti as required to complete delivery.',
            'Customs and tax authorities: US Customs and Border Protection, Haitian Direction Générale des Douanes (AGD) where declarations are required.',
            'Judicial or administrative authorities: only upon valid legal request.',
            'External advisors: lawyers, accountants and auditors bound by professional secrecy.',
          ],
        },
        {
          kind: 'p',
          text: 'Every subprocessor is bound by a contract imposing security and confidentiality obligations at least equivalent to those in this Policy.',
        },
      ],
    },
    {
      id: 'transfers',
      title: '6. International data transfers',
      blocks: [
        {
          kind: 'p',
          text: 'Our activity inherently involves transferring data between the USA and Haiti. Some subprocessors may also process data in additional countries (e.g. in the European Union for hosting or analytics).',
        },
        {
          kind: 'list',
          items: [
            'USA ↔ Haiti transfers: covered by contractual confidentiality clauses and by customs obligations on both sides.',
            'Transfers from the European Union: covered by the European Commission Standard Contractual Clauses (SCCs) and, where needed, supplementary measures (encryption in transit, minimization).',
            `You can request a copy of these safeguards at ${COMMON.email}.`,
          ],
        },
      ],
    },
    {
      id: 'security',
      title: '7. Data security',
      blocks: [
        { kind: 'p', text: 'We implement technical and organizational measures to protect your data against loss, alteration or unauthorized access:' },
        {
          kind: 'list',
          items: [
            'TLS 1.2+ encryption for all network communications.',
            'Encryption at rest for sensitive databases.',
            'Strong authentication for administrators; bcrypt/argon2 hashing of secrets.',
            'Payments processed exclusively by PCI-DSS Level 1 certified providers.',
            'Separation of environments (production / staging / development).',
            'Access logging and monitoring.',
            'Periodic access and permission reviews.',
          ],
        },
      ],
    },
    {
      id: 'retention',
      title: '8. Retention periods',
      blocks: [
        { kind: 'p', text: 'We retain your data as follows:' },
        {
          kind: 'list',
          items: [
            'Account data: for the duration of the contractual relationship, plus 12 months after deletion.',
            'Shipping and delivery data: 10 years (accounting and customs obligations).',
            'Payment data (transaction IDs): 10 years (accounting obligations).',
            'Technical and analytics logs: up to 13 months.',
            'Push notification tokens: until revocation or app uninstall.',
            'Customer support data: 3 years from last interaction.',
            'ID documents (where legally required): for the period mandated by applicable regulation.',
          ],
        },
      ],
    },
    {
      id: 'rights',
      title: '9. Your rights',
      blocks: [
        { kind: 'p', text: 'Under GDPR, CCPA and applicable Haitian law, you have the following rights:' },
        {
          kind: 'list',
          items: [
            'Right of access to your data and to obtain a copy.',
            'Right to rectification of inaccurate or incomplete data.',
            'Right to erasure ("right to be forgotten").',
            'Right to restriction of processing.',
            'Right to portability in a structured, machine-readable format.',
            'Right to object, including to profiling and marketing.',
            'Right to withdraw consent at any time (without retroactive effect).',
            'Right not to be subject to a decision based solely on automated processing.',
            'Right to lodge a complaint with a supervisory authority (CNIL in France, EDPB in the EU, California Privacy Protection Agency, competent Haitian authority).',
            'California residents (CCPA/CPRA): right to know, right to delete, right to correct, right to opt out of sale/sharing — we do not sell your data.',
          ],
        },
        { kind: 'p', text: `To exercise these rights, write to ${COMMON.email}. We respond within 30 days at most.` },
      ],
    },
    {
      id: 'account-deletion',
      title: '10. Account & data deletion',
      blocks: [
        {
          kind: 'p',
          text: 'In accordance with Google Play requirements (2023+), you can delete your account and data without reinstalling the app or contacting support:',
        },
        { kind: 'h3', text: 'From the mobile app or website' },
        {
          kind: 'list',
          items: [
            'Open the app or website and go to "Delete account": https://allianceshipping.company/delete-account',
            'Enter the account email and confirm.',
            'A confirmation email is sent to you.',
          ],
        },
        { kind: 'h3', text: 'By email' },
        {
          kind: 'list',
          items: [
            `Send an email to ${COMMON.email} with subject "Account deletion" from the email address associated with your account.`,
            'We may request a piece of identification to prevent fraud.',
          ],
        },
        { kind: 'h3', text: 'Timeframe and scope' },
        {
          kind: 'list',
          items: [
            'Timeframe: your request is processed within 30 days at most.',
            'Data deleted: name, email, phone numbers, personal addresses, profile picture, preferences, notification tokens, technical identifiers.',
            'Data retained (anonymized or under legal obligation): shipping history tied to accounting and customs obligations (10 years), AML documents, security logs necessary for legal defense.',
            'After deletion, data is irreversibly wiped or anonymized from our backups within a further 90 days.',
          ],
        },
      ],
    },
    {
      id: 'cookies',
      title: '11. Cookies & similar technologies',
      blocks: [
        { kind: 'p', text: 'The website uses cookies and equivalent technologies (localStorage, SDKs) for the following purposes:' },
        {
          kind: 'list',
          items: [
            'Strictly necessary cookies: authentication, language/theme preferences, security. These cannot be disabled.',
            'Analytics cookies: Firebase Analytics, anonymized, to understand site usage.',
            'Essential third-party cookies: Clerk (session), Vercel (hosting), reCAPTCHA (security).',
          ],
        },
        {
          kind: 'p',
          text: 'You can configure your browser to refuse non-essential cookies. The mobile app does not use traditional HTTP cookies but equivalent secure storage.',
        },
      ],
    },
    {
      id: 'push',
      title: '12. Push notifications',
      blocks: [
        {
          kind: 'p',
          text: 'We send push notifications via Firebase Cloud Messaging (Android) and APNs (iOS) to inform you of parcel status, arrivals, customs issues and, with your consent, important announcements.',
        },
        {
          kind: 'list',
          items: [
            'At install time, iOS/Android explicitly ask for your permission.',
            'You can disable notifications at any time in the operating system settings or within the app (Profile → Notifications).',
            'Transactional notifications tied to an active shipping contract will continue to be sent by email even if push is disabled.',
          ],
        },
      ],
    },
    {
      id: 'children',
      title: '13. Children',
      blocks: [
        { kind: 'p', text: 'Alliance Shipping is not intended for children. We do not knowingly collect data from children:' },
        {
          kind: 'list',
          items: [
            'Under 13 (COPPA, USA).',
            'Under 16 without parental consent (GDPR, European Union).',
          ],
        },
        {
          kind: 'p',
          text: `If you are a parent or legal guardian and believe your child has provided us with data, write to ${COMMON.email}: we will delete the account immediately.`,
        },
      ],
    },
    {
      id: 'breach',
      title: '14. Data breach',
      blocks: [
        {
          kind: 'p',
          text: 'In the event of a personal data breach likely to pose a risk to your rights and freedoms, we undertake to:',
        },
        {
          kind: 'list',
          items: [
            'Notify the competent supervisory authority within 72 hours of becoming aware of it (GDPR art. 33).',
            'Inform you without undue delay if the breach is likely to pose a high risk to your rights (GDPR art. 34).',
            'Immediately take all technical and organizational measures to limit the consequences of the breach.',
          ],
        },
      ],
    },
    {
      id: 'changes',
      title: '15. Changes to the policy',
      blocks: [
        {
          kind: 'p',
          text: 'We may update this Policy to reflect legal, technical or commercial developments. Any material change will be notified by email and/or in-app notification at least 15 days before it takes effect. The "Last updated" date at the top of this page indicates the version in effect.',
        },
      ],
    },
    {
      id: 'dpo',
      title: '16. Data Protection Officer (DPO)',
      blocks: [
        { kind: 'p', text: 'For any question about your data protection, contact our DPO:' },
        {
          kind: 'list',
          items: [
            `Email: ${COMMON.email}`,
            `Post: Alliance Shipping — DPO, ${COMMON.addressUS}`,
            `Phone (USA): ${COMMON.phoneUS}`,
            `Phone (Haiti): ${COMMON.phoneHT}`,
          ],
        },
      ],
    },
    {
      id: 'jurisdiction',
      title: '17. Governing law & jurisdiction',
      blocks: [
        {
          kind: 'p',
          text: 'This Policy is governed, depending on the user\'s residence, by the laws of the Republic of Haiti, by the law of the State of Florida (USA) for users residing in the United States, and by European regulations for users residing in the European Union. Any dispute shall first be subject to an amicable-resolution attempt; failing that, the competent courts of the consumer\'s place of residence shall have jurisdiction where the law so provides.',
        },
      ],
    },
  ],
  footerNote: `For any question about this Policy, contact us at ${COMMON.email} or by post at ${COMMON.addressUS}.`,
};

// ---------------- HAITIAN CREOLE ----------------
const ht: PrivacyContent = {
  title: 'Politik Konfidansyalite',
  lastUpdated: 'Dènye mizajou : 16 avril 2026',
  intro:
    'Politik Konfidansyalite sa a dekri kijan Alliance Shipping kolekte, itilize, pataje ak pwoteje done pèsonèl ou yo lè w itilize aplikasyon mobil "Alliance Shipping" nou an epi sit entènèt https://allianceshipping.company (ansanm, « Sèvis la »). Nou respekte Règleman Jeneral sou Pwoteksyon Done (RGPD), California Consumer Privacy Act (CCPA) ak lwa ayisyen ki aplike.',
  tocLabel: 'Tab kontni',
  appInfo: {
    label: 'Enfòmasyon sou aplikasyon an',
    appNameLabel: 'Non aplikasyon an',
    appName: COMMON.appName,
    packageLabel: 'Idantifyan pake',
    packageId: COMMON.packageId,
    publisherLabel: 'Piblikatè / Responsab tretman',
    publisher: COMMON.publisher,
    addressLabel: 'Adrès postal',
    address: COMMON.addressUS,
    emailLabel: 'Imèl kontak',
    email: COMMON.email,
    phoneLabel: 'Telefòn',
    phone: `${COMMON.phoneUS} (USA) / ${COMMON.phoneHT} (Ayiti)`,
  },
  sections: [
    {
      id: 'identity',
      title: '1. Idantite responsab tretman an',
      blocks: [
        {
          kind: 'p',
          text: 'Alliance Shipping S.A. (« nou », « pa nou », « Alliance Shipping ») se responsab tretman done pèsonèl ou yo. Konpayi nou an ap opere yon sèvis transpò pakèt maritim ant Etazini ak Repiblik Dayiti.',
        },
        {
          kind: 'list',
          items: [
            `Piblikatè : ${COMMON.publisher}`,
            `Adrès postal : ${COMMON.addressUS}`,
            `Imèl : ${COMMON.email}`,
            `Telefòn (USA) : ${COMMON.phoneUS}`,
            `Telefòn (Ayiti) : ${COMMON.phoneHT}`,
            `Aplikasyon mobil : ${COMMON.appName} (pake ${COMMON.packageId})`,
            'Sit wèb : https://allianceshipping.company',
          ],
        },
      ],
    },
    {
      id: 'data-collected',
      title: '2. Done nou kolekte',
      blocks: [
        { kind: 'p', text: 'Nou kolekte sèlman done ki nesesè pou bay Sèvis nou an. Kategori done sa yo kapab kolekte :' },
        { kind: 'h3', text: 'a) Done idantite' },
        {
          kind: 'list',
          items: [
            'Non ak siyati',
            'Adrès imèl',
            'Nimewo telefòn (USA ak Ayiti)',
            'Foto pwofil (opsyonèl)',
            'Dat kreyasyon ak aktivite kont',
          ],
        },
        { kind: 'h3', text: 'b) Done adrès' },
        {
          kind: 'list',
          items: [
            'Adrès livrezon nan USA (depo Miami nou an ak/oswa adrès pèsonèl)',
            'Adrès livrezon an Ayiti (vil, katye, pwen referans)',
            'Enfòmasyon moun kap resevwa a lè w voye yon pakèt pou yon twazyèm pati',
          ],
        },
        { kind: 'h3', text: 'c) Done peman' },
        {
          kind: 'list',
          items: [
            'Nou pa estoke nimewo kat kredi konplè w nan sèvè nou yo.',
            'Peman yo trete pa founisè twazyèm pati sètifye PCI-DSS (pa egzanp Stripe, PayPal, MonCash oswa ekivalan).',
            'Nou resevwa sèlman yon ID tranzaksyon, kantite lajan, deviz ak estati a (reyisit/echèk).',
          ],
        },
        { kind: 'h3', text: 'd) Done lokasyon' },
        {
          kind: 'list',
          items: [
            'Lokasyon apwoksimatif (vil, peyi) ki dedwi nan adrès IP ou — sèvi pou montre depo ki pi pre a ak deviz apwopriye a.',
            'Lokasyon presi (GPS) — sèlman si w aktive fonksyon sa a eksplisitman pou jwenn depo ki pi pre oswa pataje lokasyon livrezon w. Ou ka dezaktive l nenpòt ki lè nan paramèt sistèm opere a.',
          ],
        },
        { kind: 'h3', text: 'e) Idantifyan aparèy ak teknik' },
        {
          kind: 'list',
          items: [
            'Idantifyan piblisite Android/iOS (AAID/IDFA) si w pa dezaktive swivi a',
            'Token notifikasyon push (FCM / Expo Push Token)',
            'Adrès IP',
            'Tip, modèl, lang ak sistèm opere aparèy la',
            'Vèsyon aplikasyon an',
          ],
        },
        { kind: 'h3', text: 'f) Done itilizasyon' },
        {
          kind: 'list',
          items: [
            'Paj ki vizite, ekran ki ouvri, aksyon ki fèt (egz : kreye yon demann pakèt)',
            'Log teknik (datè, URL, erè)',
            'Preferans (lang, tèm, notifikasyon)',
          ],
        },
        { kind: 'h3', text: 'g) Foto ak kamera' },
        {
          kind: 'list',
          items: [
            'Aplikasyon an kapab mande aksè nan kamera ou oswa galri foto w si w chwazi telechaje yon foto pwofil, eskane yon nimewo swivi oswa foto yon pakèt/dokiman. Imaj sa yo estoke an sekirite epi yo sèvi sèlman pou bi w endike a.',
          ],
        },
        { kind: 'h3', text: 'h) Kontak' },
        {
          kind: 'list',
          items: [
            'Nou pa li kanè adrès ou. Si w chwazi pataje yon lyen swivi ak yon moun, ou dwe antre manyèl imèl oswa nimewo yo.',
          ],
        },
      ],
    },
    {
      id: 'purposes',
      title: '3. Rezon tretman',
      blocks: [
        { kind: 'p', text: 'Nou itilize done w yo sèlman pou :' },
        {
          kind: 'list',
          items: [
            'Kreye ak jere kont itilizatè w',
            'Trete, voye, swiv ak livre pakèt ou yo ant USA ak Ayiti',
            'Fè w fakti epi trete peman w yo atravè founisè nou yo',
            'Voye notifikasyon tranzaksyonèl (estati pakèt, rive nan destinasyon, pwoblèm ladwàn)',
            'Kalkile frè transpò, taks ak estimasyon livrezon',
            'Bay sipò kliyan (imèl, telefòn, WhatsApp)',
            'Amelyore ak sekirize Sèvis la (deteksyon fwòd, prevansyon abi)',
            'Respekte obligasyon legal nou yo (ladwàn, kontabilite, lit kont blanchisman lajan)',
          ],
        },
      ],
    },
    {
      id: 'legal-basis',
      title: '4. Baz legal (RGPD)',
      blocks: [
        { kind: 'p', text: 'Chak tretman baze sou youn nan baz legal sa yo :' },
        {
          kind: 'list',
          items: [
            'Egzekisyon kontra (RGPD atk 6.1.b) : kreyasyon kont, voye ak livrezon pakèt, peman, sipò.',
            'Obligasyon legal (RGPD atk 6.1.c) : deklarasyon ladwàn, obligasyon kontabilite ak taks, lit kont blanchisman.',
            'Enterè lejitim (RGPD atk 6.1.f) : sekirite Sèvis la, prevansyon fwòd, amelyorasyon pwodwi.',
            'Konsantman (RGPD atk 6.1.a) : lokasyon presi, notifikasyon push maketing, cookies ki pa esansyèl. Ou ka retire l nenpòt ki lè.',
          ],
        },
      ],
    },
    {
      id: 'third-parties',
      title: '5. Destinatè ak pataj done',
      blocks: [
        { kind: 'p', text: 'Nou pa janm vann done w yo. Nou pataje done sèlman avèk kategori destinatè sa yo, sèlman jan l nesesè :' },
        {
          kind: 'list',
          items: [
            'Founisè peman : Stripe, PayPal, MonCash ak ekivalan (sètifye PCI-DSS).',
            'Sèvis Google : Firebase Cloud Messaging (notifikasyon push), Firebase Analytics (itilizasyon anonim), Google Maps (jeyografik depo), reCAPTCHA (prevansyon bot).',
            'Founisè otantifikasyon : Clerk Inc. (jesyon kont ak sesyon).',
            'Platfòm mobil : Expo / EAS (konpilasyon ak distribisyon OTA mizajou aplikasyon an).',
            'Ebèjman nuage : Vercel Inc. (ebèjman sit wèb ak API), Neon (baz done PostgreSQL).',
            'Transpòtè ak patnè lojistik : konpayi maritim, transitè, transpòtè lokal an Ayiti nesesè pou livrezon.',
            'Otorite ladwàn ak taks : US Customs and Border Protection, Direction Générale des Douanes (AGD, Ayiti) lè deklarasyon obligatwa.',
            'Otorite jidisyè ak administratif : sèlman sou demand legal valid.',
            'Konseye ekstèn : avoka, ekspè-kontab, oditè ki lye pa sekrè pwofesyonèl.',
          ],
        },
        {
          kind: 'p',
          text: 'Chak sou-traitant lye pa yon kontra ki enpoze obligasyon sekirite ak konfidansyalite omwen ekivalan ak sa nan politik sa a.',
        },
      ],
    },
    {
      id: 'transfers',
      title: '6. Transfè entènasyonal done',
      blocks: [
        {
          kind: 'p',
          text: 'Aktivite nou an enplike natirèlman yon transfè done ant Etazini ak Ayiti. Kèk sou-traitant kapab trete done nan lòt peyi (pa egzanp nan Inyon Ewopeyen pou sèvis ebèjman oswa analyse).',
        },
        {
          kind: 'list',
          items: [
            'Transfè USA ↔ Ayiti : ankadre pa klòz kontraktyèl konfidansyalite ak obligasyon ladwàn nou yo.',
            'Transfè soti nan Inyon Ewopeyen : ankadre pa Klòz Kontraktyèl Tip Komisyon Ewopeyen an (CCT) epi, lè sa nesesè, mezi siplemantè (chifreman transpò, minimizasyon).',
            `Ou ka jwenn yon kopi garanti sa yo nan ekri ${COMMON.email}.`,
          ],
        },
      ],
    },
    {
      id: 'security',
      title: '7. Sekirite done',
      blocks: [
        { kind: 'p', text: 'Nou aplike mezi teknik ak òganizasyonèl pou pwoteje done w yo kont pèt, altèrasyon oswa aksè san otorizasyon :' },
        {
          kind: 'list',
          items: [
            'Chifreman TLS 1.2+ pou tout kominikasyon rezo.',
            'Chifreman done sansib lè y ap estoke.',
            'Otantifikasyon solid pou administratè, hachage bcrypt/argon2 pou sekrè.',
            'Peman yo trete sèlman pa founisè sètifye PCI-DSS Nivo 1.',
            'Separasyon anviwònman (pwodiksyon / pre-pwodiksyon / devlopman).',
            'Registrasyon ak siveyans aksè done.',
            'Revizyon peryodik aksè ak otorizasyon.',
          ],
        },
      ],
    },
    {
      id: 'retention',
      title: '8. Dire konsèvasyon',
      blocks: [
        { kind: 'p', text: 'Nou konsève done w yo jan sa :' },
        {
          kind: 'list',
          items: [
            'Done kont : pandan tout dire relasyon kontraktyèl, plis 12 mwa apre sipresyon.',
            'Done livrezon : 10 an (obligasyon kontabilite ak ladwàn).',
            'Done peman (ID tranzaksyon) : 10 an (obligasyon kontabilite).',
            'Log teknik ak analyse : maksimòm 13 mwa.',
            'Token notifikasyon push : jiska w retire otorizasyon oswa dezenstale aplikasyon an.',
            'Done sipò kliyan : 3 an apre dènye echanj.',
            'Dokiman idantite (si obligatwa pa lalwa) : dire lalwa aplikab mande.',
          ],
        },
      ],
    },
    {
      id: 'rights',
      title: '9. Dwa w yo',
      blocks: [
        { kind: 'p', text: 'Dapre RGPD, CCPA ak lwa ayisyen aplikab, ou gen dwa sa yo :' },
        {
          kind: 'list',
          items: [
            'Dwa aksè done w yo epi jwenn yon kopi.',
            'Dwa koreksyon done ki pa kòrèk oswa ki pa konplè.',
            'Dwa efase (« dwa pou bliye »).',
            'Dwa restriksyon tretman.',
            'Dwa pòtabilite nan yon fòma estriktire.',
            'Dwa opozisyon, sitou nan pwofaylaj ak maketing.',
            'Dwa retire konsantman nenpòt ki lè (san efè retwoaktif).',
            'Dwa pa fè objè yon desizyon antyèman otomatize.',
            'Dwa depoze yon plent bò kote yon otorite kontwòl konpetan.',
            'Rezidan Kalifòni (CCPA/CPRA) : dwa konnen, dwa efase, dwa korije, dwa opt-out vant/pataj — nou pa vann done w.',
          ],
        },
        { kind: 'p', text: `Pou egzèse dwa sa yo, ekri nan ${COMMON.email}. Nou reponn nan yon delè maksimòm 30 jou.` },
      ],
    },
    {
      id: 'account-deletion',
      title: '10. Sipresyon kont ak done',
      blocks: [
        {
          kind: 'p',
          text: 'Dapre egzijans Google Play (2023+), ou ka efase kont ou ak done w yo san w pa reenstale aplikasyon an ni kontakte sipò :',
        },
        { kind: 'h3', text: 'Depi aplikasyon mobil la oswa sit wèb la' },
        {
          kind: 'list',
          items: [
            'Ouvri aplikasyon an oswa sit la, ale nan paj « Efase kont mwen » : https://allianceshipping.company/delete-account',
            'Antre imèl kont lan epi konfime demand lan.',
            'Yon konfimasyon voye nan imèl ou.',
          ],
        },
        { kind: 'h3', text: 'Pa imèl' },
        {
          kind: 'list',
          items: [
            `Voye yon imèl bay ${COMMON.email} avèk sijè « Sipresyon kont » soti nan imèl ki asosye ak kont ou an.`,
            'Nou kapab mande yon prèv idantite pou anpeche fwòd.',
          ],
        },
        { kind: 'h3', text: 'Delè ak pòte' },
        {
          kind: 'list',
          items: [
            'Delè : demand ou trete nan maksimòm 30 jou.',
            'Done efase : non, imèl, telefòn, adrès pèsonèl, foto pwofil, preferans, token notifikasyon, idantifyan teknik.',
            'Done konsève (anonim oswa dapre lalwa) : istwa livrezon lye ak obligasyon kontabilite ak ladwàn (10 an), dokiman lit kont blanchisman, log sekirite nesesè pou defans legal.',
            'Apre sipresyon, done yo efase oswa anonim nan backup nou yo nan maksimòm 90 jou siplemantè.',
          ],
        },
      ],
    },
    {
      id: 'cookies',
      title: '11. Cookies ak teknoloji similè',
      blocks: [
        { kind: 'p', text: 'Sit wèb la itilize cookies ak teknoloji ekivalan (localStorage, SDK) pou rezon sa yo :' },
        {
          kind: 'list',
          items: [
            'Cookies esansyèl : otantifikasyon, preferans lang/tèm, sekirite. Yo pa ka dezaktive.',
            'Cookies mezi odyans : Firebase Analytics, anonim, pou konprann itilizasyon sit la.',
            'Cookies twazyèm pati esansyèl : Clerk (sesyon), Vercel (ebèjman), reCAPTCHA (sekirite).',
          ],
        },
        {
          kind: 'p',
          text: 'Ou ka konfigire navigatè w pou refize cookies ki pa esansyèl. Aplikasyon mobil la pa itilize cookies HTTP tradisyonèl men estokaj sekirize ekivalan.',
        },
      ],
    },
    {
      id: 'push',
      title: '12. Notifikasyon push',
      blocks: [
        {
          kind: 'p',
          text: 'Nou voye notifikasyon push atravè Firebase Cloud Messaging (Android) ak APNs (iOS) pou enfòme w sou estati pakèt, rive, pwoblèm ladwàn epi, avèk konsantman w, anons enpòtan.',
        },
        {
          kind: 'list',
          items: [
            'Lè enstalasyon an, iOS/Android mande otorizasyon w eksplisitman.',
            'Ou ka dezaktive notifikasyon nenpòt ki lè nan paramèt sistèm opere a oswa nan aplikasyon an (Pwofil → Notifikasyon).',
            'Notifikasyon tranzaksyonèl ki lye avèk yon kontra aktif ap kontinye voye pa imèl menm si push dezaktive.',
          ],
        },
      ],
    },
    {
      id: 'children',
      title: '13. Timoun',
      blocks: [
        { kind: 'p', text: 'Alliance Shipping pa fèt pou timoun. Nou pa kolekte dokonbyen done sou timoun :' },
        {
          kind: 'list',
          items: [
            'Ki gen mwens pase 13 an (COPPA, USA).',
            'Ki gen mwens pase 16 an san konsantman paran (RGPD, Inyon Ewopeyen).',
          ],
        },
        {
          kind: 'p',
          text: `Si w se yon paran oswa gadyen legal epi w panse pitit ou te bay nou done, ekri nan ${COMMON.email} : n ap efase kont lan imedyatman.`,
        },
      ],
    },
    {
      id: 'breach',
      title: '14. Vyolasyon done',
      blocks: [
        {
          kind: 'p',
          text: 'An ka yon vyolasyon done pèsonèl ki kapab poze yon risk pou dwa ak libète w, nou angaje n pou :',
        },
        {
          kind: 'list',
          items: [
            'Notifye otorite kontwòl konpetan an nan 72 èdtan apre nou konnen (RGPD atk 33).',
            'Enfòme w san reta si vyolasyon an kapab poze yon risk eleve pou dwa w (RGPD atk 34).',
            'Pran imedyatman tout mezi teknik ak òganizasyonèl pou limite konsekans vyolasyon an.',
          ],
        },
      ],
    },
    {
      id: 'changes',
      title: '15. Modifikasyon politik la',
      blocks: [
        {
          kind: 'p',
          text: 'Nou ka mete ajou Politik sa a pou reflete chanjman legal, teknik oswa komèsyal. Tout modifikasyon siyifikatif ap notifye pa imèl ak/oswa notifikasyon nan aplikasyon an omwen 15 jou anvan l antre an vigè. Dat « Dènye mizajou » an wo paj sa a endike vèsyon an vigè a.',
        },
      ],
    },
    {
      id: 'dpo',
      title: '16. Reprezantan Pwoteksyon Done (DPO)',
      blocks: [
        { kind: 'p', text: 'Pou nenpòt kesyon sou pwoteksyon done w, kontakte responsab pwoteksyon done nou an :' },
        {
          kind: 'list',
          items: [
            `Imèl : ${COMMON.email}`,
            `Kourye : Alliance Shipping — DPO, ${COMMON.addressUS}`,
            `Telefòn (USA) : ${COMMON.phoneUS}`,
            `Telefòn (Ayiti) : ${COMMON.phoneHT}`,
          ],
        },
      ],
    },
    {
      id: 'jurisdiction',
      title: '17. Lwa aplikab ak jiridiksyon',
      blocks: [
        {
          kind: 'p',
          text: 'Politik sa a, selon rezidans itilizatè a, gouvène pa lwa aplikab nan Repiblik Dayiti, pa lwa Eta Florid (USA) pou itilizatè ki rete nan Etazini, epi pa règleman ewopeyen pou itilizatè ki rete nan Inyon Ewopeyen. Tout diskisyon ap fè premye yon esè pou rezolisyon anmiyab ; si sa pa mache, tribinal konpetan kote konsomatè a rete ap gen jiridiksyon lè lalwa pèmèt sa.',
        },
      ],
    },
  ],
  footerNote: `Pou nenpòt kesyon sou Politik sa a, kontakte nou nan ${COMMON.email} oswa pa kourye nan ${COMMON.addressUS}.`,
};

// ---------------- SPANISH ----------------
const es: PrivacyContent = {
  title: 'Política de Privacidad',
  lastUpdated: 'Última actualización: 16 de abril de 2026',
  intro:
    'Esta Política de Privacidad describe cómo Alliance Shipping recopila, utiliza, comparte y protege sus datos personales cuando utiliza nuestra aplicación móvil "Alliance Shipping" y nuestro sitio web https://allianceshipping.company (en conjunto, el "Servicio"). Cumplimos con el Reglamento General de Protección de Datos (RGPD), la Ley de Privacidad del Consumidor de California (CCPA) y la legislación haitiana aplicable sobre protección de datos personales.',
  tocLabel: 'Tabla de contenidos',
  appInfo: {
    label: 'Información de la aplicación',
    appNameLabel: 'Nombre de la app',
    appName: COMMON.appName,
    packageLabel: 'Identificador de paquete',
    packageId: COMMON.packageId,
    publisherLabel: 'Editor / Responsable del tratamiento',
    publisher: COMMON.publisher,
    addressLabel: 'Dirección postal',
    address: COMMON.addressUS,
    emailLabel: 'Email de contacto',
    email: COMMON.email,
    phoneLabel: 'Teléfono',
    phone: `${COMMON.phoneUS} (USA) / ${COMMON.phoneHT} (Haití)`,
  },
  sections: [
    {
      id: 'identity',
      title: '1. Identidad del responsable del tratamiento',
      blocks: [
        {
          kind: 'p',
          text: 'Alliance Shipping S.A. ("nosotros", "nuestro", "Alliance Shipping") es el responsable del tratamiento de sus datos personales. Operamos un servicio de transporte marítimo de paquetes entre los Estados Unidos y la República de Haití.',
        },
        {
          kind: 'list',
          items: [
            `Editor: ${COMMON.publisher}`,
            `Dirección postal: ${COMMON.addressUS}`,
            `Email: ${COMMON.email}`,
            `Teléfono (USA): ${COMMON.phoneUS}`,
            `Teléfono (Haití): ${COMMON.phoneHT}`,
            `Aplicación móvil: ${COMMON.appName} (paquete ${COMMON.packageId})`,
            'Sitio web: https://allianceshipping.company',
          ],
        },
      ],
    },
    {
      id: 'data-collected',
      title: '2. Datos que recopilamos',
      blocks: [
        { kind: 'p', text: 'Solo recopilamos datos necesarios para prestar nuestro Servicio. Pueden recopilarse las siguientes categorías:' },
        { kind: 'h3', text: 'a) Datos de identidad' },
        {
          kind: 'list',
          items: [
            'Nombre y apellido',
            'Dirección de email',
            'Números de teléfono (USA y Haití)',
            'Foto de perfil (opcional)',
            'Fechas de creación y actividad de la cuenta',
          ],
        },
        { kind: 'h3', text: 'b) Datos de dirección' },
        {
          kind: 'list',
          items: [
            'Dirección de envío en USA (nuestro almacén de Miami y/o dirección personal)',
            'Dirección de entrega en Haití (ciudad, barrio, referencias)',
            'Datos del destinatario cuando envía un paquete a un tercero',
          ],
        },
        { kind: 'h3', text: 'c) Datos de pago' },
        {
          kind: 'list',
          items: [
            'No almacenamos números completos de tarjeta en nuestros servidores.',
            'Los pagos son procesados por proveedores terceros certificados PCI-DSS (por ejemplo Stripe, PayPal, MonCash o equivalente).',
            'Solo recibimos un ID de transacción, importe, moneda y estado (éxito/fallo).',
          ],
        },
        { kind: 'h3', text: 'd) Datos de localización' },
        {
          kind: 'list',
          items: [
            'Localización aproximada (ciudad, país) derivada de su IP — usada para mostrar el depósito más cercano y la moneda apropiada.',
            'Localización precisa (GPS) — solo si la activa explícitamente para encontrar el almacén más cercano o compartir una ubicación de entrega. Puede revocarla en cualquier momento en los ajustes del sistema operativo.',
          ],
        },
        { kind: 'h3', text: 'e) Identificadores de dispositivo y técnicos' },
        {
          kind: 'list',
          items: [
            'Identificador publicitario Android/iOS (AAID/IDFA) salvo que haya limitado el seguimiento',
            'Token de notificaciones push (FCM / Expo Push Token)',
            'Dirección IP',
            'Tipo, modelo, idioma y sistema operativo del dispositivo',
            'Versión de la aplicación',
          ],
        },
        { kind: 'h3', text: 'f) Datos de uso' },
        {
          kind: 'list',
          items: [
            'Páginas vistas, pantallas abiertas, acciones (ej: crear una solicitud de paquete)',
            'Registros técnicos (marcas de tiempo, URLs, errores)',
            'Preferencias (idioma, tema, notificaciones)',
          ],
        },
        { kind: 'h3', text: 'g) Fotos y cámara' },
        {
          kind: 'list',
          items: [
            'La app puede solicitar acceso a la cámara o a la galería si decide subir una foto de perfil, escanear un número de seguimiento o fotografiar un paquete/documento. Dichas imágenes se almacenan de forma segura y solo para la finalidad indicada.',
          ],
        },
        { kind: 'h3', text: 'h) Contactos' },
        {
          kind: 'list',
          items: [
            'No leemos su agenda. Si decide compartir un enlace de seguimiento con alguien, debe introducir manualmente el email o número.',
          ],
        },
      ],
    },
    {
      id: 'purposes',
      title: '3. Finalidades del tratamiento',
      blocks: [
        { kind: 'p', text: 'Utilizamos sus datos únicamente para:' },
        {
          kind: 'list',
          items: [
            'Crear y gestionar su cuenta de usuario',
            'Procesar, enviar, rastrear y entregar sus paquetes entre USA y Haití',
            'Facturarle y procesar los pagos a través de nuestros proveedores',
            'Enviar notificaciones transaccionales (estado del paquete, llegada, incidencias aduaneras)',
            'Calcular costes de envío, impuestos y plazos',
            'Proporcionar soporte (email, teléfono, WhatsApp)',
            'Mejorar y proteger el Servicio (detección de fraude, prevención de abusos)',
            'Cumplir obligaciones legales (aduanas, contabilidad, prevención de blanqueo)',
          ],
        },
      ],
    },
    {
      id: 'legal-basis',
      title: '4. Base legal (RGPD)',
      blocks: [
        { kind: 'p', text: 'Cada tratamiento se basa en una de las siguientes bases legales:' },
        {
          kind: 'list',
          items: [
            'Ejecución del contrato (RGPD art. 6.1.b): creación de cuenta, envío y entrega de paquetes, pagos, soporte.',
            'Obligación legal (RGPD art. 6.1.c): declaraciones aduaneras, obligaciones contables y fiscales, prevención de blanqueo.',
            'Interés legítimo (RGPD art. 6.1.f): seguridad del Servicio, prevención de fraudes, mejora del producto.',
            'Consentimiento (RGPD art. 6.1.a): geolocalización precisa, notificaciones push de marketing, cookies no esenciales. Revocable en cualquier momento.',
          ],
        },
      ],
    },
    {
      id: 'third-parties',
      title: '5. Destinatarios y compartición',
      blocks: [
        { kind: 'p', text: 'Nunca vendemos sus datos. Solo compartimos datos con las siguientes categorías de destinatarios, estrictamente en la medida necesaria:' },
        {
          kind: 'list',
          items: [
            'Procesadores de pago: Stripe, PayPal, MonCash y equivalentes (certificados PCI-DSS).',
            'Servicios Google: Firebase Cloud Messaging (push), Firebase Analytics (uso anonimizado), Google Maps (geolocalización), reCAPTCHA (anti-bots).',
            'Proveedor de autenticación: Clerk Inc. (cuentas y sesiones).',
            'Plataforma móvil: Expo / EAS (compilación y distribución OTA).',
            'Alojamiento cloud: Vercel Inc. (web y APIs), Neon (PostgreSQL gestionado).',
            'Transportistas y socios logísticos: navieras, transitarios, transporte local en Haití.',
            'Autoridades aduaneras y fiscales: US Customs and Border Protection, Direction Générale des Douanes (AGD, Haití) cuando se requieran declaraciones.',
            'Autoridades judiciales o administrativas: solo ante solicitud legal válida.',
            'Asesores externos: abogados, contables y auditores sujetos a secreto profesional.',
          ],
        },
        { kind: 'p', text: 'Cada encargado está vinculado por un contrato que impone obligaciones de seguridad y confidencialidad al menos equivalentes a las de esta Política.' },
      ],
    },
    {
      id: 'transfers',
      title: '6. Transferencias internacionales',
      blocks: [
        {
          kind: 'p',
          text: 'Nuestra actividad implica por naturaleza transferir datos entre USA y Haití. Algunos encargados también pueden tratar datos en otros países (por ejemplo en la UE para alojamiento o analítica).',
        },
        {
          kind: 'list',
          items: [
            'Transferencias USA ↔ Haití: cubiertas por cláusulas contractuales de confidencialidad y obligaciones aduaneras.',
            'Transferencias desde la UE: cubiertas por las Cláusulas Contractuales Tipo de la Comisión Europea (CCT) y, cuando proceda, medidas adicionales (cifrado en tránsito, minimización).',
            `Puede solicitar una copia de estas garantías escribiendo a ${COMMON.email}.`,
          ],
        },
      ],
    },
    {
      id: 'security',
      title: '7. Seguridad de datos',
      blocks: [
        { kind: 'p', text: 'Implementamos medidas técnicas y organizativas para proteger sus datos frente a pérdida, alteración o acceso no autorizado:' },
        {
          kind: 'list',
          items: [
            'Cifrado TLS 1.2+ en todas las comunicaciones de red.',
            'Cifrado en reposo de bases de datos sensibles.',
            'Autenticación fuerte para administradores; hashing bcrypt/argon2 de secretos.',
            'Pagos procesados exclusivamente por proveedores certificados PCI-DSS Nivel 1.',
            'Separación de entornos (producción / staging / desarrollo).',
            'Registro y monitorización de accesos.',
            'Revisión periódica de accesos y permisos.',
          ],
        },
      ],
    },
    {
      id: 'retention',
      title: '8. Plazos de conservación',
      blocks: [
        { kind: 'p', text: 'Conservamos sus datos según los siguientes plazos:' },
        {
          kind: 'list',
          items: [
            'Datos de cuenta: durante la relación contractual, más 12 meses tras la eliminación.',
            'Datos de envío y entrega: 10 años (obligaciones contables y aduaneras).',
            'Datos de pago (IDs de transacción): 10 años (obligaciones contables).',
            'Logs técnicos y analíticos: hasta 13 meses.',
            'Tokens push: hasta revocación o desinstalación.',
            'Datos de soporte: 3 años desde el último contacto.',
            'Documentos de identidad (cuando sean legalmente exigidos): por el plazo fijado por la regulación aplicable.',
          ],
        },
      ],
    },
    {
      id: 'rights',
      title: '9. Sus derechos',
      blocks: [
        { kind: 'p', text: 'Conforme al RGPD, CCPA y ley haitiana aplicable, usted tiene los siguientes derechos:' },
        {
          kind: 'list',
          items: [
            'Derecho de acceso a sus datos y a obtener una copia.',
            'Derecho de rectificación de datos inexactos o incompletos.',
            'Derecho de supresión ("derecho al olvido").',
            'Derecho de limitación del tratamiento.',
            'Derecho de portabilidad en formato estructurado.',
            'Derecho de oposición, incluido al perfilado y marketing.',
            'Derecho a retirar el consentimiento en cualquier momento (sin efecto retroactivo).',
            'Derecho a no ser objeto de decisiones automatizadas.',
            'Derecho a reclamar ante una autoridad de control competente.',
            'Residentes de California (CCPA/CPRA): derecho a saber, eliminar, corregir, excluirse de venta/compartición — no vendemos sus datos.',
          ],
        },
        { kind: 'p', text: `Para ejercer estos derechos, escriba a ${COMMON.email}. Respondemos en un plazo máximo de 30 días.` },
      ],
    },
    {
      id: 'account-deletion',
      title: '10. Eliminación de cuenta y datos',
      blocks: [
        {
          kind: 'p',
          text: 'Conforme a los requisitos de Google Play (2023+), puede eliminar su cuenta y datos sin reinstalar la app ni contactar con soporte:',
        },
        { kind: 'h3', text: 'Desde la app o la web' },
        {
          kind: 'list',
          items: [
            'Abra la app o la web y vaya a "Eliminar mi cuenta": https://allianceshipping.company/delete-account',
            'Introduzca el email de la cuenta y confirme.',
            'Le enviamos un email de confirmación.',
          ],
        },
        { kind: 'h3', text: 'Por email' },
        {
          kind: 'list',
          items: [
            `Envíe un email a ${COMMON.email} con asunto "Eliminación de cuenta" desde el email asociado a su cuenta.`,
            'Podemos solicitar una identificación para evitar fraudes.',
          ],
        },
        { kind: 'h3', text: 'Plazos y alcance' },
        {
          kind: 'list',
          items: [
            'Plazo: su solicitud se procesa en un máximo de 30 días.',
            'Datos eliminados: nombre, email, teléfonos, direcciones, foto de perfil, preferencias, tokens, identificadores técnicos.',
            'Datos conservados (anonimizados o por obligación legal): historial de envíos por obligaciones contables y aduaneras (10 años), documentos AML, logs de seguridad para defensa legal.',
            'Tras la eliminación, los datos se borran o anonimizan de las copias de seguridad en un máximo de 90 días adicionales.',
          ],
        },
      ],
    },
    {
      id: 'cookies',
      title: '11. Cookies y tecnologías similares',
      blocks: [
        { kind: 'p', text: 'El sitio web utiliza cookies y tecnologías equivalentes (localStorage, SDKs) para las siguientes finalidades:' },
        {
          kind: 'list',
          items: [
            'Cookies estrictamente necesarias: autenticación, preferencias, seguridad. No pueden desactivarse.',
            'Cookies de medición de audiencia: Firebase Analytics, anonimizadas.',
            'Cookies de terceros esenciales: Clerk, Vercel, reCAPTCHA.',
          ],
        },
        { kind: 'p', text: 'Puede configurar su navegador para rechazar cookies no esenciales. La app móvil usa almacenamiento seguro equivalente, no cookies HTTP.' },
      ],
    },
    {
      id: 'push',
      title: '12. Notificaciones push',
      blocks: [
        {
          kind: 'p',
          text: 'Enviamos notificaciones push mediante Firebase Cloud Messaging (Android) y APNs (iOS) para informarle del estado de paquetes, llegadas, incidencias aduaneras y, con su consentimiento, anuncios importantes.',
        },
        {
          kind: 'list',
          items: [
            'Al instalar, iOS/Android solicitan su permiso expresamente.',
            'Puede desactivarlas en cualquier momento en los ajustes del sistema o en la app (Perfil → Notificaciones).',
            'Las notificaciones transaccionales asociadas a un contrato activo siguen enviándose por email aunque desactive el push.',
          ],
        },
      ],
    },
    {
      id: 'children',
      title: '13. Menores',
      blocks: [
        { kind: 'p', text: 'Alliance Shipping no está destinado a menores. No recopilamos conscientemente datos de menores:' },
        {
          kind: 'list',
          items: [
            'Menores de 13 años (COPPA, USA).',
            'Menores de 16 años sin consentimiento parental (RGPD, Unión Europea).',
          ],
        },
        {
          kind: 'p',
          text: `Si es padre/madre o tutor y cree que su hijo nos ha proporcionado datos, escriba a ${COMMON.email}: eliminaremos la cuenta inmediatamente.`,
        },
      ],
    },
    {
      id: 'breach',
      title: '14. Violación de datos',
      blocks: [
        {
          kind: 'p',
          text: 'En caso de violación de datos personales que pueda suponer un riesgo para sus derechos y libertades, nos comprometemos a:',
        },
        {
          kind: 'list',
          items: [
            'Notificar a la autoridad de control competente en un plazo de 72 horas desde su conocimiento (RGPD art. 33).',
            'Informarle sin demora si la violación supone un riesgo alto para sus derechos (RGPD art. 34).',
            'Adoptar de inmediato todas las medidas técnicas y organizativas para limitar sus consecuencias.',
          ],
        },
      ],
    },
    {
      id: 'changes',
      title: '15. Cambios en la política',
      blocks: [
        {
          kind: 'p',
          text: 'Podemos actualizar esta Política para reflejar cambios legales, técnicos o comerciales. Cualquier cambio material se notificará por email y/o notificación en la app al menos 15 días antes de su entrada en vigor. La fecha de "Última actualización" indica la versión vigente.',
        },
      ],
    },
    {
      id: 'dpo',
      title: '16. Delegado de Protección de Datos (DPO)',
      blocks: [
        { kind: 'p', text: 'Para cualquier consulta sobre protección de datos, contacte con nuestro responsable:' },
        {
          kind: 'list',
          items: [
            `Email: ${COMMON.email}`,
            `Correo: Alliance Shipping — DPO, ${COMMON.addressUS}`,
            `Teléfono (USA): ${COMMON.phoneUS}`,
            `Teléfono (Haití): ${COMMON.phoneHT}`,
          ],
        },
      ],
    },
    {
      id: 'jurisdiction',
      title: '17. Ley aplicable y jurisdicción',
      blocks: [
        {
          kind: 'p',
          text: 'Esta Política se rige, según la residencia del usuario, por las leyes de la República de Haití, por la ley del Estado de Florida (USA) para usuarios en Estados Unidos y por los reglamentos europeos para usuarios en la Unión Europea. Cualquier disputa se someterá primero a un intento de resolución amistosa; en su defecto, los tribunales competentes del lugar de residencia del consumidor tendrán jurisdicción cuando la ley lo prevea.',
        },
      ],
    },
  ],
  footerNote: `Para cualquier consulta sobre esta Política, contáctenos en ${COMMON.email} o por correo a ${COMMON.addressUS}.`,
};

export const privacyContent: Record<Locale, PrivacyContent> = { fr, en, ht, es };

export function getPrivacyContent(locale: Locale): PrivacyContent {
  return privacyContent[locale] ?? privacyContent.en;
}
