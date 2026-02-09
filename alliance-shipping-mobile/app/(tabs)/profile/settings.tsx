import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Camera } from 'lucide-react-native';
import { useTheme } from '@/lib/themes/ThemeProvider';
import { useTranslation } from '@/lib/i18n/useTranslation';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, fonts, spacing, borderRadius, shadows, card } = useTheme();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [warehouseId, setWarehouseId] = useState<number | null>(null);
  const [warehouseName, setWarehouseName] = useState('');
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        setFirstName(user.firstName || '');
        setLastName(user.lastName || '');

        // Load phone, city and warehouse from API
        try {
          const { api } = await import('@/lib/api');
          const response = await api.get<{ success: boolean; user: any }>('/api/user/profile');

          // Load phone from database (with country code)
          if (response.user?.phone) {
            setPhone(response.user.phone);
          }

          if (response.user?.city) {
            setCity(response.user.city);
          }

          if (response.user?.warehouseId) {
            setWarehouseId(response.user.warehouseId);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
    };
    loadUserData();
  }, [user]);

  // Load warehouses when city changes
  useEffect(() => {
    const loadWarehouses = async () => {
      if (!city) {
        setWarehouses([]);
        setWarehouseName('');
        return;
      }

      setLoadingWarehouses(true);
      try {
        const { api } = await import('@/lib/api');
        const response = await api.get<{ success: boolean; warehouses: any[] }>(
          `/api/warehouses?city=${encodeURIComponent(city)}`
        );
        setWarehouses(response.warehouses || []);

        // Set warehouse name if we have a warehouseId
        if (warehouseId && response.warehouses) {
          const warehouse = response.warehouses.find((w: any) => w.id === warehouseId);
          if (warehouse) {
            setWarehouseName(warehouse.name);
          }
        }
      } catch (error) {
        console.error('Error loading warehouses:', error);
        setWarehouses([]);
      } finally {
        setLoadingWarehouses(false);
      }
    };

    loadWarehouses();
  }, [city, warehouseId]);

  const email = user?.primaryEmailAddress?.emailAddress || '';

  const handleChangePhoto = () => {
    Alert.alert(
      t.profile.settings.profilePhoto,
      t.profile.settings.photoNote,
      [{ text: 'OK' }]
    );
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Update Clerk profile (only first and last name)
      await user.update({
        firstName,
        lastName,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        t.profile.settings.successTitle,
        t.profile.settings.successMessage,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        t.profile.settings.error,
        t.profile.settings.profileUpdateFailed,
        [{ text: 'OK' }]
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleDeleteInfo = async () => {
    Alert.alert(
      'Supprimer les informations',
      'Êtes-vous sûr de vouloir supprimer votre numéro de téléphone, ville et dépôt ? Vous devrez les saisir à nouveau lors de votre prochaine connexion.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              const { api } = await import('@/lib/api');
              await api.patch('/api/user/profile', {
                phone: null,
                city: null,
                warehouseId: null,
              });

              // Clear local state
              setPhone('');
              setCity('');
              setWarehouseId(null);
              setWarehouseName('');

              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert(
                'Informations supprimées',
                'Vos informations ont été supprimées avec succès.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Error deleting info:', error);
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert(
                'Erreur',
                'Impossible de supprimer les informations. Veuillez réessayer.',
                [{ text: 'OK' }]
              );
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
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
    card: {
      backgroundColor: card.backgroundColor,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      ...shadows.md,
      borderWidth: card.borderWidth,
      borderColor: card.borderColor,
    },
    sectionTitle: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.gray[800], marginBottom: spacing.lg },
    avatar: {
      width: 88,
      height: 88,
      borderRadius: 44,
      borderWidth: 3,
      borderColor: colors.primary[100],
    },
    cameraButton: {
      position: 'absolute' as const,
      bottom: 0,
      right: 0,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary[600],
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderWidth: 2,
      borderColor: card.backgroundColor,
    },
    changePhotoText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.primary[600], marginBottom: spacing.xs },
    photoNote: { fontFamily: fonts.regular, fontSize: 12, color: colors.gray[400] },
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
    inputReadOnly: { backgroundColor: colors.gray[100], color: colors.gray[500] },
    inputNote: { fontFamily: fonts.regular, fontSize: 12, color: colors.gray[400], marginTop: spacing.xs },
    cancelButton: {
      flex: 1,
      backgroundColor: card.backgroundColor,
      borderRadius: borderRadius.lg,
      borderWidth: 1.5,
      borderColor: card.borderColor,
      paddingVertical: spacing.md + 2,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    cancelButtonText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.gray[700] },
    saveButtonWrapper: {
      flex: 1,
      backgroundColor: colors.primary[600],
      borderRadius: borderRadius.lg,
      overflow: 'hidden' as const,
    },
    saveButtonText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.white },
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
        <Text style={themedStyles.headerTitle}>{t.profile.settings.title}</Text>
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
            entering={FadeInDown.delay(100).duration(500).springify().damping(18)}
            style={themedStyles.card}
          >
            <Text style={themedStyles.sectionTitle}>{t.profile.settings.profilePhoto}</Text>
            <View style={styles.photoSection}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: user?.imageUrl }}
                  style={themedStyles.avatar}
                  contentFit="cover"
                  transition={200}
                />
                <TouchableOpacity
                  style={themedStyles.cameraButton}
                  onPress={handleChangePhoto}
                  activeOpacity={0.7}
                >
                  <Camera size={14} color={colors.white} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={handleChangePhoto} activeOpacity={0.7}>
                <Text style={themedStyles.changePhotoText}>
                  {t.profile.settings.changePhoto}
                </Text>
              </TouchableOpacity>
              <Text style={themedStyles.photoNote}>{t.profile.settings.photoNote}</Text>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).duration(500).springify().damping(18)}
            style={themedStyles.card}
          >
            <Text style={themedStyles.sectionTitle}>
              {t.profile.settings.personalInfo}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={themedStyles.inputLabel}>{t.profile.settings.firstName}</Text>
              <TextInput
                style={themedStyles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder={t.profile.settings.firstNamePlaceholder}
                placeholderTextColor={colors.gray[400]}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={themedStyles.inputLabel}>{t.profile.settings.lastName}</Text>
              <TextInput
                style={themedStyles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder={t.profile.settings.lastNamePlaceholder}
                placeholderTextColor={colors.gray[400]}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={themedStyles.inputLabel}>{t.profile.settings.email}</Text>
              <TextInput
                style={[themedStyles.input, themedStyles.inputReadOnly]}
                value={email}
                editable={false}
              />
              <Text style={themedStyles.inputNote}>{t.profile.settings.emailNote}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={themedStyles.inputLabel}>📞 Numéro de téléphone</Text>
              <View style={[themedStyles.input, themedStyles.inputReadOnly]}>
                <Text style={{ color: phone ? colors.gray[700] : colors.gray[400], fontFamily: fonts.regular, fontSize: 15 }}>
                  {phone || 'Non renseigné'}
                </Text>
              </View>
              <Text style={themedStyles.inputNote}>Utilisez le modal de profil pour modifier votre numéro</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={themedStyles.inputLabel}>📍 Ville</Text>
              <View style={[themedStyles.input, themedStyles.inputReadOnly]}>
                <Text style={{ color: city ? colors.gray[700] : colors.gray[400], fontFamily: fonts.regular, fontSize: 15 }}>
                  {city || 'Non renseignée'}
                </Text>
              </View>
              <Text style={themedStyles.inputNote}>Utilisez le modal de profil pour modifier votre ville</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={themedStyles.inputLabel}>📦 Dépôt de Réception</Text>
              <View style={[themedStyles.input, themedStyles.inputReadOnly]}>
                <Text style={{ color: warehouseName ? colors.gray[700] : colors.gray[400], fontFamily: fonts.regular, fontSize: 15 }}>
                  {warehouseName || 'Non renseigné'}
                </Text>
              </View>
              <Text style={themedStyles.inputNote}>Utilisez le modal de profil pour modifier votre dépôt</Text>
            </View>

            {/* Delete Info Button */}
            {(phone || city || warehouseId) && (
              <TouchableOpacity
                style={[
                  styles.deleteButton,
                  {
                    backgroundColor: colors.red[50],
                    borderColor: colors.red[500],
                    borderWidth: 1.5,
                    borderRadius: borderRadius.lg,
                    paddingVertical: spacing.md,
                    marginTop: spacing.md,
                  },
                  deleting && { opacity: 0.5 },
                ]}
                onPress={handleDeleteInfo}
                disabled={deleting}
                activeOpacity={0.7}
              >
                {deleting ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <ActivityIndicator size="small" color={colors.red[600]} />
                    <Text style={{ fontFamily: fonts.semiBold, fontSize: 14, color: colors.red[600] }}>
                      Suppression...
                    </Text>
                  </View>
                ) : (
                  <Text style={{ fontFamily: fonts.semiBold, fontSize: 14, color: colors.red[600], textAlign: 'center' }}>
                    🗑️ Supprimer mes informations (téléphone, ville, dépôt)
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </Animated.View>


          <Animated.View
            entering={FadeInDown.delay(300).duration(500).springify().damping(18)}
            style={styles.buttonRow}
          >
            <TouchableOpacity
              style={themedStyles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Text style={themedStyles.cancelButtonText}>
                {t.profile.settings.cancel}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[themedStyles.saveButtonWrapper, saving && styles.disabled]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <View style={styles.saveButton}>
                  <ActivityIndicator size="small" color={colors.white} />
                  <Text style={themedStyles.saveButtonText}>
                    {t.profile.settings.saving}
                  </Text>
                </View>
              ) : (
                <View style={styles.saveButton}>
                  <Text style={themedStyles.saveButtonText}>
                    {t.profile.settings.save}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
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
  photoSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  disabled: {
    opacity: 0.7,
  },
  deleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
