import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Platform,
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
  Send,
  CheckCircle,
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
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);

  const faqItems: FaqItem[] = [
    { question: t.profile.support.faq1q, answer: t.profile.support.faq1a },
    { question: t.profile.support.faq2q, answer: t.profile.support.faq2a },
    { question: t.profile.support.faq3q, answer: t.profile.support.faq3a },
    { question: t.profile.support.faq4q, answer: t.profile.support.faq4a },
    { question: t.profile.support.faq5q, answer: t.profile.support.faq5a },
    { question: t.profile.support.faq6q, answer: t.profile.support.faq6a },
  ];

  const toggleFaq = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleCall = () => {
    Linking.openURL('tel:+15551234567');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@allianceshipping.com');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/15551234567');
  };

  const handleSendMessage = () => {
    if (!subject.trim() || !message.trim()) {
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setMessageSent(true);
    setSubject('');
    setMessage('');

    setTimeout(() => {
      setMessageSent(false);
    }, 5000);
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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
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
              <Text style={themedStyles.contactInfo}>+1 (555) 123-4567</Text>
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
                support@allianceshipping.com
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
              <Text style={themedStyles.contactInfo}>+1 (555) 123-4567</Text>
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

          <Animated.View
            entering={FadeInDown.delay(320).duration(500).springify().damping(18)}
          >
            <Text style={themedStyles.sectionTitle}>
              {t.profile.support.sendMessage}
            </Text>

            {messageSent ? (
              <View style={themedStyles.successCard}>
                <View style={themedStyles.successIconCircle}>
                  <CheckCircle size={28} color={colors.green[600]} />
                </View>
                <Text style={themedStyles.successTitle}>
                  {t.profile.support.messageSent}
                </Text>
                <Text style={themedStyles.successText}>
                  {t.profile.support.messageResponse}
                </Text>
              </View>
            ) : (
              <View style={themedStyles.formCard}>
                <View style={styles.inputGroup}>
                  <Text style={themedStyles.inputLabel}>
                    {t.profile.support.subject}
                  </Text>
                  <TextInput
                    style={themedStyles.input}
                    value={subject}
                    onChangeText={setSubject}
                    placeholder={t.profile.support.subjectPlaceholder}
                    placeholderTextColor={colors.gray[400]}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={themedStyles.inputLabel}>
                    {t.profile.support.message}
                  </Text>
                  <TextInput
                    style={[themedStyles.input, styles.textArea]}
                    value={message}
                    onChangeText={setMessage}
                    placeholder={t.profile.support.messagePlaceholder}
                    placeholderTextColor={colors.gray[400]}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <TouchableOpacity
                  style={[
                    themedStyles.sendButton,
                    (!subject.trim() || !message.trim()) && styles.sendButtonDisabled,
                  ]}
                  onPress={handleSendMessage}
                  disabled={!subject.trim() || !message.trim()}
                  activeOpacity={0.8}
                >
                  <Send size={16} color={colors.white} />
                  <Text style={themedStyles.sendButtonText}>
                    {t.profile.support.sendButton}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
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
