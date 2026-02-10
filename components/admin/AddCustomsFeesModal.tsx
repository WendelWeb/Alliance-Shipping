'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { useToast } from '@/components/admin/Toast';

interface AddCustomsFeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageData: {
    id: number;
    trackingNumber: string;
    totalCost: string;
  };
  onSuccess: () => void;
}

export default function AddCustomsFeesModal({
  isOpen,
  onClose,
  packageData,
  onSuccess,
}: AddCustomsFeesModalProps) {
  const [customsFees, setCustomsFees] = useState('');
  const [loading, setLoading] = useState(false);
  const { error, success } = useToast();

  const handleSubmit = async () => {
    const feesAmount = parseFloat(customsFees);

    if (!customsFees || feesAmount <= 0 || isNaN(feesAmount)) {
      error('Erreur', 'Veuillez entrer un montant valide');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/packages/${packageData.id}/customs-fees`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customsFees: feesAmount }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        success('Frais de douane ajoutés', 'Email envoyé au client');
        onSuccess();
        onClose();
        setCustomsFees('');
      } else {
        error('Erreur', data.error || 'Impossible d\'ajouter les frais');
      }
    } catch (err) {
      console.error('Error adding customs fees:', err);
      error('Erreur', 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const newTotal =
    customsFees && !isNaN(parseFloat(customsFees))
      ? parseFloat(packageData.totalCost) + parseFloat(customsFees)
      : null;

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
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-6 border-b border-gray-200">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">
                  Ajouter Frais de Douane
                </h3>
                <p className="text-sm text-gray-500">
                  #{packageData.trackingNumber}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Current total */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Total actuel:</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${parseFloat(packageData.totalCost).toFixed(2)}
                </p>
              </div>

              {/* Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frais de douane ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={customsFees}
                  onChange={(e) => setCustomsFees(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-shadow"
                  placeholder="Ex: 10.00"
                  disabled={loading}
                />
              </div>

              {/* New total preview */}
              {newTotal !== null && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 rounded-lg p-4 border border-red-200"
                >
                  <p className="text-sm text-red-600 font-medium mb-1">
                    Nouveau total:
                  </p>
                  <p className="text-2xl font-bold text-red-700">
                    ${newTotal.toFixed(2)}
                  </p>
                  <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Un email sera envoyé automatiquement au client
                  </p>
                </motion.div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={!customsFees || loading || newTotal === null}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Ajout...' : 'Ajouter Frais'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
