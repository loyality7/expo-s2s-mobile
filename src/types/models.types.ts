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
  path: string;
}
