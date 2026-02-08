'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Phone,
  Mail,
  Clock,
  Navigation,
  ExternalLink,
  Building2,
} from 'lucide-react';

interface CityPricing {
  id: number;
  city: string;
  serviceFee: string;
  pricePerLb: string;
  isActive: boolean;
}

interface Warehouse {
  id: number;
  name: string;
  city: string;
  address: string;
  latitude: string;
  longitude: string;
  phone: string | null;
  email: string | null;
  openingHours: string | null;
  isActive: boolean;
}

export default function CitiesWarehousesPage() {
  const [cities, setCities] = useState<CityPricing[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [editingCity, setEditingCity] = useState<CityPricing | null>(null);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);

  // City form state
  const [cityForm, setCityForm] = useState({
    city: '',
    serviceFee: '5.00',
    pricePerLb: '4.00',
  });

  // Warehouse form state
  const [warehouseForm, setWarehouseForm] = useState({
    name: '',
    city: '',
    address: '',
    latitude: '',
    longitude: '',
    phone: '',
    email: '',
    openingHours: '',
  });

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [citiesRes, warehousesRes] = await Promise.all([
        fetch('/api/admin/city-pricing'),
        fetch('/api/admin/warehouses'),
      ]);

      if (citiesRes.ok) {
        const citiesData = await citiesRes.json();
        setCities(citiesData.cities || []);
      }

      if (warehousesRes.ok) {
        const warehousesData = await warehousesRes.json();
        setWarehouses(warehousesData.warehouses || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Get warehouses for selected city
  const cityWarehouses = selectedCity
    ? warehouses.filter((w) => w.city === selectedCity)
    : [];

  // Generate Google Maps link
  const getGoogleMapsLink = (lat: string, lng: string) => {
    return `https://maps.google.com/?q=${lat},${lng}&entry=gps&g_st=awb`;
  };

  // Handle city operations
  const handleAddCity = () => {
    setCityForm({ city: '', serviceFee: '5.00', pricePerLb: '4.00' });
    setEditingCity(null);
    setShowCityModal(true);
  };

  const handleEditCity = (city: CityPricing) => {
    setCityForm({
      city: city.city,
      serviceFee: city.serviceFee,
      pricePerLb: city.pricePerLb,
    });
    setEditingCity(city);
    setShowCityModal(true);
  };

  const handleSaveCity = async () => {
    try {
      const response = await fetch('/api/admin/city-pricing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: cityForm.city,
          serviceFee: parseFloat(cityForm.serviceFee),
          pricePerLb: parseFloat(cityForm.pricePerLb),
        }),
      });

      if (response.ok) {
        await loadData();
        setShowCityModal(false);
        alert('Ville sauvegardée avec succès!');
      } else {
        throw new Error('Failed to save city');
      }
    } catch (error) {
      console.error('Error saving city:', error);
      alert('Erreur lors de la sauvegarde de la ville');
    }
  };

  // Handle warehouse operations
  const handleAddWarehouse = (city: string) => {
    setWarehouseForm({
      name: '',
      city,
      address: '',
      latitude: '',
      longitude: '',
      phone: '',
      email: '',
      openingHours: '',
    });
    setEditingWarehouse(null);
    setShowWarehouseModal(true);
  };

  const handleEditWarehouse = (warehouse: Warehouse) => {
    setWarehouseForm({
      name: warehouse.name,
      city: warehouse.city,
      address: warehouse.address,
      latitude: warehouse.latitude,
      longitude: warehouse.longitude,
      phone: warehouse.phone || '',
      email: warehouse.email || '',
      openingHours: warehouse.openingHours || '',
    });
    setEditingWarehouse(warehouse);
    setShowWarehouseModal(true);
  };

  const handleSaveWarehouse = async () => {
    try {
      const url = editingWarehouse
        ? '/api/admin/warehouses'
        : '/api/admin/warehouses';

      const body = editingWarehouse
        ? { id: editingWarehouse.id, ...warehouseForm }
        : warehouseForm;

      const response = await fetch(url, {
        method: editingWarehouse ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await loadData();
        setShowWarehouseModal(false);
        alert('Dépôt sauvegardé avec succès!');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save warehouse');
      }
    } catch (error: any) {
      console.error('Error saving warehouse:', error);
      alert(error.message || 'Erreur lors de la sauvegarde du dépôt');
    }
  };

  const handleDeleteWarehouse = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce dépôt?')) return;

    try {
      const response = await fetch(`/api/admin/warehouses?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadData();
        alert('Dépôt supprimé avec succès!');
      } else {
        throw new Error('Failed to delete warehouse');
      }
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      alert('Erreur lors de la suppression du dépôt');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Villes et Dépôts</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gérez les villes et leurs points de dépôt/livraison
          </p>
        </div>
        <button
          onClick={handleAddCity}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Ajouter une ville
        </button>
      </div>

      {/* Cities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cities.map((city) => {
          const cityWarehousesList = warehouses.filter((w) => w.city === city.city);
          const isSelected = selectedCity === city.city;

          return (
            <motion.div
              key={city.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`theme-card rounded-2xl p-6 shadow-sm border-2 transition-all cursor-pointer ${
                isSelected
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300'
              }`}
              onClick={() => setSelectedCity(isSelected ? null : city.city)}
            >
              {/* City Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{city.city}</h3>
                    <p className="text-sm text-gray-500">
                      {cityWarehousesList.length} dépôt(s)
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditCity(city);
                  }}
                  className="text-gray-400 hover:text-primary-600 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>

              {/* City Pricing */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Frais de service</p>
                  <p className="text-xl font-bold text-gray-900">
                    ${parseFloat(city.serviceFee).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Par livre</p>
                  <p className="text-xl font-bold text-gray-900">
                    ${parseFloat(city.pricePerLb).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Add Warehouse Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddWarehouse(city.city);
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 font-semibold rounded-lg hover:border-primary-500 hover:text-primary-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Ajouter un dépôt
              </button>

              {/* Warehouses List (when expanded) */}
              <AnimatePresence>
                {isSelected && cityWarehousesList.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-2"
                  >
                    {cityWarehousesList.map((warehouse) => (
                      <div
                        key={warehouse.id}
                        className="bg-white border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <h4 className="font-semibold text-gray-900 text-sm">
                              {warehouse.name}
                            </h4>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditWarehouse(warehouse);
                              }}
                              className="text-gray-400 hover:text-primary-600 transition-colors"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteWarehouse(warehouse.id);
                              }}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{warehouse.address}</p>
                        <div className="flex items-center gap-2">
                          <a
                            href={getGoogleMapsLink(warehouse.latitude, warehouse.longitude)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Navigation className="h-3 w-3" />
                            Voir sur Google Maps
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* City Modal */}
      <AnimatePresence>
        {showCityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingCity ? 'Modifier la ville' : 'Ajouter une ville'}
                </h2>
                <button
                  onClick={() => setShowCityModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom de la ville
                  </label>
                  <input
                    type="text"
                    value={cityForm.city}
                    onChange={(e) => setCityForm({ ...cityForm, city: e.target.value })}
                    placeholder="Port-au-Prince"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500"
                    disabled={!!editingCity}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Frais de service ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={cityForm.serviceFee}
                      onChange={(e) => setCityForm({ ...cityForm, serviceFee: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Prix par livre ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={cityForm.pricePerLb}
                      onChange={(e) => setCityForm({ ...cityForm, pricePerLb: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowCityModal(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveCity}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
                  >
                    <Save className="h-5 w-5" />
                    Enregistrer
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Warehouse Modal */}
      <AnimatePresence>
        {showWarehouseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 my-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingWarehouse ? 'Modifier le dépôt' : 'Ajouter un dépôt'}
                </h2>
                <button
                  onClick={() => setShowWarehouseModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom du dépôt *
                  </label>
                  <input
                    type="text"
                    value={warehouseForm.name}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, name: e.target.value })}
                    placeholder="Dépôt Central"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ville *
                  </label>
                  <select
                    value={warehouseForm.city}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, city: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500"
                    disabled={!!editingWarehouse}
                  >
                    <option value="">Sélectionner une ville</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.city}>
                        {city.city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Adresse complète *
                  </label>
                  <textarea
                    value={warehouseForm.address}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, address: e.target.value })}
                    placeholder="123 Rue de la Paix, Port-au-Prince"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Latitude * <span className="text-xs text-gray-500">(ex: 19.708485)</span>
                    </label>
                    <input
                      type="text"
                      value={warehouseForm.latitude}
                      onChange={(e) => setWarehouseForm({ ...warehouseForm, latitude: e.target.value })}
                      placeholder="19.708485"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Longitude * <span className="text-xs text-gray-500">(ex: -72.261024)</span>
                    </label>
                    <input
                      type="text"
                      value={warehouseForm.longitude}
                      onChange={(e) => setWarehouseForm({ ...warehouseForm, longitude: e.target.value })}
                      placeholder="-72.261024"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                {warehouseForm.latitude && warehouseForm.longitude && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800 mb-2">
                      <Navigation className="inline h-4 w-4 mr-1" />
                      Aperçu GPS:
                    </p>
                    <a
                      href={getGoogleMapsLink(warehouseForm.latitude, warehouseForm.longitude)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 break-all"
                    >
                      {getGoogleMapsLink(warehouseForm.latitude, warehouseForm.longitude)}
                    </a>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Phone className="inline h-4 w-4 mr-1" />
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={warehouseForm.phone}
                      onChange={(e) => setWarehouseForm({ ...warehouseForm, phone: e.target.value })}
                      placeholder="+509 1234 5678"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Mail className="inline h-4 w-4 mr-1" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={warehouseForm.email}
                      onChange={(e) => setWarehouseForm({ ...warehouseForm, email: e.target.value })}
                      placeholder="depot@alliance.com"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Horaires d'ouverture
                  </label>
                  <input
                    type="text"
                    value={warehouseForm.openingHours}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, openingHours: e.target.value })}
                    placeholder="Lun-Ven: 8h-17h, Sam: 9h-13h"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowWarehouseModal(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveWarehouse}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
                  >
                    <Save className="h-5 w-5" />
                    Enregistrer
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
