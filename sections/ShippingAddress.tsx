'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, AlertTriangle, MapPin, ArrowRight, Warehouse } from 'lucide-react';
import { Container } from '@/components/Container';
import { SectionTitle } from '@/components/SectionTitle';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useUser } from '@clerk/nextjs';

const WAREHOUSE_CODE = 'PQ-068508';
const WAREHOUSE_ADDRESS = '8298 Northwest 68th Street';
const WAREHOUSE_CITY = 'Miami';
const WAREHOUSE_STATE = 'Florida';
const WAREHOUSE_ZIP = '33195';

const DELIVERY_CITIES = [
  { name: 'Cap-Haïtien', color: 'bg-primary-600' },
  { name: 'Port-au-Prince', color: 'bg-emerald-600' },
  { name: 'Port-de-Paix', color: 'bg-violet-600' },
];

export function ShippingAddress() {
  const { t } = useTranslation();
  const { isSignedIn } = useUser();
  const [codeCopied, setCodeCopied] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);

  const sa = t.landing.shippingAddress;

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(WAREHOUSE_CODE);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleCopyAddress = async () => {
    const text = `${sa.exampleLastName}\n${sa.exampleFirstName} ${WAREHOUSE_CODE}\n${WAREHOUSE_ADDRESS}\nApt: ${WAREHOUSE_CODE}\n${WAREHOUSE_CITY}, ${WAREHOUSE_STATE} ${WAREHOUSE_ZIP}`;
    await navigator.clipboard.writeText(text);
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 2000);
  };

  const addressFields = [
    { label: sa.lastName, value: sa.exampleLastName },
    { label: sa.firstName, value: `${sa.exampleFirstName}`, highlight: WAREHOUSE_CODE },
    { label: sa.address, value: WAREHOUSE_ADDRESS },
    { label: sa.aptSuite, value: WAREHOUSE_CODE, isHighlight: true },
    { label: sa.city, value: WAREHOUSE_CITY },
    { label: sa.state, value: WAREHOUSE_STATE },
    { label: sa.zip, value: WAREHOUSE_ZIP, isLast: true },
  ];

  return (
    <section id="shipping-address" className="py-16 md:py-20 relative overflow-hidden">
      {/* Subtle gradient background to distinguish this section */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/60 via-blue-50/40 to-transparent -z-10" />
      <div className="absolute inset-0 bg-[var(--theme-bg)] -z-20" />

      <Container>
        <SectionTitle
          title={sa.title}
          subtitle={sa.subtitle}
        />

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Column: Code + Warning + CTA */}
          <div className="space-y-6">
            {/* Code Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-[var(--theme-surface)] rounded-2xl border border-gray-200 p-6 sm:p-8 text-center shadow-sm">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-100 mb-4">
                  <Warehouse className="w-7 h-7 text-primary-600" />
                </div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {sa.codeTitle}
                </p>
                <p className="text-3xl sm:text-4xl font-bold text-primary-600 tracking-widest mb-2">
                  {WAREHOUSE_CODE}
                </p>
                <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                  {sa.codeExplanation}
                </p>
                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
                  style={{
                    backgroundColor: codeCopied ? '#f0fdf4' : 'rgb(var(--primary-50, 239 246 255))',
                    color: codeCopied ? '#16a34a' : 'rgb(var(--primary-600, 37 99 235))',
                  }}
                >
                  {codeCopied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {codeCopied ? sa.copied : sa.copyCode}
                </button>
              </div>
            </motion.div>

            {/* Warning Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="rounded-2xl p-5 sm:p-6 bg-yellow-50 border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-bold text-[15px] text-yellow-700">
                    {sa.warningTitle}
                  </h3>
                </div>
                <p className="text-sm text-gray-700 mb-1">
                  {sa.warningText}
                </p>
                <p className="text-sm font-semibold text-red-600">
                  {sa.warningDelay}
                </p>
              </div>
            </motion.div>

            {/* CTA - only show for non-authenticated users */}
            {!isSignedIn && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center lg:text-left"
              >
                <p className="text-sm text-gray-500 mb-3">{sa.ctaText}</p>
                <a
                  href="/dashboard/request-package"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-white px-8 py-3.5 bg-primary-600 hover:bg-primary-700 transition-all duration-200 shadow-lg shadow-primary-600/20"
                >
                  {sa.ctaButton}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </motion.div>
            )}
          </div>

          {/* Right Column: Address Template */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="bg-[var(--theme-surface)] rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {sa.addressTitle}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {sa.addressNote}
              </p>

              {/* Address Template Box */}
              <div className="rounded-xl p-5 sm:p-6 mb-6 bg-primary-50 border-2 border-dashed border-primary-200">
                {addressFields.map((field, i) => (
                  <div key={i}>
                    <p className="text-[11px] uppercase tracking-wider font-medium text-gray-500 mb-0.5">
                      {field.label}
                    </p>
                    <p className={`text-[15px] font-semibold mb-3 ${field.isHighlight ? 'text-primary-600' : 'text-gray-900'}`}>
                      {field.value}
                      {field.highlight && (
                        <span className="font-bold ml-1 text-primary-600">
                          {field.highlight}
                        </span>
                      )}
                    </p>
                    {!field.isLast && (
                      <div className="h-px mb-3 bg-primary-100" />
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleCopyAddress}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 shadow-md"
                style={{
                  backgroundColor: addressCopied ? '#16a34a' : 'rgb(var(--primary-600, 37 99 235))',
                }}
              >
                {addressCopied ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
                {addressCopied ? sa.addressCopied : sa.copyAddress}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Delivery Cities Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12"
        >
          <h3 className="text-center text-lg font-bold text-gray-900 mb-6">
            {sa.deliverTo}
          </h3>
          <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto">
            {DELIVERY_CITIES.map((city, index) => (
              <motion.div
                key={city.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.35 + index * 0.1 }}
                className="bg-[var(--theme-surface)] rounded-xl border border-gray-200 p-3 sm:p-4 text-center hover:shadow-md transition-shadow duration-200"
              >
                <div className={`w-10 h-10 ${city.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-bold text-gray-900">{city.name}</p>
                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-green-600">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  Active
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
