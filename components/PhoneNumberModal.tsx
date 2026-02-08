'use client';

import { useState, useEffect } from 'react';
import { X, Phone, MapPin, Building2, Loader2, ExternalLink } from 'lucide-react';
import { COUNTRIES, getCountryName, Country } from '@/lib/countries';
import { useTranslation } from '@/lib/i18n/useTranslation';

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
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

        // Auto-select if only one warehouse
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
        updateData.phone = phoneNumber.replace(/\D/g, '');
        updateData.countryCode = selectedCountry.code;
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
    (missingCity && !selectedCity) ||
    (missingWarehouse && !selectedWarehouse);

  const selectedWarehouseData = warehouses.find(w => w.id === selectedWarehouse);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-6 py-5 text-white flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">
                {t.phoneModal.title}
              </h2>
              <p className="text-blue-100 text-sm">
                {t.phoneModal.descriptionAll}
              </p>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            {/* Phone Number Section */}
            {missingPhone && (
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Phone className="w-4 h-4 text-blue-600" />
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
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-base"
                >
                  {COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {getCountryName(country, locale)} ({country.dial})
                    </option>
                  ))}
                </select>

                {/* Phone Input */}
                <div className="flex gap-2">
                  <div className="flex items-center px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 text-base">
                    {selectedCountry.dial}
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder={t.phoneModal.enterPhone}
                    className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-base"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* City Section */}
            {missingCity && (
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  {t.phoneModal.city}
                  <span className="text-red-500">*</span>
                </label>

                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-base"
                >
                  <option value="">{t.phoneModal.selectCity}</option>
                  {HAITI_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Warehouse Section */}
            {missingWarehouse && selectedCity && (
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  {t.phoneModal.warehouse}
                  <span className="text-red-500">*</span>
                </label>

                {isLoadingWarehouses ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="ml-2 text-sm text-gray-600">
                      {t.phoneModal.loadingWarehouses}
                    </span>
                  </div>
                ) : warehouses.length === 0 ? (
                  <div className="px-4 py-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl text-center">
                    <p className="text-sm text-yellow-800 font-medium">
                      {t.phoneModal.noWarehousesAvailable}
                    </p>
                  </div>
                ) : (
                  <>
                    <select
                      value={selectedWarehouse || ''}
                      onChange={(e) => setSelectedWarehouse(e.target.value ? Number(e.target.value) : null)}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-base"
                    >
                      <option value="">{t.phoneModal.selectWarehouse}</option>
                      {warehouses.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </option>
                      ))}
                    </select>

                    {/* Warehouse Details */}
                    {selectedWarehouseData && (
                      <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl space-y-2">
                        <p className="text-sm font-semibold text-blue-900">
                          📍 {selectedWarehouseData.name}
                        </p>
                        <p className="text-sm text-blue-800">
                          {selectedWarehouseData.address}
                        </p>
                        {selectedWarehouseData.phone && (
                          <p className="text-sm text-blue-800">
                            📞 {selectedWarehouseData.phone}
                          </p>
                        )}
                        {selectedWarehouseData.openingHours && (
                          <p className="text-sm text-blue-800">
                            🕐 {selectedWarehouseData.openingHours}
                          </p>
                        )}
                        <a
                          href={`https://maps.google.com/?q=${selectedWarehouseData.latitude},${selectedWarehouseData.longitude}&entry=gps&g_st=awb`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-semibold mt-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {t.phoneModal.viewOnMaps}
                        </a>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl text-base flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t.phoneModal.saving}
              </>
            ) : (
              t.phoneModal.saveInformation
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
