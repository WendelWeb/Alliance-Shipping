'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Mail,
  Phone,
  MessageCircle,
  Package,
  ExternalLink,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

interface TransferInfo {
  packageId: number;
  trackingNumber: string;
  userId: number;
  userName: string;
  userEmail: string;
  userPhone?: string | null;
  userWhatsappPhone?: string | null;
  userCity?: string | null;
  transferType: 'user_claimed' | 'admin_assigned';
  oldTotalCost: string;
  newTotalCost: string;
  packageCount?: number; // User's total package count
}

interface TransferSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  transfer: TransferInfo | null;
}

export default function TransferSuccessModal({
  isOpen,
  onClose,
  transfer,
}: TransferSuccessModalProps) {
  const [packageHistory, setPackageHistory] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (transfer && isOpen) {
      // Fetch user's package history
      setLoading(true);
      fetch(`/api/admin/users/${transfer.userId}/packages?limit=1`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setPackageHistory(data.pagination?.total || 0);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [transfer, isOpen]);

  if (!transfer) return null;

  const formatCurrency = (value: string) => `$${parseFloat(value).toFixed(2)}`;
  const delta = parseFloat(transfer.newTotalCost) - parseFloat(transfer.oldTotalCost);

  const handleEmailClick = () => {
    window.location.href = `mailto:${transfer.userEmail}`;
  };

  const handlePhoneClick = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleWhatsAppClick = (phone: string) => {
    // Remove all non-numeric characters
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const handleViewProfile = () => {
    window.open(`/admin/users/${transfer.userId}`, '_blank');
  };

  const handleViewPackage = () => {
    window.open(`/admin/packages`, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-full">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Transfert Réussi !</h2>
                    <p className="text-sm text-white/90 mt-1">
                      {transfer.transferType === 'user_claimed'
                        ? 'Colis réclamé par l\'utilisateur'
                        : 'Colis assigné avec succès'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info Card */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                      {transfer.userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                  </div>

                  {/* User Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {transfer.userName}
                    </h3>
                    {transfer.userCity && (
                      <p className="text-sm text-gray-600 mb-3">
                        📍 {transfer.userCity}
                      </p>
                    )}

                    {/* Contact Info */}
                    <div className="space-y-2">
                      {/* Email */}
                      <button
                        onClick={handleEmailClick}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                      >
                        <Mail className="h-4 w-4" />
                        {transfer.userEmail}
                      </button>

                      {/* Phone */}
                      {transfer.userPhone && (
                        <button
                          onClick={() => handlePhoneClick(transfer.userPhone!)}
                          className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 hover:underline transition-colors"
                        >
                          <Phone className="h-4 w-4" />
                          {transfer.userPhone}
                        </button>
                      )}

                      {/* WhatsApp */}
                      {transfer.userWhatsappPhone && (
                        <button
                          onClick={() => handleWhatsAppClick(transfer.userWhatsappPhone!)}
                          className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
                        >
                          <MessageCircle className="h-4 w-4" />
                          WhatsApp: {transfer.userWhatsappPhone}
                        </button>
                      )}
                    </div>

                    {/* Package Count */}
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
                      <Package className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {loading ? (
                          'Chargement...'
                        ) : (
                          `${packageHistory} colis total${packageHistory > 1 ? 'aux' : ''}`
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Package & Pricing Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tracking Number */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="text-xs text-blue-600 font-medium mb-1">Numéro de suivi</div>
                  <div className="text-lg font-bold text-blue-900">{transfer.trackingNumber}</div>
                </div>

                {/* Price Delta */}
                <div className={`rounded-lg p-4 border ${
                  delta > 0
                    ? 'bg-red-50 border-red-200'
                    : delta < 0
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className={`text-xs font-medium mb-1 ${
                    delta > 0 ? 'text-red-600' : delta < 0 ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    Changement de prix
                  </div>
                  <div className={`text-lg font-bold ${
                    delta > 0 ? 'text-red-900' : delta < 0 ? 'text-green-900' : 'text-gray-900'
                  }`}>
                    {formatCurrency(transfer.oldTotalCost)} → {formatCurrency(transfer.newTotalCost)}
                  </div>
                  <div className={`text-xs mt-1 font-medium ${
                    delta > 0 ? 'text-red-600' : delta < 0 ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {delta >= 0 ? '+' : ''}{formatCurrency(delta.toString())}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleViewProfile}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <User className="h-5 w-5" />
                  Voir le profil
                  <ExternalLink className="h-4 w-4" />
                </button>

                <button
                  onClick={handleViewPackage}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Package className="h-5 w-5" />
                  Voir le colis
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
