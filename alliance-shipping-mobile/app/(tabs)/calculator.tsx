import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Switch,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  Calculator,
  DollarSign,
  Weight,
  Clock,
  Info,
  Minus,
  Plus,
  Droplets,
  MapPin,
  Package,
} from 'lucide-react-native';
import { useTheme } from '@/lib/themes/ThemeProvider';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CityPricing {
  id: number;
  city: string;
  serviceFee: number;
  pricePerLb: number;
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
  fixedFee: number;
  description: string | null;
  imageUrl: string | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CITY_META: Record<string, { emoji: string; labelKey: string; subKey: string }> = {
  'Port-au-Prince': { emoji: '🏛️', labelKey: 'portAuPrince', subKey: 'capitale' },
  'Cap-Haïtien': { emoji: '⚓', labelKey: 'capHaitien', subKey: 'nord' },
  'Port-de-Paix': { emoji: '🌊', labelKey: 'portDePaix', subKey: 'nordOuest' },
};

const MIN_WEIGHT = 1;
const MAX_WEIGHT = 100;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CalculatorScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { colors, fonts, spacing, borderRadius, shadows, spring, card, isDark } = useTheme();

  const [selectedCity, setSelectedCity] = useState('');
  const [weight, setWeight] = useState(1);
  const [hasPerfume, setHasPerfume] = useState(false);
  const [cities, setCities] = useState<CityPricing[]>([]);
  const [specialItems, setSpecialItems] = useState<SpecialItem[]>([]);
  const [loadingPricing, setLoadingPricing] = useState(true);

  // Fetch all pricing + special items at mount
  useEffect(() => {
    (async () => {
      try {
        const [pricingRes, itemsRes, profileRes] = await Promise.all([
          api.get<{ cities: CityPricing[] }>('/api/pricing/all'),
          api.get<{ items: SpecialItem[] }>('/api/special-items/public').catch(() => ({ items: [] })),
          api.get<{ success: boolean; user: any }>('/api/user/profile').catch(() => ({ user: null })),
        ]);
        if (pricingRes.cities) setCities(pricingRes.cities);
        if (itemsRes.items) setSpecialItems(itemsRes.items);
        // Auto-select user's city
        if (profileRes.user?.city && pricingRes.cities?.some((c: CityPricing) => c.city === profileRes.user.city)) {
          setSelectedCity(profileRes.user.city);
        }
      } catch (error) {
        console.error('Error loading pricing:', error);
      } finally {
        setLoadingPricing(false);
      }
    })();
  }, []);

  // Current city pricing
  const currentCity = cities.find((c) => c.city === selectedCity);
  const serviceFee = currentCity?.serviceFee ?? 5;
  const pricePerLb = currentCity?.pricePerLb ?? 4;
  const deliveryDays = currentCity
    ? (hasPerfume
        ? `${currentCity.perfumeDaysMin}-${currentCity.perfumeDaysMax}`
        : `${currentCity.deliveryDaysMin}-${currentCity.deliveryDaysMax}`)
    : (hasPerfume ? '8-11' : '3-6');

  // Animated values
  const weightScale = useSharedValue(1);
  const totalScale = useSharedValue(1);

  // -------------------------------------------------------------------------
  // Derived pricing
  // -------------------------------------------------------------------------

  const weightCost = weight * pricePerLb;
  const total = serviceFee + weightCost;

  // -------------------------------------------------------------------------
  // Animated styles
  // -------------------------------------------------------------------------

  const weightAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: weightScale.value }],
  }));

  const totalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: totalScale.value }],
  }));

  // -------------------------------------------------------------------------
  // Weight stepper handlers
  // -------------------------------------------------------------------------

  const animateWeight = useCallback(() => {
    weightScale.value = withSpring(1.15, spring.bouncy);
    setTimeout(() => {
      weightScale.value = withSpring(1, spring.gentle);
    }, 120);
  }, [weightScale, spring]);

  const animateTotal = useCallback(() => {
    totalScale.value = withSpring(1.06, spring.snappy);
    setTimeout(() => {
      totalScale.value = withSpring(1, spring.gentle);
    }, 150);
  }, [totalScale, spring]);

  const decrement = useCallback(() => {
    if (weight <= MIN_WEIGHT) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setWeight((prev) => prev - 1);
    animateWeight();
    animateTotal();
  }, [weight, animateWeight, animateTotal]);

  const increment = useCallback(() => {
    if (weight >= MAX_WEIGHT) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setWeight((prev) => prev + 1);
    animateWeight();
    animateTotal();
  }, [weight, animateWeight, animateTotal]);

  const togglePerfume = useCallback(
    (value: boolean) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setHasPerfume(value);
      animateTotal();
    },
    [animateTotal],
  );

  // -------------------------------------------------------------------------
  // Format currency
  // -------------------------------------------------------------------------

  const formatCurrency = (amount: number): string =>
    `$${amount.toFixed(2)}`;

  // -------------------------------------------------------------------------
  // Group special items by category
  // -------------------------------------------------------------------------

  const itemsByCategory = specialItems.reduce<Record<string, SpecialItem[]>>((acc, item) => {
    const cat = item.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const cityLabels = t.requestPackage?.fields?.destinationCity as Record<string, string> || {};

  if (loadingPricing) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ---- Gradient header card ---- */}
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
              <Text style={[styles.headerTitle, { fontFamily: fonts.headingBold, color: colors.white }]}>{t.calculator.title}</Text>
            </View>
            <Text style={[styles.headerSubtitle, { fontFamily: fonts.regular }]}>{t.calculator.subtitle}</Text>
          </LinearGradient>
        </Animated.View>

        {/* ---- City Selection (FIRST) ---- */}
        <Animated.View entering={FadeInDown.delay(60).duration(500)}>
          <View style={[styles.card, { backgroundColor: card.backgroundColor, borderRadius: borderRadius.xl, padding: spacing.lg, marginHorizontal: spacing.xl, marginTop: spacing.lg, ...shadows.sm }]}>
            <View style={[styles.cardHeaderRow, { gap: spacing.sm, marginBottom: spacing.md }]}>
              <MapPin size={16} color={colors.primary[500]} />
              <Text style={[styles.cardTitle, { fontFamily: fonts.semiBold, color: colors.gray[800] }]}>
                {t.calculator.selectCity} *
              </Text>
            </View>

            <View style={[styles.cityGrid, { gap: spacing.sm }]}>
              {cities.map((city) => {
                const isSelected = selectedCity === city.city;
                const meta = CITY_META[city.city] || { emoji: '📍', labelKey: '', subKey: '' };
                return (
                  <TouchableOpacity
                    key={city.id}
                    style={[
                      styles.cityChip,
                      {
                        paddingVertical: spacing.md,
                        paddingHorizontal: spacing.sm,
                        borderRadius: borderRadius.lg,
                        borderColor: isSelected ? colors.primary[500] : card.borderColor,
                        backgroundColor: isSelected ? colors.primary[500] : card.backgroundColor,
                        borderWidth: 1.5,
                        flex: 1,
                        alignItems: 'center',
                      },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedCity(city.city);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cityEmoji}>{meta.emoji}</Text>
                    <Text
                      style={[
                        styles.cityChipText,
                        {
                          fontFamily: fonts.semiBold,
                          color: isSelected ? colors.white : colors.gray[700],
                        },
                      ]}
                    >
                      {cityLabels[meta.labelKey] || city.city}
                    </Text>
                    {meta.subKey ? (
                      <Text
                        style={[
                          styles.cityChipSub,
                          {
                            fontFamily: fonts.regular,
                            color: isSelected ? 'rgba(255,255,255,0.75)' : colors.gray[400],
                          },
                        ]}
                      >
                        {cityLabels[meta.subKey] || ''}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedCity && currentCity && (
              <View style={[styles.pricingBadge, { backgroundColor: isDark ? colors.green[900] : colors.green[50], borderRadius: borderRadius.md, padding: spacing.sm, marginTop: spacing.md, borderWidth: 1, borderColor: isDark ? colors.green[800] : colors.green[100] }]}>
                <Text style={[styles.pricingBadgeText, { fontFamily: fonts.medium, color: isDark ? colors.green[300] : colors.green[700], fontSize: 12 }]}>
                  💵 {t.calculator.serviceFeeLabel}: ${serviceFee.toFixed(2)} | {t.calculator.perLbLabel}: ${pricePerLb.toFixed(2)}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* ---- Pricing info card ---- */}
        <Animated.View entering={FadeInDown.delay(80).duration(500)}>
          <View style={[styles.card, { backgroundColor: card.backgroundColor, borderRadius: borderRadius.xl, padding: spacing.lg, marginHorizontal: spacing.xl, marginTop: spacing.lg, ...shadows.sm }]}>
            <View style={[styles.cardHeaderRow, { gap: spacing.sm, marginBottom: spacing.md }]}>
              <Info size={16} color={colors.primary[500]} />
              <Text style={[styles.cardTitle, { fontFamily: fonts.semiBold, color: colors.gray[800] }]}>{t.calculator.pricing.title}</Text>
            </View>
            <View style={[styles.pricingList, { gap: spacing.sm }]}>
              <View style={[styles.pricingRow, { gap: spacing.sm }]}>
                <View style={[styles.pricingDot, { backgroundColor: colors.primary[500] }]} />
                <Text style={[styles.pricingText, { fontFamily: fonts.regular, color: colors.gray[600] }]}>{t.calculator.pricing.serviceFee}</Text>
              </View>
              <View style={[styles.pricingRow, { gap: spacing.sm }]}>
                <View style={[styles.pricingDot, { backgroundColor: colors.primary[500] }]} />
                <Text style={[styles.pricingText, { fontFamily: fonts.regular, color: colors.gray[600] }]}>{t.calculator.pricing.perPound}</Text>
              </View>
              <View style={[styles.pricingRow, { gap: spacing.sm }]}>
                <View style={[styles.pricingDot, { backgroundColor: colors.yellow[500] }]} />
                <Text style={[styles.pricingText, { fontFamily: fonts.regular, color: colors.gray[600] }]}>{t.calculator.pricing.example}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ---- Weight stepper section ---- */}
        <Animated.View entering={FadeInDown.delay(160).duration(500)}>
          <View style={[styles.card, { backgroundColor: card.backgroundColor, borderRadius: borderRadius.xl, padding: spacing.lg, marginHorizontal: spacing.xl, marginTop: spacing.lg, ...shadows.sm, opacity: selectedCity ? 1 : 0.5 }]}>
            <View style={[styles.cardHeaderRow, { gap: spacing.sm, marginBottom: spacing.md }]}>
              <Weight size={16} color={colors.primary[500]} />
              <Text style={[styles.cardTitle, { fontFamily: fonts.semiBold, color: colors.gray[800] }]}>{t.calculator.weightLabel}</Text>
            </View>

            <View style={[styles.stepperContainer, { paddingVertical: spacing.xl, gap: spacing['3xl'] }]}>
              {/* Minus button */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={decrement}
                disabled={weight <= MIN_WEIGHT || !selectedCity}
                style={[
                  styles.stepperButton,
                  {
                    borderColor: (weight <= MIN_WEIGHT || !selectedCity) ? card.borderColor : colors.primary[500],
                    backgroundColor: (weight <= MIN_WEIGHT || !selectedCity) ? colors.gray[50] : card.backgroundColor,
                  },
                ]}
              >
                <Minus
                  size={22}
                  color={
                    (weight <= MIN_WEIGHT || !selectedCity)
                      ? colors.gray[300]
                      : colors.primary[600]
                  }
                  strokeWidth={2.5}
                />
              </TouchableOpacity>

              {/* Weight display */}
              <View style={styles.weightDisplay}>
                <Animated.Text style={[styles.weightValue, { fontFamily: fonts.headingBold, color: colors.gray[900] }, weightAnimatedStyle]}>
                  {weight}
                </Animated.Text>
                <Text style={[styles.weightUnit, { fontFamily: fonts.medium, color: colors.gray[400] }]}>{t.calculator.lbs}</Text>
              </View>

              {/* Plus button */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={increment}
                disabled={weight >= MAX_WEIGHT || !selectedCity}
                style={[
                  styles.stepperButton,
                  {
                    borderColor: (weight >= MAX_WEIGHT || !selectedCity) ? card.borderColor : colors.primary[500],
                    backgroundColor: (weight >= MAX_WEIGHT || !selectedCity) ? colors.gray[50] : card.backgroundColor,
                  },
                ]}
              >
                <Plus
                  size={22}
                  color={
                    (weight >= MAX_WEIGHT || !selectedCity)
                      ? colors.gray[300]
                      : colors.primary[600]
                  }
                  strokeWidth={2.5}
                />
              </TouchableOpacity>
            </View>

            {!selectedCity && (
              <View style={{ alignItems: 'center', marginTop: spacing.md }}>
                <Text style={[styles.disabledText, { fontFamily: fonts.regular, color: colors.gray[400], fontSize: 12 }]}>
                  ⬆️ {t.calculator.selectCity}
                </Text>
              </View>
            )}

            {/* Weight range indicator */}
            <View style={[styles.rangeRow, { gap: spacing.sm }]}>
              <Text style={[styles.rangeText, { fontFamily: fonts.regular, color: colors.gray[400] }]}>{MIN_WEIGHT} lbs</Text>
              <View style={[styles.rangeBar, { backgroundColor: colors.gray[100] }]}>
                <View
                  style={[
                    styles.rangeFill,
                    {
                      backgroundColor: colors.primary[500],
                      width: `${((weight - MIN_WEIGHT) / (MAX_WEIGHT - MIN_WEIGHT)) * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.rangeText, { fontFamily: fonts.regular, color: colors.gray[400] }]}>{MAX_WEIGHT} lbs</Text>
            </View>
          </View>
        </Animated.View>

        {/* ---- Perfume toggle ---- */}
        <Animated.View entering={FadeInDown.delay(240).duration(500)}>
          <View style={[styles.card, { backgroundColor: card.backgroundColor, borderRadius: borderRadius.xl, padding: spacing.lg, marginHorizontal: spacing.xl, marginTop: spacing.lg, ...shadows.sm }]}>
            <View style={styles.perfumeRow}>
              <View style={[styles.perfumeLeft, { marginRight: spacing.md }]}>
                <View style={[styles.perfumeIconCircle, { backgroundColor: isDark ? colors.purple[900] : colors.purple[50], marginRight: spacing.md }]}>
                  <Droplets size={18} color={isDark ? colors.purple[400] : colors.purple[500]} />
                </View>
                <View style={styles.perfumeTextGroup}>
                  <Text style={[styles.perfumeLabel, { fontFamily: fonts.semiBold, color: colors.gray[800] }]}>
                    {t.calculator.perfumeLabel}
                  </Text>
                  <Text style={[styles.perfumeNote, { fontFamily: fonts.regular, color: colors.gray[500] }]}>
                    {t.calculator.perfumeNote}
                  </Text>
                </View>
              </View>
              <Switch
                value={hasPerfume}
                onValueChange={togglePerfume}
                trackColor={{
                  false: colors.gray[200],
                  true: colors.primary[300],
                }}
                thumbColor={hasPerfume ? colors.primary[600] : colors.gray[50]}
                ios_backgroundColor={colors.gray[200]}
              />
            </View>
          </View>
        </Animated.View>

        {/* ---- Result card ---- */}
        <Animated.View entering={FadeInDown.delay(320).duration(500)}>
          <View style={[styles.resultCard, { backgroundColor: card.backgroundColor, borderRadius: borderRadius.xl, padding: spacing.xl, marginHorizontal: spacing.xl, marginTop: spacing.xl, borderColor: colors.primary[100], ...shadows.md }]}>
            {/* City indicator */}
            {selectedCity && (
              <View style={[styles.resultRow, { paddingVertical: spacing.xs, backgroundColor: isDark ? colors.primary[900] : colors.primary[50], borderRadius: borderRadius.md, paddingHorizontal: spacing.md, marginBottom: spacing.md }]}>
                <View style={[styles.resultLabelRow, { gap: spacing.xs }]}>
                  <MapPin size={14} color={isDark ? colors.primary[400] : colors.primary[600]} />
                  <Text style={[styles.resultLabel, { fontFamily: fonts.medium, color: isDark ? colors.primary[200] : colors.primary[700] }]}>
                    📍 {selectedCity}
                  </Text>
                </View>
              </View>
            )}

            {/* Service fee row */}
            <View style={[styles.resultRow, { paddingVertical: spacing.sm }]}>
              <View style={[styles.resultLabelRow, { gap: spacing.sm }]}>
                <DollarSign size={14} color={colors.gray[500]} />
                <Text style={[styles.resultLabel, { fontFamily: fonts.regular, color: colors.gray[600] }]}>
                  {t.calculator.result.serviceFee}
                </Text>
              </View>
              <Text style={[styles.resultValue, { fontFamily: fonts.semiBold, color: colors.gray[800] }]}>{formatCurrency(serviceFee)}</Text>
            </View>

            {/* Weight cost row */}
            <View style={[styles.resultRow, { paddingVertical: spacing.sm }]}>
              <View style={[styles.resultLabelRow, { gap: spacing.sm }]}>
                <Weight size={14} color={colors.gray[500]} />
                <Text style={[styles.resultLabel, { fontFamily: fonts.regular, color: colors.gray[600] }]}>
                  {t.calculator.result.weightCost}
                </Text>
              </View>
              <Text style={[styles.resultValue, { fontFamily: fonts.semiBold, color: colors.gray[800] }]}>{formatCurrency(weightCost)}</Text>
            </View>

            {/* Divider */}
            <View style={[styles.resultDivider, { backgroundColor: colors.gray[100], marginVertical: spacing.sm }]} />

            {/* Total row */}
            <View style={styles.resultRowTotal}>
              <Text style={[styles.resultTotalLabel, { fontFamily: fonts.headingSemiBold, color: colors.gray[900] }]}>
                {t.calculator.result.total}
              </Text>
              <Animated.Text style={[styles.resultTotalValue, { fontFamily: fonts.headingBold, color: colors.primary[600] }, totalAnimatedStyle]}>
                {formatCurrency(total)}
              </Animated.Text>
            </View>

            {/* Delivery time */}
            <View style={[styles.deliveryRow, { marginTop: spacing.md }]}>
              <View style={[styles.deliveryBadge, { backgroundColor: isDark ? colors.primary[900] : colors.primary[50], paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, gap: spacing.xs }]}>
                <Clock size={13} color={isDark ? colors.primary[400] : colors.primary[600]} />
                <Text style={[styles.deliveryText, { fontFamily: fonts.medium, color: isDark ? colors.primary[200] : colors.primary[600] }]}>
                  {t.calculator.result.deliveryTime}: {deliveryDays} {t.calculator.result.days}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ---- Special Items Section ---- */}
        {specialItems.length > 0 && (
          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <View style={[styles.card, { backgroundColor: card.backgroundColor, borderRadius: borderRadius.xl, padding: spacing.lg, marginHorizontal: spacing.xl, marginTop: spacing.xl, ...shadows.sm }]}>
              <View style={[styles.cardHeaderRow, { gap: spacing.sm, marginBottom: spacing.md }]}>
                <Package size={16} color={colors.primary[500]} />
                <Text style={[styles.cardTitle, { fontFamily: fonts.semiBold, color: colors.gray[800] }]}>
                  Special Items
                </Text>
              </View>
              <Text style={{ fontFamily: fonts.regular, color: colors.gray[500], fontSize: 12, marginBottom: spacing.md }}>
                Fixed fees for specific items (separate from weight pricing)
              </Text>

              {Object.entries(itemsByCategory).map(([category, items]) => (
                <View key={category} style={{ marginBottom: spacing.md }}>
                  <Text style={{ fontFamily: fonts.semiBold, fontSize: 13, color: colors.primary[600], marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {category}
                  </Text>
                  {items.map((item) => (
                    <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.gray[100] }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: colors.gray[800] }}>
                          {item.brand ? `${item.brand} ` : ''}{item.itemName}
                        </Text>
                        {(item.minModel || item.maxModel) && (
                          <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.gray[400] }}>
                            {item.minModel && item.maxModel ? `${item.minModel} - ${item.maxModel}` : item.minModel || item.maxModel}
                          </Text>
                        )}
                      </View>
                      <View style={{ backgroundColor: isDark ? colors.primary[900] : colors.primary[50], paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.md }}>
                        <Text style={{ fontFamily: fonts.bold, fontSize: 14, color: colors.primary[600] }}>
                          ${item.fixedFee.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles (layout-only; color-dependent styles are inline)
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // ----- Header card -----
  headerCard: {},
  headerIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },

  // ----- Card (generic) -----
  card: {},
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
  },

  // ----- Pricing info -----
  pricingList: {},
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pricingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pricingText: {
    fontSize: 14,
    lineHeight: 20,
  },

  // ----- Weight stepper -----
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weightDisplay: {
    alignItems: 'center',
    minWidth: 80,
  },
  weightValue: {
    fontSize: 48,
    lineHeight: 56,
  },
  weightUnit: {
    fontSize: 14,
    marginTop: 2,
  },
  disabledText: {},

  // ----- Range indicator -----
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rangeBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  rangeFill: {
    height: 4,
    borderRadius: 2,
  },
  rangeText: {
    fontSize: 11,
    minWidth: 38,
    textAlign: 'center',
  },

  // ----- Perfume toggle -----
  perfumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  perfumeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  perfumeIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  perfumeTextGroup: {
    flex: 1,
  },
  perfumeLabel: {
    fontSize: 14,
  },
  perfumeNote: {
    fontSize: 12,
    marginTop: 2,
  },

  // ----- Result card -----
  resultCard: {
    borderWidth: 1,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultRowTotal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 14,
  },
  resultValue: {
    fontSize: 15,
  },
  resultDivider: {
    height: 1,
  },
  resultTotalLabel: {
    fontSize: 16,
  },
  resultTotalValue: {
    fontSize: 28,
    lineHeight: 34,
  },
  deliveryRow: {
    alignItems: 'flex-start',
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryText: {
    fontSize: 13,
  },

  // ----- City selection (horizontal) -----
  cityGrid: {
    flexDirection: 'row',
  },
  cityChip: {
    minWidth: 100,
  },
  cityEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  cityChipText: {
    fontSize: 13,
    marginBottom: 2,
    textAlign: 'center',
  },
  cityChipSub: {
    fontSize: 10,
    textAlign: 'center',
  },

  // ----- Pricing badge -----
  pricingBadge: {},
  pricingBadgeText: {},
});
