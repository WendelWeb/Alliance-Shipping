'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Container } from '@/components/Container';
import {
  Layers,
  ArrowLeft,
  Gift,
  Package,
  Scale,
  DollarSign,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Smartphone,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useTheme } from '@/lib/themes/ThemeProvider';

// ── Types ──────────────────────────────────────────────────────────

interface PackageData {
  id: number;
  trackingNumber: string;
  externalTrackingNumber?: string;
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
  timeline: Array<{
    status: string;
    location: string;
    description?: string;
    date: string;
  }>;
}

// ── Component ──────────────────────────────────────────────────────

export default function BundleAvailablePage() {
  const { user, isLoaded } = useUser();
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const colors = theme.colors;
  const router = useRouter();

  const [packages, setPackages] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState(true);

  const bt = (t as any).bundle || {};

  // ── Colors ───────────────────────────────────────────────────────

  const greenBg = isDark ? '#064e3b' : '#dcfce7';
  const greenText = isDark ? '#6ee7b7' : '#15803d';
  const greenBorder = isDark ? '#059669' : '#86efac';
  const purpleAccent = '#7c3aed';

  // ── Fetch ────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchPackages = async () => {
      if (!isLoaded || !user) return;

      setLoading(true);
      try {
        const response = await fetch('/api/user/packages');
        if (!response.ok) throw new Error('Failed to fetch packages');
        const data = await response.json();
        const allPackages: PackageData[] = data.packages || [];
        const available = allPackages.filter(
          (p: any) => p.status === 'available'
        );
        setPackages(available);

        // Redirect if less than 2 available packages (no bundle opportunity)
        if (available.length < 2) {
          router.replace('/packages');
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
        setPackages([]);
        router.replace('/packages');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [user, isLoaded, router]);

  // ── Computed ─────────────────────────────────────────────────────

  // Sum real service fees of all packages except the first (those get waived)
  const savings = packages.slice(1).reduce(
    (sum, p) => sum + (parseFloat(p.serviceFee || '0') || 0), 0
  );

  const totalWeight = packages.reduce(
    (sum, p) => sum + parseFloat(p.weight || '0'),
    0
  );

  const totalWeightCost = packages.reduce(
    (sum, p) => sum + (parseFloat(p.weightCost || '0') || 0),
    0
  );

  const totalCustomsFees = packages.reduce(
    (sum, p) => sum + (parseFloat(p.customsFees || '0') || 0),
    0
  );

  const totalSpecialItemFees = packages.reduce(
    (sum, p) => sum + (parseFloat(p.specialItemFixedFee || '0') || 0),
    0
  );

  const specialItemCount = packages.filter(p => p.specialItemId).length;

  const firstFee = parseFloat(packages[0]?.serviceFee || '0') || 0;

  const normalTotal = packages.reduce((sum, pkg) => {
    const tc = parseFloat(pkg.totalCost || '0') || 0;
    if (tc > 0) return sum + tc;
    const sf = parseFloat(pkg.serviceFee || '0') || 0;
    const wc = parseFloat(pkg.weightCost || '0') || 0;
    const cf = parseFloat(pkg.customsFees || '0') || 0;
    const si = parseFloat(pkg.specialItemFixedFee || '0') || 0;
    return sum + sf + wc + cf + si;
  }, 0);

  const bundleTotal = normalTotal - savings;

  // ── Loading Skeleton ─────────────────────────────────────────────

  if (loading) {
    return (
      <div className="overflow-x-hidden">
        <Header />
        <main className="min-h-screen pb-32 pt-2 md:pt-4">
          <Container>
            <div className="animate-pulse space-y-6">
              {/* Breadcrumb skeleton */}
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: colors.gray[200] }}
                />
                <div
                  className="h-4 w-40 rounded"
                  style={{ backgroundColor: colors.gray[200] }}
                />
              </div>

              {/* Hero card skeleton */}
              <div
                className="h-40 rounded-2xl"
                style={{ backgroundColor: colors.gray[100] }}
              />

              {/* Package cards skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="theme-card rounded-2xl p-5"
                    style={{ backgroundColor: colors.gray[50] }}
                  >
                    <div
                      className="h-5 w-36 rounded mb-3"
                      style={{ backgroundColor: colors.gray[200] }}
                    />
                    <div
                      className="h-4 w-48 rounded mb-2"
                      style={{ backgroundColor: colors.gray[100] }}
                    />
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {[1, 2, 3, 4].map((j) => (
                        <div key={j}>
                          <div
                            className="h-3 w-16 rounded mb-1.5"
                            style={{ backgroundColor: colors.gray[100] }}
                          />
                          <div
                            className="h-4 w-20 rounded"
                            style={{ backgroundColor: colors.gray[200] }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total card skeleton */}
              <div
                className="h-36 rounded-2xl"
                style={{ backgroundColor: colors.gray[100] }}
              />
            </div>
          </Container>
        </main>
        <BottomNav />
      </div>
    );
  }

  // ── Early return if not enough packages ──────────────────────────

  if (packages.length < 2) {
    return null; // Will redirect via useEffect
  }

  // ── Render ───────────────────────────────────────────────────────

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
              {t.packages?.title || 'Mes Colis'}
            </button>
            <span style={{ color: colors.gray[400] }}>/</span>
            <span className="font-semibold" style={{ color: colors.gray[700] }}>
              {bt.bundleAvailable || 'Bundle Disponible'}
            </span>
          </motion.div>

          {/* ── Savings Hero Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border overflow-hidden mb-6"
            style={{
              backgroundColor: greenBg,
              borderColor: greenBorder,
              boxShadow: theme.shadow.md,
            }}
          >
            <div className="px-5 py-6 sm:px-8 sm:py-8">
              {/* Top row: icon + count */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(110, 231, 183, 0.15)'
                      : 'rgba(21, 128, 61, 0.1)',
                  }}
                >
                  <Gift className="w-6 h-6" style={{ color: greenText }} />
                </div>
                <div>
                  <p
                    className="text-lg font-bold"
                    style={{ color: greenText }}
                  >
                    {packages.length} {bt.packagesAvailable || 'colis disponibles'}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: isDark ? '#a7f3d0' : '#166534' }}
                  >
                    {bt.singleServiceFee || '1 seul frais de service'}{' '}
                    {bt.insteadOf || 'au lieu de'} {packages.length}
                  </p>
                </div>
              </div>

              {/* Big savings amount */}
              <div
                className="rounded-xl px-5 py-4 flex items-center justify-between"
                style={{
                  backgroundColor: isDark
                    ? 'rgba(110, 231, 183, 0.1)'
                    : 'rgba(21, 128, 61, 0.08)',
                  border: `1.5px solid ${greenBorder}`,
                }}
              >
                <div className="flex items-center gap-2">
                  <DollarSign
                    className="w-5 h-5"
                    style={{ color: greenText }}
                  />
                  <span
                    className="font-semibold"
                    style={{ color: greenText }}
                  >
                    {bt.savings || 'Savings'}
                  </span>
                </div>
                <span
                  className="text-3xl sm:text-4xl font-bold"
                  style={{ color: greenText }}
                >
                  -${savings.toFixed(2)}
                </span>
              </div>

              {/* Weight summary */}
              <div className="flex items-center gap-2 mt-3">
                <Scale className="w-4 h-4" style={{ color: isDark ? '#a7f3d0' : '#166534' }} />
                <span
                  className="text-sm font-medium"
                  style={{ color: isDark ? '#a7f3d0' : '#166534' }}
                >
                  {bt.totalWeight || 'Poids total'}: {totalWeight.toFixed(1)} lbs
                </span>
              </div>
            </div>
          </motion.div>

          {/* ── Package Cards Grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {packages.map((pkg, index) => {
              const serviceFee =
                parseFloat(pkg.serviceFee || '0') || 0;
              const weightCost = parseFloat(pkg.weightCost || '0') || 0;
              const customsFees = parseFloat(pkg.customsFees || '0') || 0;
              const specialItemFee =
                parseFloat(pkg.specialItemFixedFee || '0') || 0;
              const tc = parseFloat(pkg.totalCost || '0') || 0;
              const pkgTotal = tc > 0 ? tc : serviceFee + weightCost + customsFees + specialItemFee;
              const isFirstPackage = index === 0;
              const lastEvent =
                pkg.timeline && pkg.timeline.length > 0
                  ? pkg.timeline[pkg.timeline.length - 1]
                  : null;

              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 + 0.1 }}
                  className="col-span-1"
                >
                  <Link href={`/packages/${pkg.id}`}>
                    <div
                      className="theme-card rounded-2xl border bg-theme-surface-solid overflow-hidden transition-all cursor-pointer hover:shadow-lg"
                      style={{
                        borderColor: colors.gray[100],
                        boxShadow: theme.shadow.sm,
                      }}
                    >
                      {/* Purple top bar */}
                      <div
                        className="h-1"
                        style={{ backgroundColor: purpleAccent }}
                      />

                      <div className="p-4 sm:p-5">
                        {/* Header: Tracking + Total */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="min-w-0 flex-1 mr-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Package
                                className="w-4 h-4 shrink-0"
                                style={{ color: purpleAccent }}
                              />
                              <span className="text-xs font-medium" style={{ color: purpleAccent }}>
                                #{index + 1}
                              </span>
                            </div>
                            <p
                              className="font-mono text-sm font-bold tracking-wide truncate"
                              style={{ color: colors.gray[900] }}
                            >
                              {pkg.trackingNumber}
                            </p>
                          </div>
                          <p
                            className="text-lg font-bold shrink-0"
                            style={{ color: colors.gray[900] }}
                          >
                            ${pkgTotal.toFixed(2)}
                          </p>
                        </div>

                        {/* Description */}
                        <p
                          className="text-sm mb-3 line-clamp-1"
                          style={{ color: colors.gray[600] }}
                        >
                          {pkg.description}
                        </p>

                        {/* Special Item Badge */}
                        {pkg.specialItemId && (
                          <div
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold mb-3"
                            style={{
                              backgroundColor: isDark ? '#581c87' : '#f3e8ff',
                              color: isDark ? '#e9d5ff' : '#7c3aed',
                            }}
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                            {pkg.specialItemName || 'Article Special'}
                          </div>
                        )}

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-3">
                          {/* Weight */}
                          <div className="flex items-center gap-2">
                            <Scale
                              className="w-3.5 h-3.5 shrink-0"
                              style={{ color: colors.gray[400] }}
                            />
                            <div>
                              <p
                                className="text-[10px] uppercase tracking-wide"
                                style={{ color: colors.gray[400] }}
                              >
                                {(t as any).packages?.details?.weight || 'Poids'}
                              </p>
                              <p
                                className="text-sm font-semibold"
                                style={{ color: colors.gray[900] }}
                              >
                                {parseFloat(pkg.weight).toFixed(1)} lbs
                              </p>
                            </div>
                          </div>

                          {/* Weight cost */}
                          <div className="flex items-center gap-2">
                            <DollarSign
                              className="w-3.5 h-3.5 shrink-0"
                              style={{ color: colors.gray[400] }}
                            />
                            <div>
                              <p
                                className="text-[10px] uppercase tracking-wide"
                                style={{ color: colors.gray[400] }}
                              >
                                {bt.feePerPackage || 'Frais poids'}
                              </p>
                              <p
                                className="text-sm font-semibold"
                                style={{ color: colors.gray[900] }}
                              >
                                ${weightCost.toFixed(2)}
                              </p>
                            </div>
                          </div>

                          {/* Service Fee */}
                          <div className="flex items-center gap-2">
                            <CheckCircle
                              className="w-3.5 h-3.5 shrink-0"
                              style={{
                                color: isFirstPackage
                                  ? colors.gray[400]
                                  : greenText,
                              }}
                            />
                            <div>
                              <p
                                className="text-[10px] uppercase tracking-wide"
                                style={{ color: colors.gray[400] }}
                              >
                                Frais de service
                              </p>
                              {isFirstPackage ? (
                                <p
                                  className="text-sm font-semibold"
                                  style={{ color: colors.gray[900] }}
                                >
                                  ${serviceFee.toFixed(2)}
                                </p>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className="text-sm line-through"
                                    style={{ color: colors.gray[400] }}
                                  >
                                    ${serviceFee.toFixed(2)}
                                  </span>
                                  <span
                                    className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                                    style={{
                                      backgroundColor: greenBg,
                                      color: greenText,
                                    }}
                                  >
                                    {bt.serviceFeeWaived || 'OFFERT'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Customs Fees */}
                          {customsFees > 0 && (
                            <div className="flex items-center gap-2">
                              <AlertTriangle
                                className="w-3.5 h-3.5 shrink-0"
                                style={{ color: '#dc2626' }}
                              />
                              <div>
                                <p
                                  className="text-[10px] uppercase tracking-wide"
                                  style={{ color: colors.gray[400] }}
                                >
                                  Taxes Douane
                                </p>
                                <p
                                  className="text-sm font-bold"
                                  style={{ color: '#dc2626' }}
                                >
                                  +${customsFees.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Special item fixed fee line */}
                        {pkg.specialItemId && (
                          <div
                            className="flex items-center justify-between rounded-lg px-3 py-2 mb-3"
                            style={{
                              backgroundColor: isDark ? '#581c87' : '#f3e8ff',
                            }}
                          >
                            <span
                              className="text-xs font-semibold flex items-center gap-1"
                              style={{
                                color: isDark ? '#e9d5ff' : '#7c3aed',
                              }}
                            >
                              <Smartphone className="w-3 h-3" />
                              {pkg.specialItemName || 'Article Special'} (Fixe)
                            </span>
                            <span
                              className="text-xs font-bold"
                              style={{
                                color: isDark ? '#e9d5ff' : '#5b21b6',
                              }}
                            >
                              ${parseFloat(pkg.specialItemFixedFee || '0').toFixed(2)}
                            </span>
                          </div>
                        )}

                        {/* Total per package */}
                        <div
                          className="flex items-center justify-between pt-3 mt-1 border-t"
                          style={{ borderColor: colors.gray[100] }}
                        >
                          <span
                            className="text-xs font-semibold uppercase tracking-wide"
                            style={{ color: colors.gray[500] }}
                          >
                            Total
                          </span>
                          <span
                            className="text-base font-bold"
                            style={{ color: colors.primary[600] }}
                          >
                            ${pkgTotal.toFixed(2)}
                          </span>
                        </div>

                        {/* Last Timeline Event */}
                        {lastEvent && (
                          <div
                            className="flex items-center gap-2 mt-3 rounded-lg p-2.5"
                            style={{
                              backgroundColor: isDark
                                ? colors.gray[200]
                                : colors.gray[50],
                            }}
                          >
                            <Clock
                              className="w-3.5 h-3.5 shrink-0"
                              style={{ color: colors.gray[400] }}
                            />
                            <div className="min-w-0 flex-1">
                              <p
                                className="text-[10px] uppercase tracking-wide font-medium"
                                style={{ color: colors.gray[400] }}
                              >
                                {bt.lastEvent || 'Last event'}
                              </p>
                              <p
                                className="text-xs truncate"
                                style={{ color: colors.gray[600] }}
                              >
                                {lastEvent.description || lastEvent.status} -{' '}
                                {new Date(lastEvent.date).toLocaleDateString(
                                  'fr-FR'
                                )}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* ── Total Comparison Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl border overflow-hidden mb-6"
            style={{
              background: isDark
                ? `linear-gradient(135deg, ${colors.gray[100]}, ${colors.gray[50]})`
                : 'linear-gradient(135deg, #eff6ff, #f5f3ff)',
              borderColor: isDark ? colors.gray[300] : '#c7d2fe',
              boxShadow: theme.shadow.md,
            }}
          >
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: isDark
                      ? colors.primary[900]
                      : colors.primary[100],
                  }}
                >
                  <DollarSign
                    className="w-5 h-5"
                    style={{ color: colors.primary[600] }}
                  />
                </div>
                <h2
                  className="text-lg font-bold font-display"
                  style={{ color: colors.gray[900] }}
                >
                  {bt.title || 'Bundle Delivery'}
                </h2>
              </div>

              <div className="space-y-3">
                {/* Weight cost breakdown */}
                {totalWeightCost > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4" style={{ color: colors.gray[400] }} />
                      <span className="text-sm" style={{ color: colors.gray[500] }}>
                        {bt.totalWeight || 'Poids total'} ({totalWeight.toFixed(1)} lbs)
                      </span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: colors.gray[700] }}>
                      ${totalWeightCost.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Special item fees — one line per special item */}
                {packages.filter(p => p.specialItemId && (parseFloat(p.specialItemFixedFee || '0') || 0) > 0).map((pkg, idx) => {
                  const sif = parseFloat(pkg.specialItemFixedFee || '0') || 0;
                  const label = pkg.specialItemName
                    ? `${pkg.specialItemBrand || ''} ${pkg.specialItemName}`.trim()
                    : bt.specialItem || 'Article special';
                  return (
                    <div key={`si-${idx}`} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" style={{ color: isDark ? '#e9d5ff' : '#7c3aed' }} />
                        <span className="text-sm" style={{ color: isDark ? '#e9d5ff' : '#7c3aed' }}>
                          {label}
                        </span>
                      </div>
                      <span className="text-sm font-semibold" style={{ color: isDark ? '#e9d5ff' : '#5b21b6' }}>
                        ${sif.toFixed(2)}
                      </span>
                    </div>
                  );
                })}

                {/* Service fee (bundle = only first) */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: colors.gray[400] }} />
                    <span className="text-sm" style={{ color: colors.gray[500] }}>
                      {(t as any).packages?.details?.serviceFee || 'Frais de service'} (×1)
                    </span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: colors.gray[700] }}>
                    ${firstFee.toFixed(2)}
                  </span>
                </div>

                {/* Customs fees */}
                {totalCustomsFees > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" style={{ color: '#dc2626' }} />
                      <span className="text-sm font-semibold" style={{ color: '#dc2626' }}>
                        {(t as any).packages?.details?.customsFees || 'Taxes Douane'}
                      </span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: '#dc2626' }}>
                      +${totalCustomsFees.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Divider */}
                <div
                  className="border-t"
                  style={{ borderColor: isDark ? colors.gray[300] : '#c7d2fe' }}
                />

                {/* Normal total (strikethrough) */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-sm"
                    style={{ color: colors.gray[500] }}
                  >
                    {bt.totalNormal || 'Prix normal'}
                  </span>
                  <span
                    className="text-lg line-through"
                    style={{ color: colors.gray[400] }}
                  >
                    ${normalTotal.toFixed(2)}
                  </span>
                </div>

                {/* Bundle total */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: colors.gray[700] }}
                  >
                    {bt.totalBundle || 'Prix bundle'}
                  </span>
                  <span
                    className="text-2xl font-bold"
                    style={{ color: colors.primary[600] }}
                  >
                    ${bundleTotal.toFixed(2)}
                  </span>
                </div>

                {/* Savings highlighted */}
                <div
                  className="flex items-center justify-between rounded-xl px-4 py-3"
                  style={{
                    backgroundColor: greenBg,
                    border: `1.5px solid ${greenBorder}`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5" style={{ color: greenText }} />
                    <span
                      className="font-semibold"
                      style={{ color: greenText }}
                    >
                      {bt.savings || 'Savings'}
                    </span>
                  </div>
                  <span
                    className="text-xl font-bold"
                    style={{ color: greenText }}
                  >
                    -${savings.toFixed(2)}
                  </span>
                </div>

                {/* Service fee explanation */}
                <p
                  className="text-xs text-center pt-1"
                  style={{ color: colors.gray[500] }}
                >
                  {bt.singleServiceFee || '1 seul frais de service'}{' '}
                  ({bt.insteadOf || 'au lieu de'} {packages.length})
                </p>
              </div>
            </div>
          </motion.div>

        </Container>
      </main>
      <BottomNav />
    </div>
  );
}
