import { TurnMetrics } from './models.types';

export type S2SState = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING';

export type DownloadStatus =
  | 'PRECHECK'
  | 'DOWNLOADING'
  | 'VERIFYING'
  | 'EXTRACTING'
  | 'COMPLETED'
  | 'FAILED';

export interface UserTranscriptPayload {
  text: string;
  isFinal: boolean;
}

export interface AssistantDeltaPayload {
  text: string;
}

export interface AssistantDonePayload {
  text: string;
}

export interface StateChangedPayload {
  state: S2SState;
}

export interface MetricsPayload {
  metrics: TurnMetrics;
}

export interface ToolExecutedPayload {
  name: string;
  output: string;
  isError: boolean;
}

export interface AudioFocusLostPayload {
  willResume: boolean;
}

export interface ErrorPayload {
  message: string;
  cause?: string;
}

export interface ToolCallRequestPayload {
  callId: string;
  name: string;
  arguments: Record<string, string>;
}

export interface ModelDownloadProgressPayload {
  specName: string;
  percent: number;
  downloadedBytes: number;
  totalBytes: number;
  status: DownloadStatus;
}

export type S2SMobileModuleEvents = {
  onUserTranscript: (params: UserTranscriptPayload) => void;
  onAssistantDelta: (params: AssistantDeltaPayload) => void;
  onAssistantDone: (params: AssistantDonePayload) => void;
  onStateChanged: (params: StateChangedPayload) => void;
  onBargeIn: () => void;
  onSpeechStarted: () => void;
  onSpeechEnded: () => void;
  onMetrics: (params: MetricsPayload) => void;
  onToolExecuted: (params: ToolExecutedPayload) => void;
  onAudioFocusLost: (params: AudioFocusLostPayload) => void;
  onAudioFocusRegained: () => void;
  onError: (params: ErrorPayload) => void;
  onExecuteToolRequest: (params: ToolCallRequestPayload) => void;
  onModelDownloadProgress: (params: ModelDownloadProgressPayload) => void;
};
