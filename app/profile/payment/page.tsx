'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  X,
} from 'lucide-react';
import Link from 'next/link';

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

  const getMethodGradient = (type: string) => {
    switch (type) {
      case 'moncash':
        return 'linear-gradient(135deg, #ef4444, #dc2626)';
      case 'natcash':
        return 'linear-gradient(135deg, #3b82f6, #2563eb)';
      case 'card':
        return 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
      default:
        return 'linear-gradient(135deg, #6b7280, #4b5563)';
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
                  <div className="h-2" style={{ background: getMethodGradient(method.type) }} />
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className="p-3 rounded-xl text-white"
                          style={{ background: getMethodGradient(method.type) }}
                        >
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
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.primary[800]})`,
            }}
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
              backgroundColor: isDark ? colors.primary[900] : colors.primary[50],
              borderColor: colors.primary[600],
            }}
          >
            <div className="flex items-start gap-3">
              <div style={{ color: colors.primary[600] }}>
                <Wallet className="w-5 h-5" />
              </div>
              <div className="text-sm" style={{ color: isDark ? colors.primary[100] : colors.primary[900] }}>
                <p className="font-semibold mb-1">{t.profile.payment.acceptedMethods}</p>
                <ul className="list-disc list-inside space-y-1" style={{ color: isDark ? colors.primary[200] : colors.primary[800] }}>
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
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => {
                setShowAddModal(false);
                setNewMethodDetails('');
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
              style={{ backgroundColor: isDark ? colors.gray[900] : '#ffffff' }}
            >
              {/* Gradient Header */}
              <div
                className="relative px-6 py-5 overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.primary[800]})`,
                }}
              >
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/10" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      {t.profile.payment.addMethod}
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setNewMethodDetails('');
                    }}
                    className="p-2 rounded-xl bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Payment Type Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-bold mb-3" style={{ color: colors.gray[700] }}>
                    {t.profile.payment.paymentType}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { type: 'moncash' as const, label: 'Moncash', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
                      { type: 'natcash' as const, label: 'Natcash', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
                      { type: 'card' as const, label: t.profile.payment.card, gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
                    ].map((item) => (
                      <button
                        key={item.type}
                        onClick={() => setSelectedType(item.type)}
                        className="p-4 rounded-xl border-2 transition-all"
                        style={{
                          borderColor: selectedType === item.type ? colors.primary[500] : colors.gray[200],
                          backgroundColor: selectedType === item.type
                            ? (isDark ? colors.primary[900] : colors.primary[50])
                            : 'transparent',
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center"
                          style={{
                            background: selectedType === item.type
                              ? item.gradient
                              : (isDark ? colors.gray[700] : colors.gray[100]),
                          }}
                        >
                          {item.type === 'card' ? (
                            <CreditCard className="h-5 w-5" style={{ color: selectedType === item.type ? '#fff' : colors.gray[400] }} />
                          ) : (
                            <Smartphone className="h-5 w-5" style={{ color: selectedType === item.type ? '#fff' : colors.gray[400] }} />
                          )}
                        </div>
                        <span
                          className="text-xs font-bold block text-center"
                          style={{ color: selectedType === item.type ? colors.primary[700] : colors.gray[600] }}
                        >
                          {item.label}
                        </span>
                        {selectedType === item.type && (
                          <div
                            className="w-5 h-5 rounded-full mx-auto mt-2 flex items-center justify-center"
                            style={{ backgroundColor: colors.primary[600] }}
                          >
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Details Input */}
                <div className="mb-6">
                  <label className="block text-sm font-bold mb-2" style={{ color: colors.gray[700] }}>
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
                    className="w-full px-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all"
                    style={{
                      borderColor: colors.gray[200],
                      backgroundColor: isDark ? colors.gray[800] : colors.gray[50],
                      color: colors.gray[900],
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
                    className="flex-1 px-4 py-3.5 border-2 font-bold rounded-xl transition-colors"
                    style={{
                      borderColor: colors.gray[300],
                      color: colors.gray[700],
                    }}
                  >
                    {t.profile.payment.cancel}
                  </button>
                  <button
                    onClick={handleAddMethod}
                    disabled={!newMethodDetails.trim()}
                    className="flex-1 px-4 py-3.5 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.primary[800]})`,
                    }}
                  >
                    {t.profile.payment.add}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
