'use client';

import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Container } from '@/components/Container';
import { Shield, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { getPrivacyContent, type Block } from '@/lib/legal/privacy-content';

function BlockRenderer({ block }: { block: Block }) {
  if (block.kind === 'p') {
    return <p className="text-gray-700 leading-relaxed mb-3">{block.text}</p>;
  }
  if (block.kind === 'h3') {
    return <h3 className="text-lg font-semibold text-gray-900 mt-5 mb-2">{block.text}</h3>;
  }
  return (
    <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-3">
      {block.items.map((item, i) => (
        <li key={i} className="leading-relaxed">{item}</li>
      ))}
    </ul>
  );
}

export default function PrivacyPolicyPage() {
  const { locale } = useTranslation();
  const c = getPrivacyContent(locale);

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
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
                <Shield className="w-8 h-8 text-primary-600" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 font-display">
                {c.title}
              </h1>
              <p className="text-gray-500">{c.lastUpdated}</p>
            </div>

            {/* App info card */}
            <div className="theme-card rounded-2xl p-5 md:p-6 shadow-sm mb-6">
              <h2 className="text-base font-bold text-gray-900 mb-3 uppercase tracking-wide">
                {c.appInfo.label}
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <dt className="text-gray-500">{c.appInfo.appNameLabel}</dt>
                  <dd className="text-gray-900 font-medium">{c.appInfo.appName}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">{c.appInfo.packageLabel}</dt>
                  <dd className="text-gray-900 font-mono text-xs break-all">{c.appInfo.packageId}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">{c.appInfo.publisherLabel}</dt>
                  <dd className="text-gray-900 font-medium">{c.appInfo.publisher}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">{c.appInfo.emailLabel}</dt>
                  <dd className="text-gray-900 font-medium break-all">
                    <a href={`mailto:${c.appInfo.email}`} className="text-primary-600 hover:underline">
                      {c.appInfo.email}
                    </a>
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-gray-500">{c.appInfo.addressLabel}</dt>
                  <dd className="text-gray-900 font-medium">{c.appInfo.address}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-gray-500">{c.appInfo.phoneLabel}</dt>
                  <dd className="text-gray-900 font-medium">{c.appInfo.phone}</dd>
                </div>
              </dl>
            </div>

            {/* Intro */}
            <div className="theme-card rounded-2xl p-5 md:p-6 shadow-sm mb-6">
              <p className="text-gray-700 leading-relaxed">{c.intro}</p>
            </div>

            {/* TOC */}
            <nav className="theme-card rounded-2xl p-5 md:p-6 shadow-sm mb-8" aria-label={c.tocLabel}>
              <h2 className="text-base font-bold text-gray-900 mb-3 uppercase tracking-wide">
                {c.tocLabel}
              </h2>
              <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                {c.sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="group flex items-start gap-1 text-gray-700 hover:text-primary-600 py-1"
                    >
                      <ChevronRight className="w-4 h-4 mt-0.5 text-gray-400 group-hover:text-primary-600 flex-shrink-0" />
                      <span className="leading-snug">{s.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            {/* Sections */}
            <article className="theme-card rounded-2xl p-6 md:p-10 shadow-sm space-y-10">
              {c.sections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-24">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                    {section.title}
                  </h2>
                  <div>
                    {section.blocks.map((block, i) => (
                      <BlockRenderer key={i} block={block} />
                    ))}
                  </div>
                </section>
              ))}

              <div className="pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 italic">{c.footerNote}</p>
              </div>
            </article>
          </motion.div>
        </Container>
      </main>
      <BottomNav />
    </div>
  );
}
