// Chat types and interfaces based on CHAT_API_DOCUMENTATION.md

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export interface ChatUser extends User {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  isOnline?: boolean;
  lastSeen?: string;
  role?: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt?: string;
}

// ==================== API REQUEST/RESPONSE TYPES ====================

export interface ConversationsParams {
  page?: number;
  size?: number;
}

export interface CreateDirectConversationRequest {
  otherUserId: number;
}

export interface CreateGroupConversationRequest {
  name: string;
  description?: string;
  avatarUrl?: string;
  memberIds: number[];
}

export interface CreateGroupFromFriendsRequest {
  name: string;
  description?: string;
  friendIds: number[];
  avatarUrl?: string;
}

export interface SendMessageRequest {
  conversationId: number;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE';
  replyToId?: number;
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
}

export interface FriendForGroupChat {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  isOnline?: boolean;
  lastSeen?: string;
  isSelected?: boolean;
}

// ==================== CONVERSATION TYPES ====================

export type ConversationType = 'DIRECT' | 'GROUP';

export interface ChatConversation {
  id: number;
  type: ConversationType;
  name: string;
  description?: string;
  avatarUrl?: string;
  memberCount: number;
  lastMessage?: {
    id: number;
    content: string;
    senderName: string;
    senderAvatar?: string;
    createdAt: string;
    type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE';
  };
  unreadCount: number;
  isOnline?: boolean;
  lastActivity: string;
  createdAt: string;
  participants?: ChatUser[];
}

export interface ConversationsResponse {
  content: ChatConversation[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

// ==================== MESSAGE TYPES ====================

export type MessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE';

export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  type: MessageType;
  content: string;
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  replyToId?: number;
  replyToContent?: string;
  replyToSenderName?: string;
  isEdited?: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt?: string;
  deliveredCount?: number;
  readCount?: number;
  // Add reactions support
  reactions?: {
    reactionCounts: Record<ReactionType, number>;
    reactionUsers: Record<ReactionType, {
      userId: number;
      userName: string;
      userAvatar?: string;
      reactedAt: string;
    }[]>;
    currentUserReactions: ReactionType[];
    totalReactions: number;
    hasReactions: boolean;
  };
}

export interface ChatHistoryResponse {
  messages: ChatMessage[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
  isFirst: boolean;
  isLast: boolean;
}

// ==================== REACTION TYPES ====================

export enum ReactionType {
  LIKE = "LIKE",     // 👍
  LOVE = "LOVE",     // ❤️
  LAUGH = "LAUGH",   // 😂
  WOW = "WOW",       // 😮
  SAD = "SAD",       // 😢
  ANGRY = "ANGRY"    // 😠
}

// Mapping emoji to reaction type
export const REACTION_EMOJIS: Record<ReactionType, string> = {
  [ReactionType.LIKE]: "👍",
  [ReactionType.LOVE]: "❤️",
  [ReactionType.LAUGH]: "😂",
  [ReactionType.WOW]: "😮",
  [ReactionType.SAD]: "😢",
  [ReactionType.ANGRY]: "😠"
};

export interface MessageReaction {
  eventType: 'REACTION_ADDED' | 'REACTION_REMOVED';
  messageId: number;
  conversationId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  reactionType: ReactionType;
  emoji: string;
  timestamp: string;
  updatedSummary: {
    messageId: number;
    reactionCounts: Record<ReactionType, number>;
    reactionUsers: Record<ReactionType, {
      userId: number;
      userName: string;
      userAvatar?: string;
      reactedAt: string;
    }[]>;
    currentUserReactions: ReactionType[];
    totalReactions: number;
    hasReactions: boolean;
  };
}

export interface BulkReactionResponse {
  conversationId: number;
  messageReactions: Record<string, {
    messageId: number;
    reactionCounts: Record<ReactionType, number>;
    reactionUsers: Record<ReactionType, {
      userId: number;
      userName: string;
      userAvatar?: string;
      reactedAt: string;
    }[]>;
    currentUserReactions: ReactionType[];
    totalReactions: number;
    hasReactions: boolean;
  }>;
  generatedAt: string;
}

// ==================== FILE TYPES ====================

export interface FileUploadResponse {
  fileName: string;
  fileUrl: string;
  previewUrl?: string;
  fileSize: number;
  contentType: string;
  category: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'OTHER';
  s3Key: string;
  uploadedAt: string;
}

// ==================== FILE UPLOAD TYPES ====================

export interface FileUploadResponse {
  fileId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
}

export interface AttachmentFile {
  id?: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  preview?: string;
}

// Enhanced ChatMessage interface to include attachments
export interface ChatMessageAttachment {
  fileAttachments?: AttachmentFile[];
  imageAttachments?: AttachmentFile[];
}

// Update SendMessageRequest to support attachments
export interface SendMessageWithAttachmentsRequest extends SendMessageRequest {
  fileAttachments?: string[];
  imageAttachments?: string[];
}

// ==================== READ STATUS TYPES ====================

export interface MessageReadStatus {
  messageId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  status: 'DELIVERED' | 'READ';
  deliveredAt?: string;
  readAt?: string;
  deliveredAtFormatted?: string;
  readAtFormatted?: string;
  deliveredDateFormatted?: string;
  readDateFormatted?: string;
  deliveredAtRelative?: string;
  readAtRelative?: string;
  isToday?: boolean;
  isRecent?: boolean;
  readDelayMinutes?: number;
}

// ==================== TYPING INDICATOR ====================

export interface TypingIndicator {
  conversationId: number;
  userId: number;
  userName: string;
  isTyping: boolean;
  timestamp: string;
}

// ==================== WEBSOCKET EVENTS ====================

export interface WebSocketEvent {
  type: 'MESSAGE' | 'REACTION' | 'TYPING' | 'READ_STATUS' | 'CONNECTION' | 'ERROR';
  data: any;
  timestamp: string;
}

// ==================== UI SPECIFIC TYPES ====================

export interface ChatWindow {
  key: string;
  user: ChatUser;
  conversationId: number | null;
  isMinimized: boolean;
  zIndex?: number;
  position?: {
    x: number;
    y: number;
  };
}

export interface UIConversation {
  id: string;
  type: 'direct' | 'team';
  title: string;
  participants: {
    id: string;
    name: string;
    avatar?: string;
    isOnline?: boolean;
  }[];
  lastMessage?: {
    text: string;
    timestamp: Date;
    sender: {
      id: string;
      name: string;
      avatar?: string;
    };
  };
  unreadCount: number;
  isActive: boolean;
}

// ==================== HOOK RETURN TYPES ====================

export interface UseChatReturn {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;

  // Conversations
  conversations: ChatConversation[];
  loadingConversations: boolean;

  // Messages
  messages: Map<number, ChatMessage[]>;
  loadingMessages: Set<number>;

  // Actions
  sendMessage: (conversationId: number, content: string, replyToId?: number) => Promise<void>;
  createDirectChat: (userId: number) => Promise<ChatConversation>;
  createGroupChat: (name: string, memberIds: number[], description?: string) => Promise<ChatConversation>;
  loadMessages: (conversationId: number) => Promise<void>;
  markAsRead: (messageId: number) => Promise<void>;

  // Real-time features
  typingUsers: Map<number, TypingIndicator[]>;
  setTyping: (conversationId: number, isTyping: boolean) => void;

  // Error handling
  error: string | null;
  clearError: () => void;
}

export interface UseFriendsReturn {
  friends: FriendForGroupChat[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseReactionsReturn {
  reactions: Map<number, MessageReaction['updatedSummary']>;
  loading: Set<number>;
  error: string | null;
  toggleReaction: (messageId: number, reactionType: ReactionType) => Promise<void>;
  loadReactions: (messageId: number) => Promise<void>;
  loadBulkReactions: (conversationId: number, messageIds: number[]) => Promise<void>;
}
