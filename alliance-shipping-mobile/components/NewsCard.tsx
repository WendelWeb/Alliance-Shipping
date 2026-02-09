import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react-native';
import { useTheme } from '@/lib/themes/ThemeProvider';
import { localeMap } from '@/lib/i18n/config';
import type { Locale } from '@/lib/i18n/config';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: string;
  type?: string;
  createdAt: string;
  category?: string;
}

interface NewsCardProps {
  item: Announcement;
  index: number;
  locale: string;
  readMoreLabel: string;
  priorityLabels: {
    urgent: string;
    important: string;
    info: string;
  };
  typeLabels?: {
    news: string;
    alert: string;
    promo: string;
    maintenance: string;
  };
}

// Type-based visual config: emoji, accent color key, tint bg
const TYPE_CONFIG: Record<string, { emoji: string; priorityEmoji: string }> = {
  alert: { emoji: '🚨', priorityEmoji: '🔴' },
  maintenance: { emoji: '🔧', priorityEmoji: '⚠️' },
  promo: { emoji: '🎉', priorityEmoji: '🎁' },
  news: { emoji: '📰', priorityEmoji: 'ℹ️' },
};

function formatDate(dateString: string, locale: string): string {
  try {
    const date = new Date(dateString);
    const intlLocale = localeMap[locale as Locale] || 'en-US';
    return new Intl.DateTimeFormat(intlLocale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

function truncateContent(content: string, maxLength: number): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength).trimEnd() + '…';
}

export function NewsCard({
  item,
  index,
  locale,
  readMoreLabel,
  priorityLabels,
  typeLabels,
}: NewsCardProps) {
  const { colors, fonts, spacing, borderRadius, shadows } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const typeKey = item.type || 'news';
  const config = TYPE_CONFIG[typeKey] || TYPE_CONFIG.news;

  // Type-based colors
  const typeColors = useMemo(() => ({
    alert: {
      accent: colors.red[500],
      bg: 'rgba(239,68,68,0.06)',
      badgeBg: 'rgba(239,68,68,0.1)',
      badgeText: colors.red[600],
    },
    maintenance: {
      accent: colors.yellow[500],
      bg: 'rgba(234,179,8,0.06)',
      badgeBg: 'rgba(234,179,8,0.12)',
      badgeText: colors.yellow[600],
    },
    promo: {
      accent: colors.purple[500],
      bg: 'rgba(168,85,247,0.06)',
      badgeBg: 'rgba(168,85,247,0.1)',
      badgeText: colors.purple[600],
    },
    news: {
      accent: colors.primary[500],
      bg: `${colors.primary[50]}`,
      badgeBg: `${colors.primary[50]}`,
      badgeText: colors.primary[600],
    },
  }), [colors]);

  const tc = typeColors[typeKey as keyof typeof typeColors] || typeColors.news;

  // Priority config
  const priorityConfig = useMemo(() => ({
    urgent: { bg: colors.red[500], text: colors.white, emoji: '🔴' },
    important: { bg: colors.orange[500], text: colors.white, emoji: '⚠️' },
    info: { bg: colors.primary[500], text: colors.white, emoji: 'ℹ️' },
  }), [colors]);

  const pc = priorityConfig[item.priority as keyof typeof priorityConfig] || priorityConfig.info;
  const priorityLabel = priorityLabels[item.priority as keyof typeof priorityLabels] || item.priority;
  const typeLabel = typeLabels?.[typeKey as keyof typeof typeLabels] || typeKey;

  const isLongContent = item.content.length > 120;
  const displayContent = expanded ? item.content : truncateContent(item.content, 120);

  const handleToggleExpand = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(
      LayoutAnimation.create(250, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity)
    );
    setExpanded((prev) => !prev);
  }, []);

  const formattedDate = formatDate(item.createdAt, locale);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        cardWrapper: {
          marginHorizontal: spacing.lg,
          marginBottom: spacing.md,
        },
        card: {
          borderRadius: borderRadius.xl,
          overflow: 'hidden',
        },
        accentBar: {
          height: 4,
        },
        cardContent: {
          padding: spacing.lg,
        },
        topRow: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          marginBottom: spacing.sm,
        },
        emojiCircle: {
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: spacing.sm,
        },
        emojiText: {
          fontSize: 20,
        },
        titleArea: {
          flex: 1,
          marginRight: spacing.xs,
        },
        title: {
          fontFamily: fonts.headingSemiBold,
          fontSize: 16,
          lineHeight: 22,
          letterSpacing: 0.1,
        },
        badgeRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          marginTop: 6,
        },
        typeBadge: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: borderRadius.full,
          gap: 4,
        },
        typeBadgeText: {
          fontFamily: fonts.semiBold,
          fontSize: 11,
          letterSpacing: 0.2,
        },
        priorityBadge: {
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: borderRadius.full,
          alignSelf: 'flex-start',
        },
        priorityText: {
          fontFamily: fonts.semiBold,
          fontSize: 11,
          letterSpacing: 0.3,
          textTransform: 'uppercase',
        },
        content: {
          fontFamily: fonts.regular,
          fontSize: 14,
          lineHeight: 22,
          letterSpacing: 0.1,
          marginTop: spacing.xs,
        },
        readMoreButton: {
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: spacing.xs,
          paddingVertical: spacing.xs,
        },
        readMoreText: {
          fontFamily: fonts.semiBold,
          fontSize: 13,
          letterSpacing: 0.1,
        },
        readMoreIcon: {
          marginLeft: 4,
        },
        footer: {
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: spacing.md,
          paddingTop: spacing.sm,
          borderTopWidth: StyleSheet.hairlineWidth,
          gap: 6,
        },
        dateText: {
          fontFamily: fonts.medium,
          fontSize: 12,
          letterSpacing: 0.1,
        },
      }),
    [fonts, spacing, borderRadius]
  );

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).duration(400).springify().damping(18)}
      style={styles.cardWrapper}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={isLongContent ? handleToggleExpand : undefined}
        style={[styles.card, shadows.md, { backgroundColor: colors.surfaceSolid }]}
      >
        {/* Colored accent bar at top */}
        <View style={[styles.accentBar, { backgroundColor: tc.accent }]} />

        <View style={styles.cardContent}>
          {/* Top row: emoji + title + priority badge */}
          <View style={styles.topRow}>
            <View style={[styles.emojiCircle, { backgroundColor: tc.bg }]}>
              <Text style={styles.emojiText}>{config.emoji}</Text>
            </View>

            <View style={styles.titleArea}>
              <Text
                style={[styles.title, { color: colors.gray[900] }]}
                numberOfLines={expanded ? undefined : 2}
              >
                {item.title}
              </Text>

              {/* Type + Priority badges row */}
              <View style={styles.badgeRow}>
                <View style={[styles.typeBadge, { backgroundColor: tc.badgeBg }]}>
                  <Text style={{ fontSize: 10 }}>{config.emoji}</Text>
                  <Text style={[styles.typeBadgeText, { color: tc.badgeText }]}>
                    {typeLabel}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.priorityBadge, { backgroundColor: pc.bg }]}>
              <Text style={[styles.priorityText, { color: pc.text }]}>
                {pc.emoji} {priorityLabel}
              </Text>
            </View>
          </View>

          {/* Content */}
          <Text style={[styles.content, { color: colors.gray[600] }]}>
            {displayContent}
          </Text>

          {/* Read more / collapse */}
          {isLongContent && (
            <TouchableOpacity
              onPress={handleToggleExpand}
              style={styles.readMoreButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.readMoreText, { color: tc.accent }]}>
                {expanded ? '' : readMoreLabel}
              </Text>
              {expanded ? (
                <ChevronUp size={14} color={tc.accent} style={styles.readMoreIcon} />
              ) : (
                <ChevronDown size={14} color={tc.accent} style={styles.readMoreIcon} />
              )}
            </TouchableOpacity>
          )}

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: colors.gray[100] }]}>
            <Clock size={13} color={colors.gray[400]} />
            <Text style={[styles.dateText, { color: colors.gray[400] }]}>
              {formattedDate}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
