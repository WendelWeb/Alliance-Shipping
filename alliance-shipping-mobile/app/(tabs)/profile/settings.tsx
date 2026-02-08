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
  const { colors, fonts, spacing, borderRadius, shadows } = useTheme();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [warehouseId, setWarehouseId] = useState<number | null>(null);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showWarehousePicker, setShowWarehousePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const HAITI_CITIES = [
    'Port-au-Prince',
    'Cap-Haïtien',
    'Port-de-Paix',
    'Gonaïves',
    'Saint-Marc',
    'Les Cayes',
    'Pétion-Ville',
    'Delmas',
    'Carrefour',
    'Jacmel',
  ];

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        setFirstName(user.firstName || '');
        setLastName(user.lastName || '');
        setPhone(user.primaryPhoneNumber?.phoneNumber || '');

        // Load city and warehouse from API
        try {
          const { api } = await import('@/lib/api');
          const response = await api.get<{ success: boolean; user: any }>('/api/user/profile');
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
        return;
      }

      setLoadingWarehouses(true);
      try {
        const { api } = await import('@/lib/api');
        const response = await api.get<{ success: boolean; warehouses: any[] }>(
          `/api/warehouses?city=${encodeURIComponent(city)}`
        );
        setWarehouses(response.warehouses || []);
      } catch (error) {
        console.error('Error loading warehouses:', error);
        setWarehouses([]);
      } finally {
        setLoadingWarehouses(false);
      }
    };

    loadWarehouses();
  }, [city]);

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
      // Update Clerk profile
      await user.update({
        firstName,
        lastName,
      });

      // Update city and warehouse in our database
      const { api } = await import('@/lib/api');
      await api.patch('/api/user/profile', { city, warehouseId });

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
      backgroundColor: colors.white,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      ...shadows.md,
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
      borderColor: colors.white,
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
      backgroundColor: colors.white,
      borderRadius: borderRadius.lg,
      borderWidth: 1.5,
      borderColor: colors.gray[300],
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
              <Text style={themedStyles.inputLabel}>{t.profile.settings.phone}</Text>
              <TextInput
                style={themedStyles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder={t.profile.settings.phonePlaceholder}
                placeholderTextColor={colors.gray[400]}
                keyboardType="phone-pad"
              />
              <Text style={themedStyles.inputNote}>{t.profile.settings.phoneNote}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={themedStyles.inputLabel}>Ville</Text>
              <TouchableOpacity
                style={themedStyles.input}
                onPress={() => setShowCityPicker(true)}
                activeOpacity={0.7}
              >
                <Text style={{ color: city ? colors.gray[900] : colors.gray[400], fontFamily: fonts.regular, fontSize: 15 }}>
                  {city || 'Sélectionnez votre ville'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={themedStyles.inputLabel}>📦 Dépôt de Réception</Text>
              {loadingWarehouses ? (
                <View style={[themedStyles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}>
                  <ActivityIndicator size="small" color={colors.primary[600]} />
                  <Text style={{ color: colors.gray[500], marginLeft: spacing.sm, fontFamily: fonts.regular, fontSize: 14 }}>
                    Chargement...
                  </Text>
                </View>
              ) : city && warehouses.length > 0 ? (
                <TouchableOpacity
                  style={themedStyles.input}
                  onPress={() => setShowWarehousePicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: warehouseId ? colors.gray[900] : colors.gray[400], fontFamily: fonts.regular, fontSize: 15 }}>
                    {warehouseId
                      ? warehouses.find(w => w.id === warehouseId)?.name || 'Sélectionnez un dépôt'
                      : 'Sélectionnez un dépôt'}
                  </Text>
                </TouchableOpacity>
              ) : city && !loadingWarehouses ? (
                <View style={[themedStyles.input, { backgroundColor: colors.yellow[50] }]}>
                  <Text style={{ color: colors.yellow[800], fontFamily: fonts.regular, fontSize: 14 }}>
                    Aucun dépôt disponible
                  </Text>
                </View>
              ) : (
                <View style={themedStyles.input}>
                  <Text style={{ color: colors.gray[400], fontFamily: fonts.regular, fontSize: 14 }}>
                    Sélectionnez d'abord une ville
                  </Text>
                </View>
              )}
              <Text style={themedStyles.inputNote}>Le dépôt où vous récupérerez vos colis</Text>
            </View>
          </Animated.View>

          {/* City Picker Modal */}
          <Modal
            visible={showCityPicker}
            transparent
            animationType="slide"
          >
            <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <View style={{ backgroundColor: colors.white, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, padding: spacing.xl, maxHeight: '60%' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
                  <Text style={{ fontFamily: fonts.semiBold, fontSize: 18, color: colors.gray[900] }}>Sélectionnez une ville</Text>
                  <TouchableOpacity onPress={() => setShowCityPicker(false)}>
                    <Text style={{ fontFamily: fonts.semiBold, color: colors.primary[600] }}>Fermer</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView>
                  {HAITI_CITIES.map((cityName) => (
                    <TouchableOpacity
                      key={cityName}
                      onPress={() => {
                        setCity(cityName);
                        setWarehouseId(null); // Reset warehouse when city changes
                        setShowCityPicker(false);
                        Haptics.selectionAsync();
                      }}
                      style={{
                        paddingVertical: spacing.md,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.gray[100],
                      }}
                    >
                      <Text style={{
                        fontFamily: city === cityName ? fonts.semiBold : fonts.regular,
                        fontSize: 16,
                        color: city === cityName ? colors.primary[600] : colors.gray[900],
                      }}>
                        {cityName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* Warehouse Picker Modal */}
          <Modal
            visible={showWarehousePicker}
            transparent
            animationType="slide"
          >
            <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <View style={{ backgroundColor: colors.white, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, padding: spacing.xl, maxHeight: '70%' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
                  <Text style={{ fontFamily: fonts.semiBold, fontSize: 18, color: colors.gray[900] }}>Sélectionnez un dépôt</Text>
                  <TouchableOpacity onPress={() => setShowWarehousePicker(false)}>
                    <Text style={{ fontFamily: fonts.semiBold, color: colors.primary[600] }}>Fermer</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView>
                  {warehouses.map((warehouse) => (
                    <TouchableOpacity
                      key={warehouse.id}
                      onPress={() => {
                        setWarehouseId(warehouse.id);
                        setShowWarehousePicker(false);
                        Haptics.selectionAsync();
                      }}
                      style={{
                        paddingVertical: spacing.md,
                        paddingHorizontal: spacing.sm,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.gray[100],
                        backgroundColor: warehouseId === warehouse.id ? colors.primary[50] : 'transparent',
                        borderRadius: borderRadius.md,
                      }}
                    >
                      <Text style={{
                        fontFamily: fonts.semiBold,
                        fontSize: 15,
                        color: warehouseId === warehouse.id ? colors.primary[700] : colors.gray[900],
                        marginBottom: spacing.xs,
                      }}>
                        📦 {warehouse.name}
                      </Text>
                      <Text style={{
                        fontFamily: fonts.regular,
                        fontSize: 13,
                        color: colors.gray[600],
                      }}>
                        📍 {warehouse.address}
                      </Text>
                      {warehouse.phone && (
                        <Text style={{
                          fontFamily: fonts.regular,
                          fontSize: 13,
                          color: colors.gray[600],
                          marginTop: 2,
                        }}>
                          📞 {warehouse.phone}
                        </Text>
                      )}
                      {warehouse.openingHours && (
                        <Text style={{
                          fontFamily: fonts.regular,
                          fontSize: 13,
                          color: colors.gray[600],
                          marginTop: 2,
                        }}>
                          🕐 {warehouse.openingHours}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>

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
    paddingBottom: 40,
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
});
