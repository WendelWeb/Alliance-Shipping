'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, AlertTriangle, MapPin, ArrowRight, Warehouse, Package, Plane } from 'lucide-react';
import { Container } from '@/components/Container';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useUser } from '@clerk/nextjs';

const WAREHOUSE_CODE = 'PQ-068508';
const WAREHOUSE_ADDRESS = '8298 Northwest 68th Street';
const WAREHOUSE_CITY = 'Miami';
const WAREHOUSE_STATE = 'Florida';
const WAREHOUSE_ZIP = '33195';

const DELIVERY_CITIES = [
  { name: 'Cap-Haïtien', color: 'from-blue-500 to-blue-600', dot: 'bg-blue-500' },
  { name: 'Port-au-Prince', color: 'from-emerald-500 to-emerald-600', dot: 'bg-emerald-500' },
  { name: 'Port-de-Paix', color: 'from-violet-500 to-violet-600', dot: 'bg-violet-500' },
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
    { label: sa.firstName, value: sa.exampleFirstName, highlight: WAREHOUSE_CODE },
    { label: sa.address, value: WAREHOUSE_ADDRESS },
    { label: sa.aptSuite, value: WAREHOUSE_CODE, isHighlight: true },
    { label: sa.city, value: WAREHOUSE_CITY },
    { label: sa.state, value: WAREHOUSE_STATE },
    { label: sa.zip, value: WAREHOUSE_ZIP, isLast: true },
  ];

  return (
    <section id="shipping-address" className="py-6 md:py-16 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-50/80 via-blue-50/40 to-transparent -z-10" />
      <div className="absolute inset-0 bg-[var(--theme-bg)] -z-20" />

      <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Main Card — "Shipping Label" style */}
          <div className="bg-[var(--theme-surface)] rounded-3xl border border-gray-200 shadow-xl overflow-hidden">

            {/* Header Banner */}
            <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-blue-500 px-4 sm:px-8 py-4 sm:py-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Warehouse className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                  {sa.title}
                </h2>
              </div>
              <p className="text-sm text-white/80 max-w-2xl">
                {sa.subtitle}
              </p>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">

                {/* Left: Code + Warning (2 cols) */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Code Display */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="text-center"
                  >
                    {/* Code */}
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">
                      {sa.codeTitle}
                    </p>
                    <div className="relative inline-block">
                      <div className="bg-gradient-to-br from-primary-50 to-blue-50 border-2 border-dashed border-primary-300 rounded-2xl px-6 py-4 sm:px-8 sm:py-5">
                        <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary-600 tracking-[0.15em] font-mono">
                          {WAREHOUSE_CODE}
                        </p>
                      </div>
                      <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-primary-400 rounded-full" />
                      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-primary-400 rounded-full" />
                      <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-primary-400 rounded-full" />
                      <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-primary-400 rounded-full" />
                    </div>

                    {/* Address */}
                    <div className="mt-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-primary-600" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Miami, Florida</span>
                      </div>
                      <p className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                        {WAREHOUSE_ADDRESS}
                      </p>
                      <p className="text-sm font-semibold text-gray-600 mt-0.5">
                        {WAREHOUSE_CITY}, {WAREHOUSE_STATE} {WAREHOUSE_ZIP}
                      </p>
                    </div>

                    <p className="text-sm text-gray-500 mt-3 max-w-xs mx-auto">
                      {sa.codeExplanation}
                    </p>
                    <button
                      onClick={handleCopyCode}
                      className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 border-2"
                      style={{
                        borderColor: codeCopied ? '#16a34a' : 'rgb(var(--primary-200, 191 219 254))',
                        backgroundColor: codeCopied ? '#f0fdf4' : 'transparent',
                        color: codeCopied ? '#16a34a' : 'rgb(var(--primary-600, 37 99 235))',
                      }}
                    >
                      {codeCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {codeCopied ? sa.copied : sa.copyCode}
                    </button>
                  </motion.div>

                  {/* Warning */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <div className="rounded-xl p-4 bg-amber-50 border border-amber-200">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-amber-700 mb-1">{sa.warningTitle}</p>
                          <p className="text-xs text-gray-600 leading-relaxed">{sa.warningText}</p>
                          <p className="text-xs font-semibold text-red-600 mt-1">{sa.warningDelay}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Vertical Divider (desktop) */}
                <div className="hidden lg:flex justify-center">
                  <div className="w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent" />
                </div>
                {/* Horizontal Divider (mobile) */}
                <div className="lg:hidden h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                {/* Right: Address Template (2 cols) */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                  className="lg:col-span-2"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-4 h-4 text-primary-600" />
                    <h3 className="text-base font-bold text-gray-900">
                      {sa.addressTitle}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    {sa.addressNote}
                  </p>

                  {/* Address Form Template */}
                  <div className="rounded-xl p-4 sm:p-5 bg-gray-50 border border-gray-200">
                    {addressFields.map((field, i) => (
                      <div key={i}>
                        <div className="flex items-baseline gap-3">
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 w-16 sm:w-20 flex-shrink-0 text-right">
                            {field.label}
                          </span>
                          <span className={`text-sm font-semibold ${field.isHighlight ? 'text-primary-600' : 'text-gray-800'}`}>
                            {field.value}
                            {field.highlight && (
                              <span className="font-black ml-1.5 text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded text-xs">
                                {field.highlight}
                              </span>
                            )}
                          </span>
                        </div>
                        {!field.isLast && (
                          <div className="h-px my-2.5 ml-[76px] sm:ml-[92px] bg-gray-200" />
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleCopyAddress}
                    className="w-full mt-4 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 text-sm"
                    style={{
                      backgroundColor: addressCopied ? '#16a34a' : 'rgb(var(--primary-600, 37 99 235))',
                    }}
                  >
                    {addressCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {addressCopied ? sa.addressCopied : sa.copyAddress}
                  </button>
                </motion.div>
              </div>
            </div>

            {/* Footer — Delivery Cities + CTA */}
            <div className="border-t border-gray-100 bg-gray-50/50 px-4 sm:px-8 py-4 sm:py-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Cities */}
                <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                  <div className="flex items-center gap-1.5 mr-2">
                    <Plane className="w-4 h-4 text-gray-400 rotate-90" />
                    <span className="text-sm font-bold text-gray-700">{sa.deliverTo}:</span>
                  </div>
                  {DELIVERY_CITIES.map((city) => (
                    <span
                      key={city.name}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-gray-200 text-gray-700"
                    >
                      <span className={`w-2 h-2 ${city.dot} rounded-full animate-pulse`} />
                      {city.name}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                {!isSignedIn && (
                  <a
                    href="/dashboard/request-package"
                    className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200 shadow-sm whitespace-nowrap"
                  >
                    {sa.ctaButton}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
