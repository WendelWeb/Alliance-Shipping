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
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Camera, ChevronDown } from 'lucide-react-native';
import { useTheme } from '@/lib/themes/ThemeProvider';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { api } from '@/lib/api';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, fonts, spacing, borderRadius, shadows, card, isDark } = useTheme();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [city, setCity] = useState('');
  const [warehouseId, setWarehouseId] = useState<number | null>(null);
  const [warehouseName, setWarehouseName] = useState('');
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [loadingCities, setLoadingCities] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showWarehousePicker, setShowWarehousePicker] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        setFirstName(user.firstName || '');
        setLastName(user.lastName || '');

        try {
          const response = await api.get<{ success: boolean; user: any }>('/api/user/profile');

          if (response.user?.phone) setPhone(response.user.phone);
          if (response.user?.whatsappPhone) setWhatsappPhone(response.user.whatsappPhone);
          if (response.user?.city) setCity(response.user.city);
          if (response.user?.warehouseId) setWarehouseId(response.user.warehouseId);
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
    };

    const loadCities = async () => {
      try {
        const response = await api.get<{ cities: { city: string }[] }>('/api/pricing/all');
        setCities(response.cities.map((c) => c.city));
      } catch (error) {
        console.error('Error loading cities:', error);
      } finally {
        setLoadingCities(false);
      }
    };

    loadUserData();
    loadCities();
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
        const response = await api.get<{ success: boolean; warehouses: any[] }>(
          `/api/warehouses?city=${encodeURIComponent(city)}`
        );
        const wh = response.warehouses || [];
        setWarehouses(wh);

        // Auto-select if only one warehouse
        if (wh.length === 1 && !warehouseId) {
          setWarehouseId(wh[0].id);
          setWarehouseName(wh[0].name);
        } else if (warehouseId && wh.length > 0) {
          const warehouse = wh.find((w: any) => w.id === warehouseId);
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

  const handleChangePhoto = async () => {
    try {
      const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permResult.granted) {
        Alert.alert('Permission requise', 'Autorisez l\'accès aux photos pour changer votre photo de profil.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]) return;

      setUploadingPhoto(true);
      const asset = result.assets[0];

      // Convert to blob for Clerk
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const file = new File([blob], 'profile.jpg', { type: asset.mimeType || 'image/jpeg' });

      await user?.setProfileImage({ file });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      console.error('Error uploading photo:', err);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t.profile.settings.error, t.profile.settings.imageUploadFailed || 'Impossible de mettre à jour la photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Update Clerk profile (first and last name)
      await user.update({ firstName, lastName });

      // Update DB profile (phone, whatsapp, city, warehouse)
      const updateData: any = {};
      if (phone) updateData.phone = phone;
      if (whatsappPhone) updateData.whatsappPhone = whatsappPhone;
      if (city) updateData.city = city;
      if (warehouseId) updateData.warehouseId = warehouseId;

      if (Object.keys(updateData).length > 0) {
        await api.patch('/api/user/profile', updateData);
      }

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
              await api.patch('/api/user/profile', {
                phone: null,
                whatsappPhone: null,
                city: null,
                warehouseId: null,
              });

              // Clear local state
              setPhone('');
              setWhatsappPhone('');
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
      backgroundColor: colors.gray[100],
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.gray[200],
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md + 2,
      fontSize: 15,
      fontFamily: fonts.regular,
      color: colors.gray[900],
    },
    inputReadOnly: { backgroundColor: colors.gray[200], color: colors.gray[500] },
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
    saveButtonText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.white, textAlign: 'center' as const },
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
                {uploadingPhoto && (
                  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 44, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="small" color="#ffffff" />
                  </View>
                )}
                <TouchableOpacity
                  style={themedStyles.cameraButton}
                  onPress={handleChangePhoto}
                  activeOpacity={0.7}
                  disabled={uploadingPhoto}
                >
                  <Camera size={14} color={colors.white} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={handleChangePhoto} activeOpacity={0.7} disabled={uploadingPhoto}>
                <Text style={themedStyles.changePhotoText}>
                  {uploadingPhoto ? (t.profile.settings.uploading || 'Chargement...') : t.profile.settings.changePhoto}
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
              <Text style={themedStyles.inputLabel}>{t.profile.settings.phoneLabel || '📞 Numéro de téléphone'}</Text>
              <TextInput
                style={themedStyles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+50912345678"
                placeholderTextColor={colors.gray[400]}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={themedStyles.inputLabel}>{t.profile.settings.whatsappLabel || '💬 Numéro WhatsApp'}</Text>
              <TextInput
                style={themedStyles.input}
                value={whatsappPhone}
                onChangeText={setWhatsappPhone}
                placeholder="+50912345678"
                placeholderTextColor={colors.gray[400]}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={themedStyles.inputLabel}>{t.profile.settings.cityLabel || '📍 Ville'}</Text>
              <TouchableOpacity
                onPress={() => setShowCityPicker(true)}
                style={[themedStyles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                activeOpacity={0.7}
              >
                <Text style={{ color: city ? colors.gray[900] : colors.gray[400], fontFamily: fonts.regular, fontSize: 15 }}>
                  {city || (t.profile.settings.selectCity || 'Sélectionner une ville')}
                </Text>
                <ChevronDown size={18} color={colors.gray[400]} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={themedStyles.inputLabel}>{t.profile.settings.warehouseLabel || '📦 Dépôt de Réception'}</Text>
              <TouchableOpacity
                onPress={() => city ? setShowWarehousePicker(true) : null}
                style={[themedStyles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, !city && { opacity: 0.5 }]}
                activeOpacity={0.7}
                disabled={!city}
              >
                <Text style={{ color: warehouseName ? colors.gray[900] : colors.gray[400], fontFamily: fonts.regular, fontSize: 15 }}>
                  {warehouseName || (t.profile.settings.selectWarehouse || 'Sélectionner un dépôt')}
                </Text>
                <ChevronDown size={18} color={colors.gray[400]} />
              </TouchableOpacity>
              {!city && <Text style={themedStyles.inputNote}>{t.profile.settings.selectCityFirst || 'Sélectionnez une ville d\'abord'}</Text>}
            </View>

            {/* Delete Info Button */}
            {(phone || city || warehouseId) && (
              <TouchableOpacity
                style={[
                  styles.deleteButton,
                  {
                    backgroundColor: isDark ? colors.gray[200] : colors.red[50],
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

      {/* City Picker Modal */}
      <Modal visible={showCityPicker} animationType="slide" transparent>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCityPicker(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={[styles.pickerModal, { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: insets.bottom }]}
          >
            <View style={styles.pickerHeader}>
              <View style={{ alignItems: 'center', paddingVertical: 8 }}>
                <View style={{ width: 40, height: 4, backgroundColor: colors.gray[300], borderRadius: 2 }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 4 }}>
                <Text style={{ fontFamily: fonts.bold, color: colors.gray[900], fontSize: 18 }}>
                  {t.profile.settings.selectCity || 'Sélectionner une ville'}
                </Text>
                <TouchableOpacity onPress={() => setShowCityPicker(false)} style={{ padding: 4 }}>
                  <Text style={{ fontFamily: fonts.semiBold, color: colors.primary[600], fontSize: 16 }}>
                    {t.common.close || 'Fermer'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView style={{ maxHeight: 400 }} contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 16 }}>
              {cities.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => {
                    setCity(c);
                    setWarehouseId(null);
                    setWarehouseName('');
                    setShowCityPicker(false);
                    Haptics.selectionAsync();
                  }}
                  style={{
                    backgroundColor: city === c ? colors.primary[50] : colors.gray[50],
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    marginVertical: 4,
                    borderWidth: city === c ? 2 : 0,
                    borderColor: colors.primary[600],
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ fontFamily: fonts.semiBold, color: city === c ? colors.primary[600] : colors.gray[900], fontSize: 16 }}>
                    📍 {c}
                  </Text>
                  {city === c && <Text style={{ fontSize: 20, color: colors.primary[600] }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Warehouse Picker Modal */}
      <Modal visible={showWarehousePicker} animationType="slide" transparent>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowWarehousePicker(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={[styles.pickerModal, { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: insets.bottom }]}
          >
            <View style={styles.pickerHeader}>
              <View style={{ alignItems: 'center', paddingVertical: 8 }}>
                <View style={{ width: 40, height: 4, backgroundColor: colors.gray[300], borderRadius: 2 }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 4 }}>
                <Text style={{ fontFamily: fonts.bold, color: colors.gray[900], fontSize: 18 }}>
                  {t.profile.settings.selectWarehouse || 'Sélectionner un dépôt'}
                </Text>
                <TouchableOpacity onPress={() => setShowWarehousePicker(false)} style={{ padding: 4 }}>
                  <Text style={{ fontFamily: fonts.semiBold, color: colors.primary[600], fontSize: 16 }}>
                    {t.common.close || 'Fermer'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView style={{ maxHeight: 400 }} contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 16 }}>
              {loadingWarehouses ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={colors.primary[600]} />
                </View>
              ) : warehouses.map((w) => (
                <TouchableOpacity
                  key={w.id}
                  onPress={() => {
                    setWarehouseId(w.id);
                    setWarehouseName(w.name);
                    setShowWarehousePicker(false);
                    Haptics.selectionAsync();
                  }}
                  style={{
                    backgroundColor: warehouseId === w.id ? colors.primary[50] : colors.gray[50],
                    borderRadius: 12,
                    padding: 14,
                    marginVertical: 4,
                    borderWidth: warehouseId === w.id ? 2 : 0,
                    borderColor: colors.primary[600],
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: fonts.bold, color: warehouseId === w.id ? colors.primary[600] : colors.gray[900], fontSize: 16, marginBottom: 4 }}>
                        🏢 {w.name}
                      </Text>
                      <Text style={{ fontFamily: fonts.regular, color: colors.gray[600], fontSize: 14 }}>
                        📍 {w.address}
                      </Text>
                    </View>
                    {warehouseId === w.id && <Text style={{ fontSize: 22, color: colors.primary[600] }}>✓</Text>}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerModal: {
    maxHeight: '70%',
  },
  pickerHeader: {
    paddingBottom: 8,
  },
});
