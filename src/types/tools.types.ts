export interface ToolParameter {
  description: string;
  type?: 'string' | 'number' | 'boolean' | 'integer';
  required?: boolean;
  enum?: string[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters?: Record<string, string>;
  schema?: Record<string, ToolParameter>;
}

export type ToolHandler = (args: Record<string, string>) => Promise<string> | string;
