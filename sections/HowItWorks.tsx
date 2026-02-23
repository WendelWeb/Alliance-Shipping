'use client';

import { motion } from 'framer-motion';
import { UserPlus, FileText, Warehouse, Truck, ShoppingCart, ArrowRight } from 'lucide-react';
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
    <section id="services" className="py-6 md:py-16 bg-[var(--theme-surface)]">
      <Container>
        <SectionTitle
          title={t.howItWorks.title}
          subtitle={t.howItWorks.subtitle}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              className="relative"
            >
              <div className="bg-[var(--theme-surface)] rounded-2xl border border-gray-200 p-4 sm:p-5 lg:p-6 h-full hover:shadow-lg hover:border-primary-200 transition-all duration-300">
                {/* Step Number */}
                <div className="absolute -top-2.5 -left-1 w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br ${step.color} rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 shadow-md`}>
                  <step.icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 mb-1 sm:mb-2">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
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

        {/* Purchase Assistance Hint */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-6 text-center"
        >
          <a
            href="https://wa.me/50948812652"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-violet-50 border border-violet-200 hover:bg-violet-100 transition-colors group"
          >
            <ShoppingCart className="w-4 h-4 text-violet-600" />
            <span className="text-sm text-violet-700 font-medium">
              {(t as any).purchaseAssistance?.heroBadge || 'No US card? We buy for you on any US site!'}
            </span>
            <ArrowRight className="w-3 h-3 text-violet-500 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </motion.div>
      </Container>
    </section>
  );
}
