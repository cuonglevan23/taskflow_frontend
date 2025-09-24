// ChatBot API Types
export interface ChatMessage {
  messageId: string;
  content: string;
  senderType: 'USER' | 'AGENT';
  timestamp: string;
  conversationId: string;
  success: boolean;
  // Agent-specific fields (only present for AGENT messages)
  aiModel?: string;
  confidence?: number;
  intent?: string;
  tags?: string[];
  status?: 'PROCESSING' | 'PROCESSED' | 'FAILED';
  agentActive?: boolean;
  qualityAssessment?: 'LOW' | 'MEDIUM' | 'HIGH';
  adminEscalated?: boolean;
}

export interface SendMessageRequest {
  content: string;
  conversationId?: string;
}

export interface SendMessageResponse extends ChatMessage {
  // Inherits all ChatMessage properties for agent responses
}

export interface GetMessagesResponse extends Array<ChatMessage> {
  // Array of ChatMessage objects
}

export interface ConversationContext {
  conversationId: string;
  isActive: boolean;
  lastMessageAt: string;
  messageCount: number;
}

export interface ChatBotConfig {
  maxMessageLength: number;
  allowedFileTypes: string[];
  maxFileSize: number;
  supportedLanguages: string[];
}

export interface ChatBotStatus {
  isOnline: boolean;
  averageResponseTime: number;
  queueLength: number;
  lastUpdated: string;
}

// Error types specific to ChatBot
export interface ChatBotError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Request/Response wrapper types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: ChatBotError;
}
