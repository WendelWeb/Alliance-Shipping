'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { ArrowRight, Package, Shield, Clock, DollarSign, Truck, MapPin, ShoppingCart } from 'lucide-react';
import { Container } from '@/components/Container';
import { ImageGallery } from '@/components/ImageGallery';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { usePricing } from '@/hooks/usePricing';
import { useEffect } from 'react';

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => {
    if (target >= 1000) return Math.floor(v).toLocaleString();
    if (target % 1 !== 0) return v.toFixed(1);
    return Math.floor(v).toString();
  });

  useEffect(() => {
    const controls = animate(count, target, { duration: 2, ease: 'easeOut' });
    return controls.stop;
  }, [count, target]);

  return (
    <span>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

export function Hero() {
  const { t } = useTranslation();
  const { pricing, primaryCity, loading } = usePricing();

  const stats = [
    { icon: Package, value: 50000, suffix: '+', label: t.hero.stats?.packagesLabel || 'Packages Delivered' },
    { icon: Shield, value: 99.5, suffix: '%', label: t.hero.stats?.clientsLabel || 'Happy Clients' },
    { icon: MapPin, value: 3, suffix: '', label: t.hero.stats?.citiesLabel || 'Cities Served' },
  ];

  return (
    <section className="relative pt-0.5 pb-10 md:pt-6 md:pb-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[var(--theme-bg)] -z-10" />

      {/* Decorative blobs */}
      <div className="absolute top-20 -right-20 md:right-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-20 -left-20 md:left-10 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-75" />

      <Container>
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--theme-surface)] rounded-full shadow-sm border border-gray-200 mb-2 sm:mb-4 mt-0">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-gray-700">
                  {t.hero.trustBadge}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 font-display leading-tight">
                {t.hero.title}
                <br />
                <span className="gradient-primary bg-clip-text text-transparent">
                  {t.hero.subtitle}
                </span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                {t.hero.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12">
                <a
                  href="/dashboard/request-package"
                  className="group inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 bg-primary-600 text-white hover:bg-primary-700 sm:text-lg px-7 py-3.5"
                >
                  {t.hero.ctaPrimary}
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="#tracking"
                  className="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 sm:text-lg px-7 py-3.5"
                >
                  {t.hero.ctaSecondary}
                </a>
              </div>

              {/* Purchase Assistance Hint */}
              <a
                href="https://wa.me/50948812652"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 mb-6 sm:mb-8 rounded-full bg-violet-50 border border-violet-200 hover:bg-violet-100 transition-colors group"
              >
                <ShoppingCart className="w-4 h-4 text-violet-600" />
                <span className="text-sm text-violet-700 font-medium">
                  {(t as any).purchaseAssistance?.heroBadge || 'No US card? We buy for you on any US site!'}
                </span>
                <ArrowRight className="w-3 h-3 text-violet-500 group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* Animated Stats */}
              <div className="grid grid-cols-3 gap-3 sm:gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="flex justify-center mb-1 sm:mb-2">
                      <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
                    </div>
                    <div className="text-lg sm:text-2xl font-bold text-gray-900">
                      <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-xs text-gray-600 leading-tight">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Content - Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <ImageGallery
                section="hero"
                className="w-full h-full"
                imageClassName="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-secondary-600/20 pointer-events-none" />

              {/* Floating card - Warehouse Address */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 2 }}
                className="absolute top-3 left-3 sm:top-4 sm:left-4 md:top-8 md:left-8 bg-[var(--theme-surface)] p-2 sm:p-2.5 md:p-4 rounded-lg sm:rounded-xl shadow-lg border border-gray-100"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <div className="text-xs md:text-sm font-semibold text-gray-900">
                    {t.hero.floatingCards?.warehouseLabel || 'Miami Warehouse'}
                  </div>
                </div>
                <div className="text-xs text-primary-600 font-bold mt-1">
                  PQ-068508
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  8298 NW 68th St, FL 33195
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  +1 (954) 607-8226
                </div>
              </motion.div>

              {/* Floating card - Route */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-8 md:right-8 bg-[var(--theme-surface)] p-2.5 md:p-4 rounded-xl shadow-lg border border-gray-100"
              >
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary-600" />
                  <div className="text-xs md:text-sm font-semibold text-gray-900">Miami → Haiti</div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {t.hero.floatingCards?.fastDelivery || 'Fast Delivery'} • 3-6 {t.pricing.days}
                </div>
              </motion.div>

              {/* Floating card - Pricing (dynamic from Drizzle) */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 md:bottom-8 md:left-8 bg-[var(--theme-surface)] p-2.5 md:p-4 rounded-xl shadow-lg border border-gray-100"
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <div className="text-xs md:text-sm font-semibold text-gray-900">
                    {loading ? '...' : `$${pricing.pricePerLb}`}{t.hero.floatingCards?.perLb || '/lb'}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {t.hero.floatingCards?.startingAt || 'Starting at'} • {primaryCity?.city || 'Cap-Haïtien'}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
