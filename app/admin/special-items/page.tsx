'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Smartphone,
  Plus,
  Edit,
  Trash2,
  Search,
  DollarSign,
  Package,
  CheckCircle,
  X,
  Save,
} from 'lucide-react';
import { LoadingSpinner, SkeletonLoader, CardSkeleton } from '@/components/admin/LoadingSpinner';

// Mock data - Special items with fixed fees
const mockSpecialItems = [
  {
    id: 1,
    category: 'phone',
    brand: 'Apple',
    itemName: 'iPhone',
    minModel: '7',
    maxModel: '11',
    fixedFee: 15.00,
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 2,
    category: 'phone',
    brand: 'Apple',
    itemName: 'iPhone',
    minModel: '12',
    maxModel: '14',
    fixedFee: 20.00,
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 3,
    category: 'phone',
    brand: 'Apple',
    itemName: 'iPhone',
    minModel: '15',
    maxModel: '17',
    fixedFee: 25.00,
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 4,
    category: 'phone',
    brand: 'Samsung',
    itemName: 'Galaxy S',
    minModel: 'S6',
    maxModel: 'S10',
    fixedFee: 15.00,
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 5,
    category: 'phone',
    brand: 'Samsung',
    itemName: 'Galaxy S',
    minModel: 'S20',
    maxModel: 'S24',
    fixedFee: 20.00,
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 6,
    category: 'satellite',
    brand: 'SpaceX',
    itemName: 'Starlink',
    minModel: 'Standard',
    maxModel: 'Standard',
    fixedFee: 50.00,
    isActive: true,
    createdAt: '2026-01-01',
  },
];

interface SpecialItem {
  id?: number;
  category: string;
  brand: string;
  itemName: string;
  minModel: string;
  maxModel: string;
  fixedFee: number;
  isActive: boolean;
  createdAt?: string;
}

export default function SpecialItemsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState(mockSpecialItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<SpecialItem>({
    category: 'phone',
    brand: '',
    itemName: '',
    minModel: '',
    maxModel: '',
    fixedFee: 0,
    isActive: true,
  });

  useEffect(() => {
    const loadSpecialItems = async () => {
      setLoading(true);
      try {
        // No simulation delay for instant loading
        await new Promise((resolve) => setTimeout(resolve, 0));

        // TODO: Replace with real API call
        // const response = await fetch('/api/admin/special-items');
        // const data = await response.json();
        // setItems(data);

        setItems(mockSpecialItems);
      } catch (error) {
        console.error('Error loading special items:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSpecialItems();
  }, []);

  const filteredItems = items.filter(
    (item) =>
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    console.log('Adding new item:', formData);
    // TODO: API call to create
    setIsAddingNew(false);
    setFormData({
      category: 'phone',
      brand: '',
      itemName: '',
      minModel: '',
      maxModel: '',
      fixedFee: 0,
      isActive: true,
    });
  };

  const handleEdit = (item: typeof mockSpecialItems[0]) => {
    setEditingId(item.id);
    setFormData(item);
  };

  const handleUpdate = () => {
    console.log('Updating item:', formData);
    // TODO: API call to update
    setEditingId(null);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      console.log('Deleting item:', id);
      // TODO: API call to delete
    }
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setEditingId(null);
    setFormData({
      category: 'phone',
      brand: '',
      itemName: '',
      minModel: '',
      maxModel: '',
      fixedFee: 0,
      isActive: true,
    });
  };

  const categoryIcons = {
    phone: Smartphone,
    tablet: Package,
    satellite: Smartphone,
    laptop: Package,
  };

  const categoryColors = {
    phone: 'from-blue-500 to-blue-600',
    tablet: 'from-purple-500 to-purple-600',
    satellite: 'from-green-500 to-green-600',
    laptop: 'from-orange-500 to-orange-600',
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-9 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="mt-2 h-5 w-96 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex gap-4 mb-6">
          <div className="h-12 flex-1 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-12 w-40 bg-gray-200 rounded-xl animate-pulse" />
        </div>
        <SkeletonLoader rows={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Special Items</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage items with fixed shipping fees (iPhones, Samsung, Starlink, etc.)
          </p>
        </div>
        <button
          onClick={() => setIsAddingNew(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Special Item
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by brand or item name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Add/Edit Form */}
      {(isAddingNew || editingId !== null) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border-2 border-primary-200"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {isAddingNew ? 'Add New Special Item' : 'Edit Special Item'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="phone">Phone</option>
                <option value="tablet">Tablet</option>
                <option value="laptop">Laptop</option>
                <option value="satellite">Satellite Equipment</option>
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g., Apple, Samsung, SpaceX"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Item Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Name
              </label>
              <input
                type="text"
                value={formData.itemName}
                onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                placeholder="e.g., iPhone, Galaxy S, Starlink"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Min Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Model
              </label>
              <input
                type="text"
                value={formData.minModel}
                onChange={(e) => setFormData({ ...formData, minModel: e.target.value })}
                placeholder="e.g., 7, S6, Standard"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Max Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Model
              </label>
              <input
                type="text"
                value={formData.maxModel}
                onChange={(e) => setFormData({ ...formData, maxModel: e.target.value })}
                placeholder="e.g., 11, S10, Standard"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Fixed Fee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fixed Fee ($)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.fixedFee}
                  onChange={(e) =>
                    setFormData({ ...formData, fixedFee: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0.00"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={isAddingNew ? handleAdd : handleUpdate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              {isAddingNew ? 'Add Item' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item, index) => {
          const Icon = categoryIcons[item.category as keyof typeof categoryIcons] || Smartphone;
          const colorClass = categoryColors[item.category as keyof typeof categoryColors] || categoryColors.phone;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                {item.isActive && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    <CheckCircle className="h-3 w-3" />
                    Active
                  </span>
                )}
              </div>

              {/* Item Info */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {item.brand} {item.itemName}
                </h3>
                <p className="text-sm text-gray-600">
                  Models: {item.minModel} - {item.maxModel}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Category: {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                </p>
              </div>

              {/* Fixed Fee */}
              <div className="bg-green-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-600 mb-1">Fixed Shipping Fee</p>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">
                    {item.fixedFee.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-3 py-2 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <Smartphone className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No special items found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery
              ? 'Try a different search query'
              : 'Get started by adding a special item'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setIsAddingNew(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add First Item
            </button>
          )}
        </div>
      )}
    </div>
  );
}
