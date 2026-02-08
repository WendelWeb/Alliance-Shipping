import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { Fingerprint, ScanFace, Lock } from 'lucide-react-native';
import { useTheme } from '@/lib/themes/ThemeProvider';
import { authenticate, getBiometricType, getBiometricLabel, type BiometricType } from '@/lib/biometrics';

interface BiometricLockProps {
  onSuccess: () => void;
}

export function BiometricLock({ onSuccess }: BiometricLockProps) {
  const { colors, fonts } = useTheme();
  const [biometricType, setBiometricType] = useState<BiometricType>('none');
  const [error, setError] = useState('');
  const scale = useSharedValue(1);

  useEffect(() => {
    getBiometricType().then(setBiometricType);
    handleAuthenticate();
  }, []);

  const handleAuthenticate = async () => {
    setError('');
    scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    }, 150);

    const success = await authenticate('Unlock Alliance Shipping');
    if (success) {
      onSuccess();
    } else {
      setError('Authentication failed. Tap to try again.');
    }
  };

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const BiometricIcon = biometricType === 'facial' ? ScanFace : biometricType === 'fingerprint' ? Fingerprint : Lock;
  const label = getBiometricLabel(biometricType);

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        <Animated.View style={[styles.iconWrapper, iconStyle]}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary[100] }]}>
            <BiometricIcon size={48} color={colors.primary[600]} />
          </View>
        </Animated.View>

        <Text style={[styles.title, { color: colors.gray[900], fontFamily: fonts.headingBold }]}>
          Alliance Shipping
        </Text>
        <Text style={[styles.subtitle, { color: colors.gray[500], fontFamily: fonts.regular }]}>
          {`Use ${label} to unlock`}
        </Text>

        {error ? (
          <Text style={[styles.error, { color: colors.primary[600], fontFamily: fonts.medium }]}>
            {error}
          </Text>
        ) : null}

        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary[600] }]}
          onPress={handleAuthenticate}
          activeOpacity={0.8}
        >
          <BiometricIcon size={20} color={colors.white} />
          <Text style={[styles.retryText, { color: colors.white, fontFamily: fonts.semiBold }]}>
            {`Unlock with ${label}`}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconWrapper: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  error: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryText: {
    fontSize: 16,
  },
});
