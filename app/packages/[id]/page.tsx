'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Container } from '@/components/Container';
import {
  ArrowLeft,
  Copy,
  Share2,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Plane,
  DollarSign,
  Scale,
  AlertTriangle,
  Smartphone,
  Calendar,
  Truck,
  FileText,
  ShoppingBag,
  Shirt,
  HelpCircle,
  Info,
  ExternalLink,
  Check,
  Layers,
  Gift,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useTheme } from '@/lib/themes/ThemeProvider';

// ── Types ──────────────────────────────────────────────────────────

interface PackageData {
  id: number;
  trackingNumber: string;
  externalTrackingNumber?: string;
  status: string;
  description: string;
  weight: string;
  category?: string;
  serviceFee?: string;
  weightCost?: string;
  customsFees?: string;
  specialItemId?: number;
  specialItemName?: string;
  specialItemBrand?: string;
  specialItemFixedFee?: string;
  chargeByWeight?: boolean;
  deliveryBundleId?: number;
  totalCost: string;
  currentLocation: string;
  estimatedDelivery: string | null;
  createdAt: string;
  updatedAt: string;
  timeline: Array<{
    status: string;
    location: string;
    description?: string;
    date: string;
    pending?: boolean;
  }>;
}

// ── Helpers ────────────────────────────────────────────────────────

const STATUS_ORDER = ['received', 'in-transit', 'available', 'delivered'];

const categoryConfig: Record<string, { icon: any; label: string; emoji: string }> = {
  general: { icon: Package, label: 'General', emoji: '📦' },
  clothing: { icon: Shirt, label: 'Vetements', emoji: '👕' },
  electronics: { icon: Smartphone, label: 'Electronique', emoji: '💻' },
  food: { icon: ShoppingBag, label: 'Nourriture', emoji: '🍽️' },
  documents: { icon: FileText, label: 'Documents', emoji: '📄' },
  other: { icon: HelpCircle, label: 'Autre', emoji: '🏷️' },
};

function translateText(text: string, t: any): string {
  if (!text) return text;
  if (text.includes('.')) {
    const keys = text.split('.');
    let value: any = t;
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return text;
      }
    }
    return typeof value === 'string' ? value : text;
  }
  // Try packages.timeline or packages.status
  const timelineVal = t?.packages?.timeline?.[text];
  if (timelineVal && typeof timelineVal === 'string') return timelineVal;
  const statusVal = t?.packages?.status?.[text];
  if (statusVal && typeof statusVal === 'string') return statusVal;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// ── Component ──────────────────────────────────────────────────────

export default function PackageDetailPage() {
  const { user, isLoaded } = useUser();
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const colors = theme.colors;
  const router = useRouter();
  const params = useParams();
  const packageId = params.id;

  const [pkg, setPkg] = useState<PackageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [bundleData, setBundleData] = useState<{
    bundle: { packageCount: number; totalSavings: string; bundleTotalCost: string; deliveredAt: string };
    packages: Array<{ id: number; trackingNumber: string; description: string; weight: string; totalCost: string }>;
  } | null>(null);

  const pd = (t as any).packageDetail || {};
  const bt = (t as any).bundle || {};

  // ── Fetch ─────────────────────────────────────────────────────

  useEffect(() => {
    const fetchPackage = async () => {
      if (!isLoaded || !user) return;
      setLoading(true);
      try {
        const response = await fetch('/api/user/packages');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        const found = (data.packages || []).find(
          (p: any) => String(p.id) === String(packageId)
        );
        setPkg(found || null);
      } catch (error) {
        console.error('Error fetching package:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPackage();
  }, [user, isLoaded, packageId]);

  // Fetch bundle data if package is in a bundle
  useEffect(() => {
    if (!pkg?.deliveryBundleId) return;
    fetch(`/api/user/bundles/${pkg.deliveryBundleId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data?.success) setBundleData(data); })
      .catch(() => {});
  }, [pkg?.deliveryBundleId]);

  // ── Computed ──────────────────────────────────────────────────

  const customsFees = parseFloat(pkg?.customsFees || '0') || 0;
  const serviceFee = parseFloat(pkg?.serviceFee || '0') || 0;
  const weightCost = parseFloat(pkg?.weightCost || '0') || 0;
  const specialItemFixedFee = parseFloat(pkg?.specialItemFixedFee || '0') || 0;
  const totalCost = serviceFee + weightCost + customsFees + specialItemFixedFee;

  const statusColors: Record<string, any> = {
    pending: { text: '#d97706', bg: isDark ? '#78350f' : '#fef3c7', border: isDark ? '#92400e' : '#fde68a', dot: '#eab308', icon: Clock },
    rejected: { text: '#dc2626', bg: isDark ? '#7f1d1d' : '#fee2e2', border: isDark ? '#991b1b' : '#fecaca', dot: '#ef4444', icon: AlertCircle },
    received: { text: '#2563eb', bg: isDark ? '#1e3a8a' : '#dbeafe', border: isDark ? '#1e40af' : '#bfdbfe', dot: '#3b82f6', icon: Package },
    'in-transit': { text: '#9333ea', bg: isDark ? '#581c87' : '#f3e8ff', border: isDark ? '#6b21a8' : '#e9d5ff', dot: '#a855f7', icon: Plane },
    customs: { text: '#ea580c', bg: isDark ? '#7c2d12' : '#fed7aa', border: isDark ? '#9a3412' : '#fdba74', dot: '#f97316', icon: AlertCircle },
    available: { text: '#16a34a', bg: isDark ? '#14532d' : '#dcfce7', border: isDark ? '#166534' : '#bbf7d0', dot: '#22c55e', icon: CheckCircle },
    delivered: { text: '#059669', bg: isDark ? '#064e3b' : '#d1fae5', border: isDark ? '#065f46' : '#a7f3d0', dot: '#10b981', icon: CheckCircle },
  };

  const statusProgressIcons = [Package, Truck, CheckCircle, CheckCircle];
  const statusProgressLabels = [
    pd.statusProgress?.received || t.packages?.status?.received || 'Received',
    pd.statusProgress?.inTransit || t.packages?.status?.['in-transit'] || 'In Transit',
    pd.statusProgress?.available || t.packages?.status?.available || 'Available',
    pd.statusProgress?.delivered || t.packages?.status?.delivered || 'Delivered',
  ];

  const statusInfo = statusColors[pkg?.status || 'pending'] || statusColors.pending;
  const StatusIcon = statusInfo.icon;
  const currentStatusIndex = STATUS_ORDER.indexOf(pkg?.status || '');
  const isRejected = pkg?.status === 'rejected';
  const isPending = pkg?.status === 'pending' || pkg?.status === 'requested';

  const catInfo = categoryConfig[pkg?.category || 'general'] || categoryConfig.general;
  const CatIcon = catInfo.icon;

  // ── Actions ───────────────────────────────────────────────────

  const handleCopy = async () => {
    if (!pkg) return;
    await navigator.clipboard.writeText(pkg.trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!pkg) return;
    try {
      await navigator.share({
        title: `Package ${pkg.trackingNumber}`,
        text: `Tracking: ${pkg.trackingNumber} - Status: ${translateText(pkg.status, t)}`,
      });
    } catch {}
  };

  // ── Loading ───────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="overflow-x-hidden">
        <Header />
        <main className="min-h-screen pb-32 pt-2 md:pt-4">
          <Container>
            <div className="animate-pulse space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl" style={{ backgroundColor: colors.gray[200] }} />
                <div className="flex-1">
                  <div className="h-6 w-48 rounded-lg mb-2" style={{ backgroundColor: colors.gray[200] }} />
                  <div className="h-4 w-32 rounded" style={{ backgroundColor: colors.gray[100] }} />
                </div>
              </div>
              <div className="h-20 rounded-2xl" style={{ backgroundColor: colors.gray[100] }} />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-64 rounded-2xl" style={{ backgroundColor: colors.gray[100] }} />
                  <div className="h-48 rounded-2xl" style={{ backgroundColor: colors.gray[100] }} />
                </div>
                <div className="space-y-6">
                  <div className="h-48 rounded-2xl" style={{ backgroundColor: colors.gray[100] }} />
                  <div className="h-32 rounded-2xl" style={{ backgroundColor: colors.gray[100] }} />
                </div>
              </div>
            </div>
          </Container>
        </main>
        <BottomNav />
      </div>
    );
  }

  // ── Not Found ─────────────────────────────────────────────────

  if (!pkg) {
    return (
      <div className="overflow-x-hidden">
        <Header />
        <main className="min-h-screen pb-32 pt-2 md:pt-4">
          <Container>
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4" style={{ backgroundColor: colors.gray[100] }}>
                <Package className="w-10 h-10" style={{ color: colors.gray[400] }} />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: colors.gray[900] }}>
                {pd.notFound || 'Package not found'}
              </h2>
              <Link href="/packages" className="text-primary-600 font-medium hover:underline">
                {pd.backToPackages || 'Back to packages'}
              </Link>
            </div>
          </Container>
        </main>
        <BottomNav />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="overflow-x-hidden">
      <Header />
      <main className="min-h-screen pb-32 pt-2 md:pt-4">
        <Container>
          {/* ── Breadcrumb ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm mb-6"
          >
            <button
              onClick={() => router.push('/packages')}
              className="flex items-center gap-2 font-medium transition-colors hover:opacity-80"
              style={{ color: colors.primary[600] }}
            >
              <ArrowLeft className="w-4 h-4" />
              {pd.backToPackages || t.packages?.title || 'My Packages'}
            </button>
            <span style={{ color: colors.gray[400] }}>/</span>
            <span className="font-mono font-semibold" style={{ color: colors.gray[700] }}>
              {pkg.trackingNumber}
            </span>
          </motion.div>

          {/* ── Header Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="theme-card rounded-2xl border overflow-hidden mb-6"
            style={{ borderColor: statusInfo.border, boxShadow: theme.shadow.md }}
          >
            <div className="h-1.5" style={{ backgroundColor: statusInfo.dot }} />
            <div className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-full"
                      style={{ backgroundColor: statusInfo.bg, borderColor: statusInfo.border }}
                    >
                      <StatusIcon className="w-4 h-4" style={{ color: statusInfo.text }} />
                      <span className="text-sm font-bold" style={{ color: statusInfo.text }}>
                        {translateText(pkg.status, t)}
                      </span>
                    </span>
                  </div>
                  <h1 className="font-mono text-2xl sm:text-3xl font-bold tracking-wide" style={{ color: colors.gray[900] }}>
                    {pkg.trackingNumber}
                  </h1>
                  {pkg.externalTrackingNumber && pkg.externalTrackingNumber !== pkg.trackingNumber && (
                    <p className="font-mono text-sm mt-1 flex items-center gap-1" style={{ color: colors.gray[500] }}>
                      <ExternalLink className="w-3.5 h-3.5" />
                      {pkg.externalTrackingNumber}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-all hover:shadow-md"
                    style={{
                      borderColor: copied ? '#22c55e' : colors.gray[200],
                      color: copied ? '#22c55e' : colors.gray[700],
                      backgroundColor: copied ? (isDark ? '#064e3b' : '#f0fdf4') : 'transparent',
                    }}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? (pd.trackingCopied || 'Copied!') : (pd.copyTracking || 'Copy')}
                  </button>
                  <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-all hover:shadow-md"
                    style={{ borderColor: colors.gray[200], color: colors.gray[700] }}
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Status Progress Bar ── */}
          {!isRejected && !isPending && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="theme-card rounded-2xl border p-5 sm:p-6 mb-6"
              style={{ borderColor: colors.gray[100], boxShadow: theme.shadow.sm }}
            >
              <div className="flex items-center justify-between">
                {STATUS_ORDER.map((step, index) => {
                  const isPast = currentStatusIndex > index;
                  const isCurrent = currentStatusIndex === index;
                  const StepIcon = statusProgressIcons[index];

                  return (
                    <div key={step} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                            isCurrent ? 'ring-4' : ''
                          }`}
                          style={{
                            backgroundColor: isPast
                              ? statusInfo.dot
                              : isCurrent
                              ? statusInfo.bg
                              : colors.gray[100],
                            ...(isCurrent ? { ringColor: statusInfo.bg } : {}),
                            boxShadow: isCurrent ? `0 0 0 4px ${statusInfo.bg}` : 'none',
                          }}
                        >
                          {isPast ? (
                            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          ) : (
                            <StepIcon
                              className="w-4 h-4 sm:w-5 sm:h-5"
                              style={{ color: isCurrent ? statusInfo.dot : colors.gray[400] }}
                            />
                          )}
                        </div>
                        <span
                          className="text-[10px] sm:text-xs font-medium text-center"
                          style={{
                            color: isCurrent ? statusInfo.text : isPast ? colors.gray[700] : colors.gray[400],
                            fontWeight: isCurrent ? 700 : 500,
                          }}
                        >
                          {statusProgressLabels[index]}
                        </span>
                      </div>
                      {index < STATUS_ORDER.length - 1 && (
                        <div
                          className="h-1 flex-1 rounded-full mx-1 mb-6"
                          style={{
                            backgroundColor: isPast ? statusInfo.dot : colors.gray[200],
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── Rejected / Pending Banner ── */}
          {(isRejected || isPending) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border p-4 mb-6 flex items-center gap-3"
              style={{
                backgroundColor: isRejected ? (isDark ? '#7f1d1d' : '#fef2f2') : (isDark ? '#78350f' : '#fffbeb'),
                borderColor: isRejected ? '#fecaca' : '#fde68a',
              }}
            >
              <AlertTriangle className="w-5 h-5" style={{ color: isRejected ? '#ef4444' : '#eab308' }} />
              <span className="font-semibold text-sm" style={{ color: isRejected ? '#dc2626' : '#d97706' }}>
                {isRejected ? translateText('rejected', t) : translateText('pending', t)}
              </span>
            </motion.div>
          )}

          {/* ── Main Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Left Column ── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Package Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="theme-card rounded-2xl border p-5 sm:p-6"
                style={{ borderColor: colors.gray[100], boxShadow: theme.shadow.sm }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: colors.primary[100] }}>
                    <Info className="w-5 h-5" style={{ color: colors.primary[600] }} />
                  </div>
                  <h2 className="text-lg font-bold font-display" style={{ color: colors.gray[900] }}>
                    {pd.packageInfo || 'Package Information'}
                  </h2>
                </div>

                {/* Description */}
                {pkg.description && (
                  <div className="rounded-xl p-4 mb-5" style={{ backgroundColor: isDark ? colors.gray[200] : colors.gray[50] }}>
                    <p className="text-sm leading-relaxed" style={{ color: colors.gray[700] }}>
                      {pkg.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-medium mb-1" style={{ color: colors.gray[400] }}>
                      {pd.weight || 'Weight'}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Scale className="w-4 h-4" style={{ color: colors.gray[500] }} />
                      <span className="font-semibold" style={{ color: colors.gray[900] }}>
                        {parseFloat(pkg.weight).toFixed(1)} lbs
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-medium mb-1" style={{ color: colors.gray[400] }}>
                      {pd.category || 'Category'}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <CatIcon className="w-4 h-4" style={{ color: colors.gray[500] }} />
                      <span className="font-semibold" style={{ color: colors.gray[900] }}>
                        {catInfo.label}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-medium mb-1" style={{ color: colors.gray[400] }}>
                      {pd.currentLocation || 'Location'}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" style={{ color: colors.primary[500] }} />
                      <span className="font-semibold truncate" style={{ color: colors.gray[900] }}>
                        {translateText(pkg.currentLocation, t)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-medium mb-1" style={{ color: colors.gray[400] }}>
                      {pd.estimatedDelivery || 'Delivery'}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" style={{ color: colors.gray[500] }} />
                      <span className="font-semibold" style={{ color: colors.gray[900] }}>
                        {pkg.estimatedDelivery ? new Date(pkg.estimatedDelivery).toLocaleDateString('fr-FR') : '-'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-medium mb-1" style={{ color: colors.gray[400] }}>
                      {pd.createdAt || 'Created'}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" style={{ color: colors.gray[500] }} />
                      <span className="font-semibold text-sm" style={{ color: colors.gray[900] }}>
                        {new Date(pkg.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-medium mb-1" style={{ color: colors.gray[400] }}>
                      {pd.updatedAt || 'Updated'}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" style={{ color: colors.gray[500] }} />
                      <span className="font-semibold text-sm" style={{ color: colors.gray[900] }}>
                        {new Date(pkg.updatedAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Special Item */}
              {pkg.specialItemId && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl border p-5 sm:p-6"
                  style={{
                    backgroundColor: isDark ? '#1e1b2e' : '#faf5ff',
                    borderColor: isDark ? '#4c1d95' : '#e9d5ff',
                    boxShadow: theme.shadow.sm,
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: isDark ? '#7c3aed' : '#8b5cf6' }}>
                      <Smartphone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold" style={{ color: isDark ? '#e9d5ff' : '#5b21b6' }}>
                        {pkg.specialItemName || 'Special Item'}
                      </h3>
                      {pkg.specialItemBrand && (
                        <p className="text-sm" style={{ color: isDark ? '#c4b5fd' : '#7c3aed' }}>
                          {pkg.specialItemBrand}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{
                    backgroundColor: isDark ? '#2e1065' : '#ede9fe',
                  }}>
                    <span className="font-semibold text-sm" style={{ color: isDark ? '#c4b5fd' : '#6d28d9' }}>
                      {pd.fixedFee || 'Fixed Fee'}
                    </span>
                    <span className="font-bold text-lg" style={{ color: isDark ? '#e9d5ff' : '#5b21b6' }}>
                      ${specialItemFixedFee.toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Bundle Card */}
              {pkg.deliveryBundleId && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="rounded-2xl border p-5 sm:p-6"
                  style={{
                    background: isDark
                      ? 'linear-gradient(135deg, #1e1b3a, #1a1640)'
                      : 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
                    borderColor: isDark ? '#5b21b6' : '#c4b5fd',
                    boxShadow: theme.shadow.md,
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                      background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                    }}>
                      <Layers className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold" style={{ color: isDark ? '#e9d5ff' : '#5b21b6' }}>
                        {bt.title || 'Livraison Bundle'}
                      </h3>
                      <p className="text-xs" style={{ color: isDark ? '#a78bfa' : '#7c3aed' }}>
                        {bt.singleServiceFee || '1 seul frais de service'}
                      </p>
                    </div>
                  </div>

                  {/* Savings highlight */}
                  {bundleData && (
                    <div className="rounded-xl p-4 mb-4" style={{
                      backgroundColor: isDark ? '#064e3b' : '#dcfce7',
                      border: `1px solid ${isDark ? '#059669' : '#86efac'}`,
                    }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Gift className="w-4 h-4" style={{ color: isDark ? '#6ee7b7' : '#15803d' }} />
                          <span className="text-sm font-semibold" style={{ color: isDark ? '#6ee7b7' : '#15803d' }}>
                            {bt.savedAmount || 'Vous avez économisé'}
                          </span>
                        </div>
                        <span className="text-lg font-bold" style={{ color: isDark ? '#6ee7b7' : '#15803d' }}>
                          ${parseFloat(bundleData.bundle.totalSavings).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Other packages in bundle */}
                  {bundleData && bundleData.packages.length > 1 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: isDark ? '#a78bfa' : '#7c3aed' }}>
                        {bt.otherPackages || 'Autres colis du bundle'} ({bundleData.bundle.packageCount})
                      </p>
                      <div className="space-y-2">
                        {bundleData.packages
                          .filter(p => p.id !== pkg.id)
                          .map(p => (
                            <Link
                              key={p.id}
                              href={`/packages/${p.id}`}
                              className="flex items-center justify-between rounded-lg p-3 transition-all hover:shadow-sm"
                              style={{
                                backgroundColor: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.08)',
                                border: `1px solid ${isDark ? '#4c1d95' : '#ddd6fe'}`,
                              }}
                            >
                              <div>
                                <p className="font-mono text-sm font-semibold" style={{ color: isDark ? '#e9d5ff' : '#5b21b6' }}>
                                  {p.trackingNumber}
                                </p>
                                <p className="text-xs line-clamp-1" style={{ color: isDark ? '#a78bfa' : '#7c3aed' }}>
                                  {p.description}
                                </p>
                              </div>
                              <span className="text-sm font-bold" style={{ color: isDark ? '#c4b5fd' : '#6d28d9' }}>
                                ${parseFloat(p.totalCost).toFixed(2)}
                              </span>
                            </Link>
                          ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Timeline */}
              {pkg.timeline && pkg.timeline.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="theme-card rounded-2xl border p-5 sm:p-6"
                  style={{ borderColor: colors.gray[100], boxShadow: theme.shadow.sm }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: colors.gray[100] }}>
                      <Clock className="w-5 h-5" style={{ color: colors.gray[600] }} />
                    </div>
                    <h2 className="text-lg font-bold font-display" style={{ color: colors.gray[900] }}>
                      {pd.timeline || t.packages?.details?.timeline || 'Timeline'}
                    </h2>
                  </div>

                  <div className="relative">
                    <div className="absolute left-[15px] top-3 bottom-3 w-0.5" style={{ backgroundColor: colors.gray[200] }} />
                    <div className="space-y-0">
                      {pkg.timeline.map((event, idx) => {
                        const eventColor = statusColors[event.status?.toLowerCase()] || statusColors.pending;
                        return (
                          <div key={idx} className="flex gap-4 relative">
                            <div className="relative flex flex-col items-center z-10">
                              <div
                                className="w-[30px] h-[30px] rounded-full flex items-center justify-center border-[3px]"
                                style={{
                                  borderColor: event.pending ? colors.gray[300] : eventColor.dot,
                                  backgroundColor: isDark ? colors.gray[100] : '#fff',
                                }}
                              >
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: event.pending ? colors.gray[300] : eventColor.dot }}
                                />
                              </div>
                            </div>
                            <div className="flex-1 pb-6">
                              <p className="font-semibold text-sm" style={{ color: event.pending ? colors.gray[400] : colors.gray[900] }}>
                                {translateText(event.status, t)}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <MapPin className="w-3 h-3" style={{ color: colors.gray[400] }} />
                                <span className="text-xs" style={{ color: colors.gray[500] }}>
                                  {translateText(event.location, t)}
                                </span>
                              </div>
                              {event.description && (
                                <p className="text-xs mt-1" style={{ color: colors.gray[400] }}>
                                  {translateText(event.description, t)}
                                </p>
                              )}
                              <p className="text-[10px] mt-1.5" style={{ color: colors.gray[400] }}>
                                {new Date(event.date).toLocaleString('fr-FR')}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* ── Right Column ── */}
            <div className="space-y-6">
              {/* Fee Breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border p-5 sm:p-6"
                style={{
                  background: isDark
                    ? `linear-gradient(135deg, ${colors.gray[100]}, ${colors.gray[50]})`
                    : 'linear-gradient(135deg, #eff6ff, #f5f3ff)',
                  borderColor: isDark ? colors.gray[300] : '#c7d2fe',
                  boxShadow: theme.shadow.md,
                }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: isDark ? colors.primary[900] : colors.primary[100] }}>
                    <DollarSign className="w-5 h-5" style={{ color: colors.primary[600] }} />
                  </div>
                  <h2 className="text-lg font-bold font-display" style={{ color: colors.gray[900] }}>
                    {pd.feeBreakdown || 'Fee Breakdown'}
                  </h2>
                </div>

                <div className="space-y-3">
                  {/* Service Fee */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: colors.gray[600] }}>
                      {pd.serviceFee || 'Service fee'}
                    </span>
                    {pkg.deliveryBundleId && serviceFee === 0 ? (
                      <span className="flex items-center gap-1.5">
                        <span className="line-through text-sm" style={{ color: colors.gray[400] }}>$5.00</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{
                          backgroundColor: isDark ? '#064e3b' : '#dcfce7',
                          color: isDark ? '#6ee7b7' : '#15803d',
                        }}>
                          {bt.serviceFeeWaived || 'OFFERT'}
                        </span>
                      </span>
                    ) : (
                      <span className="font-semibold" style={{ color: colors.gray[900] }}>
                        ${serviceFee.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Weight Fee */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: colors.gray[600] }}>
                      {pd.weightFee || 'Weight fee'} ({parseFloat(pkg.weight).toFixed(1)} lbs)
                    </span>
                    <span className="font-semibold" style={{ color: colors.gray[900] }}>
                      ${weightCost.toFixed(2)}
                    </span>
                  </div>

                  {/* Special Item Fee */}
                  {pkg.specialItemId && (
                    <div className="flex justify-between items-center rounded-lg px-3 py-2 -mx-1" style={{
                      backgroundColor: isDark ? '#2e1065' : '#ede9fe',
                    }}>
                      <span className="font-semibold text-sm flex items-center gap-1.5" style={{ color: isDark ? '#c4b5fd' : '#7c3aed' }}>
                        <Smartphone className="w-3.5 h-3.5" />
                        {pkg.specialItemName
                          ? `${pkg.specialItemBrand || ''} ${pkg.specialItemName}`.trim()
                          : 'Special Item'}
                      </span>
                      <span className="font-bold" style={{ color: isDark ? '#e9d5ff' : '#5b21b6' }}>
                        ${specialItemFixedFee.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Customs Fee */}
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${customsFees > 0 ? 'font-semibold' : ''}`} style={{ color: customsFees > 0 ? '#dc2626' : colors.gray[600] }}>
                      {pd.customsFee || 'Customs fee'}
                    </span>
                    <span className={`${customsFees > 0 ? 'font-bold' : 'font-semibold'}`} style={{ color: customsFees > 0 ? '#dc2626' : colors.gray[900] }}>
                      {customsFees > 0 ? '+' : ''}${customsFees.toFixed(2)}
                    </span>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center pt-3 mt-2" style={{ borderTop: `2.5px solid ${colors.primary[500]}` }}>
                    <span className="font-bold text-base" style={{ color: colors.gray[900] }}>
                      {pd.total || 'TOTAL'}
                    </span>
                    <span className="font-bold text-2xl" style={{ color: colors.primary[600] }}>
                      ${totalCost.toFixed(2)}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Location Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="theme-card rounded-2xl border p-5 sm:p-6"
                style={{ borderColor: colors.gray[100], boxShadow: theme.shadow.sm }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: isDark ? colors.primary[900] : colors.primary[50] }}>
                    <MapPin className="w-5 h-5" style={{ color: colors.primary[600] }} />
                  </div>
                  <h2 className="text-lg font-bold font-display" style={{ color: colors.gray[900] }}>
                    {pd.currentLocation || 'Location'}
                  </h2>
                </div>
                <div className="rounded-xl p-4" style={{ backgroundColor: isDark ? colors.gray[200] : colors.gray[50] }}>
                  <p className="font-semibold" style={{ color: colors.gray[900] }}>
                    {translateText(pkg.currentLocation, t)}
                  </p>
                  {pkg.estimatedDelivery && (
                    <p className="text-sm mt-2 flex items-center gap-1.5" style={{ color: colors.gray[500] }}>
                      <Calendar className="w-3.5 h-3.5" />
                      {pd.estimatedDelivery || 'Estimated'}: {new Date(pkg.estimatedDelivery).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </Container>
      </main>
      <BottomNav />
    </div>
  );
}
