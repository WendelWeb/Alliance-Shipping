'use client';

import { motion } from 'framer-motion';
import { MapPin, Plane, Clock, DollarSign } from 'lucide-react';
import { Container } from '@/components/Container';
import { SectionTitle } from '@/components/SectionTitle';
import { ImageGallery } from '@/components/ImageGallery';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { usePricing } from '@/hooks/usePricing';
import { LOCATIONS } from '@/constants';

export function DeliveryTimeline() {
  const { t } = useTranslation();
  const { cities } = usePricing();

  const routeKeys = ['capHaitien', 'portAuPrince', 'portDePaix'] as const;
  const routeColors = [
    { bg: 'bg-primary-600', light: 'bg-primary-50', border: 'border-primary-200' },
    { bg: 'bg-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-200' },
    { bg: 'bg-violet-600', light: 'bg-violet-50', border: 'border-violet-200' },
  ];

  // Map route keys to city names for pricing lookup
  const routeCityMap: Record<string, string> = {
    capHaitien: 'Cap-Haïtien',
    portAuPrince: 'Port-au-Prince',
    portDePaix: 'Port-de-Paix',
  };

  return (
    <section id="locations" className="py-20 bg-[var(--theme-surface)]">
      <Container>
        <SectionTitle
          title={t.delivery.title}
          subtitle={t.delivery.subtitle}
        />

        {/* Active Routes */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {routeKeys.map((key, index) => {
            const route = (t.delivery as any).routes?.[key];
            const color = routeColors[index];
            const cityPricing = cities.find(c => c.city === routeCityMap[key]);

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className={`relative bg-[var(--theme-surface)] rounded-2xl border-2 ${color.border} overflow-hidden hover:shadow-xl transition-all duration-300`}
              >
                {/* Active Badge */}
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    {t.delivery.active || 'Active'}
                  </span>
                </div>

                {/* Route Icon */}
                <div className="p-6 pb-0">
                  <div className={`w-14 h-14 ${color.bg} rounded-2xl flex items-center justify-center mb-4`}>
                    <Plane className="w-7 h-7 text-white" />
                  </div>
                </div>

                {/* Route Details */}
                <div className="p-6 pt-3">
                  <div className="text-xs text-gray-500 mb-1">{t.delivery.from || 'From'}</div>
                  <div className="text-base font-bold text-gray-900 mb-3">{t.delivery.fromCity || 'Miami, USA'}</div>

                  <div className="flex items-center gap-2 my-2">
                    <div className={`h-0.5 flex-1 ${color.bg} opacity-30`} />
                    <Plane className={`w-4 h-4 text-gray-400 rotate-90`} />
                    <div className={`h-0.5 flex-1 ${color.bg} opacity-30`} />
                  </div>

                  <div className="text-xs text-gray-500 mb-1">{t.delivery.to || 'To'}</div>
                  <div className="text-base font-bold text-gray-900">{route?.to || key}</div>

                  {/* Delivery Time & Price */}
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{route?.duration || '3-6 days'}</span>
                    </div>
                    {cityPricing && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600">
                          ${cityPricing.serviceFee} + ${cityPricing.pricePerLb}/lb
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Locations Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-[var(--theme-surface)] rounded-2xl border border-gray-200 p-8"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {LOCATIONS.map((location, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-[var(--theme-bg)] rounded-xl border border-gray-200"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="font-bold text-sm text-gray-900">{location.city}</h4>
                  </div>
                  <p className="text-xs text-gray-500">{location.country}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Map Image */}
          <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden">
            <ImageGallery
              section="delivery"
              className="w-full h-full"
              imageClassName="object-contain"
            />
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
