'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Check, ChevronDown, MapPin, Warehouse, ExternalLink } from 'lucide-react';
import { COUNTRIES, getCountryName, Country } from '@/lib/countries';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/Button';

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

export function PhoneNumberModal({
  isOpen,
  onSuccess,
  missingPhone = true,
  missingCity = true,
  missingWarehouse = true
}: PhoneNumberModalProps) {
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
        const response = await fetch(`/api/warehouses?city=${encodeURIComponent(selectedCity)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch warehouses');
        }

        const data = await response.json();
        setWarehouses(data.warehouses || []);

        // Auto-select if only one warehouse
        if (data.warehouses?.length === 1) {
          setSelectedWarehouse(data.warehouses[0].id);
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

  const handleSubmit = async () => {
    if (missingPhone && (!phoneNumber || phoneNumber.length < 6)) {
      setError(t.phoneModal.pleaseEnterPhone);
      return;
    }

    if (missingCity && !selectedCity) {
      setError(t.phoneModal.pleaseSelectCity);
      return;
    }

    if (missingWarehouse && !selectedWarehouse) {
      setError(t.phoneModal.pleaseSelectWarehouse);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: missingPhone ? phoneNumber : undefined,
          countryCode: missingPhone ? selectedCountry.dial : undefined,
          city: missingCity ? selectedCity : undefined,
          warehouseId: missingWarehouse ? selectedWarehouse : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t.phoneModal.failedToSave);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.phoneModal.failedToSave);
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
    if (missingPhone) return <Phone className="w-6 h-6" />;
    if (missingCity) return <MapPin className="w-6 h-6" />;
    if (missingWarehouse) return <Warehouse className="w-6 h-6" />;
    return <Phone className="w-6 h-6" />;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'auto',
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        style={{ pointerEvents: 'none' }}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md mx-auto max-h-[90vh] flex flex-col"
        style={{ pointerEvents: 'auto' }}
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-full" style={{ pointerEvents: 'auto' }}>
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white flex-shrink-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    {getHeaderIcon()}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">
                      {getModalTitle()}
                    </h2>
                    {totalSteps > 1 && (
                      <p className="text-sm text-white/80 mt-1">
                        {t.phoneModal.step} {currentStep} {t.phoneModal.of} {totalSteps}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-white/90 text-sm">
                  {getModalDescription()}
                </p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                {/* Country Selector - only show if phone is missing */}
                {missingPhone && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.phoneModal.country}
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-3.5 bg-white border-2 rounded-xl transition-all',
                        'hover:border-primary-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100',
                        isDropdownOpen ? 'border-primary-500 ring-4 ring-primary-100' : 'border-gray-200'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{selectedCountry.flag}</span>
                        <span className="font-medium text-gray-700">{selectedCountry.dial}</span>
                        <span className="text-gray-600">{getCountryName(selectedCountry, locale)}</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          'w-5 h-5 text-gray-400 transition-transform',
                          isDropdownOpen && 'rotate-180'
                        )}
                      />
                    </button>

                    {/* Dropdown */}
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsDropdownOpen(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-20 max-h-96 overflow-y-auto"
                          >
                            {COUNTRIES.map((country, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  setSelectedCountry(country);
                                  setIsDropdownOpen(false);
                                }}
                                className={cn(
                                  'w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-50 transition-colors text-left',
                                  selectedCountry.dial === country.dial &&
                                    selectedCountry.code === country.code &&
                                    'bg-primary-100'
                                )}
                              >
                                <span className="text-2xl">{country.flag}</span>
                                <span className="font-semibold text-gray-700 min-w-[60px]">
                                  {country.dial}
                                </span>
                                <span className="text-gray-600 flex-1">
                                  {getCountryName(country, locale)}
                                </span>
                                {selectedCountry.dial === country.dial &&
                                  selectedCountry.code === country.code && (
                                    <Check className="w-5 h-5 text-primary-600" />
                                  )}
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                )}

                {/* Phone Input - only show if phone is missing */}
                {missingPhone && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.phoneModal.phoneNumber}
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-500 font-medium pointer-events-none">
                      <span className="text-lg">{selectedCountry.flag}</span>
                      <span>{selectedCountry.dial}</span>
                    </div>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="1234567890"
                      autoFocus={missingPhone}
                      autoComplete="tel"
                      inputMode="numeric"
                      className={cn(
                        'w-full py-3.5 pr-4 bg-white border-2 rounded-xl transition-all text-gray-900 font-medium',
                        'hover:border-primary-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100',
                        'placeholder:text-gray-400 placeholder:font-normal',
                        error ? 'border-red-500' : 'border-gray-200'
                      )}
                      style={{
                        paddingLeft: `${60 + selectedCountry.dial.length * 8}px`,
                        pointerEvents: 'auto',
                        cursor: 'text',
                      }}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                )}

                {/* City Selector - only show if city is missing */}
                {missingCity && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.phoneModal.city}
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-3.5 bg-white border-2 rounded-xl transition-all',
                        'hover:border-primary-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100',
                        isCityDropdownOpen ? 'border-primary-500 ring-4 ring-primary-100' : 'border-gray-200',
                        error && !selectedCity ? 'border-red-500' : ''
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <span className={cn('font-medium', selectedCity ? 'text-gray-700' : 'text-gray-400')}>
                          {selectedCity || t.phoneModal.selectCity}
                        </span>
                      </div>
                      <ChevronDown
                        className={cn(
                          'w-5 h-5 text-gray-400 transition-transform',
                          isCityDropdownOpen && 'rotate-180'
                        )}
                      />
                    </button>

                    {/* City Dropdown */}
                    <AnimatePresence>
                      {isCityDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsCityDropdownOpen(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-20 max-h-96 overflow-y-auto"
                          >
                            {HAITI_CITIES.map((city, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  setSelectedCity(city);
                                  setIsCityDropdownOpen(false);
                                  if (error) setError(null);
                                }}
                                className={cn(
                                  'w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-50 transition-colors text-left',
                                  selectedCity === city && 'bg-primary-100'
                                )}
                              >
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700 flex-1">{city}</span>
                                {selectedCity === city && (
                                  <Check className="w-5 h-5 text-primary-600" />
                                )}
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                )}

                {/* Warehouse Selector - only show if warehouse is missing and city is selected */}
                {missingWarehouse && selectedCity && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.phoneModal.warehouse}
                  </label>

                  {isLoadingWarehouses ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      <span className="ml-3 text-gray-600">{t.phoneModal.loadingWarehouses}</span>
                    </div>
                  ) : warehouses.length === 0 ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <p className="text-sm text-yellow-800">{t.phoneModal.noWarehousesAvailable}</p>
                    </div>
                  ) : (
                    <div className="relative">
                      <button
                        onClick={() => setIsWarehouseDropdownOpen(!isWarehouseDropdownOpen)}
                        className={cn(
                          'w-full flex items-center justify-between px-4 py-3.5 bg-white border-2 rounded-xl transition-all',
                          'hover:border-primary-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100',
                          isWarehouseDropdownOpen ? 'border-primary-500 ring-4 ring-primary-100' : 'border-gray-200',
                          error && !selectedWarehouse ? 'border-red-500' : ''
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Warehouse className="w-5 h-5 text-gray-400" />
                          <span className={cn('font-medium', selectedWarehouse ? 'text-gray-700' : 'text-gray-400')}>
                            {selectedWarehouse
                              ? warehouses.find(w => w.id === selectedWarehouse)?.name
                              : t.phoneModal.selectWarehouse}
                          </span>
                        </div>
                        <ChevronDown
                          className={cn(
                            'w-5 h-5 text-gray-400 transition-transform',
                            isWarehouseDropdownOpen && 'rotate-180'
                          )}
                        />
                      </button>

                      {/* Warehouse Dropdown */}
                      <AnimatePresence>
                        {isWarehouseDropdownOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setIsWarehouseDropdownOpen(false)}
                            />
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.15 }}
                              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-20 max-h-96 overflow-y-auto"
                            >
                              {warehouses.map((warehouse) => (
                                <button
                                  key={warehouse.id}
                                  onClick={() => {
                                    setSelectedWarehouse(warehouse.id);
                                    setIsWarehouseDropdownOpen(false);
                                    if (error) setError(null);
                                  }}
                                  className={cn(
                                    'w-full px-4 py-3 hover:bg-primary-50 transition-colors text-left',
                                    selectedWarehouse === warehouse.id && 'bg-primary-100'
                                  )}
                                >
                                  <div className="flex items-start gap-3">
                                    <Warehouse className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="font-medium text-gray-900">{warehouse.name}</span>
                                        {selectedWarehouse === warehouse.id && (
                                          <Check className="w-5 h-5 text-primary-600 flex-shrink-0" />
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-600 mt-1">{warehouse.address}</p>
                                      {warehouse.phone && (
                                        <p className="text-xs text-gray-500 mt-1">{warehouse.phone}</p>
                                      )}
                                      {warehouse.latitude && warehouse.longitude && (
                                        <a
                                          href={`https://www.google.com/maps?q=${warehouse.latitude},${warehouse.longitude}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 mt-2"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <ExternalLink className="w-3 h-3" />
                                          {t.phoneModal.viewOnMaps}
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
                )}

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                  </motion.div>
                )}
              </div>

              {/* Submit Button - Fixed at bottom */}
              <div className="p-6 pt-4 border-t border-gray-100 flex-shrink-0 bg-white">
                <Button
                  onClick={handleSubmit}
                  disabled={
                    isLoading ||
                    isLoadingWarehouses ||
                    (missingPhone && !phoneNumber) ||
                    (missingCity && !selectedCity) ||
                    (missingWarehouse && !selectedWarehouse)
                  }
                  fullWidth
                  size="lg"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t.phoneModal.saving}</span>
                    </div>
                  ) : (
                    t.phoneModal.saveInformation
                  )}
                </Button>
              </div>
          </div>
        </div>
      </div>
  );
}
