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
import { Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '@/lib/themes/ThemeProvider';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { GoogleLogo } from '@/components/icons/GoogleLogo';

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startSSOFlow } = useSSO();
  const { isSignedIn, getToken } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { colors, fonts, spacing, borderRadius, shadows, card, isDark } = useTheme();

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      router.replace('/(tabs)');
    }
  }, [isSignedIn, router]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | null>(null);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pendingSecondFactor, setPendingSecondFactor] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // Helper: handle second factor flow (prepare + show UI)
  const startSecondFactor = async () => {
    if (!signIn) return;
    console.log('[SIGN-IN] Preparing second factor (email_code)...');
    try {
      await signIn.prepareSecondFactor({ strategy: 'email_code' });
      console.log('[SIGN-IN] Second factor prepared, showing code input');
      setPendingSecondFactor(true);
    } catch (err: any) {
      console.log('[SIGN-IN] prepareSecondFactor error:', JSON.stringify(err));
      setError(err?.errors?.[0]?.message || 'Failed to send verification code.');
    }
  };

  const handleSignIn = async () => {
    console.log('[SIGN-IN] handleSignIn called');
    console.log('[SIGN-IN] isLoaded:', isLoaded, '| signIn:', !!signIn);
    console.log('[SIGN-IN] email:', email, '| password length:', password.length);

    if (!isLoaded || !signIn) {
      setError('Authentication service not ready. Please try again.');
      return;
    }
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      console.log('[SIGN-IN] Calling signIn.create...');
      const result = await signIn.create({ identifier: email.trim(), password });
      console.log('[SIGN-IN] signIn.create result:', JSON.stringify({
        status: result.status,
        createdSessionId: result.createdSessionId,
      }));

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)');
        return;
      }

      // First factor needed
      if (result.status === 'needs_first_factor') {
        console.log('[SIGN-IN] needs_first_factor, attempting password...');
        const factorResult = await signIn.attemptFirstFactor({
          strategy: 'password',
          password,
        });
        console.log('[SIGN-IN] attemptFirstFactor status:', factorResult.status);

        if (factorResult.status === 'complete') {
          await setActive({ session: factorResult.createdSessionId });
          router.replace('/(tabs)');
          return;
        }
        if (factorResult.status === 'needs_second_factor') {
          await startSecondFactor();
          return;
        }
      }

      // Second factor needed (password accepted directly)
      if (result.status === 'needs_second_factor') {
        await startSecondFactor();
        return;
      }

      setError(`Login failed (status: ${result.status}). Please try again.`);
    } catch (err: any) {
      console.log('[SIGN-IN] ERROR:', err?.errors?.[0]?.code, err?.errors?.[0]?.message);
      const errorMsg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || t.common.error;
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!isLoaded || !signIn) return;
    console.log('[SIGN-IN] Verifying second factor code...');
    setLoading(true);
    setError('');
    try {
      const result = await signIn.attemptSecondFactor({
        strategy: 'email_code',
        code: verificationCode,
      });
      console.log('[SIGN-IN] attemptSecondFactor result:', result.status);

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)');
      } else {
        setError('Verification failed. Please try again.');
      }
    } catch (err: any) {
      console.log('[SIGN-IN] Verify error:', err?.errors?.[0]?.message);
      setError(err?.errors?.[0]?.message || t.common.error);
    } finally {
      setLoading(false);
    }
  };

  // Helper: poll until Clerk recognises the session (max 8s)
  const waitForSession = useCallback(
    () =>
      new Promise<boolean>((resolve) => {
        let elapsed = 0;
        const interval = setInterval(async () => {
          elapsed += 400;
          try {
            const token = await getToken();
            if (token) { clearInterval(interval); resolve(true); }
          } catch {}
          if (elapsed >= 8000) { clearInterval(interval); resolve(false); }
        }, 400);
      }),
    [getToken],
  );

  // Helper: try setting username with retries (Clerk may require it)
  const completeSignUpWithUsername = async (
    ssoSignUp: any,
    ssoSetActive: any,
    emailAddr: string,
  ): Promise<boolean> => {
    const baseName = (emailAddr.split('@')[0] || 'user').replace(/[^a-zA-Z0-9_]/g, '');
    for (let attempt = 0; attempt < 5; attempt++) {
      const suffix = Math.floor(Math.random() * 99999);
      const username = `${baseName}${suffix}`;
      try {
        await ssoSignUp.update({ username });
        const result = await ssoSignUp.reload();
        if (result.status === 'complete' && result.createdSessionId) {
          await ssoSetActive!({ session: result.createdSessionId });
          return true;
        }
        if (result.createdSessionId) {
          await ssoSetActive!({ session: result.createdSessionId });
          return true;
        }
      } catch {
        // Username might be taken, retry with different suffix
      }
    }
    // Last resort: check if a session was created anyway
    if (ssoSignUp.createdSessionId) {
      await ssoSetActive!({ session: ssoSignUp.createdSessionId });
      return true;
    }
    return false;
  };

  const handleOAuth = useCallback(
    async (strategy: 'oauth_google') => {
      try {
        setOauthLoading('google');
        setError('');

        // BUILD: utiliser l'URL en dur pour éviter mismatch
        const redirectUrl = 'alliance-shipping://sso-callback';

        const { createdSessionId, setActive: ssoSetActive, signUp: ssoSignUp, signIn: ssoSignIn } =
          await startSSOFlow({
            strategy,
            redirectUrl,
          });

        // 1. Session already created — just activate
        if (createdSessionId) {
          await ssoSetActive!({ session: createdSessionId });
          router.replace('/(tabs)');
          return;
        }

        // 2. Existing user returned via signIn
        if (ssoSignIn?.createdSessionId) {
          await ssoSetActive!({ session: ssoSignIn.createdSessionId });
          router.replace('/(tabs)');
          return;
        }

        // 3. New user — signUp may need username
        if (ssoSignUp) {
          if (ssoSignUp.status === 'complete' && ssoSignUp.createdSessionId) {
            await ssoSetActive!({ session: ssoSignUp.createdSessionId });
            router.replace('/(tabs)');
            return;
          }
          if (ssoSignUp.status === 'missing_requirements') {
            const emailAddr = ssoSignUp.emailAddress || ssoSignIn?.identifier || '';
            const ok = await completeSignUpWithUsername(ssoSignUp, ssoSetActive, emailAddr);
            if (ok) {
              router.replace('/(tabs)');
              return;
            }
          }
        }

        // 4. Fallback: poll until Clerk syncs the session
        const ready = await waitForSession();
        if (ready) {
          router.replace('/(tabs)');
          return;
        }
      } catch (err: any) {
        const msg = err?.errors?.[0]?.message || err?.message || t.common.error;
        setError(msg);
      } finally {
        setOauthLoading(null);
      }
    },
    [startSSOFlow, router, t.common.error, waitForSession],
  );

  const isDisabled = loading || oauthLoading !== null;

  const themedStyles = useMemo(() => ({
    container: { backgroundColor: colors.background },
    header: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing['4xl'] - 15,
      paddingBottom: spacing['5xl'] - 15,
      borderBottomLeftRadius: borderRadius['2xl'],
      borderBottomRightRadius: borderRadius['2xl'],
    },
    logo: { fontSize: 28, fontFamily: fonts.headingBold, color: colors.white, marginBottom: 4 },
    subtitle: { fontSize: 14, fontFamily: fonts.regular, color: 'rgba(255,255,255,0.85)' as const },
    scroll: { padding: spacing.xl, paddingTop: spacing.md },
    welcomeText: { fontSize: 22, fontFamily: fonts.headingSemiBold, color: colors.gray[900], marginBottom: spacing.xs },
    noAccountHint: { fontSize: 13, fontFamily: fonts.regular, color: colors.gray[500], marginBottom: spacing.lg, lineHeight: 19 },
    noAccountHintLink: { fontSize: 13, fontFamily: fonts.semiBold, color: colors.primary[600] },
    errorBox: { backgroundColor: isDark ? 'rgba(220,38,38,0.15)' : colors.red[50], borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: isDark ? 'rgba(220,38,38,0.3)' : colors.red[100] },
    errorText: { color: isDark ? '#fca5a5' : colors.red[600], fontFamily: fonts.medium, fontSize: 13 },
    oauthBtn: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      height: 52,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.xs,
      ...shadows.sm,
    },
    googleBtn: {
      backgroundColor: isDark ? card.backgroundColor : colors.white,
      borderWidth: 1.5,
      borderColor: isDark ? colors.gray[300] : colors.gray[200],
      gap: spacing.sm,
    },
    googleBtnText: { fontSize: 16, fontFamily: fonts.semiBold, color: isDark ? colors.gray[900] : colors.gray[700] },
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
      backgroundColor: isDark ? colors.gray[100] : colors.gray[50],
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.gray[200],
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md + 2,
      fontSize: 16,
      fontFamily: fonts.regular,
      color: colors.gray[900],
    },
    signInBtn: { marginTop: 10, borderRadius: borderRadius.lg, overflow: 'hidden' as const },
    btnGradient: { paddingVertical: spacing.lg, alignItems: 'center' as const, borderRadius: borderRadius.lg },
    btnText: { fontSize: 16, fontFamily: fonts.semiBold, color: colors.white },
    linkText: { fontSize: 14, fontFamily: fonts.regular, color: colors.gray[600] },
    link: { fontSize: 14, fontFamily: fonts.semiBold, color: colors.primary[600] },
    // Verification UI
    verifyContainer: { flex: 1, padding: spacing.xl, paddingTop: spacing['3xl'] },
    verifyTitle: { fontSize: 22, fontFamily: fonts.headingSemiBold, color: colors.gray[900], marginBottom: spacing.sm },
    verifyDesc: { fontSize: 14, fontFamily: fonts.regular, color: colors.gray[600], marginBottom: spacing['2xl'] },
    codeInput: {
      backgroundColor: isDark ? colors.gray[100] : colors.gray[50],
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.gray[200],
      paddingVertical: spacing.lg,
      fontSize: 28,
      fontFamily: fonts.bold,
      color: colors.gray[900],
      letterSpacing: 8,
      marginBottom: spacing.xl,
    },
  }), [colors, fonts, spacing, borderRadius, shadows, card, isDark]);

  // ── Second factor verification screen ──
  if (pendingSecondFactor) {
    return (
      <View style={[styles.container, themedStyles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={[colors.primary[500], colors.primary[700]]}
          style={themedStyles.header}
        >
          <Animated.View entering={FadeInDown.duration(600)}>
            <Text style={themedStyles.logo}>{t.auth.signIn.title}</Text>
          </Animated.View>
        </LinearGradient>
        <View style={themedStyles.verifyContainer}>
          <Animated.View entering={FadeInDown.duration(600)}>
            <Text style={themedStyles.verifyTitle}>{t.auth.signIn.verifyTitle || 'Verify your identity'}</Text>
            <Text style={themedStyles.verifyDesc}>
              {t.auth.signIn.verifyDesc || `We sent a verification code to ${email}`}
            </Text>
            {error ? (
              <View style={themedStyles.errorBox}>
                <Text style={themedStyles.errorText}>{error}</Text>
              </View>
            ) : null}
            <TextInput
              style={themedStyles.codeInput}
              value={verificationCode}
              onChangeText={setVerificationCode}
              placeholder="000000"
              placeholderTextColor={colors.gray[400]}
              keyboardType="number-pad"
              textAlign="center"
              maxLength={6}
            />
            <TouchableOpacity
              style={[themedStyles.signInBtn, loading && styles.disabled]}
              onPress={handleVerifyCode}
              disabled={loading}
            >
              <LinearGradient
                colors={[colors.primary[500], colors.primary[700]]}
                style={themedStyles.btnGradient}
              >
                <Text style={themedStyles.btnText}>
                  {loading ? t.common.loading : (t.auth.signIn.verifyButton || 'Verify')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => {
                setPendingSecondFactor(false);
                setVerificationCode('');
                setError('');
              }}
            >
              <Text style={themedStyles.link}>{t.common.back || 'Back'}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    );
  }

  // ── Main sign-in form ──
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
            <Text style={themedStyles.noAccountHint}>
              {t.auth.signIn.noAccountHintStart}
              <Text style={themedStyles.noAccountHintLink} onPress={() => router.push('/(auth)/sign-up')}>{t.auth.signIn.noAccountHintLink}</Text>
              {t.auth.signIn.noAccountHintEnd}
            </Text>

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
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[themedStyles.input, { flex: 1, paddingRight: 48 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.gray[400]}
                  secureTextEntry={!showPassword}
                  editable={!isDisabled}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.6}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={colors.gray[400]} />
                  ) : (
                    <Eye size={20} color={colors.gray[400]} />
                  )}
                </TouchableOpacity>
              </View>
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
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  inputGroup: { marginBottom: 10 },
  passwordContainer: { position: 'relative' },
  eyeButton: { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },
  disabled: { opacity: 0.7 },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 14 },
});
