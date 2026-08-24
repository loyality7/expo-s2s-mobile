import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getInstalledModelsAsync } from 'expo-s2s-mobile';
import { S2SContext } from './S2SContext';
import { usePermissions, PermissionState } from '../hooks/usePermissions';
import { useModelSetup, ModelSetupState } from '../hooks/useModelSetup';
import { useS2S, EngineInitState } from '../hooks/useS2S';
import { useConversation } from '../hooks/useConversation';
import { buildModelPaths } from '../services/modelService';

export const AppState = {
  BOOTING: 'BOOTING',
  CHECKING_PERMISSIONS: 'CHECKING_PERMISSIONS',
  PERMISSIONS_REQUIRED: 'PERMISSIONS_REQUIRED',
  CHECKING_MODELS: 'CHECKING_MODELS',
  MODELS_REQUIRED: 'MODELS_REQUIRED',
  DOWNLOADING_MODELS: 'DOWNLOADING_MODELS',
  INITIALIZING_ENGINE: 'INITIALIZING_ENGINE',
  READY: 'READY',
  ERROR: 'ERROR',
};

const DEFAULT_CONFIG_EXTRAS = {
  warmUpOnInit: true,
};

/**
 * Owns the deterministic startup state machine. Never renders Chat before
 * permissions are granted AND models are installed AND the engine actually
 * initializes — no timeouts standing in for real readiness signals.
 */
export function S2SProvider({ children }) {
  const [appState, setAppState] = useState(AppState.BOOTING);
  const [bootError, setBootError] = useState(null);
  const configOverrides = useRef({});

  const permissions = usePermissions();
  const modelSetup = useModelSetup();
  const conversation = useConversation();

  const s2sConfig = useMemo(() => {
    return { models: {}, ...DEFAULT_CONFIG_EXTRAS, ...configOverrides.current };
  }, [appState]); // eslint-disable-line react-hooks/exhaustive-deps

  const s2s = useS2S(s2sConfig);

  const runStartup = useCallback(async () => {
    setBootError(null);
    setAppState(AppState.CHECKING_PERMISSIONS);
    const permStatus = await permissions.check();

    if (!permStatus?.microphone) {
      setAppState(AppState.PERMISSIONS_REQUIRED);
      return;
    }

    await proceedPastPermissions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const proceedPastPermissions = useCallback(async () => {
    setAppState(AppState.CHECKING_MODELS);
    const result = await modelSetup.refresh();

    if (!result || !result.allInstalled) {
      setAppState(AppState.MODELS_REQUIRED);
      return;
    }

    await proceedToEngineInit();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const proceedToEngineInit = useCallback(async () => {
    setAppState(AppState.INITIALIZING_ENGINE);
    try {
      const installed = await getInstalledModelsAsync();
      const modelPaths = buildModelPaths(installed);
      configOverrides.current = { models: modelPaths };
      const ok = await s2s.initialize();
      if (!ok) {
        setAppState(AppState.ERROR);
        return;
      }
      s2s.start();
      setAppState(AppState.READY);
    } catch (e) {
      setBootError(e?.message || 'Voice engine failed to start');
      setAppState(AppState.ERROR);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const requestPermission = useCallback(async () => {
    const status = await permissions.request();
    if (status?.microphone) {
      await proceedPastPermissions();
    }
  }, [proceedPastPermissions]); // eslint-disable-line react-hooks/exhaustive-deps

  const startDownloadingModels = useCallback(async () => {
    setAppState(AppState.DOWNLOADING_MODELS);
    await modelSetup.startDownload();
    const result = await modelSetup.refresh();
    if (result?.allInstalled) {
      await proceedToEngineInit();
    } else {
      setAppState(AppState.MODELS_REQUIRED);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const retry = useCallback(() => {
    runStartup();
  }, [runStartup]);

  useEffect(() => {
    runStartup();
    return () => {
      s2s.release();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value = {
    appState,
    bootError,
    permissions,
    modelSetup,
    s2s,
    conversation,
    requestPermission,
    startDownloadingModels,
    retry,
  };

  return <S2SContext.Provider value={value}>{children}</S2SContext.Provider>;
}
