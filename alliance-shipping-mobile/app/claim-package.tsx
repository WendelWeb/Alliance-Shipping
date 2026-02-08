import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  Package,
  MapPin,
  Check,
  Send,
} from 'lucide-react-native';
import { useTheme } from '@/lib/themes/ThemeProvider';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { api } from '@/lib/api';
import { useEffect } from 'react';

// City configuration
const CITIES = [
  { id: 'Port-au-Prince', labelKey: 'portAuPrince', subKey: 'capitale', emoji: '\uD83C\uDFDB\uFE0F' },
  { id: 'Cap-Haïtien', labelKey: 'capHaitien', subKey: 'nord', emoji: '\u2693' },
  { id: 'Port-de-Paix', labelKey: 'portDePaix', subKey: 'nordOuest', emoji: '\uD83C\uDF0A' },
] as const;

// Category configuration
const CATEGORY_CONFIG = [
  { id: 'general', emoji: '\uD83D\uDCE6' },
  { id: 'clothing', emoji: '\uD83D\uDC55' },
  { id: 'electronics', emoji: '\uD83D\uDCF1' },
  { id: 'food', emoji: '\uD83C\uDF4E' },
  { id: 'documents', emoji: '\uD83D\uDCC4' },
  { id: 'other', emoji: '\uD83C\uDFF7\uFE0F' },
] as const;

export default function ClaimPackageScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, fonts, spacing, borderRadius, shadows } = useTheme();

  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [cityPricing, setCityPricing] = useState<{ serviceFee: number; pricePerLb: number } | null>(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [requestError, setRequestError] = useState('');

  // Fetch city-specific pricing when city is selected
  useEffect(() => {
    if (selectedCity) {
      api.get<{ serviceFee: number; pricePerLb: number }>(`/api/city-pricing/${selectedCity}`)
        .then(data => {
          setCityPricing({
            serviceFee: data.serviceFee,
            pricePerLb: data.pricePerLb,
          });
        })
        .catch(err => {
          console.error('Error fetching city pricing:', err);
        });
    }
  }, [selectedCity]);

  const handleSubmitRequest = useCallback(async () => {
    setRequestError('');

    if (!trackingNumber.trim()) {
      setRequestError('\u26A0\uFE0F ' + t.requestPackage.fields.trackingNumber.required);
      return;
    }
    if (trackingNumber.trim().length < 5) {
      setRequestError('\u26A0\uFE0F ' + t.requestPackage.fields.trackingNumber.minLength);
      return;
    }
    if (!selectedCity) {
      setRequestError('\uD83D\uDCCD ' + t.requestPackage.fields.destinationCity.required);
      return;
    }
    if (!description.trim()) {
      setRequestError('\u270D\uFE0F ' + t.requestPackage.fields.description.required);
      return;
    }
    if (description.trim().length < 10) {
      setRequestError('\u270D\uFE0F ' + t.requestPackage.fields.description.minLength);
      return;
    }
    if (!category) {
      setRequestError('\uD83C\uDFF7\uFE0F ' + t.requestPackage.fields.category.required);
      return;
    }

    setRequestLoading(true);
    try {
      await api.post('/api/package-requests', {
        externalTrackingNumber: trackingNumber.trim(),
        recipientCity: selectedCity,
        description: description.trim(),
        category,
        customerNotes: customerNotes.trim() || undefined,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setRequestSuccess(true);
    } catch (err: any) {
      const raw = err?.message || t.common.error;
      if (raw.includes('Network') || raw.includes('fetch')) {
        setRequestError('\uD83D\uDCE1 ' + t.packages.networkError);
      } else {
        setRequestError('\u274C ' + raw);
      }
    } finally {
      setRequestLoading(false);
    }
  }, [trackingNumber, selectedCity, description, category, customerNotes, t]);

  const categoryLabel = useCallback(
    (cat: string): string => {
      const map: Record<string, string> = {
        general: t.requestPackage.fields.category.general,
        clothing: t.requestPackage.fields.category.clothing,
        electronics: t.requestPackage.fields.category.electronics,
        food: t.requestPackage.fields.category.food,
        documents: t.requestPackage.fields.category.documents,
        other: t.requestPackage.fields.category.other,
      };
      return map[cat] || cat;
    },
    [t],
  );

  const handleGoBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (requestSuccess) {
      router.push('/(tabs)/packages');
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={[styles.header, { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.md, borderBottomColor: colors.gray[100] }]}
      >
        <TouchableOpacity
          onPress={handleGoBack}
          hitSlop={12}
          style={[styles.backButton, { backgroundColor: colors.gray[100] }]}
        >
          <ArrowLeft size={20} color={colors.gray[700]} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.headerTitle, { fontFamily: fonts.headingBold, color: colors.gray[900] }]}>
            {'\uD83D\uDCE6'} {t.claimPackage.title}
          </Text>
          <Text style={[styles.headerSubtitle, { fontFamily: fonts.regular, color: colors.gray[500] }]}>
            {t.claimPackage.subtitle}
          </Text>
        </View>
      </Animated.View>

      {requestSuccess ? (
        /* Success view */
        <ScrollView
          contentContainerStyle={[styles.successContainer, { paddingHorizontal: spacing['2xl'] }]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(500)} style={styles.successContent}>
            <View style={[styles.successIconCircle, { backgroundColor: colors.green[50] }]}>
              <Check size={40} color={colors.green[500]} strokeWidth={3} />
            </View>
            <Text style={[styles.successTitle, { fontFamily: fonts.headingBold, color: colors.gray[900] }]}>
              {'\u2705'} {t.requestPackage.success.title}
            </Text>
            <Text style={[styles.successMessage, { fontFamily: fonts.regular, color: colors.gray[500] }]}>
              {t.requestPackage.success.message}
            </Text>

            <View style={[styles.successSteps, { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.xl, ...shadows.sm }]}>
              {(t.requestPackage.success.steps as string[]).map((step, i) => (
                <View key={i} style={[styles.successStep, { gap: spacing.sm }]}>
                  <Text style={[styles.successStepNum, { backgroundColor: colors.primary[100], color: colors.primary[700], fontFamily: fonts.bold }]}>
                    {i + 1}
                  </Text>
                  <Text style={[styles.successStepText, { fontFamily: fonts.regular, color: colors.gray[700] }]}>
                    {step}
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.successBtn, { borderRadius: borderRadius.lg }]}
              onPress={handleGoBack}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primary[500], colors.primary[700]]}
                style={[styles.successBtnGradient, { borderRadius: borderRadius.lg }]}
              >
                <Text style={[styles.successBtnText, { fontFamily: fonts.semiBold, color: colors.white }]}>
                  {t.packages.filters.all}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      ) : (
        /* Form */
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={[styles.formScroll, { padding: spacing.xl }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Explanation section */}
            <Animated.View
              entering={FadeInDown.delay(100).duration(400)}
              style={[styles.explanationCard, { backgroundColor: colors.primary[50], borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.primary[100] }]}
            >
              <View style={[styles.explanationIconCircle, { backgroundColor: colors.primary[100] }]}>
                <Package size={24} color={colors.primary[600]} />
              </View>
              <Text style={[styles.explanationQuestion, { fontFamily: fonts.headingSemiBold, color: colors.primary[900], marginBottom: spacing.sm }]}>
                {t.claimPackage.explanation.question}
              </Text>
              <Text style={[styles.explanationText, { fontFamily: fonts.regular, color: colors.primary[700], marginBottom: spacing.xs }]}>
                {t.claimPackage.explanation.addToTracking}
              </Text>
              <Text style={[styles.explanationText, { fontFamily: fonts.regular, color: colors.primary[700] }]}>
                {t.claimPackage.explanation.enterTracking}
              </Text>
            </Animated.View>

            {requestError ? (
              <Animated.View
                entering={FadeInDown.duration(300)}
                style={[styles.errorBox, { backgroundColor: colors.red[50], borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.lg, borderColor: colors.red[100] }]}
              >
                <Text style={[styles.errorText, { color: colors.red[600], fontFamily: fonts.medium }]}>
                  {requestError}
                </Text>
              </Animated.View>
            ) : null}

            {/* Tracking Number */}
            <Animated.View entering={FadeInDown.delay(200).duration(400)} style={[styles.fieldGroup, { marginBottom: spacing.xl }]}>
              <Text style={[styles.fieldLabel, { fontFamily: fonts.semiBold, color: colors.gray[700], marginBottom: spacing.sm }]}>
                {'\uD83D\uDD22'} {t.requestPackage.fields.trackingNumber.label} *
              </Text>
              <TextInput
                style={[styles.fieldInput, { backgroundColor: colors.white, borderRadius: borderRadius.lg, borderColor: colors.gray[200], paddingHorizontal: spacing.lg, paddingVertical: spacing.md + 2, fontFamily: fonts.regular, color: colors.gray[900] }]}
                value={trackingNumber}
                onChangeText={(v) => { setTrackingNumber(v); setRequestError(''); }}
                placeholder={t.requestPackage.fields.trackingNumber.placeholder}
                placeholderTextColor={colors.gray[400]}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              <Text style={[styles.fieldHelper, { fontFamily: fonts.regular, color: colors.gray[400], marginTop: spacing.xs }]}>
                {'\uD83D\uDCA1'} {t.requestPackage.fields.trackingNumber.helper}
              </Text>
            </Animated.View>

            {/* Destination City */}
            <Animated.View entering={FadeInDown.delay(260).duration(400)} style={[styles.fieldGroup, { marginBottom: spacing.xl }]}>
              <Text style={[styles.fieldLabel, { fontFamily: fonts.semiBold, color: colors.gray[700], marginBottom: spacing.sm }]}>
                {'\uD83D\uDCCD'} {t.requestPackage.fields.destinationCity.label} *
              </Text>
              <View style={[styles.cityGrid, { gap: spacing.sm }]}>
                {CITIES.map((city) => {
                  const isSelected = selectedCity === city.id;
                  const cityLabels = t.requestPackage.fields.destinationCity as Record<string, string>;
                  return (
                    <TouchableOpacity
                      key={city.id}
                      style={[
                        styles.cityChip,
                        {
                          paddingVertical: spacing.md,
                          paddingHorizontal: spacing.sm,
                          borderRadius: borderRadius.lg,
                          borderColor: isSelected ? colors.primary[500] : colors.gray[200],
                          backgroundColor: isSelected ? colors.primary[500] : colors.white,
                        },
                      ]}
                      onPress={() => { setSelectedCity(city.id); setRequestError(''); }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.cityEmoji}>{city.emoji}</Text>
                      <Text
                        style={[
                          styles.cityChipText,
                          {
                            fontFamily: fonts.semiBold,
                            color: isSelected ? colors.white : colors.gray[700],
                          },
                        ]}
                      >
                        {cityLabels[city.labelKey]}
                      </Text>
                      <Text
                        style={[
                          styles.cityChipSub,
                          {
                            fontFamily: fonts.regular,
                            color: isSelected ? 'rgba(255,255,255,0.75)' : colors.gray[400],
                          },
                        ]}
                      >
                        {cityLabels[city.subKey]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Show pricing for selected city */}
              {selectedCity && cityPricing && (
                <View style={[styles.pricingBadge, { backgroundColor: colors.green[50], borderRadius: borderRadius.md, padding: spacing.md, marginTop: spacing.md, borderWidth: 1, borderColor: colors.green[100] }]}>
                  <Text style={[styles.pricingLabel, { fontFamily: fonts.semiBold, color: colors.green[800], fontSize: 13, marginBottom: spacing.xs }]}>
                    💵 Pricing for {selectedCity}:
                  </Text>
                  <View style={{ flexDirection: 'row', gap: spacing.md }}>
                    <Text style={[styles.pricingText, { fontFamily: fonts.medium, color: colors.green[700], fontSize: 12 }]}>
                      Service Fee: ${cityPricing.serviceFee.toFixed(2)}
                    </Text>
                    <Text style={[styles.pricingText, { fontFamily: fonts.medium, color: colors.green[700], fontSize: 12 }]}>
                      Per lb: ${cityPricing.pricePerLb.toFixed(2)}
                    </Text>
                  </View>
                </View>
              )}
            </Animated.View>

            {/* Description */}
            <Animated.View entering={FadeInDown.delay(320).duration(400)} style={[styles.fieldGroup, { marginBottom: spacing.xl }]}>
              <Text style={[styles.fieldLabel, { fontFamily: fonts.semiBold, color: colors.gray[700], marginBottom: spacing.sm }]}>
                {'\u270D\uFE0F'} {t.requestPackage.fields.description.label} *
              </Text>
              <TextInput
                style={[styles.fieldInput, styles.fieldTextarea, { backgroundColor: colors.white, borderRadius: borderRadius.lg, borderColor: colors.gray[200], paddingHorizontal: spacing.lg, paddingVertical: spacing.md + 2, paddingTop: spacing.md, fontFamily: fonts.regular, color: colors.gray[900] }]}
                value={description}
                onChangeText={(v) => { setDescription(v); setRequestError(''); }}
                placeholder={t.requestPackage.fields.description.placeholder}
                placeholderTextColor={colors.gray[400]}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </Animated.View>

            {/* Category */}
            <Animated.View entering={FadeInDown.delay(380).duration(400)} style={[styles.fieldGroup, { marginBottom: spacing.xl }]}>
              <Text style={[styles.fieldLabel, { fontFamily: fonts.semiBold, color: colors.gray[700], marginBottom: spacing.sm }]}>
                {'\uD83C\uDFF7\uFE0F'} {t.requestPackage.fields.category.label} *
              </Text>
              <View style={[styles.categoryGrid, { gap: spacing.sm }]}>
                {CATEGORY_CONFIG.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryChip,
                        {
                          paddingHorizontal: spacing.md,
                          paddingVertical: spacing.sm + 2,
                          borderRadius: borderRadius.full,
                          borderColor: isSelected ? colors.primary[500] : colors.gray[200],
                          backgroundColor: isSelected ? colors.primary[500] : colors.white,
                        },
                      ]}
                      onPress={() => { setCategory(cat.id); setRequestError(''); }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                      <Text
                        style={[
                          styles.categoryChipText,
                          {
                            fontFamily: fonts.medium,
                            color: isSelected ? colors.white : colors.gray[600],
                          },
                        ]}
                      >
                        {categoryLabel(cat.id)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>

            {/* Notes */}
            <Animated.View entering={FadeInDown.delay(440).duration(400)} style={[styles.fieldGroup, { marginBottom: spacing.xl }]}>
              <Text style={[styles.fieldLabel, { fontFamily: fonts.semiBold, color: colors.gray[700], marginBottom: spacing.sm }]}>
                {'\uD83D\uDCDD'} {t.requestPackage.fields.description.sublabel}
              </Text>
              <TextInput
                style={[styles.fieldInput, styles.fieldTextarea, { backgroundColor: colors.white, borderRadius: borderRadius.lg, borderColor: colors.gray[200], paddingHorizontal: spacing.lg, paddingVertical: spacing.md + 2, paddingTop: spacing.md, fontFamily: fonts.regular, color: colors.gray[900] }]}
                value={customerNotes}
                onChangeText={setCustomerNotes}
                placeholder="..."
                placeholderTextColor={colors.gray[400]}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </Animated.View>

            {/* Submit Button */}
            <Animated.View entering={FadeInDown.delay(500).duration(400)} style={[styles.submitBtnContainer, { marginTop: spacing.lg }]}>
              <TouchableOpacity
                style={[styles.submitBtn, { borderRadius: borderRadius.lg }, requestLoading && styles.disabled]}
                onPress={handleSubmitRequest}
                disabled={requestLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.primary[500], colors.primary[700]]}
                  style={[styles.submitBtnGradient, { borderRadius: borderRadius.lg, gap: spacing.sm }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {requestLoading ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <>
                      <Send size={16} color={colors.white} />
                      <Text style={[styles.submitBtnText, { fontFamily: fonts.semiBold, color: colors.white }]}>
                        {t.requestPackage.buttons.submit}
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 18 },
  headerSubtitle: { fontSize: 13, marginTop: 2 },

  formScroll: { paddingBottom: 40 },

  explanationCard: { borderWidth: 1 },
  explanationIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  explanationQuestion: { fontSize: 16 },
  explanationText: { fontSize: 14, lineHeight: 20 },

  errorBox: { borderWidth: 1 },
  errorText: { fontSize: 13, lineHeight: 20 },

  fieldGroup: {},
  fieldLabel: { fontSize: 14 },
  fieldInput: {
    borderWidth: 1,
    fontSize: 15,
  },
  fieldTextarea: { minHeight: 80 },
  fieldHelper: { fontSize: 12 },

  cityGrid: { flexDirection: 'row' },
  cityChip: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1.5,
    gap: 4,
  },
  cityEmoji: { fontSize: 20 },
  cityChipText: { fontSize: 11, textAlign: 'center' },
  cityChipSub: { fontSize: 10 },
  pricingBadge: {},
  pricingLabel: {},
  pricingText: {},

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    gap: 6,
  },
  categoryEmoji: { fontSize: 16 },
  categoryChipText: { fontSize: 13 },

  submitBtnContainer: {},
  submitBtn: { overflow: 'hidden' },
  submitBtnGradient: {
    flexDirection: 'row',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: { fontSize: 15 },
  disabled: { opacity: 0.7 },

  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  successContent: { alignItems: 'center', width: '100%' },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: { fontSize: 20, textAlign: 'center', marginBottom: 12 },
  successMessage: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  successSteps: { width: '100%' },
  successStep: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  successStepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 24,
    overflow: 'hidden',
  },
  successStepText: { fontSize: 13, flex: 1 },
  successBtn: { overflow: 'hidden', width: 200 },
  successBtnGradient: { paddingVertical: 14, alignItems: 'center' },
  successBtnText: { fontSize: 16 },
});
