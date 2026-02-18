'use client';

import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Container } from '@/components/Container';
import { Shield } from 'lucide-react';
import { COMPANY_INFO } from '@/constants';
import { useTranslation } from '@/lib/i18n/useTranslation';

export default function PrivacyPolicyPage() {
  const { t } = useTranslation();
  const p = t.legal.privacy;

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
                <Shield className="w-8 h-8 text-primary-600" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 font-display">
                {p.title}
              </h1>
              <p className="text-gray-500">{p.lastUpdated}</p>
            </div>

            <div className="prose prose-lg max-w-none theme-card rounded-2xl p-6 md:p-10 shadow-sm">
              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">{p.s1Title}</h2>
                <p className="text-gray-600 leading-relaxed">{p.s1Text}</p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">{p.s2Title}</h2>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{p.s2Sub1}</h3>
                <p className="text-gray-600 leading-relaxed mb-3">{p.s2Text1}</p>
                <ul className="list-disc pl-6 text-gray-600 space-y-1">
                  {p.s2Items1.split('|').map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-4">{p.s2Sub2}</h3>
                <ul className="list-disc pl-6 text-gray-600 space-y-1">
                  {p.s2Items2.split('|').map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">{p.s3Title}</h2>
                <p className="text-gray-600 leading-relaxed mb-3">{p.s3Text}</p>
                <ul className="list-disc pl-6 text-gray-600 space-y-1">
                  {p.s3Items.split('|').map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">{p.s4Title}</h2>
                <p className="text-gray-600 leading-relaxed">{p.s4Text}</p>
                <ul className="list-disc pl-6 text-gray-600 space-y-1 mt-3">
                  {p.s4Items.split('|').map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">{p.s5Title}</h2>
                <p className="text-gray-600 leading-relaxed">{p.s5Text}</p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">{p.s6Title}</h2>
                <p className="text-gray-600 leading-relaxed">{p.s6Text}</p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">{p.s7Title}</h2>
                <p className="text-gray-600 leading-relaxed mb-3">{p.s7Text}</p>
                <ul className="list-disc pl-6 text-gray-600 space-y-1">
                  {p.s7Items.split('|').map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">{p.s8Title}</h2>
                <p className="text-gray-600 leading-relaxed">{p.s8Text}</p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">{p.s9Title}</h2>
                <p className="text-gray-600 leading-relaxed">{p.s9Text}</p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">{p.s10Title}</h2>
                <p className="text-gray-600 leading-relaxed">{p.s10Text}</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">{p.s11Title}</h2>
                <p className="text-gray-600 leading-relaxed">{p.s11Text}</p>
                <ul className="list-none pl-0 text-gray-600 mt-3 space-y-1">
                  <li><strong>Email:</strong> {COMPANY_INFO.email}</li>
                  <li><strong>Phone:</strong> {COMPANY_INFO.phone}</li>
                  <li><strong>WhatsApp:</strong> +509 4881 26-52</li>
                  <li><strong>US Phone:</strong> +1 (954) 607-8226</li>
                </ul>
              </section>
            </div>
          </motion.div>
        </Container>
      </main>
      <BottomNav />
    </div>
  );
}
