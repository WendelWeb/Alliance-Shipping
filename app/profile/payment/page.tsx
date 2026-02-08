'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useTheme } from '@/lib/themes/ThemeProvider';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Container } from '@/components/Container';
import {
  ArrowLeft,
  Wallet,
  CreditCard,
  Smartphone,
  Check,
  Plus,
  Trash2,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface PaymentMethod {
  id: string;
  type: 'moncash' | 'natcash' | 'card';
  label: string;
  details: string;
  isDefault: boolean;
}

export default function PaymentPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const colors = theme.colors;
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'moncash',
      label: 'Moncash',
      details: '+509 1234 5678',
      isDefault: true,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState<'moncash' | 'natcash' | 'card'>('moncash');
  const [newMethodDetails, setNewMethodDetails] = useState('');

  const handleAddMethod = () => {
    if (!newMethodDetails.trim()) return;

    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: selectedType,
      label: selectedType === 'moncash' ? 'Moncash' : selectedType === 'natcash' ? 'Natcash' : 'Carte',
      details: newMethodDetails,
      isDefault: paymentMethods.length === 0,
    };

    setPaymentMethods([...paymentMethods, newMethod]);
    setShowAddModal(false);
    setNewMethodDetails('');
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(
      paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
  };

  const handleDelete = (id: string) => {
    setPaymentMethods(paymentMethods.filter(method => method.id !== id));
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'moncash':
      case 'natcash':
        return <Smartphone className="h-6 w-6" />;
      case 'card':
        return <CreditCard className="h-6 w-6" />;
      default:
        return <Wallet className="h-6 w-6" />;
    }
  };

  const getMethodColor = (type: string) => {
    switch (type) {
      case 'moncash':
        return 'from-red-500 to-red-600';
      case 'natcash':
        return 'from-blue-500 to-blue-600';
      case 'card':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="overflow-x-hidden">
      <Header />
      <main className="min-h-screen pb-32 pt-2 md:pt-4">
        <Container>
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 mb-4 transition-colors"
              style={{ color: colors.gray[600] }}
            >
              <ArrowLeft className="h-5 w-5" />
              {t.profile.backToProfile}
            </Link>

            <h1 className="text-3xl font-bold" style={{ color: colors.gray[900] }}>{t.profile.payment.title}</h1>
            <p className="mt-2" style={{ color: colors.gray[600] }}>
              {t.profile.payment.subtitle}
            </p>
          </div>

          {/* Payment Methods List */}
          <div className="space-y-4 mb-6">
            {paymentMethods.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="theme-card rounded-2xl shadow-sm p-8 text-center"
              >
                <Wallet className="h-16 w-16 mx-auto mb-4" style={{ color: colors.gray[400] }} />
                <h3 className="text-xl font-bold mb-2" style={{ color: colors.gray[900] }}>
                  {t.profile.payment.empty}
                </h3>
                <p className="mb-6" style={{ color: colors.gray[600] }}>
                  {t.profile.payment.emptyDesc}
                </p>
              </motion.div>
            ) : (
              paymentMethods.map((method, index) => (
                <motion.div
                  key={method.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="theme-card rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all"
                >
                  <div className={`h-2 bg-gradient-to-r ${getMethodColor(method.type)}`} />
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-3 bg-gradient-to-br ${getMethodColor(method.type)} rounded-xl text-white`}>
                          {getMethodIcon(method.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold" style={{ color: colors.gray[900] }}>
                              {method.label}
                            </h3>
                            {method.isDefault && (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full"
                                style={{
                                  backgroundColor: isDark ? '#14532d' : '#dcfce7',
                                  color: isDark ? '#bbf7d0' : '#166534'
                                }}
                              >
                                <Star className="h-3 w-3 fill-current" />
                                {t.profile.payment.defaultBadge}
                              </span>
                            )}
                          </div>
                          <p className="font-mono" style={{ color: colors.gray[600] }}>{method.details}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!method.isDefault && (
                          <button
                            onClick={() => handleSetDefault(method.id)}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: colors.gray[600] }}
                            title={t.profile.payment.setDefault}
                          >
                            <Star className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(method.id)}
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: colors.gray[600] }}
                          title={t.profile.payment.delete}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Add Payment Method Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setShowAddModal(true)}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />
            {t.profile.payment.addMethod}
          </motion.button>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 border-l-4 p-4 rounded-lg"
            style={{
              backgroundColor: isDark ? '#1e3a8a' : '#dbeafe',
              borderColor: isDark ? '#3b82f6' : '#2563eb'
            }}
          >
            <div className="flex items-start gap-3">
              <div style={{ color: isDark ? '#93c5fd' : '#2563eb' }}>ℹ️</div>
              <div className="text-sm" style={{ color: isDark ? '#dbeafe' : '#1e3a8a' }}>
                <p className="font-semibold mb-1">{t.profile.payment.acceptedMethods}</p>
                <ul className="list-disc list-inside space-y-1" style={{ color: isDark ? '#bfdbfe' : '#1e40af' }}>
                  <li>{t.profile.payment.moncashDesc}</li>
                  <li>{t.profile.payment.natcashDesc}</li>
                  <li>{t.profile.payment.cardDesc}</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </Container>
      </main>
      <BottomNav />

      {/* Add Payment Method Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="theme-card rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.gray[900] }}>
              {t.profile.payment.addMethod}
            </h2>

            {/* Payment Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3" style={{ color: colors.gray[700] }}>
                {t.profile.payment.paymentType}
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setSelectedType('moncash')}
                  className="p-4 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: selectedType === 'moncash' ? '#ef4444' : colors.gray[200],
                    backgroundColor: selectedType === 'moncash'
                      ? (isDark ? '#7f1d1d' : '#fee2e2')
                      : 'transparent'
                  }}
                >
                  <Smartphone
                    className="h-6 w-6 mx-auto mb-2"
                    style={{ color: selectedType === 'moncash' ? '#dc2626' : colors.gray[400] }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: selectedType === 'moncash'
                      ? (isDark ? '#fecaca' : '#7f1d1d')
                      : colors.gray[600]
                    }}
                  >
                    Moncash
                  </span>
                </button>

                <button
                  onClick={() => setSelectedType('natcash')}
                  className="p-4 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: selectedType === 'natcash' ? '#3b82f6' : colors.gray[200],
                    backgroundColor: selectedType === 'natcash'
                      ? (isDark ? '#1e3a8a' : '#dbeafe')
                      : 'transparent'
                  }}
                >
                  <Smartphone
                    className="h-6 w-6 mx-auto mb-2"
                    style={{ color: selectedType === 'natcash' ? '#2563eb' : colors.gray[400] }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: selectedType === 'natcash'
                      ? (isDark ? '#bfdbfe' : '#1e3a8a')
                      : colors.gray[600]
                    }}
                  >
                    Natcash
                  </span>
                </button>

                <button
                  onClick={() => setSelectedType('card')}
                  className="p-4 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: selectedType === 'card' ? '#a855f7' : colors.gray[200],
                    backgroundColor: selectedType === 'card'
                      ? (isDark ? '#581c87' : '#f3e8ff')
                      : 'transparent'
                  }}
                >
                  <CreditCard
                    className="h-6 w-6 mx-auto mb-2"
                    style={{ color: selectedType === 'card' ? '#9333ea' : colors.gray[400] }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: selectedType === 'card'
                      ? (isDark ? '#e9d5ff' : '#581c87')
                      : colors.gray[600]
                    }}
                  >
                    {t.profile.payment.card}
                  </span>
                </button>
              </div>
            </div>

            {/* Details Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: colors.gray[700] }}>
                {selectedType === 'card'
                  ? t.profile.payment.cardNumber
                  : t.profile.payment.phoneNumber}
              </label>
              <input
                type="text"
                value={newMethodDetails}
                onChange={(e) => setNewMethodDetails(e.target.value)}
                placeholder={
                  selectedType === 'card'
                    ? '1234 5678 9012 3456'
                    : '+509 1234 5678'
                }
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                style={{
                  borderColor: colors.gray[300],
                  backgroundColor: colors.gray[50],
                  color: colors.gray[900]
                }}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewMethodDetails('');
                }}
                className="flex-1 px-4 py-3 border-2 font-semibold rounded-xl transition-colors"
                style={{
                  borderColor: colors.gray[300],
                  color: colors.gray[700],
                  backgroundColor: 'transparent'
                }}
              >
                {t.profile.payment.cancel}
              </button>
              <button
                onClick={handleAddMethod}
                disabled={!newMethodDetails.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.profile.payment.add}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
