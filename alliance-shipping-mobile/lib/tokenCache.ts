import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { TokenCache } from '@clerk/clerk-expo';

const createTokenCache = (): TokenCache => {
  return {
    getToken: async (key: string) => {
      try {
        if (Platform.OS === 'web') return null;
        return await SecureStore.getItemAsync(key);
      } catch {
        return null;
      }
    },
    saveToken: async (key: string, token: string) => {
      try {
        if (Platform.OS === 'web') return;
        await SecureStore.setItemAsync(key, token);
      } catch {
        // silently fail
      }
    },
    clearToken: async (key: string) => {
      try {
        if (Platform.OS === 'web') return;
        await SecureStore.deleteItemAsync(key);
      } catch {
        // silently fail
      }
    },
  };
};

export const tokenCache = createTokenCache();
