import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
  KeyboardTypeOptions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '@/lib/themes/ThemeProvider';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  helper?: string;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  editable?: boolean;
  leftIcon?: React.ReactNode;
  style?: ViewStyle;
}

const AnimatedView = Animated.View;

const DURATION = 200;

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helper,
  multiline = false,
  keyboardType,
  secureTextEntry = false,
  editable = true,
  leftIcon,
  style,
}: InputProps) {
  const { colors, fonts, spacing, borderRadius } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const focusProgress = useSharedValue(0);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    focusProgress.value = withTiming(1, { duration: DURATION });
  }, [focusProgress]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    focusProgress.value = withTiming(0, { duration: DURATION });
  }, [focusProgress]);

  const hasError = !!error;

  // Animate border color between gray, primary (focus), and red (error)
  const borderAnimatedStyle = useAnimatedStyle(() => {
    if (hasError) {
      return { borderColor: colors.red[500] };
    }
    const borderColor = interpolateColor(
      focusProgress.value,
      [0, 1],
      [colors.gray[200], colors.primary[500]]
    );
    return { borderColor };
  });

  const displayMessage = error || helper;
  const messageColor = hasError ? colors.red[500] : colors.gray[400];

  return (
    <View style={[{ marginBottom: spacing.lg }, style]}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              fontFamily: fonts.medium,
              color: colors.gray[700],
              marginBottom: spacing.xs + 2,
            },
          ]}
        >
          {label}
        </Text>
      )}

      <AnimatedView
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.white,
            borderColor: colors.gray[200],
            borderRadius: borderRadius.md,
          },
          multiline && styles.multilineContainer,
          !editable && {
            backgroundColor: colors.gray[50],
            borderColor: colors.gray[200],
          },
          borderAnimatedStyle,
        ]}
      >
        {leftIcon && <View style={[styles.iconContainer, { paddingLeft: spacing.md }]}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            {
              fontFamily: fonts.regular,
              color: colors.gray[900],
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
            },
            multiline && [styles.multilineInput, { paddingTop: spacing.md }],
            leftIcon != null && { paddingLeft: spacing.sm },
            !editable && { color: colors.gray[400] },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.gray[400]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          multiline={multiline}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          editable={editable}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      </AnimatedView>

      {displayMessage && (
        <Text
          style={[
            styles.message,
            {
              fontFamily: fonts.regular,
              color: messageColor,
              marginTop: spacing.xs,
            },
          ]}
        >
          {displayMessage}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    letterSpacing: 0.1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    minHeight: 48,
  },
  multilineContainer: {
    minHeight: 100,
    alignItems: 'flex-start',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  multilineInput: {
    minHeight: 90,
  },
  message: {
    fontSize: 12,
    paddingLeft: 2,
  },
});
