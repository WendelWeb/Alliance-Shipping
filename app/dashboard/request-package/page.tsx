'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n/useTranslation';
import {
  Package,
  MapPin,
  Hash,
  MessageSquare,
  Send,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Shirt,
  Smartphone,
  Apple,
  FileText,
  Box,
  Tag,
  DollarSign,
} from 'lucide-react';

export default function RequestPackagePage() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cityPricing, setCityPricing] = useState<{ serviceFee: number; pricePerLb: number } | null>(null);
  const [formData, setFormData] = useState({
    externalTrackingNumber: '',
    recipientCity: '',
    description: '',
    customerNotes: '',
    category: '',
    otherCategoryDescription: '', // Pour la catégorie "Autre"
  });

  // Fetch city-specific pricing when city is selected
  useEffect(() => {
    if (formData.recipientCity) {
      fetch(`/api/city-pricing/${formData.recipientCity}`)
        .then(res => res.json())
        .then(data => {
          setCityPricing({
            serviceFee: data.serviceFee,
            pricePerLb: data.pricePerLb,
          });
        })
        .catch(err => {
          console.error('Error fetching city pricing:', err);
        });
    }
  }, [formData.recipientCity]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      category,
      // Réinitialiser otherCategoryDescription si on ne sélectionne pas "other"
      otherCategoryDescription: category === 'other' ? prev.otherCategoryDescription : ''
    }));
    // Clear errors
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: '' }));
    }
    if (errors.otherCategoryDescription) {
      setErrors(prev => ({ ...prev, otherCategoryDescription: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.externalTrackingNumber.trim()) {
      newErrors.externalTrackingNumber = t.requestPackage.fields.trackingNumber.required;
    } else if (formData.externalTrackingNumber.trim().length < 5) {
      newErrors.externalTrackingNumber = t.requestPackage.fields.trackingNumber.minLength;
    }

    if (!formData.recipientCity) {
      newErrors.recipientCity = t.requestPackage.fields.destinationCity.required;
    }

    if (!formData.description.trim()) {
      newErrors.description = t.requestPackage.fields.description.required;
    } else if (formData.description.trim().length < 10) {
      newErrors.description = t.requestPackage.fields.description.minLength;
    }

    if (!formData.category) {
      newErrors.category = t.requestPackage.fields.category.required;
    }

    // Si catégorie "Autre", description obligatoire
    if (formData.category === 'other' && !formData.otherCategoryDescription.trim()) {
      newErrors.otherCategoryDescription = t.requestPackage.fields.category.otherDescription.required;
    } else if (formData.category === 'other' && formData.otherCategoryDescription.trim().length < 5) {
      newErrors.otherCategoryDescription = t.requestPackage.fields.category.otherDescription.minLength;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/package-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, locale }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit request');
      }

      setSuccess(true);

      // Redirect après 2 secondes avec hard refresh pour forcer le rechargement des données
      setTimeout(() => {
        window.location.href = '/packages';
      }, 2000);
    } catch (error: any) {
      console.error('Error submitting request:', error);
      setErrors({ submit: error.message || t.requestPackage.errors.submit });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="theme-card rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6"
          >
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </motion.div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {t.requestPackage.success.title}
          </h2>
          <p className="text-gray-600 mb-6">
            {t.requestPackage.success.message}
          </p>

          <div className="bg-blue-50 rounded-xl p-4 text-left">
            <p className="text-sm text-blue-900 font-medium mb-2">📦 {t.requestPackage.success.nextSteps} :</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• {t.requestPackage.success.steps[0]}</li>
              <li>• {t.requestPackage.success.steps[1]}</li>
              <li>• {t.requestPackage.success.steps[2]}</li>
              <li>• {t.requestPackage.success.steps[3]}</li>
            </ul>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 md:py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            {t.requestPackage.backButton}
          </button>

          <div className="theme-card rounded-2xl shadow-lg p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t.requestPackage.title}
            </h1>
            <p className="text-gray-600">
              {t.requestPackage.subtitle}
            </p>
          </div>

          {/* Info Card */}
          <div className="bg-blue-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">{t.requestPackage.info.title}</h3>
                <ul className="text-sm space-y-1 text-blue-50">
                  <li>• <strong>{t.requestPackage.fields.trackingNumber.label}:</strong> {t.requestPackage.info.trackingNumber}</li>
                  <li>• <strong>{t.requestPackage.fields.destinationCity.label}:</strong> {t.requestPackage.info.destinationCity}</li>
                  <li>• <strong>{t.requestPackage.fields.description.label}:</strong> {t.requestPackage.info.description}</li>
                  <li>• {t.requestPackage.info.recipient}</li>
                  <li>• {t.requestPackage.info.allianceTracking}</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tracking Number - TRÈS IMPORTANT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="theme-card rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-50 rounded-lg">
                <Hash className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {t.requestPackage.fields.trackingNumber.label} <span className="text-red-600">*</span>
                </h2>
                <p className="text-sm text-gray-600">{t.requestPackage.info.trackingNumber}</p>
              </div>
            </div>

            <input
              type="text"
              name="externalTrackingNumber"
              value={formData.externalTrackingNumber}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 text-lg font-mono transition-colors ${
                errors.externalTrackingNumber
                  ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-primary-500 focus:border-transparent'
              }`}
              placeholder={t.requestPackage.fields.trackingNumber.placeholder}
            />
            {errors.externalTrackingNumber && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600 mt-2 flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                {errors.externalTrackingNumber}
              </motion.p>
            )}
            {!errors.externalTrackingNumber && (
              <p className="text-xs text-gray-500 mt-2">
                {t.requestPackage.fields.trackingNumber.helper}
              </p>
            )}
          </motion.div>

          {/* Ville de Destination - TRÈS IMPORTANT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="theme-card rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-50 rounded-lg">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {t.requestPackage.fields.destinationCity.label} <span className="text-red-600">*</span>
                </h2>
                <p className="text-sm text-gray-600">{t.requestPackage.fields.destinationCity.question}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {/* Port-au-Prince */}
              <motion.button
                type="button"
                onClick={() => { setFormData(prev => ({ ...prev, recipientCity: 'Port-au-Prince' })); if (errors.recipientCity) setErrors(prev => ({ ...prev, recipientCity: '' })); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-3 md:p-6 rounded-xl border-2 transition-all ${
                  formData.recipientCity === 'Port-au-Prince'
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-10 h-10 md:w-16 md:h-16 rounded-full mb-1.5 md:mb-3 ${
                    formData.recipientCity === 'Port-au-Prince'
                      ? 'bg-blue-100'
                      : 'bg-gray-100'
                  }`}>
                    <MapPin className={`h-5 w-5 md:h-8 md:w-8 ${
                      formData.recipientCity === 'Port-au-Prince'
                        ? 'text-blue-600'
                        : 'text-gray-600'
                    }`} />
                  </div>
                  <h3 className="font-bold text-sm md:text-lg text-gray-900 mb-0.5 md:mb-1">Port-au-Prince</h3>
                  <p className="text-xs text-gray-500">{t.requestPackage.fields.destinationCity.capitale}</p>
                </div>
                {formData.recipientCity === 'Port-au-Prince' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 md:top-3 md:right-3 w-5 h-5 md:w-6 md:h-6 bg-blue-600 rounded-full flex items-center justify-center"
                  >
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>

              {/* Cap-Haïtien */}
              <motion.button
                type="button"
                onClick={() => { setFormData(prev => ({ ...prev, recipientCity: 'Cap-Haïtien' })); if (errors.recipientCity) setErrors(prev => ({ ...prev, recipientCity: '' })); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-3 md:p-6 rounded-xl border-2 transition-all ${
                  formData.recipientCity === 'Cap-Haïtien'
                    ? 'border-purple-500 bg-purple-50 shadow-lg'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-10 h-10 md:w-16 md:h-16 rounded-full mb-1.5 md:mb-3 ${
                    formData.recipientCity === 'Cap-Haïtien'
                      ? 'bg-purple-100'
                      : 'bg-gray-100'
                  }`}>
                    <MapPin className={`h-5 w-5 md:h-8 md:w-8 ${
                      formData.recipientCity === 'Cap-Haïtien'
                        ? 'text-purple-600'
                        : 'text-gray-600'
                    }`} />
                  </div>
                  <h3 className="font-bold text-sm md:text-lg text-gray-900 mb-0.5 md:mb-1">Cap-Haïtien</h3>
                  <p className="text-xs text-gray-500">{t.requestPackage.fields.destinationCity.nord}</p>
                </div>
                {formData.recipientCity === 'Cap-Haïtien' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 md:top-3 md:right-3 w-5 h-5 md:w-6 md:h-6 bg-purple-600 rounded-full flex items-center justify-center"
                  >
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>

              {/* Port-de-Paix */}
              <motion.button
                type="button"
                onClick={() => { setFormData(prev => ({ ...prev, recipientCity: 'Port-de-Paix' })); if (errors.recipientCity) setErrors(prev => ({ ...prev, recipientCity: '' })); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-3 md:p-6 rounded-xl border-2 transition-all ${
                  formData.recipientCity === 'Port-de-Paix'
                    ? 'border-green-500 bg-green-50 shadow-lg'
                    : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-10 h-10 md:w-16 md:h-16 rounded-full mb-1.5 md:mb-3 ${
                    formData.recipientCity === 'Port-de-Paix'
                      ? 'bg-green-100'
                      : 'bg-gray-100'
                  }`}>
                    <MapPin className={`h-5 w-5 md:h-8 md:w-8 ${
                      formData.recipientCity === 'Port-de-Paix'
                        ? 'text-green-600'
                        : 'text-gray-600'
                    }`} />
                  </div>
                  <h3 className="font-bold text-sm md:text-lg text-gray-900 mb-0.5 md:mb-1">Port-de-Paix</h3>
                  <p className="text-xs text-gray-500">{t.requestPackage.fields.destinationCity.nordOuest}</p>
                </div>
                {formData.recipientCity === 'Port-de-Paix' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 md:top-3 md:right-3 w-5 h-5 md:w-6 md:h-6 bg-green-600 rounded-full flex items-center justify-center"
                  >
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            </div>

            {errors.recipientCity && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600 mt-4 flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200"
              >
                <AlertCircle className="h-5 w-5" />
                {errors.recipientCity}
              </motion.p>
            )}

            {formData.recipientCity && cityPricing && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 space-y-2"
              >
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    {t.requestPackage.fields.destinationCity.confirmation} <strong>{formData.recipientCity}</strong>
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800 font-semibold mb-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Pricing for {formData.recipientCity}:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-green-600">Service Fee:</span>
                      <span className="ml-2 font-bold text-green-900">${cityPricing.serviceFee.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-green-600">Per Pound:</span>
                      <span className="ml-2 font-bold text-green-900">${cityPricing.pricePerLb.toFixed(2)}/lb</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Description du Colis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="theme-card rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {t.requestPackage.fields.description.label} <span className="text-red-600">*</span>
                </h2>
                <p className="text-sm text-gray-600">{t.requestPackage.fields.description.sublabel}</p>
              </div>
            </div>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={6}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-colors resize-none ${
                errors.description
                  ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-primary-500 focus:border-transparent'
              }`}
              placeholder={t.requestPackage.fields.description.placeholder}
            />
            {errors.description && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600 mt-2 flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                {errors.description}
              </motion.p>
            )}

            {/* Catégorie */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                {t.requestPackage.fields.category.label} <span className="text-red-600">*</span>
              </label>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {/* Général */}
                <motion.button
                  type="button"
                  onClick={() => handleCategoryChange('general')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    formData.category === 'general'
                      ? 'border-gray-500 bg-gray-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Box className={`h-6 w-6 ${formData.category === 'general' ? 'text-gray-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${formData.category === 'general' ? 'text-gray-900' : 'text-gray-600'}`}>
                      {t.requestPackage.fields.category.general}
                    </span>
                  </div>
                  {formData.category === 'general' && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </motion.button>

                {/* Vêtements */}
                <motion.button
                  type="button"
                  onClick={() => handleCategoryChange('clothing')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    formData.category === 'clothing'
                      ? 'border-pink-500 bg-pink-50 shadow-md'
                      : 'border-gray-200 hover:border-pink-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Shirt className={`h-6 w-6 ${formData.category === 'clothing' ? 'text-pink-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${formData.category === 'clothing' ? 'text-pink-900' : 'text-gray-600'}`}>
                      {t.requestPackage.fields.category.clothing}
                    </span>
                  </div>
                  {formData.category === 'clothing' && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-pink-600 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </motion.button>

                {/* Électronique */}
                <motion.button
                  type="button"
                  onClick={() => handleCategoryChange('electronics')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    formData.category === 'electronics'
                      ? 'border-indigo-500 bg-indigo-50 shadow-md'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Smartphone className={`h-6 w-6 ${formData.category === 'electronics' ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${formData.category === 'electronics' ? 'text-indigo-900' : 'text-gray-600'}`}>
                      {t.requestPackage.fields.category.electronics}
                    </span>
                  </div>
                  {formData.category === 'electronics' && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </motion.button>

                {/* Nourriture */}
                <motion.button
                  type="button"
                  onClick={() => handleCategoryChange('food')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    formData.category === 'food'
                      ? 'border-orange-500 bg-orange-50 shadow-md'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Apple className={`h-6 w-6 ${formData.category === 'food' ? 'text-orange-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${formData.category === 'food' ? 'text-orange-900' : 'text-gray-600'}`}>
                      {t.requestPackage.fields.category.food}
                    </span>
                  </div>
                  {formData.category === 'food' && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-orange-600 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </motion.button>

                {/* Documents */}
                <motion.button
                  type="button"
                  onClick={() => handleCategoryChange('documents')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    formData.category === 'documents'
                      ? 'border-cyan-500 bg-cyan-50 shadow-md'
                      : 'border-gray-200 hover:border-cyan-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <FileText className={`h-6 w-6 ${formData.category === 'documents' ? 'text-cyan-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${formData.category === 'documents' ? 'text-cyan-900' : 'text-gray-600'}`}>
                      {t.requestPackage.fields.category.documents}
                    </span>
                  </div>
                  {formData.category === 'documents' && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-cyan-600 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </motion.button>

                {/* Autre */}
                <motion.button
                  type="button"
                  onClick={() => handleCategoryChange('other')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    formData.category === 'other'
                      ? 'border-amber-500 bg-amber-50 shadow-md'
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Tag className={`h-6 w-6 ${formData.category === 'other' ? 'text-amber-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${formData.category === 'other' ? 'text-amber-900' : 'text-gray-600'}`}>
                      {t.requestPackage.fields.category.other}
                    </span>
                  </div>
                  {formData.category === 'other' && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-amber-600 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </motion.button>
              </div>

              {/* Champ de description pour catégorie "Autre" */}
              {formData.category === 'other' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.requestPackage.fields.category.otherDescription.label} <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="otherCategoryDescription"
                    value={formData.otherCategoryDescription}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      errors.otherCategoryDescription
                        ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-primary-500 focus:border-transparent'
                    }`}
                    placeholder={t.requestPackage.fields.category.otherDescription.placeholder}
                  />
                  {errors.otherCategoryDescription && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-600 mt-2 flex items-center gap-2"
                    >
                      <AlertCircle className="h-4 w-4" />
                      {errors.otherCategoryDescription}
                    </motion.p>
                  )}
                </motion.div>
              )}

              {errors.category && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600 mt-3 flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200"
                >
                  <AlertCircle className="h-5 w-5" />
                  {errors.category}
                </motion.p>
              )}
            </div>
          </motion.div>

          {/* Global Error Message */}
          {errors.submit && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border-2 border-red-200 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">Erreur de soumission</h3>
                  <p className="text-sm text-red-700">{errors.submit}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Validation Summary */}
          {Object.keys(errors).length > 0 && !errors.submit && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-orange-900 mb-1">{t.requestPackage.errors.title}</h3>
                  <ul className="text-sm text-orange-700 list-disc list-inside space-y-1">
                    {Object.entries(errors).filter(([key]) => key !== 'submit').map(([key, value]) => (
                      <li key={key}>{value}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex gap-4"
          >
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {t.requestPackage.buttons.cancel}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t.requestPackage.buttons.submitting}
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  {t.requestPackage.buttons.submit}
                </>
              )}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
