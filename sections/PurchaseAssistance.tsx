'use client';

import { motion } from 'framer-motion';
import { ShoppingCart, CreditCard, Globe, Send, Shield, Sparkles, ArrowRight } from 'lucide-react';
import { Container } from '@/components/Container';
import { SectionTitle } from '@/components/SectionTitle';
import { useTranslation } from '@/lib/i18n/useTranslation';

export function PurchaseAssistance() {
  const { t } = useTranslation();
  const pa = (t as any).purchaseAssistance || {};

  const steps = [
    {
      icon: Globe,
      title: pa.step1Title || 'Tell us what you want',
      description: pa.step1Desc || 'Send us the product link or describe what you\'re looking for',
      color: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-50',
    },
    {
      icon: ShoppingCart,
      title: pa.step2Title || 'We place the order',
      description: pa.step2Desc || 'Our team purchases the product with our US card and has it delivered to our Miami warehouse',
      color: 'from-violet-500 to-purple-600',
      iconBg: 'bg-violet-50',
    },
    {
      icon: Send,
      title: pa.step3Title || 'You receive it in Haiti',
      description: pa.step3Desc || 'The package is shipped to your city like all our other shipments',
      color: 'from-emerald-500 to-green-600',
      iconBg: 'bg-emerald-50',
    },
  ];

  const highlights = [
    { icon: Globe, label: pa.anySite || 'Any US website' },
    { icon: CreditCard, label: pa.noCard || 'No card required' },
    { icon: Shield, label: pa.secure || 'Secure payment' },
  ];

  return (
    <section className="py-8 md:py-16 bg-theme-bg relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
        backgroundSize: '40px 40px',
      }} />

      <Container>
        {/* Badge + Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6 md:mb-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-100 to-purple-100 border border-violet-200 mb-4"
          >
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-bold text-violet-700">
              {pa.badge || 'New Service'}
            </span>
          </motion.div>

          <SectionTitle
            title={pa.title || 'US Purchase Service'}
            subtitle={pa.subtitle || 'No US card? We buy for you!'}
          />
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl border overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.05), rgba(59,130,246,0.05))',
            borderColor: 'rgba(139,92,246,0.15)',
          }}
        >
          <div className="p-5 sm:p-8 lg:p-10">
            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center text-gray-600 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed"
            >
              {pa.description || 'Want to order from a US website but don\'t have a US bank card? No problem! Our team places the order for you on any American site.'}
            </motion.p>

            {/* 3 Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index + 0.3 }}
                  className="relative"
                >
                  <div className="bg-[var(--theme-surface)] rounded-2xl border border-gray-200 p-5 sm:p-6 h-full hover:shadow-lg hover:border-violet-200 transition-all duration-300 text-center">
                    {/* Step number */}
                    <div className="absolute -top-2.5 left-4 w-7 h-7 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg">
                      {index + 1}
                    </div>

                    {/* Icon */}
                    <div className={`w-14 h-14 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md`}>
                      <step.icon className="w-7 h-7 text-white" />
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow connector (desktop) */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-5 h-5 text-violet-400" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Highlight pills */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap justify-center gap-3 mb-8"
            >
              {highlights.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--theme-surface)] border border-gray-200 shadow-sm"
                >
                  <h.icon className="w-4 h-4 text-violet-600" />
                  <span className="text-sm font-medium text-gray-700">{h.label}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
              className="text-center"
            >
              <a
                href="https://wa.me/50948812652"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3 sm:px-8 sm:py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-sm sm:text-base shadow-lg hover:shadow-xl hover:from-violet-700 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <ShoppingCart className="w-5 h-5" />
                {pa.cta || 'Contact us to order'}
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
