'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
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
  Smartphone,
  DollarSign,
  Lock,
  Tag,
} from 'lucide-react';
import { LoadingSpinner, SkeletonLoader } from '@/components/admin/LoadingSpinner';

interface SpecialItemInfo {
  id: number;
  itemName: string;
  itemName_fr: string | null;
  itemName_ht: string | null;
  itemName_es: string | null;
  brand: string;
  fixedFee: string;
  category: string;
}

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
  userLanguage: string;
  status: string;
  createdAt: string;
  specialItemId: number | null;
  specialItem: SpecialItemInfo | null;
}

interface ValidationState {
  weight: string;
  category: string;
  status: string;
  specialItemId: number | null;
  chargeByWeight: boolean;
  customsFees: string;
  isWeightConfirmed: boolean;
  isCategoryConfirmed: boolean;
  isStatusConfirmed: boolean;
}

// Active special items for admin dropdown
interface ActiveSpecialItem {
  id: number;
  itemName: string;
  brand: string;
  fixedFee: string;
  category: string;
}

// City pricing from database
interface CityPricingData {
  id: number;
  city: string;
  serviceFee: string;
  pricePerLb: string;
}

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
  const [validationStates, setValidationStates] = useState<Record<number, ValidationState>>({});
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [allSpecialItems, setAllSpecialItems] = useState<ActiveSpecialItem[]>([]);
  const [cityPricingMap, setCityPricingMap] = useState<Record<string, { serviceFee: number; pricePerLb: number }>>({});

  // Fetch all active special items for admin dropdown
  useEffect(() => {
    fetch('/api/special-items/public')
      .then((res) => res.json())
      .then((data) => {
        const items = data?.items || data || [];
        setAllSpecialItems(items.filter((i: any) => i.isActive));
      })
      .catch(() => {});
  }, []);

  // Fetch city pricing from database
  useEffect(() => {
    fetch('/api/pricing/all')
      .then((res) => res.json())
      .then((data) => {
        const cities: CityPricingData[] = data?.cities || [];
        const map: Record<string, { serviceFee: number; pricePerLb: number }> = {};
        cities.forEach((c) => {
          map[c.city] = {
            serviceFee: parseFloat(c.serviceFee),
            pricePerLb: parseFloat(c.pricePerLb),
          };
        });
        setCityPricingMap(map);
      })
      .catch(() => {});
  }, []);

  const fetchRequests = useCallback(async (): Promise<PackageRequest[]> => {
    const response = await fetch('/api/admin/package-requests');
    if (!response.ok) throw new Error('Failed to fetch package requests');

    const data = await response.json();

    const transformedRequests: PackageRequest[] = data.requests ? data.requests.map((req: any) => ({
      id: req.id,
      externalTrackingNumber: req.externalTrackingNumber || 'N/A',
      description: req.description || 'No description',
      customerNotes: req.customerNotes || null,
      estimatedWeight: req.estimatedWeight ? parseFloat(req.estimatedWeight) : null,
      category: req.category || 'general',
      userId: req.userId,
      userName: req.user ? `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() : 'Unknown',
      userEmail: req.user?.email || 'N/A',
      userPhone: req.user?.phone || 'N/A',
      userCity: req.user?.city || '-',
      userLanguage: req.user?.preferredLanguage || 'fr',
      status: req.status || 'pending',
      createdAt: req.createdAt || new Date().toISOString(),
      specialItemId: req.specialItemId || null,
      specialItem: req.specialItem?.id ? {
        id: req.specialItem.id,
        itemName: req.specialItem.itemName,
        itemName_fr: req.specialItem.itemName_fr,
        itemName_ht: req.specialItem.itemName_ht,
        itemName_es: req.specialItem.itemName_es,
        brand: req.specialItem.brand,
        fixedFee: req.specialItem.fixedFee,
        category: req.specialItem.category,
      } : null,
    })) : [];

    // Initialize validation states
    const initialStates: Record<number, ValidationState> = {};
    transformedRequests.forEach((req) => {
      initialStates[req.id] = {
        weight: '',
        category: req.specialItemId ? 'electronics' : (req.category || 'general'),
        status: 'received',
        specialItemId: req.specialItemId || null,
        chargeByWeight: false,
        customsFees: '',
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

  // ── State handlers ──

  const handleWeightChange = (requestId: number, value: string) => {
    setValidationStates(prev => ({
      ...prev,
      [requestId]: { ...prev[requestId], weight: value, isWeightConfirmed: false },
    }));
  };

  const handleCategoryChange = (requestId: number, value: string) => {
    setValidationStates(prev => ({
      ...prev,
      [requestId]: { ...prev[requestId], category: value, isCategoryConfirmed: false },
    }));
  };

  const handleSpecialItemChange = (requestId: number, itemId: number | null) => {
    setValidationStates(prev => {
      const current = prev[requestId];
      return {
        ...prev,
        [requestId]: {
          ...current,
          specialItemId: itemId,
          // Auto-force electronics when special item selected
          category: itemId ? 'electronics' : current.category,
          isCategoryConfirmed: itemId ? true : current.isCategoryConfirmed,
          // Reset chargeByWeight when removing special item
          chargeByWeight: itemId ? current.chargeByWeight : false,
        },
      };
    });
  };

  const handleChargeByWeightToggle = (requestId: number) => {
    setValidationStates(prev => ({
      ...prev,
      [requestId]: { ...prev[requestId], chargeByWeight: !prev[requestId].chargeByWeight },
    }));
  };

  const handleCustomsFeesChange = (requestId: number, value: string) => {
    setValidationStates(prev => ({
      ...prev,
      [requestId]: { ...prev[requestId], customsFees: value },
    }));
  };

  const confirmWeight = (requestId: number) => {
    setValidationStates(prev => ({
      ...prev,
      [requestId]: { ...prev[requestId], isWeightConfirmed: true },
    }));
  };

  const confirmCategory = (requestId: number) => {
    setValidationStates(prev => ({
      ...prev,
      [requestId]: { ...prev[requestId], isCategoryConfirmed: true },
    }));
  };

  const handleStatusChange = (requestId: number, value: string) => {
    setValidationStates(prev => ({
      ...prev,
      [requestId]: { ...prev[requestId], status: value, isStatusConfirmed: false },
    }));
  };

  const confirmStatus = (requestId: number) => {
    setValidationStates(prev => ({
      ...prev,
      [requestId]: { ...prev[requestId], isStatusConfirmed: true },
    }));
  };

  const canApprove = (requestId: number) => {
    const state = validationStates[requestId];
    if (!state) return false;
    const hasWeight = parseFloat(state.weight) > 0;
    return hasWeight && state.isWeightConfirmed && state.isCategoryConfirmed && state.isStatusConfirmed;
  };

  // ── Fee calculation (live preview) ──

  const calculatePreviewFees = (requestId: number, request: PackageRequest) => {
    const state = validationStates[requestId];
    if (!state) return { serviceFee: 0, weightCost: 0, specialItemFee: 0, customsFees: 0, total: 0, pricePerLb: 0 };

    const weight = parseFloat(state.weight) || 0;
    const customsFees = parseFloat(state.customsFees) || 0;

    // Lookup pricing from DB by user's city
    const cityPricing = cityPricingMap[request.userCity];
    const serviceFee = cityPricing?.serviceFee ?? 0;
    const pricePerLb = cityPricing?.pricePerLb ?? 0;

    let specialItemFee = 0;
    if (state.specialItemId) {
      const item = allSpecialItems.find(i => i.id === state.specialItemId);
      specialItemFee = item ? parseFloat(item.fixedFee) : 0;
    }

    let weightCost = 0;
    if (!state.specialItemId || state.chargeByWeight) {
      weightCost = weight * pricePerLb;
    }

    const total = serviceFee + weightCost + specialItemFee + customsFees;
    return { serviceFee, weightCost, specialItemFee, customsFees, total, pricePerLb };
  };

  // ── Actions ──

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: request.id,
          action: 'approve',
          weight: state.weight,
          category: state.category,
          initialStatus: state.status,
          specialItemId: state.specialItemId || null,
          chargeByWeight: state.chargeByWeight,
          customsFees: state.customsFees || '0',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve request');
      }

      const data = await response.json();
      alert(`Demande approuvee !\n\nTracking Alliance Shipping: ${data.package.trackingNumber}\nStatut initial: ${state.status}\nTotal: $${parseFloat(data.package.totalCost).toFixed(2)}`);
      refresh();
    } catch (error: any) {
      console.error('Error approving request:', error);
      alert(`Erreur lors de l'approbation:\n${error.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: number) => {
    if (!confirm('Etes-vous sur de vouloir rejeter cette demande ?')) return;

    setProcessingId(requestId);
    try {
      const response = await fetch('/api/admin/package-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: requestId, action: 'reject' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject request');
      }

      alert('Demande rejetee avec succes');
      refresh();
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      alert(`Erreur lors du rejet:\n${error.message}`);
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
              <li>Peser et ajouter le poids reel du colis</li>
              <li>Verifier et confirmer la categorie</li>
              <li>Article special : voir/changer/ajouter si necessaire</li>
              <li>Selectionner et confirmer le statut initial</li>
              <li>Un tracking AS-XXXXXXXXXX sera genere automatiquement</li>
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
          <p className="mt-1 text-sm text-gray-500">Toutes les demandes ont ete traitees</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredRequests.map((request, index) => {
            const state = validationStates[request.id] || {
              weight: '', category: 'general', status: 'received',
              specialItemId: null, chargeByWeight: false, customsFees: '',
              isWeightConfirmed: false, isCategoryConfirmed: false, isStatusConfirmed: false,
            };
            const isProcessing = processingId === request.id;
            const readyToApprove = canApprove(request.id);
            const avatar = nameToColor(request.userName || '?');
            const fees = calculatePreviewFees(request.id, request);
            const hasSpecialItem = state.specialItemId !== null;
            const selectedItem = hasSpecialItem ? allSpecialItems.find(i => i.id === state.specialItemId) : null;

            return (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="theme-card rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-full ${avatar.bg} flex items-center justify-center ${avatar.text} font-bold text-lg`}>
                        {request.userName ? request.userName.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{request.userName || 'Unknown'}</h3>
                        <p className="text-sm text-gray-600">{request.userEmail}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="h-3 w-3" /> {request.userCity}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDate(request.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {request.specialItem && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                          <Smartphone className="h-3 w-3" />
                          Article Special
                        </span>
                      )}
                      {readyToApprove && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                          <Check className="h-4 w-4" />
                          Pret
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Hash className="h-4 w-4 text-gray-400" />
                        <span className="text-xs uppercase tracking-wide text-gray-500">Tracking</span>
                      </div>
                      <p className="text-sm font-mono font-bold text-gray-900">{request.externalTrackingNumber}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="text-xs uppercase tracking-wide text-gray-500">Description</span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">{request.description}</p>
                    </div>
                    {request.customerNotes && (
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="h-4 w-4 text-gray-400" />
                          <span className="text-xs uppercase tracking-wide text-gray-500">Notes</span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">{request.customerNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* User's Special Item Choice */}
                  {request.specialItem && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-5">
                      <div className="flex items-center gap-2 mb-1">
                        <Smartphone className="h-4 w-4 text-purple-600" />
                        <span className="text-xs font-semibold text-purple-700 uppercase">Article special choisi par le client</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-semibold text-purple-900">{request.specialItem.itemName}</span>
                          <span className="text-sm text-purple-600 ml-2">({request.specialItem.brand})</span>
                        </div>
                        <span className="text-sm font-bold text-purple-700">${parseFloat(request.specialItem.fixedFee).toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {/* ── Validation Admin ── */}
                  <div className="border-t border-gray-200 pt-5">
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                      Validation Admin
                    </h4>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Left Column - Weight, Category, Special Item */}
                      <div className="space-y-4">
                        {/* Weight */}
                        <div className={`rounded-lg p-4 border transition-all ${
                          state.isWeightConfirmed ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Scale className={`h-5 w-5 ${state.isWeightConfirmed ? 'text-green-600' : 'text-gray-500'}`} />
                              <span className="text-sm font-semibold text-gray-900">Poids Reel (lbs) *</span>
                            </div>
                            {state.isWeightConfirmed && <Check className="h-5 w-5 text-green-600" />}
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={state.weight}
                              onChange={(e) => handleWeightChange(request.id, e.target.value)}
                              disabled={state.isWeightConfirmed || isProcessing}
                              step="0.1"
                              min="0.1"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed font-mono text-lg"
                              placeholder="Ex: 5"
                            />
                            {!state.isWeightConfirmed ? (
                              <button
                                onClick={() => confirmWeight(request.id)}
                                disabled={!state.weight || parseFloat(state.weight) <= 0 || isProcessing}
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm"
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
                                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50 text-sm"
                              >
                                Modifier
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Category */}
                        <div className={`rounded-lg p-4 border transition-all ${
                          state.isCategoryConfirmed ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Tag className={`h-5 w-5 ${state.isCategoryConfirmed ? 'text-green-600' : 'text-gray-500'}`} />
                              <span className="text-sm font-semibold text-gray-900">Categorie *</span>
                              {hasSpecialItem && (
                                <span className="inline-flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                                  <Lock className="h-3 w-3" />
                                  Auto: Electronique
                                </span>
                              )}
                            </div>
                            {state.isCategoryConfirmed && <Check className="h-5 w-5 text-green-600" />}
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={state.category}
                              onChange={(e) => handleCategoryChange(request.id, e.target.value)}
                              disabled={state.isCategoryConfirmed || isProcessing || hasSpecialItem}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                              <option value="general">General</option>
                              <option value="clothing">Vetements</option>
                              <option value="electronics">Electronique</option>
                              <option value="food">Nourriture</option>
                              <option value="documents">Documents</option>
                              <option value="fragile">Fragile</option>
                              <option value="other">Autre</option>
                            </select>
                            {!state.isCategoryConfirmed ? (
                              <button
                                onClick={() => confirmCategory(request.id)}
                                disabled={isProcessing}
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 font-semibold text-sm"
                              >
                                Confirmer
                              </button>
                            ) : (
                              <button
                                onClick={() => setValidationStates(prev => ({
                                  ...prev,
                                  [request.id]: { ...prev[request.id], isCategoryConfirmed: false }
                                }))}
                                disabled={isProcessing || hasSpecialItem}
                                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50 text-sm"
                              >
                                Modifier
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Special Item Admin Selection */}
                        <div className={`rounded-lg p-4 border transition-all ${
                          hasSpecialItem ? 'bg-purple-50 border-purple-300' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <Smartphone className={`h-5 w-5 ${hasSpecialItem ? 'text-purple-600' : 'text-gray-500'}`} />
                            <span className="text-sm font-semibold text-gray-900">Article Special</span>
                            <span className="text-xs text-gray-500">(optionnel)</span>
                          </div>
                          <select
                            value={state.specialItemId ?? ''}
                            onChange={(e) => handleSpecialItemChange(request.id, e.target.value ? parseInt(e.target.value) : null)}
                            disabled={isProcessing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">-- Aucun article special --</option>
                            {allSpecialItems.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.itemName} ({item.brand}) - ${parseFloat(item.fixedFee).toFixed(2)}
                              </option>
                            ))}
                          </select>

                          {/* chargeByWeight toggle */}
                          {hasSpecialItem && (
                            <label className="flex items-center gap-2 mt-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={state.chargeByWeight}
                                onChange={() => handleChargeByWeightToggle(request.id)}
                                disabled={isProcessing}
                                className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                              />
                              <span className="text-sm text-gray-700">Charger aussi par poids (fixedFee + weightCost)</span>
                            </label>
                          )}
                        </div>
                      </div>

                      {/* Right Column - Status, Customs, Fee Summary */}
                      <div className="space-y-4">
                        {/* Custom Fees */}
                        <div className="rounded-lg p-4 border bg-gray-50 border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-5 w-5 text-red-500" />
                            <span className="text-sm font-semibold text-gray-900">Frais de Douane</span>
                            <span className="text-xs text-gray-500">(optionnel)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">$</span>
                            <input
                              type="number"
                              value={state.customsFees}
                              onChange={(e) => handleCustomsFeesChange(request.id, e.target.value)}
                              disabled={isProcessing}
                              step="0.01"
                              min="0"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 font-mono"
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        {/* Status */}
                        <div className={`rounded-lg p-4 border transition-all ${
                          state.isStatusConfirmed ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-900">Statut Initial *</span>
                            {state.isStatusConfirmed && <Check className="h-5 w-5 text-green-600" />}
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={state.status}
                              onChange={(e) => handleStatusChange(request.id, e.target.value)}
                              disabled={state.isStatusConfirmed || isProcessing}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                              <option value="received">Recu (Warehouse Miami)</option>
                              <option value="in-transit">En Transit vers Haiti</option>
                              <option value="available">Disponible pour Retrait</option>
                              <option value="delivered">Deja Livre</option>
                            </select>
                            {!state.isStatusConfirmed ? (
                              <button
                                onClick={() => confirmStatus(request.id)}
                                disabled={isProcessing}
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 font-semibold text-sm"
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
                                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50 text-sm"
                              >
                                Modifier
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Fee Summary */}
                        <div className="rounded-lg p-4 border border-blue-200 bg-blue-50">
                          <h5 className="text-sm font-bold text-blue-900 mb-3">
                            Resume des frais
                            <span className="text-xs font-normal text-blue-600 ml-2">
                              ({request.userCity} — ${fees.pricePerLb.toFixed(2)}/lb)
                            </span>
                          </h5>
                          {!cityPricingMap[request.userCity] && (
                            <div className="bg-orange-100 border border-orange-300 text-orange-800 text-xs p-2 rounded mb-2">
                              Tarif introuvable pour &quot;{request.userCity}&quot; — configurez cette ville dans les tarifs
                            </div>
                          )}
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-blue-700">Service Fee</span>
                              <span className="font-mono text-blue-900">${fees.serviceFee.toFixed(2)}</span>
                            </div>
                            {(!hasSpecialItem || state.chargeByWeight) && (
                              <div className="flex justify-between">
                                <span className="text-blue-700">Poids ({state.weight || '0'} lbs x ${fees.pricePerLb.toFixed(2)})</span>
                                <span className="font-mono text-blue-900">${fees.weightCost.toFixed(2)}</span>
                              </div>
                            )}
                            {hasSpecialItem && (
                              <div className="flex justify-between text-purple-700">
                                <span>Article Special ({selectedItem?.itemName || ''})</span>
                                <span className="font-mono font-bold">${fees.specialItemFee.toFixed(2)}</span>
                              </div>
                            )}
                            {fees.customsFees > 0 && (
                              <div className="flex justify-between text-red-700">
                                <span>Frais de Douane</span>
                                <span className="font-mono font-bold">${fees.customsFees.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="border-t border-blue-200 pt-2 flex justify-between">
                              <span className="font-bold text-blue-900">TOTAL</span>
                              <span className="font-mono font-bold text-lg text-blue-900">${fees.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3 pt-2">
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
                                Approuver & Generer Tracking AS
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
                              Confirmez le poids, la categorie ET le statut initial pour pouvoir approuver
                            </p>
                          </div>
                        )}
                      </div>
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
