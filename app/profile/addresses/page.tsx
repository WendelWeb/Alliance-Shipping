'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/useTranslation';

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
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      label: 'Domicile',
      name: 'Jean Dupont',
      street: 'Rue de la Paix 123',
      city: 'Port-au-Prince',
      country: 'Haïti',
      phone: '+509 1234 5678',
      isDefault: true,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    name: '',
    street: '',
    city: 'Port-au-Prince',
    country: 'Haïti',
    phone: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingAddress) {
      // Update existing address
      setAddresses(
        addresses.map(addr =>
          addr.id === editingAddress.id
            ? { ...addr, ...formData }
            : addr
        )
      );
    } else {
      // Add new address
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
      country: 'Haïti',
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

  return (
    <div className="overflow-x-hidden">
      <Header />
      <main className="min-h-screen pb-32 pt-2 md:pt-4 bg-gradient-to-br from-gray-50 via-white to-primary-50">
        <Container>
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              {t.profile.backToProfile}
            </Link>

            <h1 className="text-3xl font-bold text-gray-900">{t.profile.addresses.title}</h1>
            <p className="text-gray-600 mt-2">
              {t.profile.addresses.subtitle}
            </p>
          </div>

          {/* Addresses List */}
          <div className="space-y-4 mb-6">
            {addresses.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 p-8 text-center"
              >
                <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t.profile.addresses.empty}
                </h3>
                <p className="text-gray-600 mb-6">
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
                  className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 p-6 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white">
                        <MapPin className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            {address.label}
                          </h3>
                          {address.isDefault && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                              <Star className="h-3 w-3 fill-current" />
                              {t.profile.addresses.defaultBadge}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-900 font-medium mb-1">{address.name}</p>
                        <p className="text-gray-600 text-sm">{address.street}</p>
                        <p className="text-gray-600 text-sm">
                          {address.city}, {address.country}
                        </p>
                        <p className="text-gray-600 text-sm">{address.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!address.isDefault && (
                        <button
                          onClick={() => handleSetDefault(address.id)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title={t.profile.addresses.setDefault}
                        >
                          <Star className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(address)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={t.profile.addresses.edit}
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(address.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title={t.profile.addresses.delete}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
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
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />
            {t.profile.addresses.addAddress}
          </motion.button>
        </Container>
      </main>
      <BottomNav />

      {/* Add/Edit Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 my-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingAddress ? t.profile.addresses.editAddress : t.profile.addresses.addAddress}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Label */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.profile.addresses.addressLabel}
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder={t.profile.addresses.addressLabelPlaceholder}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.profile.addresses.recipientName}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Jean Dupont"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Street */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.profile.addresses.street}
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder={t.profile.addresses.streetPlaceholder}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.profile.addresses.city}
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="Port-au-Prince">Port-au-Prince</option>
                  <option value="Cap-Haïtien">Cap-Haïtien</option>
                  <option value="Port-de-Paix">Port-de-Paix</option>
                </select>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.profile.addresses.phone}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+509 1234 5678"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingAddress(null);
                    setFormData({
                      label: '',
                      name: '',
                      street: '',
                      city: 'Port-au-Prince',
                      country: 'Haïti',
                      phone: '',
                    });
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  {t.profile.addresses.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all"
                >
                  {editingAddress ? t.profile.addresses.modify : t.profile.addresses.add}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
