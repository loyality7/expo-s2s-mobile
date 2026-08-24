import { PermissionsAndroid, PermissionStatus, Platform } from 'react-native';

export interface S2SPermissionStatus {
  microphone: boolean;
  notifications: boolean;
  /** True only after a request() call reports the user checked "don't ask again". */
  microphoneBlocked?: boolean;
}

/**
 * Checks if required permissions for on-device voice sessions are granted.
 */
export async function checkS2SPermissionsAsync(): Promise<S2SPermissionStatus> {
  if (Platform.OS !== 'android') {
    return { microphone: true, notifications: true };
  }

  const micGranted = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
  );

  let notifGranted = true;
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    notifGranted = await PermissionsAndroid.check(
      'android.permission.POST_NOTIFICATIONS' as any
    );
  }

  return {
    microphone: micGranted,
    notifications: notifGranted,
  };
}

/**
 * Requests required runtime permissions (RECORD_AUDIO & POST_NOTIFICATIONS on Android 13+).
 */
export async function requestS2SPermissionsAsync(): Promise<S2SPermissionStatus> {
  if (Platform.OS !== 'android') {
    return { microphone: true, notifications: true };
  }

  const permissionsToRequest = [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO];

  if (Platform.Version >= 33) {
    permissionsToRequest.push('android.permission.POST_NOTIFICATIONS' as any);
  }

  const results: Record<string, PermissionStatus> =
    (await PermissionsAndroid.requestMultiple(
      permissionsToRequest as any
    )) as any;

  const micResult = results[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO];
  const micGranted = micResult === PermissionsAndroid.RESULTS.GRANTED;
  const micBlocked = micResult === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN;

  const notifGranted =
    Platform.Version < 33 ||
    results['android.permission.POST_NOTIFICATIONS'] ===
      PermissionsAndroid.RESULTS.GRANTED;

  return {
    microphone: micGranted,
    notifications: notifGranted,
    microphoneBlocked: micBlocked,
  };
}
