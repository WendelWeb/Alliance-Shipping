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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
    const loadWarehouses = async () => {
      if (!selectedCity || !missingWarehouse) return;

      setIsLoadingWarehouses(true);
      setSelectedWarehouse(null);

      try {
        const response = await api.get<{ success: boolean; warehouses: Warehouse[] }>(
          `/api/warehouses?city=${encodeURIComponent(selectedCity)}`
        );
        setWarehouses(response.warehouses || []);

        // Auto-select if only one
        if (response.warehouses?.length === 1) {
          setSelectedWarehouse(response.warehouses[0].id);
        }
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
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet">
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary[600], paddingHorizontal: spacing.lg, paddingVertical: spacing.lg }]}>
          <Text style={[styles.title, { fontFamily: fonts.headingBold, color: colors.white }]}>
            {t.phoneModal.title}
          </Text>
          <Text style={[styles.subtitle, { fontFamily: fonts.regular, color: colors.primary[100] }]}>
            {t.phoneModal.descriptionAll}
          </Text>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { paddingHorizontal: spacing.lg, paddingVertical: spacing.xl }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Phone Number Section */}
          {missingPhone && (
            <View style={[styles.section, { marginBottom: spacing.xl }]}>
              <Text style={[styles.label, { fontFamily: fonts.semiBold, color: colors.gray[700], marginBottom: spacing.sm }]}>
                📞 {t.phoneModal.phoneNumber} <Text style={{ color: colors.red[500] }}>*</Text>
              </Text>

              {/* Country Picker */}
              <TouchableOpacity
                onPress={() => {
                  setShowCountryPicker(true);
                  Haptics.selectionAsync();
                }}
                style={[styles.picker, {
                  backgroundColor: colors.gray[50],
                  borderColor: colors.gray[200],
                  borderRadius: borderRadius.lg,
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.md + 2,
                  marginBottom: spacing.sm,
                }]}
              >
                <Text style={{ fontFamily: fonts.medium, color: colors.gray[900], fontSize: 15 }}>
                  {selectedCountry.flag} {getCountryName(selectedCountry, locale)} ({selectedCountry.dial})
                </Text>
              </TouchableOpacity>

              {/* Phone Input */}
              <View style={styles.phoneInputRow}>
                <View style={[styles.dialCode, {
                  backgroundColor: colors.gray[100],
                  borderColor: colors.gray[200],
                  borderRadius: borderRadius.lg,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.md + 2,
                }]}>
                  <Text style={{ fontFamily: fonts.semiBold, color: colors.gray[700], fontSize: 15 }}>
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
                    backgroundColor: colors.gray[50],
                    borderColor: colors.gray[200],
                    borderRadius: borderRadius.lg,
                    paddingHorizontal: spacing.lg,
                    paddingVertical: spacing.md + 2,
                    fontFamily: fonts.regular,
                    color: colors.gray[900],
                    fontSize: 15,
                  }]}
                />
              </View>
            </View>
          )}

          {/* City Section */}
          {missingCity && (
            <View style={[styles.section, { marginBottom: spacing.xl }]}>
              <Text style={[styles.label, { fontFamily: fonts.semiBold, color: colors.gray[700], marginBottom: spacing.sm }]}>
                📍 {t.phoneModal.city} <Text style={{ color: colors.red[500] }}>*</Text>
              </Text>

              <TouchableOpacity
                onPress={() => {
                  setShowCityPicker(true);
                  Haptics.selectionAsync();
                }}
                style={[styles.picker, {
                  backgroundColor: colors.gray[50],
                  borderColor: colors.gray[200],
                  borderRadius: borderRadius.lg,
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.md + 2,
                }]}
              >
                <Text style={{ fontFamily: fonts.medium, color: selectedCity ? colors.gray[900] : colors.gray[400], fontSize: 15 }}>
                  {selectedCity || t.phoneModal.selectCity}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Warehouse Section */}
          {missingWarehouse && selectedCity && (
            <View style={[styles.section, { marginBottom: spacing.xl }]}>
              <Text style={[styles.label, { fontFamily: fonts.semiBold, color: colors.gray[700], marginBottom: spacing.sm }]}>
                🏢 {t.phoneModal.warehouse} <Text style={{ color: colors.red[500] }}>*</Text>
              </Text>

              {isLoadingWarehouses ? (
                <View style={[styles.loadingContainer, { paddingVertical: spacing.xl }]}>
                  <ActivityIndicator size="large" color={colors.primary[600]} />
                  <Text style={{ fontFamily: fonts.regular, color: colors.gray[600], marginTop: spacing.sm, fontSize: 14 }}>
                    {t.phoneModal.loadingWarehouses}
                  </Text>
                </View>
              ) : warehouses.length === 0 ? (
                <View style={[styles.emptyContainer, {
                  backgroundColor: colors.yellow[50],
                  borderColor: colors.yellow[200],
                  borderRadius: borderRadius.lg,
                  padding: spacing.lg,
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
                    style={[styles.picker, {
                      backgroundColor: colors.gray[50],
                      borderColor: colors.gray[200],
                      borderRadius: borderRadius.lg,
                      paddingHorizontal: spacing.lg,
                      paddingVertical: spacing.md + 2,
                    }]}
                  >
                    <Text style={{ fontFamily: fonts.medium, color: selectedWarehouse ? colors.gray[900] : colors.gray[400], fontSize: 15 }}>
                      {selectedWarehouseData ? selectedWarehouseData.name : t.phoneModal.selectWarehouse}
                    </Text>
                  </TouchableOpacity>

                  {/* Warehouse Details */}
                  {selectedWarehouseData && (
                    <View style={[styles.warehouseDetails, {
                      backgroundColor: colors.primary[50],
                      borderColor: colors.primary[200],
                      borderRadius: borderRadius.lg,
                      padding: spacing.md,
                      marginTop: spacing.sm,
                    }]}>
                      <Text style={{ fontFamily: fonts.semiBold, color: colors.primary[900], fontSize: 14, marginBottom: spacing.xs }}>
                        📍 {selectedWarehouseData.name}
                      </Text>
                      <Text style={{ fontFamily: fonts.regular, color: colors.primary[800], fontSize: 13 }}>
                        {selectedWarehouseData.address}
                      </Text>
                      {selectedWarehouseData.phone && (
                        <Text style={{ fontFamily: fonts.regular, color: colors.primary[800], fontSize: 13, marginTop: 2 }}>
                          📞 {selectedWarehouseData.phone}
                        </Text>
                      )}
                      {selectedWarehouseData.openingHours && (
                        <Text style={{ fontFamily: fonts.regular, color: colors.primary[800], fontSize: 13, marginTop: 2 }}>
                          🕐 {selectedWarehouseData.openingHours}
                        </Text>
                      )}
                      <TouchableOpacity
                        onPress={() => {
                          const url = `https://maps.google.com/?q=${selectedWarehouseData.latitude},${selectedWarehouseData.longitude}&entry=gps&g_st=awb`;
                          Linking.openURL(url);
                        }}
                        style={{ marginTop: spacing.sm }}
                      >
                        <Text style={{ fontFamily: fonts.semiBold, color: colors.primary[600], fontSize: 13 }}>
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

        {/* Footer */}
        <View style={[styles.footer, {
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.lg,
          paddingBottom: spacing.lg + insets.bottom,
          backgroundColor: colors.surfaceSolid,
          borderTopWidth: 1,
          borderTopColor: colors.gray[200],
        }]}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitDisabled}
            style={[styles.submitButton, {
              backgroundColor: colors.primary[600],
              borderRadius: borderRadius.lg,
              paddingVertical: spacing.lg,
              opacity: isSubmitDisabled ? 0.5 : 1,
            }]}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <View style={styles.loadingButton}>
                <ActivityIndicator size="small" color={colors.white} />
                <Text style={[styles.submitButtonText, { fontFamily: fonts.semiBold, color: colors.white, marginLeft: spacing.sm }]}>
                  {t.phoneModal.saving}
                </Text>
              </View>
            ) : (
              <Text style={[styles.submitButtonText, { fontFamily: fonts.semiBold, color: colors.white }]}>
                {t.phoneModal.saveInformation}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Country Picker Modal */}
        <Modal visible={showCountryPicker} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.pickerModal, {
              backgroundColor: colors.surfaceSolid,
              borderTopLeftRadius: borderRadius.xl,
              borderTopRightRadius: borderRadius.xl,
              paddingBottom: insets.bottom,
            }]}>
              <View style={[styles.pickerHeader, { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.gray[200] }]}>
                <Text style={[styles.pickerTitle, { fontFamily: fonts.semiBold, color: colors.gray[900] }]}>
                  {t.phoneModal.country}
                </Text>
                <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                  <Text style={{ fontFamily: fonts.semiBold, color: colors.primary[600] }}>
                    {t.phoneModal.close || 'Fermer'}
                  </Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={{ maxHeight: 500, backgroundColor: colors.surfaceSolid }}>
                {COUNTRIES.map((country, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setSelectedCountry(country);
                      setShowCountryPicker(false);
                      Haptics.selectionAsync();
                    }}
                    style={[styles.pickerItem, {
                      paddingHorizontal: spacing.lg,
                      paddingVertical: spacing.md,
                      backgroundColor: selectedCountry.code === country.code ? (isDark ? colors.primary[900] : colors.primary[50]) : 'transparent',
                    }]}
                  >
                    <Text style={{ fontFamily: fonts.medium, color: selectedCountry.code === country.code ? (isDark ? colors.primary[100] : colors.primary[900]) : colors.gray[900], fontSize: 15 }}>
                      {country.flag} {getCountryName(country, locale)} ({country.dial})
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* City Picker Modal */}
        <Modal visible={showCityPicker} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.pickerModal, {
              backgroundColor: colors.surfaceSolid,
              borderTopLeftRadius: borderRadius.xl,
              borderTopRightRadius: borderRadius.xl,
              paddingBottom: insets.bottom,
            }]}>
              <View style={[styles.pickerHeader, { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.gray[200] }]}>
                <Text style={[styles.pickerTitle, { fontFamily: fonts.semiBold, color: colors.gray[900] }]}>
                  {t.phoneModal.selectCity}
                </Text>
                <TouchableOpacity onPress={() => setShowCityPicker(false)}>
                  <Text style={{ fontFamily: fonts.semiBold, color: colors.primary[600] }}>
                    {t.phoneModal.close || 'Fermer'}
                  </Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={{ maxHeight: 500, backgroundColor: colors.surfaceSolid }}>
                {isLoadingCities ? (
                  <View style={{ padding: spacing.xl, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color={colors.primary[500]} />
                    <Text style={{ fontFamily: fonts.regular, color: colors.gray[500], marginTop: spacing.sm }}>
                      Chargement des villes...
                    </Text>
                  </View>
                ) : cities.length === 0 ? (
                  <View style={{ padding: spacing.xl, alignItems: 'center' }}>
                    <Text style={{ fontFamily: fonts.regular, color: colors.gray[500] }}>
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
                        style={[styles.pickerItem, {
                          paddingHorizontal: spacing.lg,
                          paddingVertical: spacing.md,
                          backgroundColor: selectedCity === city ? (isDark ? colors.primary[900] : colors.primary[50]) : 'transparent',
                        }]}
                      >
                        <Text style={{ fontFamily: fonts.medium, color: selectedCity === city ? (isDark ? colors.primary[100] : colors.primary[900]) : colors.gray[900], fontSize: 15 }}>
                          {city}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Warehouse Picker Modal */}
        <Modal visible={showWarehousePicker} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.pickerModal, {
              backgroundColor: colors.surfaceSolid,
              borderTopLeftRadius: borderRadius.xl,
              borderTopRightRadius: borderRadius.xl,
              paddingBottom: insets.bottom,
            }]}>
              <View style={[styles.pickerHeader, { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.gray[200] }]}>
                <Text style={[styles.pickerTitle, { fontFamily: fonts.semiBold, color: colors.gray[900] }]}>
                  {t.phoneModal.selectWarehouse}
                </Text>
                <TouchableOpacity onPress={() => setShowWarehousePicker(false)}>
                  <Text style={{ fontFamily: fonts.semiBold, color: colors.primary[600] }}>
                    {t.phoneModal.close || 'Fermer'}
                  </Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={{ maxHeight: 500, backgroundColor: colors.surfaceSolid }}>
                {warehouses.map((warehouse) => (
                  <TouchableOpacity
                    key={warehouse.id}
                    onPress={() => {
                      setSelectedWarehouse(warehouse.id);
                      setShowWarehousePicker(false);
                      Haptics.selectionAsync();
                    }}
                    style={[styles.warehouseItem, {
                      paddingHorizontal: spacing.lg,
                      paddingVertical: spacing.md,
                      backgroundColor: selectedWarehouse === warehouse.id ? (isDark ? colors.primary[900] : colors.primary[50]) : 'transparent',
                      borderBottomWidth: 1,
                      borderBottomColor: colors.gray[100],
                    }]}
                  >
                    <Text style={{ fontFamily: fonts.semiBold, color: selectedWarehouse === warehouse.id ? (isDark ? colors.primary[100] : colors.primary[900]) : colors.gray[900], fontSize: 15, marginBottom: 4 }}>
                      📦 {warehouse.name}
                    </Text>
                    <Text style={{ fontFamily: fonts.regular, color: selectedWarehouse === warehouse.id ? (isDark ? colors.primary[200] : colors.primary[800]) : colors.gray[600], fontSize: 13 }}>
                      📍 {warehouse.address}
                    </Text>
                    {warehouse.phone && (
                      <Text style={{ fontFamily: fonts.regular, color: selectedWarehouse === warehouse.id ? (isDark ? colors.primary[200] : colors.primary[800]) : colors.gray[600], fontSize: 13 }}>
                        📞 {warehouse.phone}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
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
    gap: 8,
  },
  dialCode: {
    borderWidth: 2,
    justifyContent: 'center',
  },
  phoneInput: {
    flex: 1,
    borderWidth: 2,
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
  pickerTitle: {
    fontSize: 18,
  },
  pickerItem: {},
  warehouseItem: {},
});
