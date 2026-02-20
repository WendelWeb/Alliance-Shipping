import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { WifiOff } from 'lucide-react-native';
import { useTheme } from '@/lib/themes/ThemeProvider';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface OfflineBannerProps {
  visible: boolean;
  lastSync?: string | null;
}

export function OfflineBanner({ visible, lastSync }: OfflineBannerProps) {
  const { colors, fonts } = useTheme();
  const { t } = useTranslation();

  if (!visible) return null;

  const syncText = lastSync
    ? new Date(lastSync).toLocaleTimeString()
    : '';

  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      exiting={FadeOutUp.duration(200)}
      style={[styles.container, { backgroundColor: colors.yellow[600] }]}
    >
      <WifiOff size={14} color="#fff" />
      <Text style={[styles.text, { color: '#fff', fontFamily: fonts.semiBold }]}>
        {(t.common as any).offline || 'Mode hors ligne'}
      </Text>
      {syncText ? (
        <Text style={[styles.syncText, { color: 'rgba(255,255,255,0.8)', fontFamily: fonts.regular }]}>
          ({syncText})
        </Text>
      ) : null}
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
