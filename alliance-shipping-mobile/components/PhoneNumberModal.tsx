import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/themes/ThemeProvider';
import { COUNTRIES, getCountryName, Country } from '@/lib/countries';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Button } from '@/components/ui/Button';
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
  email?: string;
  openingHours?: string;
}

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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PhoneNumberModal({
  visible,
  onSuccess,
  missingPhone = true,
  missingCity = true,
  missingWarehouse = true
}: PhoneNumberModalProps) {
  const { colors, fonts, spacing, borderRadius, shadows } = useTheme();
  const { t, locale } = useTranslation();
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isWarehouseDropdownOpen, setIsWarehouseDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate current step
  const getCurrentStep = () => {
    if (missingPhone) return 1;
    if (missingCity) return 2;
    if (missingWarehouse) return 3;
    return 1;
  };

  const getTotalSteps = () => {
    let total = 0;
    if (missingPhone) total++;
    if (missingCity) total++;
    if (missingWarehouse) total++;
    return total;
  };

  const currentStep = getCurrentStep();
  const totalSteps = getTotalSteps();

  // Load warehouses when city is selected
  useEffect(() => {
    const loadWarehouses = async () => {
      if (!selectedCity || !missingWarehouse) return;

      setIsLoadingWarehouses(true);
      setError(null);

      try {
        const response = await api.get<{ success: boolean; warehouses: Warehouse[] }>(
          `/api/warehouses?city=${encodeURIComponent(selectedCity)}`
        );
        setWarehouses(response.warehouses || []);

        // Auto-select if only one warehouse
        if (response.warehouses?.length === 1) {
          setSelectedWarehouse(response.warehouses[0].id);
        }
      } catch (err) {
        setError(t.phoneModal.failedToLoadWarehouses);
        console.error('Error loading warehouses:', err);
      } finally {
        setIsLoadingWarehouses(false);
      }
    };

    loadWarehouses();
  }, [selectedCity, missingWarehouse, t.phoneModal.failedToLoadWarehouses]);

  const handlePhoneChange = (value: string) => {
    const numbersOnly = value.replace(/\D/g, '');
    setPhoneNumber(numbersOnly);
    if (error) setError(null);
  };

  const handleCountrySelect = useCallback(
    (country: Country) => {
      Haptics.selectionAsync();
      setSelectedCountry(country);
      setIsDropdownOpen(false);
    },
    []
  );

  const toggleDropdown = useCallback(() => {
    Haptics.selectionAsync();
    setIsDropdownOpen((prev) => !prev);
  }, []);

  const handleSubmit = async () => {
    if (missingPhone && (!phoneNumber || phoneNumber.length < 6)) {
      setError(t.phoneModal.pleaseEnterPhone);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (missingCity && !selectedCity) {
      setError(t.phoneModal.pleaseSelectCity);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (missingWarehouse && !selectedWarehouse) {
      setError(t.phoneModal.pleaseSelectWarehouse);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.patch('/api/user/profile', {
        phone: missingPhone ? phoneNumber : undefined,
        countryCode: missingPhone ? selectedCountry.dial : undefined,
        city: missingCity ? selectedCity : undefined,
        warehouseId: missingWarehouse ? selectedWarehouse : undefined,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.phoneModal.failedToSave);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const getModalTitle = () => {
    if (missingPhone && missingCity && missingWarehouse) {
      return t.phoneModal.title;
    }
    if (missingPhone && !missingCity && !missingWarehouse) {
      return t.phoneModal.titlePhoneOnly;
    }
    if (!missingPhone && missingCity && !missingWarehouse) {
      return t.phoneModal.titleCityOnly;
    }
    if (!missingPhone && !missingCity && missingWarehouse) {
      return t.phoneModal.titleWarehouseOnly;
    }
    return t.phoneModal.title;
  };

  const getModalDescription = () => {
    if (missingPhone && missingCity && missingWarehouse) {
      return t.phoneModal.descriptionAll;
    }
    if (missingPhone && !missingCity && !missingWarehouse) {
      return t.phoneModal.descriptionPhoneOnly;
    }
    if (!missingPhone && missingCity && !missingWarehouse) {
      return t.phoneModal.descriptionCityOnly;
    }
    if (!missingPhone && !missingCity && missingWarehouse) {
      return t.phoneModal.descriptionWarehouseOnly;
    }
    return t.phoneModal.descriptionAll;
  };

  const getHeaderIcon = () => {
    if (missingPhone) return 'call';
    if (missingCity) return 'location';
    if (missingWarehouse) return 'business';
    return 'call';
  };

  const openMaps = (warehouse: Warehouse) => {
    const url = `https://www.google.com/maps?q=${warehouse.latitude},${warehouse.longitude}`;
    Linking.openURL(url);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.7)' }]}
        />

        {/* Modal Content */}
        <Animated.View
          entering={SlideInDown.springify().damping(20)}
          exiting={SlideOutDown}
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.white,
              borderRadius: borderRadius.xl,
              ...shadows.xl,
            },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              {
                backgroundColor: colors.primary[600],
                borderTopLeftRadius: borderRadius.xl,
                borderTopRightRadius: borderRadius.xl,
                padding: spacing.xl,
              },
            ]}
          >
            <View style={styles.headerIcon}>
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: borderRadius.full,
                  },
                ]}
              >
                <Ionicons
                  name={getHeaderIcon() as any}
                  size={28}
                  color={colors.white}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.headerTitle,
                    { fontFamily: fonts.bold, color: colors.white },
                  ]}
                >
                  {getModalTitle()}
                </Text>
                {totalSteps > 1 && (
                  <Text
                    style={[
                      styles.stepIndicator,
                      { fontFamily: fonts.regular, color: 'rgba(255,255,255,0.8)' },
                    ]}
                  >
                    {t.phoneModal.step} {currentStep} {t.phoneModal.of} {totalSteps}
                  </Text>
                )}
              </View>
            </View>
            <Text
              style={[
                styles.headerSubtitle,
                { fontFamily: fonts.regular, color: 'rgba(255,255,255,0.9)' },
              ]}
            >
              {getModalDescription()}
            </Text>
          </View>

          {/* Form */}
          <ScrollView
            style={[styles.form, { padding: spacing.xl }]}
            showsVerticalScrollIndicator={false}
          >
            {/* Country Selector - only show if phone is missing */}
            {missingPhone && (
            <View style={{ marginBottom: spacing.lg }}>
              <Text
                style={[
                  styles.label,
                  {
                    fontFamily: fonts.semiBold,
                    color: colors.gray[700],
                    marginBottom: spacing.sm,
                  },
                ]}
              >
                {t.phoneModal.country}
              </Text>
              <Pressable
                onPress={toggleDropdown}
                style={[
                  styles.countryButton,
                  {
                    backgroundColor: colors.white,
                    borderColor: isDropdownOpen ? colors.primary[500] : colors.gray[200],
                    borderRadius: borderRadius.lg,
                    borderWidth: 2,
                    padding: spacing.md,
                  },
                ]}
              >
                <View style={styles.countryButtonContent}>
                  <Text style={styles.flagEmoji}>{selectedCountry.flag}</Text>
                  <Text
                    style={[
                      styles.dialCode,
                      { fontFamily: fonts.semiBold, color: colors.gray[700] },
                    ]}
                  >
                    {selectedCountry.dial}
                  </Text>
                  <Text
                    style={[
                      styles.countryName,
                      { fontFamily: fonts.regular, color: colors.gray[600] },
                    ]}
                  >
                    {getCountryName(selectedCountry, locale)}
                  </Text>
                </View>
                <Ionicons
                  name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.gray[400]}
                />
              </Pressable>

              {/* Country Dropdown */}
              {isDropdownOpen && (
                <Animated.View
                  entering={FadeIn.duration(150)}
                  exiting={FadeOut.duration(150)}
                  style={[
                    styles.dropdown,
                    {
                      backgroundColor: colors.white,
                      borderColor: colors.gray[200],
                      borderRadius: borderRadius.lg,
                      marginTop: spacing.sm,
                      ...shadows.lg,
                    },
                  ]}
                >
                  <ScrollView
                    style={{ maxHeight: 400 }}
                    showsVerticalScrollIndicator={true}
                  >
                    {COUNTRIES.map((country, index) => {
                      const isSelected =
                        selectedCountry.dial === country.dial &&
                        selectedCountry.code === country.code;
                      return (
                        <Pressable
                          key={`${country.code}-${country.dial}-${index}`}
                          onPress={() => handleCountrySelect(country)}
                          style={[
                            styles.dropdownItem,
                            {
                              backgroundColor: isSelected
                                ? colors.primary[100]
                                : 'transparent',
                              padding: spacing.md,
                            },
                          ]}
                        >
                          <Text style={styles.flagEmoji}>{country.flag}</Text>
                          <Text
                            style={[
                              styles.dropdownDialCode,
                              {
                                fontFamily: fonts.semiBold,
                                color: colors.gray[700],
                              },
                            ]}
                          >
                            {country.dial}
                          </Text>
                          <Text
                            style={[
                              styles.dropdownCountryName,
                              {
                                fontFamily: fonts.regular,
                                color: colors.gray[600],
                              },
                            ]}
                          >
                            {getCountryName(country, locale)}
                          </Text>
                          {isSelected && (
                            <Ionicons
                              name="checkmark"
                              size={20}
                              color={colors.primary[600]}
                            />
                          )}
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </Animated.View>
              )}
            </View>
            )}

            {/* Phone Input - only show if phone is missing */}
            {missingPhone && (
            <View style={{ marginBottom: spacing.lg }}>
              <Text
                style={[
                  styles.label,
                  {
                    fontFamily: fonts.semiBold,
                    color: colors.gray[700],
                    marginBottom: spacing.sm,
                  },
                ]}
              >
                {t.phoneModal.phoneNumber}
              </Text>
              <View
                style={[
                  styles.phoneInputContainer,
                  {
                    backgroundColor: colors.white,
                    borderColor: error ? colors.red[500] : colors.gray[200],
                    borderRadius: borderRadius.lg,
                    borderWidth: 2,
                  },
                ]}
              >
                <View style={[styles.phonePrefix, { paddingLeft: spacing.md }]}>
                  <Text style={styles.flagEmojiSmall}>{selectedCountry.flag}</Text>
                  <Text
                    style={[
                      styles.prefixText,
                      { fontFamily: fonts.semiBold, color: colors.gray[500] },
                    ]}
                  >
                    {selectedCountry.dial}
                  </Text>
                </View>
                <TextInput
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                  placeholder="1234567890"
                  placeholderTextColor={colors.gray[400]}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                  style={[
                    styles.phoneInput,
                    {
                      fontFamily: fonts.medium,
                      color: colors.gray[900],
                      paddingVertical: spacing.md,
                      paddingRight: spacing.md,
                    },
                  ]}
                />
              </View>
            </View>
            )}

            {/* City Selector - only show if city is missing */}
            {missingCity && (
            <View style={{ marginBottom: spacing.lg }}>
              <Text
                style={[
                  styles.label,
                  {
                    fontFamily: fonts.semiBold,
                    color: colors.gray[700],
                    marginBottom: spacing.sm,
                  },
                ]}
              >
                {t.phoneModal.city}
              </Text>
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync();
                  setIsCityDropdownOpen(!isCityDropdownOpen);
                }}
                style={[
                  styles.countryButton,
                  {
                    backgroundColor: colors.white,
                    borderColor: isCityDropdownOpen ? colors.primary[500] : colors.gray[200],
                    borderRadius: borderRadius.lg,
                    borderWidth: 2,
                    padding: spacing.md,
                  },
                ]}
              >
                <View style={styles.countryButtonContent}>
                  <Ionicons name="location" size={20} color={colors.gray[400]} />
                  <Text
                    style={[
                      styles.countryName,
                      {
                        fontFamily: selectedCity ? fonts.medium : fonts.regular,
                        color: selectedCity ? colors.gray[700] : colors.gray[400],
                      },
                    ]}
                  >
                    {selectedCity || t.phoneModal.selectCity}
                  </Text>
                </View>
                <Ionicons
                  name={isCityDropdownOpen ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.gray[400]}
                />
              </Pressable>

              {/* City Dropdown */}
              {isCityDropdownOpen && (
                <Animated.View
                  entering={FadeIn.duration(150)}
                  exiting={FadeOut.duration(150)}
                  style={[
                    styles.dropdown,
                    {
                      backgroundColor: colors.white,
                      borderColor: colors.gray[200],
                      borderRadius: borderRadius.lg,
                      marginTop: spacing.sm,
                      ...shadows.lg,
                    },
                  ]}
                >
                  <ScrollView
                    style={{ maxHeight: 400 }}
                    showsVerticalScrollIndicator={true}
                  >
                    {HAITI_CITIES.map((city, index) => {
                      const isSelected = selectedCity === city;
                      return (
                        <Pressable
                          key={index}
                          onPress={() => {
                            Haptics.selectionAsync();
                            setSelectedCity(city);
                            setIsCityDropdownOpen(false);
                            if (error) setError(null);
                          }}
                          style={[
                            styles.dropdownItem,
                            {
                              backgroundColor: isSelected
                                ? colors.primary[100]
                                : 'transparent',
                              padding: spacing.md,
                            },
                          ]}
                        >
                          <Ionicons
                            name="location"
                            size={20}
                            color={colors.gray[400]}
                          />
                          <Text
                            style={[
                              styles.dropdownCountryName,
                              {
                                fontFamily: fonts.regular,
                                color: colors.gray[700],
                              },
                            ]}
                          >
                            {city}
                          </Text>
                          {isSelected && (
                            <Ionicons
                              name="checkmark"
                              size={20}
                              color={colors.primary[600]}
                            />
                          )}
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </Animated.View>
              )}
            </View>
            )}

            {/* Warehouse Selector - only show if warehouse is missing and city is selected */}
            {missingWarehouse && selectedCity && (
            <View style={{ marginBottom: spacing.lg }}>
              <Text
                style={[
                  styles.label,
                  {
                    fontFamily: fonts.semiBold,
                    color: colors.gray[700],
                    marginBottom: spacing.sm,
                  },
                ]}
              >
                {t.phoneModal.warehouse}
              </Text>

              {isLoadingWarehouses ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary[500]} />
                  <Text
                    style={[
                      styles.loadingText,
                      { fontFamily: fonts.regular, color: colors.gray[600] },
                    ]}
                  >
                    {t.phoneModal.loadingWarehouses}
                  </Text>
                </View>
              ) : warehouses.length === 0 ? (
                <View
                  style={[
                    styles.noWarehousesContainer,
                    {
                      backgroundColor: colors.yellow[50],
                      borderColor: colors.yellow[200],
                      borderRadius: borderRadius.lg,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.noWarehousesText,
                      { fontFamily: fonts.regular, color: colors.yellow[800] },
                    ]}
                  >
                    {t.phoneModal.noWarehousesAvailable}
                  </Text>
                </View>
              ) : (
                <>
                  <Pressable
                    onPress={() => {
                      Haptics.selectionAsync();
                      setIsWarehouseDropdownOpen(!isWarehouseDropdownOpen);
                    }}
                    style={[
                      styles.countryButton,
                      {
                        backgroundColor: colors.white,
                        borderColor: isWarehouseDropdownOpen ? colors.primary[500] : colors.gray[200],
                        borderRadius: borderRadius.lg,
                        borderWidth: 2,
                        padding: spacing.md,
                      },
                    ]}
                  >
                    <View style={styles.countryButtonContent}>
                      <Ionicons name="business" size={20} color={colors.gray[400]} />
                      <Text
                        style={[
                          styles.countryName,
                          {
                            fontFamily: selectedWarehouse ? fonts.medium : fonts.regular,
                            color: selectedWarehouse ? colors.gray[700] : colors.gray[400],
                          },
                        ]}
                      >
                        {selectedWarehouse
                          ? warehouses.find(w => w.id === selectedWarehouse)?.name
                          : t.phoneModal.selectWarehouse}
                      </Text>
                    </View>
                    <Ionicons
                      name={isWarehouseDropdownOpen ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={colors.gray[400]}
                    />
                  </Pressable>

                  {/* Warehouse Dropdown */}
                  {isWarehouseDropdownOpen && (
                    <Animated.View
                      entering={FadeIn.duration(150)}
                      exiting={FadeOut.duration(150)}
                      style={[
                        styles.dropdown,
                        {
                          backgroundColor: colors.white,
                          borderColor: colors.gray[200],
                          borderRadius: borderRadius.lg,
                          marginTop: spacing.sm,
                          ...shadows.lg,
                        },
                      ]}
                    >
                      <ScrollView
                        style={{ maxHeight: 450 }}
                        showsVerticalScrollIndicator={true}
                      >
                        {warehouses.map((warehouse) => {
                          const isSelected = selectedWarehouse === warehouse.id;
                          return (
                            <Pressable
                              key={warehouse.id}
                              onPress={() => {
                                Haptics.selectionAsync();
                                setSelectedWarehouse(warehouse.id);
                                setIsWarehouseDropdownOpen(false);
                                if (error) setError(null);
                              }}
                              style={[
                                styles.warehouseItem,
                                {
                                  backgroundColor: isSelected
                                    ? colors.primary[100]
                                    : 'transparent',
                                  padding: spacing.md,
                                },
                              ]}
                            >
                              <View style={styles.warehouseContent}>
                                <Ionicons
                                  name="business"
                                  size={20}
                                  color={colors.gray[400]}
                                  style={styles.warehouseIcon}
                                />
                                <View style={styles.warehouseInfo}>
                                  <View style={styles.warehouseHeader}>
                                    <Text
                                      style={[
                                        styles.warehouseName,
                                        { fontFamily: fonts.semiBold, color: colors.gray[900] },
                                      ]}
                                    >
                                      {warehouse.name}
                                    </Text>
                                    {isSelected && (
                                      <Ionicons
                                        name="checkmark"
                                        size={20}
                                        color={colors.primary[600]}
                                      />
                                    )}
                                  </View>
                                  <Text
                                    style={[
                                      styles.warehouseAddress,
                                      { fontFamily: fonts.regular, color: colors.gray[600] },
                                    ]}
                                  >
                                    {warehouse.address}
                                  </Text>
                                  {warehouse.phone && (
                                    <Text
                                      style={[
                                        styles.warehousePhone,
                                        { fontFamily: fonts.regular, color: colors.gray[500] },
                                      ]}
                                    >
                                      {warehouse.phone}
                                    </Text>
                                  )}
                                  {warehouse.latitude && warehouse.longitude && (
                                    <Pressable
                                      onPress={() => openMaps(warehouse)}
                                      style={styles.mapsLink}
                                    >
                                      <Ionicons
                                        name="map-outline"
                                        size={12}
                                        color={colors.primary[600]}
                                      />
                                      <Text
                                        style={[
                                          styles.mapsLinkText,
                                          { fontFamily: fonts.medium, color: colors.primary[600] },
                                        ]}
                                      >
                                        {t.phoneModal.viewOnMaps}
                                      </Text>
                                    </Pressable>
                                  )}
                                </View>
                              </View>
                            </Pressable>
                          );
                        })}
                      </ScrollView>
                    </Animated.View>
                  )}
                </>
              )}
            </View>
            )}

            {/* Error Message */}
            {error && (
              <Animated.View
                entering={FadeIn}
                style={[
                  styles.errorContainer,
                  {
                    backgroundColor: colors.red[50],
                    borderColor: colors.red[200],
                    borderRadius: borderRadius.lg,
                    marginBottom: spacing.md,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.errorText,
                    {
                      fontFamily: fonts.medium,
                      color: colors.red[600],
                    },
                  ]}
                >
                  {error}
                </Text>
              </Animated.View>
            )}

            {/* Submit Button */}
            <Button
              title={isLoading ? t.phoneModal.saving : t.phoneModal.saveInformation}
              onPress={handleSubmit}
              disabled={
                isLoading ||
                isLoadingWarehouses ||
                (missingPhone && !phoneNumber) ||
                (missingCity && !selectedCity) ||
                (missingWarehouse && !selectedWarehouse)
              }
              loading={isLoading}
              variant="primary"
              size="lg"
              fullWidth
              style={{ marginTop: spacing.md }}
            />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    alignItems: 'flex-start',
  },
  headerIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  iconCircle: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    letterSpacing: 0.2,
  },
  stepIndicator: {
    fontSize: 12,
    marginTop: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    letterSpacing: 0.1,
  },
  countryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  flagEmoji: {
    fontSize: 28,
  },
  flagEmojiSmall: {
    fontSize: 20,
  },
  dialCode: {
    fontSize: 15,
  },
  countryName: {
    fontSize: 15,
    flex: 1,
  },
  dropdown: {
    borderWidth: 1,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dropdownDialCode: {
    fontSize: 15,
    minWidth: 60,
  },
  dropdownCountryName: {
    fontSize: 15,
    flex: 1,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phonePrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prefixText: {
    fontSize: 15,
  },
  phoneInput: {
    flex: 1,
    fontSize: 15,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 14,
    marginLeft: 12,
  },
  noWarehousesContainer: {
    padding: 16,
    borderWidth: 1,
  },
  noWarehousesText: {
    fontSize: 14,
  },
  warehouseItem: {
    flexDirection: 'row',
  },
  warehouseContent: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  warehouseIcon: {
    marginTop: 2,
  },
  warehouseInfo: {
    flex: 1,
  },
  warehouseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  warehouseName: {
    fontSize: 15,
    flex: 1,
  },
  warehouseAddress: {
    fontSize: 13,
    marginTop: 4,
  },
  warehousePhone: {
    fontSize: 12,
    marginTop: 4,
  },
  mapsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  mapsLinkText: {
    fontSize: 12,
  },
  errorContainer: {
    padding: 12,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 12,
  },
});
