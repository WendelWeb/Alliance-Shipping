'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useCachedFetch } from '@/hooks/useAdminCache';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, Package as PackageIcon, Users, Shield, FileText,
  ArrowRightLeft, TrendingUp, RefreshCw, Download, ChevronDown,
  ArrowUpRight, ArrowDownRight, ArrowRight, ArrowDown, Crown,
  Star, Gift, Clock, Calendar, MapPin, Smartphone, Wifi,
  Check, X, Layers,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

// ── Types ────────────────────────────────────────────────────────────
type TimeRange = 'today' | '7d' | '30d' | '90d' | '1y' | 'all';

interface KPI { value: number; growth: number | null; }

interface AnalyticsData {
  range: string;
  kpis: {
    revenue: KPI; packages: KPI; clients: KPI; customsFees: KPI;
    requests: KPI; transfers: KPI; avgPackageValue: KPI;
  };
  revenueTrend: Array<{ date: string; revenue: number }>;
  packagesTrend: Array<{ date: string; count: number }>;
  cityDistribution: Array<{ city: string; count: number; revenue: number; percentage: number }>;
  funnel: {
    stages: Array<{ status: string; count: number }>;
    timings: Array<{ from: string; to: string; avgHours: number; count: number }>;
  };
  revenueBreakdown: {
    weightCost: number; serviceFee: number; customsFees: number;
    specialItemRevenue: number; normalRevenue: number;
    totalWeightLbs: number; totalQuantity: number;
  };
  specialItems: Array<{ id: number; brand: string; itemName: string; category: string; fixedFee: number; count: number; revenue: number }>;
  regularPackages: { count: number; revenue: number };
  adminPerformance: Array<{ adminId: number; name: string; role: string; actions: number; packagesProcessed: number }>;
  loyalty: {
    issued: { amount: number; points: number };
    redeemed: { amount: number; points: number };
    pointsInCirculation: number;
    programCost: number;
    topUsers: Array<{ userId: number; name: string; points: number; amount: number }>;
  };
  transfersData: {
    trend: Array<{ date: string; total: number; userClaimed: number; adminAssigned: number }>;
    avgPriceDelta: number;
    requestStats: { total: number; approved: number; rejected: number; pending: number; converted: number; approvalRate: number };
  };
  topClients: Array<{ userId: number; clerkId: string; name: string; email: string; city: string; packages: number; revenue: number; loyaltyPoints: number; lastPackage: string }>;
  deliveryMetrics: { avgReceivedToTransit: number; avgTransitToAvailable: number; avgAvailableToDelivered: number; avgTotal: number; deliveredCount: number };
  paymentMethods: Array<{ method: string; count: number; revenue: number; percentage: number }>;
  bundleStats: {
    totalBundles: number;
    totalSavings: number;
    avgPackagesPerBundle: number;
    totalBundleCost: number;
    trend: Array<{ date: string; count: number; savings: number }>;
  };
}

// ── Constants ────────────────────────────────────────────────────────
const CITY_COLORS: Record<string, string> = {
  'Port-au-Prince': '#6366f1',
  'Cap-Haïtien': '#f59e0b',
  'Cap-Haitien': '#f59e0b',
  'Port-de-Paix': '#10b981',
  'Non defini': '#9ca3af',
};
const CITY_FALLBACKS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

const STATUS_COLORS: Record<string, string> = {
  pending: '#eab308', received: '#3b82f6', 'in-transit': '#8b5cf6', available: '#22c55e', delivered: '#14b8a6', Inconnu: '#9ca3af',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente', received: 'Recu', 'in-transit': 'En transit', available: 'Disponible', delivered: 'Livre',
};

const FUNNEL_COLORS = ['#eab308', '#3b82f6', '#8b5cf6', '#22c55e', '#14b8a6'];

const RANGE_LABELS: Record<TimeRange, string> = {
  today: 'Auj.', '7d': '7j', '30d': '30j', '90d': '90j', '1y': '1an', all: 'Tout',
};

const fmt$ = (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
const fmtHours = (h: number) => h < 24 ? `${h.toFixed(1)}h` : `${(h / 24).toFixed(1)}j`;

// ── Component ────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [exportOpen, setExportOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const fetchAnalytics = useCallback(async () => {
    setError(null);
    const response = await fetch(`/api/admin/analytics?range=${timeRange}`);
    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      const msg = `API Error ${response.status}: ${errBody.slice(0, 200)}`;
      console.error('[Analytics]', msg);
      setError(msg);
      throw new Error(msg);
    }
    return response.json();
  }, [timeRange]);

  const { data, loading, refreshing, refresh } = useCachedFetch<AnalyticsData>(
    `admin-analytics-${timeRange}`,
    fetchAnalytics,
  );

  useEffect(() => { refresh(); }, [timeRange]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Export ──────────────────────────────────────────────────────────
  const exportCSV = () => {
    if (!data) return;
    const rows: (string | number)[][] = [
      ['Metrique', 'Valeur', 'Croissance %'],
      ['Revenue', data.kpis.revenue.value, data.kpis.revenue.growth ?? 'N/A'],
      ['Colis', data.kpis.packages.value, data.kpis.packages.growth ?? 'N/A'],
      ['Clients', data.kpis.clients.value, data.kpis.clients.growth ?? 'N/A'],
      ['Douanes', data.kpis.customsFees.value, data.kpis.customsFees.growth ?? 'N/A'],
      ['Requetes', data.kpis.requests.value, data.kpis.requests.growth ?? 'N/A'],
      ['Transferts', data.kpis.transfers.value, data.kpis.transfers.growth ?? 'N/A'],
      ['Moy/Colis', data.kpis.avgPackageValue.value, data.kpis.avgPackageValue.growth ?? 'N/A'],
      [],
      ['--- Top Clients ---'],
      ['Nom', 'Ville', 'Colis', 'Revenue', 'Points'],
      ...data.topClients.map((c) => [c.name, c.city, c.packages, c.revenue, c.loyaltyPoints]),
      [],
      ['--- Distribution Ville ---'],
      ['Ville', 'Colis', 'Revenue', '%'],
      ...data.cityDistribution.map((c) => [c.city, c.count, c.revenue, c.percentage]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  // ── Loading ─────────────────────────────────────────────────────────
  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div><div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" /><div className="mt-2 h-4 w-64 bg-gray-200 rounded animate-pulse" /></div>
          <div className="h-10 w-72 bg-gray-200 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="h-80 bg-gray-200 rounded-2xl animate-pulse" />
          <div className="h-80 bg-gray-200 rounded-2xl animate-pulse" />
        </div>
        <div className="h-32 bg-gray-200 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="h-80 bg-gray-200 rounded-2xl animate-pulse" />
          <div className="h-80 bg-gray-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data) return error ? (
    <div className="p-8 text-center">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
        <X className="h-8 w-8 text-red-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur de chargement</h2>
      <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto break-all">{error}</p>
      <button onClick={refresh} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">Reessayer</button>
    </div>
  ) : null;

  const kpiCards = [
    { key: 'revenue', label: 'Revenue', icon: DollarSign, bg: 'bg-green-50', ic: 'text-green-600', kpi: data.kpis.revenue, format: fmt$ },
    { key: 'packages', label: 'Colis', icon: PackageIcon, bg: 'bg-blue-50', ic: 'text-blue-600', kpi: data.kpis.packages, format: (v: number) => v.toString() },
    { key: 'clients', label: 'Clients', icon: Users, bg: 'bg-purple-50', ic: 'text-purple-600', kpi: data.kpis.clients, format: (v: number) => v.toString() },
    { key: 'customs', label: 'Douanes', icon: Shield, bg: 'bg-amber-50', ic: 'text-amber-600', kpi: data.kpis.customsFees, format: fmt$ },
    { key: 'requests', label: 'Requetes', icon: FileText, bg: 'bg-cyan-50', ic: 'text-cyan-600', kpi: data.kpis.requests, format: (v: number) => v.toString() },
    { key: 'transfers', label: 'Transferts', icon: ArrowRightLeft, bg: 'bg-indigo-50', ic: 'text-indigo-600', kpi: data.kpis.transfers, format: (v: number) => v.toString() },
    { key: 'avg', label: 'Moy/Colis', icon: TrendingUp, bg: 'bg-orange-50', ic: 'text-orange-600', kpi: data.kpis.avgPackageValue, format: fmt$ },
  ];

  const { funnel, deliveryMetrics, loyalty, transfersData } = data;
  const requestStats = transfersData.requestStats;

  // Find timing between funnel stages
  const getTimingBetween = (from: string, to: string) => {
    const t = funnel.timings.find((t) => t.from?.includes(from) && t.to?.includes(to));
    return t ? t.avgHours : null;
  };

  return (
    <div className="space-y-6 pb-8">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics & Revenue</h1>
          <p className="mt-1 text-sm text-gray-500">Suivi complet des performances business</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Time range pills */}
          <div className="inline-flex items-center bg-gray-100 rounded-xl p-1 gap-0.5">
            {(Object.keys(RANGE_LABELS) as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 sm:px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                  timeRange === r ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                {RANGE_LABELS[r]}
              </button>
            ))}
          </div>
          <button onClick={() => refresh()} disabled={refreshing}
            className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <div className="relative" ref={exportRef}>
            <button onClick={() => setExportOpen(!exportOpen)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-sm">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <AnimatePresence>
              {exportOpen && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.12 }}
                  className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-30">
                  <button onClick={exportCSV} className="w-full px-4 py-2.5 text-sm text-left text-gray-700 hover:bg-gray-50 transition-colors">Export CSV</button>
                  <button onClick={() => { window.print(); setExportOpen(false); }} className="w-full px-4 py-2.5 text-sm text-left text-gray-700 hover:bg-gray-50 transition-colors">Imprimer / PDF</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {kpiCards.map((card, i) => (
          <motion.div key={card.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="theme-card rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className={`${card.bg} p-2 rounded-lg`}>
                <card.icon className={`h-4 w-4 ${card.ic}`} />
              </div>
              {card.kpi.growth !== null && (
                <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${card.kpi.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {card.kpi.growth >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {card.kpi.growth >= 0 ? '+' : ''}{card.kpi.growth}%
                </span>
              )}
            </div>
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider truncate">{card.label}</p>
            <p className="mt-0.5 text-lg sm:text-xl font-bold text-gray-900 truncate">{card.format(card.kpi.value)}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Revenue Breakdown ─────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="theme-card rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          Decomposition du Revenue
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
          {[
            { label: 'Frais de Poids', value: data.revenueBreakdown.weightCost, color: 'bg-blue-500', lightBg: 'bg-blue-50', textColor: 'text-blue-700', sub: `${data.revenueBreakdown.totalWeightLbs.toFixed(1)} lbs total` },
            { label: 'Frais de Service', value: data.revenueBreakdown.serviceFee, color: 'bg-emerald-500', lightBg: 'bg-emerald-50', textColor: 'text-emerald-700', sub: `${data.kpis.packages.value} colis` },
            { label: 'Taxes de Douane', value: data.revenueBreakdown.customsFees, color: 'bg-red-500', lightBg: 'bg-red-50', textColor: 'text-red-700', sub: 'Frais douaniers' },
            { label: 'Articles Speciaux', value: data.revenueBreakdown.specialItemRevenue, color: 'bg-purple-500', lightBg: 'bg-purple-50', textColor: 'text-purple-700', sub: `${data.specialItems.reduce((s, i) => s + i.count, 0)} articles` },
            { label: 'Colis Standards', value: data.revenueBreakdown.normalRevenue, color: 'bg-gray-500', lightBg: 'bg-gray-50', textColor: 'text-gray-700', sub: 'Sans article special' },
          ].map((item) => (
            <div key={item.label} className={`${item.lightBg} rounded-xl p-4 border border-gray-100`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                <span className="text-xs font-medium text-gray-500 truncate">{item.label}</span>
              </div>
              <p className={`text-xl font-bold ${item.textColor}`}>{fmt$(item.value)}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
        {/* Horizontal bar breakdown */}
        {data.kpis.revenue.value > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Repartition</p>
            <div className="h-5 rounded-full overflow-hidden flex bg-gray-100">
              {[
                { value: data.revenueBreakdown.weightCost, color: 'bg-blue-500', label: 'Poids' },
                { value: data.revenueBreakdown.serviceFee, color: 'bg-emerald-500', label: 'Service' },
                { value: data.revenueBreakdown.customsFees, color: 'bg-red-500', label: 'Douane' },
                { value: data.revenueBreakdown.specialItemRevenue, color: 'bg-purple-500', label: 'Articles Speciaux' },
                { value: data.revenueBreakdown.normalRevenue, color: 'bg-gray-500', label: 'Colis Standards' },
              ].filter(s => s.value > 0).map((s) => {
                const pct = (s.value / data.kpis.revenue.value) * 100;
                return (
                  <div key={s.label} className={`${s.color} relative group`} style={{ width: `${pct}%` }}
                    title={`${s.label}: ${fmt$(s.value)} (${pct.toFixed(1)}%)`}>
                    {pct > 8 && <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">{pct.toFixed(0)}%</span>}
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> Poids ({((data.revenueBreakdown.weightCost / (data.kpis.revenue.value || 1)) * 100).toFixed(1)}%)</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Service ({((data.revenueBreakdown.serviceFee / (data.kpis.revenue.value || 1)) * 100).toFixed(1)}%)</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Douane ({((data.revenueBreakdown.customsFees / (data.kpis.revenue.value || 1)) * 100).toFixed(1)}%)</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-purple-500" /> Articles Speciaux ({((data.revenueBreakdown.specialItemRevenue / (data.kpis.revenue.value || 1)) * 100).toFixed(1)}%)</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-gray-500" /> Colis Standards ({((data.revenueBreakdown.normalRevenue / (data.kpis.revenue.value || 1)) * 100).toFixed(1)}%)</span>
            </div>
          </div>
        )}
        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-4 text-sm">
          <span className="text-gray-500">Total Quantite: <span className="font-bold text-gray-900">{data.revenueBreakdown.totalQuantity} articles</span></span>
          <span className="text-gray-500">Total Poids: <span className="font-bold text-gray-900">{data.revenueBreakdown.totalWeightLbs.toFixed(1)} lbs</span></span>
          <span className="text-gray-500">Moy/lbs: <span className="font-bold text-gray-900">{data.revenueBreakdown.totalWeightLbs > 0 ? fmt$(data.kpis.revenue.value / data.revenueBreakdown.totalWeightLbs) : '$0'}/lb</span></span>
        </div>
      </motion.div>

      {/* ── Charts Row: Revenue + Packages ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Revenue Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="theme-card rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Tendance Revenue</h2>
          <div className="h-64 sm:h-72">
            {data.revenueTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenueTrend}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={(v) => `$${v}`} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }} formatter={(value: number | undefined) => [`$${(value ?? 0).toLocaleString()}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">Aucune donnee pour cette periode</div>
            )}
          </div>
        </motion.div>

        {/* Packages Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="theme-card rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Volume Colis</h2>
          <div className="h-64 sm:h-72">
            {data.packagesTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.packagesTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Colis" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">Aucune donnee pour cette periode</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Pie Charts: City + Payment ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* City Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="theme-card rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Distribution par Ville</h2>
          {data.cityDistribution.length > 0 ? (
            <>
              <div className="h-56 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.cityDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="count" nameKey="city">
                      {data.cityDistribution.map((entry, i) => (
                        <Cell key={entry.city} fill={CITY_COLORS[entry.city] || CITY_FALLBACKS[i % CITY_FALLBACKS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number | undefined, name: string | undefined) => [value ?? 0, name ?? '']} contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {data.cityDistribution.map((city, i) => (
                  <div key={city.city} className="text-center p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="h-2 w-2 rounded-full mx-auto mb-1.5" style={{ backgroundColor: CITY_COLORS[city.city] || CITY_FALLBACKS[i % CITY_FALLBACKS.length] }} />
                    <p className="text-xs text-gray-500 truncate">{city.city}</p>
                    <p className="text-sm font-bold text-gray-900">{city.percentage}%</p>
                    <p className="text-xs text-gray-400">{fmt$(city.revenue)}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Aucune donnee</div>
          )}
        </motion.div>

        {/* Revenue par Statut */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="theme-card rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Revenue par Statut</h2>
          {data.paymentMethods.length > 0 ? (
            <>
              <div className="h-56 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.paymentMethods} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="revenue" nameKey="method">
                      {data.paymentMethods.map((entry) => (
                        <Cell key={entry.method} fill={STATUS_COLORS[entry.method] || '#9ca3af'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number | undefined) => [fmt$(value ?? 0)]} contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {data.paymentMethods.map((pm) => (
                  <div key={pm.method} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_COLORS[pm.method] || '#9ca3af' }} />
                    <span className="text-sm text-gray-700 flex-1">{STATUS_LABELS[pm.method] || pm.method}</span>
                    <span className="text-sm font-semibold text-gray-900">{fmt$(pm.revenue)}</span>
                    <span className="text-xs text-gray-400">{pm.percentage}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Aucune donnee</div>
          )}
        </motion.div>
      </div>

      {/* ── Pipeline Funnel ─────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="theme-card rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-6">Pipeline des Colis</h2>

        {/* Desktop: horizontal */}
        <div className="hidden md:flex items-center gap-2">
          {funnel.stages.map((stage, i) => {
            const nextStatus = funnel.stages[i + 1]?.status;
            const timing = nextStatus ? getTimingBetween(stage.status.replace('-', ''), nextStatus.replace('-', '')) : null;
            return (
              <div key={stage.status} className="flex items-center gap-2 flex-1">
                <div className="flex-1 text-center py-4 px-2 rounded-xl border-2 transition-all"
                  style={{ background: `${FUNNEL_COLORS[i]}15`, borderColor: `${FUNNEL_COLORS[i]}40` }}>
                  <p className="text-2xl font-bold" style={{ color: FUNNEL_COLORS[i] }}>{stage.count}</p>
                  <p className="text-xs font-medium text-gray-600 mt-1">{STATUS_LABELS[stage.status] || stage.status}</p>
                </div>
                {i < funnel.stages.length - 1 && (
                  <div className="flex flex-col items-center text-gray-300 flex-shrink-0">
                    <ArrowRight className="h-5 w-5" />
                    {timing !== null && <span className="text-[10px] text-gray-500 mt-0.5 whitespace-nowrap">~{fmtHours(timing)}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile: vertical */}
        <div className="md:hidden space-y-2.5">
          {funnel.stages.map((stage, i) => {
            const nextStatus = funnel.stages[i + 1]?.status;
            const timing = nextStatus ? getTimingBetween(stage.status.replace('-', ''), nextStatus.replace('-', '')) : null;
            return (
              <div key={stage.status}>
                <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: `${FUNNEL_COLORS[i]}12`, borderLeft: `4px solid ${FUNNEL_COLORS[i]}` }}>
                  <span className="text-sm font-medium text-gray-700">{STATUS_LABELS[stage.status] || stage.status}</span>
                  <span className="text-lg font-bold" style={{ color: FUNNEL_COLORS[i] }}>{stage.count}</span>
                </div>
                {i < funnel.stages.length - 1 && (
                  <div className="flex items-center gap-2 pl-4 py-1 text-xs text-gray-400">
                    <ArrowDown className="h-3 w-3" />
                    {timing !== null && <span>~{fmtHours(timing)} en moyenne</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Special Items ───────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
        className="theme-card rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Articles Speciaux</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {data.specialItems.map((item) => {
            const iconBg = item.brand === 'Apple' ? 'bg-gray-100' : item.brand === 'Samsung' ? 'bg-blue-50' : item.brand === 'SpaceX' ? 'bg-purple-50' : 'bg-orange-50';
            const iconColor = item.brand === 'Apple' ? 'text-gray-700' : item.brand === 'Samsung' ? 'text-blue-600' : item.brand === 'SpaceX' ? 'text-purple-600' : 'text-orange-600';
            const ItemIcon = item.category === 'satellite' ? Wifi : Smartphone;
            return (
              <div key={item.id} className="p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${iconBg}`}><ItemIcon className={`h-5 w-5 ${iconColor}`} /></div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.brand}</p>
                    <p className="text-xs text-gray-500 truncate">{item.itemName}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div><p className="text-xs text-gray-500">Volume</p><p className="text-lg font-bold text-gray-900">{item.count}</p></div>
                  <div className="text-right"><p className="text-xs text-gray-500">Revenue</p><p className="text-lg font-bold text-primary-600">{fmt$(item.revenue)}</p></div>
                </div>
              </div>
            );
          })}
          {/* Regular packages */}
          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-gray-200"><PackageIcon className="h-5 w-5 text-gray-600" /></div>
              <div><p className="text-sm font-semibold text-gray-900">Colis Standard</p><p className="text-xs text-gray-500">Sans article special</p></div>
            </div>
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-gray-500">Volume</p><p className="text-lg font-bold text-gray-900">{data.regularPackages.count}</p></div>
              <div className="text-right"><p className="text-xs text-gray-500">Revenue</p><p className="text-lg font-bold text-primary-600">{fmt$(data.regularPackages.revenue)}</p></div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Admin Performance ───────────────────────────────────────── */}
      {data.adminPerformance.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="theme-card rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Performance Admins</h2>
          {/* Mobile cards */}
          <div className="sm:hidden space-y-2.5">
            {data.adminPerformance.map((admin) => (
              <div key={admin.adminId} className="p-3 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">{admin.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{admin.name}</p>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">{admin.role.replace('_', ' ')}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 rounded-lg p-2 text-center"><p className="text-xs text-gray-500">Actions</p><p className="text-sm font-bold text-gray-900">{admin.actions}</p></div>
                  <div className="bg-gray-50 rounded-lg p-2 text-center"><p className="text-xs text-gray-500">Colis</p><p className="text-sm font-bold text-gray-900">{admin.packagesProcessed}</p></div>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full">
              <thead><tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Colis traites</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {data.adminPerformance.map((admin) => (
                  <tr key={admin.adminId} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">{admin.name.charAt(0)}</div>
                      <span className="text-sm font-medium text-gray-900">{admin.name}</span>
                    </div></td>
                    <td className="px-4 py-3"><span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">{admin.role.replace('_', ' ')}</span></td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">{admin.actions}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">{admin.packagesProcessed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ── Loyalty + Delivery Metrics ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Loyalty */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
          className="theme-card rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Programme Fidelite</h2>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-3 rounded-xl bg-green-50 border border-green-100">
              <p className="text-xs font-medium text-green-700">Credits emis</p>
              <p className="text-lg font-bold text-green-800">{fmt$(loyalty.issued.amount)}</p>
              <p className="text-xs text-green-600">{loyalty.issued.points.toLocaleString()} pts</p>
            </div>
            <div className="p-3 rounded-xl bg-red-50 border border-red-100">
              <p className="text-xs font-medium text-red-700">Credits utilises</p>
              <p className="text-lg font-bold text-red-800">{fmt$(loyalty.redeemed.amount)}</p>
              <p className="text-xs text-red-600">{loyalty.redeemed.points.toLocaleString()} pts</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-xs font-medium text-blue-700">Points en circulation</p>
              <p className="text-lg font-bold text-blue-800">{loyalty.pointsInCirculation.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-xs font-medium text-amber-700">Cout programme</p>
              <p className="text-lg font-bold text-amber-800">{fmt$(loyalty.programCost)}</p>
            </div>
          </div>
          {loyalty.topUsers.length > 0 && (
            <>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Top utilisateurs</h3>
              <div className="space-y-1.5">
                {loyalty.topUsers.map((user, i) => (
                  <div key={user.userId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-200 text-gray-700' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                    }`}>{i + 1}</span>
                    <p className="text-sm font-medium text-gray-900 flex-1 truncate">{user.name}</p>
                    <span className="text-sm font-bold text-primary-600">{user.points.toLocaleString()} pts</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>

        {/* Delivery Metrics */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="theme-card rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-1">Metriques Livraison</h2>
          <p className="text-xs text-gray-500 mb-6">Base sur {deliveryMetrics.deliveredCount} colis livres</p>
          <div className="space-y-5">
            {[
              { label: 'Recu → En transit', hours: deliveryMetrics.avgReceivedToTransit, color: '#3b82f6' },
              { label: 'En transit → Disponible', hours: deliveryMetrics.avgTransitToAvailable, color: '#8b5cf6' },
              { label: 'Disponible → Livre', hours: deliveryMetrics.avgAvailableToDelivered, color: '#22c55e' },
              { label: 'Total (Recu → Livre)', hours: deliveryMetrics.avgTotal, color: '#6366f1' },
            ].map((metric) => {
              const maxH = deliveryMetrics.avgTotal || 1;
              const pct = Math.min(100, (metric.hours / maxH) * 100);
              return (
                <div key={metric.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-gray-700">{metric.label}</span>
                    <span className="text-sm font-bold text-gray-900">{fmtHours(metric.hours)}</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.3 }}
                      className="h-full rounded-full" style={{ backgroundColor: metric.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ── Transfers + Requests ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Transfers Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}
          className="theme-card rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Transferts</h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> Reclame</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-purple-500" /> Assigne</span>
            </div>
          </div>
          <div className="h-56 sm:h-64">
            {transfersData.trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transfersData.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }} />
                  <Bar dataKey="userClaimed" stackId="a" fill="#3b82f6" name="Reclame" />
                  <Bar dataKey="adminAssigned" stackId="a" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Assigne" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">Aucun transfert</div>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-sm text-gray-600">Delta prix moyen</span>
            <span className={`text-sm font-bold ${transfersData.avgPriceDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {transfersData.avgPriceDelta >= 0 ? '+' : ''}{fmt$(transfersData.avgPriceDelta)}
            </span>
          </div>
        </motion.div>

        {/* Request Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          className="theme-card rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Requetes</h2>
          <div className="text-center mb-5">
            <p className="text-4xl font-bold text-primary-600">{requestStats.approvalRate}%</p>
            <p className="text-sm text-gray-500 mt-1">Taux d&apos;approbation</p>
          </div>
          {requestStats.total > 0 ? (
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Approuve', value: requestStats.approved, fill: '#22c55e' },
                      { name: 'Rejete', value: requestStats.rejected, fill: '#ef4444' },
                      { name: 'En attente', value: requestStats.pending, fill: '#eab308' },
                      { name: 'Converti', value: requestStats.converted, fill: '#3b82f6' },
                    ].filter((d) => d.value > 0)}
                    cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value"
                  >
                    {[
                      { fill: '#22c55e' }, { fill: '#ef4444' }, { fill: '#eab308' }, { fill: '#3b82f6' },
                    ].filter((_, i) => [requestStats.approved, requestStats.rejected, requestStats.pending, requestStats.converted][i] > 0)
                    .map((c, i) => <Cell key={i} fill={c.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : null}
          <div className="grid grid-cols-4 gap-2 mt-3">
            {[
              { label: 'Total', value: requestStats.total, color: 'text-gray-900' },
              { label: 'Approuve', value: requestStats.approved, color: 'text-green-600' },
              { label: 'Rejete', value: requestStats.rejected, color: 'text-red-600' },
              { label: 'Attente', value: requestStats.pending, color: 'text-yellow-600' },
            ].map((s) => (
              <div key={s.label} className="text-center p-2 rounded-lg bg-gray-50">
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] font-medium text-gray-500 uppercase">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Bundle Stats ─────────────────────────────────────────────── */}
      {data.bundleStats && data.bundleStats.totalBundles > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.82 }}
          className="theme-card rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5 text-purple-600" />
            Bundles
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
              <p className="text-xs font-medium text-purple-700">Bundles livres</p>
              <p className="text-2xl font-bold text-purple-800">{data.bundleStats.totalBundles}</p>
            </div>
            <div className="p-3 rounded-xl bg-green-50 border border-green-100">
              <p className="text-xs font-medium text-green-700">Economies totales</p>
              <p className="text-2xl font-bold text-green-800">{fmt$(data.bundleStats.totalSavings)}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-xs font-medium text-blue-700">Moy. colis/bundle</p>
              <p className="text-2xl font-bold text-blue-800">{data.bundleStats.avgPackagesPerBundle.toFixed(1)}</p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
              <p className="text-xs font-medium text-indigo-700">Revenue bundles</p>
              <p className="text-2xl font-bold text-indigo-800">{fmt$(data.bundleStats.totalBundleCost)}</p>
            </div>
          </div>
          {data.bundleStats.trend.length > 0 && (
            <div className="h-56 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.bundleStats.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                    formatter={(value: number | undefined, name: string | undefined) => {
                      if (name === 'savings') return [fmt$(value ?? 0), 'Economies'];
                      return [value ?? 0, 'Bundles'];
                    }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Bundles" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Top 10 Clients ──────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}
        className="theme-card rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-bold text-gray-900">Top 10 Clients</h2>
          <button onClick={() => router.push('/admin/users')} className="text-sm text-primary-600 hover:text-primary-700 font-semibold">
            Voir tous →
          </button>
        </div>

        {data.topClients.length > 0 ? (
          <>
            {/* Mobile cards */}
            <div className="sm:hidden space-y-2">
              {data.topClients.map((client, i) => (
                <div key={client.userId}
                  onClick={() => client.clerkId && router.push(`/admin/users/${client.clerkId}`)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100">
                  <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-200 text-gray-700' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                  }`}>{i + 1}</span>
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {client.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{client.name}</p>
                    <p className="text-xs text-gray-500">{client.city} · {client.packages} colis</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-900">{fmt$(client.revenue)}</p>
                    <p className="text-xs text-primary-600">{client.loyaltyPoints.toLocaleString()} pts</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full">
                <thead><tr className="border-b border-gray-200">
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ville</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">Colis</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">Points</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">Dernier colis</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {data.topClients.map((client, i) => (
                    <tr key={client.userId}
                      onClick={() => client.clerkId && router.push(`/admin/users/${client.clerkId}`)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer">
                      <td className="px-3 py-3">
                        <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-200 text-gray-700' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                        }`}>{i + 1}</span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                            {client.name.charAt(0)}
                          </div>
                          <div><p className="text-sm font-medium text-gray-900">{client.name}</p><p className="text-xs text-gray-500">{client.email}</p></div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">{client.city}</td>
                      <td className="px-3 py-3 text-right text-sm font-semibold text-gray-900">{client.packages}</td>
                      <td className="px-3 py-3 text-right text-sm font-bold text-gray-900">{fmt$(client.revenue)}</td>
                      <td className="px-3 py-3 text-right text-sm font-medium text-primary-600">{client.loyaltyPoints.toLocaleString()} pts</td>
                      <td className="px-3 py-3 text-right text-xs text-gray-500">
                        {client.lastPackage ? new Date(client.lastPackage).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="py-12 text-center text-gray-400 text-sm">Aucun client pour cette periode</div>
        )}
      </motion.div>
    </div>
  );
}
