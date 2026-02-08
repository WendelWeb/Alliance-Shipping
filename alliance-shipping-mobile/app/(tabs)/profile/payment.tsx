import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  Star,
  Trash2,
  Plus,
  Info,
} from 'lucide-react-native';
import { useTheme } from '@/lib/themes/ThemeProvider';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface PaymentMethod {
  id: string;
  type: 'moncash' | 'natcash' | 'card';
  display: string;
  isDefault: boolean;
}

const initialMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'moncash',
    display: '+509 3456 7890',
    isDefault: true,
  },
  {
    id: '2',
    type: 'card',
    display: '**** **** **** 4532',
    isDefault: false,
  },
];

export default function PaymentScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, fonts, spacing, borderRadius, shadows } = useTheme();

  const [methods, setMethods] = useState<PaymentMethod[]>(initialMethods);

  function getTypeIcon(type: string) {
    switch (type) {
      case 'moncash':
      case 'natcash':
        return <Smartphone size={20} color={colors.primary[600]} />;
      case 'card':
        return <CreditCard size={20} color={colors.purple[600]} />;
      default:
        return <CreditCard size={20} color={colors.gray[500]} />;
    }
  }

  function getTypeBgColor(type: string) {
    switch (type) {
      case 'moncash':
        return colors.primary[50];
      case 'natcash':
        return colors.green[50];
      case 'card':
        return colors.purple[50];
      default:
        return colors.gray[50];
    }
  }

  function getTypeLabel(type: string) {
    switch (type) {
      case 'moncash':
        return 'Moncash';
      case 'natcash':
        return 'Natcash';
      case 'card':
        return 'Card';
      default:
        return type;
    }
  }

  const handleDelete = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(t.profile.payment.delete, '', [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: () => {
          setMethods((prev) => prev.filter((m) => m.id !== id));
        },
      },
    ]);
  };

  const handleSetDefault = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMethods((prev) =>
      prev.map((m) => ({
        ...m,
        isDefault: m.id === id,
      }))
    );
  };

  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(t.profile.payment.addMethod, '', [{ text: 'OK' }]);
  };

  const themedStyles = useMemo(() => ({
    screen: { backgroundColor: colors.background },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.gray[100],
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    headerTitle: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.gray[900] },
    subtitle: { fontFamily: fonts.regular, fontSize: 14, color: colors.gray[500], marginBottom: spacing.xl },
    emptyCard: {
      backgroundColor: colors.white,
      borderRadius: borderRadius.xl,
      padding: spacing['3xl'],
      alignItems: 'center' as const,
      marginBottom: spacing.xl,
      ...shadows.md,
    },
    emptyIconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.gray[100],
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      marginBottom: spacing.lg,
    },
    emptyTitle: { fontFamily: fonts.headingSemiBold, fontSize: 16, color: colors.gray[800], marginBottom: spacing.xs },
    emptyDesc: { fontFamily: fonts.regular, fontSize: 13, color: colors.gray[400], textAlign: 'center' as const },
    methodCard: {
      backgroundColor: colors.white,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      marginBottom: spacing.md,
      ...shadows.sm,
    },
    methodType: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.gray[900] },
    defaultBadge: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      backgroundColor: colors.yellow[50],
      borderRadius: borderRadius.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      gap: 4,
    },
    defaultBadgeText: { fontFamily: fonts.semiBold, fontSize: 11, color: colors.yellow[600] },
    methodDisplay: { fontFamily: fonts.regular, fontSize: 14, color: colors.gray[500], marginTop: 2 },
    methodActions: {
      flexDirection: 'row' as const,
      borderTopWidth: 1,
      borderTopColor: colors.gray[100],
      paddingTop: spacing.md,
      gap: spacing.xl,
    },
    actionTextYellow: { fontFamily: fonts.medium, fontSize: 13, color: colors.yellow[600] },
    actionTextRed: { fontFamily: fonts.medium, fontSize: 13, color: colors.red[500] },
    addButton: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      backgroundColor: colors.primary[600],
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md + 2,
      gap: spacing.sm,
      marginTop: spacing.sm,
      marginBottom: spacing.xl,
    },
    addButtonText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.white },
    infoCard: {
      backgroundColor: colors.primary[50],
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.primary[100],
      ...shadows.sm,
    },
    infoTitle: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.primary[700] },
    infoText: { fontFamily: fonts.regular, fontSize: 13, color: colors.gray[700], flex: 1 },
  }), [colors, fonts, spacing, borderRadius, shadows]);

  return (
    <View style={[styles.screen, themedStyles.screen, { paddingTop: insets.top }]}>
      <Animated.View
        entering={FadeInDown.duration(400).springify().damping(18)}
        style={styles.header}
      >
        <TouchableOpacity
          style={themedStyles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={colors.gray[800]} />
        </TouchableOpacity>
        <Text style={themedStyles.headerTitle}>{t.profile.payment.title}</Text>
        <View style={themedStyles.backButton} />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          entering={FadeInDown.delay(80).duration(400).springify().damping(18)}
        >
          <Text style={themedStyles.subtitle}>{t.profile.payment.subtitle}</Text>
        </Animated.View>

        {methods.length === 0 ? (
          <Animated.View
            entering={FadeInDown.delay(150).duration(500).springify().damping(18)}
            style={themedStyles.emptyCard}
          >
            <View style={themedStyles.emptyIconCircle}>
              <CreditCard size={32} color={colors.gray[400]} />
            </View>
            <Text style={themedStyles.emptyTitle}>{t.profile.payment.empty}</Text>
            <Text style={themedStyles.emptyDesc}>{t.profile.payment.emptyDesc}</Text>
          </Animated.View>
        ) : (
          methods.map((method, index) => (
            <Animated.View
              key={method.id}
              entering={FadeInDown.delay(100 + index * 80)
                .duration(500)
                .springify()
                .damping(18)}
              style={themedStyles.methodCard}
            >
              <View style={styles.methodHeader}>
                <View style={styles.methodLeft}>
                  <View
                    style={[
                      styles.methodIconCircle,
                      { backgroundColor: getTypeBgColor(method.type) },
                    ]}
                  >
                    {getTypeIcon(method.type)}
                  </View>
                  <View style={styles.methodInfo}>
                    <View style={styles.methodLabelRow}>
                      <Text style={themedStyles.methodType}>
                        {getTypeLabel(method.type)}
                      </Text>
                      {method.isDefault && (
                        <View style={themedStyles.defaultBadge}>
                          <Star size={10} color={colors.yellow[600]} />
                          <Text style={themedStyles.defaultBadgeText}>
                            {t.profile.payment.defaultBadge}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={themedStyles.methodDisplay}>{method.display}</Text>
                  </View>
                </View>
              </View>

              <View style={themedStyles.methodActions}>
                {!method.isDefault && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSetDefault(method.id)}
                    activeOpacity={0.7}
                  >
                    <Star size={14} color={colors.yellow[600]} />
                    <Text style={themedStyles.actionTextYellow}>
                      {t.profile.payment.setDefault}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(method.id)}
                  activeOpacity={0.7}
                >
                  <Trash2 size={14} color={colors.red[500]} />
                  <Text style={themedStyles.actionTextRed}>
                    {t.profile.payment.delete}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ))
        )}

        <Animated.View
          entering={FadeInDown.delay(280).duration(500).springify().damping(18)}
        >
          <TouchableOpacity
            style={themedStyles.addButton}
            onPress={handleAdd}
            activeOpacity={0.8}
          >
            <Plus size={18} color={colors.white} />
            <Text style={themedStyles.addButtonText}>
              {t.profile.payment.addMethod}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(380).duration(500).springify().damping(18)}
          style={themedStyles.infoCard}
        >
          <View style={styles.infoHeader}>
            <Info size={18} color={colors.primary[600]} />
            <Text style={themedStyles.infoTitle}>
              {t.profile.payment.acceptedMethods}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={[styles.infoIconCircle, { backgroundColor: colors.primary[50] }]}>
              <Smartphone size={16} color={colors.primary[600]} />
            </View>
            <Text style={themedStyles.infoText}>{t.profile.payment.moncashDesc}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={[styles.infoIconCircle, { backgroundColor: colors.green[50] }]}>
              <Smartphone size={16} color={colors.green[600]} />
            </View>
            <Text style={themedStyles.infoText}>{t.profile.payment.natcashDesc}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={[styles.infoIconCircle, { backgroundColor: colors.purple[50] }]}>
              <CreditCard size={16} color={colors.purple[600]} />
            </View>
            <Text style={themedStyles.infoText}>{t.profile.payment.cardDesc}</Text>
          </View>
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
    paddingVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  infoIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
