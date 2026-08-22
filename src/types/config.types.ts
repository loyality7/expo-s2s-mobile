export type VadBackend = 'SILERO' | 'TEN';

export type SttBackend =
  | 'ZIPFORMER_TRANSDUCER'
  | 'ZIPFORMER2_CTC'
  | 'PARAFORMER'
  | 'NEMO_CTC'
  | 'MOONSHINE'
  | 'PARAKEET_TDT'
  | 'WHISPER'
  | 'CANARY';

export type LlmBackend = 'LLAMA_CPP' | 'LITERT';

export type TtsBackend = 'KOKORO' | 'VITS' | 'MATCHA' | 'KITTEN' | 'POCKET';

export interface ModelPaths {
  vadModel: string;
  sttDir: string;
  llmModel: string;
  ttsDir: string;
  hdAudioRestorerModel?: string | null;
}

export interface AudioConfig {
  sampleRate?: number;
  frameSize?: number;
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  playbackSampleRate?: number | null;
  manageForegroundService?: boolean;
  serviceNotificationTitle?: string;
  serviceNotificationText?: string;
  serviceNotificationPausedTitle?: string;
  serviceNotificationPausedText?: string;
  manageAudioFocus?: boolean;
  pauseOnDuck?: boolean;
  audioSource?: string;
  notificationChannelId?: string;
  notificationId?: number;
  notificationImportance?: string;
  notificationSmallIconRes?: number;
  captureThreadPriority?: number;
  playbackThreadPriority?: number;
  captureBufferFrameMultiplier?: number;
  playbackBufferMultiplier?: number;
  playbackPollIntervalMs?: number;
  releaseJoinTimeoutMs?: number;
}

export interface VadConfig {
  backend?: VadBackend;
  threshold?: number;
  minSilenceSeconds?: number;
  minSpeechSeconds?: number;
  maxSpeechSeconds?: number;
  bargeInFrames?: number;
  bargeInGraceMs?: number;
  bargeInEnabled?: boolean;
  numThreads?: number;
  provider?: string;
}

export interface SttConfig {
  backend?: SttBackend;
  numThreads?: number;
  endpointTrailingSilence?: number;
  endpointSilenceOnly?: number;
  endpointMaxUtterance?: number;
  emitPartials?: boolean;
  preferInt8?: boolean;
  decodingMethod?: string;
  maxActivePaths?: number;
  hotwords?: string[];
  hotwordsScore?: number;
  provider?: string;
  featureDim?: number;
  language?: string;
  targetLanguage?: string;
  punctuation?: boolean;
}

export interface LlmConfig {
  systemPrompt?: string;
  temperature?: number;
  topP?: number;
  topK?: number;
  repeatPenalty?: number;
  maxTokens?: number;
  stopSequences?: string[];
  contextLength?: number;
  numThreads?: number;
  batchSize?: number;
  gpuLayers?: number;
  useMmap?: boolean;
  flashAttention?: boolean;
  historyTurns?: number;
  compactHistory?: boolean;
  reuseKvCache?: boolean;
  toolsEnabled?: boolean;
  backend?: LlmBackend;
}

export interface TtsConfig {
  backend?: TtsBackend;
  speakerId?: number;
  speed?: number;
  numThreads?: number;
  preferInt8?: boolean;
  warmUp?: boolean;
  warmUpText?: string;
  noiseScale?: number;
  noiseScaleW?: number;
  firstChunkMinChars?: number;
  maxChunkChars?: number;
  minChunkChars?: number;
  provider?: string;
  enableHdAudioRestorer?: boolean;
}

export interface S2SConfig {
  models: ModelPaths;
  audio?: AudioConfig;
  vad?: VadConfig;
  stt?: SttConfig;
  llm?: LlmConfig;
  tts?: TtsConfig;
  warmUpOnInit?: boolean;
}
