# Alliance Shipping - Deployment Guide

This guide will help you deploy the Alliance Shipping website to production.

## Quick Deploy to Vercel (Recommended)

Vercel is the recommended platform for Next.js applications and offers the best performance.

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Alliance Shipping platform"
git remote add origin https://github.com/yourusername/alliance-shipping.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js settings
6. Click "Deploy"

**That's it!** Your site will be live in ~2 minutes.

### Step 3: Configure Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain (e.g., allianceshipping.com)
4. Follow DNS configuration instructions
5. Enable SSL (automatic with Vercel)

## Environment Variables

If you're using any APIs or services, set environment variables in Vercel:

1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add variables from `.env.example`
4. Redeploy for changes to take effect

## Alternative Deployment Options

### Netlify

```bash
npm install -g netlify-cli
netlify init
netlify deploy --prod
```

### AWS Amplify

1. Go to AWS Amplify Console
2. Connect your Git repository
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Deploy

### Docker (Self-hosted)

```bash
# Build
docker build -t alliance-shipping .

# Run
docker run -p 3000:3000 alliance-shipping
```

### Traditional Node.js Server

```bash
npm run build
npm start

# Or with PM2
pm2 start npm --name "alliance-shipping" -- start
```

## Pre-Deployment Checklist

- [ ] Update company information in `constants/index.ts`
- [ ] Replace placeholder images with real images
- [ ] Test all language translations
- [ ] Test contact form functionality
- [ ] Verify all social media links
- [ ] Check mobile responsiveness
- [ ] Run Lighthouse audit (aim for 90+ scores)
- [ ] Test package tracking feature
- [ ] Verify SEO meta tags
- [ ] Configure analytics (GA4, GTM)
- [ ] Set up error monitoring (Sentry)
- [ ] Configure email service for contact form
- [ ] Add real customer testimonials
- [ ] Update privacy policy and terms of service
- [ ] Set up SSL certificate
- [ ] Configure CDN for images
- [ ] Set up backup and monitoring

## Post-Deployment

### Monitor Performance

- Use [Google PageSpeed Insights](https://pagespeed.web.dev/)
- Check [GTmetrix](https://gtmetrix.com/)
- Monitor with Google Analytics
- Set up uptime monitoring

### SEO

- Submit sitemap to Google Search Console
- Submit to Bing Webmaster Tools
- Verify Open Graph tags
- Test rich snippets

### Security

- Enable HTTPS (automatic with Vercel/Netlify)
- Add security headers
- Set up WAF (Web Application Firewall)
- Regular dependency updates

## Continuous Deployment

With Vercel/Netlify, every push to `main` branch automatically deploys to production.

For staging environment:
- Create a `develop` branch
- Vercel/Netlify will create preview deployments automatically

## Rollback

In Vercel:
1. Go to "Deployments"
2. Find previous working deployment
3. Click "Promote to Production"

## Support

For deployment issues:
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Next.js: [nextjs.org/docs](https://nextjs.org/docs)

---

**Happy Deploying!** 🚀
