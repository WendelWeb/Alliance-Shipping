'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRightLeft,
  Calendar,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  Mail,
  Phone,
  User,
  Package,
  DollarSign,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Transfer {
  id: number;
  packageId: number;
  requestId: number | null;
  oldServiceFee: string;
  oldWeightCost: string;
  oldTotalCost: string;
  newServiceFee: string;
  newWeightCost: string;
  newTotalCost: string;
  oldCity: string | null;
  newCity: string;
  transferType: 'user_claimed' | 'admin_assigned';
  transferredBy: number | null;
  notes: string | null;
  transferredAt: string;
  trackingNumber: string;
  externalTrackingNumber: string | null;
  description: string | null;
  weight: string;
  status: string;
  userId: number;
  userEmail: string;
  userFirstName: string | null;
  userLastName: string | null;
  userPhone: string | null;
  userWhatsappPhone: string | null;
}

interface Stats {
  total: number;
  totalToday: number;
  userClaimed: number;
  adminAssigned: number;
  averageDelta: number;
}

const periodPresets = [
  { label: 'Aujourd\'hui', value: 'today' },
  { label: 'Cette semaine', value: 'week' },
  { label: 'Ce mois', value: 'month' },
  { label: 'Personnalisé', value: 'custom' },
];

const cities = ['Port-au-Prince', 'Cap-Haïtien', 'Port-de-Paix'];

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    totalToday: 0,
    userClaimed: 0,
    adminAssigned: 0,
    averageDelta: 0,
  });
  const [byCity, setByCity] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const handleCancelTransfer = async (transferId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce transfert ? Le colis retournera au compte Alliance Shipping.')) {
      return;
    }

    setCancellingId(transferId);
    try {
      const res = await fetch(`/api/admin/transfers/${transferId}/cancel`, {
        method: 'POST',
      });
      const data = await res.json();

      if (data.success) {
        alert('Transfert annulé avec succès !');
        fetchTransfers(); // Refresh the list
      } else {
        alert(`Erreur: ${data.error}`);
      }
    } catch (error) {
      console.error('Error cancelling transfer:', error);
      alert('Erreur lors de l\'annulation du transfert');
    } finally {
      setCancellingId(null);
    }
  };

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', '50');

      // Period filter
      if (selectedPeriod === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        params.set('startDate', today.toISOString());
      } else if (selectedPeriod === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);
        params.set('startDate', weekAgo.toISOString());
      } else if (selectedPeriod === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        monthAgo.setHours(0, 0, 0, 0);
        params.set('startDate', monthAgo.toISOString());
      } else if (selectedPeriod === 'custom') {
        if (customStartDate) params.set('startDate', new Date(customStartDate).toISOString());
        if (customEndDate) params.set('endDate', new Date(customEndDate).toISOString());
      }

      if (selectedCity) params.set('ville', selectedCity);
      if (selectedType) params.set('type', selectedType);
      if (userSearch.trim()) params.set('userSearch', userSearch.trim());

      const res = await fetch(`/api/admin/transfers?${params}`);
      const data = await res.json();

      if (data.success) {
        setTransfers(data.transfers);
        setStats(data.stats);
        setByCity(data.byCity);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching transfers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, [selectedPeriod, customStartDate, customEndDate, selectedCity, selectedType, currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (userSearch || userSearch === '') {
        setCurrentPage(1);
        fetchTransfers();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [userSearch]);

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `$${num.toFixed(2)}`;
  };

  const calculateDelta = (oldTotal: string, newTotal: string) => {
    return parseFloat(newTotal) - parseFloat(oldTotal);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('fr-HT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transferts de colis</h1>
          <p className="mt-1 text-sm text-gray-500">
            Suivi complet des transferts Alliance Shipping &rarr; Utilisateurs
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-lg theme-surface shadow"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowRightLeft className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total transferts</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.total}</div>
                    <div className="ml-2 text-sm text-gray-500">({stats.totalToday} aujourd&apos;hui)</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="overflow-hidden rounded-lg theme-surface shadow"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Réclamés par utilisateurs</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.userClaimed}</div>
                    <div className="ml-2 text-sm text-green-600">
                      {stats.total > 0 ? `${((stats.userClaimed / stats.total) * 100).toFixed(0)}%` : '0%'}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="overflow-hidden rounded-lg theme-surface shadow"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Assignés par admin</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.adminAssigned}</div>
                    <div className="ml-2 text-sm text-blue-600">
                      {stats.total > 0 ? `${((stats.adminAssigned / stats.total) * 100).toFixed(0)}%` : '0%'}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="overflow-hidden rounded-lg theme-surface shadow"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className={cn(
                  'h-6 w-6',
                  stats.averageDelta > 0 ? 'text-red-600' : stats.averageDelta < 0 ? 'text-green-600' : 'text-gray-600'
                )} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Delta moyen</dt>
                  <dd className="flex items-baseline">
                    <div className={cn(
                      'text-2xl font-semibold',
                      stats.averageDelta > 0 ? 'text-red-600' : stats.averageDelta < 0 ? 'text-green-600' : 'text-gray-900'
                    )}>
                      {stats.averageDelta >= 0 ? '+' : ''}{formatCurrency(stats.averageDelta)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="theme-surface rounded-lg shadow p-6 space-y-4">
        {/* Period Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Période</label>
          <div className="flex flex-wrap gap-2">
            {periodPresets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setSelectedPeriod(preset.value)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  selectedPeriod === preset.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Range */}
        {selectedPeriod === 'custom' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        )}

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* City Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ville de destination</label>
            <select
              value={selectedCity || ''}
              onChange={(e) => setSelectedCity(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Toutes les villes</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city} {byCity[city] ? `(${byCity[city]})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de transfert</label>
            <select
              value={selectedType || ''}
              onChange={(e) => setSelectedType(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Tous les types</option>
              <option value="user_claimed">Réclamé par utilisateur</option>
              <option value="admin_assigned">Assigné par admin</option>
            </select>
          </div>

          {/* User Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recherche utilisateur</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Email, nom, tracking..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Transfers Table */}
      <div className="theme-surface rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Historique des transferts ({total})
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-500">Chargement...</p>
          </div>
        ) : transfers.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun transfert</h3>
            <p className="mt-1 text-sm text-gray-500">Aucun transfert trouvé avec ces filtres.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Colis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ville
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ancien prix
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nouveau prix
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transfers.map((transfer) => {
                    const delta = calculateDelta(transfer.oldTotalCost, transfer.newTotalCost);
                    const userName = `${transfer.userFirstName || ''} ${transfer.userLastName || ''}`.trim() || transfer.userEmail;

                    return (
                      <tr key={transfer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Package className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{transfer.trackingNumber}</div>
                              {transfer.externalTrackingNumber && (
                                <div className="text-xs text-gray-500">{transfer.externalTrackingNumber}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{userName}</div>
                              <div className="text-xs text-gray-500">{transfer.userEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={cn(
                            'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                            transfer.transferType === 'user_claimed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          )}>
                            {transfer.transferType === 'user_claimed' ? 'Réclamé' : 'Assigné'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transfer.newCity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(transfer.oldTotalCost)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(transfer.newTotalCost)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={cn(
                            'flex items-center text-sm font-medium',
                            delta > 0 ? 'text-red-600' : delta < 0 ? 'text-green-600' : 'text-gray-500'
                          )}>
                            {delta > 0 ? (
                              <TrendingUp className="h-4 w-4 mr-1" />
                            ) : delta < 0 ? (
                              <TrendingDown className="h-4 w-4 mr-1" />
                            ) : null}
                            {delta >= 0 ? '+' : ''}{formatCurrency(delta)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(transfer.transferredAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleCancelTransfer(transfer.id)}
                            disabled={cancellingId === transfer.id}
                            className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {cancellingId === transfer.id ? (
                              <>
                                <div className="animate-spin h-3 w-3 border-2 border-red-600 border-t-transparent rounded-full mr-1.5"></div>
                                Annulation...
                              </>
                            ) : (
                              <>
                                <RotateCcw className="h-3 w-3 mr-1.5" />
                                Annuler
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {currentPage} sur {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
