import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { useTheme } from '@/lib/themes/ThemeProvider';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  message?: string;
  size?: number;
  color?: string;
}

export function LoadingSpinner({
  fullScreen = false,
  message,
  size = 32,
  color,
}: LoadingSpinnerProps) {
  const { colors, fonts, spacing } = useTheme();
  const rotation = useSharedValue(0);
  const resolvedColor = color ?? colors.primary[500];

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 800, easing: Easing.linear }),
      -1, // infinite
      false
    );
    return () => {
      cancelAnimation(rotation);
    };
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${rotation.value}deg` }],
  }));

  const spinner = (
    <View style={styles.spinnerGroup}>
      <Animated.View style={animatedStyle}>
        {/* Outer ring */}
        <View
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: size >= 32 ? 3 : 2,
              borderColor: colors.primary[100],
              borderTopColor: resolvedColor,
            },
          ]}
        />
      </Animated.View>
      {message && (
        <Text
          style={[
            styles.message,
            {
              marginTop: spacing.lg,
              fontFamily: fonts.medium,
              color: colors.gray[500],
            },
          ]}
        >
          {message}
        </Text>
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, { backgroundColor: colors.background }]}>
        {spinner}
      </View>
    );
  }

  return spinner;
}

const styles = StyleSheet.create({
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  spinnerGroup: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    borderStyle: 'solid',
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
});
