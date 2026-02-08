import React from 'react';
import { Tabs } from 'expo-router';
import { CustomTabBar } from '@/components/CustomTabBar';
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
  return (
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
  );
}
