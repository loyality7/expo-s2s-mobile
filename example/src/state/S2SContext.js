import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { 
  initializeAsync, start, stop, interrupt, releaseAsync,
  resetConversation, saveConversationState, restoreConversationState,
  getConversationHistory, getVoices, selectVoice, setSystemPrompt, sendText,
  getInstalledModelsAsync, downloadModelsAsync, cancelModelDownload,
  onTrimMemory, isHardwareAecActive, isHardwareNoiseSuppressionActive,
  addS2SListener, checkS2SPermissionsAsync, requestS2SPermissionsAsync,
  registerTool, unregisterTool
} from 'expo-s2s-mobile';

const S2SContext = createContext(null);

export const S2SProvider = ({ children }) => {
  // Navigation & Flow State: 'BOOT' | 'PERMISSIONS' | 'MODELS' | 'READY' | 'DIAGNOSTICS' | 'SETTINGS'
  const [currentScreen, setCurrentScreen] = useState('BOOT');
  
  // Permissions State
  const [permissions, setPermissions] = useState({ microphone: false, notifications: false });
  const [permissionStatus, setPermissionStatus] = useState('UNKNOWN'); // UNKNOWN, NEEDED, GRANTED, DENIED

  // Models State
  const [installedModels, setInstalledModels] = useState([]);
  const [downloadProgressData, setDownloadProgressData] = useState({});
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [selectedModelIds, setSelectedModelIds] = useState({
    LLM: 'llm_qwen_0_5b',
    STT: 'stt_moonshine_base',
    TTS: 'tts_piper_amy_female',
    VAD: 'silero_vad'
  });

  const selectModel = (category, modelId) => {
    setSelectedModelIds(prev => ({ ...prev, [category]: modelId }));
  };

  // Engine Lifecycle State
  const [engineState, setEngineState] = useState('UNINITIALIZED'); // UNINITIALIZED, INITIALIZING, READY, RUNNING, RELEASED, ERROR
  const [s2sState, setS2sState] = useState('IDLE'); // IDLE, LISTENING, THINKING, SPEAKING
  const [lastError, setLastError] = useState(null);

  // Chat & Voice State
  const [conversation, setConversation] = useState([]);
  const [currentAssistantDelta, setCurrentAssistantDelta] = useState('');
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [voices, setVoices] = useState([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState('');
  const [systemPrompt, setSystemPromptText] = useState('');

  // Diagnostics & Event Logs
  const [events, setEvents] = useState([]);
  const [eventsPaused, setEventsPaused] = useState(false);
  const eventsPausedRef = useRef(eventsPaused);
  useEffect(() => { eventsPausedRef.current = eventsPaused; }, [eventsPaused]);

  const logEvent = useCallback((eventName, payloadSummary) => {
    if (eventsPausedRef.current) return;
    const time = new Date().toISOString().split('T')[1].slice(0, 12);
    setEvents(prev => [{ time, eventName, payloadSummary }, ...prev].slice(0, 100));
  }, []);

  // -------------------------------------------------------------
  // EVENT LISTENERS & BOOTSTRAP
  // -------------------------------------------------------------
  useEffect(() => {
    const subs = [
      addS2SListener('onStateChanged', ({ state }) => {
        setS2sState(state);
        logEvent('onStateChanged', state);
      }),
      addS2SListener('onAssistantDelta', ({ text }) => {
        setCurrentAssistantDelta(prev => prev + text);
        logEvent('onAssistantDelta', `"${text}"`);
      }),
      addS2SListener('onAssistantDone', ({ text }) => {
        setCurrentAssistantDelta(prev => {
          const finalContent = prev || text || '';
          if (finalContent.trim()) {
            setConversation(c => [...c, { role: 'assistant', content: finalContent }]);
          }
          return '';
        });
        logEvent('onAssistantDone', text ? `"${text}"` : 'Done');
      }),
      addS2SListener('onUserTranscript', ({ text, isFinal }) => {
        setCurrentTranscript(text);
        logEvent('onUserTranscript', `"${text}" (isFinal: ${isFinal})`);
        if (isFinal && text.trim()) {
          setConversation(c => [...c, { role: 'user', content: text }]);
          setCurrentTranscript('');
        }
      }),
      addS2SListener('onError', ({ message, cause }) => {
        const errObj = { message, cause, time: new Date().toISOString() };
        setLastError(errObj);
        setEngineState('ERROR');
        logEvent('onError', message);
      }),
      addS2SListener('onModelDownloadProgress', (data) => {
        setDownloadProgressData(prev => ({ ...prev, [data.modelName]: data }));
        logEvent('onModelDownloadProgress', `${data.modelName} ${Math.round(data.percent)}% ${data.status}`);
      }),
      addS2SListener('onSpeechStarted', () => logEvent('onSpeechStarted', '')),
      addS2SListener('onSpeechEnded', () => logEvent('onSpeechEnded', '')),
      addS2SListener('onBargeIn', () => logEvent('onBargeIn', '')),
      addS2SListener('onMetrics', (p) => logEvent('onMetrics', JSON.stringify(p.metrics))),
      addS2SListener('onToolExecuted', (p) => logEvent('onToolExecuted', `${p.name} -> ${p.output}`)),
      addS2SListener('onAudioFocusLost', (p) => logEvent('onAudioFocusLost', `willResume: ${p.willResume}`)),
      addS2SListener('onAudioFocusRegained', () => logEvent('onAudioFocusRegained', '')),
    ];

    bootstrap();

    return () => subs.forEach(s => s.remove());
  }, []);

  const bootstrap = async () => {
    try {
      setCurrentScreen('BOOT');
      
      // 1. Check permissions
      const perms = await checkS2SPermissionsAsync();
      setPermissions(perms);
      
      if (!perms.microphone) {
        setPermissionStatus('NEEDED');
        setCurrentScreen('PERMISSIONS');
        return;
      }
      setPermissionStatus('GRANTED');

      // 2. Check installed models
      const models = await getInstalledModelsAsync();
      setInstalledModels(models);
      
      const installedLlm = models.find(m => m.category === 'LLM' && m.isInstalled);
      if (!installedLlm) {
        setCurrentScreen('MODELS');
        return;
      }

      // 3. Auto-initialize engine
      await initEngine(installedLlm.path);
      setCurrentScreen('READY');
    } catch (e) {
      setLastError({ message: String(e), time: new Date().toISOString() });
      setEngineState('ERROR');
      setCurrentScreen('READY');
    }
  };

  const initEngine = async (llmPath) => {
    try {
      setEngineState('INITIALIZING');
      setLastError(null);

      const models = await getInstalledModelsAsync();
      const vadModel = models.find(m => m.category === 'VAD' && m.isInstalled)?.path || '';
      const sttDir = models.find(m => m.category === 'STT' && m.isInstalled)?.path || '';
      const llmModel = llmPath || models.find(m => m.category === 'LLM' && m.isInstalled)?.path || '';
      const ttsDir = models.find(m => m.category === 'TTS' && m.isInstalled)?.path || '';

      await initializeAsync({
        models: {
          vadModel,
          sttDir,
          llmModel,
          ttsDir
        },
        vad: { threshold: 0.5 },
        stt: { backend: 'MOONSHINE' },
        llm: { backend: 'LLAMA_CPP', systemPrompt: systemPrompt },
        tts: { backend: 'VITS' }
      });

      setEngineState('READY');
      
      // Load available voices
      const v = getVoices();
      setVoices(v);
      logEvent('initializeAsync', 'SUCCESS');
    } catch (e) {
      setEngineState('ERROR');
      setLastError({ message: String(e), time: new Date().toISOString() });
      logEvent('initializeAsync', `FAILED: ${e}`);
      throw e;
    }
  };

  // -------------------------------------------------------------
  // CONTROLLER ACTIONS
  // -------------------------------------------------------------
  const requestPermissions = async () => {
    setPermissionStatus('REQUESTING');
    const perms = await requestS2SPermissionsAsync();
    setPermissions(perms);
    
    if (perms.microphone) {
      setPermissionStatus('GRANTED');
      bootstrap();
    } else {
      setPermissionStatus('DENIED');
    }
  };

  const downloadModels = async () => {
    try {
      setIsDownloading(true);
      setDownloadError('');

      const targetIds = Object.values(selectedModelIds).filter(Boolean);
      await downloadModelsAsync(targetIds.length > 0 ? targetIds : null, '');

      const models = await getInstalledModelsAsync();
      setInstalledModels(models);

      const selectedLlmId = selectedModelIds.LLM;
      const installedLlm = models.find(m => (m.id === selectedLlmId || m.category === 'LLM') && m.isInstalled);
      if (installedLlm) {
        setIsDownloading(false);
        await initEngine(installedLlm.path);
        setCurrentScreen('READY');
      } else {
        throw new Error('Models finished downloading but registry verification failed.');
      }
    } catch (e) {
      setIsDownloading(false);
      setDownloadError(String(e));
      logEvent('downloadModelsAsync', `FAILED: ${e}`);
    }
  };

  const handleStartListening = () => {
    if (engineState !== 'READY' && engineState !== 'RUNNING') return;
    start();
    setEngineState('RUNNING');
  };

  const handleStopListening = () => {
    stop();
    setEngineState('READY');
  };

  const handleInterrupt = () => {
    interrupt();
  };

  const handleResetConversation = () => {
    resetConversation();
    setConversation([]);
    setCurrentAssistantDelta('');
    setCurrentTranscript('');
  };

  const handleRelease = async () => {
    await releaseAsync();
    setEngineState('RELEASED');
  };

  const value = {
    // Navigation
    currentScreen, setCurrentScreen,
    
    // Permissions
    permissions, permissionStatus, requestPermissions,
    
    // Models & Download
    installedModels, downloadProgressData, isDownloading, downloadError, downloadModels, cancelModelDownload,
    selectedModelIds, selectModel,
    
    // Engine & S2S State
    engineState, s2sState, lastError, initEngine, bootstrap,
    
    // Voice & Controls
    startListening: handleStartListening,
    stopListening: handleStopListening,
    interrupt: handleInterrupt,
    resetConversation: handleResetConversation,
    releaseEngine: handleRelease,
    
    // Chat & Voice state
    conversation, currentAssistantDelta, currentTranscript,
    voices, selectedVoiceId, setSelectedVoiceId, selectVoice,
    systemPrompt, setSystemPromptText, setSystemPrompt, sendText,
    
    // Diagnostics & Events
    events, eventsPaused, setEventsPaused, setEvents, logEvent,
    isHardwareAecActive, isHardwareNoiseSuppressionActive, onTrimMemory
  };

  return <S2SContext.Provider value={value}>{children}</S2SContext.Provider>;
};

export const useS2S = () => {
  const ctx = useContext(S2SContext);
  if (!ctx) throw new Error('useS2S must be used within an S2SProvider');
  return ctx;
};
