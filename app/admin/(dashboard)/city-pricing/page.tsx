'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Edit,
  Save,
  X,
  DollarSign,
  Package,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { LoadingSpinner } from '@/components/admin/LoadingSpinner';
import { useToast } from '@/components/admin/Toast';

interface CityPricing {
  id: number;
  city: string;
  serviceFee: string;
  pricePerLb: string;
  isActive: boolean;
}

interface EditState {
  [city: string]: {
    serviceFee: number;
    pricePerLb: number;
  };
}

const CITIES = [
  {
    name: 'Port-au-Prince',
    icon: '🏛️',
    color: 'blue',
    description: 'Capitale'
  },
  {
    name: 'Cap-Haïtien',
    icon: '⚓',
    color: 'purple',
    description: 'Deuxième ville'
  },
  {
    name: 'Port-de-Paix',
    icon: '🌊',
    color: 'green',
    description: 'Nord-Ouest'
  },
];

export default function CityPricingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [cities, setCities] = useState<CityPricing[]>([]);
  const [editMode, setEditMode] = useState<{ [city: string]: boolean }>({});
  const [editValues, setEditValues] = useState<EditState>({});
  const { showToast } = useToast();

  const fetchCities = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/city-pricing');
      if (!response.ok) throw new Error('Failed to fetch city pricing');
      const data = await response.json();
      setCities(data.cities || []);

      // Initialize edit values
      const initialValues: EditState = {};
      data.cities?.forEach((city: CityPricing) => {
        initialValues[city.city] = {
          serviceFee: parseFloat(city.serviceFee),
          pricePerLb: parseFloat(city.pricePerLb),
        };
      });
      setEditValues(initialValues);
    } catch (error) {
      console.error('Error fetching cities:', error);
      showToast('Failed to load city pricing', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const handleEdit = (cityName: string) => {
    setEditMode({ ...editMode, [cityName]: true });
  };

  const handleCancel = (cityName: string) => {
    const city = cities.find(c => c.city === cityName);
    if (city) {
      setEditValues({
        ...editValues,
        [cityName]: {
          serviceFee: parseFloat(city.serviceFee),
          pricePerLb: parseFloat(city.pricePerLb),
        },
      });
    }
    setEditMode({ ...editMode, [cityName]: false });
  };

  const handleSave = async (cityName: string) => {
    setSaving(cityName);
    try {
      const values = editValues[cityName];

      if (!values || values.serviceFee <= 0 || values.pricePerLb <= 0) {
        showToast('Fees must be greater than 0', 'error');
        return;
      }

      const response = await fetch('/api/admin/city-pricing', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city: cityName,
          serviceFee: values.serviceFee,
          pricePerLb: values.pricePerLb,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update city pricing');
      }

      showToast(`${cityName} pricing updated successfully!`, 'success');
      setEditMode({ ...editMode, [cityName]: false });
      fetchCities();
    } catch (error) {
      console.error('Error updating city pricing:', error);
      showToast(`Error: ${error instanceof Error ? error.message : 'Failed to update pricing'}`, 'error');
    } finally {
      setSaving(null);
    }
  };

  const handleInputChange = (cityName: string, field: 'serviceFee' | 'pricePerLb', value: string) => {
    const numValue = parseFloat(value) || 0;
    setEditValues({
      ...editValues,
      [cityName]: {
        ...editValues[cityName],
        [field]: numValue,
      },
    });
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, any> = {
      blue: {
        gradient: 'from-blue-500 to-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-600',
        icon: 'bg-blue-100',
      },
      purple: {
        gradient: 'from-purple-500 to-purple-700',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-600',
        icon: 'bg-purple-100',
      },
      green: {
        gradient: 'from-green-500 to-green-700',
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-600',
        icon: 'bg-green-100',
      },
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">City-Based Pricing</h1>
          <p className="mt-2 text-sm text-gray-600">
            Configure different pricing for each destination city
          </p>
        </div>
        <button
          onClick={() => fetchCities()}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="h-5 w-5" />
          Refresh
        </button>
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">City-Based Pricing System</h3>
            <p className="text-sm text-blue-700">
              Each city has different service fees and per-pound rates. Users must select their destination city before calculating shipping costs.
            </p>
          </div>
        </div>
      </motion.div>

      {/* City Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CITIES.map((cityConfig, index) => {
          const cityData = cities.find(c => c.city === cityConfig.name);
          const isEditing = editMode[cityConfig.name];
          const isSaving = saving === cityConfig.name;
          const values = editValues[cityConfig.name] || {
            serviceFee: cityData ? parseFloat(cityData.serviceFee) : 0,
            pricePerLb: cityData ? parseFloat(cityData.pricePerLb) : 0,
          };
          const colorClasses = getColorClasses(cityConfig.color);

          return (
            <motion.div
              key={cityConfig.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="theme-card rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden"
            >
              {/* Card Header */}
              <div className={`bg-gradient-to-br ${colorClasses.gradient} p-6 text-white`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{cityConfig.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold">{cityConfig.name}</h3>
                      <p className="text-sm text-white/80">{cityConfig.description}</p>
                    </div>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => handleEdit(cityConfig.name)}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4">
                {/* Service Fee */}
                <div className={`${colorClasses.bg} border ${colorClasses.border} rounded-xl p-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className={`h-4 w-4 ${colorClasses.text}`} />
                    <label className="text-sm font-semibold text-gray-700">
                      Service Fee (Fixed)
                    </label>
                  </div>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-400">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={values.serviceFee}
                        onChange={(e) => handleInputChange(cityConfig.name, 'serviceFee', e.target.value)}
                        className="flex-1 text-2xl font-bold text-gray-900 border-b-2 border-primary-500 focus:outline-none bg-transparent"
                      />
                    </div>
                  ) : (
                    <p className={`text-3xl font-bold ${colorClasses.text}`}>
                      ${values.serviceFee.toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Price Per Lb */}
                <div className={`${colorClasses.bg} border ${colorClasses.border} rounded-xl p-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Package className={`h-4 w-4 ${colorClasses.text}`} />
                    <label className="text-sm font-semibold text-gray-700">
                      Price Per Pound
                    </label>
                  </div>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-400">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={values.pricePerLb}
                        onChange={(e) => handleInputChange(cityConfig.name, 'pricePerLb', e.target.value)}
                        className="flex-1 text-2xl font-bold text-gray-900 border-b-2 border-primary-500 focus:outline-none bg-transparent"
                      />
                      <span className="text-lg font-medium text-gray-500">/ lb</span>
                    </div>
                  ) : (
                    <p className={`text-3xl font-bold ${colorClasses.text}`}>
                      ${values.pricePerLb.toFixed(2)}
                      <span className="text-lg text-gray-500"> / lb</span>
                    </p>
                  )}
                </div>

                {/* Example Calculation */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Example (5 lbs package)</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Fee:</span>
                      <span className="font-semibold">${values.serviceFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weight (5 lbs):</span>
                      <span className="font-semibold">${(values.pricePerLb * 5).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-300 pt-1 mt-1">
                      <div className="flex justify-between">
                        <span className="font-bold text-gray-900">Total:</span>
                        <span className={`font-bold ${colorClasses.text}`}>
                          ${(values.serviceFee + values.pricePerLb * 5).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleSave(cityConfig.name)}
                      disabled={isSaving}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleCancel(cityConfig.name)}
                      disabled={isSaving}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
