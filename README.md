# Alliance Shipping - Professional International Shipping Platform

A world-class, enterprise-grade web platform for **Alliance Shipping**, providing fast, reliable, and affordable shipping services between the USA and Haiti.

## Features

- **Next.js 15** - Latest version with App Router for optimal performance
- **TypeScript** - Type-safe codebase for reliability
- **Tailwind CSS** - Modern, responsive design system
- **Framer Motion** - Smooth, professional animations
- **Multilingual (i18n)** - Full support for 4 languages:
  - English (USA)
  - Français (France)
  - Kreyòl Ayisyen (Haiti)
  - Español (Dominican Republic)
- **SEO Optimized** - Meta tags, semantic HTML, performance optimized
- **Fully Responsive** - Mobile-first design
- **Accessibility** - WCAG compliant

## Tech Stack

- **Framework**: Next.js 15 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Fonts**: Inter, Poppins (Google Fonts)

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. Clone the repository or navigate to the project folder:

```bash
cd alliance-shipping-web
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

### Type Checking

```bash
npm run type-check
```

## Project Structure

```
alliance-shipping-web/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   ├── Button.tsx          # Reusable button component
│   ├── Card.tsx            # Card component
│   ├── Container.tsx       # Container wrapper
│   ├── Header.tsx          # Navigation header
│   ├── LanguageSwitcher.tsx # Language selector
│   └── SectionTitle.tsx    # Section title component
├── sections/
│   ├── Hero.tsx            # Hero section
│   ├── HowItWorks.tsx      # Process explanation
│   ├── Pricing.tsx         # Pricing information
│   ├── DeliveryTimeline.tsx # Delivery routes & locations
│   ├── Trust.tsx           # Trust indicators & testimonials
│   ├── FAQ.tsx             # Frequently asked questions
│   ├── Tracking.tsx        # Package tracking UI
│   ├── Contact.tsx         # Contact form & info
│   └── Footer.tsx          # Footer with links
├── lib/
│   ├── i18n/
│   │   ├── config.ts       # i18n configuration
│   │   ├── useTranslation.tsx # Translation hook
│   │   └── translations/   # Language files
│   │       ├── en.ts       # English
│   │       ├── fr.ts       # French
│   │       ├── ht.ts       # Haitian Creole
│   │       └── es.ts       # Spanish
│   └── utils/
│       └── cn.ts           # Class name utility
├── constants/
│   └── index.ts            # Company info, pricing, locations
├── types/
│   └── index.ts            # TypeScript interfaces
└── public/                 # Static assets (images, icons)
```

## Key Features

### 1. Hero Section
- Eye-catching hero with animated elements
- Call-to-action buttons
- Trust indicators
- Animated statistics

### 2. How It Works
- 4-step process explanation
- Visual icons and animations
- Clear, simple messaging

### 3. Transparent Pricing
- Interactive price calculator
- $5 service fee + $4/lb
- No hidden fees
- Special notes for perfumes (+5 days)

### 4. Delivery Timeline
- Route information (USA ↔ Haiti)
- Location details
- Estimated delivery times
- 4 locations: Miami, Port-au-Prince, Cap-Haïtien, Port-de-Paix

### 5. Trust & Reliability
- Company statistics
- Customer testimonials
- Security features
- Insurance information

### 6. FAQ Section
- Comprehensive Q&A
- Expandable accordion design
- Covers all common questions

### 7. Package Tracking
- Tracking number input
- Real-time status updates
- Visual timeline

### 8. Contact Section
- Contact form
- Company information
- Social media links (10+ platforms)
- Business hours

### 9. Multilingual Support
- Language switcher in header
- Seamless switching between 4 languages
- Persistent language selection

## Customization

### Adding New Languages

1. Create a new translation file in `lib/i18n/translations/[locale].ts`
2. Add the locale to `lib/i18n/config.ts`
3. Update the type in `types/index.ts`

### Updating Company Info

Edit `constants/index.ts` to update:
- Company contact information
- Locations
- Pricing
- Social media links
- Statistics

### Styling

- Global styles: `app/globals.css`
- Tailwind config: `tailwind.config.ts`
- Design tokens: CSS variables in `globals.css`

## AI Image Prompts

Throughout the codebase, you'll find detailed AI image generation prompts in comments. These prompts are designed for:
- Hero background image
- Section illustrations
- Icon sets
- Testimonial portraits
- And more

Search for `AI IMAGE PROMPT` in the code to find them.

## Performance Optimizations

- Image optimization with Next.js Image component
- Code splitting and lazy loading
- Optimized fonts with Google Fonts
- CSS purging with Tailwind
- Server-side rendering (SSR)
- Static generation where possible

## SEO Features

- Semantic HTML structure
- Meta tags optimized for search engines
- Open Graph tags for social sharing
- Twitter Card support
- Sitemap ready
- Robots.txt ready
- Structured data ready

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Other Platforms

This is a standard Next.js application and can be deployed to:
- Vercel
- Netlify
- AWS Amplify
- Google Cloud Run
- Any Node.js hosting

## Contributing

This is a production-ready, enterprise-grade project. All code follows best practices:
- TypeScript strict mode
- ESLint configuration
- Clean code principles
- Component-based architecture
- Responsive design patterns

## License

© 2024 Alliance Shipping. All rights reserved.

## Support

For support, email info@allianceshipping.com or call +509 4881 26-52
---

**Built with precision and care for Alliance Shipping** 🚢
