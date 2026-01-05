'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { MapPin, Plane, Clock, Sparkles } from 'lucide-react';
import { Container } from '@/components/Container';
import { SectionTitle } from '@/components/SectionTitle';
import { Card } from '@/components/Card';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { LOCATIONS, COMING_SOON_LOCATIONS } from '@/constants';

export function DeliveryTimeline() {
  const { t } = useTranslation();

  return (
    <section id="locations" className="section-padding bg-white">
      <Container>
        <SectionTitle
          title={t.delivery.title}
          subtitle={t.delivery.subtitle}
        />

        {/* Current Active Route */}
        <div className="mb-12">
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {t.delivery.standard}
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <Card hover padding="lg" className="text-center border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-white">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plane className="w-10 h-10 text-white" />
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">From</div>
                  <div className="text-xl font-bold text-gray-900">{t.delivery.currentRoute.from}</div>
                </div>

                <div className="text-3xl font-bold text-primary-600">↓</div>

                <div>
                  <div className="text-sm text-gray-500 mb-1">To</div>
                  <div className="text-xl font-bold text-gray-900">{t.delivery.currentRoute.to}</div>
                </div>

                <div className="flex items-center justify-center gap-2 text-primary-600 font-bold text-lg pt-4 border-t border-gray-200">
                  <Clock className="w-6 h-6" />
                  <span>{t.delivery.currentRoute.duration}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Coming Soon Routes */}
        <div className="mb-12">
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              {t.delivery.comingSoon}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {t.delivery.comingSoonRoutes.map((route, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card padding="lg" className="text-center bg-gray-50 border-dashed border-2 border-gray-300 opacity-75">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plane className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{route.from}</div>
                  <div className="text-2xl font-bold text-gray-400 mb-2">↓</div>
                  <div className="text-sm text-gray-600 mb-4">{route.to}</div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                    <Sparkles className="w-3 h-3" />
                    {t.delivery.comingSoon}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Locations */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card padding="lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Our Locations
            </h3>

            {/* Active Locations */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {LOCATIONS.map((location, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-900">
                        {location.city}, {location.country}
                      </h4>
                      <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full font-semibold">
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{location.address}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Coming Soon Locations */}
            {COMING_SOON_LOCATIONS.length > 0 && (
              <>
                <div className="border-t border-gray-200 my-6" />
                <div className="grid md:grid-cols-2 gap-6">
                  {COMING_SOON_LOCATIONS.map((location, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg opacity-75"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-gray-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-700">
                            {location.city}, {location.country}
                          </h4>
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-semibold">
                            {t.delivery.comingSoon}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{location.address}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Delivery Route Map */}
            <div className="relative w-full h-64 md:h-80 mt-8">
              <Image
                src="/images/delivery-map.png"
                alt="Modern map illustration showing shipping routes - Stylized map of USA (Miami) and Haiti with curved shipping route from Miami to Cap-Haïtien, pin markers and airplane icon"
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>
          </Card>
        </motion.div>
      </Container>
    </section>
  );
}
