import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking } from 'react-native';
import { checkS2SPermissionsAsync, requestS2SPermissionsAsync } from 'expo-s2s-mobile';

export const PermissionState = {
  UNKNOWN: 'UNKNOWN',
  CHECKING: 'CHECKING',
  REQUESTING: 'REQUESTING',
  GRANTED: 'GRANTED',
  DENIED: 'DENIED',
  BLOCKED: 'BLOCKED',
};

/**
 * Tracks microphone (+ notification, Android 13+) permission state as one of
 * the explicit states the app's startup machine needs. Native
 * PermissionsAndroid is the source of truth; this hook never guesses.
 */
export function usePermissions() {
  const [state, setState] = useState(PermissionState.UNKNOWN);
  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);

  const check = useCallback(async () => {
    setState(PermissionState.CHECKING);
    const status = await checkS2SPermissionsAsync();
    if (!mounted.current) return;
    setState(status.microphone ? PermissionState.GRANTED : PermissionState.UNKNOWN);
    return status;
  }, []);

  const request = useCallback(async () => {
    setState(PermissionState.REQUESTING);
    const status = await requestS2SPermissionsAsync();
    if (!mounted.current) return;
    if (status.microphone) {
      setState(PermissionState.GRANTED);
    } else if (status.microphoneBlocked) {
      setState(PermissionState.BLOCKED);
    } else {
      setState(PermissionState.DENIED);
    }
    return status;
  }, []);

  const openSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  return { state, check, request, openSettings };
}
