'use client';

import { motion } from 'framer-motion';
import { UserPlus, FileText, Warehouse, Truck } from 'lucide-react';
import { Container } from '@/components/Container';
import { SectionTitle } from '@/components/SectionTitle';
import { useTranslation } from '@/lib/i18n/useTranslation';

export function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    {
      icon: UserPlus,
      title: t.howItWorks.steps[0].title,
      description: t.howItWorks.steps[0].description,
      color: 'from-blue-500 to-blue-600',
      lightBg: 'bg-blue-50',
    },
    {
      icon: FileText,
      title: t.howItWorks.steps[1].title,
      description: t.howItWorks.steps[1].description,
      color: 'from-purple-500 to-purple-600',
      lightBg: 'bg-purple-50',
    },
    {
      icon: Warehouse,
      title: t.howItWorks.steps[2].title,
      description: t.howItWorks.steps[2].description,
      color: 'from-orange-500 to-orange-600',
      lightBg: 'bg-orange-50',
    },
    {
      icon: Truck,
      title: t.howItWorks.steps[3].title,
      description: t.howItWorks.steps[3].description,
      color: 'from-green-500 to-green-600',
      lightBg: 'bg-green-50',
    },
  ];

  return (
    <section id="services" className="py-20 bg-[var(--theme-surface)]">
      <Container>
        <SectionTitle
          title={t.howItWorks.title}
          subtitle={t.howItWorks.subtitle}
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              className="relative"
            >
              <div className="bg-[var(--theme-surface)] rounded-2xl border border-gray-200 p-6 h-full hover:shadow-lg hover:border-primary-200 transition-all duration-300">
                {/* Step Number */}
                <div className="absolute -top-3 -left-1 w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`w-14 h-14 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-4 shadow-md`}>
                  <step.icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {step.description}
                </p>

                {/* Connector line (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <div className="w-6 h-0.5 bg-primary-300" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
