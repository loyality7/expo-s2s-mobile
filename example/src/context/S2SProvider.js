import { useCallback, useEffect, useState } from 'react';
import { getInstalledModelsAsync } from 'expo-s2s-mobile';
import { S2SContext } from './S2SContext';
import { usePermissions } from '../hooks/usePermissions';
import { useModelSetup } from '../hooks/useModelSetup';
import { useS2S } from '../hooks/useS2S';
import { useConversation } from '../hooks/useConversation';
import { buildEngineConfig } from '../services/modelService';
import { getSelectedModelIds } from '../services/modelPreferences';
import { getUserSettings } from '../services/settingsStore';

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

const BASE_CONFIG = { warmUpOnInit: true };

/**
 * Owns the deterministic startup state machine. Never renders Chat before
 * permissions are granted AND models are installed AND the engine actually
 * initializes — no timeouts standing in for real readiness signals.
 */
export function S2SProvider({ children }) {
  const [appState, setAppState] = useState(AppState.BOOTING);
  const [bootError, setBootError] = useState(null);

  const permissions = usePermissions();
  const modelSetup = useModelSetup();
  const conversation = useConversation();
  const s2s = useS2S(BASE_CONFIG);

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

  // modelPaths is computed here and passed straight into s2s.initialize() as
  // an explicit argument — never stashed in a ref for initialize's own
  // memoized closure to pick up later. That indirection was the actual bug:
  // the ref was still empty on the render that mattered, so the engine
  // silently initialized with blank ModelPaths ("model not found: /").
  const proceedToEngineInit = useCallback(async () => {
    setAppState(AppState.INITIALIZING_ENGINE);
    try {
      const [installed, preferredIds, userSettings] = await Promise.all([
        getInstalledModelsAsync(),
        getSelectedModelIds(),
        getUserSettings(),
      ]);
      const engineConfig = buildEngineConfig(installed, preferredIds);
      engineConfig.llm = { ...engineConfig.llm, ...userSettings.llm };
      engineConfig.tts = { ...engineConfig.tts, ...userSettings.tts };
      engineConfig.vad = { ...engineConfig.vad, ...userSettings.vad };
      engineConfig.audio = { ...engineConfig.audio, ...userSettings.audio };
      const ok = await s2s.initialize(engineConfig);
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

  // Settings/model changes are init-time config on this SDK — there's no
  // hot-swap path, so applying them means a real release + reinitialize.
  const restartEngine = useCallback(async () => {
    await s2s.release();
    await proceedToEngineInit();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    restartEngine,
  };

  return <S2SContext.Provider value={value}>{children}</S2SContext.Provider>;
}
