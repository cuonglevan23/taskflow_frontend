import SockJS from 'sockjs-client';
import { Stomp, StompSubscription } from '@stomp/stompjs';
import { BaseApiClient } from '@/lib/baseApiClient';
import {
  ChatMessage,
  ConversationsResponse,
  ChatHistoryResponse,
  ConversationsParams,
  ChatConversation,
  CreateDirectConversationRequest,
  CreateGroupConversationRequest,
  CreateGroupFromFriendsRequest,
  SendMessageRequest,
  FriendForGroupChat,
  MessageReaction,
  ReactionType,
  FileUploadResponse,
  MessageReadStatus,
  BulkReactionResponse
} from '@/types/chat';

export class ChatService {
  private static instance: ChatService;
  private client: any = null;
  private connected: boolean = false;
  private userId: number | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private eventHandlers: Map<string, Function[]> = new Map();
  private messageQueue: Array<{
    id: string;
    conversationId: number;
    content: string;
    type: string;
    replyToId?: number;
    timestamp: string;
    retryCount: number;
  }> = [];

  private processedMessageIds: Set<number> = new Set();
  private processedClientMessageIds = new Map<string, number>();
  private readonly MAX_PROCESSED_IDS = 1000;
  private readonly DEDUP_TIMEOUT_MS = 800;

  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private lastHeartbeat: number = 0;
  private readonly HEARTBEAT_INTERVAL = 30000;
  private readonly CONNECTION_TIMEOUT = 60000;

  private constructor() {
    this.setupHeartbeat();
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.disconnect();
      });
    }
  }

  // ==================== PRIVATE UTILITY METHODS ====================

  private setupHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.connected && this.client) {
        this.client.send('/app/chat/heartbeat', {}, {});
        this.lastHeartbeat = Date.now();
      }
    }, this.HEARTBEAT_INTERVAL);
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      this.emit('max-reconnect-attempts-reached');
      return;
    }

    const delay = Math.pow(2, this.reconnectAttempts) * 1000;
    this.reconnectAttempts++;

    this.reconnectTimeout = setTimeout(() => {
      if (this.userId) {
        this.connect(this.userId).catch(() => {
          this.scheduleReconnect();
        });
      }
    }, delay);
  }

  private emit(event: string, data?: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('Event handler error:', error);
        }
      });
    }
  }

  // ==================== CONVERSATION MANAGEMENT ====================

  async getConversations(params?: ConversationsParams): Promise<ConversationsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());

    const url = queryParams.toString() ? `/api/chat/conversations?${queryParams}` : '/api/chat/conversations';
    return BaseApiClient.get<ConversationsResponse>(url);
  }

  async createDirectConversation(request: CreateDirectConversationRequest): Promise<ChatConversation> {
    return BaseApiClient.post<ChatConversation>('/api/chat/conversations/direct', request);
  }

  async createGroupConversation(request: CreateGroupConversationRequest): Promise<ChatConversation> {
    return BaseApiClient.post<ChatConversation>('/api/chat/conversations/group', request);
  }

  async createGroupFromFriends(request: CreateGroupFromFriendsRequest): Promise<ChatConversation> {
    return BaseApiClient.postToNextApi<ChatConversation>('/api/chat/conversations/group/from-friends', request);
  }

  async getFriendsForGroupChat(): Promise<FriendForGroupChat[]> {
    return BaseApiClient.getFromNextApi<FriendForGroupChat[]>('/api/chat/friends/for-group-chat');
  }

  // ==================== MESSAGE MANAGEMENT ====================

  async getConversationMessages(
    conversationId: number,
    page: number = 0,
    size: number = 50
  ): Promise<ChatHistoryResponse> {
    return BaseApiClient.get<ChatHistoryResponse>(
      `/api/chat/conversations/${conversationId}/messages?page=${page}&size=${size}`
    );
  }

  async getAllMessages(conversationId: number): Promise<ChatHistoryResponse> {
    return BaseApiClient.get<ChatHistoryResponse>(`/api/chat/conversations/${conversationId}/messages/all`);
  }

  async sendMessage(request: SendMessageRequest): Promise<ChatMessage> {
    return BaseApiClient.post<ChatMessage>('/api/chat/messages', request);
  }

  async replyToMessage(messageId: number, request: SendMessageRequest): Promise<ChatMessage> {
    return BaseApiClient.post<ChatMessage>(`/api/chat/messages/${messageId}/reply`, request);
  }

  async getMessageDetails(messageId: number): Promise<ChatMessage> {
    return BaseApiClient.get<ChatMessage>(`/api/chat/messages/${messageId}`);
  }

  async markMessageAsRead(messageId: number): Promise<void> {
    return BaseApiClient.put(`/api/chat/messages/${messageId}/read`);
  }

  // ==================== REACTIONS ====================

  async toggleReaction(messageId: number, reactionType: ReactionType): Promise<MessageReaction> {
    return BaseApiClient.post(`/api/chat/messages/${messageId}/reactions/${reactionType}/toggle`);
  }

  async getMessageReactions(messageId: number): Promise<any> {
    return BaseApiClient.get(`/api/chat/messages/${messageId}/reactions`);
  }

  async getBulkReactionSummaries(conversationId: number, messageIds: number[]): Promise<BulkReactionResponse> {
    return BaseApiClient.post(`/api/chat/conversations/${conversationId}/messages/reactions/bulk`, messageIds);
  }

  // ==================== FILE UPLOAD METHODS ====================

  async uploadFiles(conversationId: number, files: File[]): Promise<FileUploadResponse[]> {
    const results: FileUploadResponse[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('conversationId', conversationId.toString());

      const response = await BaseApiClient.postFormData<FileUploadResponse>(`/api/chat/files/upload`, formData);
      results.push(response);
    }

    return results;
  }

  async uploadImages(conversationId: number, images: File[]): Promise<FileUploadResponse[]> {
    // Images are also uploaded using the same files/upload endpoint
    return this.uploadFiles(conversationId, images);
  }

  async sendMessageWithFile(request: {
    conversationId: number;
    content?: string;
    file: File;
    replyToId?: number;
  }): Promise<ChatMessage> {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('conversationId', request.conversationId.toString());

    if (request.content) {
      formData.append('content', request.content);
    }

    if (request.replyToId) {
      formData.append('replyToId', request.replyToId.toString());
    }

    return BaseApiClient.postFormData<ChatMessage>('/api/chat/messages/with-file', formData);
  }

  async sendMessageWithAttachments(request: {
    conversationId: number;
    content: string;
    files?: File[];
    images?: File[];
    replyToId?: number;
  }): Promise<ChatMessage> {
    try {
      // If only one file/image, use the direct with-file endpoint
      const totalFiles = (request.files?.length || 0) + (request.images?.length || 0);

      if (totalFiles === 1) {
        const singleFile = request.files?.[0] || request.images?.[0];
        if (singleFile) {
          return this.sendMessageWithFile({
            conversationId: request.conversationId,
            content: request.content,
            file: singleFile,
            replyToId: request.replyToId
          });
        }
      }

      // For multiple files, upload them first then send message with URLs
      const fileUploads: FileUploadResponse[] = [];

      if (request.files && request.files.length > 0) {
        const uploads = await this.uploadFiles(request.conversationId, request.files);
        fileUploads.push(...uploads);
      }

      if (request.images && request.images.length > 0) {
        const uploads = await this.uploadImages(request.conversationId, request.images);
        fileUploads.push(...uploads);
      }

      // Send message with file URLs
      const messageRequest: SendMessageRequest & {
        fileName?: string;
        fileUrl?: string;
        fileSize?: number;
      } = {
        conversationId: request.conversationId,
        content: request.content || 'Shared files',
        type: 'FILE',
        replyToId: request.replyToId
      };

      // For multiple files, we might need to send multiple messages or use a different approach
      // For now, we'll use the first file as the main attachment
      if (fileUploads.length > 0) {
        const firstFile = fileUploads[0];
        messageRequest.fileName = firstFile.fileName;
        messageRequest.fileUrl = firstFile.fileUrl;
        messageRequest.fileSize = firstFile.fileSize;

        // Determine message type based on content type
        if (firstFile.contentType?.startsWith('image/')) {
          messageRequest.type = 'IMAGE';
        } else if (firstFile.contentType?.startsWith('video/')) {
          messageRequest.type = 'VIDEO';
        } else {
          messageRequest.type = 'FILE';
        }
      }

      return this.sendMessage(messageRequest);
    } catch (error) {
      console.error('Failed to send message with attachments:', error);
      throw error;
    }
  }

  sendMessageWithAttachmentsViaWebSocket(message: {
    conversationId: number;
    content: string;
    type: string;
    replyToId?: number;
    fileAttachments?: string[];
    imageAttachments?: string[];
  }): void {
    if (this.connected && this.client) {
      this.client.send('/app/chat/send', {}, JSON.stringify(message));
    } else {
      // Add to queue with attachments
      this.messageQueue.push({
        id: Date.now().toString(),
        ...message,
        timestamp: new Date().toISOString(),
        retryCount: 0
      } as any);
    }
  }

  // ==================== WEBSOCKET METHODS ====================

  connect(userId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connected) {
        resolve();
        return;
      }

      this.userId = userId;
      const socket = new SockJS('/ws/chat');
      this.client = Stomp.over(socket);

      this.client.connect(
        {},
        () => {
          this.connected = true;
          this.reconnectAttempts = 0;
          this.setupSubscriptions();
          this.processMessageQueue();
          this.emit('connected');
          resolve();
        },
        (error: any) => {
          console.error('WebSocket connection failed:', error);
          this.connected = false;
          this.scheduleReconnect();
          reject(error);
        }
      );
    });
  }

  disconnect(): void {
    if (this.client && this.connected) {
      this.subscriptions.forEach((subscription) => subscription.unsubscribe());
      this.subscriptions.clear();
      this.client.disconnect();
      this.connected = false;
      this.emit('disconnected');
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  sendMessageViaWebSocket(message: {
    conversationId: number;
    content: string;
    type: string;
    replyToId?: number;
  }): void {
    if (this.connected && this.client) {
      this.client.send('/app/chat/send', {}, JSON.stringify(message));
    } else {
      this.messageQueue.push({
        id: Date.now().toString(),
        ...message,
        timestamp: new Date().toISOString(),
        retryCount: 0
      });
    }
  }

  sendTypingIndicator(conversationId: number, isTyping: boolean): void {
    if (this.connected && this.client) {
      this.client.send('/app/chat/typing', {}, JSON.stringify({
        conversationId,
        isTyping
      }));
    }
  }

  markAsReadViaWebSocket(messageId: number): void {
    if (this.connected && this.client) {
      this.client.send(`/app/chat/markAsRead/${messageId}`, {}, {});
    }
  }

  // ==================== PRIVATE METHODS ====================

  private setupSubscriptions(): void {
    if (!this.userId || !this.client) return;

    const personalQueue = this.client.subscribe(
      `/queue/user/${this.userId}/messages`,
      (message: any) => {
        const chatMessage = JSON.parse(message.body);
        this.handleIncomingMessage(chatMessage);
      }
    );
    this.subscriptions.set('personal-messages', personalQueue);

    const personalReactions = this.client.subscribe(
      `/queue/user/${this.userId}/reaction`,
      (reaction: any) => {
        const reactionEvent = JSON.parse(reaction.body);
        this.emit('reaction', reactionEvent);
      }
    );
    this.subscriptions.set('personal-reactions', personalReactions);

    const offlineSync = this.client.subscribe(
      `/queue/user/${this.userId}/offline-sync`,
      (syncData: any) => {
        const offlineMessages = JSON.parse(syncData.body);
        this.emit('offline-sync', offlineMessages);
      }
    );
    this.subscriptions.set('offline-sync', offlineSync);
  }

  private handleIncomingMessage(message: ChatMessage): void {
    // Prevent duplicate processing with enhanced deduplication
    if (this.processedMessageIds.has(message.id)) {
      console.log(`Duplicate message detected and skipped: ${message.id}`);
      return;
    }

    // Additional check for recent messages with same content (within dedup timeout)
    const now = Date.now();
    const messageTime = new Date(message.createdAt).getTime();

    // Check processed client messages for recent duplicates
    for (const [clientId, timestamp] of this.processedClientMessageIds.entries()) {
      if (now - timestamp > this.DEDUP_TIMEOUT_MS) {
        // Clean up old entries
        this.processedClientMessageIds.delete(clientId);
      }
    }

    // Generate client message signature for deduplication
    const messageSignature = `${message.senderId}-${message.conversationId}-${message.content}-${Math.floor(messageTime / 1000)}`;

    if (this.processedClientMessageIds.has(messageSignature)) {
      console.log(`Duplicate message by signature detected and skipped: ${messageSignature}`);
      return;
    }

    // Store message signature with timestamp
    this.processedClientMessageIds.set(messageSignature, now);

    // Store message ID
    this.processedMessageIds.add(message.id);

    // Limit the size of processed IDs set
    if (this.processedMessageIds.size > this.MAX_PROCESSED_IDS) {
      const idsArray = Array.from(this.processedMessageIds);
      const toRemove = idsArray.slice(0, this.MAX_PROCESSED_IDS / 2);
      toRemove.forEach(id => this.processedMessageIds.delete(id));
    }

    this.emit('message', message);
  }

  private processMessageQueue(): void {
    const failedMessages = [];

    for (const queuedMessage of this.messageQueue) {
      try {
        if (this.connected && this.client) {
          this.client.send('/app/chat/send', {}, JSON.stringify({
            conversationId: queuedMessage.conversationId,
            content: queuedMessage.content,
            type: queuedMessage.type,
            replyToId: queuedMessage.replyToId
          }));
        } else {
          failedMessages.push(queuedMessage);
        }
      } catch (error) {
        queuedMessage.retryCount++;
        if (queuedMessage.retryCount < 3) {
          failedMessages.push(queuedMessage);
        }
      }
    }

    this.messageQueue = failedMessages;
  }

  // ==================== EVENT HANDLING ====================

  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // ==================== PUBLIC UTILITY METHODS ====================

  subscribeToConversation(conversationId: number): void {
    if (!this.client || !this.connected) return;

    const messagesSub = this.client.subscribe(
      `/topic/conversation/${conversationId}/messages`,
      (message: any) => {
        const chatMessage = JSON.parse(message.body);
        this.handleIncomingMessage(chatMessage);
      }
    );
    this.subscriptions.set(`conv-${conversationId}-messages`, messagesSub);

    const reactionsSub = this.client.subscribe(
      `/topic/conversation/${conversationId}/reaction`,
      (reaction: any) => {
        const reactionEvent = JSON.parse(reaction.body);
        this.emit('reaction', reactionEvent);
      }
    );
    this.subscriptions.set(`conv-${conversationId}-reactions`, reactionsSub);

    const typingSub = this.client.subscribe(
      `/topic/conversation/${conversationId}/typing`,
      (status: any) => {
        const typingStatus = JSON.parse(status.body);
        this.emit('typing', typingStatus);
      }
    );
    this.subscriptions.set(`conv-${conversationId}-typing`, typingSub);
  }

  unsubscribeFromConversation(conversationId: number): void {
    const subscriptionKeys = [
      `conv-${conversationId}-messages`,
      `conv-${conversationId}-reactions`,
      `conv-${conversationId}-typing`
    ];

    subscriptionKeys.forEach(key => {
      const subscription = this.subscriptions.get(key);
      if (subscription) {
        subscription.unsubscribe();
        this.subscriptions.delete(key);
      }
    });
  }

  isConnected(): boolean {
    return this.connected;
  }

  getUserId(): number | null {
    return this.userId;
  }

  // ==================== SINGLETON PATTERN ====================

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }
}

// Export singleton instance
export const chatService = ChatService.getInstance();
