import React, { useEffect, useState, useRef } from 'react';
import { AppState } from 'react-native';
import { Tabs } from 'expo-router';
import { CustomTabBar } from '@/components/CustomTabBar';
import { OfflineBanner } from '@/components/OfflineBanner';
import { isOnline, getLastSyncTime } from '@/lib/offline/sync';
import { Newspaper, MapPin, Package, Calculator, User } from 'lucide-react-native';

function NewsIcon({ color, size }: { color: string; size: number }) {
  return <Newspaper color={color} size={size} />;
}
function LocationsIcon({ color, size }: { color: string; size: number }) {
  return <MapPin color={color} size={size} />;
}
function PackagesIcon({ color, size }: { color: string; size: number }) {
  return <Package color={color} size={size} />;
}
function CalculatorIcon({ color, size }: { color: string; size: number }) {
  return <Calculator color={color} size={size} />;
}
function ProfileIcon({ color, size }: { color: string; size: number }) {
  return <User color={color} size={size} />;
}

export default function TabLayout() {
  const [offline, setOffline] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const appState = useRef(AppState.currentState);

  const checkConnection = async () => {
    const online = await isOnline();
    setOffline(!online);
    const sync = await getLastSyncTime();
    setLastSync(sync);
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 15000);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkConnection();
      appState.current = state;
    });
    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, []);

  return (
    <>
      <OfflineBanner visible={offline} lastSync={lastSync} />
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ tabBarIcon: NewsIcon }}
        />
        <Tabs.Screen
          name="locations"
          options={{ tabBarIcon: LocationsIcon }}
        />
        <Tabs.Screen
          name="packages"
          options={{ tabBarIcon: PackagesIcon }}
        />
        <Tabs.Screen
          name="calculator"
          options={{ tabBarIcon: CalculatorIcon }}
        />
        <Tabs.Screen
          name="profile"
          options={{ tabBarIcon: ProfileIcon }}
        />
      </Tabs>
    </>
  );
}
