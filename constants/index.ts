import { Location, PricingInfo, SocialLink } from '@/types';

export const COMPANY_INFO = {
  name: 'Alliance Shipping',
  tagline: {
    en: 'Fast Shipping from USA to Cap-Haïtien',
    fr: 'Expédition Rapide des USA vers Cap-Haïtien',
    ht: 'Transpò Rapid USA pou Okap',
    es: 'Envío Rápido de USA a Cabo Haitiano',
  },
  phone: '+1 (305) 555-0100',
  email: 'info@allianceshipping.com',
  whatsapp: '+15055550100',
};

export const LOCATIONS: Location[] = [
  {
    city: 'Miami',
    address: '8298 Northwest 68th Street, Miami, Florida 33195',
    country: 'USA',
    coordinates: {
      lat: 25.8890,
      lng: -80.3255,
    },
  },
  {
    city: 'Cap-Haïtien',
    address: 'Cap-Haïtien, Nord, Haïti',
    country: 'Haiti',
    coordinates: {
      lat: 19.7580,
      lng: -72.2015,
    },
  },
];

// Coming Soon Locations
export const COMING_SOON_LOCATIONS = [
  {
    city: 'Port-au-Prince',
    address: 'Port-au-Prince, Ouest, Haïti',
    country: 'Haiti',
  },
  {
    city: 'Port-de-Paix',
    address: 'Port-de-Paix, Nord-Ouest, Haïti',
    country: 'Haiti',
  },
];

export const PRICING: PricingInfo = {
  serviceFee: 5,
  pricePerLb: 4,
  standardDelivery: {
    min: 3,
    max: 6,
  },
  perfumeDelay: 5,
};

export const SOCIAL_LINKS: SocialLink[] = [
  { name: 'Facebook', href: 'https://facebook.com/allianceshipping', icon: 'Facebook' },
  { name: 'Instagram', href: 'https://instagram.com/allianceshipping', icon: 'Instagram' },
  { name: 'Twitter', href: 'https://twitter.com/allianceshipping', icon: 'Twitter' },
  { name: 'LinkedIn', href: 'https://linkedin.com/company/allianceshipping', icon: 'Linkedin' },
  { name: 'YouTube', href: 'https://youtube.com/@allianceshipping', icon: 'Youtube' },
  { name: 'TikTok', href: 'https://tiktok.com/@allianceshipping', icon: 'Music' },
  { name: 'WhatsApp', href: `https://wa.me/${COMPANY_INFO.whatsapp}`, icon: 'MessageCircle' },
  { name: 'Telegram', href: 'https://t.me/allianceshipping', icon: 'Send' },
  { name: 'Pinterest', href: 'https://pinterest.com/allianceshipping', icon: 'Pin' },
  { name: 'Reddit', href: 'https://reddit.com/r/allianceshipping', icon: 'Radio' },
];

export const PROHIBITED_ITEMS = {
  en: [
    'Weapons and ammunition',
    'Illegal drugs and narcotics',
    'Perishable food items',
    'Live animals',
    'Hazardous materials',
    'Counterfeit goods',
    'Flammable liquids (certain restrictions)',
  ],
  fr: [
    'Armes et munitions',
    'Drogues et stupéfiants illégaux',
    'Denrées périssables',
    'Animaux vivants',
    'Matières dangereuses',
    'Produits contrefaits',
    'Liquides inflammables (certaines restrictions)',
  ],
  ht: [
    'Zam ak minisyon',
    'Dwòg ilegal',
    'Manje ki pouri fasil',
    'Bèt vivan',
    'Materyèl danjere',
    'Pwodui kontrefè',
    'Likid flanmab (ak kèk restriksyon)',
  ],
  es: [
    'Armas y municiones',
    'Drogas ilegales',
    'Alimentos perecederos',
    'Animales vivos',
    'Materiales peligrosos',
    'Productos falsificados',
    'Líquidos inflamables (con ciertas restricciones)',
  ],
};

export const STATS = {
  yearsExperience: 15,
  packagesDelivered: 50000,
  satisfactionRate: 98,
  deliverySuccess: 99.5,
};
