import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from 'lucide-react-native';
import { useTheme } from '@/lib/themes/ThemeProvider';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface FaqItem {
  question: string;
  answer: string;
}

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, fonts, spacing, borderRadius, shadows, card } = useTheme();

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqItems: FaqItem[] = [
    { question: t.profile.support.faq1q, answer: t.profile.support.faq1a },
    { question: t.profile.support.faq2q, answer: t.profile.support.faq2a },
    { question: t.profile.support.faq3q, answer: t.profile.support.faq3a },
    { question: t.profile.support.faq4q, answer: t.profile.support.faq4a },
    { question: t.profile.support.faq5q, answer: t.profile.support.faq5a },
    { question: t.profile.support.faq6q, answer: t.profile.support.faq6a },
    { question: t.profile.support.faq7q, answer: t.profile.support.faq7a },
    { question: t.profile.support.faq8q, answer: t.profile.support.faq8a },
    { question: t.profile.support.faq9q, answer: t.profile.support.faq9a },
    { question: t.profile.support.faq10q, answer: t.profile.support.faq10a },
    { question: t.profile.support.faq11q, answer: t.profile.support.faq11a },
    { question: t.profile.support.faq12q, answer: t.profile.support.faq12a },
    { question: t.profile.support.faq13q, answer: t.profile.support.faq13a },
    { question: t.profile.support.faq14q, answer: t.profile.support.faq14a },
    { question: t.profile.support.faq15q, answer: t.profile.support.faq15a },
    { question: t.profile.support.faq16q, answer: t.profile.support.faq16a },
    { question: t.profile.support.faq17q, answer: t.profile.support.faq17a },
    { question: t.profile.support.faq18q, answer: t.profile.support.faq18a },
    { question: t.profile.support.faq19q, answer: t.profile.support.faq19a },
    { question: t.profile.support.faq20q, answer: t.profile.support.faq20a },
    { question: t.profile.support.faq21q, answer: t.profile.support.faq21a },
  ];

  const toggleFaq = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleCall = () => {
    Linking.openURL('tel:+50948812652');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:allianceshipping26@gmail.com');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/50948812652');
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
    contactCard: {
      flex: 1,
      backgroundColor: card.backgroundColor,
      borderRadius: borderRadius.xl,
      padding: spacing.md,
      alignItems: 'center' as const,
      ...shadows.sm,
    },
    contactLabel: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.gray[900], marginBottom: 2, textAlign: 'center' as const },
    contactInfo: { fontFamily: fonts.regular, fontSize: 10, color: colors.primary[600], textAlign: 'center' as const, marginBottom: 2 },
    contactNote: { fontFamily: fonts.regular, fontSize: 10, color: colors.gray[400], textAlign: 'center' as const },
    sectionTitle: { fontFamily: fonts.headingSemiBold, fontSize: 17, color: colors.gray[800], marginBottom: spacing.md },
    faqCard: {
      backgroundColor: card.backgroundColor,
      borderRadius: borderRadius.xl,
      padding: spacing.xs,
      marginBottom: spacing.xl,
      ...shadows.sm,
    },
    faqItemBorder: { borderBottomWidth: 1, borderBottomColor: card.borderColor },
    faqQuestionText: { fontFamily: fonts.medium, fontSize: 14, color: colors.gray[800], flex: 1, marginRight: spacing.sm },
    faqQuestionTextActive: { fontFamily: fonts.semiBold, color: colors.primary[600] },
    faqAnswerText: { fontFamily: fonts.regular, fontSize: 13, color: colors.gray[600], lineHeight: 20 },
    formCard: {
      backgroundColor: card.backgroundColor,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      ...shadows.sm,
    },
    inputLabel: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.gray[700], marginBottom: spacing.sm },
    input: {
      backgroundColor: colors.gray[50],
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.gray[200],
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md + 2,
      fontSize: 15,
      fontFamily: fonts.regular,
      color: colors.gray[900],
    },
    sendButton: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      backgroundColor: colors.primary[600],
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md + 2,
      gap: spacing.sm,
    },
    sendButtonText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.white },
    successCard: {
      backgroundColor: colors.green[50],
      borderRadius: borderRadius.xl,
      padding: spacing.xl,
      alignItems: 'center' as const,
      borderWidth: 1,
      borderColor: colors.green[100],
      ...shadows.sm,
    },
    successIconCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: card.backgroundColor,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      marginBottom: spacing.md,
    },
    successTitle: { fontFamily: fonts.headingSemiBold, fontSize: 16, color: colors.green[600], marginBottom: spacing.xs },
    successText: { fontFamily: fonts.regular, fontSize: 13, color: colors.gray[600], textAlign: 'center' as const },
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
        <Text style={themedStyles.headerTitle}>{t.profile.support.title}</Text>
        <View style={themedStyles.backButton} />
      </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View
            entering={FadeInDown.delay(80).duration(400).springify().damping(18)}
          >
            <Text style={themedStyles.subtitle}>{t.profile.support.subtitle}</Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(120).duration(500).springify().damping(18)}
            style={styles.contactCards}
          >
            <TouchableOpacity
              style={themedStyles.contactCard}
              onPress={handleCall}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.contactIconCircle,
                  { backgroundColor: colors.green[50] },
                ]}
              >
                <Phone size={20} color={colors.green[600]} />
              </View>
              <Text style={themedStyles.contactLabel}>
                {t.profile.support.phone}
              </Text>
              <Text style={themedStyles.contactInfo}>+509 4881 26-52</Text>
              <Text style={themedStyles.contactNote}>
                {t.profile.support.phoneHours}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={themedStyles.contactCard}
              onPress={handleEmail}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.contactIconCircle,
                  { backgroundColor: colors.primary[50] },
                ]}
              >
                <Mail size={20} color={colors.primary[600]} />
              </View>
              <Text style={themedStyles.contactLabel}>
                {t.profile.support.email}
              </Text>
              <Text style={themedStyles.contactInfo}>
                allianceshipping26@gmail.com
              </Text>
              <Text style={themedStyles.contactNote}>
                {t.profile.support.emailResponse}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={themedStyles.contactCard}
              onPress={handleWhatsApp}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.contactIconCircle,
                  { backgroundColor: colors.green[50] },
                ]}
              >
                <MessageCircle size={20} color={colors.green[600]} />
              </View>
              <Text style={themedStyles.contactLabel}>
                {t.profile.support.whatsApp}
              </Text>
              <Text style={themedStyles.contactInfo}>+509 4881 26-52</Text>
              <Text style={themedStyles.contactNote}>
                {t.profile.support.liveChat}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(220).duration(500).springify().damping(18)}
          >
            <View style={styles.faqHeaderRow}>
              <HelpCircle size={18} color={colors.primary[600]} />
              <Text style={themedStyles.sectionTitle}>
                {t.profile.support.faqTitle}
              </Text>
            </View>

            <View style={themedStyles.faqCard}>
              {faqItems.map((faq, index) => (
                <View
                  key={index}
                  style={[
                    styles.faqItem,
                    index < faqItems.length - 1 && themedStyles.faqItemBorder,
                  ]}
                >
                  <TouchableOpacity
                    style={styles.faqQuestion}
                    onPress={() => toggleFaq(index)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        themedStyles.faqQuestionText,
                        expandedFaq === index && themedStyles.faqQuestionTextActive,
                      ]}
                    >
                      {faq.question}
                    </Text>
                    {expandedFaq === index ? (
                      <ChevronUp size={18} color={colors.primary[600]} />
                    ) : (
                      <ChevronDown size={18} color={colors.gray[400]} />
                    )}
                  </TouchableOpacity>
                  {expandedFaq === index && (
                    <Animated.View
                      entering={FadeInDown.duration(300)}
                      style={styles.faqAnswer}
                    >
                      <Text style={themedStyles.faqAnswerText}>{faq.answer}</Text>
                    </Animated.View>
                  )}
                </View>
              ))}
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
  flex: {
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
    paddingBottom: 120,
  },
  contactCards: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  contactIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  faqHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  faqItem: {
    paddingHorizontal: 12,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  faqAnswer: {
    paddingBottom: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
