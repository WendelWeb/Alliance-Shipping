import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/lib/themes/ThemeProvider';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { COUNTRIES, getCountryName, Country } from '@/lib/countries';
import { api } from '@/lib/api';

interface PhoneNumberModalProps {
  visible: boolean;
  onSuccess: () => void;
  missingPhone?: boolean;
  missingCity?: boolean;
  missingWarehouse?: boolean;
}

interface Warehouse {
  id: number;
  name: string;
  city: string;
  address: string;
  latitude: string;
  longitude: string;
  phone?: string;
  openingHours?: string;
}

export function PhoneNumberModal({
  visible,
  onSuccess,
  missingPhone = true,
  missingCity = true,
  missingWarehouse = true,
}: PhoneNumberModalProps) {
  const insets = useSafeAreaInsets();
  const { colors, fonts, spacing, borderRadius, isDark } = useTheme();
  const { t, locale } = useTranslation();

  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showWarehousePicker, setShowWarehousePicker] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(true);

  // Load available cities from API
  useEffect(() => {
    const loadCities = async () => {
      try {
        const response = await api.get<{ cities: { city: string }[] }>('/api/pricing/all');
        const cityNames = response.cities.map((c) => c.city);
        setCities(cityNames);
      } catch (error) {
        console.error('Error loading cities:', error);
        setCities([]);
      } finally {
        setIsLoadingCities(false);
      }
    };

    loadCities();
  }, []);

  // Load warehouses when city changes
  useEffect(() => {
    // CRITICAL: Clear warehouses immediately when city changes to prevent showing old data
    setWarehouses([]);
    setSelectedWarehouse(null);

    const loadWarehouses = async () => {
      if (!selectedCity || !missingWarehouse) {
        setIsLoadingWarehouses(false);
        return;
      }

      setIsLoadingWarehouses(true);

      try {
        const response = await api.get<{ success: boolean; warehouses: Warehouse[] }>(
          `/api/warehouses?city=${encodeURIComponent(selectedCity)}`
        );

        // Double-check: Only set warehouses if they match the selected city
        const validWarehouses = (response.warehouses || []).filter(
          (w) => w.city === selectedCity
        );

        setWarehouses(validWarehouses);

        // Auto-select if only one
        if (validWarehouses.length === 1) {
          setSelectedWarehouse(validWarehouses[0].id);
        }

        console.log(`✅ Loaded ${validWarehouses.length} warehouses for ${selectedCity}`);
      } catch (error) {
        console.error('Error loading warehouses:', error);
        setWarehouses([]);
      } finally {
        setIsLoadingWarehouses(false);
      }
    };

    loadWarehouses();
  }, [selectedCity, missingWarehouse]);

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const updateData: any = {};

      if (missingPhone && phoneNumber) {
        // Save phone WITH country code prefix (e.g., +50912345678)
        // Remove all non-digits from both dial code and phone number
        const dialDigitsOnly = selectedCountry.dial.replace(/\D/g, '');
        const phoneDigitsOnly = phoneNumber.replace(/\D/g, '');
        updateData.phone = '+' + dialDigitsOnly + phoneDigitsOnly;
        updateData.countryCode = selectedCountry.code;
      }

      if (missingCity && selectedCity) {
        updateData.city = selectedCity;
      }

      if (missingWarehouse && selectedWarehouse) {
        updateData.warehouseId = selectedWarehouse;
      }

      await api.patch('/api/user/profile', updateData);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSuccess();
    } catch (error) {
      console.error('Error updating profile:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', 'Impossible de sauvegarder les informations');
    } finally {
      setIsLoading(false);
    }
  };

  const isSubmitDisabled =
    isLoading ||
    isLoadingWarehouses ||
    (missingPhone && !phoneNumber) ||
    (missingCity && !selectedCity) ||
    (missingWarehouse && !selectedWarehouse);

  const selectedWarehouseData = warehouses.find(w => w.id === selectedWarehouse);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Ultra Compact Header with Gradient */}
        <LinearGradient
          colors={[colors.primary[600], colors.primary[700], colors.primary[800]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.md }]}
        >
          <View style={[styles.headerContent, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={styles.iconEmoji}>✨</Text>
            <Text style={[styles.title, { fontFamily: fonts.bold, color: colors.white, marginLeft: spacing.sm }]}>
              {t.phoneModal.title}
            </Text>
          </View>
        </LinearGradient>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { paddingHorizontal: spacing.lg, paddingVertical: spacing.xl }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Phone Number Section */}
          {missingPhone && (
            <View style={[styles.card, {
              backgroundColor: colors.white,
              borderRadius: borderRadius.xl,
              padding: spacing.xl,
              marginBottom: spacing.lg,
              shadowColor: colors.black,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 3,
            }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.labelIconContainer, { backgroundColor: colors.primary[50] }]}>
                  <Text style={styles.labelIcon}>📞</Text>
                </View>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={[styles.cardTitle, { fontFamily: fonts.semiBold, color: colors.gray[900], fontSize: 17 }]}>
                    {t.phoneModal.phoneNumber}
                  </Text>
                  <Text style={[styles.cardSubtitle, { fontFamily: fonts.regular, color: colors.gray[500], fontSize: 13, marginTop: 2 }]}>
                    {t.phoneModal.phoneSubtitle}
                  </Text>
                </View>
              </View>

              {/* Country Picker */}
              <TouchableOpacity
                onPress={() => {
                  setShowCountryPicker(true);
                  Haptics.selectionAsync();
                }}
                style={[styles.modernInput, {
                  backgroundColor: isDark ? colors.gray[800] : colors.gray[50],
                  borderColor: isDark ? colors.gray[700] : colors.gray[200],
                  borderRadius: borderRadius.xl,
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.lg,
                  marginTop: spacing.lg,
                  marginBottom: spacing.md,
                }]}
              >
                <Text style={{ fontFamily: fonts.medium, color: colors.gray[900], fontSize: 16 }}>
                  {selectedCountry.flag}  {getCountryName(selectedCountry, locale)} ({selectedCountry.dial})
                </Text>
                <Text style={{ fontFamily: fonts.regular, color: colors.gray[400], fontSize: 20 }}>›</Text>
              </TouchableOpacity>

              {/* Phone Input */}
              <View style={[styles.phoneInputRow, { gap: spacing.md }]}>
                <View style={[styles.dialCode, {
                  backgroundColor: isDark ? colors.gray[700] : colors.primary[50],
                  borderRadius: borderRadius.xl,
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.lg,
                }]}>
                  <Text style={{ fontFamily: fonts.semiBold, color: colors.primary[700], fontSize: 16 }}>
                    {selectedCountry.dial}
                  </Text>
                </View>
                <TextInput
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder={t.phoneModal.enterPhone}
                  placeholderTextColor={colors.gray[400]}
                  keyboardType="phone-pad"
                  style={[styles.phoneInput, {
                    backgroundColor: isDark ? colors.gray[800] : colors.gray[50],
                    borderColor: isDark ? colors.gray[700] : colors.gray[200],
                    borderRadius: borderRadius.xl,
                    borderWidth: 1,
                    paddingHorizontal: spacing.lg,
                    paddingVertical: spacing.lg,
                    fontFamily: fonts.medium,
                    color: colors.gray[900],
                    fontSize: 16,
                  }]}
                />
              </View>
            </View>
          )}

          {/* City Section */}
          {missingCity && (
            <View style={[styles.card, {
              backgroundColor: colors.white,
              borderRadius: borderRadius.xl,
              padding: spacing.xl,
              marginBottom: spacing.lg,
              shadowColor: colors.black,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 3,
            }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.labelIconContainer, { backgroundColor: colors.emerald[50] }]}>
                  <Text style={styles.labelIcon}>📍</Text>
                </View>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={[styles.cardTitle, { fontFamily: fonts.semiBold, color: colors.gray[900], fontSize: 17 }]}>
                    {t.phoneModal.city}
                  </Text>
                  <Text style={[styles.cardSubtitle, { fontFamily: fonts.regular, color: colors.gray[500], fontSize: 13, marginTop: 2 }]}>
                    {t.phoneModal.citySubtitle}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setShowCityPicker(true);
                  Haptics.selectionAsync();
                }}
                style={[styles.modernInput, {
                  backgroundColor: isDark ? colors.gray[800] : colors.gray[50],
                  borderColor: isDark ? colors.gray[700] : colors.gray[200],
                  borderRadius: borderRadius.xl,
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.lg,
                  marginTop: spacing.lg,
                }]}
              >
                <Text style={{ fontFamily: fonts.medium, color: selectedCity ? colors.gray[900] : colors.gray[400], fontSize: 16, flex: 1 }}>
                  {selectedCity || t.phoneModal.selectCity}
                </Text>
                <Text style={{ fontFamily: fonts.regular, color: colors.gray[400], fontSize: 20 }}>›</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Warehouse Section */}
          {missingWarehouse && selectedCity && (
            <View style={[styles.card, {
              backgroundColor: colors.white,
              borderRadius: borderRadius.xl,
              padding: spacing.xl,
              marginBottom: spacing.lg,
              shadowColor: colors.black,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 3,
            }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.labelIconContainer, { backgroundColor: colors.orange[50] }]}>
                  <Text style={styles.labelIcon}>🏢</Text>
                </View>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={[styles.cardTitle, { fontFamily: fonts.semiBold, color: colors.gray[900], fontSize: 17 }]}>
                    {t.phoneModal.warehouse}
                  </Text>
                  <Text style={[styles.cardSubtitle, { fontFamily: fonts.regular, color: colors.gray[500], fontSize: 13, marginTop: 2 }]}>
                    {t.phoneModal.warehouseSubtitle}
                  </Text>
                </View>
              </View>

              {isLoadingWarehouses ? (
                <View style={[styles.loadingContainer, { paddingVertical: spacing.xl, marginTop: spacing.lg }]}>
                  <ActivityIndicator size="large" color={colors.primary[600]} />
                  <Text style={{ fontFamily: fonts.regular, color: colors.gray[600], marginTop: spacing.sm, fontSize: 14 }}>
                    {t.phoneModal.loadingWarehouses}
                  </Text>
                </View>
              ) : warehouses.length === 0 ? (
                <View style={[styles.emptyContainer, {
                  backgroundColor: colors.yellow[50],
                  borderRadius: borderRadius.xl,
                  padding: spacing.lg,
                  marginTop: spacing.lg,
                }]}>
                  <Text style={{ fontFamily: fonts.medium, color: colors.yellow[800], textAlign: 'center', fontSize: 14 }}>
                    {t.phoneModal.noWarehousesAvailable}
                  </Text>
                </View>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={() => {
                      setShowWarehousePicker(true);
                      Haptics.selectionAsync();
                    }}
                    style={[styles.modernInput, {
                      backgroundColor: isDark ? colors.gray[800] : colors.gray[50],
                      borderColor: isDark ? colors.gray[700] : colors.gray[200],
                      borderRadius: borderRadius.xl,
                      paddingHorizontal: spacing.lg,
                      paddingVertical: spacing.lg,
                      marginTop: spacing.lg,
                    }]}
                  >
                    <Text style={{ fontFamily: fonts.medium, color: selectedWarehouse ? colors.gray[900] : colors.gray[400], fontSize: 16, flex: 1 }}>
                      {selectedWarehouseData ? selectedWarehouseData.name : t.phoneModal.selectWarehouse}
                    </Text>
                    <Text style={{ fontFamily: fonts.regular, color: colors.gray[400], fontSize: 20 }}>›</Text>
                  </TouchableOpacity>

                  {/* Warehouse Details Card */}
                  {selectedWarehouseData && (
                    <View style={[styles.warehouseDetailsCard, {
                      backgroundColor: colors.primary[50],
                      borderRadius: borderRadius.xl,
                      padding: spacing.lg,
                      marginTop: spacing.md,
                    }]}>
                      <Text style={{ fontFamily: fonts.semiBold, color: colors.primary[900], fontSize: 15, marginBottom: spacing.sm }}>
                        📍 {selectedWarehouseData.name}
                      </Text>
                      <Text style={{ fontFamily: fonts.regular, color: colors.primary[800], fontSize: 14, lineHeight: 20 }}>
                        {selectedWarehouseData.address}
                      </Text>
                      {selectedWarehouseData.phone && (
                        <Text style={{ fontFamily: fonts.regular, color: colors.primary[800], fontSize: 14, marginTop: spacing.xs }}>
                          📞 {selectedWarehouseData.phone}
                        </Text>
                      )}
                      {selectedWarehouseData.openingHours && (
                        <Text style={{ fontFamily: fonts.regular, color: colors.primary[800], fontSize: 14, marginTop: spacing.xs }}>
                          🕐 {selectedWarehouseData.openingHours}
                        </Text>
                      )}
                      <TouchableOpacity
                        onPress={() => {
                          const url = `https://maps.google.com/?q=${selectedWarehouseData.latitude},${selectedWarehouseData.longitude}&entry=gps&g_st=awb`;
                          Linking.openURL(url);
                        }}
                        style={{
                          marginTop: spacing.md,
                          backgroundColor: colors.primary[600],
                          borderRadius: borderRadius.lg,
                          paddingVertical: spacing.sm,
                          paddingHorizontal: spacing.md,
                          alignSelf: 'flex-start',
                        }}
                      >
                        <Text style={{ fontFamily: fonts.semiBold, color: colors.white, fontSize: 14 }}>
                          🗺️ {t.phoneModal.viewOnMaps}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </View>
          )}
        </ScrollView>

        {/* Elegant Footer with Gradient Button */}
        <View style={[styles.footer, {
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.lg,
          paddingBottom: spacing.lg + insets.bottom,
          backgroundColor: colors.white,
          borderTopWidth: 0,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 8,
        }]}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitDisabled}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={isSubmitDisabled
                ? [colors.gray[300], colors.gray[400]]
                : [colors.primary[600], colors.primary[700], colors.primary[800]]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.submitButton, {
                borderRadius: borderRadius.xl,
                paddingVertical: spacing.lg + 2,
                shadowColor: isSubmitDisabled ? 'transparent' : colors.primary[600],
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: isSubmitDisabled ? 0 : 6,
              }]}
            >
              {isLoading ? (
                <View style={styles.loadingButton}>
                  <ActivityIndicator size="small" color={colors.white} />
                  <Text style={[styles.submitButtonText, { fontFamily: fonts.bold, color: colors.white, marginLeft: spacing.sm, fontSize: 17 }]}>
                    {t.phoneModal.saving}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.submitButtonText, { fontFamily: fonts.bold, color: colors.white, fontSize: 17 }]}>
                  ✨ {t.phoneModal.saveInformation}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Country Picker Modal - Improved UI */}
        <Modal visible={showCountryPicker} animationType="slide" transparent>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowCountryPicker(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={[styles.pickerModal, {
                backgroundColor: colors.white,
                borderTopLeftRadius: borderRadius.xl * 1.5,
                borderTopRightRadius: borderRadius.xl * 1.5,
                paddingBottom: insets.bottom,
              }]}
            >
              <View style={[styles.pickerHeader, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 0 }]}>
                <View style={{ alignItems: 'center', paddingVertical: spacing.xs }}>
                  <View style={{ width: 40, height: 4, backgroundColor: colors.gray[300], borderRadius: 2 }} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs }}>
                  <Text style={[styles.pickerTitle, { fontFamily: fonts.bold, color: colors.gray[900], fontSize: 18 }]}>
                    {t.phoneModal.country}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowCountryPicker(false)}
                    style={{ padding: spacing.xs }}
                  >
                    <Text style={{ fontFamily: fonts.semiBold, color: colors.primary[600], fontSize: 16 }}>
                      {t.phoneModal.close || 'Fermer'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <ScrollView
                style={{ maxHeight: 500, backgroundColor: colors.white }}
                contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.lg }}
              >
                {COUNTRIES.map((country, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setSelectedCountry(country);
                      setShowCountryPicker(false);
                      Haptics.selectionAsync();
                    }}
                    style={[styles.pickerItemCard, {
                      backgroundColor: selectedCountry.code === country.code ? colors.primary[50] : colors.gray[50],
                      borderRadius: borderRadius.lg,
                      paddingHorizontal: spacing.lg,
                      paddingVertical: spacing.md,
                      marginVertical: spacing.xs,
                      borderWidth: selectedCountry.code === country.code ? 2 : 0,
                      borderColor: colors.primary[600],
                    }]}
                  >
                    <Text style={{ fontFamily: fonts.semiBold, color: selectedCountry.code === country.code ? colors.primary[900] : colors.gray[900], fontSize: 16 }}>
                      {country.flag}  {getCountryName(country, locale)}
                    </Text>
                    <Text style={{ fontFamily: fonts.regular, color: selectedCountry.code === country.code ? colors.primary[700] : colors.gray[600], fontSize: 14, marginTop: 2 }}>
                      {country.dial}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* City Picker Modal - Improved UI */}
        <Modal visible={showCityPicker} animationType="slide" transparent>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowCityPicker(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={[styles.pickerModal, {
                backgroundColor: colors.white,
                borderTopLeftRadius: borderRadius.xl * 1.5,
                borderTopRightRadius: borderRadius.xl * 1.5,
                paddingBottom: insets.bottom,
              }]}
            >
              <View style={[styles.pickerHeader, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 0 }]}>
                <View style={{ alignItems: 'center', paddingVertical: spacing.xs }}>
                  <View style={{ width: 40, height: 4, backgroundColor: colors.gray[300], borderRadius: 2 }} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs }}>
                  <Text style={[styles.pickerTitle, { fontFamily: fonts.bold, color: colors.gray[900], fontSize: 18 }]}>
                    {t.phoneModal.selectCity}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowCityPicker(false)}
                    style={{ padding: spacing.xs }}
                  >
                    <Text style={{ fontFamily: fonts.semiBold, color: colors.primary[600], fontSize: 16 }}>
                      {t.phoneModal.close || 'Fermer'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <ScrollView
                style={{ maxHeight: 500, backgroundColor: colors.white }}
                contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.lg }}
              >
                {isLoadingCities ? (
                  <View style={{ padding: spacing.xl, alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary[600]} />
                    <Text style={{ fontFamily: fonts.medium, color: colors.gray[600], marginTop: spacing.md, fontSize: 15 }}>
                      Chargement des villes...
                    </Text>
                  </View>
                ) : cities.length === 0 ? (
                  <View style={{ padding: spacing.xl, alignItems: 'center' }}>
                    <Text style={{ fontFamily: fonts.medium, color: colors.gray[500], fontSize: 15 }}>
                      Aucune ville disponible
                    </Text>
                  </View>
                ) : (
                  <>
                    {cities.map((city) => (
                      <TouchableOpacity
                        key={city}
                        onPress={() => {
                          setSelectedCity(city);
                          setShowCityPicker(false);
                          Haptics.selectionAsync();
                        }}
                        style={[styles.pickerItemCard, {
                          backgroundColor: selectedCity === city ? colors.emerald[50] : colors.gray[50],
                          borderRadius: borderRadius.lg,
                          paddingHorizontal: spacing.lg,
                          paddingVertical: spacing.md + 2,
                          marginVertical: spacing.xs,
                          borderWidth: selectedCity === city ? 2 : 0,
                          borderColor: colors.emerald[600],
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }]}
                      >
                        <Text style={{ fontFamily: fonts.semiBold, color: selectedCity === city ? colors.emerald[900] : colors.gray[900], fontSize: 16 }}>
                          📍 {city}
                        </Text>
                        {selectedCity === city && (
                          <Text style={{ fontSize: 20, color: colors.emerald[600] }}>✓</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Warehouse Picker Modal - Improved UI */}
        <Modal visible={showWarehousePicker} animationType="slide" transparent>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowWarehousePicker(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={[styles.pickerModal, {
                backgroundColor: colors.white,
                borderTopLeftRadius: borderRadius.xl * 1.5,
                borderTopRightRadius: borderRadius.xl * 1.5,
                paddingBottom: insets.bottom,
              }]}
            >
              <View style={[styles.pickerHeader, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 0 }]}>
                <View style={{ alignItems: 'center', paddingVertical: spacing.xs }}>
                  <View style={{ width: 40, height: 4, backgroundColor: colors.gray[300], borderRadius: 2 }} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs }}>
                  <Text style={[styles.pickerTitle, { fontFamily: fonts.bold, color: colors.gray[900], fontSize: 18 }]}>
                    {t.phoneModal.selectWarehouse}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowWarehousePicker(false)}
                    style={{ padding: spacing.xs }}
                  >
                    <Text style={{ fontFamily: fonts.semiBold, color: colors.primary[600], fontSize: 16 }}>
                      {t.phoneModal.close || 'Fermer'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <ScrollView
                style={{ maxHeight: 500, backgroundColor: colors.white }}
                contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.lg }}
              >
                {warehouses.map((warehouse) => (
                  <TouchableOpacity
                    key={warehouse.id}
                    onPress={() => {
                      setSelectedWarehouse(warehouse.id);
                      setShowWarehousePicker(false);
                      Haptics.selectionAsync();
                    }}
                    style={[styles.pickerItemCard, {
                      backgroundColor: selectedWarehouse === warehouse.id ? colors.orange[50] : colors.gray[50],
                      borderRadius: borderRadius.lg,
                      padding: spacing.md,
                      marginVertical: spacing.xs,
                      borderWidth: selectedWarehouse === warehouse.id ? 2 : 0,
                      borderColor: colors.orange[600],
                    }]}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: fonts.bold, color: selectedWarehouse === warehouse.id ? colors.orange[900] : colors.gray[900], fontSize: 16, marginBottom: spacing.xs }}>
                          🏢 {warehouse.name}
                        </Text>
                        <Text style={{ fontFamily: fonts.regular, color: selectedWarehouse === warehouse.id ? colors.orange[800] : colors.gray[600], fontSize: 14, lineHeight: 20 }}>
                          📍 {warehouse.address}
                        </Text>
                        {warehouse.phone && (
                          <Text style={{ fontFamily: fonts.regular, color: selectedWarehouse === warehouse.id ? colors.orange[800] : colors.gray[600], fontSize: 14, marginTop: spacing.xs }}>
                            📞 {warehouse.phone}
                          </Text>
                        )}
                      </View>
                      {selectedWarehouse === warehouse.id && (
                        <Text style={{ fontSize: 22, color: colors.orange[600], marginLeft: spacing.sm }}>✓</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {},
  headerContent: {},
  iconContainer: {},
  iconCircle: {},
  iconEmoji: {
    fontSize: 20,
  },
  title: {
    fontSize: 18,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  card: {},
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelIcon: {
    fontSize: 24,
  },
  cardTitle: {},
  cardSubtitle: {},
  modernInput: {
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  picker: {
    borderWidth: 2,
  },
  phoneInputRow: {
    flexDirection: 'row',
  },
  dialCode: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneInput: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    borderWidth: 2,
  },
  warehouseDetails: {
    borderWidth: 2,
  },
  warehouseDetailsCard: {},
  footer: {},
  submitButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
  },
  loadingButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerTitle: {},
  pickerItem: {},
  pickerItemCard: {},
  warehouseItem: {},
});
