'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MapPin, Building2, Loader2, ExternalLink, Check, ChevronRight, MessageCircle } from 'lucide-react';
import { COUNTRIES, getCountryName, Country } from '@/lib/countries';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useTheme } from '@/lib/themes/ThemeProvider';

interface PhoneNumberModalProps {
  isOpen: boolean;
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
  isOpen,
  onSuccess,
  missingPhone = true,
  missingCity = true,
  missingWarehouse = true
}: PhoneNumberModalProps) {
  const { t, locale } = useTranslation();
  const { theme, isDark } = useTheme();
  const colors = theme.colors;
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [whatsappCountry, setWhatsappCountry] = useState<Country>(COUNTRIES[0]);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load cities from API
  useEffect(() => {
    if (!missingCity) return;
    const loadCities = async () => {
      setIsLoadingCities(true);
      try {
        const response = await fetch('/api/pricing/all');
        if (!response.ok) throw new Error('Failed to fetch cities');
        const data = await response.json();
        const cityNames = (data.cities || []).map((c: any) => c.city);
        setCities(cityNames);
      } catch (err) {
        console.error('Error loading cities:', err);
      } finally {
        setIsLoadingCities(false);
      }
    };
    loadCities();
  }, [missingCity]);

  // Calculate step info
  const steps = [
    ...(missingPhone ? ['phone'] : []),
    ...(missingCity ? ['city'] : []),
    ...(missingWarehouse ? ['warehouse'] : []),
  ];
  const totalSteps = steps.length;

  const currentStep = (() => {
    if (missingPhone && !phoneNumber) return 1;
    if (missingCity && !selectedCity) return missingPhone ? 2 : 1;
    return totalSteps;
  })();

  // Load warehouses when city changes
  useEffect(() => {
    const loadWarehouses = async () => {
      if (!selectedCity || !missingWarehouse) return;

      setIsLoadingWarehouses(true);
      setSelectedWarehouse(null);
      setError(null);

      try {
        const response = await fetch(`/api/warehouses?city=${encodeURIComponent(selectedCity)}`);
        if (!response.ok) throw new Error('Failed to fetch warehouses');

        const data = await response.json();
        setWarehouses(data.warehouses || []);

        if (data.warehouses?.length === 1) {
          setSelectedWarehouse(data.warehouses[0].id);
        }
      } catch (err) {
        console.error('Error loading warehouses:', err);
        setError(t.phoneModal.failedToLoadWarehouses);
        setWarehouses([]);
      } finally {
        setIsLoadingWarehouses(false);
      }
    };

    loadWarehouses();
  }, [selectedCity, missingWarehouse, t.phoneModal.failedToLoadWarehouses]);

  const handleSubmit = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const updateData: any = {};

      if (missingPhone && phoneNumber) {
        const digitsOnly = phoneNumber.replace(/\D/g, '');
        updateData.phone = selectedCountry.dial + digitsOnly;
        updateData.countryCode = selectedCountry.code;
      }

      if (missingPhone && whatsappNumber) {
        const waDigits = whatsappNumber.replace(/\D/g, '');
        updateData.whatsappPhone = whatsappCountry.dial + waDigits;
        updateData.whatsappCountryCode = whatsappCountry.code;
      }

      if (missingCity && selectedCity) {
        updateData.city = selectedCity;
      }

      if (missingWarehouse && selectedWarehouse) {
        updateData.warehouseId = selectedWarehouse;
      }

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      onSuccess();
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to save information');
    } finally {
      setIsLoading(false);
    }
  };

  const isSubmitDisabled =
    isLoading ||
    isLoadingWarehouses ||
    (missingPhone && !phoneNumber) ||
    (missingPhone && !whatsappNumber) ||
    (missingCity && !selectedCity) ||
    (missingWarehouse && !selectedWarehouse);

  const selectedWarehouseData = warehouses.find(w => w.id === selectedWarehouse);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {/* Animated backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
        style={{ backgroundColor: isDark ? colors.gray[900] : '#ffffff' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient Header */}
        <div
          className="relative px-6 py-6 flex-shrink-0 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.primary[800]})`,
          }}
        >
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/5" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {t.phoneModal.title}
                </h2>
                <p className="text-white/70 text-sm">
                  {t.phoneModal.descriptionAll}
                </p>
              </div>
            </div>

            {/* Step Indicator */}
            {totalSteps > 1 && (
              <div className="flex items-center gap-2 mt-4">
                {steps.map((_, i) => (
                  <div key={i} className="flex items-center gap-2 flex-1">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/20">
                      <motion.div
                        className="h-full rounded-full bg-white"
                        initial={{ width: 0 }}
                        animate={{
                          width: i < currentStep ? '100%' : '0%',
                        }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                      />
                    </div>
                  </div>
                ))}
                <span className="text-white/80 text-xs font-semibold ml-1">
                  {currentStep}/{totalSteps}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            {/* Phone Number Section */}
            {missingPhone && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-3"
              >
                <label className="flex items-center gap-2 text-sm font-bold" style={{ color: colors.gray[800] }}>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]})` }}
                  >
                    <Phone className="w-3.5 h-3.5 text-white" />
                  </div>
                  {t.phoneModal.phoneNumber}
                  <span className="text-red-500">*</span>
                </label>

                {/* Country Selector */}
                <select
                  value={selectedCountry.code}
                  onChange={(e) => {
                    const country = COUNTRIES.find(c => c.code === e.target.value);
                    if (country) setSelectedCountry(country);
                  }}
                  className="w-full px-4 py-3.5 border-2 rounded-xl focus:ring-4 outline-none transition-all text-base"
                  style={{
                    borderColor: colors.gray[200],
                    backgroundColor: isDark ? colors.gray[800] : colors.gray[50],
                    color: colors.gray[900],
                  }}
                >
                  {COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {getCountryName(country, locale)} ({country.dial})
                    </option>
                  ))}
                </select>

                {/* Phone Input */}
                <div className="flex gap-2">
                  <div
                    className="flex items-center px-4 py-3.5 border-2 rounded-xl font-bold text-base"
                    style={{
                      borderColor: colors.gray[200],
                      backgroundColor: isDark ? colors.gray[800] : colors.gray[100],
                      color: colors.gray[700],
                    }}
                  >
                    {selectedCountry.dial}
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '');
                      let formatted = '';
                      if (digits.length <= 4) {
                        formatted = digits;
                      } else if (digits.length <= 8) {
                        formatted = `${digits.slice(0, 4)} ${digits.slice(4)}`;
                      } else {
                        formatted = `${digits.slice(0, 4)} ${digits.slice(4, 8)}`;
                      }
                      setPhoneNumber(formatted);
                    }}
                    placeholder={t.phoneModal.phoneNumber}
                    className="flex-1 px-4 py-3.5 border-2 rounded-xl focus:ring-4 outline-none transition-all text-base"
                    style={{
                      borderColor: colors.gray[200],
                      backgroundColor: isDark ? colors.gray[800] : colors.gray[50],
                      color: colors.gray[900],
                    }}
                    autoFocus
                  />
                </div>

                {/* WhatsApp Number */}
                <label className="flex items-center gap-2 text-sm font-bold mt-4" style={{ color: colors.gray[800] }}>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-white" />
                  </div>
                  WhatsApp
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: '#ef4444' }}
                  >
                    {(t.phoneModal as any).required || 'REQUIS'}
                  </span>
                </label>

                <select
                  value={whatsappCountry.code}
                  onChange={(e) => {
                    const country = COUNTRIES.find(c => c.code === e.target.value);
                    if (country) setWhatsappCountry(country);
                  }}
                  className="w-full px-4 py-3.5 border-2 rounded-xl focus:ring-4 outline-none transition-all text-base"
                  style={{
                    borderColor: colors.gray[200],
                    backgroundColor: isDark ? colors.gray[800] : colors.gray[50],
                    color: colors.gray[900],
                  }}
                >
                  {COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {getCountryName(country, locale)} ({country.dial})
                    </option>
                  ))}
                </select>

                <div className="flex gap-2">
                  <div
                    className="flex items-center px-4 py-3.5 border-2 rounded-xl font-bold text-base"
                    style={{
                      borderColor: colors.gray[200],
                      backgroundColor: isDark ? colors.gray[800] : colors.gray[100],
                      color: colors.gray[700],
                    }}
                  >
                    {whatsappCountry.dial}
                  </div>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '');
                      let formatted = '';
                      if (digits.length <= 4) {
                        formatted = digits;
                      } else if (digits.length <= 8) {
                        formatted = `${digits.slice(0, 4)} ${digits.slice(4)}`;
                      } else {
                        formatted = `${digits.slice(0, 4)} ${digits.slice(4, 8)}`;
                      }
                      setWhatsappNumber(formatted);
                    }}
                    placeholder="WhatsApp"
                    className="flex-1 px-4 py-3.5 border-2 rounded-xl focus:ring-4 outline-none transition-all text-base"
                    style={{
                      borderColor: colors.gray[200],
                      backgroundColor: isDark ? colors.gray[800] : colors.gray[50],
                      color: colors.gray[900],
                    }}
                  />
                </div>

                {whatsappNumber && (
                  <a
                    href={`https://wa.me/${whatsappCountry.dial.replace('+', '')}${whatsappNumber.replace(/\s/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold"
                    style={{ color: '#25D366' }}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Tester sur WhatsApp
                  </a>
                )}
              </motion.div>
            )}

            {/* City Section */}
            {missingCity && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <label className="flex items-center gap-2 text-sm font-bold" style={{ color: colors.gray[800] }}>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                  >
                    <MapPin className="w-3.5 h-3.5 text-white" />
                  </div>
                  {t.phoneModal.city}
                  <span className="text-red-500">*</span>
                </label>

                {/* City Grid - loaded from API */}
                {isLoadingCities ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: colors.primary[600] }} />
                    <span className="ml-2 text-sm" style={{ color: colors.gray[600] }}>
                      Chargement des villes...
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {cities.map((city) => (
                      <button
                        key={city}
                        onClick={() => setSelectedCity(city)}
                        className="flex items-center gap-2 px-3 py-3 rounded-xl border-2 transition-all text-left text-sm"
                        style={{
                          borderColor: selectedCity === city ? colors.primary[500] : colors.gray[200],
                          backgroundColor: selectedCity === city
                            ? (isDark ? colors.primary[900] : colors.primary[50])
                            : 'transparent',
                        }}
                      >
                        {selectedCity === city ? (
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: colors.primary[600] }}
                          >
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        ) : (
                          <div
                            className="w-5 h-5 rounded-full border-2 flex-shrink-0"
                            style={{ borderColor: colors.gray[300] }}
                          />
                        )}
                        <span
                          className="font-medium"
                          style={{
                            color: selectedCity === city ? colors.primary[700] : colors.gray[700],
                          }}
                        >
                          {city}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Warehouse Section */}
            {missingWarehouse && selectedCity && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
              >
                <label className="flex items-center gap-2 text-sm font-bold" style={{ color: colors.gray[800] }}>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                  >
                    <Building2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  {t.phoneModal.warehouse}
                  <span className="text-red-500">*</span>
                </label>

                {isLoadingWarehouses ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: colors.primary[600] }} />
                    <span className="ml-2 text-sm" style={{ color: colors.gray[600] }}>
                      {t.phoneModal.loadingWarehouses}
                    </span>
                  </div>
                ) : warehouses.length === 0 ? (
                  <div
                    className="px-4 py-6 border-2 rounded-xl text-center"
                    style={{
                      backgroundColor: isDark ? '#78350f' : '#fffbeb',
                      borderColor: isDark ? '#92400e' : '#fcd34d',
                    }}
                  >
                    <p className="text-sm font-medium" style={{ color: isDark ? '#fde68a' : '#92400e' }}>
                      {t.phoneModal.noWarehousesAvailable}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {warehouses.map((warehouse) => (
                        <button
                          key={warehouse.id}
                          onClick={() => setSelectedWarehouse(warehouse.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left"
                          style={{
                            borderColor: selectedWarehouse === warehouse.id ? colors.primary[500] : colors.gray[200],
                            backgroundColor: selectedWarehouse === warehouse.id
                              ? (isDark ? colors.primary[900] : colors.primary[50])
                              : 'transparent',
                          }}
                        >
                          {selectedWarehouse === warehouse.id ? (
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: colors.primary[600] }}
                            >
                              <Check className="w-3.5 h-3.5 text-white" />
                            </div>
                          ) : (
                            <div
                              className="w-6 h-6 rounded-full border-2 flex-shrink-0"
                              style={{ borderColor: colors.gray[300] }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm" style={{ color: colors.gray[900] }}>
                              {warehouse.name}
                            </p>
                            <p className="text-xs truncate" style={{ color: colors.gray[500] }}>
                              {warehouse.address}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: colors.gray[400] }} />
                        </button>
                      ))}
                    </div>

                    {/* Selected Warehouse Details */}
                    <AnimatePresence>
                      {selectedWarehouseData && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div
                            className="p-4 rounded-xl border-2 space-y-2"
                            style={{
                              backgroundColor: isDark ? colors.primary[900] : colors.primary[50],
                              borderColor: colors.primary[200],
                            }}
                          >
                            <p className="text-sm font-bold" style={{ color: colors.primary[800] }}>
                              {selectedWarehouseData.name}
                            </p>
                            <p className="text-sm" style={{ color: colors.primary[700] }}>
                              {selectedWarehouseData.address}
                            </p>
                            {selectedWarehouseData.phone && (
                              <p className="text-sm" style={{ color: colors.primary[700] }}>
                                {selectedWarehouseData.phone}
                              </p>
                            )}
                            {selectedWarehouseData.openingHours && (
                              <p className="text-sm" style={{ color: colors.primary[700] }}>
                                {selectedWarehouseData.openingHours}
                              </p>
                            )}
                            <a
                              href={`https://maps.google.com/?q=${selectedWarehouseData.latitude},${selectedWarehouseData.longitude}&entry=gps&g_st=awb`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm font-bold mt-2"
                              style={{ color: colors.primary[600] }}
                            >
                              <ExternalLink className="w-4 h-4" />
                              {t.phoneModal.viewOnMaps}
                            </a>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </motion.div>
            )}

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 rounded-xl border-2"
                  style={{
                    backgroundColor: isDark ? '#7f1d1d' : '#fef2f2',
                    borderColor: isDark ? '#991b1b' : '#fecaca',
                  }}
                >
                  <p className="text-sm font-medium" style={{ color: isDark ? '#fecaca' : '#991b1b' }}>
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t flex-shrink-0"
          style={{
            backgroundColor: isDark ? colors.gray[800] : colors.gray[50],
            borderColor: colors.gray[200],
          }}
        >
          <button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="w-full px-6 py-4 text-white font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl text-base flex items-center justify-center gap-2"
            style={{
              background: isSubmitDisabled
                ? colors.gray[400]
                : `linear-gradient(135deg, ${colors.primary[600]}, ${colors.primary[800]})`,
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t.phoneModal.saving}
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                {t.phoneModal.saveInformation}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
