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
  CheckCircle,
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
  ExternalLink,
  Eye,
  Star,
  Gift,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
} from 'lucide-react';
import { CardSkeleton } from '@/components/admin/LoadingSpinner';
import TransferSuccessModal from '@/components/admin/TransferSuccessModal';

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
  // Loyalty data
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

export default function UsersPage() {
  const cache = useAdminCache();
  const cachedData = cache.get<{ users: UserData[]; pagination: PaginationInfo }>('admin-users');

  const [loading, setLoading] = useState(!cachedData);
  const [users, setUsers] = useState<UserData[]>(cachedData?.users || []);
  const [pagination, setPagination] = useState<PaginationInfo>(
    cachedData?.pagination || { page: 1, limit: 20, totalCount: 0, totalPages: 0 },
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [addPackageUser, setAddPackageUser] = useState<UserData | null>(null);
  const [addPackageForm, setAddPackageForm] = useState({
    externalTrackingNumber: '',
    category: 'general',
    weight: '',
    description: '',
    city: '',
  });
  const [addPackageLoading, setAddPackageLoading] = useState(false);
  const [addPackageResult, setAddPackageResult] = useState<{ trackingNumber: string } | null>(null);
  const [cityPricing, setCityPricing] = useState<{ city: string; serviceFee: number; pricePerLb: number }[]>([]);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferInfo, setTransferInfo] = useState<any>(null);
  const router = useRouter();
  const initialFetchDone = useRef(!!cachedData);

  const fetchUsers = useCallback(async (page: number, search: string) => {
    if (!initialFetchDone.current) setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (search) params.set('search', search);

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
      cache.set('admin-users', { users: fetchedUsers, pagination: fetchedPagination });
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [cache]);

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
        fetchUsers(1, searchInput);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, searchQuery, fetchUsers]);

  useEffect(() => {
    fetch('/api/pricing/all')
      .then((res) => res.json())
      .then((data) => setCityPricing(data.cities || []))
      .catch(() => {});
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchUsers(newPage, searchQuery);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers(pagination.page, searchQuery);
    setRefreshing(false);
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Packages', 'Total Spent', 'Status', 'Joined'];
    const rows = users.map((u) => [
      u.name,
      u.email,
      u.phone || 'N/A',
      u.totalPackages,
      u.totalSpent,
      u.status,
      u.joinedAt,
    ]);
    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenAddPackage = (user: UserData) => {
    setAddPackageUser(user);
    setAddPackageForm({
      externalTrackingNumber: '',
      category: 'general',
      weight: '',
      description: '',
      city: user.city || '',
    });
    setAddPackageResult(null);
  };

  const handleAddPackageSubmit = async () => {
    if (!addPackageUser || !addPackageUser.dbId) return;
    setAddPackageLoading(true);
    try {
      const response = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: addPackageUser.dbId,
          externalTrackingNumber: addPackageForm.externalTrackingNumber,
          category: addPackageForm.category,
          weight: addPackageForm.weight,
          description: addPackageForm.description,
        }),
      });
      if (!response.ok) throw new Error('Failed to create package');
      const data = await response.json();
      setAddPackageResult({ trackingNumber: data.package.trackingNumber });

      // Show transfer modal with package details
      const fees = getCalculatedFees();
      setTransferInfo({
        packageId: data.package.id,
        trackingNumber: data.package.trackingNumber,
        userId: addPackageUser.dbId,
        userName: `${addPackageUser.firstName || ''} ${addPackageUser.lastName || ''}`.trim() || addPackageUser.email,
        userEmail: addPackageUser.email,
        userPhone: addPackageUser.phone,
        userWhatsappPhone: addPackageUser.whatsappPhone,
        userCity: addPackageUser.city,
        transferType: 'admin_assigned' as const,
        oldTotalCost: '5.00', // Default Alliance Shipping fee
        newTotalCost: fees.total.toFixed(2),
      });
      setShowTransferModal(true);
    } catch (error) {
      console.error('Error creating package:', error);
      alert('Erreur lors de la creation du colis.');
    } finally {
      setAddPackageLoading(false);
    }
  };

  const getCalculatedFees = () => {
    const w = parseFloat(addPackageForm.weight) || 0;
    const userCity = addPackageUser?.city || addPackageForm.city;
    const pricing = cityPricing.find((c) => c.city === userCity);
    if (!pricing) return { serviceFee: 5, weightCost: w * 4, total: 5 + w * 4 };
    return {
      serviceFee: pricing.serviceFee,
      weightCost: w * pricing.pricePerLb,
      total: pricing.serviceFee + w * pricing.pricePerLb,
    };
  };

  const formatLastSeen = (ts: number | null) => {
    if (!ts) return 'Never';
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(ts).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const totalUsers = pagination.totalCount;
  const activeUsers = users.filter((u) => u.status === 'active').length;
  const bannedUsers = users.filter((u) => u.status === 'banned').length;
  const startIndex = (pagination.page - 1) * pagination.limit + 1;
  const endIndex = Math.min(pagination.page * pagination.limit, pagination.totalCount);

  if (loading && users.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-9 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="mt-2 h-5 w-64 bg-gray-200 rounded animate-pulse" />
        </div>
        <CardSkeleton count={3} />
        <div className="h-12 max-w-md bg-gray-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="theme-card rounded-2xl border border-gray-100 p-6 animate-pulse">
              <div className="flex items-center gap-4 mb-5">
                <div className="h-14 w-14 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="h-16 bg-gray-200 rounded-xl" />
                <div className="h-16 bg-gray-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage all registered users from Clerk
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="theme-card rounded-xl border border-gray-100 p-5 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="theme-card rounded-xl border border-gray-100 p-5 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active (this page)</p>
              <p className="text-2xl font-bold text-gray-900">{activeUsers}</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="theme-card rounded-xl border border-gray-100 p-5 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-xl">
              <UserX className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Banned (this page)</p>
              <p className="text-2xl font-bold text-gray-900">{bannedUsers}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        {searchQuery && (
          <span className="text-sm text-gray-500">
            {pagination.totalCount} result{pagination.totalCount !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
          </span>
        )}
      </div>

      {/* User Cards Grid */}
      {users.length === 0 ? (
        <div className="theme-card rounded-2xl border border-gray-100 p-12 text-center">
          <Users className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium text-lg">No users found</p>
          <p className="text-sm text-gray-400 mt-1">
            {searchQuery ? 'Try adjusting your search' : 'Users will appear here once they sign up'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {users.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => setSelectedUser(user)}
              className="group theme-card rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all duration-200 cursor-pointer overflow-hidden"
            >
              {/* Card Header with gradient accent */}
              <div className="relative h-20 bg-gradient-to-r from-primary-500 to-primary-600">
                <div className="absolute -bottom-7 left-5">
                  {user.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={user.name}
                      className="h-14 w-14 rounded-full object-cover ring-4 ring-white shadow-sm"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-xl font-bold ring-4 ring-white shadow-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                {/* Status badge */}
                <div className="absolute top-3 right-3">
                  {user.status === 'active' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-white/20 text-white backdrop-blur-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-300 animate-pulse" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-red-500/30 text-white backdrop-blur-sm">
                      <Ban className="h-3 w-3" />
                      Banned
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="pt-10 px-5 pb-5">
                {/* Name & Last seen */}
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                      {user.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatLastSeen(user.lastSignInAt)}
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-300 group-hover:text-primary-400 transition-colors flex-shrink-0 mt-1" />
                </div>

                {/* Contact Info */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="p-1 bg-gray-50 rounded">
                      <Mail className="h-3 w-3 text-gray-400" />
                    </div>
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="p-1 bg-blue-50 rounded">
                      <Phone className="h-3 w-3 text-blue-500" />
                    </div>
                    <span className="font-medium">{user.phone || 'Aucun'}</span>
                  </div>
                  {user.whatsappPhone && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="p-1 bg-green-50 rounded">
                        <MessageCircle className="h-3 w-3 text-green-500" />
                      </div>
                      <span>{user.whatsappPhone}</span>
                    </div>
                  )}
                  {user.city && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="p-1 bg-emerald-50 rounded">
                        <MapPin className="h-3 w-3 text-emerald-500" />
                      </div>
                      <span className="font-medium">{user.city}</span>
                    </div>
                  )}
                  {user.warehouseName && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="p-1 bg-orange-50 rounded">
                        <Building2 className="h-3 w-3 text-orange-500" />
                      </div>
                      <span className="truncate">{user.warehouseName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
                    <Calendar className="h-3 w-3" />
                    <span>Joined {user.joinedAt}</span>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-primary-50 rounded-xl p-2.5 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                      <PackageIcon className="h-3.5 w-3.5 text-primary-500" />
                      <span className="text-base font-bold text-primary-700">{user.totalPackages}</span>
                    </div>
                    <p className="text-[10px] font-medium text-primary-400 uppercase tracking-wider">Packages</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-2.5 text-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <DollarSign className="h-3.5 w-3.5 text-green-500" />
                      <span className="text-base font-bold text-green-700">{user.totalSpent.replace('$', '')}</span>
                    </div>
                    <p className="text-[10px] font-medium text-green-400 uppercase tracking-wider">Spent</p>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-2.5 text-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Star className="h-3.5 w-3.5 text-yellow-500" />
                      <span className="text-base font-bold text-yellow-700">{user.pointsBalance.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] font-medium text-yellow-500 uppercase tracking-wider">Points</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-2.5 text-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Gift className="h-3.5 w-3.5 text-purple-500" />
                      <span className="text-base font-bold text-purple-700">${user.creditBalance.toFixed(2)}</span>
                    </div>
                    <p className="text-[10px] font-medium text-purple-400 uppercase tracking-wider">Credits</p>
                  </div>
                </div>

                {/* Transactions mini info */}
                {user.transactionCount > 0 && (
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {user.transactionCount} transaction{user.transactionCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/admin/users/${user.id}`);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-700 text-sm font-medium rounded-xl hover:bg-primary-50 hover:text-primary-700 transition-colors border border-gray-100 hover:border-primary-200"
                  >
                    <Eye className="h-4 w-4" />
                    View Packages & Details
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // ⭐ Redirect to new package page with user pre-selected
                      router.push(`/admin/packages/new?userId=${user.dbId}`);
                    }}
                    title="Ajouter un colis"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-green-50 text-green-700 text-sm font-medium rounded-xl hover:bg-green-100 transition-colors border border-green-100 hover:border-green-200"
                  >
                    <PackageIcon className="h-4 w-4" />
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 0 && (
        <div className="theme-card rounded-xl border border-gray-100 px-5 py-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-gray-600">
            Showing{' '}
            <span className="font-medium">{startIndex}-{endIndex}</span>{' '}
            of <span className="font-medium">{pagination.totalCount}</span> users
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
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
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="theme-card rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              {/* Modal Header */}
              <div className="relative bg-gradient-to-br from-primary-600 via-primary-600 to-primary-700 px-6 py-10">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
                <button
                  onClick={() => setSelectedUser(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="relative flex flex-col items-center text-center">
                  {selectedUser.imageUrl ? (
                    <img
                      src={selectedUser.imageUrl}
                      alt={selectedUser.name}
                      className="h-20 w-20 rounded-full object-cover ring-4 ring-white/25 shadow-lg mb-3"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-white/15 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white/25 shadow-lg mb-3">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <h2 className="text-xl font-bold text-white">{selectedUser.name}</h2>
                  <p className="text-primary-200 text-sm mt-0.5">{selectedUser.email}</p>
                  <div className="mt-2">
                    {selectedUser.status === 'active' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-green-400/20 text-green-100 border border-green-400/20">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-red-400/20 text-red-100 border border-red-400/20">
                        <Ban className="h-3.5 w-3.5" />
                        Banned
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                {/* Main Stats */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="bg-primary-50 rounded-xl p-3 text-center">
                    <PackageIcon className="h-5 w-5 text-primary-500 mx-auto mb-1" />
                    <p className="text-xl font-bold text-gray-900">{selectedUser.totalPackages}</p>
                    <p className="text-[10px] font-medium text-primary-400 uppercase tracking-wider">Packages</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <DollarSign className="h-5 w-5 text-green-500 mx-auto mb-1" />
                    <p className="text-xl font-bold text-gray-900">{selectedUser.totalSpent}</p>
                    <p className="text-[10px] font-medium text-green-400 uppercase tracking-wider">Total Spent</p>
                  </div>
                </div>

                {/* Loyalty Section */}
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-50 to-yellow-50 px-4 py-3 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <Gift className="h-4 w-4 text-purple-500" />
                      Loyalty & Points
                    </h3>
                  </div>
                  <div className="p-4 space-y-4">
                    {/* Points Summary */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-yellow-50 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-yellow-700">{selectedUser.pointsBalance.toLocaleString()}</p>
                        <p className="text-[10px] font-medium text-yellow-500 uppercase">Balance</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          <ArrowUpRight className="h-3 w-3 text-green-500" />
                          <p className="text-lg font-bold text-green-700">{selectedUser.totalPointsEarned.toLocaleString()}</p>
                        </div>
                        <p className="text-[10px] font-medium text-green-500 uppercase">Earned</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          <ArrowDownRight className="h-3 w-3 text-red-500" />
                          <p className="text-lg font-bold text-red-600">{selectedUser.totalPointsUsed.toLocaleString()}</p>
                        </div>
                        <p className="text-[10px] font-medium text-red-400 uppercase">Used</p>
                      </div>
                    </div>

                    {/* Credits Summary */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Credits ($)</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-purple-50 rounded-lg p-3 text-center">
                          <p className="text-lg font-bold text-purple-700">${selectedUser.creditBalance.toFixed(2)}</p>
                          <p className="text-[10px] font-medium text-purple-400 uppercase">Balance</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 text-center">
                          <p className="text-lg font-bold text-green-700">${selectedUser.totalCreditsEarned.toFixed(2)}</p>
                          <p className="text-[10px] font-medium text-green-500 uppercase">Earned</p>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-3 text-center">
                          <p className="text-lg font-bold text-orange-600">${selectedUser.totalCreditsRedeemed.toFixed(2)}</p>
                          <p className="text-[10px] font-medium text-orange-400 uppercase">Redeemed</p>
                        </div>
                      </div>
                    </div>

                    {/* Recent Transactions */}
                    {selectedUser.recentTransactions && selectedUser.recentTransactions.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          Recent Transactions ({selectedUser.transactionCount} total)
                        </p>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {selectedUser.recentTransactions.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className={`p-1.5 rounded-md ${
                                  tx.type === 'shipment' ? 'bg-green-100' :
                                  tx.type === 'weight' ? 'bg-yellow-100' :
                                  tx.type === 'redemption' ? 'bg-red-100' :
                                  tx.type === 'conversion' ? 'bg-purple-100' :
                                  tx.type === 'spending' ? 'bg-indigo-100' :
                                  'bg-gray-100'
                                }`}>
                                  {tx.type === 'shipment' ? <PackageIcon className="h-3 w-3 text-green-600" /> :
                                   tx.type === 'redemption' ? <ArrowDownRight className="h-3 w-3 text-red-600" /> :
                                   tx.type === 'conversion' ? <TrendingUp className="h-3 w-3 text-purple-600" /> :
                                   tx.type === 'spending' ? <Star className="h-3 w-3 text-indigo-600" /> :
                                   <DollarSign className="h-3 w-3 text-gray-600" />}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-gray-800 capitalize">{tx.type.replace('_', ' ')}</p>
                                  <p className="text-[10px] text-gray-400 truncate">{tx.description || new Date(tx.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0 ml-2">
                                {Math.abs(tx.amount) > 0 && (
                                  <p className={`text-xs font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                                  </p>
                                )}
                                {Math.abs(tx.points) > 0 && (
                                  <p className={`text-[10px] font-medium ${tx.points > 0 ? 'text-blue-600' : 'text-gray-500'}`}>
                                    {tx.points > 0 ? '+' : ''}{tx.points} pts
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Details */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Mail className="h-4 w-4 text-primary-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Email</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{selectedUser.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Phone className="h-4 w-4 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Phone</p>
                      <p className="text-sm font-medium text-gray-900">{selectedUser.phone || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Calendar className="h-4 w-4 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Joined</p>
                      <p className="text-sm font-medium text-gray-900">{selectedUser.joinedAt}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Clock className="h-4 w-4 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Last Sign In</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedUser.lastSignInAt
                          ? new Date(selectedUser.lastSignInAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Never'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <span className="block h-4 w-4 text-[10px] font-bold text-primary-500 leading-4 text-center">ID</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Clerk ID</p>
                      <p className="text-sm font-mono text-gray-900 truncate">{selectedUser.id}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Package Modal */}
      <AnimatePresence>
        {addPackageUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { setAddPackageUser(null); setAddPackageResult(null); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="theme-card rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              {/* Modal Header */}
              <div className="relative bg-gradient-to-br from-green-600 via-green-600 to-green-700 px-6 py-6">
                <button
                  onClick={() => { setAddPackageUser(null); setAddPackageResult(null); }}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/15 rounded-xl">
                    <PackageIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Ajouter un colis</h2>
                    <p className="text-green-100 text-sm">pour {addPackageUser.name}</p>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              {addPackageResult ? (
                <div className="p-6 text-center space-y-4">
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-green-800 mb-1">Colis cree avec succes!</p>
                    <p className="text-xs text-gray-500 mb-2">Numero de suivi Alliance Shipping:</p>
                    <p className="text-lg font-bold text-gray-900 font-mono bg-white px-4 py-2 rounded-lg border border-gray-200 inline-block">
                      {addPackageResult.trackingNumber}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        setAddPackageUser(null);
                        setAddPackageResult(null);
                        await handleRefresh();
                      }}
                      className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      Fermer
                    </button>
                    <button
                      onClick={() => {
                        window.location.href = '/admin/packages';
                      }}
                      className="flex-1 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors"
                    >
                      Voir les colis
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                  {/* External Tracking Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Numero de suivi externe <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={addPackageForm.externalTrackingNumber}
                      onChange={(e) => setAddPackageForm({ ...addPackageForm, externalTrackingNumber: e.target.value })}
                      placeholder="ex: 1Z999AA10123456784"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Categorie</label>
                    <select
                      value={addPackageForm.category}
                      onChange={(e) => setAddPackageForm({ ...addPackageForm, category: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white"
                    >
                      <option value="general">General</option>
                      <option value="clothing">Clothing</option>
                      <option value="electronics">Electronics</option>
                      <option value="food">Food</option>
                      <option value="documents">Documents</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Weight */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Poids (lbs) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={addPackageForm.weight}
                      onChange={(e) => setAddPackageForm({ ...addPackageForm, weight: e.target.value })}
                      placeholder="ex: 2.5"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={addPackageForm.description}
                      onChange={(e) => setAddPackageForm({ ...addPackageForm, description: e.target.value })}
                      placeholder="Description du contenu du colis..."
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm resize-none"
                    />
                  </div>

                  {/* City (only if user has no city) */}
                  {!addPackageUser.city && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Ville de livraison
                      </label>
                      <select
                        value={addPackageForm.city}
                        onChange={(e) => setAddPackageForm({ ...addPackageForm, city: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white"
                      >
                        <option value="">-- Selectionner une ville --</option>
                        {cityPricing.map((cp) => (
                          <option key={cp.city} value={cp.city}>{cp.city}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Fee Summary */}
                  {parseFloat(addPackageForm.weight) > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
                      <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        Estimation des frais
                      </h4>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between text-gray-600">
                          <span>Frais de service</span>
                          <span className="font-medium">${getCalculatedFees().serviceFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Frais de poids ({addPackageForm.weight} lbs)</span>
                          <span className="font-medium">${getCalculatedFees().weightCost.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-1.5 flex justify-between font-semibold text-gray-900">
                          <span>Total</span>
                          <span>${getCalculatedFees().total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={handleAddPackageSubmit}
                    disabled={addPackageLoading || !addPackageForm.externalTrackingNumber || !addPackageForm.weight || !addPackageForm.description}
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addPackageLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Creation en cours...
                      </>
                    ) : (
                      <>
                        <PackageIcon className="h-4 w-4" />
                        <Plus className="h-3.5 w-3.5 -ml-1" />
                        Creer le colis
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transfer Success Modal */}
      <TransferSuccessModal
        isOpen={showTransferModal}
        onClose={() => {
          setShowTransferModal(false);
          setTransferInfo(null);
        }}
        transfer={transferInfo}
      />
    </div>
  );
}
