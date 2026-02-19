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
  CheckSquare,
  Square,
  ArrowUpDown,
  ChevronDown,
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
const VIP_TIERS = {
  gold: {
    label: 'Gold',
    gradient: 'from-amber-400 via-yellow-400 to-amber-500',
    bgLight: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    accent: 'from-amber-400 to-yellow-500',
  },
  silver: {
    label: 'Silver',
    gradient: 'from-gray-300 via-gray-200 to-gray-400',
    bgLight: 'bg-gray-50',
    text: 'text-gray-600',
    border: 'border-gray-300',
    accent: 'from-gray-300 to-gray-400',
  },
  bronze: {
    label: 'Bronze',
    gradient: 'from-orange-300 via-amber-300 to-orange-400',
    bgLight: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-200',
    accent: 'from-orange-300 to-amber-400',
  },
} as const;

const getVipTier = (totalSpent: string, totalPackages: number) => {
  const spent = parseFloat(totalSpent.replace('$', '').replace(',', '')) || 0;
  if (spent >= 500 || totalPackages >= 20) return VIP_TIERS.gold;
  if (spent >= 200 || totalPackages >= 10) return VIP_TIERS.silver;
  if (spent >= 50 || totalPackages >= 5) return VIP_TIERS.bronze;
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
        u.name, u.email, u.phone || '', u.whatsappPhone || '', u.city || '', u.warehouseName || '',
        u.totalPackages, u.totalSpent, u.pointsBalance, `$${u.creditBalance.toFixed(2)}`, u.status, u.joinedAt,
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
    } catch { alert('Erreur lors de l\'export'); }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.size === users.length ? new Set() : new Set(users.map((u) => u.id)));
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
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bulkNotifyForm),
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
    if (!ts) return 'Jamais vu';
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'En ligne';
    if (mins < 60) return `Vu il y a ${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Vu il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `Vu il y a ${days}j`;
    return `Vu le ${new Date(ts).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`;
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
        <div className="h-9 w-48 bg-gray-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />)}
        </div>
        <div className="h-14 bg-gray-200 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="mt-1 text-sm text-gray-500">
            {totalUsers} utilisateur{totalUsers !== 1 ? 's' : ''} enregistre{totalUsers !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {selectedIds.size > 0 && (
            <button
              onClick={() => setShowBulkNotify(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-all shadow-sm hover:shadow-md"
            >
              <Bell className="h-4 w-4" />
              Notifier ({selectedIds.size})
            </button>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Rafraichir"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExportCSV}
            className="p-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
            title="Exporter CSV"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: totalUsers, icon: Users, color: 'blue', gradient: 'from-blue-500 to-blue-600' },
          { label: 'Actifs', value: activeUsers, icon: UserCheck, color: 'emerald', gradient: 'from-emerald-500 to-emerald-600' },
          { label: 'Bannis', value: bannedUsers, icon: UserX, color: 'red', gradient: 'from-red-500 to-red-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative overflow-hidden theme-card rounded-2xl border border-gray-100 p-5 shadow-sm"
          >
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.gradient} opacity-[0.07] rounded-bl-[60px]`} />
            <div className="flex items-center gap-3">
              <div className={`p-2.5 bg-${stat.color}-50 rounded-xl`}>
                <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Search + Filter Bar ───────────────────────────────────────── */}
      <div className="theme-card rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou telephone..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Status segmented control */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-0.5 flex-shrink-0">
            {[
              { key: '', label: 'Tous' },
              { key: 'active', label: 'Actifs' },
              { key: 'banned', label: 'Bannis' },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => applyFilters({ status: opt.key })}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  statusFilter === opt.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* City filter */}
          {cities.length > 0 && (
            <div className="relative flex-shrink-0">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-500 pointer-events-none" />
              <select
                value={cityFilter}
                onChange={(e) => applyFilters({ city: e.target.value })}
                className="appearance-none pl-9 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-300 cursor-pointer hover:border-gray-300 transition-colors shadow-sm"
              >
                <option value="">Toutes les villes</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          )}

          {/* Sort */}
          <div className="relative flex-shrink-0">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-500 pointer-events-none" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                applyFilters({ sortBy: sb, sortOrder: so });
              }}
              className="appearance-none pl-9 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-300 cursor-pointer hover:border-gray-300 transition-colors shadow-sm"
            >
              <option value="date-desc">Plus recent</option>
              <option value="date-asc">Plus ancien</option>
              <option value="name-asc">Nom A-Z</option>
              <option value="name-desc">Nom Z-A</option>
              <option value="packages-desc">Plus de colis</option>
              <option value="spent-desc">Plus depense</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => {
                setCityFilter('');
                setStatusFilter('');
                setSortBy('date');
                setSortOrder('desc');
                fetchUsers(1, searchQuery);
              }}
              className="px-4 py-3 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors whitespace-nowrap flex-shrink-0"
            >
              Effacer
            </button>
          )}
        </div>

        {/* Select all + selection info */}
        {users.length > 0 && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={toggleSelectAll}
              className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              {selectedIds.size === users.length ? (
                <CheckSquare className="h-4 w-4 text-primary-600" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              {selectedIds.size === users.length ? 'Tout deselectionner' : 'Tout selectionner'}
            </button>
            {selectedIds.size > 0 && (
              <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">
                {selectedIds.size} selectionne{selectedIds.size > 1 ? 's' : ''}
              </span>
            )}
            {searchQuery && (
              <span className="text-xs text-gray-400 ml-auto">
                {pagination.totalCount} resultat{pagination.totalCount !== 1 ? 's' : ''} pour &laquo;{searchQuery}&raquo;
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── User Cards Grid ──────────────────────────────────────────── */}
      {users.length === 0 ? (
        <div className="theme-card rounded-2xl border border-gray-100 p-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4">
            <Users className="h-8 w-8 text-gray-300" />
          </div>
          <p className="text-gray-600 font-semibold text-lg">Aucun utilisateur trouve</p>
          <p className="text-sm text-gray-400 mt-1.5">
            {searchQuery || hasActiveFilters ? 'Essayez de modifier vos filtres ou votre recherche' : 'Les utilisateurs apparaitront ici apres inscription'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {users.map((user, index) => {
            const vip = getVipTier(user.totalSpent, user.totalPackages);
            const isSelected = selectedIds.has(user.id);
            const isOnline = user.lastSignInAt && (Date.now() - user.lastSignInAt) < 300000; // 5 min

            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.3 }}
                onClick={() => router.push(`/admin/users/${user.id}`)}
                className={`group relative theme-card rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  isSelected
                    ? 'border-primary-300 ring-2 ring-primary-100 shadow-md'
                    : 'border-gray-100 shadow-sm hover:border-gray-200'
                }`}
              >
                {/* VIP Accent Bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${vip ? vip.accent : 'from-gray-200 to-gray-300'}`} />

                <div className="p-5">
                  {/* ── Top Row: Checkbox + Avatar + Identity ──────────── */}
                  <div className="flex items-start gap-3.5">
                    {/* Checkbox */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSelect(user.id); }}
                      className="mt-1 flex-shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="h-5 w-5 text-primary-600" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-200 group-hover:text-gray-400 transition-colors" />
                      )}
                    </button>

                    {/* Avatar with online indicator */}
                    <div className="relative flex-shrink-0">
                      {user.imageUrl ? (
                        <img src={user.imageUrl} alt={user.name} className="h-14 w-14 rounded-xl object-cover shadow-sm" />
                      ) : (
                        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-lg font-bold shadow-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white ${
                        isOnline ? 'bg-green-500' : user.lastSignInAt ? 'bg-gray-300' : 'bg-gray-200'
                      }`} />
                    </div>

                    {/* Name + Status + VIP */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-primary-700 transition-colors">
                        {user.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {user.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-red-50 text-red-700 border border-red-200">
                            <Ban className="h-3 w-3" /> Banni
                          </span>
                        )}
                        {vip && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md border ${vip.bgLight} ${vip.text} ${vip.border}`}>
                            <Crown className="h-3 w-3" /> {vip.label}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        {formatLastSeen(user.lastSignInAt)}
                      </p>
                    </div>
                  </div>

                  {/* ── KEY INFO: Ville, Depot, Numeros (LARGE) ────────── */}
                  <div className="mt-4 space-y-2.5">
                    {/* Ville */}
                    <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl px-4 py-3 border border-blue-100/60">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest">Ville</p>
                        <p className="text-base font-bold text-gray-900 truncate">{user.city || 'Non definie'}</p>
                      </div>
                    </div>

                    {/* Depot */}
                    <div className="flex items-center gap-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl px-4 py-3 border border-violet-100/60">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Building2 className="h-5 w-5 text-violet-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold text-violet-400 uppercase tracking-widest">Depot</p>
                        <p className="text-base font-bold text-gray-900 truncate">{user.warehouseName || 'Non assigne'}</p>
                      </div>
                    </div>

                    {/* WhatsApp - HERO */}
                    {user.whatsappPhone ? (
                      <a
                        href={`https://wa.me/${user.whatsappPhone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl px-4 py-3 border border-green-200/60 hover:border-green-300 hover:shadow-md transition-all group/wa"
                      >
                        <div className="p-2 bg-green-500 rounded-lg shadow-sm group-hover/wa:bg-green-600 transition-colors">
                          <MessageCircle className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-semibold text-green-500 uppercase tracking-widest">WhatsApp</p>
                          <p className="text-base font-bold text-gray-900 group-hover/wa:text-green-700 transition-colors">{user.whatsappPhone}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-green-400 group-hover/wa:text-green-600 group-hover/wa:translate-x-0.5 transition-all" />
                      </a>
                    ) : (
                      <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                        <div className="p-2 bg-gray-200 rounded-lg">
                          <MessageCircle className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">WhatsApp</p>
                          <p className="text-sm text-gray-400">Non renseigne</p>
                        </div>
                      </div>
                    )}

                    {/* Telephone */}
                    {user.phone && (
                      <a
                        href={`tel:${user.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-3 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl px-4 py-3 border border-sky-100/60 hover:border-sky-200 hover:shadow-md transition-all group/tel"
                      >
                        <div className="p-2 bg-sky-500 rounded-lg shadow-sm group-hover/tel:bg-sky-600 transition-colors">
                          <Phone className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-semibold text-sky-400 uppercase tracking-widest">Telephone</p>
                          <p className="text-base font-bold text-gray-900 group-hover/tel:text-sky-700 transition-colors">{user.phone}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-sky-400 group-hover/tel:text-sky-600 group-hover/tel:translate-x-0.5 transition-all" />
                      </a>
                    )}
                  </div>

                  {/* ── Email (compact) ────────────────────────────────── */}
                  <a
                    href={`mailto:${user.email}`}
                    onClick={(e) => e.stopPropagation()}
                    title={user.email}
                    className="mt-2.5 flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-500 hover:bg-primary-50 hover:text-primary-700 transition-all border border-transparent hover:border-primary-200 truncate"
                  >
                    <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </a>

                  {/* ── Stats Row (SMALL) ──────────────────────────────── */}
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    <div className="text-center py-2 bg-gray-50 rounded-lg">
                      <p className="text-sm font-bold text-gray-700">{user.totalPackages}</p>
                      <p className="text-[9px] font-semibold text-gray-400 uppercase">Colis</p>
                    </div>
                    <div className="text-center py-2 bg-gray-50 rounded-lg">
                      <p className="text-sm font-bold text-gray-700">{user.totalSpent}</p>
                      <p className="text-[9px] font-semibold text-gray-400 uppercase">Depense</p>
                    </div>
                    <div className="text-center py-2 bg-gray-50 rounded-lg">
                      <p className="text-sm font-bold text-yellow-600">{user.pointsBalance}</p>
                      <p className="text-[9px] font-semibold text-gray-400 uppercase">Points</p>
                    </div>
                    <div className="text-center py-2 bg-gray-50 rounded-lg">
                      <p className="text-sm font-bold text-purple-600">${user.creditBalance.toFixed(2)}</p>
                      <p className="text-[9px] font-semibold text-gray-400 uppercase">Credits</p>
                    </div>
                  </div>

                  {/* ── Add Package Button ─────────────────────────────── */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/admin/packages/new?userId=${user.dbId}`);
                    }}
                    className="mt-3 w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                  >
                    <PackageIcon className="h-5 w-5" />
                    <Plus className="h-4 w-4 -ml-2" />
                    Ajouter un colis
                  </button>

                  {/* ── Footer ─────────────────────────────────────────── */}
                  <p className="mt-2.5 text-center text-[11px] text-gray-400">
                    <Calendar className="inline h-3 w-3 mr-1" />
                    Inscrit {user.joinedAt}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ────────────────────────────────────────────────── */}
      {pagination.totalPages > 0 && (
        <div className="theme-card rounded-2xl border border-gray-100 px-5 py-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-gray-500">
            Affichage <span className="font-semibold text-gray-900">{startIndex}-{endIndex}</span> sur{' '}
            <span className="font-semibold text-gray-900">{pagination.totalCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="inline-flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Precedent</span>
            </button>
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum: number;
                if (pagination.totalPages <= 5) pageNum = i + 1;
                else if (pagination.page <= 3) pageNum = i + 1;
                else if (pagination.page >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;
                else pageNum = pagination.page - 2 + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-all ${
                      pageNum === pagination.page
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <span className="sm:hidden text-sm font-medium text-gray-500">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="inline-flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="hidden sm:inline">Suivant</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Bulk Notification Modal ───────────────────────────────────── */}
      <AnimatePresence>
        {showBulkNotify && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !bulkSending && setShowBulkNotify(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="theme-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/15 rounded-xl">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Notification groupee</h3>
                    <p className="text-primary-200 text-xs">{selectedIds.size} destinataire{selectedIds.size > 1 ? 's' : ''}</p>
                  </div>
                </div>
                {!bulkSending && (
                  <button onClick={() => setShowBulkNotify(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                    <X className="h-5 w-5 text-white/80" />
                  </button>
                )}
              </div>

              <div className="p-6 space-y-4">
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                  {users.filter((u) => selectedIds.has(u.id)).map((u) => (
                    <span key={u.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                      {u.name}
                      {!bulkSending && (
                        <button onClick={() => toggleSelect(u.id)} className="hover:text-red-500 transition-colors"><X className="h-3 w-3" /></button>
                      )}
                    </span>
                  ))}
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Type</label>
                  <select value={bulkNotifyForm.type} onChange={(e) => setBulkNotifyForm((f) => ({ ...f, type: e.target.value }))} disabled={bulkSending}
                    className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50">
                    <option value="general">General</option>
                    <option value="package_update">Mise a jour colis</option>
                    <option value="delivery">Livraison</option>
                    <option value="payment">Paiement</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Titre</label>
                  <input type="text" value={bulkNotifyForm.title} onChange={(e) => setBulkNotifyForm((f) => ({ ...f, title: e.target.value }))} disabled={bulkSending}
                    placeholder="Titre de la notification..." className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Message</label>
                  <textarea value={bulkNotifyForm.message} onChange={(e) => setBulkNotifyForm((f) => ({ ...f, message: e.target.value }))} disabled={bulkSending}
                    placeholder="Ecrivez le message..." rows={4} className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none disabled:opacity-50" />
                </div>

                {bulkSending && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Envoi en cours...</span>
                      <span className="font-semibold">{bulkProgress.current}/{bulkProgress.total}</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${bulkProgress.total > 0 ? (bulkProgress.current / bulkProgress.total) * 100 : 0}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
                {!bulkSending && (
                  <button onClick={() => setShowBulkNotify(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                    Annuler
                  </button>
                )}
                <button onClick={handleBulkNotify} disabled={bulkSending || !bulkNotifyForm.title || !bulkNotifyForm.message || selectedIds.size === 0}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-all disabled:opacity-50 shadow-sm hover:shadow-md">
                  {bulkSending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
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
