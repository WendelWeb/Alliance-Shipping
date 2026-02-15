'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Container } from '@/components/Container';
import { SectionTitle } from '@/components/SectionTitle';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useState } from 'react';
import { cn } from '@/lib/utils/cn';

export function FAQ() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 bg-[var(--theme-surface)]">
      <Container size="lg">
        <SectionTitle
          title={t.faq.title}
          subtitle={t.faq.subtitle}
        />

        <div className="max-w-3xl mx-auto space-y-3">
          {t.faq.items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.03 }}
              className={cn(
                'border rounded-xl overflow-hidden transition-all duration-300',
                openIndex === index
                  ? 'border-[var(--primary-300)] shadow-md'
                  : 'border-[var(--gray-200)] hover:border-[var(--primary-200)]'
              )}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center gap-3 text-left bg-[var(--theme-surface)] hover:bg-[var(--theme-bg)] transition-colors"
              >
                <div className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                  openIndex === index
                    ? 'bg-[var(--primary-100)] text-[var(--primary-600)]'
                    : 'bg-[var(--gray-100)] text-[var(--gray-400)]'
                )}>
                  <HelpCircle className="w-4 h-4" />
                </div>
                <span className={cn(
                  'font-semibold flex-1 transition-colors',
                  openIndex === index ? 'text-[var(--primary-700)]' : 'text-[var(--gray-900)]'
                )}>
                  {item.question}
                </span>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 text-[var(--gray-400)] flex-shrink-0 transition-transform duration-300',
                    openIndex === index && 'transform rotate-180 text-[var(--primary-500)]'
                  )}
                />
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 py-4 bg-[var(--theme-bg)] border-t border-[var(--gray-100)]">
                      <p className="text-[var(--gray-700)] leading-relaxed text-sm pl-11">
                        {item.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
