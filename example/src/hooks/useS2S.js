import { useCallback, useEffect, useRef, useState } from 'react';
import {
  addS2SListener,
  initializeAsync,
  interrupt,
  releaseAsync,
  resetConversation,
  sendText,
  start as startEngine,
  stop as stopEngine,
} from 'expo-s2s-mobile';

// Native S2SState is only IDLE | LISTENING | THINKING | SPEAKING. Everything
// else here (READY, STOPPED) is derived from whether the engine is running —
// never invented independently of native truth.
export const VoiceState = {
  READY: 'READY',
  LISTENING: 'LISTENING',
  THINKING: 'THINKING',
  SPEAKING: 'SPEAKING',
  PAUSED: 'PAUSED', // native IDLE while running=true: audio focus taken elsewhere
};

export const EngineInitState = {
  NOT_STARTED: 'NOT_STARTED',
  INITIALIZING: 'INITIALIZING',
  READY: 'READY',
  ERROR: 'ERROR',
};

/**
 * Owns the S2SEngine lifecycle (initialize -> start -> stop -> release) and
 * the live voice state derived from native onStateChanged. This is the only
 * place that calls initializeAsync/start/stop/releaseAsync.
 */
export function useS2S(baseConfig) {
  const [initState, setInitState] = useState(EngineInitState.NOT_STARTED);
  const [initError, setInitError] = useState(null);
  const [running, setRunning] = useState(false);
  const [nativeState, setNativeState] = useState('IDLE');
  const [lastError, setLastError] = useState(null);
  const [pausedReason, setPausedReason] = useState(null); // 'focus-lost' | null
  const initializedRef = useRef(false);

  // configOverride is passed explicitly at call time rather than read from a
  // memoized/ref-captured value — a ref mutated right before calling this
  // was one render behind, so initializeAsync silently ran with an empty
  // ModelPaths and the native side failed with "model not found: /".
  const initialize = useCallback(async (configOverride) => {
    if (initializedRef.current) return true;
    setInitState(EngineInitState.INITIALIZING);
    setInitError(null);
    try {
      await initializeAsync({ ...baseConfig, ...configOverride });
      initializedRef.current = true;
      setInitState(EngineInitState.READY);
      return true;
    } catch (e) {
      setInitError(e?.message || 'Voice engine failed to start');
      setInitState(EngineInitState.ERROR);
      return false;
    }
  }, [baseConfig]);

  useEffect(() => {
    const subs = [
      addS2SListener('onStateChanged', (data) => setNativeState(data.state)),
      addS2SListener('onAudioFocusLost', (data) => {
        setPausedReason(data.willResume ? 'focus-lost' : null);
        if (!data.willResume) setRunning(false);
      }),
      addS2SListener('onAudioFocusRegained', () => setPausedReason(null)),
      addS2SListener('onError', (data) => setLastError(data.message)),
    ];
    return () => subs.forEach((s) => s.remove());
  }, []);

  const start = useCallback(() => {
    const ok = startEngine();
    if (ok) {
      setRunning(true);
      setLastError(null);
    }
    return ok;
  }, []);

  const stop = useCallback(() => {
    stopEngine();
    setRunning(false);
  }, []);

  const release = useCallback(async () => {
    setRunning(false);
    initializedRef.current = false;
    setInitState(EngineInitState.NOT_STARTED);
    await releaseAsync();
  }, []);

  const clearError = useCallback(() => setLastError(null), []);

  const voiceState = !running
    ? VoiceState.READY
    : pausedReason
    ? VoiceState.PAUSED
    : nativeState === 'LISTENING'
    ? VoiceState.LISTENING
    : nativeState === 'THINKING'
    ? VoiceState.THINKING
    : nativeState === 'SPEAKING'
    ? VoiceState.SPEAKING
    : VoiceState.READY;

  return {
    initState,
    initError,
    initialize,
    running,
    voiceState,
    lastError,
    clearError,
    start,
    stop,
    release,
    interrupt,
    sendText,
    resetConversation,
  };
}
