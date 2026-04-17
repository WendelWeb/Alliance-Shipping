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

export type TermsContent = {
  title: string;
  lastUpdated: string;
  intro: string;
  tocLabel: string;
  sections: Section[];
  footerNote: string;
};

const COMMON = {
  email: 'allianceshipping26@gmail.com',
  phoneHT: '+509 4881 26-52',
  phoneUS: '+1 (954) 607-8226',
  addressUS: '8298 Northwest 68th Street, Miami, Florida 33195, USA',
  publisher: 'Alliance Shipping S.A.',
};

const fr: TermsContent = {
  title: "Conditions Générales d'Utilisation",
  lastUpdated: 'Dernière mise à jour : 16 avril 2026',
  intro:
    "Les présentes Conditions Générales d'Utilisation (« CGU ») régissent l'accès et l'utilisation du site web https://allianceshipping.company et de l'application mobile Alliance Shipping (ensemble, le « Service »), édités par Alliance Shipping S.A. En créant un compte ou en utilisant le Service, vous acceptez sans réserve les présentes CGU.",
  tocLabel: 'Table des matières',
  sections: [
    {
      id: 'acceptance',
      title: '1. Acceptation',
      blocks: [
        {
          kind: 'p',
          text: "En accédant à l'application mobile Alliance Shipping ou au site web, vous déclarez avoir lu, compris et accepté les présentes CGU, ainsi que notre Politique de Confidentialité. Si vous n'acceptez pas ces conditions, n'utilisez pas le Service.",
        },
      ],
    },
    {
      id: 'service',
      title: '2. Description du Service',
      blocks: [
        {
          kind: 'p',
          text: "Alliance Shipping exploite un service d'expédition de colis des États-Unis d'Amérique vers la République d'Haïti. Vous commandez des produits auprès de vendeurs américains en utilisant l'adresse de notre entrepôt de Miami, nous recevons et pesons vos colis, puis nous les expédions vers nos dépôts en Haïti (Cap-Haïtien, Port-au-Prince, Port-de-Paix) pour retrait par le destinataire.",
        },
      ],
    },
    {
      id: 'account',
      title: '3. Compte utilisateur',
      blocks: [
        {
          kind: 'p',
          text: "La création d'un compte est requise pour utiliser le Service. Vous devez fournir des informations exactes, complètes et à jour. Vous êtes seul responsable de la confidentialité de vos identifiants et de toute activité effectuée sous votre compte. Informez-nous immédiatement en cas d'utilisation non autorisée.",
        },
        {
          kind: 'list',
          items: [
            'Vous devez être majeur dans votre juridiction pour créer un compte.',
            'Un compte par personne physique ou morale.',
            "Alliance Shipping se réserve le droit de suspendre ou supprimer un compte en cas de violation des CGU, de fraude, ou d'activité illicite.",
          ],
        },
      ],
    },
    {
      id: 'package-requests',
      title: '4. Requêtes de colis et adresse d\'expédition',
      blocks: [
        {
          kind: 'p',
          text: "Chaque colis doit faire l'objet d'une requête dans le Service avec le numéro de suivi du transporteur d'origine (UPS, USPS, FedEx, DHL, Amazon, etc.). Sans requête, votre colis ne sera pas associé à votre compte et aucune notification ne pourra être envoyée.",
        },
        {
          kind: 'p',
          text: "Utilisez l'adresse d'expédition suivante : 8298 Northwest 68th Street, Apt PQ-068508, Miami, Florida 33195, +1 (954) 607-8226. Le code PQ-068508 (ou équivalent attribué à votre compte) doit figurer dans le champ Prénom ou Apt/Suite.",
        },
      ],
    },
    {
      id: 'pricing',
      title: '5. Tarification et paiement',
      blocks: [
        {
          kind: 'p',
          text: "Les frais d'expédition sont calculés en fonction du poids du colis, de la ville de destination et de la nature des articles (articles spéciaux, perfums, électronique, etc.). Des frais fixes de service peuvent s'appliquer par colis. Les prix sont affichés en dollars américains (USD).",
        },
        {
          kind: 'list',
          items: [
            "Le paiement est exigible avant l'expédition du colis vers Haïti.",
            "Les frais de douane sont fixés par les autorités haïtiennes et peuvent évoluer.",
            'Les moyens de paiement acceptés sont ceux proposés dans le Service au moment de la transaction.',
            'Aucun remboursement sur les frais de service déjà engagés, sauf cas de faute imputable à Alliance Shipping.',
          ],
        },
      ],
    },
    {
      id: 'shipping',
      title: '6. Expédition et délais',
      blocks: [
        {
          kind: 'p',
          text: "Les délais estimés sont de 3 à 7 jours ouvrables après réception du colis à Miami, hors articles spéciaux pouvant nécessiter un délai supplémentaire. Les délais sont indicatifs et non contractuels. Alliance Shipping n'est pas responsable des retards causés par les transporteurs, les autorités douanières, les conditions météorologiques ou tout autre événement hors de son contrôle.",
        },
      ],
    },
    {
      id: 'prohibited',
      title: '7. Articles interdits',
      blocks: [
        { kind: 'p', text: "Il est strictement interdit d'expédier via Alliance Shipping :" },
        {
          kind: 'list',
          items: [
            "Armes, munitions, explosifs, matières pyrotechniques",
            'Drogues et substances illicites',
            'Matières inflammables, corrosives ou radioactives',
            'Animaux vivants',
            'Devises, chèques au porteur, instruments monétaires',
            'Contrefaçons, produits violant des droits de propriété intellectuelle',
            'Tout article interdit par la loi des États-Unis ou de la République d\'Haïti',
          ],
        },
        {
          kind: 'p',
          text: "Tout colis contenant des articles interdits pourra être confisqué, détruit ou remis aux autorités compétentes, sans remboursement ni compensation, et entraîner la suspension immédiate du compte et, le cas échéant, des poursuites.",
        },
      ],
    },
    {
      id: 'liability',
      title: '8. Responsabilité',
      blocks: [
        {
          kind: 'p',
          text: "Alliance Shipping met en œuvre les meilleurs efforts pour livrer les colis en bon état et dans les délais estimés. Notre responsabilité est limitée à la valeur déclarée du colis au moment de la requête, dans la limite des plafonds d'assurance applicables. Nous ne sommes pas responsables des dommages indirects, pertes de profits ou dommages consécutifs.",
        },
        { kind: 'p', text: 'Les réclamations doivent être adressées par écrit dans un délai de 7 jours suivant la date de livraison prévue.' },
      ],
    },
    {
      id: 'ip',
      title: '9. Propriété intellectuelle',
      blocks: [
        {
          kind: 'p',
          text: "Tous les éléments du Service (logos, marques, textes, visuels, code) sont la propriété exclusive d'Alliance Shipping ou de ses partenaires. Toute reproduction ou utilisation non autorisée est interdite.",
        },
      ],
    },
    {
      id: 'termination',
      title: '10. Résiliation',
      blocks: [
        {
          kind: 'p',
          text: "Vous pouvez supprimer votre compte à tout moment via la page /delete-account ou en écrivant à " + COMMON.email + ". Alliance Shipping peut résilier un compte en cas de violation grave des présentes CGU, de fraude ou d'activité illicite. Certaines obligations (paiement, confidentialité, limitation de responsabilité) survivent à la résiliation.",
        },
      ],
    },
    {
      id: 'privacy',
      title: '11. Données personnelles',
      blocks: [
        {
          kind: 'p',
          text: "Le traitement de vos données personnelles est décrit dans notre Politique de Confidentialité, accessible à https://allianceshipping.company/privacy-policy.",
        },
      ],
    },
    {
      id: 'modifications',
      title: '12. Modification des CGU',
      blocks: [
        {
          kind: 'p',
          text: "Alliance Shipping se réserve le droit de modifier les CGU à tout moment. Les modifications substantielles seront notifiées par email ou notification dans l'application au moins 15 jours avant leur entrée en vigueur. L'utilisation continue du Service vaut acceptation des nouvelles CGU.",
        },
      ],
    },
    {
      id: 'law',
      title: '13. Loi applicable et litiges',
      blocks: [
        {
          kind: 'p',
          text: "Les présentes CGU sont régies, selon la résidence de l'utilisateur, par les lois de la République d'Haïti, par le droit de l'État de Floride (USA) pour les utilisateurs résidant aux États-Unis, et par les règlements européens applicables aux utilisateurs résidant dans l'Union européenne. Tout litige sera d'abord soumis à une tentative de résolution amiable, puis aux juridictions compétentes.",
        },
      ],
    },
    {
      id: 'contact',
      title: '14. Contact',
      blocks: [
        { kind: 'p', text: 'Pour toute question relative aux présentes CGU :' },
        {
          kind: 'list',
          items: [
            `Email : ${COMMON.email}`,
            `Adresse postale : ${COMMON.addressUS}`,
            `Téléphone (USA) : ${COMMON.phoneUS}`,
            `Téléphone / WhatsApp (Haïti) : ${COMMON.phoneHT}`,
          ],
        },
      ],
    },
  ],
  footerNote: `Édité par ${COMMON.publisher} — ${COMMON.addressUS}.`,
};

const en: TermsContent = {
  title: 'Terms of Service',
  lastUpdated: 'Last updated: April 16, 2026',
  intro:
    'These Terms of Service ("Terms") govern access to and use of the website https://allianceshipping.company and the Alliance Shipping mobile application (together, the "Service"), published by Alliance Shipping S.A. By creating an account or using the Service, you accept these Terms without reservation.',
  tocLabel: 'Table of contents',
  sections: [
    {
      id: 'acceptance',
      title: '1. Acceptance',
      blocks: [
        {
          kind: 'p',
          text: "By accessing the Alliance Shipping mobile app or website, you declare that you have read, understood and accepted these Terms and our Privacy Policy. If you do not accept, do not use the Service.",
        },
      ],
    },
    {
      id: 'service',
      title: '2. Description of the Service',
      blocks: [
        {
          kind: 'p',
          text: 'Alliance Shipping operates a parcel shipping service from the United States to the Republic of Haiti. You order products from US merchants using our Miami warehouse address; we receive and weigh your parcels and ship them to our depots in Haiti (Cap-Haïtien, Port-au-Prince, Port-de-Paix) for recipient pickup.',
        },
      ],
    },
    {
      id: 'account',
      title: '3. User account',
      blocks: [
        {
          kind: 'p',
          text: 'An account is required to use the Service. You must provide accurate, complete and up-to-date information. You are solely responsible for keeping your credentials confidential and for any activity performed under your account. Notify us immediately of any unauthorized use.',
        },
        {
          kind: 'list',
          items: [
            'You must be of legal age in your jurisdiction to create an account.',
            'One account per natural or legal person.',
            'Alliance Shipping reserves the right to suspend or terminate any account for violation of these Terms, fraud, or unlawful activity.',
          ],
        },
      ],
    },
    {
      id: 'package-requests',
      title: '4. Parcel requests & shipping address',
      blocks: [
        {
          kind: 'p',
          text: 'Each parcel must be registered as a request in the Service with the origin carrier tracking number (UPS, USPS, FedEx, DHL, Amazon, etc.). Without a request, the parcel will not be linked to your account and no notification can be sent.',
        },
        {
          kind: 'p',
          text: 'Use the following shipping address: 8298 Northwest 68th Street, Apt PQ-068508, Miami, Florida 33195, +1 (954) 607-8226. Your personal warehouse code (PQ-068508 or equivalent) must appear in the First Name or Apt/Suite field.',
        },
      ],
    },
    {
      id: 'pricing',
      title: '5. Pricing & payment',
      blocks: [
        {
          kind: 'p',
          text: 'Shipping fees are calculated based on parcel weight, destination city and item category (special items, perfumes, electronics, etc.). A fixed service fee may apply per parcel. Prices are displayed in US dollars (USD).',
        },
        {
          kind: 'list',
          items: [
            'Payment is due before the parcel ships to Haiti.',
            'Customs duties are set by Haitian authorities and may change.',
            'Accepted payment methods are those offered in the Service at the time of transaction.',
            'No refund on service fees already incurred, except for faults attributable to Alliance Shipping.',
          ],
        },
      ],
    },
    {
      id: 'shipping',
      title: '6. Shipping & delivery times',
      blocks: [
        {
          kind: 'p',
          text: 'Estimated times are 3 to 7 business days after receipt at our Miami warehouse, excluding special items which may require additional time. Estimates are non-binding. Alliance Shipping is not liable for delays caused by carriers, customs authorities, weather or any other event beyond its control.',
        },
      ],
    },
    {
      id: 'prohibited',
      title: '7. Prohibited items',
      blocks: [
        { kind: 'p', text: 'It is strictly forbidden to ship via Alliance Shipping:' },
        {
          kind: 'list',
          items: [
            'Weapons, ammunition, explosives, pyrotechnics',
            'Drugs and illicit substances',
            'Flammable, corrosive or radioactive materials',
            'Live animals',
            'Currencies, bearer checks, monetary instruments',
            'Counterfeit goods, items infringing intellectual property rights',
            'Any item prohibited by US or Haitian law',
          ],
        },
        {
          kind: 'p',
          text: 'Any parcel containing prohibited items may be confiscated, destroyed or handed to the competent authorities, without refund or compensation, and will trigger immediate account suspension and, where applicable, legal action.',
        },
      ],
    },
    {
      id: 'liability',
      title: '8. Liability',
      blocks: [
        {
          kind: 'p',
          text: 'Alliance Shipping uses best efforts to deliver parcels in good condition and within estimated times. Our liability is limited to the declared value of the parcel at the time of request, within applicable insurance caps. We are not liable for indirect, consequential or profit-loss damages.',
        },
        { kind: 'p', text: 'Claims must be sent in writing within 7 days of the expected delivery date.' },
      ],
    },
    {
      id: 'ip',
      title: '9. Intellectual property',
      blocks: [
        {
          kind: 'p',
          text: 'All elements of the Service (logos, trademarks, texts, visuals, code) are the exclusive property of Alliance Shipping or its partners. Any unauthorized reproduction or use is prohibited.',
        },
      ],
    },
    {
      id: 'termination',
      title: '10. Termination',
      blocks: [
        {
          kind: 'p',
          text: `You can delete your account at any time via the /delete-account page or by writing to ${COMMON.email}. Alliance Shipping may terminate an account for serious breach of these Terms, fraud or unlawful activity. Some obligations (payment, confidentiality, limitation of liability) survive termination.`,
        },
      ],
    },
    {
      id: 'privacy',
      title: '11. Personal data',
      blocks: [
        {
          kind: 'p',
          text: 'The processing of your personal data is described in our Privacy Policy at https://allianceshipping.company/privacy-policy.',
        },
      ],
    },
    {
      id: 'modifications',
      title: '12. Changes to the Terms',
      blocks: [
        {
          kind: 'p',
          text: 'Alliance Shipping reserves the right to modify these Terms at any time. Material changes will be notified by email or in-app at least 15 days before they take effect. Continued use of the Service constitutes acceptance of the new Terms.',
        },
      ],
    },
    {
      id: 'law',
      title: '13. Governing law & disputes',
      blocks: [
        {
          kind: 'p',
          text: "These Terms are governed, depending on user residence, by the laws of the Republic of Haiti, by the law of the State of Florida (USA) for users residing in the United States, and by applicable European regulations for users in the European Union. Any dispute shall first be subject to an amicable resolution attempt, then to the competent courts.",
        },
      ],
    },
    {
      id: 'contact',
      title: '14. Contact',
      blocks: [
        { kind: 'p', text: 'For any question about these Terms:' },
        {
          kind: 'list',
          items: [
            `Email: ${COMMON.email}`,
            `Postal address: ${COMMON.addressUS}`,
            `Phone (USA): ${COMMON.phoneUS}`,
            `Phone / WhatsApp (Haiti): ${COMMON.phoneHT}`,
          ],
        },
      ],
    },
  ],
  footerNote: `Published by ${COMMON.publisher} — ${COMMON.addressUS}.`,
};

const ht: TermsContent = {
  title: "Kondisyon Itilizasyon",
  lastUpdated: 'Dènye mizajou : 16 avril 2026',
  intro:
    "Kondisyon Itilizasyon sa yo (« Kondisyon ») gouvène aksè ak itilizasyon sit wèb https://allianceshipping.company ak aplikasyon mobil Alliance Shipping (ansanm, « Sèvis la »), ki pibliye pa Alliance Shipping S.A. Lè w kreye yon kont oswa itilize Sèvis la, ou aksepte Kondisyon sa yo san rezèv.",
  tocLabel: 'Tab kontni',
  sections: [
    {
      id: 'acceptance',
      title: '1. Akseptasyon',
      blocks: [
        {
          kind: 'p',
          text: "Lè w itilize aplikasyon mobil Alliance Shipping oswa sit wèb la, ou deklare ou li, konprann epi aksepte Kondisyon sa yo ansanm ak Politik Konfidansyalite nou an. Si w pa aksepte, pa itilize Sèvis la.",
        },
      ],
    },
    {
      id: 'service',
      title: '2. Deskripsyon Sèvis la',
      blocks: [
        {
          kind: 'p',
          text: "Alliance Shipping opere yon sèvis voye pakèt soti nan Etazini pou Repiblik Dayiti. Ou kòmande pwodwi nan machann ameriken yo lè w itilize adrès depo Miami nou an ; nou resevwa pakèt ou yo, peze yo epi voye yo nan depo nou yo an Ayiti (Okap, Pòtoprens, Pòdepè) pou moun kap resevwa a vin chèche yo.",
        },
      ],
    },
    {
      id: 'account',
      title: '3. Kont itilizatè',
      blocks: [
        {
          kind: 'p',
          text: "Yon kont obligatwa pou itilize Sèvis la. Ou dwe bay enfòmasyon egzat, konplè epi ajou. Ou sèl responsab pou kenbe idantifyan w konfidansyèl epi pou tout aktivite ki fèt anba kont ou. Fè nou konnen imedyatman si gen itilizasyon san otorizasyon.",
        },
        {
          kind: 'list',
          items: [
            "Ou dwe gen laj legal nan jiridiksyon w pou kreye yon kont.",
            "Yon sèl kont pou chak moun oswa antite.",
            "Alliance Shipping gen dwa sispann oswa efase yon kont an ka vyolasyon Kondisyon yo, fwòd oswa aktivite ilegal.",
          ],
        },
      ],
    },
    {
      id: 'package-requests',
      title: '4. Demand pakèt ak adrès livrezon',
      blocks: [
        {
          kind: 'p',
          text: "Chak pakèt dwe gen yon demand nan Sèvis la avèk nimewo swivi transpòtè orijinal la (UPS, USPS, FedEx, DHL, Amazon, elt). San demand, pakèt ou a p ap lye ak kont ou epi pa gen notifikasyon ki ka voye.",
        },
        {
          kind: 'p',
          text: "Itilize adrès livrezon sa a : 8298 Northwest 68th Street, Apt PQ-068508, Miami, Florida 33195, +1 (954) 607-8226. Kòd PQ-068508 (oswa ekivalan atribiye kont ou an) dwe parèt nan chan Prenon oswa Apt/Suite.",
        },
      ],
    },
    {
      id: 'pricing',
      title: '5. Pri ak peman',
      blocks: [
        {
          kind: 'p',
          text: "Frè livrezon yo kalkile selon pwa pakèt la, vil destinasyon an ak kategori atik la (atik espesyal, pafen, elektwonik, elt). Yon frè sèvis fiks ka aplike pou chak pakèt. Pri afiche an dola ameriken (USD).",
        },
        {
          kind: 'list',
          items: [
            "Peman dwe fèt anvan pakèt la voye ann Ayiti.",
            "Frè ladwàn yo fikse pa otorite ayisyen yo epi ka chanje.",
            "Metòd peman aksepte yo se sa ki ofri nan Sèvis la nan moman tranzaksyon an.",
            "Pa gen ranbousman sou frè sèvis ki deja angaje, eksepte an ka fot Alliance Shipping.",
          ],
        },
      ],
    },
    {
      id: 'shipping',
      title: '6. Livrezon ak delè',
      blocks: [
        {
          kind: 'p',
          text: "Delè estime yo se 3 a 7 jou ouvrab apre resepsyon nan depo Miami nou an, san atik espesyal ki ka bezwen plis tan. Delè yo se estimasyon ki pa kontraktyèl. Alliance Shipping pa responsab reta ki koze pa transpòtè, otorite ladwàn, kondisyon metewolojik oswa nenpòt lòt evènman andeyò kontwòl li.",
        },
      ],
    },
    {
      id: 'prohibited',
      title: '7. Atik entèdi',
      blocks: [
        { kind: 'p', text: "Li entèdi pou voye atravè Alliance Shipping :" },
        {
          kind: 'list',
          items: [
            "Zam, minisyon, eksplozif, pyroteknik",
            'Dwòg ak sibstans ilegal',
            'Materyèl flamab, kowozif oswa radyoaktif',
            'Bèt vivan',
            'Deviz, chèk o pòtè, enstriman monetè',
            'Kontrefaksyon, atik ki vyole dwa pwopriyete entelektyèl',
            "Nenpòt atik entèdi pa lalwa Etazini oswa Repiblik Dayiti",
          ],
        },
        {
          kind: 'p',
          text: "Tout pakèt ki gen atik entèdi ka konfiske, detui oswa remèt bay otorite konpetan yo, san ranbousman ni konpansasyon, epi ap antrene sispansyon kont imedyatman epi, si sa nesesè, pouswit legal.",
        },
      ],
    },
    {
      id: 'liability',
      title: '8. Responsablite',
      blocks: [
        {
          kind: 'p',
          text: "Alliance Shipping fè efò maksimòm pou livre pakèt nan bon eta epi nan delè estime yo. Responsablite nou limite a valè deklare pakèt la nan moman demand lan, nan limit asirans aplikab yo. Nou pa responsab dega endirèk, pèt pwofi oswa dega konsekan.",
        },
        { kind: 'p', text: "Reklamasyon yo dwe voye ekri nan 7 jou apre dat livrezon prevwa." },
      ],
    },
    {
      id: 'ip',
      title: '9. Pwopriyete entelektyèl',
      blocks: [
        {
          kind: 'p',
          text: "Tout eleman Sèvis la (lòg, mak, tèks, imaj, kòd) se pwopriyete eksklizif Alliance Shipping oswa patnè li yo. Tout repwodiksyon oswa itilizasyon san otorizasyon entèdi.",
        },
      ],
    },
    {
      id: 'termination',
      title: '10. Rezilyasyon',
      blocks: [
        {
          kind: 'p',
          text: `Ou ka efase kont ou nenpòt ki lè atravè paj /delete-account oswa nan ekri ${COMMON.email}. Alliance Shipping ka rezilye yon kont an ka vyolasyon grav Kondisyon yo, fwòd oswa aktivite ilegal. Kèk obligasyon (peman, konfidansyalite, limitasyon responsablite) siviv rezilyasyon an.`,
        },
      ],
    },
    {
      id: 'privacy',
      title: '11. Done pèsonèl',
      blocks: [
        {
          kind: 'p',
          text: "Tretman done pèsonèl ou yo dekri nan Politik Konfidansyalite nou an : https://allianceshipping.company/privacy-policy.",
        },
      ],
    },
    {
      id: 'modifications',
      title: '12. Modifikasyon Kondisyon yo',
      blocks: [
        {
          kind: 'p',
          text: "Alliance Shipping gen dwa modifye Kondisyon yo nenpòt ki lè. Modifikasyon siyifikatif ap notifye pa imèl oswa nan aplikasyon an omwen 15 jou anvan yo antre an vigè. Itilizasyon kontinye Sèvis la vle di w aksepte nouvo Kondisyon yo.",
        },
      ],
    },
    {
      id: 'law',
      title: '13. Lwa aplikab ak diskisyon',
      blocks: [
        {
          kind: 'p',
          text: "Kondisyon sa yo, selon rezidans itilizatè a, gouvène pa lwa Repiblik Dayiti, pa lwa Eta Florid (USA) pou itilizatè ki rete nan Etazini, epi pa règleman ewopeyen aplikab pou itilizatè nan Inyon Ewopeyen. Tout diskisyon ap fè yon esè pou rezolisyon anmiyab anvan, epi apre nan tribinal konpetan.",
        },
      ],
    },
    {
      id: 'contact',
      title: '14. Kontak',
      blocks: [
        { kind: 'p', text: 'Pou nenpòt kesyon sou Kondisyon sa yo :' },
        {
          kind: 'list',
          items: [
            `Imèl : ${COMMON.email}`,
            `Adrès postal : ${COMMON.addressUS}`,
            `Telefòn (USA) : ${COMMON.phoneUS}`,
            `Telefòn / WhatsApp (Ayiti) : ${COMMON.phoneHT}`,
          ],
        },
      ],
    },
  ],
  footerNote: `Pibliye pa ${COMMON.publisher} — ${COMMON.addressUS}.`,
};

const es: TermsContent = {
  title: 'Términos y Condiciones',
  lastUpdated: 'Última actualización: 16 de abril de 2026',
  intro:
    'Estos Términos y Condiciones ("Términos") rigen el acceso y uso del sitio web https://allianceshipping.company y de la aplicación móvil Alliance Shipping (en conjunto, el "Servicio"), editados por Alliance Shipping S.A. Al crear una cuenta o utilizar el Servicio, usted acepta estos Términos sin reservas.',
  tocLabel: 'Tabla de contenidos',
  sections: [
    {
      id: 'acceptance',
      title: '1. Aceptación',
      blocks: [
        {
          kind: 'p',
          text: 'Al acceder a la app móvil Alliance Shipping o al sitio web, declara haber leído, comprendido y aceptado estos Términos y nuestra Política de Privacidad. Si no los acepta, no utilice el Servicio.',
        },
      ],
    },
    {
      id: 'service',
      title: '2. Descripción del Servicio',
      blocks: [
        {
          kind: 'p',
          text: 'Alliance Shipping opera un servicio de envío de paquetes desde Estados Unidos hacia la República de Haití. Usted compra a vendedores estadounidenses usando la dirección de nuestro almacén en Miami; recibimos y pesamos sus paquetes y los enviamos a nuestros depósitos en Haití (Cabo Haitiano, Puerto Príncipe, Puerto de Paz) para su retiro por el destinatario.',
        },
      ],
    },
    {
      id: 'account',
      title: '3. Cuenta de usuario',
      blocks: [
        {
          kind: 'p',
          text: 'Se requiere una cuenta para usar el Servicio. Debe proporcionar información exacta, completa y actualizada. Es responsable exclusivo de la confidencialidad de sus credenciales y de cualquier actividad realizada bajo su cuenta. Avísenos inmediatamente en caso de uso no autorizado.',
        },
        {
          kind: 'list',
          items: [
            'Debe ser mayor de edad en su jurisdicción.',
            'Una cuenta por persona física o jurídica.',
            'Alliance Shipping se reserva el derecho de suspender o cancelar cuentas por infracción, fraude o actividad ilícita.',
          ],
        },
      ],
    },
    {
      id: 'package-requests',
      title: '4. Solicitudes de paquete y dirección de envío',
      blocks: [
        {
          kind: 'p',
          text: 'Cada paquete debe registrarse como una solicitud en el Servicio con el número de seguimiento del transportista original (UPS, USPS, FedEx, DHL, Amazon, etc.). Sin solicitud, el paquete no se vinculará a su cuenta y no se podrán enviar notificaciones.',
        },
        {
          kind: 'p',
          text: 'Utilice la siguiente dirección: 8298 Northwest 68th Street, Apt PQ-068508, Miami, Florida 33195, +1 (954) 607-8226. Su código de almacén (PQ-068508 o equivalente) debe aparecer en el campo Nombre o Apt/Suite.',
        },
      ],
    },
    {
      id: 'pricing',
      title: '5. Precios y pago',
      blocks: [
        {
          kind: 'p',
          text: 'Los costes de envío se calculan según peso, ciudad de destino y categoría del artículo (especiales, perfumes, electrónica, etc.). Puede aplicarse una tarifa fija de servicio por paquete. Los precios se muestran en dólares estadounidenses (USD).',
        },
        {
          kind: 'list',
          items: [
            'El pago se exige antes de enviar el paquete a Haití.',
            'Los aranceles los fijan las autoridades haitianas y pueden variar.',
            'Los medios de pago aceptados son los ofrecidos en el Servicio en el momento de la transacción.',
            'No hay reembolso sobre tarifas de servicio ya incurridas, salvo falta imputable a Alliance Shipping.',
          ],
        },
      ],
    },
    {
      id: 'shipping',
      title: '6. Envío y plazos',
      blocks: [
        {
          kind: 'p',
          text: 'Los plazos estimados son de 3 a 7 días hábiles tras la recepción en Miami, excepto artículos especiales que pueden requerir más tiempo. Los plazos son indicativos y no contractuales. Alliance Shipping no es responsable de retrasos por transportistas, aduanas, clima u otros eventos fuera de su control.',
        },
      ],
    },
    {
      id: 'prohibited',
      title: '7. Artículos prohibidos',
      blocks: [
        { kind: 'p', text: 'Queda estrictamente prohibido enviar a través de Alliance Shipping:' },
        {
          kind: 'list',
          items: [
            'Armas, municiones, explosivos, pirotecnia',
            'Drogas y sustancias ilícitas',
            'Materiales inflamables, corrosivos o radiactivos',
            'Animales vivos',
            'Divisas, cheques al portador, instrumentos monetarios',
            'Falsificaciones, artículos que infringen derechos de propiedad intelectual',
            'Cualquier artículo prohibido por la ley de EE. UU. o Haití',
          ],
        },
        {
          kind: 'p',
          text: 'Cualquier paquete con artículos prohibidos podrá ser confiscado, destruido o entregado a las autoridades competentes, sin reembolso ni compensación, con suspensión inmediata de la cuenta y, en su caso, acciones legales.',
        },
      ],
    },
    {
      id: 'liability',
      title: '8. Responsabilidad',
      blocks: [
        {
          kind: 'p',
          text: 'Alliance Shipping hace sus mejores esfuerzos para entregar los paquetes en buen estado y dentro de los plazos estimados. Nuestra responsabilidad se limita al valor declarado del paquete en el momento de la solicitud, dentro de los límites de seguro aplicables. No somos responsables de daños indirectos, lucro cesante ni daños consecuentes.',
        },
        { kind: 'p', text: 'Las reclamaciones deben enviarse por escrito en un plazo de 7 días tras la fecha de entrega prevista.' },
      ],
    },
    {
      id: 'ip',
      title: '9. Propiedad intelectual',
      blocks: [
        {
          kind: 'p',
          text: 'Todos los elementos del Servicio (logos, marcas, textos, imágenes, código) son propiedad exclusiva de Alliance Shipping o sus socios. Queda prohibida toda reproducción o uso no autorizado.',
        },
      ],
    },
    {
      id: 'termination',
      title: '10. Resolución',
      blocks: [
        {
          kind: 'p',
          text: `Puede eliminar su cuenta en cualquier momento desde la página /delete-account o escribiendo a ${COMMON.email}. Alliance Shipping puede resolver una cuenta por infracción grave, fraude o actividad ilícita. Algunas obligaciones (pago, confidencialidad, limitación de responsabilidad) sobreviven a la resolución.`,
        },
      ],
    },
    {
      id: 'privacy',
      title: '11. Datos personales',
      blocks: [
        {
          kind: 'p',
          text: 'El tratamiento de sus datos personales se describe en nuestra Política de Privacidad: https://allianceshipping.company/privacy-policy.',
        },
      ],
    },
    {
      id: 'modifications',
      title: '12. Cambios en los Términos',
      blocks: [
        {
          kind: 'p',
          text: 'Alliance Shipping se reserva el derecho de modificar los Términos en cualquier momento. Los cambios materiales se notificarán por email o en la app al menos 15 días antes de su entrada en vigor. El uso continuado del Servicio implica aceptación de los nuevos Términos.',
        },
      ],
    },
    {
      id: 'law',
      title: '13. Ley aplicable y controversias',
      blocks: [
        {
          kind: 'p',
          text: 'Estos Términos se rigen, según la residencia del usuario, por las leyes de la República de Haití, por la ley del Estado de Florida (USA) para usuarios en Estados Unidos y por los reglamentos europeos aplicables para usuarios en la Unión Europea. Cualquier disputa se someterá primero a un intento de resolución amistosa y, en su defecto, a los tribunales competentes.',
        },
      ],
    },
    {
      id: 'contact',
      title: '14. Contacto',
      blocks: [
        { kind: 'p', text: 'Para cualquier consulta sobre estos Términos:' },
        {
          kind: 'list',
          items: [
            `Email: ${COMMON.email}`,
            `Dirección postal: ${COMMON.addressUS}`,
            `Teléfono (USA): ${COMMON.phoneUS}`,
            `Teléfono / WhatsApp (Haití): ${COMMON.phoneHT}`,
          ],
        },
      ],
    },
  ],
  footerNote: `Publicado por ${COMMON.publisher} — ${COMMON.addressUS}.`,
};

export const termsContent: Record<Locale, TermsContent> = { fr, en, ht, es };

export function getTermsContent(locale: Locale): TermsContent {
  return termsContent[locale] ?? termsContent.en;
}
