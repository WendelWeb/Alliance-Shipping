'use client';

import { motion } from 'framer-motion';
import { DollarSign, Clock, Check, AlertCircle } from 'lucide-react';
import { Container } from '@/components/Container';
import { SectionTitle } from '@/components/SectionTitle';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ImageGallery } from '@/components/ImageGallery';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { PRICING } from '@/constants';
import { useState } from 'react';

export function Pricing() {
  const { t } = useTranslation();
  const [weight, setWeight] = useState(10);

  const calculatedPrice = PRICING.serviceFee + weight * PRICING.pricePerLb;

  return (
    <section id="pricing" className="section-padding bg-gradient-to-br from-gray-50 to-white">
      <Container>
        <SectionTitle
          title={t.pricing.title}
          subtitle={t.pricing.subtitle}
        />

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Pricing Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card padding="lg" className="bg-gradient-to-br from-primary-500 to-primary-700 text-white border-0 shadow-2xl">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{t.pricing.title}</h3>
                <p className="text-primary-100">USA ↔ Haiti</p>
              </div>

              {/* Pricing Display */}
              <div className="space-y-6 mb-8">
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <span className="text-lg">{t.pricing.serviceFee}</span>
                  <span className="text-3xl font-bold">${PRICING.serviceFee}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <span className="text-lg">{t.pricing.perPound}</span>
                  <span className="text-3xl font-bold">${PRICING.pricePerLb}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <span className="text-lg">{t.pricing.deliveryTime}</span>
                  <span className="text-3xl font-bold">
                    {PRICING.standardDelivery.min}-{PRICING.standardDelivery.max} {t.pricing.days}
                  </span>
                </div>
              </div>

              {/* Price Calculator */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
                <label className="block text-sm font-medium mb-3">
                  {t.pricing.calculate}
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm">{weight} lbs</span>
                  <span className="text-2xl font-bold">${calculatedPrice}</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Features List */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                What's Included
              </h3>
              <p className="text-gray-600 mb-6">
                Every shipment includes these premium features at no extra cost.
              </p>
            </div>

            <div className="grid gap-4">
              {t.pricing.features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium">{feature}</span>
                </motion.div>
              ))}
            </div>

            <Button size="lg" fullWidth className="mt-8">
              Get Started Today
            </Button>

            {/* Pricing Illustration Carousel */}
            <div className="relative w-full h-64 mt-8 rounded-xl overflow-hidden">
              <ImageGallery
                section="pricing"
                className="w-full h-full"
                imageClassName="object-contain"
              />
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
