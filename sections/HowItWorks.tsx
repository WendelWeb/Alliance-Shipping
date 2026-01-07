'use client';

import { motion } from 'framer-motion';
import { Package, Scale, Truck, CheckCircle } from 'lucide-react';
import { Container } from '@/components/Container';
import { SectionTitle } from '@/components/SectionTitle';
import { Card } from '@/components/Card';
import { ImageGallery } from '@/components/ImageGallery';
import { useTranslation } from '@/lib/i18n/useTranslation';

export function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    {
      icon: Package,
      title: t.howItWorks.steps[0].title,
      description: t.howItWorks.steps[0].description,
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Scale,
      title: t.howItWorks.steps[1].title,
      description: t.howItWorks.steps[1].description,
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: Truck,
      title: t.howItWorks.steps[2].title,
      description: t.howItWorks.steps[2].description,
      color: 'from-orange-500 to-orange-600',
    },
    {
      icon: CheckCircle,
      title: t.howItWorks.steps[3].title,
      description: t.howItWorks.steps[3].description,
      color: 'from-green-500 to-green-600',
    },
  ];

  return (
    <section id="services" className="section-padding bg-white">
      <Container>
        <SectionTitle
          title={t.howItWorks.title}
          subtitle={t.howItWorks.subtitle}
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card hover className="relative h-full">
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {index + 1}
                </div>

                {/* Icon */}
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}
                >
                  <step.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>

                {/* Arrow connector (hidden on last item and mobile) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <svg
                      className="w-8 h-8 text-primary-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Process Illustration Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16"
        >
          <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-gray-50 to-white">
            <ImageGallery
              section="howItWorks"
              className="w-full h-full"
              imageClassName="object-contain"
            />
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
