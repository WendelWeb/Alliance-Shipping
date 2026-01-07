/**
 * Configuration des images pour chaque section
 * Le système détecte automatiquement si une section a 1 ou plusieurs images
 */

export interface SectionImages {
  folder: string;
  count: number;
  extension: 'jpg' | 'png' | 'jpeg';
  alt: string;
}

export const IMAGES_CONFIG: Record<string, SectionImages> = {
  hero: {
    folder: 'hero',
    count: 4, // hero-shipping.jpg, hero-shipping-1.jpg, hero-shipping-2.jpg, hero-shipping-3.jpg
    extension: 'jpg',
    alt: 'Professional international shipping - Modern cargo port with containers, ships, and logistics operations between USA and Haiti',
  },
  howItWorks: {
    folder: 'how-it-works',
    count: 5, // how-it-works-process.png to how-it-works-process-4.png
    extension: 'png',
    alt: 'Professional infographic showing the shipping process - Four connected steps: Customer at counter, Package on scale, Cargo plane/ship in transit, Happy recipient receiving package. Modern, clean design with USA and Haiti flags',
  },
  pricing: {
    folder: 'fees',
    count: 7, // 1.png to 7.png/jpeg
    extension: 'png',
    alt: 'Professional pricing illustration - Calculator with dollar signs, shipping boxes with price tags, cost breakdown chart showing $4/lb rate, transparent and trustworthy pricing',
  },
  delivery: {
    folder: 'delivery',
    count: 0, // À remplir quand les images sont ajoutées
    extension: 'png',
    alt: 'Modern map illustration showing shipping routes - Stylized map of USA (Miami) and Haiti with curved shipping route from Miami to Cap-Haïtien, pin markers and airplane icon',
  },
  testimonials: {
    folder: 'testimonials',
    count: 0, // À remplir quand les images sont ajoutées
    extension: 'jpg',
    alt: 'Professional customer testimonial portraits - Diverse, friendly customers (Haitian and American) with genuine smiles, professional attire, warm natural lighting, satisfied and trustworthy expressions',
  },
  faq: {
    folder: 'faq',
    count: 0, // À remplir quand les images sont ajoutées
    extension: 'png',
    alt: 'Modern customer support illustration - Friendly customer service representative with headset, speech bubbles with question marks, blue and white professional palette, diverse representation in modern office setting with FAQ icons',
  },
  tracking: {
    folder: 'tracking',
    count: 0, // À remplir quand les images sont ajoutées
    extension: 'png',
    alt: 'Modern package tracking interface - Clean UI/UX dashboard showing tracking timeline on phone/computer screen, map with delivery route, package location pins, blue interface with green success indicators, timeline checkpoints with delivery truck icon and estimated arrival time',
  },
  contact: {
    folder: 'contact',
    count: 0, // À remplir quand les images sont ajoutées
    extension: 'jpg',
    alt: 'Friendly customer service team illustration - Modern, welcoming customer service team at work with phones and computers helping customers, blue and white professional palette, diverse team with headsets in modern office, USA and Haiti flags visible',
  },
};

/**
 * Génère les chemins d'images pour une section donnée
 */
export function getImagePaths(section: keyof typeof IMAGES_CONFIG): string[] {
  const config = IMAGES_CONFIG[section];

  if (config.count === 0) {
    return [];
  }

  if (config.count === 1) {
    return [`/images/${config.folder}/1.${config.extension}`];
  }

  // Pour hero: hero-shipping.jpg, hero-shipping-1.jpg, etc.
  if (section === 'hero') {
    return [
      `/images/${config.folder}/hero-shipping.jpg`,
      `/images/${config.folder}/hero-shipping-1.jpg`,
      `/images/${config.folder}/hero-shipping-2.jpg`,
      `/images/${config.folder}/hero-shipping-3.jpg`,
    ];
  }

  // Pour how-it-works: how-it-works-process.png, how-it-works-process-1.png, etc.
  if (section === 'howItWorks') {
    return [
      `/images/${config.folder}/how-it-works-process.png`,
      `/images/${config.folder}/how-it-works-process-1.png`,
      `/images/${config.folder}/how-it-works-process-2.png`,
      `/images/${config.folder}/how-it-works-process-3.png`,
      `/images/${config.folder}/how-it-works-process-4.png`,
    ];
  }

  // Pour les autres (1.png, 2.png, etc.)
  return Array.from({ length: config.count }, (_, i) =>
    `/images/${config.folder}/${i + 1}.${config.extension}`
  );
}

/**
 * Vérifie si une section doit afficher un carousel (plusieurs images)
 */
export function shouldShowCarousel(section: keyof typeof IMAGES_CONFIG): boolean {
  return IMAGES_CONFIG[section].count > 1;
}
