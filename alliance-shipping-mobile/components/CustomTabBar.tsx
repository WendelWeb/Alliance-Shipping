import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/themes/ThemeProvider';
import { useTranslation } from '@/lib/i18n/useTranslation';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type TabBarProps = BottomTabBarProps;

function TabItem({
  route,
  index,
  isActive,
  isCenter,
  icon,
  label,
  onPress,
  onLongPress,
}: {
  route: { key: string; name: string };
  index: number;
  isActive: boolean;
  isCenter: boolean;
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const { colors, spring, fonts } = useTheme();
  const scale = useSharedValue(1);
  const dotWidth = useSharedValue(isActive ? 4 : 0);

  React.useEffect(() => {
    dotWidth.value = withSpring(isActive ? 4 : 0, spring.snappy);
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const dotStyle = useAnimatedStyle(() => ({
    width: dotWidth.value,
    height: dotWidth.value,
    borderRadius: 2,
    backgroundColor: isCenter ? colors.white : colors.primary[600],
    marginTop: 3,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, spring.snappy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, spring.snappy);
  };

  if (isCenter) {
    return (
      <AnimatedTouchable
        style={[styles.centerTab, animatedStyle]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <LinearGradient
          colors={[colors.primary[500], colors.primary[700]]}
          style={[styles.centerGradient, { shadowColor: colors.primary[600] }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {icon}
        </LinearGradient>
        <Animated.Text
          style={[
            styles.centerLabel,
            { fontFamily: fonts.medium, color: isActive ? colors.primary[600] : colors.gray[400] },
          ]}
        >
          {label}
        </Animated.Text>
        <Animated.View style={dotStyle} />
      </AnimatedTouchable>
    );
  }

  return (
    <AnimatedTouchable
      style={[styles.tab, animatedStyle]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      {icon}
      <Animated.Text
        style={[
          styles.label,
          { fontFamily: fonts.medium, color: isActive ? colors.primary[600] : colors.gray[400] },
        ]}
      >
        {label}
      </Animated.Text>
      <Animated.View style={dotStyle} />
    </AnimatedTouchable>
  );
}

export function CustomTabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

  const tabLabels: Record<string, string> = {
    index: t.tabs.news,
    locations: t.tabs.locations,
    packages: t.tabs.packages,
    calculator: t.tabs.calculator,
    'profile/index': t.tabs.profile,
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 8),
          borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
        },
      ]}
    >
      <BlurView intensity={90} tint={isDark ? 'dark' : 'light'} style={styles.blur}>
        <View style={styles.inner}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isActive = state.index === index;
            const isCenter = index === 2;

            const icon = options.tabBarIcon?.({
              color: isCenter
                ? colors.white
                : isActive
                  ? colors.primary[600]
                  : colors.gray[400],
              size: isCenter ? 28 : 22,
              focused: isActive,
            });

            const label = tabLabels[route.name] || route.name;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isActive && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TabItem
                key={route.key}
                route={route}
                index={index}
                isActive={isActive}
                isCenter={isCenter}
                icon={icon}
                label={label}
                onPress={onPress}
                onLongPress={() => {}}
              />
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  blur: {
    overflow: 'hidden',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  label: {
    fontSize: 10,
    marginTop: 2,
  },
  centerTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  centerGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  centerLabel: {
    fontSize: 10,
    marginTop: 4,
  },
});
