import { NativeModule, requireNativeModule } from 'expo';

import {
  ChatMessage,
  GenerationOverrides,
  InstalledModelInfo,
  S2SConfig,
  S2SMobileModuleEvents,
  ToolDefinition,
  Voice,
} from './S2SMobile.types';

declare class S2SMobileModule extends NativeModule<S2SMobileModuleEvents> {
  initializeAsync(config: S2SConfig): Promise<void>;
  start(): boolean;
  stop(): void;
  releaseAsync(): Promise<void>;
  interrupt(): void;
  sendText(text: string, overrides?: GenerationOverrides): void;
  setSystemPrompt(prompt: string): void;
  selectVoice(voiceId: number): void;
  resetConversation(): void;
  saveConversationState(): string;
  restoreConversationState(json: string): void;
  getConversationHistory(): ChatMessage[];
  getVoices(): Voice[];
  isHardwareAecActive(): boolean;
  isHardwareNoiseSuppressionActive(): boolean;
  registerTool(definition: ToolDefinition): void;
  unregisterTool(name: string): void;
  resolveToolExecution(callId: string, result: string, isError?: boolean): void;
  onTrimMemory(level: number): void;
  getInstalledModelsAsync(): Promise<InstalledModelInfo[]>;
  downloadModelsAsync(huggingFaceToken?: string): Promise<void>;
  useCustomModelRegistry(jsonString: string): void;
  useDefaultModelRegistry(): void;
  cancelModelDownload(): void;
}

export default requireNativeModule<S2SMobileModule>('S2SMobile');
