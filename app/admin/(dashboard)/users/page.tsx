'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAdminCache } from '@/hooks/useAdminCache';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Download,
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Building2,
  Package as PackageIcon,
  Ban,
  Users,
  UserCheck,
  UserX,
  X,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  DollarSign,
  Star,
  Gift,
  Plus,
  Bell,
  Send,
  Crown,
  SlidersHorizontal,
  ArrowUpDown,
  CheckSquare,
  Square,
} from 'lucide-react';
import { CardSkeleton } from '@/components/admin/LoadingSpinner';

interface LoyaltyTransaction {
  id: number;
  amount: number;
  points: number;
  type: string;
  description: string | null;
  createdAt: string;
}

interface UserData {
  id: string;
  dbId: number | null;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  whatsappPhone?: string | null;
  city?: string | null;
  warehouseId?: number | null;
  warehouseName?: string | null;
  imageUrl: string | null;
  totalPackages: number;
  totalSpent: string;
  status: string;
  createdAt: number;
  lastSignInAt: number | null;
  joinedAt: string;
  creditBalance: number;
  totalCreditsEarned: number;
  totalCreditsRedeemed: number;
  pointsBalance: number;
  totalPointsEarned: number;
  totalPointsUsed: number;
  transactionCount: number;
  recentTransactions: LoyaltyTransaction[];
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

// ── VIP Tier Logic ────────────────────────────────────────────────────
const getVipTier = (totalSpent: string, totalPackages: number) => {
  const spent = parseFloat(totalSpent.replace('$', '').replace(',', '')) || 0;
  if (spent >= 500 || totalPackages >= 20)
    return { tier: 'gold', label: 'Gold', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' };
  if (spent >= 200 || totalPackages >= 10)
    return { tier: 'silver', label: 'Silver', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300' };
  if (spent >= 50 || totalPackages >= 5)
    return { tier: 'bronze', label: 'Bronze', bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' };
  return null;
};

export default function UsersPage() {
  const cache = useAdminCache();
  const cachedData = cache.get<{ users: UserData[]; pagination: PaginationInfo }>('admin-users');
  const router = useRouter();

  const [loading, setLoading] = useState(!cachedData);
  const [users, setUsers] = useState<UserData[]>(cachedData?.users || []);
  const [pagination, setPagination] = useState<PaginationInfo>(
    cachedData?.pagination || { page: 1, limit: 20, totalCount: 0, totalPages: 0 },
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const initialFetchDone = useRef(!!cachedData);

  // Filters
  const [cityFilter, setCityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [cities, setCities] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkNotify, setShowBulkNotify] = useState(false);
  const [bulkNotifyForm, setBulkNotifyForm] = useState({ title: '', message: '', type: 'general' });
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });

  const fetchUsers = useCallback(
    async (page: number, search: string, filters?: { city?: string; status?: string; sortBy?: string; sortOrder?: string }) => {
      if (!initialFetchDone.current) setLoading(true);
      try {
        const params = new URLSearchParams({ page: page.toString(), limit: '20' });
        if (search) params.set('search', search);
        if (filters?.city) params.set('city', filters.city);
        if (filters?.status) params.set('status', filters.status);
        if (filters?.sortBy) params.set('sortBy', filters.sortBy);
        if (filters?.sortOrder) params.set('sortOrder', filters.sortOrder);

        const response = await fetch(`/api/admin/users?${params}`);
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        const fetchedUsers = data.users || [];
        const fetchedPagination = {
          page: data.page,
          limit: data.limit,
          totalCount: data.totalCount,
          totalPages: data.totalPages,
        };
        setUsers(fetchedUsers);
        setPagination(fetchedPagination);
        if (data.cities) setCities(data.cities);
        cache.set('admin-users', { users: fetchedUsers, pagination: fetchedPagination });
      } catch (error) {
        console.error('Error loading users:', error);
        setUsers([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [cache],
  );

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchUsers(1, '');
    }
  }, [fetchUsers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchQuery) {
        setSearchQuery(searchInput);
        setSelectedIds(new Set());
        fetchUsers(1, searchInput, { city: cityFilter, status: statusFilter, sortBy, sortOrder });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, searchQuery, fetchUsers, cityFilter, statusFilter, sortBy, sortOrder]);

  const applyFilters = (newFilters: { city?: string; status?: string; sortBy?: string; sortOrder?: string }) => {
    const f = { city: cityFilter, status: statusFilter, sortBy, sortOrder, ...newFilters };
    if (newFilters.city !== undefined) setCityFilter(newFilters.city);
    if (newFilters.status !== undefined) setStatusFilter(newFilters.status);
    if (newFilters.sortBy !== undefined) setSortBy(newFilters.sortBy);
    if (newFilters.sortOrder !== undefined) setSortOrder(newFilters.sortOrder);
    setSelectedIds(new Set());
    fetchUsers(1, searchQuery, f);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setSelectedIds(new Set());
    fetchUsers(newPage, searchQuery, { city: cityFilter, status: statusFilter, sortBy, sortOrder });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers(pagination.page, searchQuery, { city: cityFilter, status: statusFilter, sortBy, sortOrder });
    setRefreshing(false);
  };

  const handleExportCSV = async () => {
    // Fetch ALL users for export
    const params = new URLSearchParams({ page: '1', limit: '500' });
    if (searchQuery) params.set('search', searchQuery);
    if (cityFilter) params.set('city', cityFilter);
    if (statusFilter) params.set('status', statusFilter);

    try {
      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();
      const allUsers: UserData[] = data.users || [];

      const headers = ['Name', 'Email', 'Phone', 'WhatsApp', 'City', 'Warehouse', 'Packages', 'Total Spent', 'Points', 'Credits', 'Status', 'Joined', 'Last Sign In'];
      const rows = allUsers.map((u) => [
        u.name,
        u.email,
        u.phone || '',
        u.whatsappPhone || '',
        u.city || '',
        u.warehouseName || '',
        u.totalPackages,
        u.totalSpent,
        u.pointsBalance,
        `$${u.creditBalance.toFixed(2)}`,
        u.status,
        u.joinedAt,
        u.lastSignInAt ? new Date(u.lastSignInAt).toLocaleDateString('fr-FR') : 'Never',
      ]);
      const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Erreur lors de l\'export');
    }
  };

  // Bulk selection
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === users.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(users.map((u) => u.id)));
    }
  };

  const handleBulkNotify = async () => {
    if (!bulkNotifyForm.title || !bulkNotifyForm.message) return;
    setBulkSending(true);
    const selected = users.filter((u) => selectedIds.has(u.id));
    setBulkProgress({ current: 0, total: selected.length });

    let successCount = 0;
    for (const user of selected) {
      try {
        const res = await fetch(`/api/admin/users/${user.id}/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bulkNotifyForm),
        });
        if (res.ok) successCount++;
      } catch {}
      setBulkProgress((p) => ({ ...p, current: p.current + 1 }));
    }

    setBulkSending(false);
    setShowBulkNotify(false);
    setBulkNotifyForm({ title: '', message: '', type: 'general' });
    setSelectedIds(new Set());
    alert(`Notification envoyee a ${successCount}/${selected.length} utilisateurs`);
  };

  const formatLastSeen = (ts: number | null) => {
    if (!ts) return 'Jamais';
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'En ligne';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}j`;
    return new Date(ts).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const totalUsers = pagination.totalCount;
  const activeUsers = users.filter((u) => u.status === 'active').length;
  const bannedUsers = users.filter((u) => u.status === 'banned').length;
  const startIndex = (pagination.page - 1) * pagination.limit + 1;
  const endIndex = Math.min(pagination.page * pagination.limit, pagination.totalCount);
  const hasActiveFilters = !!cityFilter || !!statusFilter || sortBy !== 'date';

  if (loading && users.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-9 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="mt-2 h-5 w-64 bg-gray-200 rounded animate-pulse" />
        </div>
        <CardSkeleton count={3} />
        <div className="h-12 max-w-md bg-gray-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="theme-card rounded-xl border border-gray-100 p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-12 bg-gray-200 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            {totalUsers} utilisateur{totalUsers !== 1 ? 's' : ''} enregistre{totalUsers !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {selectedIds.size > 0 && (
            <button
              onClick={() => setShowBulkNotify(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifier</span> ({selectedIds.size})
            </button>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* ── Stats Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="theme-card rounded-xl border border-gray-100 p-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-xl font-bold text-gray-900">{totalUsers}</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="theme-card rounded-xl border border-gray-100 p-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-50 rounded-lg">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Actifs</p>
              <p className="text-xl font-bold text-gray-900">{activeUsers}</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="theme-card rounded-xl border border-gray-100 p-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 rounded-lg">
              <UserX className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Bannis</p>
              <p className="text-xl font-bold text-gray-900">{bannedUsers}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Search + Filters ─────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou tel..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
              hasActiveFilters
                ? 'bg-primary-50 text-primary-700 border-primary-200'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtres
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-primary-600 text-white rounded-full">
                {[cityFilter, statusFilter, sortBy !== 'date' ? sortBy : ''].filter(Boolean).length}
              </span>
            )}
          </button>
          {selectedIds.size > 0 && (
            <span className="text-sm text-primary-600 font-medium">
              {selectedIds.size} selectionne{selectedIds.size > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Filter Bar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-500 block mb-1">Ville</label>
                  <select
                    value={cityFilter}
                    onChange={(e) => applyFilters({ city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Toutes les villes</option>
                    {cities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-500 block mb-1">Statut</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => applyFilters({ status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Tous</option>
                    <option value="active">Actif</option>
                    <option value="banned">Banni</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-500 block mb-1">Trier par</label>
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [sb, so] = e.target.value.split('-');
                      applyFilters({ sortBy: sb, sortOrder: so });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="date-desc">Plus recent</option>
                    <option value="date-asc">Plus ancien</option>
                    <option value="name-asc">Nom A-Z</option>
                    <option value="name-desc">Nom Z-A</option>
                    <option value="packages-desc">Plus de colis</option>
                    <option value="spent-desc">Plus depense</option>
                  </select>
                </div>
                {hasActiveFilters && (
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setCityFilter('');
                        setStatusFilter('');
                        setSortBy('date');
                        setSortOrder('desc');
                        fetchUsers(1, searchQuery);
                      }}
                      className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap"
                    >
                      Reinitialiser
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Select All Checkbox ──────────────────────────────────────── */}
      {users.length > 0 && (
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSelectAll}
            className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            {selectedIds.size === users.length ? (
              <CheckSquare className="h-4 w-4 text-primary-600" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            {selectedIds.size === users.length ? 'Tout deselectionner' : 'Tout selectionner'}
          </button>
        </div>
      )}

      {/* ── User Cards Grid ──────────────────────────────────────────── */}
      {users.length === 0 ? (
        <div className="theme-card rounded-xl border border-gray-100 p-12 text-center">
          <Users className="h-14 w-14 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium text-lg">Aucun utilisateur</p>
          <p className="text-sm text-gray-400 mt-1">
            {searchQuery || hasActiveFilters ? 'Essayez de modifier vos filtres' : 'Les utilisateurs apparaitront ici'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {users.map((user, index) => {
            const vip = getVipTier(user.totalSpent, user.totalPackages);
            const isSelected = selectedIds.has(user.id);

            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => router.push(`/admin/users/${user.id}`)}
                className={`group theme-card rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer p-4 ${
                  isSelected ? 'border-primary-300 bg-primary-50/30 ring-1 ring-primary-200' : 'border-gray-100 hover:border-primary-200'
                }`}
              >
                {/* Top: Checkbox + Avatar + Name + Badges + Add Button */}
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSelect(user.id); }}
                    className="mt-0.5 flex-shrink-0"
                  >
                    {isSelected ? (
                      <CheckSquare className="h-4 w-4 text-primary-600" />
                    ) : (
                      <Square className="h-4 w-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
                    )}
                  </button>

                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {user.imageUrl ? (
                      <img src={user.imageUrl} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Name + badges */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-semibold text-gray-900 truncate text-sm group-hover:text-primary-700 transition-colors">
                        {user.name}
                      </h3>
                      {/* Status badge */}
                      {user.status === 'active' ? (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-green-100 text-green-700">
                          <span className="h-1 w-1 rounded-full bg-green-500" />
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-red-100 text-red-700">
                          <Ban className="h-2.5 w-2.5" />
                          Banni
                        </span>
                      )}
                      {/* VIP badge */}
                      {vip && (
                        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold rounded-full border ${vip.bg} ${vip.text} ${vip.border}`}>
                          <Crown className="h-2.5 w-2.5" />
                          {vip.label}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatLastSeen(user.lastSignInAt)}
                      {user.city && (
                        <>
                          <span className="mx-0.5">·</span>
                          <MapPin className="h-3 w-3" />
                          {user.city}
                        </>
                      )}
                    </p>
                  </div>

                  {/* Add package button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/admin/packages/new?userId=${user.dbId}`);
                    }}
                    title="Ajouter un colis"
                    className="flex-shrink-0 p-1.5 text-gray-300 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Contact info as compact line */}
                <div className="mt-2.5 ml-[52px] flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500">
                  <a
                    href={`mailto:${user.email}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 hover:text-primary-600 transition-colors truncate max-w-[180px]"
                    title={user.email}
                  >
                    <Mail className="h-3 w-3 flex-shrink-0 text-gray-400" />
                    <span className="truncate">{user.email}</span>
                  </a>
                  {user.phone && (
                    <a
                      href={`tel:${user.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 hover:text-blue-600 transition-colors"
                    >
                      <Phone className="h-3 w-3 flex-shrink-0 text-blue-400" />
                      {user.phone}
                    </a>
                  )}
                  {user.whatsappPhone && (
                    <a
                      href={`https://wa.me/${user.whatsappPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 hover:text-green-600 transition-colors"
                    >
                      <MessageCircle className="h-3 w-3 flex-shrink-0 text-green-500" />
                      WA
                    </a>
                  )}
                  {user.warehouseName && (
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-3 w-3 flex-shrink-0 text-orange-400" />
                      {user.warehouseName}
                    </span>
                  )}
                </div>

                {/* Stats Row */}
                <div className="mt-3 ml-[52px] grid grid-cols-4 gap-1.5">
                  <div className="bg-primary-50 rounded-lg px-2 py-1.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <PackageIcon className="h-3 w-3 text-primary-500" />
                      <span className="text-sm font-bold text-primary-700">{user.totalPackages}</span>
                    </div>
                    <p className="text-[9px] font-medium text-primary-400 uppercase">Colis</p>
                  </div>
                  <div className="bg-green-50 rounded-lg px-2 py-1.5 text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      <DollarSign className="h-3 w-3 text-green-500" />
                      <span className="text-sm font-bold text-green-700">{user.totalSpent.replace('$', '')}</span>
                    </div>
                    <p className="text-[9px] font-medium text-green-400 uppercase">Depense</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg px-2 py-1.5 text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-sm font-bold text-yellow-700">{user.pointsBalance >= 1000 ? `${(user.pointsBalance / 1000).toFixed(1)}K` : user.pointsBalance}</span>
                    </div>
                    <p className="text-[9px] font-medium text-yellow-500 uppercase">Points</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg px-2 py-1.5 text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      <Gift className="h-3 w-3 text-purple-500" />
                      <span className="text-sm font-bold text-purple-700">${user.creditBalance.toFixed(0)}</span>
                    </div>
                    <p className="text-[9px] font-medium text-purple-400 uppercase">Credits</p>
                  </div>
                </div>

                {/* Bottom: Joined date */}
                <div className="mt-2 ml-[52px] flex items-center justify-between text-[10px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Inscrit {user.joinedAt}
                  </span>
                  {user.transactionCount > 0 && (
                    <span>{user.transactionCount} transaction{user.transactionCount > 1 ? 's' : ''}</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ───────────────────────────────────────────────── */}
      {pagination.totalPages > 0 && (
        <div className="theme-card rounded-xl border border-gray-100 px-4 py-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{startIndex}-{endIndex}</span> sur{' '}
            <span className="font-medium">{pagination.totalCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Precedent</span>
            </button>
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum: number;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      pageNum === pagination.page
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <span className="sm:hidden text-sm text-gray-500">
              {pagination.page}/{pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="hidden sm:inline">Suivant</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Bulk Notification Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {showBulkNotify && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !bulkSending && setShowBulkNotify(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="theme-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <Bell className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Notification groupee</h3>
                    <p className="text-xs text-gray-500">{selectedIds.size} utilisateur{selectedIds.size > 1 ? 's' : ''} selectionne{selectedIds.size > 1 ? 's' : ''}</p>
                  </div>
                </div>
                {!bulkSending && (
                  <button onClick={() => setShowBulkNotify(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                )}
              </div>

              <div className="p-6 space-y-4">
                {/* Selected users preview */}
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                  {users
                    .filter((u) => selectedIds.has(u.id))
                    .map((u) => (
                      <span key={u.id} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {u.name}
                        {!bulkSending && (
                          <button onClick={() => toggleSelect(u.id)} className="hover:text-red-500">
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </span>
                    ))}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Type</label>
                  <select
                    value={bulkNotifyForm.type}
                    onChange={(e) => setBulkNotifyForm((f) => ({ ...f, type: e.target.value }))}
                    disabled={bulkSending}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    <option value="general">General</option>
                    <option value="package_update">Mise a jour colis</option>
                    <option value="delivery">Livraison</option>
                    <option value="payment">Paiement</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Titre</label>
                  <input
                    type="text"
                    value={bulkNotifyForm.title}
                    onChange={(e) => setBulkNotifyForm((f) => ({ ...f, title: e.target.value }))}
                    disabled={bulkSending}
                    placeholder="Titre de la notification..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Message</label>
                  <textarea
                    value={bulkNotifyForm.message}
                    onChange={(e) => setBulkNotifyForm((f) => ({ ...f, message: e.target.value }))}
                    disabled={bulkSending}
                    placeholder="Ecrivez le message..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none disabled:opacity-50"
                  />
                </div>

                {/* Progress bar */}
                {bulkSending && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Envoi en cours...</span>
                      <span>{bulkProgress.current}/{bulkProgress.total}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-600 rounded-full transition-all duration-300"
                        style={{ width: `${bulkProgress.total > 0 ? (bulkProgress.current / bulkProgress.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
                {!bulkSending && (
                  <button
                    onClick={() => setShowBulkNotify(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                )}
                <button
                  onClick={handleBulkNotify}
                  disabled={bulkSending || !bulkNotifyForm.title || !bulkNotifyForm.message || selectedIds.size === 0}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {bulkSending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {bulkSending ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
