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
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Haptics from 'expo-haptics';
import { Search, Map, List, MapPin } from 'lucide-react-native';
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
  const { colors, fonts, spacing, borderRadius, shadows } = useTheme();

  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(
    null
  );

  const fetchLocations = useCallback(async () => {
    try {
      const data = await api.get<LocationItem[]>('/api/locations');
      if (Array.isArray(data) && data.length > 0) {
        setLocations(data);
      } else {
        setLocations(DEMO_LOCATIONS);
      }
    } catch {
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

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLocations();
  }, [fetchLocations]);

  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) {
      return locations;
    }
    const query = searchQuery.toLowerCase().trim();
    return locations.filter(
      (loc) =>
        loc.name.toLowerCase().includes(query) ||
        loc.city.toLowerCase().includes(query) ||
        loc.address.toLowerCase().includes(query)
    );
  }, [locations, searchQuery]);

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
      />
    ),
    [t.locations.call, t.locations.directions, t.locations.hours, t.locations.open, t.locations.closed]
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
        <View style={[styles.segmentedControl, { backgroundColor: colors.white, borderRadius: borderRadius.md, borderColor: colors.gray[200], marginBottom: spacing.md, ...shadows.sm }]}>
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

        <View style={[styles.searchBar, { backgroundColor: colors.white, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, borderColor: colors.gray[200], ...shadows.sm }]}>
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
});
