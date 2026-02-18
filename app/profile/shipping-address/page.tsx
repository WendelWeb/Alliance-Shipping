'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Container } from '@/components/Container';
import { Card } from '@/components/Card';
import {
  ArrowLeft,
  Copy,
  Check,
  AlertTriangle,
  ShoppingCart,
  MapPin,
  Package,
  Truck,
  Phone,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useTheme } from '@/lib/themes/ThemeProvider';

const WAREHOUSE_CODE = 'PQ-068508';
const WAREHOUSE_ADDRESS = '8298 Northwest 68th Street';
const WAREHOUSE_CITY = 'Miami';
const WAREHOUSE_STATE = 'Florida';
const WAREHOUSE_ZIP = '33195';
const WAREHOUSE_PHONE = '+1 (954) 607-8226';

export default function ShippingAddressPage() {
  const router = useRouter();
  const { user } = useUser();
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const colors = theme.colors;

  const [codeCopied, setCodeCopied] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);

  const firstName = user?.firstName || 'John';
  const lastName = user?.lastName || 'Doe';

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(WAREHOUSE_CODE);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleCopyAddress = async () => {
    const copyText = `${firstName} ${WAREHOUSE_CODE}\n${WAREHOUSE_ADDRESS}\nApt: ${WAREHOUSE_CODE}\n${WAREHOUSE_CITY}, ${WAREHOUSE_STATE} ${WAREHOUSE_ZIP}`;
    await navigator.clipboard.writeText(copyText);
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 2000);
  };

  const steps = [
    { icon: ShoppingCart, text: t.profile.shippingAddress.step1 },
    { icon: MapPin, text: t.profile.shippingAddress.step2 },
    { icon: Package, text: t.profile.shippingAddress.step3 },
    { icon: Truck, text: t.profile.shippingAddress.step4 },
  ];

  return (
    <div className="overflow-x-hidden">
      <Header />
      <main className="min-h-screen pb-32 pt-2 md:pt-4">
        <Container>
          {/* Back Button & Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-6"
          >
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl transition-colors"
              style={{ backgroundColor: colors.gray[100] }}
            >
              <ArrowLeft className="w-5 h-5" style={{ color: colors.gray[700] }} />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: colors.gray[900] }}>
                {t.profile.shippingAddress.title}
              </h1>
              <p className="text-sm" style={{ color: colors.gray[600] }}>
                {t.profile.shippingAddress.cardSubtitle}
              </p>
            </div>
          </motion.div>

          {/* Code Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Card className="p-6 sm:p-8 text-center">
              <p className="text-sm font-semibold mb-2" style={{ color: colors.gray[600] }}>
                {t.profile.shippingAddress.yourCode}
              </p>
              <p className="text-3xl sm:text-4xl font-bold tracking-widest mb-2" style={{ color: colors.primary[600] }}>
                {WAREHOUSE_CODE}
              </p>
              <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: colors.gray[500] }}>
                {t.profile.shippingAddress.codeExplanation}
              </p>
              <button
                onClick={handleCopyCode}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all"
                style={{
                  backgroundColor: codeCopied
                    ? (isDark ? colors.gray[200] : '#f0fdf4')
                    : (isDark ? colors.gray[200] : colors.primary[50]),
                  color: codeCopied ? '#16a34a' : colors.primary[600],
                }}
              >
                {codeCopied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {codeCopied ? t.profile.shippingAddress.copied : t.profile.shippingAddress.copyCode}
              </button>
            </Card>
          </motion.div>

          {/* Address Template */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <Card className="p-6 sm:p-8">
              <h2 className="text-lg font-bold mb-1" style={{ color: colors.gray[900] }}>
                {t.profile.shippingAddress.addressTemplate}
              </h2>
              <p className="text-sm mb-6" style={{ color: colors.gray[500] }}>
                {t.profile.shippingAddress.templateNote}
              </p>

              <div
                className="rounded-xl p-5 sm:p-6 mb-6"
                style={{
                  backgroundColor: isDark ? colors.gray[100] : colors.primary[50],
                  border: `1.5px dashed ${isDark ? colors.gray[300] : colors.primary[100]}`,
                }}
              >
                {[
                  { label: t.profile.shippingAddress.lastName, value: lastName },
                  { label: t.profile.shippingAddress.firstName, value: firstName, highlight: WAREHOUSE_CODE },
                  { label: t.profile.shippingAddress.address, value: WAREHOUSE_ADDRESS },
                  { label: t.profile.shippingAddress.aptSuite, value: WAREHOUSE_CODE, isHighlight: true },
                  { label: t.profile.shippingAddress.city, value: WAREHOUSE_CITY },
                  { label: t.profile.shippingAddress.state, value: WAREHOUSE_STATE },
                  { label: t.profile.shippingAddress.zip, value: WAREHOUSE_ZIP },
                  { label: t.profile.shippingAddress.phone || 'Phone', value: WAREHOUSE_PHONE, isLast: true },
                ].map((field, i) => (
                  <div key={i}>
                    <p className="text-[11px] uppercase tracking-wider font-medium mb-0.5" style={{ color: colors.gray[500] }}>
                      {field.label}
                    </p>
                    <p className="text-[15px] font-semibold mb-3" style={{ color: field.isHighlight ? colors.primary[600] : colors.gray[900] }}>
                      {field.value}
                      {field.highlight && (
                        <span className="font-bold ml-1" style={{ color: colors.primary[600] }}>
                          {field.highlight}
                        </span>
                      )}
                    </p>
                    {!field.isLast && (
                      <div className="h-px mb-3" style={{ backgroundColor: isDark ? colors.gray[300] : colors.primary[100] }} />
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleCopyAddress}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all"
                style={{
                  backgroundColor: addressCopied ? '#16a34a' : colors.primary[600],
                }}
              >
                {addressCopied ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
                {addressCopied ? t.profile.shippingAddress.addressCopied : t.profile.shippingAddress.copyAddress}
              </button>
            </Card>
          </motion.div>

          {/* Warning */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <div
              className="rounded-xl p-5 sm:p-6"
              style={{
                backgroundColor: isDark ? colors.gray[200] : '#fefce8',
                border: `1px solid ${isDark ? colors.gray[300] : '#fef08a'}`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5" style={{ color: '#ca8a04' }} />
                <h3 className="font-bold text-[15px]" style={{ color: '#ca8a04' }}>
                  {t.profile.shippingAddress.warningTitle}
                </h3>
              </div>
              <p className="text-sm mb-1" style={{ color: isDark ? colors.gray[600] : colors.gray[700] }}>
                {t.profile.shippingAddress.warningCodeRequired}
              </p>
              <p className="text-sm font-bold mb-2" style={{ color: colors.gray[900] }}>
                {t.profile.shippingAddress.warningIdentification}
              </p>
              <p className="text-sm" style={{ color: '#dc2626' }}>
                {t.profile.shippingAddress.warningDelay}
              </p>
            </div>
          </motion.div>

          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 sm:p-8">
              <h2 className="text-lg font-bold mb-6" style={{ color: colors.gray[900] }}>
                {t.profile.shippingAddress.howItWorks}
              </h2>
              <div className="space-y-0">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={index}>
                      <div className="flex items-center gap-4">
                        <div className="relative flex-shrink-0">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: isDark ? colors.gray[200] : colors.primary[50] }}
                          >
                            <Icon className="w-5 h-5" style={{ color: colors.primary[600] }} />
                          </div>
                          <span
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center"
                            style={{
                              backgroundColor: isDark ? colors.gray[300] : colors.primary[100],
                              color: colors.primary[600],
                            }}
                          >
                            {index + 1}
                          </span>
                        </div>
                        <p className="text-sm font-medium flex-1" style={{ color: colors.gray[700] }}>
                          {step.text}
                        </p>
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className="w-0.5 h-4 ml-5 my-1"
                          style={{ backgroundColor: isDark ? colors.gray[300] : colors.primary[100] }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        </Container>
      </main>
      <BottomNav />
    </div>
  );
}
