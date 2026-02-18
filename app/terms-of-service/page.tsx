'use client';

import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Container } from '@/components/Container';
import { FileText } from 'lucide-react';
import { COMPANY_INFO } from '@/constants';
import { useTranslation } from '@/lib/i18n/useTranslation';

export default function TermsOfServicePage() {
  const { t } = useTranslation();
  const s = t.legal.terms;

  const sections = [
    { title: s.s1Title, text: s.s1Text },
    { title: s.s2Title, text: s.s2Text },
    { title: s.s3Title, text: s.s3Text },
    { title: s.s4Title, text: s.s4Text },
    { title: s.s5Title, text: s.s5Text },
    { title: s.s6Title, text: s.s6Text },
    { title: s.s7Title, text: s.s7Text },
    { title: s.s8Title, text: s.s8Text },
    { title: s.s9Title, text: s.s9Text },
    { title: s.s10Title, text: s.s10Text },
  ];

  return (
    <div className="overflow-x-hidden">
      <Header />
      <main className="min-h-screen pb-32 pt-2 md:pt-4">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
                <FileText className="w-8 h-8 text-primary-600" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 font-display">
                {s.title}
              </h1>
              <p className="text-gray-500">{s.lastUpdated}</p>
            </div>

            <div className="prose prose-lg max-w-none theme-card rounded-2xl p-6 md:p-10 shadow-sm">
              {sections.map((section, i) => (
                <section key={i} className={i < sections.length - 1 ? 'mb-8' : ''}>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h2>
                  <p className="text-gray-600 leading-relaxed">{section.text}</p>
                </section>
              ))}
            </div>
          </motion.div>
        </Container>
      </main>
      <BottomNav />
    </div>
  );
}
