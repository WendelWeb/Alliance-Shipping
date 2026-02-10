'use client';

import { useState, useCallback } from 'react';
import { useCachedFetch } from '@/hooks/useAdminCache';
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
  RefreshCw,
} from 'lucide-react';
import { LoadingSpinner, SkeletonLoader } from '@/components/admin/LoadingSpinner';

interface PackageRequest {
  id: number;
  externalTrackingNumber: string;
  description: string;
  customerNotes: string | null;
  estimatedWeight: number | null;
  category: string;
  userId: number;
  userName: string;
  userEmail: string;
  userPhone: string;
  userCity: string;
  status: string;
  createdAt: string;
}

interface ValidationState {
  weight: string;
  category: string;
  status: string;
  isWeightConfirmed: boolean;
  isCategoryConfirmed: boolean;
  isStatusConfirmed: boolean;
}

// ── Helper: generate a consistent color from a name string ──────────────────

function nameToColor(name: string): { bg: string; text: string } {
  const colors = [
    { bg: 'bg-blue-600', text: 'text-white' },
    { bg: 'bg-emerald-600', text: 'text-white' },
    { bg: 'bg-violet-600', text: 'text-white' },
    { bg: 'bg-amber-600', text: 'text-white' },
    { bg: 'bg-rose-600', text: 'text-white' },
    { bg: 'bg-cyan-600', text: 'text-white' },
    { bg: 'bg-indigo-600', text: 'text-white' },
    { bg: 'bg-teal-600', text: 'text-white' },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function RequestedPackagesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<PackageRequest | null>(null);
  const [validationStates, setValidationStates] = useState<Record<number, ValidationState>>({});
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchRequests = useCallback(async (): Promise<PackageRequest[]> => {
    const response = await fetch('/api/admin/package-requests');

    if (!response.ok) {
      throw new Error('Failed to fetch package requests');
    }

    const data = await response.json();

    // Transform API data to match UI format
    const transformedRequests: PackageRequest[] = data.requests ? data.requests.map((req: any) => ({
      id: req.id,
      externalTrackingNumber: req.externalTrackingNumber || 'N/A',
      description: req.description || 'No description',
      customerNotes: req.notes || null,
      estimatedWeight: req.estimatedWeight ? parseFloat(req.estimatedWeight) : null,
      category: req.category || 'general',
      userId: req.userId,
      userName: req.user ? `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() : 'Unknown',
      userEmail: req.user?.email || 'N/A',
      userPhone: req.user?.phone || 'N/A',
      userCity: req.user?.city || '-',
      status: req.status || 'pending',
      createdAt: req.createdAt || new Date().toISOString(),
    })) : [];

    // Initialize validation states
    const initialStates: Record<number, ValidationState> = {};
    transformedRequests.forEach((req: any) => {
      initialStates[req.id] = {
        weight: '', // Admin must add weight - users can no longer provide it
        category: req.category || 'general',
        status: 'received',
        isWeightConfirmed: false,
        isCategoryConfirmed: false,
        isStatusConfirmed: false,
      };
    });
    setValidationStates(initialStates);

    return transformedRequests;
  }, []);

  const { data, loading, refreshing, refresh } = useCachedFetch<PackageRequest[]>('admin-packages-requested', fetchRequests);
  const requests = data || [];

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

  const handleStatusChange = (requestId: number, value: string) => {
    setValidationStates(prev => ({
      ...prev,
      [requestId]: {
        ...prev[requestId],
        status: value,
        isStatusConfirmed: false,
      },
    }));
  };

  const confirmStatus = (requestId: number) => {
    setValidationStates(prev => ({
      ...prev,
      [requestId]: {
        ...prev[requestId],
        isStatusConfirmed: true,
      },
    }));
  };

  const canApprove = (requestId: number) => {
    const state = validationStates[requestId];
    if (!state) return false;

    const hasWeight = parseFloat(state.weight) > 0;
    return hasWeight && state.isWeightConfirmed && state.isCategoryConfirmed && state.isStatusConfirmed;
  };

  const handleApprove = async (request: PackageRequest) => {
    const state = validationStates[request.id];

    if (!canApprove(request.id)) {
      alert('Veuillez confirmer le poids, la catégorie et le statut avant d\'approuver !');
      return;
    }

    setProcessingId(request.id);

    try {
      const response = await fetch('/api/admin/package-requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: request.id,
          action: 'approve',
          weight: state.weight,
          category: state.category,
          initialStatus: state.status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve request');
      }

      const data = await response.json();

      alert(`✅ Demande approuvée !\n\nTracking Alliance Shipping: ${data.package.trackingNumber}\nStatut initial: ${state.status}`);

      // Refresh the list
      refresh();
    } catch (error: any) {
      console.error('Error approving request:', error);
      alert(`❌ Erreur lors de l'approbation:\n${error.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir rejeter cette demande ?')) return;

    setProcessingId(requestId);

    try {
      const response = await fetch('/api/admin/package-requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: requestId,
          action: 'reject',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject request');
      }

      alert('✅ Demande rejetée avec succès');
      refresh();
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      alert(`❌ Erreur lors du rejet:\n${error.message}`);
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
        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Package className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-semibold text-yellow-700">
              {filteredRequests.length} En Attente
            </span>
          </div>
        </div>
      </div>

      {/* Alert Info */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Actions requises avant approbation :</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Peser et ajouter le poids réel du colis</li>
              <li>Vérifier et confirmer la catégorie</li>
              <li>Sélectionner et confirmer le statut initial</li>
              <li>Un tracking AS-XXXXXXXXXX sera généré automatiquement</li>
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
        <div className="text-center py-12 theme-card rounded-xl border border-gray-100">
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
            const avatar = nameToColor(request.userName || '?');

            return (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="theme-card rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
              >
                <div className="p-6">
                  {/* Header Info */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-full ${avatar.bg} flex items-center justify-center ${avatar.text} font-bold text-lg`}>
                        {request.userName ? request.userName.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{request.userName || 'Unknown'}</h3>
                        <p className="text-sm text-gray-600">{request.userEmail || 'N/A'}</p>
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
                      <div className="bg-theme-surface-solid rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Hash className="h-5 w-5 text-gray-500" />
                          <span className="text-xs uppercase tracking-wide text-gray-500">Tracking Transporteur</span>
                        </div>
                        <p className="text-lg font-mono font-bold text-gray-900">{request.externalTrackingNumber}</p>
                      </div>

                      {/* Description */}
                      <div className="bg-theme-surface-solid rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="h-5 w-5 text-gray-500" />
                          <span className="text-xs uppercase tracking-wide text-gray-500">Description</span>
                        </div>
                        <p className="text-sm text-gray-700">{request.description}</p>
                      </div>

                      {/* Customer Notes */}
                      {request.customerNotes && (
                        <div className="bg-theme-surface-solid rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="h-5 w-5 text-gray-500" />
                            <span className="text-xs uppercase tracking-wide text-gray-500">Notes Client</span>
                          </div>
                          <p className="text-sm text-gray-700">{request.customerNotes}</p>
                        </div>
                      )}

                      {/* User City */}
                      <div className="bg-theme-surface-solid rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-5 w-5 text-gray-500" />
                          <span className="text-xs uppercase tracking-wide text-gray-500">Ville</span>
                        </div>
                        <p className="text-sm text-gray-700">
                          {request.userCity}
                        </p>
                      </div>
                    </div>

                    {/* Right Column - Validation */}
                    <div className="space-y-4">
                      {/* Weight Validation */}
                      <div className={`rounded-lg p-4 border transition-all ${
                        state.isWeightConfirmed
                          ? 'bg-green-50 border-green-300'
                          : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Scale className={`h-5 w-5 ${state.isWeightConfirmed ? 'text-green-600' : 'text-gray-500'}`} />
                            <span className="text-sm font-semibold text-gray-900">Poids Réel (lbs) *</span>
                          </div>
                          {state.isWeightConfirmed && (
                            <Check className="h-5 w-5 text-green-600" />
                          )}
                        </div>

                        <p className="text-xs text-gray-500 mb-2">
                          Pesez le colis et entrez le poids exact
                        </p>

                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={state.weight}
                            onChange={(e) => handleWeightChange(request.id, e.target.value)}
                            disabled={state.isWeightConfirmed || isProcessing}
                            step="1"
                            min="1"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed font-mono text-lg"
                            placeholder="Ex: 5"
                          />
                          {!state.isWeightConfirmed ? (
                            <button
                              onClick={() => confirmWeight(request.id)}
                              disabled={!state.weight || parseFloat(state.weight) <= 0 || isProcessing}
                              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
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
                      <div className={`rounded-lg p-4 border transition-all ${
                        state.isCategoryConfirmed
                          ? 'bg-green-50 border-green-300'
                          : 'bg-gray-50 border-gray-200'
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
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 font-semibold"
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

                      {/* Status Selection */}
                      <div className={`rounded-lg p-4 border transition-all ${
                        state.isStatusConfirmed
                          ? 'bg-green-50 border-green-300'
                          : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-gray-900">Statut Initial *</span>
                          {state.isStatusConfirmed && (
                            <Check className="h-5 w-5 text-green-600" />
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={state.status}
                            onChange={(e) => handleStatusChange(request.id, e.target.value)}
                            disabled={state.isStatusConfirmed || isProcessing}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            <option value="received">Reçu (Warehouse Miami)</option>
                            <option value="in-transit">En Transit vers Haïti</option>
                            <option value="available">Disponible pour Retrait</option>
                            <option value="delivered">Déjà Livré</option>
                          </select>
                          {!state.isStatusConfirmed ? (
                            <button
                              onClick={() => confirmStatus(request.id)}
                              disabled={isProcessing}
                              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 font-semibold"
                            >
                              Confirmer
                            </button>
                          ) : (
                            <button
                              onClick={() => setValidationStates(prev => ({
                                ...prev,
                                [request.id]: { ...prev[request.id], isStatusConfirmed: false }
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
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border border-red-300 text-red-700 font-semibold rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          <X className="h-5 w-5" />
                          Rejeter la Demande
                        </button>
                      </div>

                      {/* Warning */}
                      {!readyToApprove && (
                        <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded">
                          <p className="text-sm text-orange-800">
                            Confirmez le poids, la catégorie ET le statut initial pour pouvoir approuver
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
