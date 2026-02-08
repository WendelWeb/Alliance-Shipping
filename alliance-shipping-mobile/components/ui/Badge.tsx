import React, { useMemo } from 'react';
import { Text, View, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/lib/themes/ThemeProvider';

type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  status: string;
  size?: BadgeSize;
  style?: ViewStyle;
}

const sizeConfig: Record<
  BadgeSize,
  { height: number; paddingHorizontal: number; fontSize: number; dotSize: number; dotMargin: number }
> = {
  sm: { height: 22, paddingHorizontal: 8, fontSize: 11, dotSize: 5, dotMargin: 4 },
  md: { height: 28, paddingHorizontal: 12, fontSize: 13, dotSize: 6, dotMargin: 6 },
};

function formatLabel(status: string): string {
  return status
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function Badge({ status, size = 'md', style }: BadgeProps) {
  const { colors, fonts, borderRadius } = useTheme();

  const statusColors: Record<string, { bg: string; text: string; dot: string }> = useMemo(() => ({
    pending: { bg: colors.yellow[100]!, text: colors.yellow[600], dot: colors.yellow[500] },
    requested: { bg: colors.yellow[100]!, text: colors.yellow[600], dot: colors.yellow[500] },
    received: { bg: colors.primary[100], text: colors.primary[600], dot: colors.primary[500] },
    'in-transit': { bg: colors.purple[100]!, text: colors.purple[600], dot: colors.purple[500] },
    available: { bg: colors.green[100]!, text: colors.green[600], dot: colors.green[500] },
    delivered: { bg: colors.green[100]!, text: colors.emerald[600], dot: colors.emerald[500] },
    rejected: { bg: colors.red[100]!, text: colors.red[600], dot: colors.red[500] },
  }), [colors]);

  const defaultStatusColor = {
    bg: colors.gray[100],
    text: colors.gray[600],
    dot: colors.gray[400],
  };

  const palette = statusColors[status] ?? defaultStatusColor;
  const cfg = sizeConfig[size];

  const containerStyle: ViewStyle = {
    height: cfg.height,
    paddingHorizontal: cfg.paddingHorizontal,
    backgroundColor: palette.bg,
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  };

  const dotStyle: ViewStyle = {
    width: cfg.dotSize,
    height: cfg.dotSize,
    borderRadius: cfg.dotSize / 2,
    backgroundColor: palette.dot,
    marginRight: cfg.dotMargin,
  };

  const textStyle: TextStyle = {
    fontFamily: fonts.medium,
    fontSize: cfg.fontSize,
    color: palette.text,
    lineHeight: cfg.fontSize * 1.2,
  };

  return (
    <View style={[containerStyle, style]}>
      <View style={dotStyle} />
      <Text style={textStyle}>{formatLabel(status)}</Text>
    </View>
  );
}
