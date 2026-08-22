import { ToolCallRequestPayload, ToolDefinition, ToolHandler } from './types';
import S2SMobileModule from './S2SMobileModule';

export type S2SEventSubscription = { remove: () => void };

export class ToolExecutionManager {
  private registeredHandlers = new Map<string, ToolHandler>();
  private subscription: S2SEventSubscription | null = null;

  private ensureListener(): void {
    if (!this.subscription) {
      this.subscription = S2SMobileModule.addListener(
        'onExecuteToolRequest',
        async (event: ToolCallRequestPayload) => {
          const handler = this.registeredHandlers.get(event.name);
          if (!handler) {
            S2SMobileModule.resolveToolExecution(
              event.callId,
              `No JS handler registered for tool: ${event.name}`,
              true
            );
            return;
          }
          try {
            const result = await handler(event.arguments);
            const output = typeof result === 'string' ? result : JSON.stringify(result);
            S2SMobileModule.resolveToolExecution(event.callId, output, false);
          } catch (err: any) {
            const message = err?.message ? String(err.message) : String(err);
            S2SMobileModule.resolveToolExecution(event.callId, message, true);
          }
        }
      );
    }
  }

  registerTool(definition: ToolDefinition, handler: ToolHandler): void {
    this.registeredHandlers.set(definition.name, handler);
    this.ensureListener();
    S2SMobileModule.registerTool(definition);
  }

  unregisterTool(name: string): void {
    this.registeredHandlers.delete(name);
    S2SMobileModule.unregisterTool(name);
  }

  clear(): void {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    this.registeredHandlers.clear();
  }
}

export const toolExecutionManager = new ToolExecutionManager();
