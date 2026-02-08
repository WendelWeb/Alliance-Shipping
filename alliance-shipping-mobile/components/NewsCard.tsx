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
import { ChevronDown, ChevronUp } from 'lucide-react-native';
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
  id: string;
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
}

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
  if (content.length <= maxLength) {
    return content;
  }
  return content.substring(0, maxLength).trimEnd() + '...';
}

export function NewsCard({
  item,
  index,
  locale,
  readMoreLabel,
  priorityLabels,
}: NewsCardProps) {
  const { colors, fonts, spacing, borderRadius, shadows } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const priorityColors: Record<string, { bg: string; text: string }> = useMemo(
    () => ({
      urgent: { bg: colors.red[500], text: colors.white },
      important: { bg: colors.orange[500], text: colors.white },
      info: { bg: colors.primary[500], text: colors.white },
    }),
    [colors]
  );

  const defaultPriorityColor = useMemo(
    () => ({ bg: colors.gray[400], text: colors.white }),
    [colors]
  );

  const priorityColor =
    priorityColors[item.priority] || defaultPriorityColor;

  const priorityLabel =
    priorityLabels[item.priority as keyof typeof priorityLabels] ||
    item.priority;

  const isLongContent = item.content.length > 100;
  const displayContent = expanded
    ? item.content
    : truncateContent(item.content, 100);

  const handleToggleExpand = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        250,
        LayoutAnimation.Types.easeInEaseOut,
        LayoutAnimation.Properties.opacity
      )
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
          padding: spacing.lg,
          borderWidth: 1,
        },
        headerRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: spacing.sm,
        },
        titleContainer: {
          flex: 1,
          marginRight: spacing.sm,
        },
        title: {
          fontFamily: fonts.headingSemiBold,
          fontSize: 16,
          lineHeight: 22,
          letterSpacing: 0.1,
        },
        priorityBadge: {
          paddingHorizontal: spacing.sm + 2,
          paddingVertical: spacing.xs,
          borderRadius: borderRadius.full,
          alignSelf: 'flex-start',
        },
        priorityText: {
          fontFamily: fonts.semiBold,
          fontSize: 11,
          letterSpacing: 0.3,
          textTransform: 'uppercase',
        },
        categoryContainer: {
          alignSelf: 'flex-start',
          paddingHorizontal: spacing.sm,
          paddingVertical: 2,
          borderRadius: borderRadius.sm,
          marginBottom: spacing.sm,
        },
        categoryText: {
          fontFamily: fonts.medium,
          fontSize: 12,
        },
        content: {
          fontFamily: fonts.regular,
          fontSize: 14,
          lineHeight: 21,
          letterSpacing: 0.1,
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
          marginLeft: 2,
        },
        footer: {
          marginTop: spacing.md,
          paddingTop: spacing.sm,
          borderTopWidth: StyleSheet.hairlineWidth,
        },
        dateText: {
          fontFamily: fonts.regular,
          fontSize: 12,
          letterSpacing: 0.1,
        },
      }),
    [fonts, spacing, borderRadius]
  );

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80)
        .duration(400)
        .springify()
        .damping(18)}
      style={styles.cardWrapper}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={isLongContent ? handleToggleExpand : undefined}
        style={[
          styles.card,
          shadows.md,
          { backgroundColor: colors.white, borderColor: colors.gray[100] },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <Text
              style={[styles.title, { color: colors.gray[900] }]}
              numberOfLines={expanded ? undefined : 2}
            >
              {item.title}
            </Text>
          </View>
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: priorityColor.bg },
            ]}
          >
            <Text style={[styles.priorityText, { color: priorityColor.text }]}>
              {priorityLabel}
            </Text>
          </View>
        </View>

        {item.category && (
          <View
            style={[
              styles.categoryContainer,
              { backgroundColor: colors.primary[50] },
            ]}
          >
            <Text style={[styles.categoryText, { color: colors.primary[600] }]}>
              {item.category}
            </Text>
          </View>
        )}

        <Text style={[styles.content, { color: colors.gray[600] }]}>
          {displayContent}
        </Text>

        {isLongContent && !expanded && (
          <TouchableOpacity
            onPress={handleToggleExpand}
            style={styles.readMoreButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.readMoreText, { color: colors.primary[600] }]}>
              {readMoreLabel}
            </Text>
            <ChevronDown
              size={14}
              color={colors.primary[600]}
              style={styles.readMoreIcon}
            />
          </TouchableOpacity>
        )}

        {isLongContent && expanded && (
          <TouchableOpacity
            onPress={handleToggleExpand}
            style={styles.readMoreButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ChevronUp
              size={14}
              color={colors.primary[600]}
              style={styles.readMoreIcon}
            />
          </TouchableOpacity>
        )}

        <View
          style={[styles.footer, { borderTopColor: colors.gray[200] }]}
        >
          <Text style={[styles.dateText, { color: colors.gray[400] }]}>
            {formattedDate}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
