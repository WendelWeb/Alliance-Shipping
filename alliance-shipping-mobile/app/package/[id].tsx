import React, { useMemo, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Copy,
  Share2,
  Package,
  Shirt,
  Smartphone,
  FileText,
  ShoppingBag,
  HelpCircle,
  MapPin,
  Calendar,
  Scale,
  AlertTriangle,
  DollarSign,
  Clock,
  CheckCircle,
  Truck,
  CircleDot,
  Info,
} from 'lucide-react-native';
import { useTheme } from '@/lib/themes/ThemeProvider';
import { useTranslation } from '@/lib/i18n/useTranslation';

// ── Types ──────────────────────────────────────────────────────────

interface TimelineEvent {
  status: string;
  date: string;
  location: string;
  description?: string;
  pending?: boolean;
}

interface PackageData {
  id: number;
  trackingNumber: string;
  externalTrackingNumber?: string;
  description: string;
  weight: number | string;
  status: string;
  category: string;
  createdAt: string;
  updatedAt?: string;
  currentLocation?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  customsFees?: number;
  specialItemId?: number;
  specialItemName?: string;
  specialItemBrand?: string;
  specialItemFixedFee?: string;
  chargeByWeight?: boolean;
  serviceFee?: string;
  weightCost?: string;
  totalCost?: string;
  timeline: TimelineEvent[];
}

// ── Helpers ────────────────────────────────────────────────────────

const STATUS_ORDER = ['received', 'in-transit', 'available', 'delivered'];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Fallback map for old hardcoded English strings already in DB
const legacyFallbacks: Record<string, string> = {
  'Miami Warehouse': 'packages.locations.miamiWarehouse',
  'En route to Haiti': 'packages.locations.enRouteToHaiti',
  'En route vers Haiti': 'packages.locations.enRouteToHaiti',
  'En route vers Haïti': 'packages.locations.enRouteToHaiti',
  'Online': 'packages.locations.online',
  // Old tracking history descriptions
  'Package created by admin': 'packages.messages.packageCreatedByAdmin',
  'Transfer cancelled': 'packages.messages.transferCancelled',
};

function translateKey(key: string, translations: any): string {
  if (!key) return key;

  // Check legacy fallbacks for old hardcoded strings
  const legacyKey = legacyFallbacks[key];
  if (legacyKey) return translateKey(legacyKey, translations);

  // Handle dynamic legacy patterns (old entries already in DB)
  if (key.startsWith('Package created with status:')) return translations?.packages?.messages?.packageCreatedByAdmin || key;
  if (key.startsWith('Status updated to ')) return translations?.packages?.messages?.statusUpdated || key;
  if (key.startsWith('Package claimed by ')) return translations?.packages?.messages?.packageClaimed || key;
  if (key.startsWith('Transfer cancelled')) return translations?.packages?.messages?.transferCancelled || key;
  // Handle "X Office" pattern (e.g. "Port-au-Prince Office")
  if (key.endsWith(' Office')) return translations?.packages?.locations?.office || key;

  // Simple key (no dots) — search in timeline, status, locations, messages
  if (!key.includes('.')) {
    const timelineValue = translations?.packages?.timeline?.[key];
    if (timelineValue && typeof timelineValue === 'string') return timelineValue;
    const statusValue = translations?.packages?.status?.[key];
    if (statusValue && typeof statusValue === 'string') return statusValue;
    const locationValue = translations?.packages?.locations?.[key];
    if (locationValue && typeof locationValue === 'string') return locationValue;
    const messageValue = translations?.packages?.messages?.[key];
    if (messageValue && typeof messageValue === 'string') return messageValue;
    return key.charAt(0).toUpperCase() + key.slice(1);
  }

  // Dotted key — resolve path
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

const categoryConfig: Record<string, { icon: any; label: string; emoji: string }> = {
  general: { icon: Package, label: 'General', emoji: '📦' },
  clothing: { icon: Shirt, label: 'Vetements', emoji: '👕' },
  electronics: { icon: Smartphone, label: 'Electronique', emoji: '💻' },
  food: { icon: ShoppingBag, label: 'Nourriture', emoji: '🍽️' },
  documents: { icon: FileText, label: 'Documents', emoji: '📄' },
  other: { icon: HelpCircle, label: 'Autre', emoji: '🏷️' },
};

// ── Component ──────────────────────────────────────────────────────

export default function PackageDetailPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, fonts, spacing, borderRadius, shadows, card, isDark } = useTheme();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id: string; data: string }>();

  // Parse package data from navigation params
  const pkg: PackageData | null = useMemo(() => {
    try {
      if (params.data) {
        return JSON.parse(params.data);
      }
    } catch (e) {
      console.error('Failed to parse package data:', e);
    }
    return null;
  }, [params.data]);

  // ── Computed values ────────────────────────────────────────────

  const customsFees = parseFloat(String(pkg?.customsFees ?? '0')) || 0;
  const serviceFee = parseFloat(String(pkg?.serviceFee ?? '0')) || 0;
  const weightCost = parseFloat(String(pkg?.weightCost ?? '0')) || 0;
  const specialItemFixedFee = parseFloat(String(pkg?.specialItemFixedFee ?? '0')) || 0;
  const totalCost = serviceFee + weightCost + customsFees + specialItemFixedFee;

  const statusColors = useMemo(
    () => ({
      pending: { bg: colors.yellow[100]!, text: colors.yellow[600], dot: colors.yellow[500], gradient: colors.yellow[500] },
      requested: { bg: colors.yellow[100]!, text: colors.yellow[600], dot: colors.yellow[500], gradient: colors.yellow[500] },
      received: { bg: colors.primary[100], text: colors.primary[600], dot: colors.primary[500], gradient: colors.primary[500] },
      'in-transit': { bg: colors.purple[100]!, text: colors.purple[600], dot: colors.purple[500], gradient: colors.purple[500] },
      available: { bg: colors.green[100]!, text: colors.green[600], dot: colors.green[500], gradient: colors.green[500] },
      delivered: { bg: colors.emerald[100]!, text: colors.emerald[600], dot: colors.emerald[500], gradient: colors.emerald[500] },
      rejected: { bg: colors.red[100]!, text: colors.red[600], dot: colors.red[500], gradient: colors.red[500] },
    }),
    [colors]
  );

  const defaultStatusColor = { bg: colors.gray[100], text: colors.gray[600], dot: colors.gray[400], gradient: colors.gray[400] };
  const palette = statusColors[pkg?.status as keyof typeof statusColors] ?? defaultStatusColor;

  const currentStatusIndex = STATUS_ORDER.indexOf(pkg?.status || '');
  const isRejected = pkg?.status === 'rejected';
  const isPending = pkg?.status === 'pending' || pkg?.status === 'requested';

  // ── Translation helpers ────────────────────────────────────────

  const pd = (t as any).packageDetail || {};

  const statusProgressLabels = useMemo(() => [
    pd.statusProgress?.received || t.packages.status.received || 'Received',
    pd.statusProgress?.inTransit || t.packages.status['in-transit'] || 'In Transit',
    pd.statusProgress?.available || t.packages.status.available || 'Available',
    pd.statusProgress?.delivered || t.packages.status.delivered || 'Delivered',
  ], [pd, t]);

  const statusProgressIcons = [Package, Truck, CheckCircle, CheckCircle];

  // ── Actions ────────────────────────────────────────────────────

  const handleCopyTracking = useCallback(async () => {
    if (!pkg) return;
    await Clipboard.setStringAsync(pkg.trackingNumber);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [pkg]);

  const handleShare = useCallback(async () => {
    if (!pkg) return;
    try {
      await Share.share({
        message: `${pd.title || 'Package'}: ${pkg.trackingNumber}\nStatus: ${translateKey(pkg.status, t)}`,
      });
    } catch {}
  }, [pkg, pd, t]);

  const handleGoBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  // ── Category info ──────────────────────────────────────────────

  const catInfo = categoryConfig[pkg?.category || 'general'] || categoryConfig.general;
  const CatIcon = catInfo.icon;

  // ── Styles ─────────────────────────────────────────────────────

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        header: {
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.sm,
          paddingBottom: spacing.md,
          backgroundColor: card.backgroundColor,
          borderBottomWidth: 1,
          borderBottomColor: colors.gray[100],
        },
        headerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        backButton: {
          width: 40,
          height: 40,
          borderRadius: borderRadius.lg,
          backgroundColor: colors.gray[100],
          alignItems: 'center',
          justifyContent: 'center',
        },
        headerActions: {
          flexDirection: 'row',
          gap: spacing.sm,
        },
        actionButton: {
          width: 40,
          height: 40,
          borderRadius: borderRadius.lg,
          backgroundColor: colors.gray[100],
          alignItems: 'center',
          justifyContent: 'center',
        },
        trackingRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: spacing.md,
        },
        trackingNumber: {
          fontFamily: fonts.bold,
          fontSize: 20,
          letterSpacing: 0.5,
          color: colors.gray[900],
        },
        externalTracking: {
          fontFamily: fonts.regular,
          fontSize: 12,
          color: colors.gray[500],
          marginTop: 2,
        },
        statusBadge: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: borderRadius.full,
          gap: 6,
        },
        statusDot: {
          width: 8,
          height: 8,
          borderRadius: 4,
        },
        statusText: {
          fontFamily: fonts.semiBold,
          fontSize: 13,
        },
        scrollContent: {
          padding: spacing.lg,
          paddingBottom: 100,
        },
        // ── Progress Bar ──
        progressContainer: {
          backgroundColor: card.backgroundColor,
          borderRadius: borderRadius.xl,
          padding: spacing.lg,
          marginBottom: spacing.md,
          ...shadows.sm,
        },
        progressRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        progressStep: {
          alignItems: 'center',
          flex: 1,
        },
        progressCircle: {
          width: 36,
          height: 36,
          borderRadius: 18,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 6,
        },
        progressLabel: {
          fontFamily: fonts.medium,
          fontSize: 10,
          textAlign: 'center',
        },
        progressLine: {
          height: 3,
          flex: 1,
          marginHorizontal: -2,
          marginBottom: 18,
          borderRadius: 2,
        },
        // ── Section Cards ──
        sectionCard: {
          backgroundColor: card.backgroundColor,
          borderRadius: borderRadius.xl,
          padding: spacing.lg,
          marginBottom: spacing.md,
          ...shadows.sm,
        },
        sectionTitle: {
          fontFamily: fonts.headingSemiBold,
          fontSize: 16,
          color: colors.gray[900],
          marginBottom: spacing.md,
        },
        sectionTitleRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.md,
        },
        sectionIcon: {
          width: 32,
          height: 32,
          borderRadius: borderRadius.md,
          alignItems: 'center',
          justifyContent: 'center',
        },
        // ── Info Grid ──
        infoGrid: {
          gap: spacing.md,
        },
        infoRow: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: spacing.md,
        },
        infoItem: {
          flex: 1,
        },
        infoLabel: {
          fontFamily: fonts.medium,
          fontSize: 11,
          color: colors.gray[500],
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: 4,
        },
        infoValue: {
          fontFamily: fonts.semiBold,
          fontSize: 14,
          color: colors.gray[900],
        },
        infoIconRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        },
        // ── Special Item ──
        specialItemCard: {
          backgroundColor: card.backgroundColor,
          borderRadius: borderRadius.xl,
          padding: spacing.lg,
          marginBottom: spacing.md,
          borderWidth: 1,
          borderColor: isDark ? colors.purple[400] : colors.purple[200],
          ...shadows.sm,
        },
        specialItemBadge: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.sm,
        },
        specialItemIconBox: {
          width: 40,
          height: 40,
          borderRadius: borderRadius.lg,
          backgroundColor: colors.purple[600],
          alignItems: 'center',
          justifyContent: 'center',
        },
        specialItemName: {
          fontFamily: fonts.bold,
          fontSize: 16,
          color: colors.gray[900],
        },
        specialItemBrandText: {
          fontFamily: fonts.medium,
          fontSize: 12,
          color: colors.gray[500],
        },
        specialItemFee: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: isDark ? colors.gray[200] : colors.purple[50],
          borderRadius: borderRadius.md,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          marginTop: spacing.sm,
        },
        // ── Fee Breakdown ──
        feeCard: {
          backgroundColor: card.backgroundColor,
          borderRadius: borderRadius.xl,
          padding: spacing.lg,
          marginBottom: spacing.md,
          borderWidth: 1.5,
          borderColor: isDark ? colors.gray[300] : colors.primary[100],
          ...shadows.sm,
        },
        feeRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 6,
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
        feeTotalRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: spacing.sm,
          marginTop: spacing.sm,
          borderTopWidth: 2,
          borderTopColor: colors.primary[500],
        },
        feeTotalLabel: {
          fontFamily: fonts.bold,
          fontSize: 16,
          color: colors.gray[900],
        },
        feeTotalValue: {
          fontFamily: fonts.bold,
          fontSize: 20,
          color: colors.primary[600],
        },
        // ── Timeline ──
        timelineItem: {
          flexDirection: 'row',
          minHeight: 60,
        },
        timelineTrack: {
          width: 28,
          alignItems: 'center',
        },
        timelineDotOuter: {
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: 2.5,
          alignItems: 'center',
          justifyContent: 'center',
        },
        timelineDotInner: {
          width: 8,
          height: 8,
          borderRadius: 4,
        },
        timelineLine: {
          width: 2.5,
          flex: 1,
          marginVertical: 2,
        },
        timelineContent: {
          flex: 1,
          paddingLeft: spacing.md,
          paddingBottom: spacing.xl,
        },
        timelineStatus: {
          fontFamily: fonts.semiBold,
          fontSize: 14,
          color: colors.gray[900],
          marginBottom: 2,
        },
        timelineLocation: {
          fontFamily: fonts.regular,
          fontSize: 12,
          color: colors.gray[500],
        },
        timelineDescription: {
          fontFamily: fonts.regular,
          fontSize: 11,
          color: colors.gray[400],
          marginTop: 2,
        },
        timelineDate: {
          fontFamily: fonts.regular,
          fontSize: 11,
          color: colors.gray[400],
          marginTop: 4,
        },
        // ── Description Box ──
        descriptionBox: {
          backgroundColor: isDark ? colors.gray[200] : colors.gray[50],
          borderRadius: borderRadius.md,
          padding: spacing.md,
          marginBottom: spacing.md,
        },
        descriptionText: {
          fontFamily: fonts.regular,
          fontSize: 14,
          color: colors.gray[700],
          lineHeight: 20,
        },
      }),
    [colors, fonts, spacing, borderRadius, shadows, card, isDark]
  );

  // ── Loading / Error ────────────────────────────────────────────

  if (!pkg) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={handleGoBack} style={styles.backButton}>
            <ArrowLeft size={20} color={colors.gray[600]} />
          </Pressable>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Package size={48} color={colors.gray[300]} />
          <Text style={{ fontFamily: fonts.medium, fontSize: 16, color: colors.gray[500], marginTop: spacing.md }}>
            {pd.notFound || 'Package not found'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Render ─────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={handleGoBack} style={styles.backButton}>
            <ArrowLeft size={20} color={colors.gray[600]} />
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable onPress={handleCopyTracking} style={styles.actionButton}>
              <Copy size={18} color={colors.gray[600]} />
            </Pressable>
            <Pressable onPress={handleShare} style={styles.actionButton}>
              <Share2 size={18} color={colors.gray[600]} />
            </Pressable>
          </View>
        </View>

        <View style={styles.trackingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.trackingNumber}>{pkg.trackingNumber}</Text>
            {pkg.externalTrackingNumber && pkg.externalTrackingNumber !== pkg.trackingNumber && (
              <Text style={styles.externalTracking}>Ext: {pkg.externalTrackingNumber}</Text>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: palette.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: palette.dot }]} />
            <Text style={[styles.statusText, { color: palette.text }]}>
              {translateKey(pkg.status, t)}
            </Text>
          </View>
        </View>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── Status Progress Bar ── */}
        {!isRejected && !isPending && (
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.progressContainer}>
            <View style={styles.progressRow}>
              {STATUS_ORDER.map((step, index) => {
                const stepIndex = index;
                const isPast = currentStatusIndex > stepIndex;
                const isCurrent = currentStatusIndex === stepIndex;
                const isCompleted = isPast || isCurrent;
                const StepIcon = statusProgressIcons[index];

                return (
                  <React.Fragment key={step}>
                    <View style={styles.progressStep}>
                      <View
                        style={[
                          styles.progressCircle,
                          {
                            backgroundColor: isCompleted
                              ? palette.gradient
                              : colors.gray[100],
                          },
                        ]}
                      >
                        {isCompleted ? (
                          <CheckCircle size={18} color="#fff" />
                        ) : (
                          <StepIcon
                            size={16}
                            color={colors.gray[400]}
                          />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.progressLabel,
                          {
                            color: isCompleted
                              ? colors.gray[900]
                              : colors.gray[400],
                            fontFamily: isCurrent ? fonts.bold : fonts.medium,
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {statusProgressLabels[index]}
                      </Text>
                    </View>
                    {index < STATUS_ORDER.length - 1 && (
                      <View
                        style={[
                          styles.progressLine,
                          {
                            backgroundColor: isPast ? palette.gradient : colors.gray[200],
                          },
                        ]}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* ── Rejected / Pending banner ── */}
        {(isRejected || isPending) && (
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            style={[
              styles.sectionCard,
              {
                backgroundColor: isRejected
                  ? (isDark ? colors.red[100] : colors.red[50])
                  : (isDark ? colors.yellow[100] : colors.yellow[50]),
                borderWidth: 1,
                borderColor: isRejected ? colors.red[200] : colors.yellow[200],
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <AlertTriangle size={20} color={isRejected ? colors.red[500] : colors.yellow[500]} />
              <Text
                style={{
                  fontFamily: fonts.semiBold,
                  fontSize: 14,
                  color: isRejected ? colors.red[600] : colors.yellow[600],
                }}
              >
                {isRejected
                  ? (pd.statusProgress?.rejected || t.packages.status.rejected || 'Rejected')
                  : (pd.statusProgress?.pending || t.packages.status.pending || 'Pending')}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* ── Package Info ── */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.primary[100] }]}>
              <Info size={16} color={colors.primary[600]} />
            </View>
            <Text style={styles.sectionTitle}>
              {pd.packageInfo || t.packages.details?.trackingNumber || 'Package Information'}
            </Text>
          </View>

          {/* Description */}
          {pkg.description && (
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionText}>{pkg.description}</Text>
            </View>
          )}

          <View style={styles.infoGrid}>
            {/* Weight + Category */}
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>{pd.weight || t.packages.details?.weight || 'Weight'}</Text>
                <View style={styles.infoIconRow}>
                  <Scale size={14} color={colors.gray[500]} />
                  <Text style={styles.infoValue}>{pkg.weight} lbs</Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>{pd.category || 'Category'}</Text>
                <View style={styles.infoIconRow}>
                  <CatIcon size={14} color={colors.gray[500]} />
                  <Text style={styles.infoValue}>{catInfo.label}</Text>
                </View>
              </View>
            </View>

            {/* Location + Delivery */}
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>{pd.currentLocation || 'Location'}</Text>
                <View style={styles.infoIconRow}>
                  <MapPin size={14} color={colors.primary[500]} />
                  <Text style={[styles.infoValue, { fontSize: 13 }]} numberOfLines={1}>
                    {pkg.currentLocation ? translateKey(pkg.currentLocation, t) : '-'}
                  </Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>
                  {pkg.actualDelivery
                    ? (pd.deliveredAt || (t.packages as any).deliveredAt || 'Delivered')
                    : (pd.estimatedDelivery || 'Delivery')}
                </Text>
                <View style={styles.infoIconRow}>
                  <Calendar size={14} color={pkg.actualDelivery ? colors.green[500] : colors.gray[500]} />
                  <Text style={[styles.infoValue, pkg.actualDelivery && { color: colors.green[600] }]}>
                    {pkg.actualDelivery
                      ? formatDate(pkg.actualDelivery)
                      : pkg.estimatedDelivery
                        ? formatDate(pkg.estimatedDelivery)
                        : '-'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Dates */}
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>{pd.createdAt || 'Created'}</Text>
                <View style={styles.infoIconRow}>
                  <Clock size={14} color={colors.gray[500]} />
                  <Text style={[styles.infoValue, { fontSize: 12 }]}>{formatDate(pkg.createdAt)}</Text>
                </View>
              </View>
              {pkg.updatedAt && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>{pd.updatedAt || 'Updated'}</Text>
                  <View style={styles.infoIconRow}>
                    <Clock size={14} color={colors.gray[500]} />
                    <Text style={[styles.infoValue, { fontSize: 12 }]}>{formatDate(pkg.updatedAt)}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Animated.View>

        {/* ── Special Item Card ── */}
        {pkg.specialItemId && (
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.specialItemCard}>
            <View style={styles.specialItemBadge}>
              <View style={styles.specialItemIconBox}>
                <Smartphone size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.specialItemName}>
                  {pkg.specialItemName || (t as any).packages?.specialItem || 'Special Item'}
                </Text>
                {pkg.specialItemBrand && (
                  <Text style={styles.specialItemBrandText}>{pkg.specialItemBrand}</Text>
                )}
              </View>
            </View>
            <View style={styles.specialItemFee}>
              <Text style={{ fontFamily: fonts.semiBold, fontSize: 13, color: colors.gray[600] }}>
                {pd.fixedFee || 'Fixed Fee'}
              </Text>
              <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: colors.gray[900] }}>
                ${specialItemFixedFee.toFixed(2)}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* ── Fee Breakdown ── */}
        {totalCost > 0 && (
          <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.feeCard}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionIcon, { backgroundColor: isDark ? colors.gray[200] : colors.primary[50] }]}>
                <DollarSign size={16} color={colors.primary[600]} />
              </View>
              <Text style={styles.sectionTitle}>
                {pd.feeBreakdown || (t.packages as any).feeBreakdown?.title || 'Fee Breakdown'}
              </Text>
            </View>

            {/* Service Fee */}
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>
                {pd.serviceFee || (t.packages as any).feeBreakdown?.serviceFee || 'Service fee'}
              </Text>
              <Text style={styles.feeValue}>${serviceFee.toFixed(2)}</Text>
            </View>

            {/* Weight Fee */}
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>
                {pd.weightFee || (t.packages as any).feeBreakdown?.weightFee || 'Weight fee'} ({pkg.weight} lbs)
              </Text>
              <Text style={styles.feeValue}>${weightCost.toFixed(2)}</Text>
            </View>

            {/* Special Item Fixed Fee */}
            {pkg.specialItemId && (
              <View
                style={[
                  styles.feeRow,
                  {
                    backgroundColor: isDark ? colors.gray[200] : colors.purple[50],
                    borderRadius: borderRadius.sm,
                    paddingHorizontal: spacing.sm,
                    marginHorizontal: -spacing.sm,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Smartphone size={12} color={colors.purple[500]} />
                  <Text
                    style={[styles.feeLabel, { color: colors.gray[700], fontFamily: fonts.semiBold }]}
                    numberOfLines={1}
                  >
                    {pkg.specialItemName
                      ? `${pkg.specialItemBrand || ''} ${pkg.specialItemName}`.trim()
                      : (t.packages as any).specialItem || 'Special Item'}
                  </Text>
                </View>
                <Text
                  style={[styles.feeValue, { color: colors.gray[900], fontFamily: fonts.bold }]}
                >
                  ${specialItemFixedFee.toFixed(2)}
                </Text>
              </View>
            )}

            {/* Customs Fee */}
            <View style={styles.feeRow}>
              <Text
                style={[
                  styles.feeLabel,
                  customsFees > 0 && { color: colors.red[500], fontFamily: fonts.semiBold },
                ]}
              >
                {pd.customsFee || (t.packages as any).feeBreakdown?.customsFee || 'Customs fee'}
              </Text>
              <Text
                style={[
                  styles.feeValue,
                  customsFees > 0 && { color: colors.red[500], fontFamily: fonts.bold },
                ]}
              >
                {customsFees > 0 ? '+' : ''}${customsFees.toFixed(2)}
              </Text>
            </View>

            {/* Total */}
            <View style={styles.feeTotalRow}>
              <Text style={styles.feeTotalLabel}>
                {pd.total || (t.packages as any).feeBreakdown?.total || 'TOTAL'}
              </Text>
              <Text style={styles.feeTotalValue}>${totalCost.toFixed(2)}</Text>
            </View>
          </Animated.View>
        )}

        {/* ── Timeline ── */}
        {pkg.timeline && pkg.timeline.length > 0 && (
          <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionIcon, { backgroundColor: isDark ? colors.gray[200] : colors.gray[100] }]}>
                <Clock size={16} color={colors.gray[600]} />
              </View>
              <Text style={styles.sectionTitle}>
                {pd.timeline || t.packages.details?.timeline || 'Timeline'}
              </Text>
            </View>

            {pkg.timeline.map((event, idx) => {
              const eventPalette =
                statusColors[event.status as keyof typeof statusColors] ?? defaultStatusColor;
              const isLast = idx === pkg.timeline.length - 1;

              return (
                <View key={`${event.status}-${event.date}-${idx}`} style={styles.timelineItem}>
                  <View style={styles.timelineTrack}>
                    <View
                      style={[
                        styles.timelineDotOuter,
                        {
                          borderColor: event.pending ? colors.gray[300] : eventPalette.dot,
                          backgroundColor: card.backgroundColor,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.timelineDotInner,
                          { backgroundColor: event.pending ? colors.gray[300] : eventPalette.dot },
                        ]}
                      />
                    </View>
                    {!isLast && (
                      <View
                        style={[styles.timelineLine, { backgroundColor: colors.gray[200] }]}
                      />
                    )}
                  </View>

                  <View style={styles.timelineContent}>
                    <Text
                      style={[
                        styles.timelineStatus,
                        event.pending && { color: colors.gray[400] },
                      ]}
                    >
                      {translateKey(event.status, t)}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <MapPin size={11} color={colors.gray[400]} />
                      <Text style={styles.timelineLocation}>
                        {translateKey(event.location, t)}
                      </Text>
                    </View>
                    {event.description && (
                      <Text style={styles.timelineDescription}>
                        {translateKey(event.description, t)}
                      </Text>
                    )}
                    <Text style={styles.timelineDate}>{formatDateTime(event.date)}</Text>
                  </View>
                </View>
              );
            })}
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
