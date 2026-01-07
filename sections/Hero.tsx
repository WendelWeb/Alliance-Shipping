'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Package, Shield, Clock } from 'lucide-react';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { ImageGallery } from '@/components/ImageGallery';
import { useTranslation } from '@/lib/i18n/useTranslation';

export function Hero() {
  const { t } = useTranslation();

  const stats = [
    { icon: Package, label: '50,000+', sublabel: 'Packages Delivered' },
    { icon: Shield, label: '99.5%', sublabel: 'Success Rate' },
    { icon: Clock, label: '3-6', sublabel: 'Days Delivery' },
  ];

  return (
    <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 -z-10" />

      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-75" />

      <Container>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200 mb-6">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-gray-700">
                  {t.hero.trustBadge}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 font-display leading-tight">
                {t.hero.title}
                <br />
                <span className="gradient-primary bg-clip-text text-transparent">
                  {t.hero.subtitle}
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
                {t.hero.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button size="lg" className="group">
                  {t.hero.ctaPrimary}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button size="lg" variant="outline">
                  {t.hero.ctaSecondary}
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="flex justify-center mb-2">
                      <stat.icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stat.label}</div>
                    <div className="text-xs text-gray-600">{stat.sublabel}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Content - Image/Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
              {/* Hero Images Carousel */}
              <ImageGallery
                section="hero"
                className="w-full h-full"
                imageClassName="object-cover"
              />

              {/* Overlay gradient for better text visibility */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-secondary-600/20 pointer-events-none" />

              {/* Floating cards */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute top-8 right-8 bg-white p-4 rounded-xl shadow-lg"
              >
                <div className="text-sm font-semibold text-gray-900">Miami → Cap-Haïtien</div>
                <div className="text-xs text-gray-500">3-6 days</div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute bottom-8 left-8 bg-white p-4 rounded-xl shadow-lg"
              >
                <div className="text-sm font-semibold text-gray-900">$4/lb</div>
                <div className="text-xs text-gray-500">+ $5 service fee</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
