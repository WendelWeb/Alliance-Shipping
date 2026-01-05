# Alliance Shipping - Quick Start Guide

Get your Alliance Shipping platform up and running in 5 minutes!

## ⚡ Super Quick Start

```bash
# 1. Navigate to the project
cd alliance-shipping-web

# 2. Install dependencies
npm install

# 3. Run the development server
npm run dev

# 4. Open in browser
# Visit http://localhost:3000
```

**That's it!** The site is now running locally.

## 🎯 What You Get

A fully functional, enterprise-grade shipping platform with:

- ✅ **9 Complete Sections** - Ready to customize
- ✅ **4 Languages** - English, French, Creole, Spanish
- ✅ **Mobile-First Design** - Works on all devices
- ✅ **Professional Animations** - Smooth Framer Motion effects
- ✅ **SEO Optimized** - Ready for search engines
- ✅ **Type-Safe** - Full TypeScript support

## 📁 Quick File Reference

Need to update something? Here's where to look:

### Update Company Info
```
constants/index.ts
```
Change: phone, email, addresses, pricing, social links

### Update Text/Translations
```
lib/i18n/translations/en.ts  (English)
lib/i18n/translations/fr.ts  (French)
lib/i18n/translations/ht.ts  (Haitian Creole)
lib/i18n/translations/es.ts  (Spanish)
```

### Update Colors/Design
```
tailwind.config.ts          (Theme colors)
app/globals.css             (Global styles)
```

### Add/Remove Sections
```
app/page.tsx                (Main page structure)
sections/                   (Individual sections)
```

## 🎨 Customization Examples

### Change Primary Color

**File**: `tailwind.config.ts`

```typescript
primary: {
  500: '#3b82f6',  // Change this to your brand color
  600: '#2563eb',  // Darker shade
  // ...
}
```

### Update Pricing

**File**: `constants/index.ts`

```typescript
export const PRICING: PricingInfo = {
  serviceFee: 5,      // Change to your service fee
  pricePerLb: 4,      // Change to your price per pound
  // ...
}
```

### Add a New Location

**File**: `constants/index.ts`

```typescript
export const LOCATIONS: Location[] = [
  // ... existing locations
  {
    city: 'Your City',
    address: 'Your Address',
    country: 'USA', // or 'Haiti'
  },
]
```

### Change Hero Text

**File**: `lib/i18n/translations/en.ts`

```typescript
hero: {
  title: 'Your Custom Title',
  subtitle: 'Your Custom Subtitle',
  description: 'Your custom description',
  // ...
}
```

## 🖼️ Adding Images

### Replace Placeholder Images

1. Add your images to `public/images/`
2. Update image paths in components

**Example** in `sections/Hero.tsx`:

```tsx
<Image
  src="/images/hero-background.jpg"
  alt="Shipping containers"
  fill
  className="object-cover"
/>
```

### Use AI Image Prompts

Search the code for `AI IMAGE PROMPT` comments. These contain detailed prompts for generating professional images with AI tools like:
- DALL-E 3
- Midjourney
- Stable Diffusion

## 🚀 Deploy in 2 Minutes

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

Follow the prompts, and you're live!

### Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

## 🔧 Common Tasks

### Add a New Language

1. Create `lib/i18n/translations/[code].ts`
2. Copy structure from `en.ts`
3. Translate all strings
4. Add locale to `lib/i18n/config.ts`

### Change Font

**File**: `app/layout.tsx`

```typescript
import { YourFont } from 'next/font/google';

const yourFont = YourFont({ subsets: ['latin'] });
```

### Update Social Media Links

**File**: `constants/index.ts`

```typescript
export const SOCIAL_LINKS: SocialLink[] = [
  { name: 'Facebook', href: 'your-url', icon: 'Facebook' },
  // ... add or modify links
]
```

## 📱 Test Responsiveness

```bash
# Desktop
http://localhost:3000

# Mobile view
# Use browser dev tools (F12) → Toggle device toolbar

# Or test on real device
# Find your local IP: ipconfig (Windows) or ifconfig (Mac/Linux)
http://YOUR-IP:3000
```

## 🐛 Troubleshooting

### Port 3000 already in use?

```bash
# Use a different port
npm run dev -- -p 3001
```

### Dependencies not installing?

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors?

```bash
# Run type check
npm run type-check
```

### Build errors?

```bash
# Clean build
rm -rf .next
npm run build
```

## 📚 Learn More

- **Next.js**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Framer Motion**: https://www.framer.com/motion/
- **TypeScript**: https://www.typescriptlang.org/docs/

## 💡 Pro Tips

1. **Hot Reload**: Code changes auto-refresh the browser
2. **TypeScript**: Hover over variables in VS Code for type info
3. **Tailwind**: Use IntelliSense for class suggestions
4. **Translations**: Keep all languages in sync when adding new text
5. **Components**: Reuse components for consistency

## ✅ Next Steps

1. ✏️ Update company info in `constants/index.ts`
2. 🖼️ Add your images to `public/images/`
3. 📝 Customize text in translation files
4. 🎨 Adjust colors in `tailwind.config.ts`
5. 🚀 Deploy to Vercel

## 🆘 Need Help?

- Check `README.md` for detailed documentation
- See `NEXT_STEPS.md` for feature roadmap
- Read `DEPLOYMENT.md` for deployment guides

## 📞 Support

Built with ❤️ for Alliance Shipping

---

**Happy Coding!** 🎉
