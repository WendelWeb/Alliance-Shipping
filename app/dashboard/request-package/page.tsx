'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Package,
  MapPin,
  Hash,
  MessageSquare,
  Send,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function RequestPackagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    externalTrackingNumber: '',
    receiptLocation: '',
    description: '',
    customerNotes: '',
    estimatedWeight: '',
    category: 'general',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/package-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit request');
      }

      setSuccess(true);

      // Redirect après 2 secondes
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Erreur lors de l\'envoi de la demande. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6"
          >
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </motion.div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Demande envoyée avec succès !
          </h2>
          <p className="text-gray-600 mb-6">
            Votre demande de colis a été envoyée à notre équipe. Vous recevrez une notification dès qu&apos;elle sera traitée.
          </p>

          <div className="bg-blue-50 rounded-xl p-4 text-left">
            <p className="text-sm text-blue-900 font-medium mb-2">📦 Prochaines étapes :</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Notre équipe vérifie votre demande</li>
              <li>• Nous ajoutons le poids réel du colis</li>
              <li>• Vous recevez votre tracking Alliance Shipping</li>
              <li>• Vous pouvez suivre votre colis en temps réel</li>
            </ul>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Retour
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Demander un Envoi de Colis
            </h1>
            <p className="text-gray-600">
              Remplissez ce formulaire pour enregistrer votre colis dans notre système
            </p>
          </div>

          {/* Info Card */}
          <div className="bg-blue-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">Informations importantes</h3>
                <ul className="text-sm space-y-1 text-blue-50">
                  <li>• <strong>Tracking Number:</strong> Indiquez le numéro de suivi de votre transporteur (UPS, USPS, FedEx, etc.)</li>
                  <li>• <strong>Lieu de Réception:</strong> Où avons-nous reçu votre colis ? (Très important)</li>
                  <li>• <strong>Description:</strong> Décrivez le contenu de votre colis</li>
                  <li>• Après validation, vous recevrez un tracking Alliance Shipping (AS-XXXXXXXXXX)</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tracking Number - TRÈS IMPORTANT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-50 rounded-lg">
                <Hash className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Tracking Number <span className="text-red-600">*</span>
                </h2>
                <p className="text-sm text-gray-600">De votre transporteur (UPS, USPS, FedEx, etc.)</p>
              </div>
            </div>

            <input
              type="text"
              name="externalTrackingNumber"
              value={formData.externalTrackingNumber}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg font-mono"
              placeholder="Ex: 1Z999AA10123456784"
            />
            <p className="text-xs text-gray-500 mt-2">
              Trouvez ce numéro sur le reçu de votre transporteur
            </p>
          </motion.div>

          {/* Lieu de Réception - TRÈS IMPORTANT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Lieu de Réception <span className="text-red-600">*</span>
                </h2>
                <p className="text-sm text-gray-600">Où avons-nous reçu votre colis ?</p>
              </div>
            </div>

            <select
              name="receiptLocation"
              value={formData.receiptLocation}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
            >
              <option value="">Sélectionnez un lieu</option>
              <option value="Miami Warehouse">Miami Warehouse - Notre Entrepôt Principal</option>
              <option value="Alliance Shipping USA Address">Alliance Shipping - Adresse USA</option>
              <option value="Partner Location - Miami">Partner Location - Miami</option>
              <option value="Other">Autre (précisez dans les notes)</option>
            </select>
          </motion.div>

          {/* Description du Colis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Description du Colis <span className="text-red-600">*</span>
                </h2>
                <p className="text-sm text-gray-600">Décrivez le contenu</p>
              </div>
            </div>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Ex: Vêtements, chaussures et accessoires pour la famille"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="general">Général</option>
                  <option value="clothing">Vêtements</option>
                  <option value="electronics">Électronique</option>
                  <option value="food">Nourriture</option>
                  <option value="documents">Documents</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poids estimé (lbs) - Optionnel
                </label>
                <input
                  type="number"
                  name="estimatedWeight"
                  value={formData.estimatedWeight}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0.0"
                />
              </div>
            </div>
          </motion.div>

          {/* Notes Additionnelles - FACULTATIF */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <MessageSquare className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Notes Additionnelles (Facultatif)
                </h2>
                <p className="text-sm text-gray-600">Informations supplémentaires importantes</p>
              </div>
            </div>

            <textarea
              name="customerNotes"
              value={formData.customerNotes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Ex: Colis fragile, contient des articles en verre. Merci de manipuler avec précaution."
            />
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex gap-4"
          >
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Envoyer la Demande
                </>
              )}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
