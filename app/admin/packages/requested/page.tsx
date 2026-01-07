'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Package,
  User,
  MapPin,
  Scale,
  Hash,
  MessageSquare,
  Check,
  X,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { LoadingSpinner, SkeletonLoader } from '@/components/admin/LoadingSpinner';

// Mock data - remplacer par vraie API
const mockRequests = [
  {
    id: 1,
    externalTrackingNumber: '1Z999AA10123456784',
    receiptLocation: 'Miami Warehouse',
    description: 'Vêtements, chaussures et accessoires pour la famille',
    customerNotes: 'Colis fragile, contient des articles en verre. Merci de manipuler avec précaution.',
    estimatedWeight: 5.0,
    category: 'clothing',
    userId: 1,
    userName: 'John Doe',
    userEmail: 'john@example.com',
    userPhone: '+1 305-555-0123',
    recipientInfo: {
      name: 'Marie Dupont',
      phone: '+509 1234 5678',
      city: 'Port-au-Prince',
    },
    status: 'pending',
    createdAt: '2026-01-07T10:30:00',
  },
  {
    id: 2,
    externalTrackingNumber: '9400111206213567891234',
    receiptLocation: 'Alliance Shipping USA Address',
    description: 'Electronics - laptop and accessories',
    customerNotes: null,
    estimatedWeight: null,
    category: 'electronics',
    userId: 2,
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    userPhone: '+1 305-555-0124',
    recipientInfo: {
      name: 'Jean Baptiste',
      phone: '+509 9876 5432',
      city: 'Cap-Haïtien',
    },
    status: 'pending',
    createdAt: '2026-01-07T09:15:00',
  },
];

interface ValidationState {
  weight: string;
  category: string;
  isWeightConfirmed: boolean;
  isCategoryConfirmed: boolean;
}

export default function RequestedPackagesPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState(mockRequests);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<typeof mockRequests[0] | null>(null);
  const [validationStates, setValidationStates] = useState<Record<number, ValidationState>>({});
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    const loadRequests = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Initialize validation states
      const initialStates: Record<number, ValidationState> = {};
      mockRequests.forEach(req => {
        initialStates[req.id] = {
          weight: req.estimatedWeight?.toString() || '',
          category: req.category || 'general',
          isWeightConfirmed: false,
          isCategoryConfirmed: false,
        };
      });
      setValidationStates(initialStates);

      setRequests(mockRequests);
      setLoading(false);
    };
    loadRequests();
  }, []);

  const filteredRequests = requests.filter(
    (req) =>
      req.externalTrackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleWeightChange = (requestId: number, value: string) => {
    setValidationStates(prev => ({
      ...prev,
      [requestId]: {
        ...prev[requestId],
        weight: value,
        isWeightConfirmed: false,
      },
    }));
  };

  const handleCategoryChange = (requestId: number, value: string) => {
    setValidationStates(prev => ({
      ...prev,
      [requestId]: {
        ...prev[requestId],
        category: value,
        isCategoryConfirmed: false,
      },
    }));
  };

  const confirmWeight = (requestId: number) => {
    setValidationStates(prev => ({
      ...prev,
      [requestId]: {
        ...prev[requestId],
        isWeightConfirmed: true,
      },
    }));
  };

  const confirmCategory = (requestId: number) => {
    setValidationStates(prev => ({
      ...prev,
      [requestId]: {
        ...prev[requestId],
        isCategoryConfirmed: true,
      },
    }));
  };

  const canApprove = (requestId: number) => {
    const state = validationStates[requestId];
    if (!state) return false;

    const hasWeight = parseFloat(state.weight) > 0;
    return hasWeight && state.isWeightConfirmed && state.isCategoryConfirmed;
  };

  const handleApprove = async (request: typeof mockRequests[0]) => {
    const state = validationStates[request.id];

    if (!canApprove(request.id)) {
      alert('Veuillez confirmer le poids et la catégorie avant d\'approuver !');
      return;
    }

    setProcessingId(request.id);

    try {
      // TODO: API call to approve request and create package
      console.log('Approving request:', {
        requestId: request.id,
        weight: state.weight,
        category: state.category,
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      alert(`Demande approuvée ! Un tracking Alliance Shipping a été généré.`);

      // Remove from list
      setRequests(prev => prev.filter(r => r.id !== request.id));
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Erreur lors de l\'approbation');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir rejeter cette demande ?')) return;

    setProcessingId(requestId);

    try {
      // TODO: API call to reject
      await new Promise(resolve => setTimeout(resolve, 500));
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Erreur lors du rejet');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Demandes de Colis</h1>
          <p className="mt-2 text-sm text-gray-600">
            Validez et approuvez les demandes des clients
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <Package className="h-5 w-5 text-yellow-600" />
          <span className="text-sm font-semibold text-yellow-700">
            {filteredRequests.length} En Attente
          </span>
        </div>
      </div>

      {/* Alert Info */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Actions requises avant approbation :</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Ajouter et confirmer le poids réel du colis (obligatoire)</li>
              <li>Vérifier et confirmer la catégorie (obligatoire)</li>
              <li>Un tracking Alliance Shipping (AS-XXXXXXXXXX) sera généré automatiquement</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par tracking, client..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Requests List */}
      {loading ? (
        <SkeletonLoader rows={3} />
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Aucune demande en attente</h3>
          <p className="mt-1 text-sm text-gray-500">
            Toutes les demandes ont été traitées
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request, index) => {
            const state = validationStates[request.id] || { weight: '', category: 'general', isWeightConfirmed: false, isCategoryConfirmed: false };
            const isProcessing = processingId === request.id;
            const readyToApprove = canApprove(request.id);

            return (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 overflow-hidden hover:shadow-md transition-all"
              >
                <div className="p-6">
                  {/* Header Info */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg">
                        {request.userName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{request.userName}</h3>
                        <p className="text-sm text-gray-600">{request.userEmail}</p>
                        <p className="text-xs text-gray-500">Demande le {formatDate(request.createdAt)}</p>
                      </div>
                    </div>

                    {readyToApprove && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                        <Check className="h-4 w-4" />
                        Prêt à approuver
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Request Info */}
                    <div className="space-y-4">
                      {/* External Tracking */}
                      <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Hash className="h-5 w-5 text-red-600" />
                          <span className="text-sm font-semibold text-red-900">Tracking Transporteur</span>
                        </div>
                        <p className="text-lg font-mono font-bold text-red-700">{request.externalTrackingNumber}</p>
                      </div>

                      {/* Receipt Location */}
                      <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-semibold text-green-900">Lieu de Réception</span>
                        </div>
                        <p className="text-base font-medium text-green-700">{request.receiptLocation}</p>
                      </div>

                      {/* Description */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="h-5 w-5 text-gray-600" />
                          <span className="text-sm font-semibold text-gray-900">Description</span>
                        </div>
                        <p className="text-sm text-gray-700">{request.description}</p>
                      </div>

                      {/* Customer Notes */}
                      {request.customerNotes && (
                        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="h-5 w-5 text-yellow-600" />
                            <span className="text-sm font-semibold text-yellow-900">Notes Client</span>
                          </div>
                          <p className="text-sm text-yellow-800">{request.customerNotes}</p>
                        </div>
                      )}

                      {/* Recipient */}
                      <div className="bg-purple-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-5 w-5 text-purple-600" />
                          <span className="text-sm font-semibold text-purple-900">Destinataire</span>
                        </div>
                        <p className="text-sm text-purple-700">
                          {request.recipientInfo.name} - {request.recipientInfo.city}
                        </p>
                        <p className="text-sm text-purple-600">{request.recipientInfo.phone}</p>
                      </div>
                    </div>

                    {/* Right Column - Validation */}
                    <div className="space-y-4">
                      {/* Weight Validation */}
                      <div className={`rounded-xl p-4 border-2 transition-all ${
                        state.isWeightConfirmed
                          ? 'bg-green-50 border-green-500'
                          : 'bg-blue-50 border-blue-300'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Scale className={`h-5 w-5 ${state.isWeightConfirmed ? 'text-green-600' : 'text-blue-600'}`} />
                            <span className="text-sm font-semibold text-gray-900">Poids Réel (lbs) *</span>
                          </div>
                          {state.isWeightConfirmed && (
                            <Check className="h-5 w-5 text-green-600" />
                          )}
                        </div>

                        {request.estimatedWeight && (
                          <p className="text-xs text-gray-600 mb-2">
                            Estimation client: {request.estimatedWeight} lbs
                          </p>
                        )}

                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={state.weight}
                            onChange={(e) => handleWeightChange(request.id, e.target.value)}
                            disabled={state.isWeightConfirmed || isProcessing}
                            step="0.1"
                            min="0"
                            className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed font-mono text-lg"
                            placeholder="0.0"
                          />
                          {!state.isWeightConfirmed ? (
                            <button
                              onClick={() => confirmWeight(request.id)}
                              disabled={!state.weight || parseFloat(state.weight) <= 0 || isProcessing}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                            >
                              Confirmer
                            </button>
                          ) : (
                            <button
                              onClick={() => setValidationStates(prev => ({
                                ...prev,
                                [request.id]: { ...prev[request.id], isWeightConfirmed: false }
                              }))}
                              disabled={isProcessing}
                              className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50"
                            >
                              Modifier
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Category Validation */}
                      <div className={`rounded-xl p-4 border-2 transition-all ${
                        state.isCategoryConfirmed
                          ? 'bg-green-50 border-green-500'
                          : 'bg-purple-50 border-purple-300'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-gray-900">Catégorie *</span>
                          {state.isCategoryConfirmed && (
                            <Check className="h-5 w-5 text-green-600" />
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={state.category}
                            onChange={(e) => handleCategoryChange(request.id, e.target.value)}
                            disabled={state.isCategoryConfirmed || isProcessing}
                            className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            <option value="general">Général</option>
                            <option value="clothing">Vêtements</option>
                            <option value="electronics">Électronique</option>
                            <option value="food">Nourriture</option>
                            <option value="documents">Documents</option>
                            <option value="fragile">Fragile</option>
                            <option value="other">Autre</option>
                          </select>
                          {!state.isCategoryConfirmed ? (
                            <button
                              onClick={() => confirmCategory(request.id)}
                              disabled={isProcessing}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 font-semibold"
                            >
                              Confirmer
                            </button>
                          ) : (
                            <button
                              onClick={() => setValidationStates(prev => ({
                                ...prev,
                                [request.id]: { ...prev[request.id], isCategoryConfirmed: false }
                              }))}
                              disabled={isProcessing}
                              className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50"
                            >
                              Modifier
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-4 space-y-3">
                        <button
                          onClick={() => handleApprove(request)}
                          disabled={!readyToApprove || isProcessing}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Traitement...
                            </>
                          ) : (
                            <>
                              <Check className="h-5 w-5" />
                              Approuver & Générer Tracking AS
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleReject(request.id)}
                          disabled={isProcessing}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border-2 border-red-300 text-red-700 font-semibold rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          <X className="h-5 w-5" />
                          Rejeter la Demande
                        </button>
                      </div>

                      {/* Warning */}
                      {!readyToApprove && (
                        <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded">
                          <p className="text-sm text-orange-800">
                            ⚠️ Confirmez le poids ET la catégorie pour pouvoir approuver
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
