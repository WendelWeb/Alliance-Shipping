import React, { useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Phone, Navigation, MapPin, Clock } from 'lucide-react-native';
import { useTheme } from '@/lib/themes/ThemeProvider';

interface LocationItem {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  hours: string;
  isOpen: boolean;
  distance?: number;
}

interface LocationCardProps {
  item: LocationItem;
  index: number;
  callLabel: string;
  directionsLabel: string;
  hoursLabel: string;
  openLabel: string;
  closedLabel: string;
  onDirections?: (item: LocationItem) => void;
}

export function LocationCard({
  item,
  index,
  callLabel,
  directionsLabel,
  hoursLabel,
  openLabel,
  closedLabel,
  onDirections,
}: LocationCardProps) {
  const { colors, fonts, spacing, borderRadius, shadows, card, isDark } = useTheme();

  const handleCall = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const phoneNumber = item.phone.replace(/[^+\d]/g, '');
    Linking.openURL(`tel:${phoneNumber}`);
  }, [item.phone]);

  const handleDirections = useCallback(() => {
    if (onDirections) {
      onDirections(item);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const encodedAddress = encodeURIComponent(
        `${item.name}, ${item.address}, ${item.city}`
      );
      const url =
        Platform.OS === 'ios'
          ? `maps:?q=${encodedAddress}`
          : `geo:0,0?q=${encodedAddress}`;
      Linking.openURL(url).catch(() => {
        Linking.openURL(
          `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
        );
      });
    }
  }, [item, onDirections]);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80)
        .duration(400)
        .springify()
        .damping(18)}
      style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md }}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: card.backgroundColor,
            borderRadius: borderRadius.xl,
            padding: spacing.lg,
            borderColor: card.borderColor,
            borderWidth: card.borderWidth,
          },
          shadows.md,
        ]}
      >
        <View style={[styles.topRow, { marginBottom: spacing.md }]}>
          <View style={[styles.locationInfo, { marginRight: spacing.sm }]}>
            <View style={[styles.nameRow, { marginBottom: spacing.xs }]}>
              <MapPin size={18} color={colors.primary[600]} />
              <Text
                style={[
                  styles.name,
                  {
                    fontFamily: fonts.headingSemiBold,
                    color: colors.gray[900],
                    marginLeft: spacing.sm,
                  },
                ]}
              >
                {item.name}
              </Text>
            </View>
            {item.distance !== undefined && (
              <Text
                style={[
                  styles.distance,
                  {
                    fontFamily: fonts.semiBold,
                    color: colors.primary[600],
                    marginLeft: 26,
                    marginBottom: spacing.xs - 2,
                  },
                ]}
              >
                📍 {item.distance.toFixed(1)} km from you
              </Text>
            )}
            <Text
              style={[
                styles.address,
                {
                  fontFamily: fonts.regular,
                  color: colors.gray[600],
                },
              ]}
            >
              {item.address}
            </Text>
            <Text
              style={[
                styles.city,
                {
                  fontFamily: fonts.regular,
                  color: colors.gray[500],
                },
              ]}
            >
              {item.city}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                paddingHorizontal: spacing.sm + 2,
                paddingVertical: spacing.xs,
                borderRadius: borderRadius.full,
                backgroundColor: item.isOpen
                  ? (isDark ? colors.green[900] : colors.green[50])
                  : (isDark ? colors.red[900] : colors.red[50]),
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  marginRight: spacing.xs,
                  backgroundColor: item.isOpen
                    ? (isDark ? colors.green[400] : colors.green[500])
                    : (isDark ? colors.red[400] : colors.red[500]),
                },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                {
                  fontFamily: fonts.semiBold,
                  color: item.isOpen
                    ? (isDark ? colors.green[300] : colors.green[600])
                    : (isDark ? colors.red[300] : colors.red[600]),
                },
              ]}
            >
              {item.isOpen ? openLabel : closedLabel}
            </Text>
          </View>
        </View>

        <View style={[styles.hoursRow, { marginBottom: spacing.xs }]}>
          <Clock size={14} color={colors.gray[400]} />
          <Text
            style={[
              styles.hoursLabel,
              {
                fontFamily: fonts.medium,
                color: colors.gray[500],
                marginLeft: spacing.sm,
              },
            ]}
          >
            {hoursLabel}:
          </Text>
          <Text
            style={[
              styles.hoursValue,
              {
                fontFamily: fonts.regular,
                color: colors.gray[600],
                marginLeft: spacing.xs,
              },
            ]}
          >
            {item.hours}
          </Text>
        </View>

        <View style={[styles.phoneRow, { marginBottom: spacing.md }]}>
          <Phone size={14} color={colors.gray[400]} />
          <Text
            style={[
              styles.phoneText,
              {
                fontFamily: fonts.regular,
                color: colors.gray[600],
                marginLeft: spacing.sm,
              },
            ]}
          >
            {item.phone}
          </Text>
        </View>

        <View
          style={[
            styles.divider,
            {
              backgroundColor: colors.gray[200],
              marginBottom: spacing.md,
            },
          ]}
        />

        <View style={[styles.actionsRow, { gap: spacing.sm }]}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                paddingVertical: spacing.sm + 2,
                borderRadius: borderRadius.md,
                gap: spacing.sm,
                backgroundColor: isDark ? colors.primary[900] : colors.primary[50],
                borderWidth: 1,
                borderColor: isDark ? colors.primary[800] : colors.primary[100],
              },
            ]}
            onPress={handleCall}
            activeOpacity={0.7}
          >
            <Phone size={16} color={isDark ? colors.primary[400] : colors.primary[600]} />
            <Text
              style={{
                fontFamily: fonts.semiBold,
                fontSize: 14,
                color: isDark ? colors.primary[200] : colors.primary[600],
                letterSpacing: 0.1,
              }}
            >
              {callLabel}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                paddingVertical: spacing.sm + 2,
                borderRadius: borderRadius.md,
                gap: spacing.sm,
                backgroundColor: colors.primary[600],
              },
            ]}
            onPress={handleDirections}
            activeOpacity={0.7}
          >
            <Navigation size={16} color={colors.white} />
            <Text
              style={{
                fontFamily: fonts.semiBold,
                fontSize: 14,
                color: colors.white,
                letterSpacing: 0.1,
              }}
            >
              {directionsLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  locationInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    letterSpacing: 0.1,
    flex: 1,
  },
  distance: {
    fontSize: 13,
    letterSpacing: 0.1,
  },
  address: {
    fontSize: 14,
    marginLeft: 26,
    lineHeight: 20,
  },
  city: {
    fontSize: 14,
    marginLeft: 26,
    lineHeight: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    letterSpacing: 0.2,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 2,
  },
  hoursLabel: {
    fontSize: 13,
  },
  hoursValue: {
    fontSize: 13,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 2,
  },
  phoneText: {
    fontSize: 13,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  actionsRow: {
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
