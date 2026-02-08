import React, { useCallback } from 'react';
import {
  StyleSheet,
  Text,
  Pressable,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/lib/themes/ThemeProvider';

type ButtonVariant = 'primary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const sizeConfig: Record<ButtonSize, { height: number; paddingHorizontal: number; fontSize: number; iconGap: number }> = {
  sm: { height: 36, paddingHorizontal: 14, fontSize: 13, iconGap: 6 },
  md: { height: 46, paddingHorizontal: 20, fontSize: 15, iconGap: 8 },
  lg: { height: 54, paddingHorizontal: 28, fontSize: 17, iconGap: 10 },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  style,
}: ButtonProps) {
  const { colors, fonts, borderRadius, shadows, spring } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, spring.snappy);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, spring.gentle);
  }, [scale]);

  const handlePress = useCallback(() => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  }, [disabled, loading, onPress]);

  const isDisabled = disabled || loading;
  const cfg = sizeConfig[size];

  const containerStyle: ViewStyle[] = [
    styles.base,
    {
      height: cfg.height,
      paddingHorizontal: cfg.paddingHorizontal,
      borderRadius: borderRadius.md,
    },
    fullWidth && styles.fullWidth,
    // Variant styles
    variant === 'primary' && {
      backgroundColor: colors.primary[600],
      ...shadows.sm,
    },
    variant === 'outline' && {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.primary[500],
    },
    variant === 'ghost' && {
      backgroundColor: 'transparent',
    },
    // Disabled
    isDisabled && styles.disabled,
  ].filter(Boolean) as ViewStyle[];

  const textStyle: TextStyle[] = [
    {
      fontFamily: fonts.semiBold,
      letterSpacing: 0.2,
      fontSize: cfg.fontSize,
    },
    variant === 'primary' && { color: colors.white },
    variant === 'outline' && { color: colors.primary[600] },
    variant === 'ghost' && { color: colors.gray[600] },
    isDisabled && styles.disabledText,
  ].filter(Boolean) as TextStyle[];

  const spinnerColor =
    variant === 'primary' ? colors.white : colors.primary[500];

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={isDisabled}
      style={[animatedStyle, style]}
    >
      <View style={containerStyle}>
        {loading ? (
          <ActivityIndicator size="small" color={spinnerColor} />
        ) : (
          <>
            {icon && <View style={{ marginRight: cfg.iconGap }}>{icon}</View>}
            <Text style={textStyle} numberOfLines={1}>
              {title}
            </Text>
          </>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.45,
  },
  disabledText: {
    opacity: 0.7,
  },
});
