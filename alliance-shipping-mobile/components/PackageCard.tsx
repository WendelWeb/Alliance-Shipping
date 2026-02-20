import React, { useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
  UIManager,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import {
  Package,
  Shirt,
  Smartphone,
  FileText,
  ShoppingBag,
  HelpCircle,
  ChevronRight,
  MapPin,
  Calendar,
  Weight,
  AlertTriangle,
  DollarSign,
  Layers,
} from 'lucide-react-native';
import { useTheme } from '@/lib/themes/ThemeProvider';
import { useTranslation } from '@/lib/i18n/useTranslation';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface TimelineEvent {
  status: string;
  date: string;
  location: string;
}

interface PackageItem {
  id: string;
  trackingNumber: string;
  description: string;
  weight: number;
  status: string;
  category: string;
  createdAt: string;
  customsFees?: number;
  specialItemId?: number;
  specialItemName?: string;
  specialItemBrand?: string;
  specialItemFixedFee?: string;
  quantity?: number;
  chargeByWeight?: boolean;
  serviceFee?: string;
  weightCost?: string;
  totalCost?: string;
  timeline: TimelineEvent[];
}

interface PackageCardProps {
  item: PackageItem;
  index: number;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

const categoryLabels: Record<string, string> = {
  general: 'General',
  clothing: 'Vetements',
  electronics: 'Electronique',
  food: 'Nourriture',
  documents: 'Documents',
  other: 'Autre',
};

function getStatusLabel(status: string, statusTranslations: Record<string, string>): string {
  const key = status as keyof typeof statusTranslations;
  if (statusTranslations[key]) {
    return statusTranslations[key];
  }
  return status
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Helper to translate nested keys like "packages.timeline.online" or simple keys like "delivered"
function translateKey(key: string, translations: any): string {
  if (!key) return key;

  // If it doesn't contain a dot, try to find it in packages.timeline first
  if (!key.includes('.')) {
    // Try packages.timeline[key]
    const timelineValue = translations?.packages?.timeline?.[key];
    if (timelineValue && typeof timelineValue === 'string') {
      return timelineValue;
    }

    // Try packages.status[key]
    const statusValue = translations?.packages?.status?.[key];
    if (statusValue && typeof statusValue === 'string') {
      return statusValue;
    }

    // Return original key with capitalization
    return key.charAt(0).toUpperCase() + key.slice(1);
  }

  // Handle dotted keys like "packages.timeline.delivered"
  const parts = key.split('.');
  let value = translations;

  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
    } else {
      // Key not found, return original
      return key;
    }
  }

  return typeof value === 'string' ? value : key;
}

export function PackageCard({ item, index }: PackageCardProps) {
  const { t } = useTranslation();
  const { colors, fonts, spacing, borderRadius, shadows, card, isDark } = useTheme();
  const router = useRouter();

  // Parse numeric values (API returns decimals as strings)
  const customsFees = parseFloat(String(item.customsFees ?? '0')) || 0;
  const serviceFee = parseFloat(String(item.serviceFee ?? '0')) || 0;
  const weightCost = parseFloat(String(item.weightCost ?? '0')) || 0;
  const specialItemFixedFee = parseFloat(String(item.specialItemFixedFee ?? '0')) || 0;
  const totalCost = serviceFee + weightCost + customsFees + specialItemFixedFee;

  const statusColors = useMemo(
    (): Record<string, { bg: string; text: string; dot: string }> => ({
      pending: { bg: colors.yellow[100]!, text: colors.yellow[600], dot: colors.yellow[500] },
      requested: { bg: colors.yellow[100]!, text: colors.yellow[600], dot: colors.yellow[500] },
      received: { bg: colors.primary[100], text: colors.primary[600], dot: colors.primary[500] },
      'in-transit': { bg: colors.purple[100]!, text: colors.purple[600], dot: colors.purple[500] },
      available: { bg: colors.green[100]!, text: colors.green[600], dot: colors.green[500] },
      delivered: { bg: colors.green[100]!, text: colors.emerald[600], dot: colors.emerald[500] },
      rejected: { bg: colors.red[100]!, text: colors.red[600], dot: colors.red[500] },
    }),
    [colors]
  );

  const defaultStatusColor = useMemo(
    () => ({
      bg: colors.gray[100],
      text: colors.gray[600],
      dot: colors.gray[400],
    }),
    [colors]
  );

  const categoryIcons = useMemo(
    (): Record<string, React.ReactNode> => ({
      clothing: <Shirt size={14} color={colors.gray[500]} />,
      electronics: <Smartphone size={14} color={colors.gray[500]} />,
      documents: <FileText size={14} color={colors.gray[500]} />,
      food: <ShoppingBag size={14} color={colors.gray[500]} />,
      general: <Package size={14} color={colors.gray[500]} />,
      other: <HelpCircle size={14} color={colors.gray[500]} />,
    }),
    [colors]
  );

  const palette = statusColors[item.status] ?? defaultStatusColor;
  const categoryIcon = categoryIcons[item.category] ?? categoryIcons.general;

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/package/[id]',
      params: { id: String(item.id), data: JSON.stringify(item) },
    });
  }, [router, item]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          borderRadius: borderRadius.xl,
          padding: spacing.lg,
          marginBottom: spacing.md,
        },
        topRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.sm,
        },
        trackingNumber: {
          fontFamily: fonts.bold,
          fontSize: 15,
          letterSpacing: 0.3,
          flex: 1,
          marginRight: spacing.sm,
        },
        statusBadge: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: borderRadius.full,
        },
        statusDot: {
          width: 6,
          height: 6,
          borderRadius: 3,
          marginRight: 6,
        },
        statusText: {
          fontFamily: fonts.medium,
          fontSize: 12,
          lineHeight: 16,
        },
        description: {
          fontFamily: fonts.regular,
          fontSize: 14,
          lineHeight: 20,
          marginBottom: spacing.md,
        },
        bottomRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        metaRow: {
          flexDirection: 'row',
          alignItems: 'center',
          flexWrap: 'wrap',
          flex: 1,
          gap: spacing.sm,
        },
        metaPill: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: borderRadius.full,
          gap: 4,
        },
        metaPillText: {
          fontFamily: fonts.medium,
          fontSize: 11,
        },
        chevronContainer: {
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: colors.gray[100],
          alignItems: 'center',
          justifyContent: 'center',
        },
      }),
    [fonts, spacing, borderRadius]
  );

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(400).springify()}>
      <Pressable
        onPress={handlePress}
        style={[styles.card, shadows.md, { backgroundColor: card.backgroundColor }]}
      >
        {/* Top row: tracking number + status badge */}
        <View style={styles.topRow}>
          <Text
            style={[styles.trackingNumber, { color: colors.gray[900] }]}
            numberOfLines={1}
          >
            {item.trackingNumber}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: palette.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: palette.dot }]} />
            <Text style={[styles.statusText, { color: palette.text }]}>
              {getStatusLabel(item.status, t.packages.status as unknown as Record<string, string>)}
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text
          style={[styles.description, { color: colors.gray[600] }]}
          numberOfLines={2}
        >
          {item.description}
        </Text>

        {/* Special Item Badge */}
        {item.specialItemId && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              alignSelf: 'flex-start',
              backgroundColor: isDark ? colors.gray[200] : colors.purple[100],
              borderRadius: borderRadius.md,
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs,
              marginBottom: spacing.sm,
              gap: spacing.xs,
            }}
          >
            <Smartphone size={12} color={isDark ? colors.purple[500] : colors.purple[600]} />
            <Text style={{ fontFamily: fonts.semiBold, fontSize: 11, color: isDark ? colors.purple[500] : colors.purple[600] }}>
              {item.specialItemBrand ? `${item.specialItemBrand} ` : ''}{item.specialItemName || (t as any).packages?.specialItem || 'Article Special'}
            </Text>
          </View>
        )}

        {/* Info pills row: weight, category, taxes douane, date */}
        <View style={styles.bottomRow}>
          <View style={styles.metaRow}>
            {/* Weight pill */}
            <View style={[styles.metaPill, { backgroundColor: colors.gray[100] }]}>
              <Weight size={12} color={colors.gray[500]} />
              <Text style={[styles.metaPillText, { color: colors.gray[600] }]}>
                {item.weight} lbs
              </Text>
            </View>

            {/* Quantity pill - only shown when quantity > 1 */}
            {(item.quantity ?? 1) > 1 && (
              <View style={[styles.metaPill, { backgroundColor: colors.gray[100] }]}>
                <Layers size={12} color={colors.gray[500]} />
                <Text style={[styles.metaPillText, { color: colors.gray[600] }]}>
                  {(t.packages as any).quantity || 'Qty'}: {item.quantity}
                </Text>
              </View>
            )}

            {/* Category pill */}
            <View style={[styles.metaPill, { backgroundColor: colors.gray[100] }]}>
              {categoryIcon}
              <Text style={[styles.metaPillText, { color: colors.gray[600] }]}>
                {item.category ? (categoryLabels[item.category] || item.category.charAt(0).toUpperCase() + item.category.slice(1)) : 'General'}
              </Text>
            </View>

            {/* Taxes douane pill - always visible */}
            <View style={[styles.metaPill, {
              backgroundColor: (customsFees > 0)
                ? (isDark ? colors.gray[200] : colors.red[50])
                : colors.gray[100],
            }]}>
              <AlertTriangle size={12} color={(customsFees > 0) ? colors.red[500] : colors.gray[500]} />
              <Text style={[styles.metaPillText, {
                color: (customsFees > 0) ? colors.red[500] : colors.gray[600],
                fontFamily: (customsFees > 0) ? fonts.bold : fonts.medium,
              }]}>
                {(customsFees > 0) ? `+$${customsFees.toFixed(2)}` : '$0'} {t.packages.customsFees}
              </Text>
            </View>

            {/* Date pill */}
            <View style={[styles.metaPill, { backgroundColor: colors.gray[100] }]}>
              <Calendar size={12} color={colors.gray[500]} />
              <Text style={[styles.metaPillText, { color: colors.gray[600] }]}>
                {formatDate(item.createdAt)}
              </Text>
            </View>
          </View>

          <View style={styles.chevronContainer}>
            <ChevronRight size={16} color={colors.gray[500]} />
          </View>
        </View>

        {/* Total cost - compact display */}
        {totalCost > 0 && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: spacing.sm,
            paddingTop: spacing.sm,
            borderTopWidth: 1,
            borderTopColor: colors.gray[100],
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <DollarSign size={14} color={colors.primary[600]} />
              <Text style={{ fontFamily: fonts.semiBold, fontSize: 12, color: colors.gray[600] }}>
                {(t.packages as any).feeBreakdown?.total || 'TOTAL'}
              </Text>
            </View>
            <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: colors.primary[600] }}>
              ${totalCost.toFixed(2)}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}
