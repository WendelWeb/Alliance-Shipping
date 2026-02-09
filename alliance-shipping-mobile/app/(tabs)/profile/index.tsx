import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Switch,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser, useClerk } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import {
  User,
  Package,
  MapPin,
  ChevronRight,
  LogOut,
  Calculator,
  CreditCard,
  MapPinned,
  Clock,
  Bell,
  HelpCircle,
  Settings,
  Send,
  Gift,
  Palette,
  Check,
  X,
  Fingerprint,
  ScanFace,
} from 'lucide-react-native';
import { useTheme, themes, ACCENT_PRESETS } from '@/lib/themes/ThemeProvider';
import type { ThemeDefinition } from '@/lib/themes/definitions';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { locales, localeNames, localeFlags, type Locale } from '@/lib/i18n/config';
import {
  isBiometricAvailable,
  isBiometricEnabled,
  setBiometricEnabled,
  getBiometricType,
  getBiometricLabel,
  authenticate,
  type BiometricType,
} from '@/lib/biometrics';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  route?: string;
  onPress?: () => void;
}

// ── Theme Preview Mini Card ──
function ThemePreviewCard({
  theme,
  isSelected,
  onPress,
}: {
  theme: ThemeDefinition;
  isSelected: boolean;
  onPress: () => void;
}) {
  const { fonts, spacing, borderRadius } = useTheme();

  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      activeOpacity={0.7}
      style={[
        styles.themeCard,
        {
          borderColor: isSelected ? theme.preview.accent : 'transparent',
          borderWidth: isSelected ? 2 : 1,
        },
      ]}
    >
      <View style={[styles.themePreview, { backgroundColor: theme.preview.bg }]}>
        {/* Mini card preview */}
        <View
          style={[
            styles.themePreviewCard,
            { backgroundColor: theme.preview.card },
          ]}
        >
          <View
            style={[
              styles.themePreviewDot,
              { backgroundColor: theme.preview.accent },
            ]}
          />
          <View
            style={[
              styles.themePreviewLine,
              { backgroundColor: theme.preview.text, opacity: 0.3 },
            ]}
          />
          <View
            style={[
              styles.themePreviewLineShort,
              { backgroundColor: theme.preview.text, opacity: 0.2 },
            ]}
          />
        </View>
        {isSelected && (
          <View style={[styles.themeCheckCircle, { backgroundColor: theme.preview.accent }]}>
            <Check size={10} color="#ffffff" strokeWidth={3} />
          </View>
        )}
      </View>
      <Text
        style={[
          styles.themeName,
          {
            fontFamily: fonts.medium,
            color: isSelected ? theme.preview.accent : undefined,
          },
        ]}
        numberOfLines={1}
      >
        {theme.name}
      </Text>
    </TouchableOpacity>
  );
}

// ── Accent Color Swatch ──
function AccentSwatch({
  hex,
  isSelected,
  onPress,
}: {
  hex: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      activeOpacity={0.7}
      style={[
        styles.accentSwatch,
        { backgroundColor: hex },
        isSelected && styles.accentSwatchSelected,
      ]}
    >
      {isSelected && <Check size={14} color="#ffffff" strokeWidth={3} />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const { t, locale, setLocale } = useTranslation();
  const {
    colors,
    fonts,
    spacing,
    borderRadius,
    shadows,
    card,
    isDark,
    themeId,
    setTheme,
    customAccent,
    setCustomAccent,
  } = useTheme();

  const [showThemePicker, setShowThemePicker] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricOn, setBiometricOn] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType>('none');
  const [stats, setStats] = useState({
    totalPackages: 0,
    inTransit: 0,
    delivered: 0,
  });
  const [userCity, setUserCity] = useState<string | null>(null);

  // Load biometric settings and fetch package stats
  useEffect(() => {
    (async () => {
      const available = await isBiometricAvailable();
      setBiometricAvailable(available);
      if (available) {
        const enabled = await isBiometricEnabled();
        setBiometricOn(enabled);
        const type = await getBiometricType();
        setBiometricType(type);
      }
    })();

    // Fetch user packages and calculate stats
    if (isSignedIn) {
      import('@/lib/api').then(({ api }) => {
        // Fetch packages
        api.get<{ success: boolean; packages: any[] }>('/api/user/packages')
          .then((data) => {
            const packages = data.packages || [];
            const totalPackages = packages.length;
            const inTransit = packages.filter((pkg: any) =>
              pkg.status === 'in-transit' || pkg.status === 'customs'
            ).length;
            const delivered = packages.filter((pkg: any) =>
              pkg.status === 'delivered'
            ).length;

            setStats({
              totalPackages,
              inTransit,
              delivered,
            });
          })
          .catch((err) => {
            console.error('Error fetching package stats:', err);
          });

        // Fetch user profile to get city
        api.get<{ success: boolean; user: any }>('/api/user/profile')
          .then((data) => {
            if (data.user?.city) {
              setUserCity(data.user.city);
            }
          })
          .catch((err) => {
            console.error('Error fetching user city:', err);
          });
      });
    }
  }, [isSignedIn]);

  const handleSignOut = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await signOut();
      router.replace('/');
    } catch {
      Alert.alert(t.common.error);
    }
  };

  const handleLanguageSelect = (newLocale: Locale) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLocale(newLocale);
  };

  const handleRequestPackage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/claim-package');
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      // Verify identity before enabling
      const success = await authenticate('Verify to enable biometric lock');
      if (success) {
        await setBiometricEnabled(true);
        setBiometricOn(true);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      await setBiometricEnabled(false);
      setBiometricOn(false);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const styleThemes = themes.filter((t) => t.category === 'style');
  const colorThemes = themes.filter((t) => t.category === 'color');

  const menuItems: MenuItem[] = [
    { icon: <Package size={20} color={colors.primary[600]} />, label: t.profile.menuItems.myPackages, route: '/(tabs)/packages' },
    { icon: <Send size={20} color={colors.purple[600]} />, label: t.profile.menuItems.requestPackage, onPress: handleRequestPackage },
    { icon: <Gift size={20} color={colors.yellow[600]} />, label: t.profile.menuItems.rewards, route: '/(tabs)/profile/rewards' },
    { icon: <Calculator size={20} color={colors.emerald[600]} />, label: t.profile.menuItems.priceCalculator, route: '/(tabs)/calculator' },
    { icon: <CreditCard size={20} color={colors.orange[600]} />, label: t.profile.menuItems.paymentMethods, route: '/(tabs)/profile/payment' },
    { icon: <MapPinned size={20} color={colors.primary[600]} />, label: t.profile.menuItems.myAddresses, route: '/(tabs)/profile/addresses' },
    { icon: <Clock size={20} color={colors.yellow[600]} />, label: t.profile.menuItems.history, route: '/(tabs)/profile/history' },
    { icon: <Bell size={20} color={colors.red[500]} />, label: t.profile.menuItems.notifications, route: '/(tabs)/profile/notifications' },
    { icon: <HelpCircle size={20} color={colors.green[600]} />, label: t.profile.menuItems.support, route: '/(tabs)/profile/support' },
    { icon: <Settings size={20} color={colors.gray[600]} />, label: t.profile.menuItems.profileSettings, route: '/(tabs)/profile/settings' },
  ];

  const handleMenuPress = (item: MenuItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.onPress) {
      item.onPress();
    } else if (item.route) {
      router.push(item.route as any);
    }
  };

  // ── Theme Picker Modal ──
  const renderThemePicker = () => (
    <Modal
      visible={showThemePicker}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowThemePicker(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: colors.gray[200] }]}>
          <Text style={[styles.modalTitle, { fontFamily: fonts.headingBold, color: colors.gray[900] }]}>
            {t.profile.theme}
          </Text>
          <TouchableOpacity
            onPress={() => setShowThemePicker(false)}
            style={[styles.modalClose, { backgroundColor: colors.gray[100] }]}
          >
            <X size={20} color={colors.gray[600]} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
          {/* Style Themes */}
          <Text style={[styles.themeSectionTitle, { fontFamily: fonts.headingSemiBold, color: colors.gray[900] }]}>
            {t.profile.themeStyles}
          </Text>
          <View style={styles.themeGrid}>
            {styleThemes.map((theme) => (
              <ThemePreviewCard
                key={theme.id}
                theme={theme}
                isSelected={themeId === theme.id}
                onPress={() => setTheme(theme.id)}
              />
            ))}
          </View>

          {/* Color Themes */}
          <Text style={[styles.themeSectionTitle, { fontFamily: fonts.headingSemiBold, color: colors.gray[900] }]}>
            {t.profile.themeColors}
          </Text>
          <View style={styles.themeGrid}>
            {colorThemes.map((theme) => (
              <ThemePreviewCard
                key={theme.id}
                theme={theme}
                isSelected={themeId === theme.id}
                onPress={() => setTheme(theme.id)}
              />
            ))}
          </View>

          {/* Custom Accent Color */}
          <Text style={[styles.themeSectionTitle, { fontFamily: fonts.headingSemiBold, color: colors.gray[900] }]}>
            {t.profile.accentColor}
          </Text>
          <View style={[styles.accentCard, { backgroundColor: card.backgroundColor, borderColor: card.borderColor, borderWidth: card.borderWidth }]}>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setCustomAccent(null);
              }}
              activeOpacity={0.7}
              style={[
                styles.accentResetButton,
                {
                  backgroundColor: !customAccent ? colors.primary[100] : colors.gray[100],
                  borderColor: !customAccent ? colors.primary[500] : colors.gray[200],
                },
              ]}
            >
              <Text
                style={[
                  styles.accentResetText,
                  {
                    fontFamily: fonts.semiBold,
                    color: !customAccent ? colors.primary[600] : colors.gray[600],
                  },
                ]}
              >
                {t.profile.default}
              </Text>
            </TouchableOpacity>
            <View style={styles.accentGrid}>
              {ACCENT_PRESETS.map((preset) => (
                <AccentSwatch
                  key={preset.hex}
                  hex={preset.hex}
                  isSelected={customAccent === preset.hex}
                  onPress={() => setCustomAccent(preset.hex)}
                />
              ))}
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );

  // ── NOT SIGNED IN STATE ──
  if (!isSignedIn) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Animated.View entering={FadeInDown.duration(500).springify().damping(18)} style={styles.notSignedInContainer}>
            <View style={[styles.cardBase, shadows.md, { backgroundColor: card.backgroundColor, borderColor: card.borderColor, borderWidth: card.borderWidth }]}>
              <View style={[styles.notSignedInIconCircle, { backgroundColor: colors.gray[100] }]}>
                <User size={40} color={colors.gray[400]} />
              </View>
              <Text style={[styles.notConnectedText, { fontFamily: fonts.headingSemiBold, color: colors.gray[700] }]}>
                {t.profile.notConnected}
              </Text>
              <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/(auth)/sign-in')} style={styles.signInButtonWrapper}>
                <LinearGradient colors={[colors.primary[500], colors.primary[700]]} style={styles.signInButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={[styles.signInButtonText, { fontFamily: fonts.semiBold, color: colors.white }]}>{t.profile.signIn}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Language */}
          <Animated.View entering={FadeInDown.delay(150).duration(500).springify().damping(18)}>
            <Text style={[styles.sectionTitle, { fontFamily: fonts.headingSemiBold, color: colors.gray[800] }]}>{t.profile.language}</Text>
            <View style={styles.languageGrid}>
              {locales.map((loc) => (
                <TouchableOpacity
                  key={loc}
                  style={[
                    styles.languageButton,
                    { backgroundColor: card.backgroundColor, borderColor: locale === loc ? colors.primary[600] : colors.gray[200] },
                    locale === loc && { backgroundColor: colors.primary[600] },
                  ]}
                  onPress={() => handleLanguageSelect(loc)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.languageFlag}>{localeFlags[loc]}</Text>
                  <Text style={[styles.languageName, { fontFamily: fonts.semiBold, color: locale === loc ? colors.white : colors.gray[700] }]}>
                    {localeNames[loc]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Theme Button */}
          <Animated.View entering={FadeInDown.delay(250).duration(500).springify().damping(18)}>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowThemePicker(true);
              }}
              activeOpacity={0.7}
              style={[styles.themeButton, shadows.sm, { backgroundColor: card.backgroundColor, borderColor: card.borderColor, borderWidth: card.borderWidth }]}
            >
              <View style={[styles.themeButtonIcon, { backgroundColor: colors.primary[100] }]}>
                <Palette size={20} color={colors.primary[600]} />
              </View>
              <View style={styles.themeButtonText}>
                <Text style={[styles.themeButtonLabel, { fontFamily: fonts.semiBold, color: colors.gray[900] }]}>Theme</Text>
                <Text style={[styles.themeButtonValue, { fontFamily: fonts.regular, color: colors.gray[500] }]}>
                  {themes.find((t) => t.id === themeId)?.name || 'Light'}
                </Text>
              </View>
              <ChevronRight size={18} color={colors.gray[400]} />
            </TouchableOpacity>
          </Animated.View>

          {/* Biometric Authentication */}
          {biometricAvailable && (
            <Animated.View entering={FadeInDown.delay(280).duration(500).springify().damping(18)}>
              <View style={[styles.biometricCard, shadows.sm, { backgroundColor: card.backgroundColor, borderColor: card.borderColor, borderWidth: card.borderWidth }]}>
                <View style={styles.biometricContent}>
                  <View style={[styles.biometricIconCircle, { backgroundColor: colors.primary[100] }]}>
                    {biometricType === 'facial' ? (
                      <ScanFace size={20} color={colors.primary[600]} />
                    ) : (
                      <Fingerprint size={20} color={colors.primary[600]} />
                    )}
                  </View>
                  <View style={styles.biometricTextContainer}>
                    <Text style={[styles.biometricLabel, { fontFamily: fonts.semiBold, color: colors.gray[900] }]}>
                      {getBiometricLabel(biometricType)}
                    </Text>
                    <Text style={[styles.biometricStatus, { fontFamily: fonts.regular, color: colors.gray[500] }]}>
                      {biometricOn ? t.profile.enabled : t.profile.disabled}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={biometricOn}
                  onValueChange={handleBiometricToggle}
                  trackColor={{ false: colors.gray[300], true: colors.primary[400] }}
                  thumbColor={biometricOn ? colors.primary[600] : colors.gray[100]}
                />
              </View>
            </Animated.View>
          )}
        </ScrollView>
        {renderThemePicker()}
      </View>
    );
  }

  // ── SIGNED IN STATE ──
  return (
    <View style={[styles.screen, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <Animated.View entering={FadeInDown.duration(500).springify().damping(18)}>
          <LinearGradient
            colors={[colors.primary[500], colors.primary[700]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.headerCard, shadows.lg]}
          >
            <View style={styles.headerRow}>
              <Image source={{ uri: user?.imageUrl }} style={styles.avatar} contentFit="cover" transition={200} />
              <View style={styles.headerInfo}>
                <Text style={[styles.headerName, { fontFamily: fonts.headingBold }]} numberOfLines={1}>
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text style={styles.headerEmail} numberOfLines={1}>{user?.primaryEmailAddress?.emailAddress}</Text>
                {user?.primaryPhoneNumber?.phoneNumber ? (
                  <Text style={styles.headerPhone} numberOfLines={1}>📞 {user.primaryPhoneNumber.phoneNumber}</Text>
                ) : null}
                {userCity ? (
                  <Text style={styles.headerPhone} numberOfLines={1}>📍 {userCity}</Text>
                ) : null}
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Language */}
        <Animated.View entering={FadeInDown.delay(100).duration(500).springify().damping(18)}>
          <Text style={[styles.sectionTitle, { fontFamily: fonts.headingSemiBold, color: colors.gray[800] }]}>{t.profile.language}</Text>
          <View style={styles.languageGrid}>
            {locales.map((loc) => (
              <TouchableOpacity
                key={loc}
                style={[
                  styles.languageButton,
                  { backgroundColor: card.backgroundColor, borderColor: locale === loc ? colors.primary[600] : colors.gray[200] },
                  locale === loc && { backgroundColor: colors.primary[600] },
                ]}
                onPress={() => handleLanguageSelect(loc)}
                activeOpacity={0.7}
              >
                <Text style={styles.languageFlag}>{localeFlags[loc]}</Text>
                <Text style={[styles.languageName, { fontFamily: fonts.semiBold, color: locale === loc ? colors.white : colors.gray[700] }]}>
                  {localeNames[loc]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Theme Picker Button */}
        <Animated.View entering={FadeInDown.delay(150).duration(500).springify().damping(18)}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowThemePicker(true);
            }}
            activeOpacity={0.7}
            style={[styles.themeButton, shadows.sm, { backgroundColor: card.backgroundColor, borderColor: card.borderColor, borderWidth: card.borderWidth }]}
          >
            <View style={[styles.themeButtonIcon, { backgroundColor: colors.primary[100] }]}>
              <Palette size={20} color={colors.primary[600]} />
            </View>
            <View style={styles.themeButtonText}>
              <Text style={[styles.themeButtonLabel, { fontFamily: fonts.semiBold, color: colors.gray[900] }]}>{t.profile.theme}</Text>
              <Text style={[styles.themeButtonValue, { fontFamily: fonts.regular, color: colors.gray[500] }]}>
                {themes.find((th) => th.id === themeId)?.name || 'Light'}
              </Text>
            </View>
            <ChevronRight size={18} color={colors.gray[400]} />
          </TouchableOpacity>
        </Animated.View>

        {/* Biometric Authentication */}
        {biometricAvailable && (
          <Animated.View entering={FadeInDown.delay(180).duration(500).springify().damping(18)}>
            <View style={[styles.biometricCard, shadows.sm, { backgroundColor: card.backgroundColor, borderColor: card.borderColor, borderWidth: card.borderWidth }]}>
              <View style={styles.biometricContent}>
                <View style={[styles.biometricIconCircle, { backgroundColor: colors.primary[100] }]}>
                  {biometricType === 'facial' ? (
                    <ScanFace size={20} color={colors.primary[600]} />
                  ) : (
                    <Fingerprint size={20} color={colors.primary[600]} />
                  )}
                </View>
                <View style={styles.biometricTextContainer}>
                  <Text style={[styles.biometricLabel, { fontFamily: fonts.semiBold, color: colors.gray[900] }]}>
                    {getBiometricLabel(biometricType)}
                  </Text>
                  <Text style={[styles.biometricStatus, { fontFamily: fonts.regular, color: colors.gray[500] }]}>
                    {biometricOn ? t.profile.enabled : t.profile.disabled}
                  </Text>
                </View>
              </View>
              <Switch
                value={biometricOn}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: colors.gray[300], true: colors.primary[400] }}
                thumbColor={biometricOn ? colors.primary[600] : colors.gray[100]}
              />
            </View>
          </Animated.View>
        )}

        {/* Stats */}
        <Animated.View entering={FadeInDown.delay(200).duration(500).springify().damping(18)}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, shadows.sm, { backgroundColor: card.backgroundColor, borderColor: card.borderColor, borderWidth: card.borderWidth }]}>
              <Package size={20} color={colors.primary[600]} />
              <Text style={[styles.statNumber, { fontFamily: fonts.headingBold, color: colors.gray[900] }]}>{stats.totalPackages}</Text>
              <Text style={[styles.statLabel, { fontFamily: fonts.regular, color: colors.gray[500] }]}>{t.profile.stats.totalPackages}</Text>
            </View>
            <View style={[styles.statCard, shadows.sm, { backgroundColor: card.backgroundColor, borderColor: card.borderColor, borderWidth: card.borderWidth }]}>
              <MapPin size={20} color={colors.orange[600]} />
              <Text style={[styles.statNumber, { fontFamily: fonts.headingBold, color: colors.gray[900] }]}>{stats.inTransit}</Text>
              <Text style={[styles.statLabel, { fontFamily: fonts.regular, color: colors.gray[500] }]}>{t.profile.stats.inTransit}</Text>
            </View>
            <View style={[styles.statCard, shadows.sm, { backgroundColor: card.backgroundColor, borderColor: card.borderColor, borderWidth: card.borderWidth }]}>
              <Package size={20} color={colors.green[600]} />
              <Text style={[styles.statNumber, { fontFamily: fonts.headingBold, color: colors.gray[900] }]}>{stats.delivered}</Text>
              <Text style={[styles.statLabel, { fontFamily: fonts.regular, color: colors.gray[500] }]}>{t.profile.stats.delivered}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Menu */}
        <Animated.View entering={FadeInDown.delay(300).duration(500).springify().damping(18)}>
          <View style={[styles.menuCard, shadows.sm, { backgroundColor: card.backgroundColor, borderColor: card.borderColor, borderWidth: card.borderWidth }]}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, index < menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.gray[100] }]}
                onPress={() => handleMenuPress(item)}
                activeOpacity={0.6}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconCircle, { backgroundColor: colors.gray[50] }]}>{item.icon}</View>
                  <Text style={[styles.menuItemLabel, { fontFamily: fonts.medium, color: colors.gray[800] }]}>{item.label}</Text>
                </View>
                <ChevronRight size={18} color={colors.gray[400]} />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Sign Out */}
        <Animated.View entering={FadeInDown.delay(400).duration(500).springify().damping(18)}>
          <TouchableOpacity
            style={[styles.signOutButton, { backgroundColor: card.backgroundColor, borderColor: colors.red[500] }]}
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <LogOut size={18} color={colors.red[600]} />
            <Text style={[styles.signOutText, { fontFamily: fonts.semiBold, color: colors.red[600] }]}>{t.profile.menu.signOut}</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {renderThemePicker()}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120 },
  notSignedInContainer: { marginBottom: 20 },
  cardBase: { borderRadius: 20, padding: 20, alignItems: 'center' },
  notSignedInIconCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  notConnectedText: { fontSize: 18, marginBottom: 20 },
  signInButtonWrapper: { width: '100%', borderRadius: 16, overflow: 'hidden' },
  signInButton: { paddingVertical: 14, alignItems: 'center', borderRadius: 16 },
  signInButtonText: { fontSize: 16 },
  headerCard: { borderRadius: 20, padding: 20, marginBottom: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  headerInfo: { marginLeft: 16, flex: 1 },
  headerName: { fontSize: 20, color: '#ffffff', marginBottom: 2 },
  headerEmail: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 2 },
  headerPhone: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  sectionTitle: { fontSize: 17, marginBottom: 12 },
  languageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  languageButton: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 16, borderWidth: 1.5, flexGrow: 1, flexBasis: '45%' },
  languageFlag: { fontSize: 20, marginRight: 8 },
  languageName: { fontSize: 14 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statCard: { flex: 1, borderRadius: 20, padding: 12, alignItems: 'center' },
  statNumber: { fontSize: 22, marginTop: 4 },
  statLabel: { fontSize: 11, textAlign: 'center', marginTop: 2 },
  menuCard: { borderRadius: 20, padding: 4, marginBottom: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 12 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  menuIconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  menuItemLabel: { fontSize: 15 },
  signOutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 20, borderWidth: 1.5, paddingVertical: 14, marginBottom: 24, gap: 8 },
  signOutText: { fontSize: 15 },

  // Theme Picker Button
  themeButton: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 14, marginBottom: 20 },
  themeButtonIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  themeButtonText: { flex: 1 },
  themeButtonLabel: { fontSize: 15 },
  themeButtonValue: { fontSize: 12, marginTop: 1 },

  // Theme Picker Modal
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 22 },
  modalClose: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  modalScroll: { paddingHorizontal: 20, paddingTop: 20 },
  themeSectionTitle: { fontSize: 17, marginBottom: 14 },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  themeCard: { width: '23%', flexGrow: 1, flexBasis: '22%', borderRadius: 14, overflow: 'hidden', borderColor: 'transparent' },
  themePreview: { height: 72, borderRadius: 12, padding: 8, justifyContent: 'center', margin: 3 },
  themePreviewCard: { borderRadius: 6, padding: 6, marginBottom: 4 },
  themePreviewDot: { width: 10, height: 10, borderRadius: 5, marginBottom: 4 },
  themePreviewLine: { height: 3, borderRadius: 2, width: '80%', marginBottom: 3 },
  themePreviewLineShort: { height: 3, borderRadius: 2, width: '55%' },
  themeCheckCircle: { position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  themeName: { fontSize: 11, textAlign: 'center', marginTop: 4, marginBottom: 6, color: '#6b7280' },

  // Accent Colors
  accentCard: { borderRadius: 16, padding: 16, marginBottom: 20 },
  accentResetButton: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginBottom: 14 },
  accentResetText: { fontSize: 13 },
  accentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  accentSwatch: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  accentSwatchSelected: { borderWidth: 3, borderColor: 'rgba(255,255,255,0.8)' },

  // Biometric Card
  biometricCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 20, padding: 14, marginBottom: 20 },
  biometricContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  biometricIconCircle: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  biometricTextContainer: { flex: 1 },
  biometricLabel: { fontSize: 15 },
  biometricStatus: { fontSize: 12, marginTop: 1 },
});
