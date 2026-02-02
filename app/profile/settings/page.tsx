'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Container } from '@/components/Container';
import {
  User,
  Camera,
  ArrowLeft,
  Save,
  Loader2,
  Check,
  Phone,
  Mail,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhoneNumber(user.primaryPhoneNumber?.phoneNumber || '');
    }
  }, [user]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    router.push('/sign-in');
    return null;
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La taille de l&apos;image doit être inférieure à 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner un fichier image valide');
      return;
    }

    setUploadingImage(true);
    setError('');

    try {
      await user.setProfileImage({ file });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError(err.errors?.[0]?.message || err.message || 'Échec du téléchargement de l&apos;image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      let updateSuccess = false;

      // Update name
      if (firstName.trim() !== user.firstName || lastName.trim() !== user.lastName) {
        try {
          await user.update({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
          });
          updateSuccess = true;
        } catch (nameError: any) {
          console.error('Name update error:', nameError);
          throw new Error(nameError.errors?.[0]?.message || nameError.message || 'Échec de la mise à jour du nom');
        }
      }

      // Update phone number - Only if changed and not empty
      const currentPhone = user.primaryPhoneNumber?.phoneNumber || '';
      if (phoneNumber && phoneNumber !== currentPhone) {
        try {
          // Remove existing phone numbers
          const existingPhones = user.phoneNumbers || [];
          for (const phone of existingPhones) {
            try {
              await phone.destroy();
            } catch (e) {
              console.log('Could not remove existing phone:', e);
            }
          }

          // Add the new phone number
          await user.createPhoneNumber({ phoneNumber });
          updateSuccess = true;
        } catch (phoneError: any) {
          console.error('Phone update error:', phoneError);
          // Don't fail completely if only phone failed
          if (!updateSuccess) {
            throw new Error('Échec de la mise à jour du numéro de téléphone: ' + (phoneError.errors?.[0]?.message || phoneError.message));
          } else {
            setError('Nom mis à jour mais le numéro de téléphone n&apos;a pas pu être changé');
          }
        }
      }

      if (updateSuccess || (firstName.trim() === user.firstName && lastName.trim() === user.lastName && phoneNumber === currentPhone)) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/profile');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Échec de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-x-hidden">
      <Header />
      <main className="min-h-screen pb-32 pt-2 md:pt-4 bg-gradient-to-br from-gray-50 via-white to-primary-50">
        <Container>
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Retour au profil
            </Link>

            <h1 className="text-3xl font-bold text-gray-900">Paramètres du Profil</h1>
            <p className="text-gray-600 mt-2">
              Modifiez vos informations personnelles
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-green-50 border-2 border-green-200 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">Profil mis à jour!</h3>
                  <p className="text-sm text-green-700">Vos informations ont été enregistrées avec succès</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <div className="text-red-600">⚠️</div>
                <div>
                  <h3 className="font-semibold text-red-900">Erreur</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Camera className="h-6 w-6 text-primary-600" />
                Photo de Profil
              </h2>

              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-gray-200">
                    {user.imageUrl ? (
                      <Image
                        src={user.imageUrl}
                        alt={`${user.firstName} ${user.lastName}`}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                        <User className="w-12 h-12 text-white" />
                      </div>
                    )}
                  </div>
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                  )}
                </div>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Camera className="h-4 w-4" />
                    {uploadingImage ? 'Téléchargement...' : 'Changer la photo'}
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    JPG, PNG ou GIF. Max 5MB.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Personal Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-6 w-6 text-primary-600" />
                Informations Personnelles
              </h2>

              <div className="space-y-4">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Votre prénom"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Votre nom"
                  />
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.primaryEmailAddress?.emailAddress || ''}
                    disabled
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    L&apos;email ne peut pas être modifié ici
                  </p>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Numéro de Téléphone
                  </label>
                  <PhoneInput
                    international
                    defaultCountry="HT"
                    value={phoneNumber}
                    onChange={(value) => setPhoneNumber(value || '')}
                    className="w-full phone-input-custom"
                    placeholder="Entrez votre numéro"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Sélectionnez votre pays et entrez votre numéro
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Save Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex gap-4"
            >
              <Link
                href="/profile"
                className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-center"
              >
                Annuler
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Enregistrer les modifications
                  </>
                )}
              </button>
            </motion.div>
          </form>
        </Container>
      </main>
      <BottomNav />

      <style jsx global>{`
        .phone-input-custom input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #d1d5db;
          border-radius: 0.75rem;
          font-size: 1rem;
          outline: none;
          transition: all 0.2s;
        }

        .phone-input-custom input:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .phone-input-custom .PhoneInputCountry {
          padding: 0.5rem;
          margin-right: 0.5rem;
        }

        .phone-input-custom .PhoneInputCountrySelect {
          border: 2px solid #d1d5db;
          border-radius: 0.5rem;
          padding: 0.25rem;
          font-size: 1rem;
          outline: none;
        }

        .phone-input-custom .PhoneInputCountrySelect:focus {
          border-color: #10b981;
        }
      `}</style>
    </div>
  );
}
