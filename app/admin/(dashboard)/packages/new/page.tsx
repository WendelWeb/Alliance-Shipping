'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Package,
  Scale,
  Save,
  X,
  ArrowLeft,
  AlertCircle,
  FileText,
  Hash,
  Tag,
  MessageSquare,
  Search,
  User,
  XCircle,
} from 'lucide-react';

export default function NewPackagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pricingLoading, setPricingLoading] = useState(true);
  // ✅ CHANGED: Start at 0, fetch from Drizzle (not hardcoded)
  const [currentServiceFee, setCurrentServiceFee] = useState(0);
  const [currentPricePerLb, setCurrentPricePerLb] = useState(0);
  const [formData, setFormData] = useState({
    externalTrackingNumber: '',
    category: 'general',
    weight: '',
    description: '',
    status: 'received',
    notes: '',
    customsFees: '', // ⭐ Nouveau champ optionnel
  });

  // User assignment
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);

  // Special items
  const [packageType, setPackageType] = useState<'normal' | 'special'>('normal');
  const [specialItems, setSpecialItems] = useState<any[]>([]);
  const [selectedSpecialItem, setSelectedSpecialItem] = useState<number | null>(null);
  const [chargeByWeight, setChargeByWeight] = useState(false);

  // Fetch default pricing on mount (Alliance Shipping account = default city pricing)
  useEffect(() => {
    fetch('/api/pricing/all')
      .then(res => res.json())
      .then(data => {
        const cities = data.cities || [];
        // Use first city (default) pricing
        if (cities.length > 0) {
          setCurrentServiceFee(cities[0].serviceFee);
          setCurrentPricePerLb(cities[0].pricePerLb);
        }
      })
      .catch(error => {
        console.error('Error fetching pricing:', error);
      })
      .finally(() => {
        setPricingLoading(false);
      });
  }, []);

  // Fetch special items
  useEffect(() => {
    fetch('/api/special-items/public')
      .then(res => res.json())
      .then(data => {
        setSpecialItems(data?.items || []);
      })
      .catch(error => {
        console.error('Error fetching special items:', error);
      });
  }, []);

  // Update pricing when user is selected
  useEffect(() => {
    if (selectedUser && selectedUser.city) {
      setPricingLoading(true);
      fetch('/api/pricing/all')
        .then(res => res.json())
        .then(data => {
          const cities = data.cities || [];
          const userCityPricing = cities.find((c: any) => c.city === selectedUser.city);
          if (userCityPricing) {
            setCurrentServiceFee(userCityPricing.serviceFee);
            setCurrentPricePerLb(userCityPricing.pricePerLb);
          }
        })
        .catch(error => {
          console.error('Error fetching user city pricing:', error);
        })
        .finally(() => {
          setPricingLoading(false);
        });
    }
  }, [selectedUser]);

  // Search users with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (userSearchQuery.trim().length >= 2) {
        setUserSearchLoading(true);
        fetch(`/api/admin/users?search=${encodeURIComponent(userSearchQuery.trim())}&limit=5`)
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setUserSearchResults(data.users || []);
            }
          })
          .catch(error => {
            console.error('Error searching users:', error);
          })
          .finally(() => {
            setUserSearchLoading(false);
          });
      } else {
        setUserSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [userSearchQuery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateFees = () => {
    const weight = parseInt(formData.weight) || 0;
    const serviceFee = currentServiceFee;
    const shippingFee = weight * currentPricePerLb;
    const customsFees = parseFloat(formData.customsFees) || 0; // ⭐ Parse customs fees
    const total = serviceFee + shippingFee + customsFees; // ⭐ Include dans le total
    return { serviceFee, shippingFee, customsFees, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          externalTrackingNumber: formData.externalTrackingNumber,
          description: formData.description,
          weight: formData.weight,
          category: formData.category,
          status: formData.status,
          specialInstructions: formData.notes || undefined,
          userId: selectedUser?.id || undefined, // Assign to specific user if selected
          specialItemId: packageType === 'special' ? selectedSpecialItem : undefined,
          chargeByWeight: packageType === 'special' ? chargeByWeight : undefined,
          customsFees: formData.customsFees || undefined, // ⭐ Include customs fees if provided
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create package');
      }

      const data = await res.json();

      if (data.transferMessage) {
        alert(data.transferMessage);
      }

      router.push('/admin/packages');
    } catch (error: any) {
      console.error('Error creating package:', error);
      alert(error.message || 'Erreur lors de la creation du colis. Veuillez reessayer.');
    } finally {
      setLoading(false);
    }
  };

  const fees = calculateFees();

  const categoryOptions = [
    { value: 'general', label: 'General' },
    { value: 'clothing', label: 'Vetements' },
    { value: 'electronics', label: 'Electronique' },
    { value: 'food', label: 'Nourriture' },
    { value: 'documents', label: 'Documents' },
    { value: 'other', label: 'Autre' },
  ];

  const statusOptions = [
    { value: 'received', label: 'Recu (Miami)' },
    { value: 'in-transit', label: 'En Transit' },
    { value: 'available', label: 'Disponible' },
    { value: 'delivered', label: 'Livre' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ajouter un Colis</h1>
            <p className="mt-2 text-sm text-gray-600">
              Ajouter un nouveau colis dans le systeme
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Package Type */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="theme-card rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Package className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Type de Colis</h2>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setPackageType('normal');
                    setSelectedSpecialItem(null);
                  }}
                  className={`p-4 border-2 rounded-xl transition-all ${
                    packageType === 'normal'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Package className="h-8 w-8 mx-auto mb-2 text-gray-700" />
                  <p className="font-semibold text-gray-900">Colis Normal</p>
                  <p className="text-xs text-gray-500">Calculé par poids</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPackageType('special')}
                  className={`p-4 border-2 rounded-xl transition-all ${
                    packageType === 'special'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Package className="h-8 w-8 mx-auto mb-2 text-gray-700" />
                  <p className="font-semibold text-gray-900">Article Spécial</p>
                  <p className="text-xs text-gray-500">Prix fixe</p>
                </button>
              </div>

              {/* Special Items Grid */}
              {packageType === 'special' && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Sélectionner un Article
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {specialItems.filter(item => item.isActive).map(item => (
                      <motion.div
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedSpecialItem(item.id)}
                        className={`p-3 border-2 rounded-xl cursor-pointer transition-all ${
                          selectedSpecialItem === item.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-semibold text-sm text-center text-gray-900">
                          {item.itemName}
                        </p>
                        <p className="text-xs text-gray-500 text-center">{item.brand}</p>
                        <p className="text-lg font-bold text-primary-600 text-center mt-1">
                          ${parseFloat(item.fixedFee).toFixed(2)}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Charge by Weight Checkbox */}
                  {selectedSpecialItem && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={chargeByWeight}
                          onChange={(e) => setChargeByWeight(e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Charger aussi par poids (lbs)
                        </span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1 ml-6">
                        Si coché: Prix = Fixe + Service Fee + (Poids × Tarif/lb)
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Tracking & Category */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="theme-card rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Hash className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Identification</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numero de Tracking Externe *
                  </label>
                  <input
                    type="text"
                    name="externalTrackingNumber"
                    value={formData.externalTrackingNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ex: 1Z999AA10123456784"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categorie *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {categoryOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

            {/* User Assignment (Optional) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="theme-card rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-50 rounded-lg">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Assigner à (Optionnel)</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Laissez vide pour ajouter au compte Alliance Shipping
                  </p>
                </div>
              </div>

              {selectedUser ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <User className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {selectedUser.firstName} {selectedUser.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{selectedUser.email}</p>
                        {selectedUser.city && (
                          <p className="text-xs text-gray-500 mt-1">
                            📍 {selectedUser.city}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedUser(null)}
                      className="p-1 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      <XCircle className="h-5 w-5 text-green-600" />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rechercher un utilisateur
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      placeholder="Nom, email, téléphone..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {userSearchLoading && (
                    <div className="mt-2 text-sm text-gray-500">Recherche...</div>
                  )}

                  {userSearchResults.length > 0 && (
                    <div className="mt-2 border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-60 overflow-y-auto">
                      {userSearchResults.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => {
                            setSelectedUser(user);
                            setUserSearchQuery('');
                            setUserSearchResults([]);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-full">
                              <User className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                              {user.city && (
                                <p className="text-xs text-gray-500">📍 {user.city}</p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {userSearchQuery.trim().length >= 2 && !userSearchLoading && userSearchResults.length === 0 && (
                    <div className="mt-2 text-sm text-gray-500">Aucun utilisateur trouvé</div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Package Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="theme-card rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Package className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Details du Colis</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Poids (lbs) *
                    </label>
                    <div className="relative">
                      <Scale className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        required
                        min="1"
                        step="1"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Ex: 5"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Nombres entiers seulement (1, 2, 3...)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Statut Initial *
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {statusOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Decrivez le contenu du colis..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optionnel)
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={2}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Instructions speciales, remarques..."
                    />
                  </div>
                </div>

                {/* ⭐ Customs Fees Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frais de douane (Optionnel)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      name="customsFees"
                      value={formData.customsFees}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    À ajouter si des frais de douane sont déjà connus
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Summary Sidebar - 1/3 width */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="theme-card rounded-2xl p-6 sticky top-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Resume des Frais</h3>

              {pricingLoading ? (
                <div className="space-y-3 mb-6">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Poids:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formData.weight || '0'} lbs
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Frais de service:</span>
                    <span className="text-sm font-medium text-gray-900">
                      ${fees.serviceFee.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Frais de poids ({currentPricePerLb.toFixed(2)}$/lb):
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      ${fees.shippingFee.toFixed(2)}
                    </span>
                  </div>

                  {/* ⭐ Customs Fees Display */}
                  {fees.customsFees > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Frais de douane:</span>
                      <span className="text-sm font-medium text-red-600">
                        +${fees.customsFees.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-semibold text-gray-900">Total:</span>
                      <span className="text-xl font-bold text-primary-600">
                        ${fees.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className={`border rounded-lg p-4 mb-6 ${selectedUser ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                <div className="flex items-start gap-2">
                  <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${selectedUser ? 'text-green-600' : 'text-amber-600'}`} />
                  <div className={`text-xs ${selectedUser ? 'text-green-800' : 'text-amber-800'}`}>
                    <p className="font-semibold mb-1">
                      {selectedUser ? 'Attribution directe' : 'Note'}:
                    </p>
                    <p>
                      {selectedUser ? (
                        <>
                          Ce colis sera directement assigné à{' '}
                          <span className="font-semibold">
                            {selectedUser.firstName} {selectedUser.lastName}
                          </span>
                          {selectedUser.city && (
                            <> ({selectedUser.city})</>
                          )}.
                        </>
                      ) : (
                        <>
                          Ce colis sera ajoute au compte Alliance Shipping. Si un utilisateur a deja fait une requete avec ce tracking, le colis sera automatiquement transfere.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-5 w-5" />
                  {loading ? 'Creation en cours...' : 'Creer le Colis'}
                </button>

                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="h-5 w-5" />
                  Annuler
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </form>
    </div>
  );
}
