export interface GenerationOverrides {
  temperature?: number;
  topP?: number;
  topK?: number;
  repeatPenalty?: number;
  maxTokens?: number;
  stopSequences?: string[];
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface TurnMetrics {
  timeToFirstTokenMs: number;
  timeToFirstAudioMs: number;
}

export interface Voice {
  id: number;
  name: string;
}

export interface InstalledModelInfo {
  id: string;
  category: string;
  name: string;
  isInstalled: boolean;
  diskUsageBytes: number;
  /** Registry-declared expected size, in bytes. Use this for a "251 MB" label before download. */
  approxBytes: number;
  /** The backend enum name (e.g. "MOONSHINE", "SILERO") this model file is built for. Null if the registry entry doesn't pin one. */
  backend: string | null;
  path: string;
}
