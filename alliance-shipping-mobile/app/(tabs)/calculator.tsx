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
  const { t } = useTranslation();
  const { colors, fonts, spacing, borderRadius, shadows, card, isDark } = useTheme();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userCity, setUserCity] = useState<CityPricing | null>(null);
  const [weight, setWeight] = useState(1);
  const [hasPerfume, setHasPerfume] = useState(false);
  const [specialItems, setSpecialItems] = useState<SpecialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Animated values
  const weightScale = useSharedValue(1);

  // Fetch user profile and pricing
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
          const pricingRes = await api.get<{ cities: CityPricing[] }>('/api/pricing/all');
          const cityData = pricingRes.cities?.find((c: CityPricing) => c.city === profileRes.user.city);
          if (cityData) {
            setUserCity(cityData);
          }
        }

        if (itemsRes.items) {
          setSpecialItems(itemsRes.items.filter(item => item.isActive));
        }
      } catch (error) {
        console.error('Error loading calculator data:', error);
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
  const total = serviceFee + weightCost;

  const deliveryDays = userCity
    ? hasPerfume
      ? `${userCity.perfumeDaysMin}-${userCity.perfumeDaysMax}`
      : `${userCity.deliveryDaysMin}-${userCity.deliveryDaysMax}`
    : '';

  // Group special items by category
  const itemsByCategory = specialItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, SpecialItem[]>);

  // Scroll content style with dynamic bottom padding
  const scrollContentStyle = {
    paddingBottom: Math.max(100, insets.bottom + 80), // Account for tab bar + safe area
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={{ fontFamily: fonts.medium, color: colors.gray[600], marginTop: spacing.md }}>
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
                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary[50], alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg }}>
                  <LogIn size={40} color={colors.primary[600]} />
                </View>
                <Text style={{ fontFamily: fonts.bold, fontSize: 20, color: colors.gray[900], textAlign: 'center', marginBottom: spacing.sm }}>
                  {t.calculator.loginRequired || 'Connexion requise'}
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: colors.gray[600], textAlign: 'center', marginBottom: spacing.xl, lineHeight: 20 }}>
                  {t.calculator.loginMessage || 'Connectez-vous pour calculer vos tarifs basés sur votre ville de destination'}
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/sign-in')}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.primary[600], paddingVertical: spacing.md, paddingHorizontal: spacing.xl, borderRadius: borderRadius.lg }}
                >
                  <User size={20} color={colors.white} />
                  <Text style={{ fontFamily: fonts.semiBold, fontSize: 16, color: colors.white }}>
                    {t.calculator.login || 'Se connecter'}
                  </Text>
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
          <View style={[styles.card, { backgroundColor: card.backgroundColor, borderRadius: borderRadius.xl, padding: spacing.lg, marginHorizontal: spacing.xl, marginTop: spacing.lg, ...shadows.sm }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary[50], alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={20} color={colors.primary[600]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.gray[500] }}>
                  {t.calculator.yourDestination || 'Votre destination'}
                </Text>
                <Text style={{ fontFamily: fonts.bold, fontSize: 18, color: colors.gray[900] }}>
                  {CITY_EMOJI[userCity.city] || '📍'} {userCity.city}
                </Text>
              </View>
            </View>

            {/* Pricing Info */}
            <View style={{ backgroundColor: isDark ? colors.green[900] : colors.green[50], borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: isDark ? colors.green[800] : colors.green[100] }}>
              <Text style={{ fontFamily: fonts.semiBold, fontSize: 13, color: isDark ? colors.green[300] : colors.green[700] }}>
                💵 Service: ${serviceFee.toFixed(2)} • Par lb: ${pricePerLb.toFixed(2)}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Weight Input */}
        <Animated.View entering={FadeInDown.delay(120).duration(500)}>
          <View style={[styles.card, { backgroundColor: card.backgroundColor, borderRadius: borderRadius.xl, padding: spacing.lg, marginHorizontal: spacing.xl, marginTop: spacing.lg, ...shadows.sm }]}>
            <View style={[styles.cardHeaderRow, { gap: spacing.sm, marginBottom: spacing.md }]}>
              <Weight size={16} color={colors.primary[500]} />
              <Text style={[styles.cardTitle, { fontFamily: fonts.semiBold, color: colors.gray[800] }]}>
                {t.calculator.weightLabel}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <TouchableOpacity
                onPress={() => handleWeightChange(-1)}
                disabled={weight <= MIN_WEIGHT}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: borderRadius.lg,
                  borderWidth: 1.5,
                  borderColor: weight <= MIN_WEIGHT ? card.borderColor : colors.primary[500],
                  backgroundColor: weight <= MIN_WEIGHT ? colors.gray[50] : card.backgroundColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Minus size={20} color={weight <= MIN_WEIGHT ? colors.gray[400] : colors.primary[600]} />
              </TouchableOpacity>

              <Animated.View style={[{ flex: 1, alignItems: 'center' }, weightAnimatedStyle]}>
                <Text style={{ fontFamily: fonts.headingBold, fontSize: 48, color: colors.primary[600] }}>
                  {weight}
                </Text>
                <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: colors.gray[500], marginTop: -spacing.xs }}>
                  {t.calculator.lbsUnit}
                </Text>
              </Animated.View>

              <TouchableOpacity
                onPress={() => handleWeightChange(1)}
                disabled={weight >= MAX_WEIGHT}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: borderRadius.lg,
                  borderWidth: 1.5,
                  borderColor: weight >= MAX_WEIGHT ? card.borderColor : colors.primary[500],
                  backgroundColor: weight >= MAX_WEIGHT ? colors.gray[50] : card.backgroundColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Plus size={20} color={weight >= MAX_WEIGHT ? colors.gray[400] : colors.primary[600]} />
              </TouchableOpacity>
            </View>

            {/* Perfume Toggle */}
            <View style={{ marginTop: spacing.lg, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: card.borderColor }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}>
                  <Droplets size={16} color={colors.purple[500]} />
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
                  trackColor={{ false: colors.gray[200], true: colors.purple[200] }}
                  thumbColor={hasPerfume ? colors.purple[600] : colors.gray[400]}
                />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Pricing Breakdown */}
        <Animated.View entering={FadeInDown.delay(180).duration(500)}>
          <View style={[styles.card, { backgroundColor: card.backgroundColor, borderRadius: borderRadius.xl, padding: spacing.lg, marginHorizontal: spacing.xl, marginTop: spacing.lg, ...shadows.sm }]}>
            <View style={[styles.cardHeaderRow, { gap: spacing.sm, marginBottom: spacing.md }]}>
              <DollarSign size={16} color={colors.primary[500]} />
              <Text style={[styles.cardTitle, { fontFamily: fonts.semiBold, color: colors.gray[800] }]}>
                {t.calculator.breakdown}
              </Text>
            </View>

            <View style={{ gap: spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: colors.gray[600] }}>
                  {t.calculator.serviceFeeLabel}
                </Text>
                <Text style={{ fontFamily: fonts.semiBold, fontSize: 14, color: colors.gray[900] }}>
                  ${serviceFee.toFixed(2)}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: colors.gray[600] }}>
                  {weight} lbs × ${pricePerLb.toFixed(2)}
                </Text>
                <Text style={{ fontFamily: fonts.semiBold, fontSize: 14, color: colors.gray[900] }}>
                  ${weightCost.toFixed(2)}
                </Text>
              </View>

              <View style={{ height: 1, backgroundColor: card.borderColor, marginVertical: spacing.xs }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: colors.gray[900] }}>
                  {t.calculator.total}
                </Text>
                <Text style={{ fontFamily: fonts.headingBold, fontSize: 28, color: colors.primary[600] }}>
                  ${total.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Delivery Time */}
            {deliveryDays && (
              <View style={{ marginTop: spacing.lg, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: card.borderColor }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <Clock size={16} color={colors.emerald[500]} />
                  <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.gray[600] }}>
                    {t.calculator.estimatedDelivery}:
                  </Text>
                  <Text style={{ fontFamily: fonts.bold, fontSize: 13, color: colors.emerald[600] }}>
                    {deliveryDays} {t.calculator.days}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Special Items */}
        {Object.keys(itemsByCategory).length > 0 && (
          <Animated.View entering={FadeInDown.delay(240).duration(500)}>
            <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.xl, marginBottom: spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <Package size={18} color={colors.primary[500]} />
                <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: colors.gray[900] }}>
                  {t.calculator.specialItems || 'Articles Spéciaux'}
                </Text>
              </View>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.gray[500], marginTop: spacing.xs }}>
                {t.calculator.specialItemsDesc || 'Prix fixes pour articles spécifiques'}
              </Text>
            </View>

            <View style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xl }}>
              {Object.entries(itemsByCategory).map(([category, items]) => (
                <View key={category} style={{ marginTop: spacing.lg }}>
                  <Text style={{ fontFamily: fonts.semiBold, fontSize: 14, color: colors.gray[700], marginBottom: spacing.sm, textTransform: 'capitalize' }}>
                    {category}
                  </Text>
                  <View style={{ gap: spacing.sm }}>
                    {items.map((item) => {
                      const modelRange = item.minModel && item.maxModel ? `${item.minModel} - ${item.maxModel}` : item.minModel || item.maxModel;
                      return (
                        <View
                          key={item.id}
                          style={{
                            backgroundColor: card.backgroundColor,
                            borderRadius: borderRadius.lg,
                            padding: spacing.md,
                            ...shadows.sm,
                            borderWidth: 1,
                            borderColor: card.borderColor,
                          }}
                        >
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontFamily: fonts.semiBold, fontSize: 14, color: colors.gray[900] }}>
                                {item.brand} {item.itemName}
                              </Text>
                              {modelRange && (
                                <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.gray[400], marginTop: 2 }}>
                                  {modelRange}
                                </Text>
                              )}
                            </View>
                            <View style={{ backgroundColor: isDark ? colors.primary[900] : colors.primary[50], paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.md }}>
                              <Text style={{ fontFamily: fonts.bold, fontSize: 14, color: colors.primary[600] }}>
                                ${parseFloat(item.fixedFee).toFixed(2)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))}
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
