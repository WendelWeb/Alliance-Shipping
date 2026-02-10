'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, XCircle, X } from 'lucide-react';

interface ConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflictType: 'same_user' | 'other_user_request' | 'package_claimed';
  trackingNumber: string;
  existingData?: {
    id?: number;
    status?: string;
    createdAt?: string;
  };
}

export default function PackageConflictModal({
  isOpen,
  onClose,
  conflictType,
  trackingNumber,
  existingData,
}: ConflictModalProps) {
  const getContent = () => {
    switch (conflictType) {
      case 'same_user':
        return {
          icon: <AlertCircle className="h-12 w-12 text-yellow-500" />,
          title: 'Demande Déjà Effectuée',
          message: `Vous avez déjà fait une demande pour le colis ${trackingNumber}.`,
          details: existingData?.status
            ? `Statut actuel: ${existingData.status}`
            : 'Votre demande est en cours de traitement.',
          color: 'yellow',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-700',
          buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
          iconBg: 'bg-yellow-100',
        };
      case 'other_user_request':
        return {
          icon: <XCircle className="h-12 w-12 text-red-500" />,
          title: 'Conflit Détecté',
          message: `Un autre utilisateur a déjà fait une demande pour ce numéro de suivi.`,
          details:
            'Contactez le support si vous pensez qu\'il s\'agit d\'une erreur.',
          color: 'red',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700',
          buttonBg: 'bg-red-600 hover:bg-red-700',
          iconBg: 'bg-red-100',
        };
      case 'package_claimed':
        return {
          icon: <XCircle className="h-12 w-12 text-red-500" />,
          title: 'Colis Déjà Réclamé',
          message: `Ce colis appartient déjà à un autre utilisateur.`,
          details:
            'Vérifiez votre numéro de suivi ou contactez le support.',
          color: 'red',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700',
          buttonBg: 'bg-red-600 hover:bg-red-700',
          iconBg: 'bg-red-100',
        };
    }
  };

  const content = getContent();

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
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Content */}
            <div className="p-8 text-center">
              {/* Icon */}
              <div
                className={`inline-flex items-center justify-center w-20 h-20 ${content.iconBg} rounded-full mb-4`}
              >
                {content.icon}
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {content.title}
              </h2>

              {/* Message */}
              <p className="text-gray-600 mb-4">{content.message}</p>

              {/* Details box */}
              <div
                className={`${content.bgColor} border ${content.borderColor} rounded-lg p-4 mb-6`}
              >
                <p className={`text-sm ${content.textColor}`}>
                  {content.details}
                </p>
              </div>

              {/* Tracking number */}
              <div className="bg-gray-50 rounded-lg p-3 mb-6">
                <p className="text-xs text-gray-500 mb-1">Numéro de suivi</p>
                <p className="text-sm font-mono font-semibold text-gray-900">
                  {trackingNumber}
                </p>
              </div>

              {/* Button */}
              <button
                onClick={onClose}
                className={`w-full px-6 py-3 ${content.buttonBg} text-white rounded-lg font-semibold transition-colors`}
              >
                Compris
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
