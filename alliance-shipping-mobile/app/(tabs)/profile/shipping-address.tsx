import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  Copy,
  Check,
  AlertTriangle,
  ShoppingCart,
  MapPin,
  Package,
  Truck,
  Phone,
} from 'lucide-react-native';
import { useTheme } from '@/lib/themes/ThemeProvider';
import { useTranslation } from '@/lib/i18n/useTranslation';

const WAREHOUSE_CODE = 'PQ-068508';
const WAREHOUSE_ADDRESS = '8298 Northwest 68th Street';
const WAREHOUSE_CITY = 'Miami';
const WAREHOUSE_STATE = 'Florida';
const WAREHOUSE_ZIP = '33195';
const WAREHOUSE_PHONE = '+1 (954) 607-8226';

export default function ShippingAddressScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useUser();
  const { colors, fonts, spacing, borderRadius, shadows, card, isDark } = useTheme();

  const [codeCopied, setCodeCopied] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);

  const firstName = user?.firstName || 'John';
  const lastName = user?.lastName || 'Doe';

  const handleCopyCode = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Clipboard.setStringAsync(WAREHOUSE_CODE);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }, []);

  const handleCopyAddress = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const copyText = `${firstName} ${WAREHOUSE_CODE}\n${WAREHOUSE_ADDRESS}\nApt: ${WAREHOUSE_CODE}\n${WAREHOUSE_CITY}, ${WAREHOUSE_STATE} ${WAREHOUSE_ZIP}`;
    await Clipboard.setStringAsync(copyText);
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 2000);
  }, [firstName]);

  const steps = [
    { icon: <ShoppingCart size={18} color={colors.primary[600]} />, text: t.profile.shippingAddress.step1 },
    { icon: <MapPin size={18} color={colors.primary[600]} />, text: t.profile.shippingAddress.step2 },
    { icon: <Package size={18} color={colors.primary[600]} />, text: t.profile.shippingAddress.step3 },
    { icon: <Truck size={18} color={colors.primary[600]} />, text: t.profile.shippingAddress.step4 },
  ];

  const ts = useMemo(() => ({
    screen: { backgroundColor: colors.background },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: card.backgroundColor,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderWidth: card.borderWidth,
      borderColor: card.borderColor,
    },
    headerTitle: {
      fontFamily: fonts.headingBold,
      fontSize: 24,
      color: colors.gray[900],
    },
    subtitle: {
      fontFamily: fonts.regular,
      fontSize: 16,
      color: colors.gray[600],
      marginBottom: spacing.xl,
      lineHeight: 22,
    },
    // Code section
    codeCard: {
      backgroundColor: card.backgroundColor,
      borderRadius: borderRadius.xl,
      padding: spacing.xl,
      marginBottom: spacing.lg,
      borderWidth: card.borderWidth,
      borderColor: card.borderColor,
      alignItems: 'center' as const,
    },
    codeLabel: {
      fontFamily: fonts.semiBold,
      fontSize: 14,
      color: colors.gray[600],
      marginBottom: spacing.sm,
    },
    codeText: {
      fontFamily: fonts.headingBold,
      fontSize: 32,
      color: colors.primary[600],
      letterSpacing: 2,
      marginBottom: spacing.sm,
    },
    codeExplanation: {
      fontFamily: fonts.regular,
      fontSize: 13,
      color: colors.gray[500],
      textAlign: 'center' as const,
      lineHeight: 18,
      marginBottom: spacing.lg,
      paddingHorizontal: spacing.md,
    },
    copyCodeButton: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      backgroundColor: isDark ? colors.gray[200] : colors.primary[50],
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.sm + 2,
      paddingHorizontal: spacing.xl,
      gap: spacing.sm,
    },
    copyCodeText: {
      fontFamily: fonts.semiBold,
      fontSize: 14,
      color: colors.primary[600],
    },
    copiedButton: {
      backgroundColor: isDark ? colors.gray[200] : colors.green[50],
    },
    copiedText: {
      color: colors.green[600],
    },
    // Address template
    templateCard: {
      backgroundColor: card.backgroundColor,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderWidth: card.borderWidth,
      borderColor: card.borderColor,
    },
    templateTitle: {
      fontFamily: fonts.headingSemiBold,
      fontSize: 17,
      color: colors.gray[900],
      marginBottom: spacing.xs,
    },
    templateNote: {
      fontFamily: fonts.regular,
      fontSize: 13,
      color: colors.gray[500],
      marginBottom: spacing.lg,
    },
    labelBox: {
      borderWidth: 1.5,
      borderStyle: 'dashed' as const,
      borderColor: isDark ? colors.gray[300] : colors.primary[100],
      borderRadius: borderRadius.lg,
      backgroundColor: isDark ? colors.gray[100] : colors.primary[50],
      padding: spacing.lg,
      marginBottom: spacing.lg,
    },
    fieldLabel: {
      fontFamily: fonts.medium,
      fontSize: 11,
      color: colors.gray[500],
      textTransform: 'uppercase' as const,
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    fieldValue: {
      fontFamily: fonts.semiBold,
      fontSize: 15,
      color: colors.gray[900],
      marginBottom: spacing.md,
    },
    fieldValueHighlight: {
      color: colors.primary[600],
      fontFamily: fonts.headingBold,
    },
    fieldDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: isDark ? colors.gray[300] : colors.primary[100],
      marginBottom: spacing.md,
    },
    copyAddressButton: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      backgroundColor: colors.primary[600],
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md + 2,
      gap: spacing.sm,
    },
    copyAddressText: {
      fontFamily: fonts.semiBold,
      fontSize: 16,
      color: colors.white,
    },
    copiedAddressButton: {
      backgroundColor: colors.green[600],
    },
    // Warning section
    warningCard: {
      backgroundColor: isDark ? colors.gray[200] : colors.yellow[50],
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: isDark ? colors.gray[300] : colors.yellow[100],
    },
    warningTitle: {
      fontFamily: fonts.headingSemiBold,
      fontSize: 15,
      color: colors.yellow[600],
      marginBottom: spacing.sm,
    },
    warningText: {
      fontFamily: fonts.medium,
      fontSize: 13,
      color: isDark ? colors.gray[600] : colors.gray[700],
      lineHeight: 19,
      marginBottom: 4,
    },
    warningTextBold: {
      fontFamily: fonts.bold,
      color: colors.gray[900],
    },
    warningDelay: {
      fontFamily: fonts.regular,
      fontSize: 13,
      color: colors.red[500],
      marginTop: spacing.sm,
      lineHeight: 18,
    },
    // How it works
    stepsCard: {
      backgroundColor: card.backgroundColor,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      borderWidth: card.borderWidth,
      borderColor: card.borderColor,
    },
    stepsTitle: {
      fontFamily: fonts.headingSemiBold,
      fontSize: 17,
      color: colors.gray[900],
      marginBottom: spacing.lg,
    },
    stepRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginBottom: spacing.md,
    },
    stepIconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark ? colors.gray[200] : colors.primary[50],
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      marginRight: spacing.md,
    },
    stepNumber: {
      fontFamily: fonts.headingBold,
      fontSize: 11,
      color: colors.primary[600],
      position: 'absolute' as const,
      top: -4,
      right: -4,
      backgroundColor: isDark ? colors.gray[300] : colors.primary[100],
      width: 18,
      height: 18,
      borderRadius: 9,
      textAlign: 'center' as const,
      lineHeight: 18,
    },
    stepText: {
      fontFamily: fonts.medium,
      fontSize: 14,
      color: colors.gray[700],
      flex: 1,
      lineHeight: 20,
    },
    stepConnector: {
      width: 1.5,
      height: 12,
      backgroundColor: isDark ? colors.gray[300] : colors.primary[100],
      marginLeft: 18,
      marginBottom: spacing.md,
    },
  }), [colors, fonts, spacing, borderRadius, shadows, isDark, card]);

  return (
    <View style={[styles.screen, ts.screen, { paddingTop: insets.top }]}>
      <Animated.View
        entering={FadeInDown.duration(400).springify().damping(18)}
        style={styles.header}
      >
        <TouchableOpacity
          style={ts.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={26} color={colors.gray[800]} />
        </TouchableOpacity>
        <Text style={ts.headerTitle}>{t.profile.shippingAddress.title}</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          entering={FadeInDown.delay(80).duration(400).springify().damping(18)}
        >
          <Text style={ts.subtitle}>{t.profile.shippingAddress.cardSubtitle}</Text>
        </Animated.View>

        {/* Code Section */}
        <Animated.View
          entering={FadeInDown.delay(120).duration(500).springify().damping(18)}
          style={ts.codeCard}
        >
          <Text style={ts.codeLabel}>{t.profile.shippingAddress.yourCode}</Text>
          <Text style={ts.codeText}>{WAREHOUSE_CODE}</Text>
          <Text style={ts.codeExplanation}>
            {t.profile.shippingAddress.codeExplanation}
          </Text>
          <TouchableOpacity
            style={[ts.copyCodeButton, codeCopied && ts.copiedButton]}
            onPress={handleCopyCode}
            activeOpacity={0.7}
          >
            {codeCopied ? (
              <Check size={16} color={colors.green[600]} />
            ) : (
              <Copy size={16} color={colors.primary[600]} />
            )}
            <Text style={[ts.copyCodeText, codeCopied && ts.copiedText]}>
              {codeCopied ? t.profile.shippingAddress.copied : t.profile.shippingAddress.copyCode}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Address Template */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500).springify().damping(18)}
          style={ts.templateCard}
        >
          <Text style={ts.templateTitle}>{t.profile.shippingAddress.addressTemplate}</Text>
          <Text style={ts.templateNote}>{t.profile.shippingAddress.templateNote}</Text>

          <View style={ts.labelBox}>
            <Text style={ts.fieldLabel}>{t.profile.shippingAddress.lastName}</Text>
            <Text style={ts.fieldValue}>{lastName}</Text>
            <View style={ts.fieldDivider} />

            <Text style={ts.fieldLabel}>{t.profile.shippingAddress.firstName}</Text>
            <Text style={ts.fieldValue}>
              {firstName}{' '}
              <Text style={ts.fieldValueHighlight}>{WAREHOUSE_CODE}</Text>
            </Text>
            <View style={ts.fieldDivider} />

            <Text style={ts.fieldLabel}>{t.profile.shippingAddress.address}</Text>
            <Text style={ts.fieldValue}>{WAREHOUSE_ADDRESS}</Text>
            <View style={ts.fieldDivider} />

            <Text style={ts.fieldLabel}>{t.profile.shippingAddress.aptSuite}</Text>
            <Text style={[ts.fieldValue, ts.fieldValueHighlight]}>{WAREHOUSE_CODE}</Text>
            <View style={ts.fieldDivider} />

            <Text style={ts.fieldLabel}>{t.profile.shippingAddress.city}</Text>
            <Text style={ts.fieldValue}>{WAREHOUSE_CITY}</Text>
            <View style={ts.fieldDivider} />

            <Text style={ts.fieldLabel}>{t.profile.shippingAddress.state}</Text>
            <Text style={ts.fieldValue}>{WAREHOUSE_STATE}</Text>
            <View style={ts.fieldDivider} />

            <Text style={ts.fieldLabel}>{t.profile.shippingAddress.zip}</Text>
            <Text style={ts.fieldValue}>{WAREHOUSE_ZIP}</Text>
            <View style={ts.fieldDivider} />

            <Text style={ts.fieldLabel}>{t.profile.shippingAddress.phone || 'Phone'}</Text>
            <Text style={[ts.fieldValue, { marginBottom: 0, color: colors.primary[600] }]}>{WAREHOUSE_PHONE}</Text>
          </View>

          <TouchableOpacity
            style={[ts.copyAddressButton, addressCopied && ts.copiedAddressButton]}
            onPress={handleCopyAddress}
            activeOpacity={0.8}
          >
            {addressCopied ? (
              <Check size={18} color={colors.white} />
            ) : (
              <Copy size={18} color={colors.white} />
            )}
            <Text style={ts.copyAddressText}>
              {addressCopied ? t.profile.shippingAddress.addressCopied : t.profile.shippingAddress.copyAddress}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Warning */}
        <Animated.View
          entering={FadeInDown.delay(280).duration(500).springify().damping(18)}
          style={ts.warningCard}
        >
          <View style={styles.warningHeader}>
            <AlertTriangle size={18} color={colors.yellow[600]} />
            <Text style={ts.warningTitle}>{t.profile.shippingAddress.warningTitle}</Text>
          </View>
          <Text style={ts.warningText}>
            {t.profile.shippingAddress.warningCodeRequired}
          </Text>
          <Text style={[ts.warningText, ts.warningTextBold]}>
            {t.profile.shippingAddress.warningIdentification}
          </Text>
          <Text style={ts.warningDelay}>
            {t.profile.shippingAddress.warningDelay}
          </Text>
        </Animated.View>

        {/* How It Works */}
        <Animated.View
          entering={FadeInDown.delay(360).duration(500).springify().damping(18)}
          style={ts.stepsCard}
        >
          <Text style={ts.stepsTitle}>{t.profile.shippingAddress.howItWorks}</Text>
          {steps.map((step, index) => (
            <View key={index}>
              <View style={ts.stepRow}>
                <View style={ts.stepIconCircle}>
                  {step.icon}
                  <Text style={ts.stepNumber}>{index + 1}</Text>
                </View>
                <Text style={ts.stepText}>{step.text}</Text>
              </View>
              {index < steps.length - 1 && <View style={ts.stepConnector} />}
            </View>
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
});
