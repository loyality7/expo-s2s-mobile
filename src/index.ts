import {
  ChatMessage,
  GenerationOverrides,
  InstalledModelInfo,
  S2SConfig,
  S2SMobileModuleEvents,
  ToolDefinition,
  ToolHandler,
  Voice,
} from './types';
import S2SMobileModule from './S2SMobileModule';
import { S2SEventSubscription, toolExecutionManager } from './ToolExecutionManager';

export * from './permissions';
export * from './useS2SModelDownloader';

/**
 * Register a tool with a JavaScript execution handler.
 *
 * @note **Execution Timeout:** JS tool execution is asynchronous, but the native LLM pauses generation
 * and waits for the JS result. To prevent the background LLM thread from deadlocking if a JS callback
 * hangs, the native bridge enforces a strict **30-second timeout**. If the JS handler does not resolve
 * within 30 seconds, the native invocation fails safely. Late JS responses are discarded safely.
 * Each invocation is independently correlated by a unique native UUID.
 */
export function registerTool(definition: ToolDefinition, handler: ToolHandler): void {
  toolExecutionManager.registerTool(definition, handler);
}

export function unregisterTool(name: string): void {
  toolExecutionManager.unregisterTool(name);
}

/**
 * Listen to S2S engine events.
 *
 * @note **Delta Coalescing:** To optimize React Native bridge performance, assistant deltas are
 * coalesced approximately every 35 ms before being delivered to JS. Because of this intentional
 * optimization, buffered assistant delta text may be delivered slightly after another non-terminal
 * event (such as `onToolExecuted`).
 */
export function addS2SListener<K extends keyof S2SMobileModuleEvents>(
  eventName: K,
  listener: S2SMobileModuleEvents[K]
): S2SEventSubscription {
  return S2SMobileModule.addListener(eventName, listener as any);
}

/**
 * Initialize the S2S engine with the given configuration.
 *
 * @note **Error Handling:** This method is Promise-based. Initialization failures (e.g., missing
 * models or invalid configs) are delivered through Promise rejection. Runtime errors that occur
 * *after* initialization will be delivered through the `onError` S2S event listener.
 */
export function initializeAsync(config: S2SConfig): Promise<void> {
  return S2SMobileModule.initializeAsync(config);
}

export function start(): boolean {
  return S2SMobileModule.start();
}

export function stop(): void {
  return S2SMobileModule.stop();
}

export function releaseAsync(): Promise<void> {
  toolExecutionManager.clear();
  return S2SMobileModule.releaseAsync();
}

/** @deprecated Use releaseAsync() instead */
export function release(): Promise<void> {
  return releaseAsync();
}

export function interrupt(): void {
  return S2SMobileModule.interrupt();
}

export function sendText(text: string, overrides?: GenerationOverrides): void {
  return S2SMobileModule.sendText(text, overrides);
}

export function setSystemPrompt(prompt: string): void {
  return S2SMobileModule.setSystemPrompt(prompt);
}

export function selectVoice(voiceId: number): void {
  return S2SMobileModule.selectVoice(voiceId);
}

export function resetConversation(): void {
  return S2SMobileModule.resetConversation();
}

export function saveConversationState(): string {
  return S2SMobileModule.saveConversationState();
}

export function restoreConversationState(json: string): void {
  return S2SMobileModule.restoreConversationState(json);
}

export function getConversationHistory(): ChatMessage[] {
  return S2SMobileModule.getConversationHistory();
}

export function getVoices(): Voice[] {
  return S2SMobileModule.getVoices();
}

export function isHardwareAecActive(): boolean {
  return S2SMobileModule.isHardwareAecActive();
}

export function isHardwareNoiseSuppressionActive(): boolean {
  return S2SMobileModule.isHardwareNoiseSuppressionActive();
}

export function onTrimMemory(level: number): void {
  return S2SMobileModule.onTrimMemory(level);
}

export function getInstalledModelsAsync(): Promise<InstalledModelInfo[]> {
  return S2SMobileModule.getInstalledModelsAsync();
}

export function downloadModelsAsync(huggingFaceToken?: string): Promise<void> {
  return S2SMobileModule.downloadModelsAsync(huggingFaceToken);
}

export function useCustomModelRegistry(jsonString: string): void {
  return S2SMobileModule.useCustomModelRegistry(jsonString);
}

export function useDefaultModelRegistry(): void {
  return S2SMobileModule.useDefaultModelRegistry();
}

export function cancelModelDownload(): void {
  return S2SMobileModule.cancelModelDownload();
}

export { S2SMobileModule };
export * from './types';
