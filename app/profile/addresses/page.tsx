'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Container } from '@/components/Container';
import {
  ArrowLeft,
  Home,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Star,
  X,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useTheme } from '@/lib/themes/ThemeProvider';

interface Address {
  id: string;
  label: string;
  name: string;
  street: string;
  city: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const colors = theme.colors;
  const [addresses, setAddresses] = useState<Address[]>([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    name: '',
    street: '',
    city: 'Port-au-Prince',
    country: 'Haiti',
    phone: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingAddress) {
      setAddresses(
        addresses.map(addr =>
          addr.id === editingAddress.id
            ? { ...addr, ...formData }
            : addr
        )
      );
    } else {
      const newAddress: Address = {
        id: Date.now().toString(),
        ...formData,
        isDefault: addresses.length === 0,
      };
      setAddresses([...addresses, newAddress]);
    }

    setShowAddModal(false);
    setEditingAddress(null);
    setFormData({
      label: '',
      name: '',
      street: '',
      city: 'Port-au-Prince',
      country: 'Haiti',
      phone: '',
    });
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      name: address.name,
      street: address.street,
      city: address.city,
      country: address.country,
      phone: address.phone,
    });
    setShowAddModal(true);
  };

  const handleSetDefault = (id: string) => {
    setAddresses(
      addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingAddress(null);
    setFormData({
      label: '',
      name: '',
      street: '',
      city: 'Port-au-Prince',
      country: 'Haiti',
      phone: '',
    });
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

            <h1 className="text-3xl font-bold" style={{ color: colors.gray[900] }}>{t.profile.addresses.title}</h1>
            <p className="mt-2" style={{ color: colors.gray[600] }}>
              {t.profile.addresses.subtitle}
            </p>
          </div>

          {/* Addresses List */}
          <div className="space-y-4 mb-6">
            {addresses.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="theme-card rounded-2xl shadow-sm p-8 text-center"
              >
                <Home className="h-16 w-16 mx-auto mb-4" style={{ color: colors.gray[400] }} />
                <h3 className="text-xl font-bold mb-2" style={{ color: colors.gray[900] }}>
                  {t.profile.addresses.empty}
                </h3>
                <p className="mb-6" style={{ color: colors.gray[600] }}>
                  {t.profile.addresses.emptyDesc}
                </p>
              </motion.div>
            ) : (
              addresses.map((address, index) => (
                <motion.div
                  key={address.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="theme-card rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all"
                >
                  <div
                    className="h-2"
                    style={{
                      background: `linear-gradient(90deg, #10b981, #059669)`,
                    }}
                  />
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div
                          className="p-3 rounded-xl text-white"
                          style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                        >
                          <MapPin className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold" style={{ color: colors.gray[900] }}>
                              {address.label}
                            </h3>
                            {address.isDefault && (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full"
                                style={{
                                  backgroundColor: isDark ? '#14532d' : '#dcfce7',
                                  color: isDark ? '#bbf7d0' : '#166534',
                                }}
                              >
                                <Star className="h-3 w-3 fill-current" />
                                {t.profile.addresses.defaultBadge}
                              </span>
                            )}
                          </div>
                          <p className="font-medium mb-1" style={{ color: colors.gray[900] }}>{address.name}</p>
                          <p className="text-sm" style={{ color: colors.gray[600] }}>{address.street}</p>
                          <p className="text-sm" style={{ color: colors.gray[600] }}>
                            {address.city}, {address.country}
                          </p>
                          <p className="text-sm" style={{ color: colors.gray[600] }}>{address.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!address.isDefault && (
                          <button
                            onClick={() => handleSetDefault(address.id)}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: colors.gray[600] }}
                            title={t.profile.addresses.setDefault}
                          >
                            <Star className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(address)}
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: colors.gray[600] }}
                          title={t.profile.addresses.edit}
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(address.id)}
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: colors.gray[600] }}
                          title={t.profile.addresses.delete}
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

          {/* Add Address Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => {
              setEditingAddress(null);
              setShowAddModal(true);
            }}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.primary[800]})`,
            }}
          >
            <Plus className="h-5 w-5" />
            {t.profile.addresses.addAddress}
          </motion.button>
        </Container>
      </main>
      <BottomNav />

      {/* Add/Edit Address Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative rounded-3xl shadow-2xl max-w-md w-full my-8 overflow-hidden"
              style={{ backgroundColor: isDark ? colors.gray[100] : '#ffffff' }}
            >
              {/* Gradient Header */}
              <div
                className="relative px-6 py-5 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                }}
              >
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/10" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      {editingAddress ? t.profile.addresses.editAddress : t.profile.addresses.addAddress}
                    </h2>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 rounded-xl bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Label */}
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: colors.gray[700] }}>
                    {t.profile.addresses.addressLabel}
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder={t.profile.addresses.addressLabelPlaceholder}
                    required
                    className="w-full px-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all"
                    style={{
                      borderColor: colors.gray[200],
                      backgroundColor: isDark ? colors.gray[200] : colors.gray[50],
                      color: colors.gray[900],
                    }}
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: colors.gray[700] }}>
                    {t.profile.addresses.recipientName}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jean Dupont"
                    required
                    className="w-full px-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all"
                    style={{
                      borderColor: colors.gray[200],
                      backgroundColor: isDark ? colors.gray[200] : colors.gray[50],
                      color: colors.gray[900],
                    }}
                  />
                </div>

                {/* Street */}
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: colors.gray[700] }}>
                    {t.profile.addresses.street}
                  </label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    placeholder={t.profile.addresses.streetPlaceholder}
                    required
                    className="w-full px-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all"
                    style={{
                      borderColor: colors.gray[200],
                      backgroundColor: isDark ? colors.gray[200] : colors.gray[50],
                      color: colors.gray[900],
                    }}
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: colors.gray[700] }}>
                    {t.profile.addresses.city}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Port-au-Prince', 'Cap-Haitien', 'Port-de-Paix'].map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => setFormData({ ...formData, city })}
                        className="px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all"
                        style={{
                          borderColor: formData.city === city ? colors.primary[500] : colors.gray[200],
                          backgroundColor: formData.city === city
                            ? (isDark ? colors.primary[900] : colors.primary[50])
                            : 'transparent',
                          color: formData.city === city ? colors.primary[700] : colors.gray[600],
                        }}
                      >
                        {formData.city === city && (
                          <Check className="w-3.5 h-3.5 inline mr-1" style={{ color: colors.primary[600] }} />
                        )}
                        {city.split('-').pop()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: colors.gray[700] }}>
                    {t.profile.addresses.phone}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+509 1234 5678"
                    required
                    className="w-full px-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all"
                    style={{
                      borderColor: colors.gray[200],
                      backgroundColor: isDark ? colors.gray[200] : colors.gray[50],
                      color: colors.gray[900],
                    }}
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-3.5 border-2 font-bold rounded-xl transition-colors"
                    style={{
                      borderColor: colors.gray[300],
                      color: colors.gray[700],
                    }}
                  >
                    {t.profile.addresses.cancel}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3.5 text-white font-bold rounded-xl transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                    }}
                  >
                    {editingAddress ? t.profile.addresses.modify : t.profile.addresses.add}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
