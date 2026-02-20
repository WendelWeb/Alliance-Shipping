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
import { useSignUp, useSSO, useAuth } from '@clerk/clerk-expo';
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

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
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

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | null>(null);
  const [error, setError] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError('');
    try {
      await signUp.create({ firstName, lastName, emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!isLoaded || !signUp) return;
    setLoading(true);
    setError('');
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === 'complete') {
        if (result.createdSessionId) {
          await setActive({ session: result.createdSessionId });
          router.replace('/(tabs)');
        }
        return;
      }

      // Handle missing_requirements (e.g. username required by Clerk)
      if (result.status === 'missing_requirements') {
        const baseName = email.split('@')[0] || `user${Date.now()}`;
        const username = baseName.replace(/[^a-zA-Z0-9_]/g, '') + Math.floor(Math.random() * 1000);

        try {
          await signUp.update({ username });
          const completeResult = await signUp.reload();
          if (completeResult.status === 'complete' && completeResult.createdSessionId) {
            await setActive({ session: completeResult.createdSessionId });
            router.replace('/(tabs)');
            return;
          }
        } catch {
          // If username update fails, check if session was created anyway
          if (signUp.createdSessionId) {
            await setActive({ session: signUp.createdSessionId });
            router.replace('/(tabs)');
            return;
          }
        }
      }
    } catch (err: any) {
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
        // const redirectUrl = Linking.createURL('/sso-callback');

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
      paddingVertical: spacing.xl,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderBottomLeftRadius: borderRadius['2xl'],
      borderBottomRightRadius: borderRadius['2xl'],
    },
    logo: { fontSize: 24, fontFamily: fonts.headingBold, color: colors.white, marginBottom: 4, textAlign: 'center' as const },
    subtitle: { fontSize: 14, fontFamily: fonts.regular, color: 'rgba(255,255,255,0.85)' as const, textAlign: 'center' as const },
    scroll: { padding: spacing.xl, paddingTop: spacing.sm },
    welcomeText: { fontSize: 22, fontFamily: fonts.headingSemiBold, color: colors.gray[900], marginBottom: spacing.xs },
    hasAccountHint: { fontSize: 13, fontFamily: fonts.regular, color: colors.gray[500], marginBottom: spacing.lg, lineHeight: 19 },
    hasAccountHintLink: { fontSize: 13, fontFamily: fonts.semiBold, color: colors.primary[600] },
    errorBox: { backgroundColor: colors.red[50], borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.red[100] },
    errorText: { color: colors.red[600], fontFamily: fonts.medium, fontSize: 13 },
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
    btn: { marginTop: spacing.sm, borderRadius: borderRadius.lg, overflow: 'hidden' as const },
    btnGradient: { paddingVertical: spacing.lg, alignItems: 'center' as const, borderRadius: borderRadius.lg },
    btnText: { fontSize: 16, fontFamily: fonts.semiBold, color: colors.white },
    linkText: { fontSize: 14, fontFamily: fonts.regular, color: colors.gray[600] },
    link: { fontSize: 14, fontFamily: fonts.semiBold, color: colors.primary[600] },
    verifyContainer: { flex: 1, padding: spacing.xl, paddingTop: spacing['3xl'] },
    verifyTitle: { fontSize: 22, fontFamily: fonts.headingSemiBold, color: colors.gray[900], marginBottom: spacing.sm },
    verifyDesc: { fontSize: 14, fontFamily: fonts.regular, color: colors.gray[600], marginBottom: spacing['2xl'] },
    codeInput: {
      backgroundColor: colors.gray[50],
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

  if (pendingVerification) {
    return (
      <View style={[styles.container, themedStyles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={[colors.primary[500], colors.primary[700]]}
          style={themedStyles.header}
        >
          <Text style={themedStyles.logo}>{t.auth.signUp.title}</Text>
        </LinearGradient>
        <View style={themedStyles.verifyContainer}>
          <Animated.View entering={FadeInDown.duration(600)}>
            <Text style={themedStyles.verifyTitle}>Verify your email</Text>
            <Text style={themedStyles.verifyDesc}>We sent a code to {email}</Text>
            {error ? (
              <View style={themedStyles.errorBox}>
                <Text style={themedStyles.errorText}>{error}</Text>
              </View>
            ) : null}
            <TextInput
              style={themedStyles.codeInput}
              value={code}
              onChangeText={setCode}
              placeholder="000000"
              placeholderTextColor={colors.gray[400]}
              keyboardType="number-pad"
              textAlign="center"
              maxLength={6}
            />
            <TouchableOpacity
              style={[themedStyles.btn, loading && styles.disabled]}
              onPress={handleVerify}
              disabled={loading}
            >
              <LinearGradient
                colors={[colors.primary[500], colors.primary[700]]}
                style={themedStyles.btnGradient}
              >
                <Text style={themedStyles.btnText}>
                  {loading ? t.common.loading : 'Verify'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, themedStyles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[colors.primary[500], colors.primary[700]]}
        style={themedStyles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View entering={FadeInDown.duration(600)}>
          <Text style={themedStyles.logo}>{t.auth.signUp.joinAlliance}</Text>
          <Text style={themedStyles.subtitle}>{t.auth.signUp.subtitle}</Text>
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
            <Text style={themedStyles.welcomeText}>{t.auth.signUp.createAccount}</Text>
            <Text style={themedStyles.hasAccountHint}>
              {t.auth.signUp.hasAccountHintStart}
              <Text style={themedStyles.hasAccountHintLink} onPress={() => router.push('/(auth)/sign-in')}>{t.auth.signUp.hasAccountHintLink}</Text>
              {t.auth.signUp.hasAccountHintEnd}
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

            <View style={styles.nameRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={themedStyles.inputLabel}>{t.profile.settings.firstName}</Text>
                <TextInput
                  style={themedStyles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder={t.profile.settings.firstNamePlaceholder}
                  placeholderTextColor={colors.gray[400]}
                  editable={!isDisabled}
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={themedStyles.inputLabel}>{t.profile.settings.lastName}</Text>
                <TextInput
                  style={themedStyles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder={t.profile.settings.lastNamePlaceholder}
                  placeholderTextColor={colors.gray[400]}
                  editable={!isDisabled}
                />
              </View>
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
              style={[themedStyles.btn, isDisabled && styles.disabled]}
              onPress={handleSignUp}
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
                  {loading ? t.common.loading : t.profile.signUp}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.linkRow}>
              <Text style={themedStyles.linkText}>{t.auth.signUp.hasAccount} </Text>
              <Link href="/(auth)/sign-in" asChild>
                <TouchableOpacity>
                  <Text style={themedStyles.link}>{t.auth.signUp.signInLink}</Text>
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
  nameRow: { flexDirection: 'row' },
  inputGroup: { marginBottom: 10 },
  passwordContainer: { position: 'relative' },
  eyeButton: { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },
  disabled: { opacity: 0.7 },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 14 },
});
