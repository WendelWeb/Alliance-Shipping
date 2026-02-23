import React, { useMemo, useCallback, useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import {
  Layers,
  ArrowLeft,
  Gift,
  Package,
  Scale,
  DollarSign,
  MapPin,
  Clock,
  AlertTriangle,
} from 'lucide-react-native';
import { useTheme } from '@/lib/themes/ThemeProvider';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { api } from '@/lib/api';

// ── Types ──────────────────────────────────────────────────────────────────

interface TimelineEvent {
  status: string;
  date: string;
  location: string;
  description?: string;
}

interface PackageItem {
  id: string | number;
  trackingNumber: string;
  description: string;
  weight: number | string;
  status: string;
  serviceFee?: string;
  weightCost?: string;
  customsFees?: number;
  totalCost?: string;
  currentLocation?: string;
  specialItemId?: number;
  specialItemName?: string;
  specialItemBrand?: string;
  specialItemFixedFee?: string;
  chargeByWeight?: boolean;
  timeline: Array<TimelineEvent>;
}

// ── Helpers ────────────────────────────────────────────────────────────────


const legacyFallbacks: Record<string, string> = {
  'Miami Warehouse': 'packages.locations.miamiWarehouse',
  'En route to Haiti': 'packages.locations.enRouteToHaiti',
  'En route vers Haiti': 'packages.locations.enRouteToHaiti',
  'Online': 'packages.locations.online',
  'Package created by admin': 'packages.messages.packageCreatedByAdmin',
  'Transfer cancelled': 'packages.messages.transferCancelled',
};

function translateKey(key: string, translations: any): string {
  if (!key) return key;
  const legacyKey = legacyFallbacks[key];
  if (legacyKey) return translateKey(legacyKey, translations);
  if (key.endsWith(' Office')) return translations?.packages?.locations?.office || key;
  if (!key.includes('.')) {
    const tv = translations?.packages?.timeline?.[key];
    if (tv && typeof tv === 'string') return tv;
    const sv = translations?.packages?.status?.[key];
    if (sv && typeof sv === 'string') return sv;
    const lv = translations?.packages?.locations?.[key];
    if (lv && typeof lv === 'string') return lv;
    const mv = translations?.packages?.messages?.[key];
    if (mv && typeof mv === 'string') return mv;
    return key.charAt(0).toUpperCase() + key.slice(1);
  }
  const parts = key.split('.');
  let value = translations;
  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
    } else {
      return key;
    }
  }
  return typeof value === 'string' ? value : key;
}

function parseNum(val: string | number | undefined | null, fallback = 0): number {
  if (val === undefined || val === null) return fallback;
  const n = typeof val === 'number' ? val : parseFloat(val);
  return isNaN(n) ? fallback : n;
}

function formatDateTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

// ── Component ──────────────────────────────────────────────────────────────

export default function BundleAvailablePage() {
  const router = useRouter();
  const { colors, fonts, spacing, borderRadius, shadows, card, isDark } = useTheme();
  const { t } = useTranslation();

  // ── Fetch packages directly from API (like web version) ────────────────
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailable = async () => {
      try {
        const response = await api.get<{ packages: any[] }>('/api/user/packages');
        const allPkgs = response?.packages ?? [];
        const available = allPkgs.filter((p: any) => p.status === 'available');
        setPackages(available);
        // Redirect back if less than 2 available
        if (available.length < 2) {
          router.back();
        }
      } catch (err) {
        console.error('[BundleAvailable] Fetch error:', err);
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchAvailable();
  }, []);

  // ── Bundle translation shortcut ────────────────────────────────────────

  const bt = (t as any).bundle || {};

  // ── Computed values ────────────────────────────────────────────────────

  const packageCount = packages.length;

  const computedValues = useMemo(() => {
    let totalNormal = 0;
    let totalWeight = 0;
    let totalSpecialItemFees = 0;
    let totalCustomsFees = 0;
    let totalWeightCost = 0;
    let specialItemCount = 0;
    const serviceFees: number[] = [];

    for (const pkg of packages) {
      const sf = parseNum(pkg.serviceFee);
      const wc = parseNum(pkg.weightCost);
      const cf = parseNum(pkg.customsFees);
      const sif = parseNum(pkg.specialItemFixedFee);
      const tc = parseNum(pkg.totalCost);

      // Use totalCost from server if available, otherwise compute
      const pkgTotal = tc > 0 ? tc : sf + wc + cf + sif;
      totalNormal += pkgTotal;
      totalWeight += parseNum(pkg.weight);
      totalWeightCost += wc;
      totalCustomsFees += cf;
      totalSpecialItemFees += sif;
      if (pkg.specialItemId) specialItemCount++;
      serviceFees.push(sf);
    }

    // Savings = sum of real service fees waived (all except the first package)
    const firstFee = serviceFees.length > 0 ? serviceFees[0] : 0;
    const savings = serviceFees.slice(1).reduce((sum, sf) => sum + sf, 0);
    const totalBundle = totalNormal - savings;

    return { totalNormal, totalBundle, savings, totalWeight, totalWeightCost, totalCustomsFees, totalSpecialItemFees, specialItemCount, serviceFees, firstFee };
  }, [packages, packageCount]);

  const { totalNormal, totalBundle, savings, totalWeight, totalWeightCost, totalCustomsFees, totalSpecialItemFees, specialItemCount, serviceFees, firstFee } = computedValues;

  // ── Actions ────────────────────────────────────────────────────────────

  const handleGoBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);


  // ── Green palette (savings) ────────────────────────────────────────────

  const greenBg = isDark ? '#064e3b' : '#dcfce7';
  const greenText = isDark ? '#6ee7b7' : '#15803d';
  const greenBorder = isDark ? '#059669' : '#86efac';

  // ── Purple palette (bundle branding) ───────────────────────────────────

  const purplePrimary = '#7c3aed';
  const purpleLight = isDark ? '#a78bfa' : '#7c3aed';
  const purpleBg = isDark ? '#2e1065' : '#f5f3ff';
  const purpleBorder = isDark ? '#7c3aed' : '#ddd6fe';

  // ── Styles ─────────────────────────────────────────────────────────────

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.sm,
          paddingBottom: spacing.md,
          backgroundColor: card.backgroundColor,
          borderBottomWidth: 1,
          borderBottomColor: colors.gray[100],
        },
        backButton: {
          width: 40,
          height: 40,
          borderRadius: borderRadius.lg,
          backgroundColor: colors.gray[100],
          alignItems: 'center',
          justifyContent: 'center',
        },
        headerTitleContainer: {
          flex: 1,
          marginHorizontal: spacing.md,
        },
        headerTitle: {
          fontFamily: fonts.headingBold,
          fontSize: 20,
          color: colors.gray[900],
        },
        headerIcon: {
          width: 40,
          height: 40,
          borderRadius: borderRadius.lg,
          backgroundColor: purpleBg,
          alignItems: 'center',
          justifyContent: 'center',
        },
        scrollContent: {
          padding: spacing.lg,
          paddingBottom: 120,
        },

        // ── Savings Card ──
        savingsCard: {
          borderRadius: borderRadius.xl,
          padding: spacing.xl,
          marginBottom: spacing.lg,
          borderWidth: 1.5,
          borderColor: greenBorder,
          overflow: 'hidden',
        },
        savingsLabel: {
          fontFamily: fonts.semiBold,
          fontSize: 14,
          marginBottom: spacing.sm,
        },
        savingsAmount: {
          fontFamily: fonts.headingBold,
          fontSize: 32,
          lineHeight: 38,
          marginBottom: spacing.sm,
        },
        savingsSubtext: {
          fontFamily: fonts.medium,
          fontSize: 13,
          marginTop: spacing.xs,
        },

        // ── Package Card ──
        packageCard: {
          backgroundColor: card.backgroundColor,
          borderRadius: borderRadius.xl,
          padding: spacing.lg,
          marginBottom: spacing.md,
          ...shadows.sm,
        },
        packageHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.sm,
        },
        trackingNumber: {
          fontFamily: fonts.bold,
          fontSize: 15,
          letterSpacing: 0.3,
          color: colors.gray[900],
          flex: 1,
          marginRight: spacing.sm,
        },
        packageIndex: {
          width: 28,
          height: 28,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
        },
        packageIndexText: {
          fontFamily: fonts.bold,
          fontSize: 12,
          color: '#fff',
        },
        descriptionText: {
          fontFamily: fonts.regular,
          fontSize: 14,
          color: colors.gray[600],
          lineHeight: 20,
          marginBottom: spacing.md,
        },
        feeRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 5,
        },
        feeLabel: {
          fontFamily: fonts.regular,
          fontSize: 13,
          color: colors.gray[600],
        },
        feeValue: {
          fontFamily: fonts.semiBold,
          fontSize: 13,
          color: colors.gray[900],
        },
        feeDivider: {
          height: 1,
          backgroundColor: colors.gray[100],
          marginVertical: spacing.sm,
        },
        packageTotalRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: spacing.sm,
          marginTop: spacing.xs,
          borderTopWidth: 1.5,
          borderTopColor: colors.gray[100],
        },
        packageTotalLabel: {
          fontFamily: fonts.bold,
          fontSize: 14,
          color: colors.gray[900],
        },
        packageTotalValue: {
          fontFamily: fonts.bold,
          fontSize: 16,
          color: colors.primary[600],
        },
        lastEventContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: spacing.md,
          paddingTop: spacing.sm,
          borderTopWidth: 1,
          borderTopColor: colors.gray[100],
          gap: 6,
        },
        lastEventText: {
          fontFamily: fonts.regular,
          fontSize: 12,
          color: colors.gray[500],
          flex: 1,
        },

        // ── Service fee badge ──
        wavedBadge: {
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: borderRadius.sm,
        },
        wavedBadgeText: {
          fontFamily: fonts.bold,
          fontSize: 10,
        },
        crossedOutText: {
          fontFamily: fonts.regular,
          fontSize: 13,
          textDecorationLine: 'line-through',
          color: colors.gray[400],
          marginRight: 6,
        },

        // ── Total Section Card ──
        totalCard: {
          backgroundColor: card.backgroundColor,
          borderRadius: borderRadius.xl,
          padding: spacing.xl,
          marginBottom: spacing.lg,
          borderWidth: 1.5,
          borderColor: purpleBorder,
          ...shadows.sm,
        },
        totalSectionTitle: {
          fontFamily: fonts.headingSemiBold,
          fontSize: 16,
          color: colors.gray[900],
          marginBottom: spacing.lg,
        },
        totalRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 6,
        },
        totalLabel: {
          fontFamily: fonts.regular,
          fontSize: 14,
          color: colors.gray[600],
        },
        totalNormalValue: {
          fontFamily: fonts.semiBold,
          fontSize: 15,
          color: colors.gray[400],
          textDecorationLine: 'line-through',
        },
        totalBundleRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: spacing.md,
          marginTop: spacing.sm,
          borderTopWidth: 2,
          borderTopColor: purplePrimary,
        },
        totalBundleLabel: {
          fontFamily: fonts.bold,
          fontSize: 17,
          color: colors.gray[900],
        },
        totalBundleValue: {
          fontFamily: fonts.headingBold,
          fontSize: 24,
        },
        savingsRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          marginTop: spacing.xs,
          gap: 6,
        },
        savingsText: {
          fontFamily: fonts.bold,
          fontSize: 13,
        },

        // ── Weight pill ──
        weightRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        },
        weightPill: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.gray[100],
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: borderRadius.full,
          gap: 4,
        },
        weightPillText: {
          fontFamily: fonts.medium,
          fontSize: 12,
          color: colors.gray[600],
        },
      }),
    [colors, fonts, spacing, borderRadius, shadows, card, isDark, greenBorder, purpleBg, purpleBorder]
  );

  // ── Loading state ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={purplePrimary} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────

  if (packages.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
          <Pressable onPress={handleGoBack} style={styles.backButton}>
            <ArrowLeft size={20} color={colors.gray[600]} />
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{bt.bundleAvailable || 'Bundle Available'}</Text>
          </View>
          <View style={styles.headerIcon}>
            <Layers size={20} color={purpleLight} />
          </View>
        </Animated.View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing['3xl'] }}>
          <AlertTriangle size={48} color={colors.gray[300]} />
          <Text style={{ fontFamily: fonts.medium, fontSize: 16, color: colors.gray[500], marginTop: spacing.md, textAlign: 'center' }}>
            No packages found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Get last timeline event for a package ──────────────────────────────

  const getLastEvent = (pkg: PackageItem): TimelineEvent | null => {
    if (!pkg.timeline || pkg.timeline.length === 0) return null;
    return pkg.timeline[pkg.timeline.length - 1];
  };

  // ── Compute per-package total ──────────────────────────────────────────

  const getPackageTotal = (pkg: PackageItem): number => {
    const tc = parseNum(pkg.totalCost);
    if (tc > 0) return tc;
    const sf = parseNum(pkg.serviceFee);
    const wc = parseNum(pkg.weightCost);
    const cf = parseNum(pkg.customsFees);
    const sif = parseNum(pkg.specialItemFixedFee);
    return sf + wc + cf + sif;
  };

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <Pressable onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft size={20} color={colors.gray[600]} />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{bt.bundleAvailable || 'Bundle Available'}</Text>
        </View>
        <View style={styles.headerIcon}>
          <Layers size={20} color={purpleLight} />
        </View>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Savings Card ── */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={[styles.savingsCard, { backgroundColor: greenBg }]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
            <Gift size={20} color={greenText} />
            <Text style={[styles.savingsLabel, { color: greenText }]}>
              {packageCount} {bt.packagesAvailable || 'packages available'}
            </Text>
          </View>

          <Text style={[styles.savingsAmount, { color: greenText }]}>
            {bt.saveWith ? bt.saveWith.replace('!', '') : 'Save'} ${savings.toFixed(2)}
          </Text>

          <Text style={[styles.savingsSubtext, { color: greenText, opacity: 0.85 }]}>
            {bt.singleFee || '1 service fee only'} {bt.insteadOf || 'instead of'} {packageCount}
          </Text>
        </Animated.View>

        {/* ── Package Cards ── */}
        {packages.map((pkg, index) => {
          const sf = parseNum(pkg.serviceFee);
          const wc = parseNum(pkg.weightCost);
          const cf = parseNum(pkg.customsFees);
          const sif = parseNum(pkg.specialItemFixedFee);
          const pkgTotal = getPackageTotal(pkg);
          const isFirstPackage = index === 0;
          const lastEvent = getLastEvent(pkg);

          return (
            <Animated.View
              key={String(pkg.id)}
              entering={FadeInDown.delay(200 + index * 80).duration(400)}
              style={styles.packageCard}
            >
              {/* Package header: tracking + index badge */}
              <View style={styles.packageHeader}>
                <Text style={styles.trackingNumber} numberOfLines={1}>
                  {pkg.trackingNumber}
                </Text>
                <View style={[styles.packageIndex, { backgroundColor: purplePrimary }]}>
                  <Text style={styles.packageIndexText}>{index + 1}</Text>
                </View>
              </View>

              {/* Description */}
              <Text style={styles.descriptionText} numberOfLines={1}>
                {pkg.description}
              </Text>

              {/* Special Item Badge */}
              {pkg.specialItemId && (
                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: 6,
                  backgroundColor: isDark ? '#581c87' : '#f3e8ff',
                  paddingHorizontal: 10, paddingVertical: 6, borderRadius: borderRadius.md,
                  marginBottom: spacing.sm, alignSelf: 'flex-start',
                }}>
                  <Package size={12} color={isDark ? '#e9d5ff' : '#7c3aed'} />
                  <Text style={{ fontFamily: fonts.bold, fontSize: 11, color: isDark ? '#e9d5ff' : '#7c3aed' }}>
                    {pkg.specialItemName ? `${pkg.specialItemBrand || ''} ${pkg.specialItemName}`.trim() : 'Article Special'}
                  </Text>
                </View>
              )}

              {/* Special Item Fixed Fee */}
              {sif > 0 && (
                <View style={[styles.feeRow, { marginBottom: spacing.xs }]}>
                  <Text style={[styles.feeLabel, { color: isDark ? '#e9d5ff' : '#7c3aed', fontFamily: fonts.semiBold }]}>
                    {pkg.specialItemName || 'Article Special'} (Fixe)
                  </Text>
                  <Text style={[styles.feeValue, { color: isDark ? '#e9d5ff' : '#5b21b6' }]}>
                    ${sif.toFixed(2)}
                  </Text>
                </View>
              )}

              {/* Weight + Weight Cost */}
              {(wc > 0 || !pkg.specialItemId || pkg.chargeByWeight) && (
                <View style={[styles.feeRow, { marginBottom: spacing.xs }]}>
                  <View style={styles.weightRow}>
                    <Scale size={14} color={colors.gray[500]} />
                    <Text style={styles.feeLabel}>
                      {parseNum(pkg.weight).toFixed(1)} lbs
                    </Text>
                  </View>
                  <Text style={styles.feeValue}>
                    ${wc.toFixed(2)}
                  </Text>
                </View>
              )}

              {/* Service Fee */}
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>
                  {(t as any).packageDetail?.serviceFee || 'Service fee'}
                </Text>
                {isFirstPackage ? (
                  <Text style={styles.feeValue}>${sf.toFixed(2)}</Text>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.crossedOutText}>
                      ${sf.toFixed(2)}
                    </Text>
                    <View style={[styles.wavedBadge, { backgroundColor: greenBg }]}>
                      <Text style={[styles.wavedBadgeText, { color: greenText }]}>
                        {bt.serviceFeeWaived || 'FREE'}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Customs Fees (only if > 0) */}
              {cf > 0 && (
                <View style={styles.feeRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <AlertTriangle size={12} color={colors.red[500]} />
                    <Text style={[styles.feeLabel, { color: colors.red[500], fontFamily: fonts.semiBold }]}>
                      {(t as any).packageDetail?.customsFee || 'Customs fee'}
                    </Text>
                  </View>
                  <Text style={[styles.feeValue, { color: colors.red[500], fontFamily: fonts.bold }]}>
                    +${cf.toFixed(2)}
                  </Text>
                </View>
              )}

              {/* Per-package total */}
              <View style={styles.packageTotalRow}>
                <Text style={styles.packageTotalLabel}>
                  {(t as any).packageDetail?.total || 'TOTAL'}
                </Text>
                <Text style={styles.packageTotalValue}>
                  ${isFirstPackage ? pkgTotal.toFixed(2) : (pkgTotal - sf).toFixed(2)}
                </Text>
              </View>

              {/* Last timeline event */}
              {lastEvent && (
                <View style={styles.lastEventContainer}>
                  <Clock size={12} color={colors.gray[400]} />
                  <Text style={styles.lastEventText} numberOfLines={1}>
                    {bt.lastEvent || 'Last event'}: {translateKey(lastEvent.location || '', t)} - {formatDateTime(lastEvent.date)}
                  </Text>
                </View>
              )}
            </Animated.View>
          );
        })}

        {/* ── Total Section Card ── */}
        <Animated.View
          entering={FadeInDown.delay(200 + packageCount * 80 + 100).duration(400)}
          style={styles.totalCard}
        >
          {/* Section icon + title */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg }}>
            <View style={{
              width: 36,
              height: 36,
              borderRadius: borderRadius.lg,
              backgroundColor: purplePrimary,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <DollarSign size={18} color="#fff" />
            </View>
            <Text style={styles.totalSectionTitle}>
              {bt.title || 'Bundle Delivery'}
            </Text>
          </View>

          {/* Weight cost (only if packages have weight charges) */}
          {totalWeightCost > 0 && (
            <View style={styles.totalRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Scale size={14} color={colors.gray[500]} />
                <Text style={styles.totalLabel}>
                  {bt.totalWeight || 'Total weight'} ({totalWeight.toFixed(1)} lbs)
                </Text>
              </View>
              <Text style={[styles.feeValue, { color: colors.gray[900] }]}>
                ${totalWeightCost.toFixed(2)}
              </Text>
            </View>
          )}

          {/* Special item fees — one line per special item */}
          {packages.filter(p => p.specialItemId && parseNum(p.specialItemFixedFee) > 0).map((pkg, idx) => {
            const sif = parseNum(pkg.specialItemFixedFee);
            const label = pkg.specialItemName
              ? `${pkg.specialItemBrand || ''} ${pkg.specialItemName}`.trim()
              : bt.specialItem || 'Special item';
            return (
              <View key={`si-${idx}`} style={styles.totalRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Package size={14} color={isDark ? '#e9d5ff' : '#7c3aed'} />
                  <Text style={[styles.totalLabel, { color: isDark ? '#e9d5ff' : '#7c3aed' }]}>
                    {label}
                  </Text>
                </View>
                <Text style={[styles.feeValue, { color: isDark ? '#e9d5ff' : '#5b21b6' }]}>
                  ${sif.toFixed(2)}
                </Text>
              </View>
            );
          })}

          {/* Service fee (bundle = only first) */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              {(t as any).packageDetail?.serviceFee || 'Service fee'} (×1)
            </Text>
            <Text style={[styles.feeValue, { color: colors.gray[900] }]}>
              ${firstFee.toFixed(2)}
            </Text>
          </View>

          {/* Customs fees (only if > 0) */}
          {totalCustomsFees > 0 && (
            <View style={styles.totalRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={12} color={colors.red[500]} />
                <Text style={[styles.totalLabel, { color: colors.red[500], fontFamily: fonts.semiBold }]}>
                  {(t as any).packageDetail?.customsFee || 'Customs fees'}
                </Text>
              </View>
              <Text style={[styles.feeValue, { color: colors.red[500], fontFamily: fonts.bold }]}>
                +${totalCustomsFees.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.feeDivider} />

          {/* Normal price (crossed out) */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              {bt.totalNormal || 'Normal price'}
            </Text>
            <Text style={styles.totalNormalValue}>
              ${totalNormal.toFixed(2)}
            </Text>
          </View>

          {/* Bundle price */}
          <View style={styles.totalBundleRow}>
            <Text style={styles.totalBundleLabel}>
              {bt.totalBundle || 'Bundle price'}
            </Text>
            <Text style={[styles.totalBundleValue, { color: purplePrimary }]}>
              ${totalBundle.toFixed(2)}
            </Text>
          </View>

          {/* Savings highlight */}
          <View style={styles.savingsRow}>
            <Gift size={14} color={greenText} />
            <Text style={[styles.savingsText, { color: greenText }]}>
              -${savings.toFixed(2)}
            </Text>
          </View>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}
