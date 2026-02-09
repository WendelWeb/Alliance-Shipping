import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  FlatList,
  Linking,
  Platform,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Callout } from 'react-native-maps';
// TEMPORARY: Disabled expo-location to test app startup
// import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { Search, Map, List, MapPin, Navigation, Filter } from 'lucide-react-native';
import { useTheme } from '@/lib/themes/ThemeProvider';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { api } from '@/lib/api';
import { LocationCard } from '@/components/LocationCard';

interface LocationItem {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  lat: number;
  lng: number;
  hours: string;
  isOpen: boolean;
  distance?: number; // Distance in km from user
}

const DEMO_LOCATIONS: LocationItem[] = [
  {
    id: '1',
    name: 'Alliance Shipping Miami',
    address: '123 NW 36th St',
    city: 'Miami, FL',
    phone: '+1 (305) 555-0123',
    lat: 25.8,
    lng: -80.2,
    hours: 'Mon-Sat: 8AM-6PM',
    isOpen: true,
  },
  {
    id: '2',
    name: 'Alliance Shipping Cap-Ha\u00EFtien',
    address: 'Rue 15 A',
    city: 'Cap-Ha\u00EFtien, Haiti',
    phone: '+509 2222-3333',
    lat: 19.76,
    lng: -72.2,
    hours: 'Mon-Sat: 8AM-5PM',
    isOpen: true,
  },
  {
    id: '3',
    name: 'Alliance Shipping Port-au-Prince',
    address: 'Av. Jean-Jacques Dessalines',
    city: 'Port-au-Prince, Haiti',
    phone: '+509 3333-4444',
    lat: 18.54,
    lng: -72.34,
    hours: 'Mon-Fri: 9AM-5PM',
    isOpen: false,
  },
];

const HAITI_REGION = {
  latitude: 19.0,
  longitude: -72.3,
  latitudeDelta: 2,
  longitudeDelta: 2,
};

type ViewMode = 'map' | 'list';

export default function LocationsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { colors, fonts, spacing, borderRadius, shadows, card } = useTheme();

  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(
    null
  );
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [filterCity, setFilterCity] = useState<string>('all');
  const [filterOpenOnly, setFilterOpenOnly] = useState(false);

  const fetchLocations = useCallback(async () => {
    try {
      // Fetch from server API
      const data = await api.get<LocationItem[]>('/api/locations');
      if (Array.isArray(data) && data.length > 0) {
        setLocations(data);
      } else {
        // Fallback to demo locations if API returns empty
        setLocations(DEMO_LOCATIONS);
      }
    } catch (error) {
      console.error('Failed to fetch locations:', error);
      // Fallback to demo locations on error
      setLocations(DEMO_LOCATIONS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchLocations();
  }, [fetchLocations]);

  // Get user location
  // TEMPORARY: Disabled to test app startup
  /*
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      } catch (error) {
        console.log('Error getting location:', error);
      }
    })();
  }, []);
  */

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = useCallback((
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }, []);

  // Open directions in Google Maps or Waze
  const openDirections = useCallback((location: LocationItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const address = encodeURIComponent(`${location.address}, ${location.city}`);
    const coords = `${location.lat},${location.lng}`;

    // Try Google Maps first, fallback to Apple Maps on iOS
    const url = Platform.select({
      ios: `maps://app?daddr=${coords}`,
      android: `google.navigation:q=${coords}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${coords}`,
    });

    Linking.canOpenURL(url!).then((supported) => {
      if (supported) {
        Linking.openURL(url!);
      } else {
        // Fallback to web Google Maps
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${coords}`);
      }
    });
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLocations();
  }, [fetchLocations]);

  const filteredLocations = useMemo(() => {
    let filtered = [...locations];

    // Calculate distance for each location if user location is available
    if (userLocation) {
      filtered = filtered.map((loc) => ({
        ...loc,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          loc.lat,
          loc.lng
        ),
      }));

      // Sort by distance (closest first)
      filtered.sort((a, b) => (a.distance || 999) - (b.distance || 999));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (loc) =>
          loc.name.toLowerCase().includes(query) ||
          loc.city.toLowerCase().includes(query) ||
          loc.address.toLowerCase().includes(query)
      );
    }

    // Filter by city
    if (filterCity !== 'all') {
      filtered = filtered.filter((loc) => loc.city === filterCity);
    }

    // Filter by open status
    if (filterOpenOnly) {
      filtered = filtered.filter((loc) => loc.isOpen);
    }

    return filtered;
  }, [locations, searchQuery, filterCity, filterOpenOnly, userLocation, calculateDistance]);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setViewMode(mode);
    setSelectedLocation(null);
  }, []);

  const handleMarkerPress = useCallback((location: LocationItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedLocation(location);
  }, []);

  const renderListItem = useCallback(
    ({ item, index }: { item: LocationItem; index: number }) => (
      <LocationCard
        item={item}
        index={index}
        callLabel={t.locations.call}
        directionsLabel={t.locations.directions}
        hoursLabel={t.locations.hours}
        openLabel={t.locations.open}
        closedLabel={t.locations.closed}
        onDirections={openDirections}
      />
    ),
    [t.locations.call, t.locations.directions, t.locations.hours, t.locations.open, t.locations.closed, openDirections]
  );

  const keyExtractor = useCallback(
    (item: LocationItem) => item.id,
    []
  );

  const renderListHeader = useCallback(
    () => <View style={[styles.listHeaderSpacer, { height: spacing.sm }]} />,
    [spacing]
  );

  const renderListEmpty = useCallback(() => {
    if (loading) {
      return (
        <View style={[styles.loadingContainer, { paddingVertical: spacing['5xl'] }]}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={[styles.loadingText, { fontFamily: fonts.medium, color: colors.gray[500], marginTop: spacing.md }]}>{t.common.loading}</Text>
        </View>
      );
    }

    return (
      <Animated.View
        entering={FadeInDown.duration(400).springify().damping(18)}
        style={[styles.emptyContainer, { paddingVertical: spacing['5xl'], paddingHorizontal: spacing['3xl'] }]}
      >
        <View style={[styles.emptyIconCircle, { backgroundColor: colors.primary[50], marginBottom: spacing.xl }]}>
          <MapPin size={32} color={colors.primary[400]} />
        </View>
        <Text style={[styles.emptyTitle, { fontFamily: fonts.headingSemiBold, color: colors.gray[900], marginBottom: spacing.sm }]}>{t.locations.noLocations}</Text>
        <Text style={[styles.emptySubtitle, { fontFamily: fonts.regular, color: colors.gray[400] }]}>{t.common.pullToRefresh}</Text>
      </Animated.View>
    );
  }, [loading, t.common.loading, t.common.pullToRefresh, t.locations.noLocations, colors, fonts, spacing]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <Animated.View
        entering={FadeInDown.duration(400).springify().damping(18)}
        style={[styles.header, { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm }]}
      >
        <Text style={[styles.title, { fontFamily: fonts.headingBold, color: colors.gray[900], marginBottom: spacing.xs }]}>{t.locations.title}</Text>
        <Text style={[styles.subtitle, { fontFamily: fonts.regular, color: colors.gray[500] }]}>{t.locations.subtitle}</Text>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(80).duration(400).springify().damping(18)}
        style={[styles.controlsContainer, { paddingHorizontal: spacing.lg, paddingBottom: spacing.md }]}
      >
        <View style={[styles.segmentedControl, { backgroundColor: card.backgroundColor, borderRadius: borderRadius.md, borderColor: card.borderColor, marginBottom: spacing.md, ...shadows.sm }]}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              { borderRadius: borderRadius.sm, gap: spacing.xs + 2, paddingVertical: spacing.sm + 2 },
              viewMode === 'map' && { backgroundColor: colors.primary[600] },
            ]}
            onPress={() => handleViewModeChange('map')}
            activeOpacity={0.7}
          >
            <Map
              size={16}
              color={
                viewMode === 'map' ? colors.white : colors.gray[500]
              }
            />
            <Text
              style={[
                styles.segmentText,
                { fontFamily: fonts.semiBold, color: colors.gray[500] },
                viewMode === 'map' && { color: colors.white },
              ]}
            >
              {t.locations.mapView}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentButton,
              { borderRadius: borderRadius.sm, gap: spacing.xs + 2, paddingVertical: spacing.sm + 2 },
              viewMode === 'list' && { backgroundColor: colors.primary[600] },
            ]}
            onPress={() => handleViewModeChange('list')}
            activeOpacity={0.7}
          >
            <List
              size={16}
              color={
                viewMode === 'list' ? colors.white : colors.gray[500]
              }
            />
            <Text
              style={[
                styles.segmentText,
                { fontFamily: fonts.semiBold, color: colors.gray[500] },
                viewMode === 'list' && { color: colors.white },
              ]}
            >
              {t.locations.listView}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.searchBar, { backgroundColor: card.backgroundColor, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, borderColor: card.borderColor, ...shadows.sm }]}>
          <Search size={18} color={colors.gray[400]} />
          <TextInput
            style={[styles.searchInput, { fontFamily: fonts.regular, color: colors.gray[900], marginLeft: spacing.sm }]}
            placeholder={t.locations.search}
            placeholderTextColor={colors.gray[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Filters */}
        {locations.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(160).duration(400).springify().damping(18)}
            style={[styles.filtersContainer, { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm }]}
          >
            <View style={[styles.filterRow, { gap: spacing.sm }]}>
              {/* Open Only Toggle */}
              <TouchableOpacity
                style={[
                  styles.filterToggle,
                  {
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm + 1,
                    borderRadius: borderRadius.md,
                    borderWidth: 1,
                    gap: spacing.xs + 2,
                    ...shadows.sm,
                  },
                  filterOpenOnly
                    ? { backgroundColor: colors.green[50], borderColor: colors.green[300] }
                    : { backgroundColor: card.backgroundColor, borderColor: card.borderColor },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setFilterOpenOnly(!filterOpenOnly);
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.toggleDot,
                    {
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: filterOpenOnly ? colors.green[500] : colors.gray[300],
                    },
                  ]}
                />
                <Text
                  style={{
                    fontFamily: fonts.semiBold,
                    fontSize: 13,
                    color: filterOpenOnly ? colors.green[700] : colors.gray[600],
                  }}
                >
                  {filterOpenOnly ? '✓ Open Only' : 'All Status'}
                </Text>
              </TouchableOpacity>

              {/* Results Count */}
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text
                  style={{
                    fontFamily: fonts.medium,
                    fontSize: 13,
                    color: colors.gray[500],
                  }}
                >
                  {filteredLocations.length} location{filteredLocations.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
          </Animated.View>
        )}
      </Animated.View>

      {viewMode === 'map' ? (
        <View style={styles.mapContainer}>
          {loading ? (
            <View style={[styles.mapLoadingOverlay, { backgroundColor: colors.background }]}>
              <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
          ) : (
            <MapView
              style={styles.map}
              initialRegion={HAITI_REGION}
              showsUserLocation
              showsMyLocationButton
            >
              {filteredLocations.map((location) => (
                <Marker
                  key={location.id}
                  coordinate={{
                    latitude: location.lat,
                    longitude: location.lng,
                  }}
                  title={location.name}
                  description={`${location.address}, ${location.city}`}
                  onPress={() => handleMarkerPress(location)}
                  pinColor={
                    location.isOpen
                      ? colors.primary[600]
                      : colors.red[500]
                  }
                >
                  <Callout tooltip={false}>
                    <View style={[styles.calloutContainer, { padding: spacing.sm }]}>
                      <Text style={[styles.calloutTitle, { fontFamily: fonts.headingSemiBold, color: colors.gray[900] }]}>
                        {location.name}
                      </Text>
                      <Text style={[styles.calloutAddress, { fontFamily: fonts.regular, color: colors.gray[600] }]}>
                        {location.address}
                      </Text>
                      <Text style={[styles.calloutCity, { fontFamily: fonts.regular, color: colors.gray[500], marginBottom: spacing.xs }]}>
                        {location.city}
                      </Text>
                      <View style={styles.calloutStatusRow}>
                        <View
                          style={[
                            styles.calloutDot,
                            {
                              marginRight: spacing.xs,
                              backgroundColor: location.isOpen
                                ? colors.green[500]
                                : colors.red[500],
                            },
                          ]}
                        />
                        <Text
                          style={[
                            styles.calloutStatus,
                            {
                              fontFamily: fonts.semiBold,
                              color: location.isOpen
                                ? colors.green[600]
                                : colors.red[600],
                            },
                          ]}
                        >
                          {location.isOpen
                            ? t.locations.open
                            : t.locations.closed}
                        </Text>
                      </View>
                      <Text style={[styles.calloutHours, { fontFamily: fonts.regular, color: colors.gray[500] }]}>
                        {location.hours}
                      </Text>
                    </View>
                  </Callout>
                </Marker>
              ))}
            </MapView>
          )}

          {selectedLocation && (
            <Animated.View
              entering={FadeInDown.duration(300).springify().damping(20)}
              style={styles.bottomCardWrapper}
            >
              <LocationCard
                item={selectedLocation}
                index={0}
                callLabel={t.locations.call}
                directionsLabel={t.locations.directions}
                hoursLabel={t.locations.hours}
                openLabel={t.locations.open}
                closedLabel={t.locations.closed}
                onDirections={openDirections}
              />
            </Animated.View>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredLocations}
          renderItem={renderListItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={renderListEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary[500]]}
              tintColor={colors.primary[500]}
            />
          }
        />
      )}
    </View>
  );
}

const { width: screenWidth } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// Styles (layout-only; color-dependent styles are inline)
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {},
  title: {
    fontSize: 24,
    letterSpacing: 0.15,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  controlsContainer: {},
  segmentedControl: {
    flexDirection: 'row',
    padding: 3,
    borderWidth: 1,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: {
    fontSize: 14,
    letterSpacing: 0.1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapLoadingOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calloutContainer: {
    minWidth: 180,
    maxWidth: 240,
  },
  calloutTitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  calloutAddress: {
    fontSize: 12,
    lineHeight: 16,
  },
  calloutCity: {
    fontSize: 12,
  },
  calloutStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  calloutDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  calloutStatus: {
    fontSize: 11,
  },
  calloutHours: {
    fontSize: 11,
  },
  bottomCardWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 100,
  },
  listContent: {
    paddingBottom: 100,
  },
  listHeaderSpacer: {},
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 0.15,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  filtersContainer: {},
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterItem: {},
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleDot: {},
});
