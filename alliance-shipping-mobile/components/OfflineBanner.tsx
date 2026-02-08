import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { WifiOff } from 'lucide-react-native';
import { useTheme } from '@/lib/themes/ThemeProvider';

interface OfflineBannerProps {
  visible: boolean;
  lastSync?: string | null;
}

export function OfflineBanner({ visible, lastSync }: OfflineBannerProps) {
  const { colors, fonts } = useTheme();

  if (!visible) return null;

  const syncText = lastSync
    ? `Last synced: ${new Date(lastSync).toLocaleTimeString()}`
    : 'No data synced yet';

  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      exiting={FadeOutUp.duration(200)}
      style={[styles.container, { backgroundColor: colors.primary[600] }]}
    >
      <WifiOff size={14} color={colors.white} />
      <Text style={[styles.text, { color: colors.white, fontFamily: fonts.medium }]}>
        Offline Mode
      </Text>
      <Text style={[styles.syncText, { color: 'rgba(255,255,255,0.7)', fontFamily: fonts.regular }]}>
        {syncText}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  text: {
    fontSize: 12,
  },
  syncText: {
    fontSize: 11,
  },
});
