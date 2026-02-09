'use client';

import { useState } from 'react';
import { Search, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

export default function ForcePhonePage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const checkUser = async () => {
    if (!email) {
      alert('Entrez un email!');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `/api/admin/force-phone-modal?email=${encodeURIComponent(email)}`
      );
      const data = await response.json();

      if (response.ok) {
        setResult({ type: 'check', data });
      } else {
        alert(data.error || 'Erreur');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const resetPhone = async () => {
    if (!email) {
      alert('Entrez un email!');
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir RESET le numéro de ${email}?`)) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/force-phone-modal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (response.ok) {
        setResult({ type: 'reset', data });
        alert('✅ Numéro reset! L\'utilisateur sera bloqué.');
      } else {
        alert(data.error || 'Erreur');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Force Phone Modal</h1>
        <p className="mt-2 text-sm text-gray-600">
          Vérifier et forcer le modal pour un utilisateur
        </p>
      </div>

      {/* Email Input */}
      <div className="theme-card rounded-2xl p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email de l&apos;utilisateur
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
              onKeyPress={(e) => e.key === 'Enter' && checkUser()}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={checkUser}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              <Search className="h-5 w-5" />
              {loading ? 'Vérification...' : 'Vérifier'}
            </button>

            <button
              onClick={resetPhone}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className="h-5 w-5" />
              {loading ? 'Reset...' : 'Reset Phone'}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="theme-card rounded-2xl p-6 shadow-sm">
          {result.type === 'check' && (
            <div className="space-y-4">
              <div
                className={`flex items-center gap-3 p-4 rounded-xl ${
                  result.data.status.isBlocked
                    ? 'bg-red-50 border-2 border-red-200'
                    : 'bg-green-50 border-2 border-green-200'
                }`}
              >
                {result.data.status.isBlocked ? (
                  <AlertCircle className="h-6 w-6 text-red-600" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                )}
                <div className="flex-1">
                  <p
                    className={`font-semibold ${
                      result.data.status.isBlocked ? 'text-red-900' : 'text-green-900'
                    }`}
                  >
                    {result.data.message}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-gray-900">Informations utilisateur:</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase mb-1">Email</p>
                    <p className="font-semibold text-gray-900">{result.data.user.email}</p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase mb-1">Phone</p>
                    <p className="font-semibold text-gray-900">{result.data.user.phone}</p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase mb-1">City</p>
                    <p className="font-semibold text-gray-900">{result.data.user.city}</p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase mb-1">Warehouse ID</p>
                    <p className="font-semibold text-gray-900">{result.data.user.warehouseId}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <h4 className="font-semibold text-gray-900">Status:</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {result.data.status.hasValidPhone ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm">
                        Valid Phone (with +): {result.data.status.hasValidPhone ? '✅' : '❌'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {result.data.status.hasCity ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm">
                        Has City: {result.data.status.hasCity ? '✅' : '❌'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {result.data.status.hasWarehouse ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm">
                        Has Warehouse: {result.data.status.hasWarehouse ? '✅' : '❌'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {result.type === 'reset' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border-2 border-green-200">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <p className="font-semibold text-green-900">{result.data.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Avant:</h4>
                  <div className="bg-red-50 p-3 rounded-lg space-y-1">
                    <p className="text-sm">Phone: {result.data.before.phone}</p>
                    <p className="text-sm">Country: {result.data.before.countryCode}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Après:</h4>
                  <div className="bg-green-50 p-3 rounded-lg space-y-1">
                    <p className="text-sm">Phone: {result.data.after.phone}</p>
                    <p className="text-sm">Country: {result.data.after.countryCode}</p>
                    <p className="text-sm">City: {result.data.after.city}</p>
                    <p className="text-sm">Warehouse: {result.data.after.warehouseId}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
