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
  const { colors, fonts, spacing, borderRadius, shadows, isDark } = useTheme();

  const [methods, setMethods] = useState<PaymentMethod[]>(initialMethods);

  // DARK MODE: Use light colors for icons and text
  // LIGHT MODE: Use dark colors for icons and text
  const iconColor = isDark ? colors.gray[300] : colors.gray[700];
  const textPrimary = isDark ? colors.gray[100] : colors.gray[900];
  const textSecondary = isDark ? colors.gray[400] : colors.gray[600];
  const bgPrimary = isDark ? colors.gray[900] : colors.gray[50];
  const bgCard = isDark ? colors.gray[800] : colors.white;
  const borderColor = isDark ? colors.gray[700] : colors.gray[200];

  function getTypeIcon(type: string) {
    const color = isDark ? colors.primary[400] : colors.primary[600];
    switch (type) {
      case 'moncash':
      case 'natcash':
        return <Smartphone size={24} color={color} />;
      case 'card':
        return <CreditCard size={24} color={isDark ? colors.purple[400] : colors.purple[600]} />;
      default:
        return <CreditCard size={24} color={iconColor} />;
    }
  }

  function getTypeBgColor(type: string) {
    switch (type) {
      case 'moncash':
        return isDark ? colors.primary[900] : colors.primary[100];
      case 'natcash':
        return isDark ? colors.green[900] : colors.green[100];
      case 'card':
        return isDark ? colors.purple[900] : colors.purple[100];
      default:
        return isDark ? colors.gray[700] : colors.gray[100];
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
    screen: {
      backgroundColor: bgPrimary,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: bgCard,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderWidth: 1,
      borderColor: borderColor,
    },
    headerTitle: {
      fontFamily: fonts.headingBold,
      fontSize: 28,
      color: textPrimary,
    },
    subtitle: {
      fontFamily: fonts.regular,
      fontSize: 18,
      color: textSecondary,
      marginBottom: spacing.xl,
      lineHeight: 26,
    },
    emptyCard: {
      backgroundColor: bgCard,
      borderRadius: borderRadius.xl,
      padding: spacing['3xl'],
      alignItems: 'center' as const,
      marginBottom: spacing.xl,
      borderWidth: 1,
      borderColor: borderColor,
    },
    emptyIconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: isDark ? colors.gray[700] : colors.gray[100],
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      marginBottom: spacing.lg,
    },
    emptyTitle: {
      fontFamily: fonts.headingSemiBold,
      fontSize: 20,
      color: textPrimary,
      marginBottom: spacing.xs,
    },
    emptyDesc: {
      fontFamily: fonts.regular,
      fontSize: 17,
      color: textSecondary,
      textAlign: 'center' as const,
      lineHeight: 24,
    },
    methodCard: {
      backgroundColor: bgCard,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: borderColor,
    },
    methodType: {
      fontFamily: fonts.semiBold,
      fontSize: 19,
      color: textPrimary,
    },
    defaultBadge: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      backgroundColor: isDark ? colors.yellow[900] : colors.yellow[100],
      borderRadius: borderRadius.full,
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: 6,
      gap: 5,
    },
    defaultBadgeText: {
      fontFamily: fonts.semiBold,
      fontSize: 14,
      color: isDark ? colors.yellow[300] : colors.yellow[700],
    },
    methodDisplay: {
      fontFamily: fonts.regular,
      fontSize: 17,
      color: textSecondary,
      marginTop: 4,
    },
    methodActions: {
      flexDirection: 'row' as const,
      borderTopWidth: 1,
      borderTopColor: borderColor,
      paddingTop: spacing.md,
      gap: spacing.md,
    },
    actionTextYellow: {
      fontFamily: fonts.medium,
      fontSize: 17,
      color: isDark ? colors.yellow[400] : colors.yellow[700],
    },
    actionTextRed: {
      fontFamily: fonts.medium,
      fontSize: 17,
      color: isDark ? colors.red[400] : colors.red[600],
    },
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
      ...shadows.md,
    },
    addButtonText: {
      fontFamily: fonts.semiBold,
      fontSize: 19,
      color: colors.white,
    },
    infoCard: {
      backgroundColor: isDark ? colors.gray[850] : colors.blue[50],
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: isDark ? colors.gray[700] : colors.blue[100],
    },
    infoTitle: {
      fontFamily: fonts.semiBold,
      fontSize: 19,
      color: isDark ? colors.blue[300] : colors.blue[700],
      marginBottom: spacing.xs,
    },
    infoText: {
      fontFamily: fonts.regular,
      fontSize: 17,
      color: textSecondary,
      flex: 1,
      lineHeight: 24,
    },
  }), [colors, fonts, spacing, borderRadius, shadows, isDark, bgPrimary, bgCard, borderColor, textPrimary, textSecondary, iconColor]);

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
          <ArrowLeft size={26} color={textPrimary} />
        </TouchableOpacity>
        <Text style={themedStyles.headerTitle}>{t.profile.payment.title}</Text>
        <View style={{ width: 40 }} />
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
              <CreditCard size={36} color={iconColor} />
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
                          <Star
                            size={12}
                            color={isDark ? colors.yellow[300] : colors.yellow[700]}
                            fill={isDark ? colors.yellow[300] : colors.yellow[700]}
                          />
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
                    <Star size={16} color={isDark ? colors.yellow[400] : colors.yellow[700]} />
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
                  <Trash2 size={16} color={isDark ? colors.red[400] : colors.red[600]} />
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
            <Plus size={20} color={colors.white} />
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
            <Info size={20} color={isDark ? colors.blue[400] : colors.blue[600]} />
            <Text style={themedStyles.infoTitle}>
              {t.profile.payment.acceptedMethods}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={[styles.infoIconCircle, {
              backgroundColor: isDark ? colors.primary[800] : colors.primary[100]
            }]}>
              <Smartphone size={18} color={isDark ? colors.primary[400] : colors.primary[600]} />
            </View>
            <Text style={themedStyles.infoText}>{t.profile.payment.moncashDesc}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={[styles.infoIconCircle, {
              backgroundColor: isDark ? colors.green[800] : colors.green[100]
            }]}>
              <Smartphone size={18} color={isDark ? colors.green[400] : colors.green[600]} />
            </View>
            <Text style={themedStyles.infoText}>{t.profile.payment.natcashDesc}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={[styles.infoIconCircle, {
              backgroundColor: isDark ? colors.purple[800] : colors.purple[100]
            }]}>
              <CreditCard size={18} color={isDark ? colors.purple[400] : colors.purple[600]} />
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
    paddingVertical: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
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
    width: 48,
    height: 48,
    borderRadius: 24,
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
    gap: 6,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
