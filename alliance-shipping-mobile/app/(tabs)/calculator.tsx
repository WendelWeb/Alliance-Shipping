import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import {
  Calculator,
  DollarSign,
  Weight,
  Clock,
  Minus,
  Plus,
  Droplets,
  MapPin,
  Package,
  LogIn,
  User,
} from 'lucide-react-native';
import { useTheme } from '@/lib/themes/ThemeProvider';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { api } from '@/lib/api';
import { getLocalFees, isSQLiteAvailable } from '@/lib/offline/database';

// Types
interface CityPricing {
  id: number;
  city: string;
  serviceFee: string; // Decimal from DB
  pricePerLb: string; // Decimal from DB
  deliveryDaysMin: number;
  deliveryDaysMax: number;
  perfumeDaysMin: number;
  perfumeDaysMax: number;
}

interface SpecialItem {
  id: number;
  category: string;
  brand: string;
  itemName: string;
  minModel: string | null;
  maxModel: string | null;
  fixedFee: string; // Decimal from DB
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
}

interface UserProfile {
  city: string;
  firstName?: string;
  lastName?: string;
}

const MIN_WEIGHT = 1;
const MAX_WEIGHT = 100;

const CITY_EMOJI: Record<string, string> = {
  'Port-au-Prince': '🏛️',
  'Cap-Haïtien': '⚓',
  'Port-de-Paix': '🌊',
};

export default function CalculatorScreen() {
  const insets = useSafeAreaInsets();
  const { t, locale } = useTranslation();
  const { colors, fonts, spacing, borderRadius, shadows, card, isDark } = useTheme();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userCity, setUserCity] = useState<CityPricing | null>(null);
  const [weight, setWeight] = useState(1);
  const [hasPerfume, setHasPerfume] = useState(false);
  const [specialItems, setSpecialItems] = useState<SpecialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [calculationType, setCalculationType] = useState<'weight' | 'special'>('weight');
  const [selectedSpecialItem, setSelectedSpecialItem] = useState<number | null>(null);

  // Animated values
  const weightScale = useSharedValue(1);

  // Fetch user profile and pricing (with offline fallback)
  useEffect(() => {
    (async () => {
      try {
        const [profileRes, itemsRes] = await Promise.all([
          api.get<{ success: boolean; user: UserProfile }>('/api/user/profile').catch(() => null),
          api.get<{ items: SpecialItem[] }>('/api/special-items/public').catch(() => ({ items: [] })),
        ]);

        if (profileRes?.user?.city) {
          setUserProfile(profileRes.user);
          setIsAuthenticated(true);

          // Fetch pricing for user's city
          try {
            const pricingRes = await api.get<{ cities: CityPricing[] }>('/api/pricing/all');
            const cityData = pricingRes.cities?.find((c: CityPricing) => c.city === profileRes.user.city);
            if (cityData) {
              setUserCity(cityData);
            }
          } catch {
            // Try offline cache for pricing
            if (isSQLiteAvailable()) {
              try {
                const cached = await getLocalFees();
                const cityData = cached.find((c: any) => c.city === profileRes.user.city);
                if (cityData) setUserCity(cityData);
              } catch {}
            }
          }
        }

        if (itemsRes.items) {
          setSpecialItems(itemsRes.items.filter(item => item.isActive));
        }
      } catch (error) {
        console.warn('Error loading calculator data, trying cache:', error);
        // Offline fallback for fees
        if (isSQLiteAvailable()) {
          try {
            const cached = await getLocalFees();
            if (cached.length > 0) {
              setUserCity(cached[0]); // Use first city as default
            }
          } catch {}
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Animated style for weight changes
  const weightAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: weightScale.value }],
  }));

  // Handle weight change
  const handleWeightChange = (delta: number) => {
    const newWeight = Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, weight + delta));
    if (newWeight !== weight) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setWeight(newWeight);
      weightScale.value = withSpring(1.1, {}, () => {
        weightScale.value = withSpring(1);
      });
    }
  };

  // Calculate pricing
  const serviceFee = userCity ? parseFloat(userCity.serviceFee) : 0;
  const pricePerLb = userCity ? parseFloat(userCity.pricePerLb) : 0;
  const weightCost = weight * pricePerLb;
  const weightTotal = serviceFee + weightCost;

  // Special item pricing (includes service fee)
  const selectedItem = specialItems.find(item => item.id === selectedSpecialItem);
  const specialItemPrice = selectedItem ? parseFloat(selectedItem.fixedFee) : 0;
  const specialItemTotal = specialItemPrice + serviceFee;

  // Final total based on calculation type
  const total = calculationType === 'weight' ? weightTotal : specialItemTotal;

  const deliveryDays = userCity
    ? hasPerfume
      ? `${userCity.perfumeDaysMin}-${userCity.perfumeDaysMax}`
      : `${userCity.deliveryDaysMin}-${userCity.deliveryDaysMax}`
    : '';

  // Helper function for localized item names
  const getLocalizedItemName = (item: SpecialItem) => {
    const localizedName = (item as any)[`itemName_${locale}`] || item.itemName;
    if (item.minModel && item.maxModel) {
      return `${localizedName} ${item.minModel}-${item.maxModel}`;
    } else if (item.minModel) {
      return `${localizedName} ${item.minModel}+`;
    }
    return localizedName;
  };

  // Scroll content style with dynamic bottom padding
  const scrollContentStyle = {
    paddingBottom: Math.max(100, insets.bottom + 80), // Account for tab bar + safe area
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={{ fontFamily: fonts.medium, color: isDark ? colors.white : colors.gray[600], marginTop: spacing.md }}>
          {t.calculator.loading || 'Chargement...'}
        </Text>
      </View>
    );
  }

  // Not authenticated state
  if (!isAuthenticated || !userCity) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={scrollContentStyle}>
          {/* Header */}
          <Animated.View entering={FadeInDown.duration(500)}>
            <LinearGradient
              colors={[colors.primary[500], colors.primary[700]]}
              style={[styles.headerCard, { marginHorizontal: spacing.xl, marginTop: spacing.lg, borderRadius: borderRadius.xl, padding: spacing.xl }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={{ alignItems: 'center' }}>
                <Calculator size={48} color={colors.white} style={{ marginBottom: spacing.md }} />
                <Text style={[styles.headerTitle, { fontFamily: fonts.headingBold, color: colors.white, fontSize: 24 }]}>
                  {t.calculator.title}
                </Text>
                <Text style={[styles.headerSubtitle, { fontFamily: fonts.regular, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginTop: spacing.sm }]}>
                  {t.calculator.subtitle}
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Login prompt */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <View style={[styles.card, { backgroundColor: card.backgroundColor, borderRadius: borderRadius.xl, padding: spacing.xl, marginHorizontal: spacing.xl, marginTop: spacing.xl, ...shadows.md, borderWidth: 2, borderColor: colors.primary[500] }]}>
              <View style={{ alignItems: 'center' }}>
                <LinearGradient
                  colors={[colors.primary[500], colors.primary[600]]}
                  style={{ width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg }}
                >
                  <LogIn size={40} color={colors.white} />
                </LinearGradient>
                <Text style={{ fontFamily: fonts.bold, fontSize: 20, color: colors.gray[900], textAlign: 'center', marginBottom: spacing.sm }}>
                  {t.calculator.loginRequired || 'Connexion requise'}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: colors.gray[600], textAlign: 'center', marginBottom: spacing.xl, lineHeight: 20 }}>
                  {t.calculator.loginMessage || 'Connectez-vous pour calculer vos tarifs basés sur votre ville de destination'}
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/sign-in')}
                  style={{ overflow: 'hidden', borderRadius: borderRadius.lg }}
                >
                  <LinearGradient
                    colors={[colors.primary[500], colors.primary[600]]}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md, paddingHorizontal: spacing.xl }}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <User size={20} color={colors.white} />
                    <Text style={{ fontFamily: fonts.semiBold, fontSize: 16, color: colors.white }}>
                      {t.calculator.login || 'Se connecter'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  // Authenticated - Show calculator
  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={scrollContentStyle}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(500)}>
          <LinearGradient
            colors={[colors.primary[500], colors.primary[700]]}
            style={[styles.headerCard, { marginHorizontal: spacing.xl, marginTop: spacing.lg, borderRadius: borderRadius.xl, padding: spacing.lg }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={[styles.headerIconRow, { marginBottom: spacing.xs }]}>
              <View style={styles.headerIconCircle}>
                <Calculator size={20} color={colors.primary[600]} />
              </View>
              <Text style={[styles.headerTitle, { fontFamily: fonts.headingBold, color: colors.white }]}>
                {t.calculator.title}
              </Text>
            </View>
            <Text style={[styles.headerSubtitle, { fontFamily: fonts.regular, color: 'rgba(255,255,255,0.9)' }]}>
              {t.calculator.subtitle}
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* User's City Card */}
        <Animated.View entering={FadeInDown.delay(60).duration(500)}>
          <View style={[styles.card, { backgroundColor: card.backgroundColor, borderRadius: borderRadius.xl, padding: spacing.lg, marginHorizontal: spacing.xl, marginTop: spacing.lg, ...shadows.sm, borderWidth: 1, borderColor: card.borderColor }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <LinearGradient
                colors={[colors.primary[500], colors.primary[600]]}
                style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}
              >
                <MapPin size={20} color={colors.white} />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.gray[600] }}>
                  {t.calculator.yourDestination || 'Votre destination'}
                </Text>
                <Text style={{ fontFamily: fonts.bold, fontSize: 18, color: colors.gray[900] }}>
                  {CITY_EMOJI[userCity.city] || '📍'} {userCity.city}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Calculation Type Selector */}
        <Animated.View entering={FadeInDown.delay(120).duration(500)}>
          <View style={{ marginHorizontal: spacing.xl, marginTop: spacing.lg }}>
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCalculationType('weight');
                }}
                style={{
                  flex: 1,
                  overflow: 'hidden',
                  borderRadius: borderRadius.xl,
                  borderWidth: 2,
                  borderColor: calculationType === 'weight' ? colors.primary[500] : card.borderColor,
                  ...shadows.sm,
                }}
              >
                <LinearGradient
                  colors={
                    calculationType === 'weight'
                      ? [colors.primary[500], colors.primary[600]]
                      : isDark
                      ? [card.backgroundColor, card.backgroundColor]
                      : [colors.white, colors.gray[50]]
                  }
                  style={{
                    padding: spacing.lg,
                    alignItems: 'center',
                  }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Weight size={28} color={calculationType === 'weight' ? colors.white : colors.primary[500]} strokeWidth={2.5} />
                  <Text style={{
                    fontFamily: fonts.bold,
                    fontSize: 13,
                    color: calculationType === 'weight' ? colors.white : colors.gray[700],
                    marginTop: spacing.sm,
                  }}>
                    {t.calculator.byWeight || 'Par Poids'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCalculationType('special');
                }}
                style={{
                  flex: 1,
                  overflow: 'hidden',
                  borderRadius: borderRadius.xl,
                  borderWidth: 2,
                  borderColor: calculationType === 'special' ? colors.primary[500] : card.borderColor,
                  ...shadows.sm,
                }}
              >
                <LinearGradient
                  colors={
                    calculationType === 'special'
                      ? [colors.primary[500], colors.primary[600]]
                      : isDark
                      ? [card.backgroundColor, card.backgroundColor]
                      : [colors.white, colors.gray[50]]
                  }
                  style={{
                    padding: spacing.lg,
                    alignItems: 'center',
                  }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Package size={28} color={calculationType === 'special' ? colors.white : colors.primary[500]} strokeWidth={2.5} />
                  <Text style={{
                    fontFamily: fonts.bold,
                    fontSize: 13,
                    color: calculationType === 'special' ? colors.white : colors.gray[700],
                    marginTop: spacing.sm,
                  }}>
                    {t.calculator.specialItem || 'Article Spécial'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Weight Calculator */}
        {calculationType === 'weight' && (
          <Animated.View entering={FadeInDown.delay(180).duration(300)}>
            <View style={[styles.card, { backgroundColor: card.backgroundColor, borderRadius: borderRadius.xl, padding: spacing.lg, marginHorizontal: spacing.xl, marginTop: spacing.lg, ...shadows.sm, borderWidth: 1, borderColor: card.borderColor }]}>
              <View style={[styles.cardHeaderRow, { gap: spacing.sm, marginBottom: spacing.md }]}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: isDark ? colors.primary[900] : colors.primary[50], alignItems: 'center', justifyContent: 'center' }}>
                  <Weight size={16} color={colors.primary[600]} />
                </View>
                <Text style={[styles.cardTitle, { fontFamily: fonts.semiBold, color: colors.gray[800] }]}>
                  {t.calculator.weightLabel}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <TouchableOpacity
                  onPress={() => handleWeightChange(-1)}
                  disabled={weight <= MIN_WEIGHT}
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: borderRadius.xl,
                    borderWidth: 2,
                    borderColor: weight <= MIN_WEIGHT ? card.borderColor : colors.primary[500],
                    backgroundColor: weight <= MIN_WEIGHT ? (colors.gray[100]) : card.backgroundColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...shadows.sm,
                  }}
                >
                  <Minus size={24} color={weight <= MIN_WEIGHT ? (colors.gray[400]) : colors.primary[600]} strokeWidth={2.5} />
                </TouchableOpacity>

                <Animated.View style={[{ flex: 1, alignItems: 'center' }, weightAnimatedStyle]}>
                  <Text style={{ fontFamily: fonts.headingBold, fontSize: 56, color: colors.primary[600] }}>
                    {weight}
                  </Text>
                  <Text style={{ fontFamily: fonts.semiBold, fontSize: 16, color: colors.gray[600], marginTop: -spacing.sm }}>
                    {t.calculator.lbsUnit}
                  </Text>
                </Animated.View>

                <TouchableOpacity
                  onPress={() => handleWeightChange(1)}
                  disabled={weight >= MAX_WEIGHT}
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: borderRadius.xl,
                    borderWidth: 2,
                    borderColor: weight >= MAX_WEIGHT ? card.borderColor : colors.primary[500],
                    backgroundColor: weight >= MAX_WEIGHT ? (colors.gray[100]) : card.backgroundColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...shadows.sm,
                  }}
                >
                  <Plus size={24} color={weight >= MAX_WEIGHT ? (colors.gray[400]) : colors.primary[600]} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>

              {/* Perfume Toggle */}
              <View style={{ marginTop: spacing.lg, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: card.borderColor }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}>
                    <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: isDark ? colors.gray[200] : colors.purple[50], alignItems: 'center', justifyContent: 'center' }}>
                      <Droplets size={14} color={colors.purple[600]} />
                    </View>
                    <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: colors.gray[700] }}>
                      {t.calculator.perfumeLabel}
                    </Text>
                  </View>
                  <Switch
                    value={hasPerfume}
                    onValueChange={(val) => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setHasPerfume(val);
                    }}
                    trackColor={{ false: colors.gray[300], true: colors.purple[500] }}
                    thumbColor={hasPerfume ? colors.purple[600] : colors.gray[400]}
                  />
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Special Items Selector */}
        {calculationType === 'special' && specialItems.length > 0 && (
          <Animated.View entering={FadeInDown.delay(180).duration(300)}>
            <View style={{ marginTop: spacing.lg, paddingHorizontal: spacing.xl }}>
              {/* Header */}
              <View style={{ marginBottom: spacing.md }}>
                <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: colors.gray[900] }}>
                  {t.calculator.selectItem || 'Sélectionnez un article'}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {specialItems.map((item) => {
                  const isSelected = selectedSpecialItem === item.id;

                  // Get category emoji
                  const getCategoryEmoji = (category: string) => {
                    const emojiMap: Record<string, string> = {
                      phone: '📱',
                      tablet: '📱',
                      electronics: '⚡',
                      satellite: '🛰️',
                      other: '📦',
                    };
                    return emojiMap[category] || '📦';
                  };

                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        setSelectedSpecialItem(item.id);
                      }}
                      activeOpacity={0.7}
                      style={{
                        width: '31.5%',
                        backgroundColor: card.backgroundColor,
                        borderRadius: borderRadius.lg,
                        borderWidth: 2,
                        borderColor: isSelected ? colors.primary[500] : card.borderColor,
                        overflow: 'hidden',
                        ...shadows.sm,
                      }}
                    >
                      {/* Top section: Icon + Name on same line */}
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: spacing.sm,
                        gap: spacing.xs,
                        minHeight: 58,
                      }}>
                        {/* Category Icon */}
                        <View style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: isSelected ? (isDark ? colors.primary[900] : colors.primary[100]) : colors.gray[100],
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Text style={{ fontSize: 16 }}>{getCategoryEmoji(item.category)}</Text>
                        </View>

                        {/* Item Name + Brand */}
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontFamily: fonts.semiBold,
                              fontSize: 11,
                              color: colors.gray[900],
                              lineHeight: 14,
                            }}
                            numberOfLines={2}
                          >
                            {getLocalizedItemName(item)}
                          </Text>
                          <Text style={{
                            fontFamily: fonts.regular,
                            fontSize: 9,
                            color: colors.gray[500],
                            marginTop: 1,
                          }}>
                            {item.brand}
                          </Text>
                        </View>
                      </View>

                      {/* Price Badge - Full Width Bottom - LESS PADDING */}
                      <LinearGradient
                        colors={
                          isSelected
                            ? [colors.primary[500], colors.primary[600]]
                            : [colors.emerald[500], colors.emerald[600]]
                        }
                        style={{
                          paddingVertical: spacing.xs + 2,
                          alignItems: 'center',
                          borderTopWidth: 1,
                          borderTopColor: isSelected ? colors.primary[600] : colors.emerald[600],
                        }}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Text style={{
                          fontFamily: fonts.bold,
                          fontSize: 14,
                          color: colors.white,
                        }}>
                          ${parseFloat(item.fixedFee).toFixed(2)}
                        </Text>
                      </LinearGradient>

                      {/* Selected Checkmark */}
                      {isSelected && (
                        <View style={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          width: 22,
                          height: 22,
                          borderRadius: 11,
                          backgroundColor: colors.primary[600],
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: 2,
                          borderColor: colors.white,
                          ...shadows.md,
                        }}>
                          <Text style={{ fontSize: 12, color: colors.white }}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </Animated.View>
        )}

        {/* Pricing Summary */}
        {(calculationType === 'weight' || (calculationType === 'special' && selectedSpecialItem)) && (
          <Animated.View entering={FadeInDown.delay(240).duration(300)}>
            <View style={[styles.card, { backgroundColor: card.backgroundColor, borderRadius: borderRadius.xl, padding: spacing.lg, marginHorizontal: spacing.xl, marginTop: spacing.lg, ...shadows.md, borderWidth: 1, borderColor: card.borderColor }]}>
              <View style={[styles.cardHeaderRow, { gap: spacing.sm, marginBottom: spacing.md }]}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: isDark ? colors.gray[200] : colors.green[50], alignItems: 'center', justifyContent: 'center' }}>
                  <DollarSign size={16} color={colors.emerald[500]} />
                </View>
                <Text style={[styles.cardTitle, { fontFamily: fonts.bold, fontSize: 16, color: colors.gray[800] }]}>
                  {t.calculator.summary || 'Résumé'}
                </Text>
              </View>

              <View style={{ gap: spacing.md }}>
                {calculationType === 'weight' ? (
                  <>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: colors.gray[600] }}>
                        {t.calculator.serviceFeeLabel}
                      </Text>
                      <Text style={{ fontFamily: fonts.semiBold, fontSize: 15, color: colors.gray[900] }}>
                        ${serviceFee.toFixed(2)}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: colors.gray[600] }}>
                        {weight} lbs × ${pricePerLb.toFixed(2)}
                      </Text>
                      <Text style={{ fontFamily: fonts.semiBold, fontSize: 15, color: colors.gray[900] }}>
                        ${weightCost.toFixed(2)}
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: colors.gray[600], flex: 1 }}>
                        {selectedItem ? getLocalizedItemName(selectedItem) : ''}
                      </Text>
                      <Text style={{ fontFamily: fonts.semiBold, fontSize: 15, color: colors.gray[900] }}>
                        ${specialItemPrice.toFixed(2)}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: colors.gray[600] }}>
                        {t.calculator.serviceFeeLabel}
                      </Text>
                      <Text style={{ fontFamily: fonts.semiBold, fontSize: 15, color: colors.gray[900] }}>
                        ${serviceFee.toFixed(2)}
                      </Text>
                    </View>
                  </>
                )}

                <View style={{ height: 2, backgroundColor: colors.gray[200], marginVertical: spacing.sm, borderRadius: 1 }} />

                {/* Total with Gradient Background */}
                <LinearGradient
                  colors={isDark ? [colors.primary[900], colors.primary[800]] : [colors.primary[50], colors.green[50]]}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: spacing.md,
                    borderRadius: borderRadius.lg,
                    marginTop: spacing.xs,
                  }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={{ fontFamily: fonts.bold, fontSize: 17, color: colors.gray[900] }}>
                    {t.calculator.total}
                  </Text>
                  <Text style={{ fontFamily: fonts.headingBold, fontSize: 36, color: isDark ? colors.primary[400] : colors.primary[600] }}>
                    ${total.toFixed(2)}
                  </Text>
                </LinearGradient>
              </View>

              {/* Delivery Time */}
              {deliveryDays && calculationType === 'weight' && (
                <View style={{ marginTop: spacing.lg, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: card.borderColor }}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.sm,
                    backgroundColor: isDark ? colors.gray[200] : colors.green[50],
                    padding: spacing.md,
                    borderRadius: borderRadius.md,
                    borderWidth: 1,
                    borderColor: isDark ? colors.emerald[600] : colors.green[100],
                  }}>
                    <Clock size={18} color={colors.emerald[500]} />
                    <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.gray[700] }}>
                      {t.calculator.estimatedDelivery}:
                    </Text>
                    <Text style={{ fontFamily: fonts.bold, fontSize: 14, color: colors.emerald[600] }}>
                      {deliveryDays} {t.calculator.days}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    overflow: 'hidden',
  },
  headerIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  card: {
    overflow: 'hidden',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
  },
});
