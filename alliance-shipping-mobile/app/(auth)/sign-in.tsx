import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSignIn, useSSO, useAuth } from '@clerk/clerk-expo';
import { useRouter, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useTheme } from '@/lib/themes/ThemeProvider';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { GoogleLogo } from '@/components/icons/GoogleLogo';
import { AppleLogo } from '@/components/icons/AppleLogo';

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startSSOFlow } = useSSO();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { colors, fonts, spacing, borderRadius, shadows } = useTheme();

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      router.replace('/(tabs)');
    }
  }, [isSignedIn, router]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError('');
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = useCallback(
    async (strategy: 'oauth_google' | 'oauth_apple') => {
      const provider = strategy === 'oauth_google' ? 'google' : 'apple';
      try {
        setOauthLoading(provider);
        setError('');

        const { createdSessionId, setActive: ssoSetActive, signUp, signIn: ssoSignIn } =
          await startSSOFlow({
            strategy,
            redirectUrl: Linking.createURL('/(tabs)'),
          });

        if (createdSessionId) {
          await ssoSetActive!({ session: createdSessionId });
          router.replace('/(tabs)');
          return;
        }

        // If user needs to complete sign-up (e.g. missing fields)
        if (signUp?.status === 'missing_requirements') {
          // Handle missing username by generating one from email
          const emailAddr =
            signUp.emailAddress ||
            ssoSignIn?.identifier ||
            '';
          const baseName = emailAddr.split('@')[0] || `user${Date.now()}`;
          const username = baseName.replace(/[^a-zA-Z0-9_]/g, '') + Math.floor(Math.random() * 1000);

          try {
            await signUp.update({ username });
            const completeResult = await signUp.reload();
            if (completeResult.status === 'complete' && completeResult.createdSessionId) {
              await ssoSetActive!({ session: completeResult.createdSessionId });
              router.replace('/(tabs)');
            }
          } catch {
            // If username update fails, try without
            if (signUp.createdSessionId) {
              await ssoSetActive!({ session: signUp.createdSessionId });
              router.replace('/(tabs)');
            }
          }
        }
      } catch (err: any) {
        const msg = err?.errors?.[0]?.message || err?.message || t.common.error;
        setError(msg);
      } finally {
        setOauthLoading(null);
      }
    },
    [startSSOFlow, router, t.common.error],
  );

  const isDisabled = loading || oauthLoading !== null;

  const themedStyles = useMemo(() => ({
    container: { backgroundColor: colors.background },
    header: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing['4xl'],
      paddingBottom: spacing['5xl'],
      borderBottomLeftRadius: borderRadius['2xl'],
      borderBottomRightRadius: borderRadius['2xl'],
    },
    logo: { fontSize: 28, fontFamily: fonts.headingBold, color: colors.white, marginBottom: 4 },
    subtitle: { fontSize: 14, fontFamily: fonts.regular, color: 'rgba(255,255,255,0.85)' as const },
    scroll: { padding: spacing.xl, paddingTop: spacing['3xl'] },
    welcomeText: { fontSize: 22, fontFamily: fonts.headingSemiBold, color: colors.gray[900], marginBottom: spacing['2xl'] },
    errorBox: { backgroundColor: colors.red[50], borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.red[100] },
    errorText: { color: colors.red[600], fontFamily: fonts.medium, fontSize: 13 },
    oauthBtn: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      height: 52,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.md,
      ...shadows.sm,
    },
    googleBtn: {
      backgroundColor: colors.white,
      borderWidth: 1.5,
      borderColor: colors.gray[200],
      gap: spacing.sm,
    },
    googleBtnText: { fontSize: 16, fontFamily: fonts.semiBold, color: colors.gray[700] },
    appleBtn: { backgroundColor: '#000000', gap: spacing.sm },
    appleBtnText: { fontSize: 16, fontFamily: fonts.semiBold, color: colors.white },
    dividerLine: { backgroundColor: colors.gray[200] },
    dividerText: {
      marginHorizontal: spacing.lg,
      fontSize: 13,
      fontFamily: fonts.medium,
      color: colors.gray[400],
      textTransform: 'uppercase' as const,
    },
    inputLabel: { fontSize: 14, fontFamily: fonts.semiBold, color: colors.gray[700], marginBottom: spacing.sm },
    input: {
      backgroundColor: colors.gray[50],
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.gray[200],
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md + 2,
      fontSize: 16,
      fontFamily: fonts.regular,
      color: colors.gray[900],
    },
    signInBtn: { marginTop: spacing.xl, borderRadius: borderRadius.lg, overflow: 'hidden' as const },
    btnGradient: { paddingVertical: spacing.lg, alignItems: 'center' as const, borderRadius: borderRadius.lg },
    btnText: { fontSize: 16, fontFamily: fonts.semiBold, color: colors.white },
    linkText: { fontSize: 14, fontFamily: fonts.regular, color: colors.gray[600] },
    link: { fontSize: 14, fontFamily: fonts.semiBold, color: colors.primary[600] },
  }), [colors, fonts, spacing, borderRadius, shadows]);

  return (
    <View style={[styles.container, themedStyles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[colors.primary[500], colors.primary[700]]}
        style={themedStyles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View entering={FadeInDown.duration(600)}>
          <Text style={themedStyles.logo}>{t.auth.signIn.title}</Text>
          <Text style={themedStyles.subtitle}>{t.auth.signIn.subtitle}</Text>
        </Animated.View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formContainer}
      >
        <ScrollView
          contentContainerStyle={themedStyles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInDown.delay(200).duration(600)}>
            <Text style={themedStyles.welcomeText}>{t.auth.signIn.welcomeBack}</Text>

            {error ? (
              <View style={themedStyles.errorBox}>
                <Text style={themedStyles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Google OAuth */}
            <TouchableOpacity
              style={[themedStyles.oauthBtn, themedStyles.googleBtn, isDisabled && styles.disabled]}
              onPress={() => handleOAuth('oauth_google')}
              disabled={isDisabled}
              activeOpacity={0.8}
            >
              {oauthLoading === 'google' ? (
                <ActivityIndicator size="small" color={colors.gray[700]} />
              ) : (
                <>
                  <GoogleLogo size={22} />
                  <Text style={themedStyles.googleBtnText}>{t.auth.continueWithGoogle}</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Apple OAuth */}
            <TouchableOpacity
              style={[themedStyles.oauthBtn, themedStyles.appleBtn, isDisabled && styles.disabled]}
              onPress={() => handleOAuth('oauth_apple')}
              disabled={isDisabled}
              activeOpacity={0.8}
            >
              {oauthLoading === 'apple' ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <AppleLogo size={22} />
                  <Text style={themedStyles.appleBtnText}>{t.auth.continueWithApple}</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, themedStyles.dividerLine]} />
              <Text style={themedStyles.dividerText}>{t.auth.orDivider}</Text>
              <View style={[styles.dividerLine, themedStyles.dividerLine]} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={themedStyles.inputLabel}>Email</Text>
              <TextInput
                style={themedStyles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="email@example.com"
                placeholderTextColor={colors.gray[400]}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isDisabled}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={themedStyles.inputLabel}>Password</Text>
              <TextInput
                style={themedStyles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.gray[400]}
                secureTextEntry
                editable={!isDisabled}
              />
            </View>

            <TouchableOpacity
              style={[themedStyles.signInBtn, isDisabled && styles.disabled]}
              onPress={handleSignIn}
              disabled={isDisabled}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primary[500], colors.primary[700]]}
                style={themedStyles.btnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={themedStyles.btnText}>
                  {loading ? t.common.loading : t.profile.signIn}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.linkRow}>
              <Text style={themedStyles.linkText}>{t.auth.signIn.noAccount} </Text>
              <Link href="/(auth)/sign-up" asChild>
                <TouchableOpacity>
                  <Text style={themedStyles.link}>{t.auth.signIn.signUpLink}</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  formContainer: { flex: 1 },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  inputGroup: { marginBottom: 16 },
  disabled: { opacity: 0.7 },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
});
