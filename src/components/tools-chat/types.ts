'use client';

import type { CalculatorType } from '@/types/calculator';
import type { ChatAttachment } from '@/components/ui';

// Tool types
export type ToolType = 'moe' | 'sample' | 'maxdiff' | 'loi' | 'demographics' | 'feasibility';

// Tool suggestion
export interface ToolSuggestion {
  id: string;
  label: string;
  description: string;
  icon: string;
  toolType: ToolType;
  prompt: string;
}

// Tool input field
export interface ToolInputField {
  name: string;
  label: string;
  type: 'number' | 'text' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: string | number;
  min?: number;
  max?: number;
  step?: number;
  helpText?: string;
}

// Tool configuration
export interface ToolConfig {
  id: ToolType;
  name: string;
  description: string;
  icon: string;
  color: string;
  fields: ToolInputField[];
}

// Chat message types
export type MessageRole = 'user' | 'assistant';

export interface ToolResult {
  toolType: ToolType;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  summary: string;
  details: Array<{ label: string; value: string | number; highlight?: boolean }>;
  recommendations?: string[];
  quality?: 'excellent' | 'good' | 'acceptable' | 'poor';
}

export interface ToolsChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  attachments?: ChatAttachment[];

  // AI message extras
  toolResult?: ToolResult;
  suggestions?: string[];
  showToolForm?: ToolType;
  formValues?: Record<string, unknown>;
  submittedValues?: Record<string, unknown>; // Values shown after form submission
}

// Hook return type
export interface UseToolsChatReturn {
  messages: ToolsChatMessage[];
  isStreaming: boolean;
  activeToolForm: ToolType | null;
  formValues: Record<string, unknown>;
  sendMessage: (content: string, attachments?: ChatAttachment[]) => void;
  submitToolForm: (toolType: ToolType, values: Record<string, unknown>) => void;
  updateFormValue: (field: string, value: unknown) => void;
  clearChat: () => void;
  selectTool: (toolType: ToolType) => void;
}

// Chat container props
export interface ToolsChatContainerProps {
  messages: ToolsChatMessage[];
  isStreaming: boolean;
  activeToolForm: ToolType | null;
  formValues: Record<string, unknown>;
  onSendMessage: (content: string, attachments?: ChatAttachment[]) => void;
  onSubmitToolForm: (toolType: ToolType, values: Record<string, unknown>) => void;
  onUpdateFormValue: (field: string, value: unknown) => void;
  onSuggestionClick: (suggestion: string) => void;
  onToolSelect: (toolType: ToolType) => void;
  showWelcome?: boolean;
  className?: string;
  // Coworking props
  sessionActive?: boolean;
  typingUsers?: import('@/types').SessionCollaborator[];
}

// Re-export ChatAttachment for convenience
export type { ChatAttachment };
