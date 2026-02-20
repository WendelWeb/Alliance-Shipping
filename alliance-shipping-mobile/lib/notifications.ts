import { Platform } from 'react-native';
import { api } from './api';

let Notifications: typeof import('expo-notifications') | null = null;
let Device: typeof import('expo-device') | null = null;
let Constants: typeof import('expo-constants').default | null = null;

try {
  Notifications = require('expo-notifications');
  Device = require('expo-device');
  Constants = require('expo-constants').default;
} catch {
  console.warn('expo-notifications not available (Expo Go SDK 53+). Push notifications disabled.');
}

// Configure notification handler
if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

/**
 * Register for push notifications and return the Expo push token.
 * Also sends the token to the backend for storage.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Notifications || !Device || !Constants) {
    console.log('Push notifications not available in this environment');
    return null;
  }

  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permissions if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission not granted');
    return null;
  }

  // Android-specific notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1e40af',
    });
  }

  // Get push token
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  console.log('Push: projectId =', projectId);

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  const token = tokenData.data;
  console.log('Push: token =', token);

  // Send token to backend
  try {
    const result = await api.post('/api/user/push-token', { token });
    console.log('Push: token saved to backend:', result);
  } catch (error) {
    console.error('Push: failed to save token to backend:', error);
  }

  return token;
}
