'use client';

import { motion } from 'framer-motion';
import { Search, Package, Plane, CheckCircle, MapPin } from 'lucide-react';
import { Container } from '@/components/Container';
import { SectionTitle } from '@/components/SectionTitle';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ImageGallery } from '@/components/ImageGallery';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useState } from 'react';

export function Tracking() {
  const { t } = useTranslation();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isTracking, setIsTracking] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setIsTracking(true);
    // Simulate tracking
    setTimeout(() => setIsTracking(false), 1000);
  };

  const trackingSteps = [
    { icon: Package, label: t.tracking.status.pending, active: true },
    { icon: Plane, label: t.tracking.status['in-transit'], active: true },
    { icon: MapPin, label: t.tracking.status.customs, active: false },
    { icon: CheckCircle, label: t.tracking.status.delivered, active: false },
  ];

  return (
    <section id="tracking" className="section-padding bg-gradient-to-br from-primary-50 to-white">
      <Container size="lg">
        <SectionTitle
          title={t.tracking.title}
          subtitle={t.tracking.subtitle}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card padding="lg" className="max-w-2xl mx-auto">
            {/* Tracking Form */}
            <form onSubmit={handleTrack} className="mb-8">
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder={t.tracking.placeholder}
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none transition-colors"
                  />
                </div>
                <Button type="submit" size="lg" disabled={isTracking}>
                  <Search className="w-5 h-5 mr-2" />
                  {t.tracking.button}
                </Button>
              </div>
            </form>

            {/* Demo Tracking Timeline */}
            <div className="border-t pt-8">
              <h4 className="font-semibold text-gray-900 mb-6">
                Tracking Example: AS-2024-12345
              </h4>

              <div className="space-y-6">
                {trackingSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                        step.active
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      <step.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 pt-2">
                      <div
                        className={`font-semibold ${
                          step.active ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {step.label}
                      </div>
                      {step.active && (
                        <div className="text-sm text-gray-500 mt-1">
                          {index === 0 && 'December 15, 2024 - Miami, USA'}
                          {index === 1 && 'December 17, 2024 - In Transit'}
                        </div>
                      )}
                    </div>
                    {index < trackingSteps.length - 1 && (
                      <div
                        className={`absolute left-6 w-0.5 h-12 mt-12 ${
                          step.active ? 'bg-primary-600' : 'bg-gray-200'
                        }`}
                        style={{ marginLeft: '24px' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking Interface Illustration */}
            <div className="relative w-full h-64 mt-8 rounded-xl overflow-hidden">
              <ImageGallery
                section="tracking"
                className="w-full h-full"
                imageClassName="object-contain"
              />
            </div>
          </Card>
        </motion.div>
      </Container>
    </section>
  );
}
