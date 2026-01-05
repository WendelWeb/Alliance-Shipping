export type Locale = 'en' | 'fr' | 'ht' | 'es';

export interface NavItem {
  label: string;
  href: string;
}

export interface SocialLink {
  name: string;
  href: string;
  icon: string;
}

export interface Location {
  city: string;
  address: string;
  country: 'USA' | 'Haiti';
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface PricingInfo {
  serviceFee: number;
  pricePerLb: number;
  standardDelivery: {
    min: number;
    max: number;
  };
  perfumeDelay: number;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  date: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface Step {
  id: number;
  title: string;
  description: string;
  icon: string;
}

export interface TrackingInfo {
  trackingNumber: string;
  status: 'pending' | 'in-transit' | 'customs' | 'delivered';
  currentLocation?: string;
  estimatedDelivery?: string;
  history: TrackingEvent[];
}

export interface TrackingEvent {
  date: string;
  status: string;
  location: string;
  description: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}
