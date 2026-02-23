import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  Search,
  Package,
  X,
  LogIn,
  MapPin,
  Check,
  Send,
  Layers,
  Gift,
  ChevronRight,
  Scale,
  ShoppingCart,
  Globe,
  Sparkles,
  ArrowRight,
} from 'lucide-react-native';
import { useTheme } from '@/lib/themes/ThemeProvider';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { api } from '@/lib/api';
import { getLocalPackages, isSQLiteAvailable } from '@/lib/offline/database';
import { PackageCard } from '@/components/PackageCard';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TimelineEvent {
  status: string;
  date: string;
  location: string;
  description?: string;
}

interface PackageItem {
  id: string | number;
  trackingNumber: string;
  externalTrackingNumber?: string;
  description: string;
  weight: number | string;
  status: string;
  category: string;
  createdAt: string;
  currentLocation?: string;
  customsFees?: number;
  specialItemId?: number;
  specialItemName?: string;
  specialItemBrand?: string;
  chargeByWeight?: boolean;
  serviceFee?: string;
  weightCost?: string;
  totalCost?: string;
  timeline: TimelineEvent[];
}

interface PackagesResponse {
  success: boolean;
  packages: PackageItem[];
}

// ---------------------------------------------------------------------------
// Status filter chip config
// ---------------------------------------------------------------------------

type FilterKey = 'all' | 'pending' | 'received' | 'in-transit' | 'available' | 'delivered' | 'rejected';

const FILTER_KEYS: FilterKey[] = [
  'all',
  'pending',
  'received',
  'in-transit',
  'available',
  'delivered',
  'rejected',
];

// ---------------------------------------------------------------------------
// Cities config
// ---------------------------------------------------------------------------

const CITIES = [
  { id: 'Port-au-Prince', labelKey: 'portAuPrince', subKey: 'capitale', emoji: '\uD83C\uDFDB\uFE0F' },
  { id: 'Cap-Haïtien', labelKey: 'capHaitien', subKey: 'nord', emoji: '\u2693' },
  { id: 'Port-de-Paix', labelKey: 'portDePaix', subKey: 'nordOuest', emoji: '\uD83C\uDF0A' },
] as const;

// ---------------------------------------------------------------------------
// Categories config
// ---------------------------------------------------------------------------

const CATEGORY_CONFIG = [
  { id: 'general', emoji: '\uD83D\uDCE6' },
  { id: 'clothing', emoji: '\uD83D\uDC55' },
  { id: 'electronics', emoji: '\uD83D\uDCF1' },
  { id: 'food', emoji: '\uD83C\uDF4E' },
  { id: 'documents', emoji: '\uD83D\uDCC4' },
  { id: 'other', emoji: '\uD83C\uDFF7\uFE0F' },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PackagesScreen() {
  const insets = useSafeAreaInsets();
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const { openRequest } = useLocalSearchParams<{ openRequest?: string }>();
  const { t, locale } = useTranslation();
  const { colors, fonts, spacing, borderRadius, shadows, card, isDark } = useTheme();

  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [fetchError, setFetchError] = useState('');

  // Request modal state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  // ✅ REMOVED: selectedCity state - now uses user's profile city
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [requestError, setRequestError] = useState('');
  const [packageType, setPackageType] = useState<'normal' | 'special' | null>(null);
  const [selectedSpecialItem, setSelectedSpecialItem] = useState<number | null>(null);
  const [specialItems, setSpecialItems] = useState<any[]>([]);

  // Auto-open request modal when navigated from profile
  useEffect(() => {
    if (openRequest === 'true') {
      setShowRequestModal(true);
      // Clear the param so it doesn't re-open on next render
      router.setParams({ openRequest: undefined as any });
    }
  }, [openRequest]);

  // -------------------------------------------------------------------------
  // Data fetching
  // -------------------------------------------------------------------------

  const fetchPackages = useCallback(async () => {
    setFetchError('');
    try {
      const response = await api.get<PackagesResponse>('/api/user/packages');
      const items = response?.packages ?? response;
      if (Array.isArray(items)) {
        setPackages(items);
      } else {
        setPackages([]);
      }
    } catch (err: any) {
      console.warn('[PACKAGES] Fetch error, trying offline cache:', err?.message);
      setFetchError(err?.message || t.common.error);
      // Fallback to offline cache
      if (isSQLiteAvailable()) {
        try {
          const cached = await getLocalPackages();
          if (cached.length > 0) {
            setPackages(cached);
            setFetchError(''); // Clear error if we have cached data
          }
        } catch {}
      }
    } finally {
      setLoading(false);
    }
  }, [t.common.error]);

  useEffect(() => {
    if (isSignedIn) {
      fetchPackages();
    } else {
      setLoading(false);
    }
  }, [isSignedIn, fetchPackages]);

  // Fetch special items when modal opens
  useEffect(() => {
    if (showRequestModal && specialItems.length === 0) {
      api.get('/api/special-items/public')
        .then((res: any) => {
          setSpecialItems(res?.items || res || []);
        })
        .catch((err: any) => {
          console.error('[SPECIAL-ITEMS] Fetch error:', err);
        });
    }
  }, [showRequestModal]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPackages();
    setRefreshing(false);
  }, [fetchPackages]);

  // -------------------------------------------------------------------------
  // Filtering
  // -------------------------------------------------------------------------

  const filteredPackages = useMemo(() => {
    let result = packages;

    if (activeFilter !== 'all') {
      result = result.filter((pkg) => pkg.status === activeFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter(
        (pkg) =>
          pkg.trackingNumber?.toLowerCase().includes(query) ||
          pkg.externalTrackingNumber?.toLowerCase().includes(query) ||
          pkg.description?.toLowerCase().includes(query),
      );
    }

    return result;
  }, [packages, activeFilter, searchQuery]);

  // -------------------------------------------------------------------------
  // Bundle grouping: group 2+ available packages into 1 card
  // -------------------------------------------------------------------------

  const availablePackages = useMemo(
    () => packages.filter((pkg) => pkg.status === 'available'),
    [packages],
  );
  const hasBundleOpportunity = availablePackages.length >= 2;

  // When bundle opportunity exists, remove available packages from individual list
  const displayPackages = useMemo(() => {
    if (!hasBundleOpportunity) return filteredPackages;
    // If user is filtering by 'available', show nothing (bundle card replaces them)
    if (activeFilter === 'available') return [];
    // If 'all' or other filter, remove available ones (they're in the bundle card)
    return filteredPackages.filter((pkg) => pkg.status !== 'available');
  }, [filteredPackages, hasBundleOpportunity, activeFilter]);

  const bundleSavings = useMemo(() => {
    if (!hasBundleOpportunity) return 0;
    // Sum real service fees of all packages except the first (those get waived)
    return availablePackages.slice(1).reduce(
      (sum, p) => sum + (parseFloat(p.serviceFee || '0') || 0), 0
    );
  }, [availablePackages, hasBundleOpportunity]);

  const bundleTotalWeight = useMemo(() => {
    return availablePackages.reduce((sum, p) => sum + (parseFloat(String(p.weight)) || 0), 0);
  }, [availablePackages]);

  // -------------------------------------------------------------------------
  // Filter label resolver
  // -------------------------------------------------------------------------

  const filterLabel = useCallback(
    (key: FilterKey): string => {
      const map: Record<FilterKey, string> = {
        all: t.packages.filters.all,
        pending: t.packages.filters.pending,
        received: t.packages.filters.received,
        'in-transit': t.packages.filters.inTransit,
        available: t.packages.filters.available,
        delivered: t.packages.filters.delivered,
        rejected: t.packages.filters.rejected,
      };
      return map[key];
    },
    [t],
  );

  // -------------------------------------------------------------------------
  // Request modal
  // -------------------------------------------------------------------------

  const resetRequestForm = useCallback(() => {
    setTrackingNumber('');
    setDescription('');
    setCategory('');
    setCustomerNotes('');
    setRequestError('');
    setRequestSuccess(false);
    setPackageType(null);
    setSelectedSpecialItem(null);
  }, []);

  const openRequestModal = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    resetRequestForm();
    setShowRequestModal(true);
  }, [resetRequestForm]);

  const closeRequestModal = useCallback(() => {
    setShowRequestModal(false);
    if (requestSuccess) {
      fetchPackages();
    }
  }, [requestSuccess, fetchPackages]);

  const handleSubmitRequest = useCallback(async () => {
    setRequestError('');

    if (!packageType) {
      setRequestError('\u26A0\uFE0F ' + t.requestPackage.fields.packageType.required);
      return;
    }
    if (packageType === 'special' && !selectedSpecialItem) {
      setRequestError('\u26A0\uFE0F ' + t.requestPackage.fields.specialItem.required);
      return;
    }
    if (!trackingNumber.trim()) {
      setRequestError('\u26A0\uFE0F ' + t.requestPackage.fields.trackingNumber.required);
      return;
    }
    if (trackingNumber.trim().length < 5) {
      setRequestError('\u26A0\uFE0F ' + t.requestPackage.fields.trackingNumber.minLength);
      return;
    }
    // ✅ REMOVED: City validation - now uses user's profile city
    if (!description.trim()) {
      setRequestError('\u270D\uFE0F ' + t.requestPackage.fields.description.required);
      return;
    }
    if (description.trim().length < 10) {
      setRequestError('\u270D\uFE0F ' + t.requestPackage.fields.description.minLength);
      return;
    }
    if (!category) {
      setRequestError('\uD83C\uDFF7\uFE0F ' + t.requestPackage.fields.category.required);
      return;
    }

    setRequestLoading(true);
    try {
      console.log('[PACKAGE-REQUEST] Submitting with locale:', locale);
      await api.post('/api/package-requests', {
        externalTrackingNumber: trackingNumber.trim(),
        description: description.trim(),
        category,
        customerNotes: customerNotes.trim() || undefined,
        specialItemId: packageType === 'special' ? selectedSpecialItem : null,
        locale: locale,
      });
      console.log('[PACKAGE-REQUEST] Success!');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setRequestSuccess(true);
    } catch (err: any) {
      console.error('[PACKAGE-REQUEST] Error:', err);
      const raw = err?.message || t.common.error;
      if (raw.includes('Network') || raw.includes('fetch')) {
        setRequestError('\uD83D\uDCE1 ' + t.packages.networkError);
      } else {
        setRequestError('\u274C ' + raw);
      }
    } finally {
      setRequestLoading(false);
    }
  }, [trackingNumber, description, category, customerNotes, packageType, selectedSpecialItem, locale, t]);

  const categoryLabel = useCallback(
    (cat: string): string => {
      const map: Record<string, string> = {
        general: t.requestPackage.fields.category.general,
        clothing: t.requestPackage.fields.category.clothing,
        electronics: t.requestPackage.fields.category.electronics,
        food: t.requestPackage.fields.category.food,
        documents: t.requestPackage.fields.category.documents,
        other: t.requestPackage.fields.category.other,
      };
      return map[cat] || cat;
    },
    [t],
  );

  // -------------------------------------------------------------------------
  // Not signed in
  // -------------------------------------------------------------------------

  if (!isSignedIn) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <View style={styles.signInPrompt}>
          <Animated.View entering={FadeInDown.duration(500)} style={[styles.signInCard, { backgroundColor: card.backgroundColor, borderRadius: borderRadius.xl, padding: spacing['3xl'], ...shadows.lg }]}>
            <View style={[styles.signInIconCircle, { backgroundColor: isDark ? colors.primary[900] : colors.primary[50] }]}>
              <Package size={36} color={colors.primary[500]} />
            </View>
            <Text style={[styles.signInTitle, { fontFamily: fonts.headingSemiBold, color: colors.gray[900] }]}>{t.packages.noPackages}</Text>
            <Text style={[styles.signInDescription, { fontFamily: fonts.regular, color: colors.gray[500] }]}>
              {t.packages.noPackagesDescription}
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(auth)/sign-in');
              }}
              style={[styles.signInBtnWrapper, { borderRadius: borderRadius.lg }]}
            >
              <LinearGradient
                colors={[colors.primary[500], colors.primary[700]]}
                style={[styles.signInBtn, { borderRadius: borderRadius.lg, gap: spacing.sm }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <LogIn size={18} color={colors.white} />
                <Text style={[styles.signInBtnText, { fontFamily: fonts.semiBold, color: colors.white }]}>{t.profile.signIn}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    );
  }

  // -------------------------------------------------------------------------
  // Render helpers
  // -------------------------------------------------------------------------

  const renderItem = ({ item, index }: { item: PackageItem; index: number }) => (
    <PackageCard item={item} index={index} />
  );

  const keyExtractor = (item: PackageItem) => String(item.id);

  const ListEmptyComponent = () => (
    <View style={[styles.emptyContainer, { paddingTop: spacing['5xl'], paddingHorizontal: spacing['3xl'] }]}>
      <View style={[styles.emptyIconCircle, { backgroundColor: colors.gray[100] }]}>
        <Package size={32} color={colors.gray[400]} />
      </View>
      <Text style={[styles.emptyTitle, { fontFamily: fonts.headingSemiBold, color: colors.gray[700] }]}>
        {fetchError ? '\uD83D\uDCE1 ' + t.packages.networkError : t.packages.noResults}
      </Text>
      <Text style={[styles.emptyDescription, { fontFamily: fonts.regular, color: colors.gray[500] }]}>
        {fetchError
          ? t.packages.networkErrorDescription
          : t.packages.noResultsDescription}
      </Text>
      {fetchError && (
        <TouchableOpacity
          style={[styles.retryBtn, { borderRadius: borderRadius.lg, backgroundColor: colors.primary[500] }]}
          onPress={onRefresh}
          activeOpacity={0.7}
        >
          <Text style={[styles.retryBtnText, { fontFamily: fonts.semiBold, color: colors.white }]}>{t.common.retry}</Text>
        </TouchableOpacity>
      )}
      {!fetchError && (
        <TouchableOpacity
          onPress={() => import('react-native').then(({ Linking }) => Linking.openURL('https://wa.me/50948812652'))}
          style={{ marginTop: spacing.lg }}
        >
          <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: isDark ? '#c4b5fd' : '#7c3aed', textAlign: 'center' }}>
            🛒 {(t as any).purchaseAssistance?.subtitle || 'No US card? We buy for you!'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // -------------------------------------------------------------------------
  // Loading state
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={[styles.loadingText, { fontFamily: fonts.medium, color: colors.gray[500], marginTop: spacing.md }]}>{t.packages.loading}</Text>
      </View>
    );
  }

  // -------------------------------------------------------------------------
  // Main signed-in layout
  // -------------------------------------------------------------------------

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)} style={[styles.header, { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xs }]}>
        <Text style={[styles.headerTitle, { fontFamily: fonts.headingBold, color: colors.gray[900] }]}>{t.packages.title}</Text>
        <Text style={[styles.headerSubtitle, { fontFamily: fonts.regular, color: colors.gray[500] }]}>{t.packages.subtitle}</Text>
      </Animated.View>

      {/* Request Package Button */}
      <Animated.View entering={FadeInDown.delay(60).duration(400)} style={[styles.requestBtnContainer, { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xs }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={openRequestModal}
          style={[styles.requestBtnWrapper, { borderRadius: borderRadius.lg }]}
        >
          <LinearGradient
            colors={[colors.primary[500], colors.primary[700]]}
            style={[styles.requestBtn, { borderRadius: borderRadius.lg, gap: spacing.sm }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Send size={18} color={colors.white} />
            <Text style={[styles.requestBtnText, { fontFamily: fonts.semiBold, color: colors.white }]}>{t.packages.requestNew}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Search bar */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={[styles.searchContainer, { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.sm }]}>
        <View style={[styles.searchBar, { backgroundColor: card.backgroundColor, borderRadius: borderRadius.lg, borderColor: card.borderColor, paddingHorizontal: spacing.md, ...shadows.sm }]}>
          <Search size={18} color={colors.gray[400]} />
          <TextInput
            style={[styles.searchInput, { fontFamily: fonts.regular, color: colors.gray[900], marginLeft: spacing.sm, marginRight: spacing.sm }]}
            placeholder={t.packages.search}
            placeholderTextColor={colors.gray[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSearchQuery('');
              }}
              hitSlop={8}
            >
              <X size={18} color={colors.gray[400]} />
            </Pressable>
          )}
        </View>
      </Animated.View>

      {/* Filter chips */}
      <Animated.View entering={FadeInDown.delay(160).duration(400)}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.filtersContent, { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, gap: spacing.sm }]}
          style={styles.filtersScroll}
        >
          {FILTER_KEYS.map((key) => {
            const isActive = activeFilter === key;
            return (
              <TouchableOpacity
                key={key}
                activeOpacity={0.7}
                onPress={() => {
                  Haptics.selectionAsync();
                  setActiveFilter(key);
                }}
                style={[
                  styles.filterChip,
                  { borderRadius: borderRadius.full },
                  isActive
                    ? { backgroundColor: colors.primary[600] }
                    : { backgroundColor: colors.gray[100] },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { fontFamily: fonts.medium },
                    isActive
                      ? { color: colors.white }
                      : { color: colors.gray[600] },
                  ]}
                >
                  {filterLabel(key)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>

      {/* Package list */}
      <View style={styles.listContainer}>
        <FlatList
          data={displayPackages}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={[styles.listContent, { paddingHorizontal: spacing.xl, paddingTop: spacing.sm }]}
          ListEmptyComponent={!hasBundleOpportunity || (activeFilter !== 'all' && activeFilter !== 'available') ? ListEmptyComponent : null}
          ListHeaderComponent={
            hasBundleOpportunity && (activeFilter === 'all' || activeFilter === 'available') ? (
              <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    router.push('/bundle/available');
                  }}
                  style={{
                    backgroundColor: card.backgroundColor,
                    borderRadius: borderRadius.xl,
                    borderWidth: 1.5,
                    borderColor: '#7c3aed',
                    marginBottom: spacing.lg,
                    overflow: 'hidden',
                    ...shadows.sm,
                  }}
                >
                  {/* Purple header bar */}
                  <View style={{
                    backgroundColor: '#7c3aed',
                    paddingHorizontal: spacing.lg,
                    paddingVertical: spacing.md,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                      <Layers size={20} color="#fff" />
                      <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: '#fff' }}>
                        {availablePackages.length} {(t as any).bundle?.packagesAvailable || 'colis disponibles'}
                      </Text>
                    </View>
                    <ChevronRight size={20} color="#fff" />
                  </View>

                  {/* Savings badge */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: isDark ? '#064e3b' : '#dcfce7',
                    marginHorizontal: spacing.md,
                    marginTop: spacing.md,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    borderRadius: borderRadius.md,
                    borderWidth: 1,
                    borderColor: isDark ? '#059669' : '#86efac',
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Gift size={16} color={isDark ? '#6ee7b7' : '#15803d'} />
                      <Text style={{ fontFamily: fonts.semiBold, fontSize: 13, color: isDark ? '#6ee7b7' : '#15803d' }}>
                        {(t as any).bundle?.saveWith || 'Economisez avec Bundle !'}
                      </Text>
                    </View>
                    <Text style={{ fontFamily: fonts.bold, fontSize: 15, color: isDark ? '#6ee7b7' : '#15803d' }}>
                      -${bundleSavings.toFixed(2)}
                    </Text>
                  </View>

                  {/* Mini package list */}
                  <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.md }}>
                    {availablePackages.slice(0, 3).map((pkg, i) => (
                      <View key={String(pkg.id)} style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingVertical: 6,
                        borderBottomWidth: i < Math.min(availablePackages.length, 3) - 1 ? 1 : 0,
                        borderBottomColor: colors.gray[100],
                      }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontFamily: fonts.semiBold, fontSize: 13, color: colors.gray[900] }} numberOfLines={1}>
                            {pkg.trackingNumber}
                          </Text>
                          <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.gray[500] }} numberOfLines={1}>
                            {pkg.description}
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Scale size={12} color={colors.gray[400]} />
                          <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.gray[600] }}>
                            {parseFloat(String(pkg.weight)).toFixed(1)} lbs
                          </Text>
                        </View>
                      </View>
                    ))}
                    {availablePackages.length > 3 && (
                      <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: '#7c3aed', textAlign: 'center', marginTop: 6 }}>
                        +{availablePackages.length - 3} {(t as any).bundle?.packagesAvailable || 'colis'}...
                      </Text>
                    )}
                  </View>

                  {/* Footer: total weight + CTA */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    borderTopWidth: 1,
                    borderTopColor: colors.gray[100],
                    backgroundColor: isDark ? 'rgba(124, 58, 237, 0.08)' : 'rgba(124, 58, 237, 0.04)',
                  }}>
                    <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.gray[500] }}>
                      {(t as any).bundle?.totalWeight || 'Poids total'}: {bundleTotalWeight.toFixed(1)} lbs
                    </Text>
                    <Text style={{ fontFamily: fonts.semiBold, fontSize: 13, color: '#7c3aed' }}>
                      {(t as any).bundle?.viewBundleDetails || 'Voir les details'} →
                    </Text>
                  </View>
                </Pressable>
              </Animated.View>
            ) : null
          }
          ListFooterComponent={
            !loading ? (
              <Animated.View entering={FadeInDown.delay(300).duration(400)} style={{ marginTop: spacing.lg, marginBottom: spacing.xl }}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    import('react-native').then(({ Linking }) => {
                      Linking.openURL('https://wa.me/50948812652');
                    });
                  }}
                  style={{
                    backgroundColor: isDark ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.04)',
                    borderRadius: borderRadius.xl,
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(139,92,246,0.3)' : 'rgba(139,92,246,0.15)',
                    padding: spacing.lg,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                    <View style={{
                      width: 44,
                      height: 44,
                      borderRadius: borderRadius.lg,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#7c3aed',
                    }}>
                      <ShoppingCart size={22} color="#fff" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                          backgroundColor: isDark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.1)',
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: borderRadius.full,
                        }}>
                          <Sparkles size={10} color={isDark ? '#c4b5fd' : '#7c3aed'} />
                          <Text style={{ fontFamily: fonts.bold, fontSize: 9, color: isDark ? '#c4b5fd' : '#7c3aed' }}>
                            {(t as any).purchaseAssistance?.badge || 'New Service'}
                          </Text>
                        </View>
                      </View>
                      <Text style={{ fontFamily: fonts.bold, fontSize: 14, color: colors.gray[900] }}>
                        {(t as any).purchaseAssistance?.title || 'US Purchase Service'}
                      </Text>
                      <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.gray[500], marginTop: 1 }}>
                        {(t as any).purchaseAssistance?.subtitle || 'No US card? We buy for you!'}
                      </Text>
                    </View>
                    <ArrowRight size={18} color={isDark ? '#c4b5fd' : '#7c3aed'} />
                  </View>
                </Pressable>
              </Animated.View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary[500]}
              colors={[colors.primary[500]]}
            />
          }
        />
      </View>

      {/* Request Package Modal */}
      <Modal
        visible={showRequestModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeRequestModal}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top, backgroundColor: colors.background }]}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, borderBottomColor: colors.gray[200] }]}>
            <Text style={[styles.modalTitle, { fontFamily: fonts.headingBold, color: colors.gray[900] }]}>{'\uD83D\uDCE6'} {t.requestPackage.title}</Text>
            <TouchableOpacity
              onPress={closeRequestModal}
              hitSlop={12}
              style={[styles.modalCloseBtn, { backgroundColor: colors.gray[100] }]}
            >
              <X size={24} color={colors.gray[600]} />
            </TouchableOpacity>
          </View>

          {requestSuccess ? (
            /* Success view */
            <View style={[styles.successContainer, { paddingHorizontal: spacing['2xl'] }]}>
              <Animated.View entering={FadeInDown.duration(500)} style={styles.successContent}>
                <View style={[styles.successIconCircle, { backgroundColor: isDark ? colors.gray[200] : colors.green[50] }]}>
                  <Check size={40} color={colors.green[500]} strokeWidth={3} />
                </View>
                <Text style={[styles.successTitle, { fontFamily: fonts.headingBold, color: colors.gray[900] }]}>{'\u2705'} {t.requestPackage.success.title}</Text>
                <Text style={[styles.successMessage, { fontFamily: fonts.regular, color: colors.gray[500] }]}>{t.requestPackage.success.message}</Text>

                <View style={[styles.successSteps, { backgroundColor: card.backgroundColor, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.xl, ...shadows.sm }]}>
                  {(t.requestPackage.success.steps as string[]).map((step, i) => (
                    <View key={i} style={[styles.successStep, { gap: spacing.sm }]}>
                      <Text style={[styles.successStepNum, { backgroundColor: colors.primary[100], color: colors.primary[700], fontFamily: fonts.bold }]}>{i + 1}</Text>
                      <Text style={[styles.successStepText, { fontFamily: fonts.regular, color: colors.gray[700] }]}>{step}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.successBtn, { borderRadius: borderRadius.lg }]}
                  onPress={closeRequestModal}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[colors.primary[500], colors.primary[700]]}
                    style={[styles.successBtnGradient, { borderRadius: borderRadius.lg }]}
                  >
                    <Text style={[styles.successBtnText, { fontFamily: fonts.semiBold, color: colors.white }]}>OK</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>
          ) : (
            /* Form */
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}
            >
              <ScrollView
                contentContainerStyle={[styles.modalScroll, { padding: spacing.xl }]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={[styles.modalSubtitle, { fontFamily: fonts.regular, color: colors.gray[500], marginBottom: spacing.xl }]}>{t.requestPackage.subtitle}</Text>

                {requestError ? (
                  <View style={[styles.errorBox, { backgroundColor: isDark ? colors.gray[200] : colors.red[50], borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.lg, borderColor: isDark ? colors.red[500] : colors.red[100] }]}>
                    <Text style={[styles.errorText, { color: colors.red[500], fontFamily: fonts.medium }]}>{requestError}</Text>
                  </View>
                ) : null}

                {/* Package Type Selection */}
                <View style={[styles.fieldGroup, { marginBottom: spacing.xl }]}>
                  <Text style={[styles.fieldLabel, { fontFamily: fonts.semiBold, color: colors.gray[700], marginBottom: spacing.sm }]}>
                    {'\uD83D\uDCE6'} {t.requestPackage.fields.packageType.label} *
                  </Text>
                  <View style={{ flexDirection: 'row', gap: spacing.md }}>
                    <TouchableOpacity
                      onPress={() => {
                        setPackageType('normal');
                        setSelectedSpecialItem(null);
                        setCategory('');
                        setRequestError('');
                      }}
                      style={[
                        styles.typeButton,
                        {
                          flex: 1,
                          borderWidth: 2,
                          borderColor: packageType === 'normal' ? colors.primary[500] : card.borderColor,
                          backgroundColor: packageType === 'normal' ? (isDark ? colors.primary[900] : colors.primary[50]) : card.backgroundColor,
                          borderRadius: borderRadius.lg,
                          padding: spacing.lg,
                          alignItems: 'center',
                        },
                      ]}
                      activeOpacity={0.7}
                    >
                      <Package size={32} color={packageType === 'normal' ? colors.primary[600] : colors.gray[400]} />
                      <Text style={[{ fontFamily: fonts.semiBold, color: packageType === 'normal' ? colors.primary[600] : colors.gray[600], marginTop: spacing.sm }]}>
                        {t.requestPackage.types.normal}
                      </Text>
                      <Text style={[{ fontSize: 11, color: colors.gray[500] }]}>
                        {t.requestPackage.types.normalDesc}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setPackageType('special');
                        setRequestError('');
                      }}
                      style={[
                        styles.typeButton,
                        {
                          flex: 1,
                          borderWidth: 2,
                          borderColor: packageType === 'special' ? colors.primary[500] : card.borderColor,
                          backgroundColor: packageType === 'special' ? (isDark ? colors.primary[900] : colors.primary[50]) : card.backgroundColor,
                          borderRadius: borderRadius.lg,
                          padding: spacing.lg,
                          alignItems: 'center',
                        },
                      ]}
                      activeOpacity={0.7}
                    >
                      {/* Smartphone icon - using Package as substitute */}
                      <Package size={32} color={packageType === 'special' ? colors.primary[600] : colors.gray[400]} />
                      <Text style={[{ fontFamily: fonts.semiBold, color: packageType === 'special' ? colors.primary[600] : colors.gray[600], marginTop: spacing.sm }]}>
                        {t.requestPackage.types.special}
                      </Text>
                      <Text style={[{ fontSize: 11, color: colors.gray[500] }]}>
                        {t.requestPackage.types.specialDesc}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Special Items Grid */}
                {packageType === 'special' && (
                  <View style={[styles.fieldGroup, { marginBottom: spacing.xl }]}>
                    <Text style={[styles.fieldLabel, { fontFamily: fonts.semiBold, color: colors.gray[700], marginBottom: spacing.sm }]}>
                      {'\uD83D\uDCF1'} {t.requestPackage.fields.specialItem.label} *
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
                      {specialItems.filter((item: any) => item.isActive).map((item: any) => {
                        // Format display name with model range
                        const getLocalizedName = (item: any) => {
                          const localizedName = item[`itemName_${locale}`] || item.itemName;
                          if (item.minModel && item.maxModel) {
                            return `${localizedName} ${item.minModel}-${item.maxModel}`;
                          } else if (item.minModel) {
                            return `${localizedName} ${item.minModel}+`;
                          }
                          return localizedName;
                        };

                        return (
                          <TouchableOpacity
                            key={item.id}
                            onPress={() => {
                              setSelectedSpecialItem(item.id);
                              setCategory('electronics');
                              setRequestError('');
                            }}
                            style={[
                              {
                                width: '48%',
                                borderWidth: 2,
                                borderColor: selectedSpecialItem === item.id ? colors.primary[500] : card.borderColor,
                                backgroundColor: selectedSpecialItem === item.id ? (isDark ? colors.primary[900] : colors.primary[50]) : card.backgroundColor,
                                borderRadius: borderRadius.md,
                                padding: spacing.md,
                                alignItems: 'center',
                              },
                            ]}
                            activeOpacity={0.7}
                          >
                            <Text style={[{ fontFamily: fonts.semiBold, fontSize: 14, textAlign: 'center', color: colors.gray[900] }]}>
                              {getLocalizedName(item)}
                            </Text>
                            <Text style={[{ fontSize: 12, color: colors.gray[500], marginTop: spacing.xs }]}>
                              {item.brand}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Tracking Number */}
                <View style={[styles.fieldGroup, { marginBottom: spacing.xl }]}>
                  <Text style={[styles.fieldLabel, { fontFamily: fonts.semiBold, color: colors.gray[700], marginBottom: spacing.sm }]}>
                    {'\uD83D\uDD22'} {t.requestPackage.fields.trackingNumber.label} *
                  </Text>
                  <TextInput
                    style={[styles.fieldInput, { backgroundColor: card.backgroundColor, borderRadius: borderRadius.lg, borderColor: card.borderColor, paddingHorizontal: spacing.lg, paddingVertical: spacing.md + 2, fontFamily: fonts.regular, color: colors.gray[900] }]}
                    value={trackingNumber}
                    onChangeText={(v) => { setTrackingNumber(v); setRequestError(''); }}
                    placeholder={t.requestPackage.fields.trackingNumber.placeholder}
                    placeholderTextColor={colors.gray[400]}
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                  <Text style={[styles.fieldHelper, { fontFamily: fonts.regular, color: colors.gray[400], marginTop: spacing.xs }]}>
                    {'\uD83D\uDCA1'} {t.requestPackage.fields.trackingNumber.helper}
                  </Text>
                </View>

                {/* ✅ REMOVED: Destination City - now uses user's profile city */}

                {/* Description */}
                <View style={[styles.fieldGroup, { marginBottom: spacing.xl }]}>
                  <Text style={[styles.fieldLabel, { fontFamily: fonts.semiBold, color: colors.gray[700], marginBottom: spacing.sm }]}>
                    {'\u270D\uFE0F'} {t.requestPackage.fields.description.label} *
                  </Text>
                  <TextInput
                    style={[styles.fieldInput, styles.fieldTextarea, { backgroundColor: card.backgroundColor, borderRadius: borderRadius.lg, borderColor: card.borderColor, paddingHorizontal: spacing.lg, paddingVertical: spacing.md + 2, paddingTop: spacing.md, fontFamily: fonts.regular, color: colors.gray[900] }]}
                    value={description}
                    onChangeText={(v) => { setDescription(v); setRequestError(''); }}
                    placeholder={t.requestPackage.fields.description.placeholder}
                    placeholderTextColor={colors.gray[400]}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>

                {/* Category */}
                <View style={[styles.fieldGroup, { marginBottom: spacing.xl }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm }}>
                    <Text style={[styles.fieldLabel, { fontFamily: fonts.semiBold, color: colors.gray[700], marginBottom: 0 }]}>
                      {'\uD83C\uDFF7\uFE0F'} {t.requestPackage.fields.category.label} *
                    </Text>
                    {packageType === 'special' && selectedSpecialItem && (
                      <View style={{ backgroundColor: isDark ? colors.primary[900] : colors.primary[50], paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.full }}>
                        <Text style={{ fontSize: 10, fontFamily: fonts.medium, color: colors.primary[600] }}>
                          {t.requestPackage.fields.category.lockedBySpecialItem}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={[styles.categoryGrid, { gap: spacing.sm, opacity: (packageType === 'special' && selectedSpecialItem) ? 0.5 : 1 }]}>
                    {CATEGORY_CONFIG.map((cat) => {
                      const isSelected = category === cat.id;
                      const isLocked = packageType === 'special' && selectedSpecialItem !== null;
                      return (
                        <TouchableOpacity
                          key={cat.id}
                          style={[
                            styles.categoryChip,
                            {
                              paddingHorizontal: spacing.md,
                              paddingVertical: spacing.sm + 2,
                              borderRadius: borderRadius.full,
                              borderColor: isSelected ? colors.primary[500] : card.borderColor,
                              backgroundColor: isSelected ? colors.primary[500] : card.backgroundColor,
                            },
                          ]}
                          onPress={() => { if (!isLocked) { setCategory(cat.id); setRequestError(''); } }}
                          activeOpacity={isLocked ? 1 : 0.7}
                          disabled={isLocked}
                        >
                          <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                          <Text
                            style={[
                              styles.categoryChipText,
                              {
                                fontFamily: fonts.medium,
                                color: isSelected ? colors.white : colors.gray[600],
                              },
                            ]}
                          >
                            {categoryLabel(cat.id)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Notes */}
                <View style={[styles.fieldGroup, { marginBottom: spacing.xl }]}>
                  <Text style={[styles.fieldLabel, { fontFamily: fonts.semiBold, color: colors.gray[700], marginBottom: spacing.sm }]}>{'\uD83D\uDCDD'} Notes</Text>
                  <TextInput
                    style={[styles.fieldInput, styles.fieldTextarea, { backgroundColor: card.backgroundColor, borderRadius: borderRadius.lg, borderColor: card.borderColor, paddingHorizontal: spacing.lg, paddingVertical: spacing.md + 2, paddingTop: spacing.md, fontFamily: fonts.regular, color: colors.gray[900] }]}
                    value={customerNotes}
                    onChangeText={setCustomerNotes}
                    placeholder="..."
                    placeholderTextColor={colors.gray[400]}
                    multiline
                    numberOfLines={2}
                    textAlignVertical="top"
                  />
                </View>

                {/* Buttons */}
                <View style={[styles.modalBtnRow, { gap: spacing.md, marginTop: spacing.lg }]}>
                  <TouchableOpacity
                    style={[styles.cancelBtn, { borderRadius: borderRadius.lg, borderColor: card.borderColor, backgroundColor: card.backgroundColor }]}
                    onPress={closeRequestModal}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.cancelBtnText, { fontFamily: fonts.semiBold, color: colors.gray[600] }]}>{t.requestPackage.buttons.cancel}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.submitBtn, { borderRadius: borderRadius.lg }, requestLoading && styles.disabled]}
                    onPress={handleSubmitRequest}
                    disabled={requestLoading}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[colors.primary[500], colors.primary[700]]}
                      style={[styles.submitBtnGradient, { borderRadius: borderRadius.lg, gap: spacing.sm }]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      {requestLoading ? (
                        <ActivityIndicator size="small" color={colors.white} />
                      ) : (
                        <>
                          <Send size={16} color={colors.white} />
                          <Text style={[styles.submitBtnText, { fontFamily: fonts.semiBold, color: colors.white }]}>
                            {t.requestPackage.buttons.submit}
                          </Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          )}
        </View>
      </Modal>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles (layout-only; color-dependent styles are inline)
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 15 },

  typeButton: {},
  header: {},
  headerTitle: { fontSize: 26, letterSpacing: 0.2 },
  headerSubtitle: { fontSize: 14, marginTop: 2 },

  // Request button
  requestBtnContainer: {},
  requestBtnWrapper: { overflow: 'hidden' },
  requestBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12,
  },
  requestBtnText: { fontSize: 15 },

  searchContainer: {},
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, height: 46,
  },
  searchInput: {
    flex: 1, fontSize: 15, paddingVertical: 0,
  },

  filtersScroll: { maxHeight: 48 },
  filtersContent: {},
  filterChip: { paddingHorizontal: 14, paddingVertical: 7 },
  filterChipText: { fontSize: 13 },

  listContainer: { flex: 1 },
  listContent: { paddingBottom: 100 },

  emptyContainer: { alignItems: 'center', justifyContent: 'center' },
  emptyIconCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 17, textAlign: 'center', marginBottom: 4 },
  emptyDescription: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 10 },
  retryBtnText: { fontSize: 14 },

  // Sign in prompt
  signInPrompt: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  signInCard: { alignItems: 'center', width: '100%', maxWidth: 340 },
  signInIconCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  signInTitle: { fontSize: 20, textAlign: 'center', marginBottom: 8 },
  signInDescription: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  signInBtnWrapper: { overflow: 'hidden', width: '100%' },
  signInBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  signInBtnText: { fontSize: 16 },

  // Modal
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, flex: 1 },
  modalCloseBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  modalSubtitle: { fontSize: 14, lineHeight: 20 },
  modalScroll: { paddingBottom: 120 },
  errorBox: { borderWidth: 1 },
  errorText: { fontSize: 13, lineHeight: 20 },

  fieldGroup: {},
  fieldLabel: { fontSize: 14 },
  fieldInput: {
    borderWidth: 1, fontSize: 15,
  },
  fieldTextarea: { minHeight: 80 },
  fieldHelper: { fontSize: 12 },

  cityGrid: { flexDirection: 'row' },
  cityChip: {
    flex: 1, alignItems: 'center', borderWidth: 1.5, gap: 4,
  },
  cityEmoji: { fontSize: 20 },
  cityChipText: { fontSize: 11, textAlign: 'center' },
  cityChipSub: { fontSize: 10 },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, gap: 6,
  },
  categoryEmoji: { fontSize: 16 },
  categoryChipText: { fontSize: 13 },

  modalBtnRow: { flexDirection: 'row' },
  cancelBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 14,
    borderWidth: 1.5,
  },
  cancelBtnText: { fontSize: 15 },
  submitBtn: { flex: 2, overflow: 'hidden' },
  submitBtnGradient: {
    flexDirection: 'row', paddingVertical: 14, alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: { fontSize: 15 },
  disabled: { opacity: 0.7 },

  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  successContent: { alignItems: 'center', width: '100%' },
  successIconCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  successTitle: { fontSize: 20, textAlign: 'center', marginBottom: 12 },
  successMessage: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  successSteps: { width: '100%' },
  successStep: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  successStepNum: {
    width: 24, height: 24, borderRadius: 12,
    fontSize: 12, textAlign: 'center', lineHeight: 24, overflow: 'hidden',
  },
  successStepText: { fontSize: 13, flex: 1 },
  successBtn: { overflow: 'hidden', width: 200 },
  successBtnGradient: { paddingVertical: 14, alignItems: 'center' },
  successBtnText: { fontSize: 16 },
});
