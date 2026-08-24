import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 's2s.userSettings.v1';

// Defaults mirror the SDK's own config defaults (LlmConfig/TtsConfig/
// AudioConfig/VadConfig) — this is only the subset meaningful for a user to
// tune at runtime. Low-level tuning (thread priorities, buffer sizes,
// notification resource ids) stays SDK-internal; a mobile settings screen
// exposing those would be developer UI, not user UI.
export const DEFAULT_SETTINGS = {
  llm: {
    systemPrompt: "Talk Freely, but don't be rude. You are a helpful assistant.",
    temperature: 0.7,
    topP: 0.95,
    maxTokens: 256,
  },
  tts: {
    speed: 1.05,
  },
  vad: {
    threshold: 0.5,
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    manageAudioFocus: true,
  },
};

export async function getUserSettings() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      llm: { ...DEFAULT_SETTINGS.llm, ...parsed.llm },
      tts: { ...DEFAULT_SETTINGS.tts, ...parsed.tts },
      vad: { ...DEFAULT_SETTINGS.vad, ...parsed.vad },
      audio: { ...DEFAULT_SETTINGS.audio, ...parsed.audio },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function setUserSettings(next) {
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}
