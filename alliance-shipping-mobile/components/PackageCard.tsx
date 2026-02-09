import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  Package,
  Shirt,
  Smartphone,
  FileText,
  ShoppingBag,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Weight,
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
  const { colors, fonts, spacing, borderRadius, shadows, card } = useTheme();
  const [expanded, setExpanded] = useState(false);

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

  const toggleExpanded = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  }, []);

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
        // Timeline styles
        timelineContainer: {
          marginTop: spacing.md,
        },
        timelineDivider: {
          height: 1,
          marginBottom: spacing.md,
        },
        timelineTitle: {
          fontFamily: fonts.semiBold,
          fontSize: 13,
          marginBottom: spacing.md,
        },
        timelineItem: {
          flexDirection: 'row',
          minHeight: 48,
        },
        timelineTrack: {
          width: 24,
          alignItems: 'center',
        },
        timelineDotOuter: {
          width: 16,
          height: 16,
          borderRadius: 8,
          borderWidth: 2,
          alignItems: 'center',
          justifyContent: 'center',
        },
        timelineDotInner: {
          width: 6,
          height: 6,
          borderRadius: 3,
        },
        timelineLine: {
          width: 2,
          flex: 1,
          marginVertical: 2,
        },
        timelineContent: {
          flex: 1,
          paddingLeft: spacing.sm,
          paddingBottom: spacing.lg,
        },
        timelineEventStatus: {
          fontFamily: fonts.semiBold,
          fontSize: 13,
          marginBottom: 2,
        },
        timelineEventMeta: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        },
        timelineEventLocation: {
          fontFamily: fonts.regular,
          fontSize: 12,
        },
        timelineEventDate: {
          fontFamily: fonts.regular,
          fontSize: 12,
          marginLeft: spacing.sm,
        },
      }),
    [fonts, spacing, borderRadius]
  );

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(400).springify()}>
      <Pressable
        onPress={toggleExpanded}
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

        {/* Bottom row: weight, category, date, expand chevron */}
        <View style={styles.bottomRow}>
          <View style={styles.metaRow}>
            {/* Weight pill */}
            <View style={[styles.metaPill, { backgroundColor: colors.gray[100] }]}>
              <Weight size={12} color={colors.gray[500]} />
              <Text style={[styles.metaPillText, { color: colors.gray[600] }]}>
                {item.weight} lbs
              </Text>
            </View>

            {/* Category pill */}
            <View style={[styles.metaPill, { backgroundColor: colors.gray[100] }]}>
              {categoryIcon}
              <Text style={[styles.metaPillText, { color: colors.gray[600] }]}>
                {item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : 'General'}
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

          {expanded ? (
            <ChevronUp size={18} color={colors.gray[400]} />
          ) : (
            <ChevronDown size={18} color={colors.gray[400]} />
          )}
        </View>

        {/* Expandable timeline */}
        {expanded && item.timeline.length > 0 && (
          <View style={styles.timelineContainer}>
            <View style={[styles.timelineDivider, { backgroundColor: colors.gray[100] }]} />
            <Text style={[styles.timelineTitle, { color: colors.gray[700] }]}>
              {t.packages.details.timeline}
            </Text>
            {item.timeline.map((event, i) => {
              const eventPalette = statusColors[event.status] ?? defaultStatusColor;
              const isLast = i === item.timeline.length - 1;

              return (
                <View key={`${event.status}-${event.date}-${i}`} style={styles.timelineItem}>
                  {/* Vertical line + dot */}
                  <View style={styles.timelineTrack}>
                    <View
                      style={[
                        styles.timelineDotOuter,
                        { borderColor: eventPalette.dot, backgroundColor: card.backgroundColor },
                      ]}
                    >
                      <View
                        style={[
                          styles.timelineDotInner,
                          { backgroundColor: eventPalette.dot },
                        ]}
                      />
                    </View>
                    {!isLast && (
                      <View
                        style={[styles.timelineLine, { backgroundColor: colors.gray[200] }]}
                      />
                    )}
                  </View>

                  {/* Event content */}
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineEventStatus, { color: colors.gray[800] }]}>
                      {translateKey(event.status, t)}
                    </Text>
                    <View style={styles.timelineEventMeta}>
                      <MapPin size={11} color={colors.gray[400]} />
                      <Text style={[styles.timelineEventLocation, { color: colors.gray[500] }]}>
                        {translateKey(event.location, t)}
                      </Text>
                      <Text style={[styles.timelineEventDate, { color: colors.gray[400] }]}>
                        {formatDate(event.date)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}
