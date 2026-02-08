import AsyncStorage from '@react-native-async-storage/async-storage';

let LocalAuthentication: typeof import('expo-local-authentication') | null = null;
try {
  LocalAuthentication = require('expo-local-authentication');
} catch {
  console.warn('expo-local-authentication not available (Expo Go?). Biometrics disabled.');
}

const BIOMETRIC_ENABLED_KEY = 'alliance-biometric-enabled';

export type BiometricType = 'fingerprint' | 'facial' | 'iris' | 'none';

/** Check if the device supports any biometric authentication */
export async function isBiometricAvailable(): Promise<boolean> {
  if (!LocalAuthentication) return false;
  const compatible = await LocalAuthentication.hasHardwareAsync();
  if (!compatible) return false;
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return enrolled;
}

/** Get the type of biometric available on the device */
export async function getBiometricType(): Promise<BiometricType> {
  if (!LocalAuthentication) return 'none';
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) return 'facial';
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) return 'fingerprint';
  if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) return 'iris';
  return 'none';
}

/** Get a user-friendly label for the biometric type */
export function getBiometricLabel(type: BiometricType): string {
  switch (type) {
    case 'facial': return 'Face ID';
    case 'fingerprint': return 'Touch ID';
    case 'iris': return 'Iris Scan';
    default: return 'Biometrics';
  }
}

/** Attempt biometric authentication (with system fallback to passcode) */
export async function authenticate(promptMessage?: string): Promise<boolean> {
  if (!LocalAuthentication) return true; // Skip auth if not available
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: promptMessage || 'Authenticate to continue',
    fallbackLabel: 'Use passcode',
    disableDeviceFallback: false,
  });
  return result.success;
}

/** Check if user has enabled biometric lock */
export async function isBiometricEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
  return value === 'true';
}

/** Enable or disable biometric lock */
export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  if (enabled) {
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
  } else {
    await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);
  }
}
