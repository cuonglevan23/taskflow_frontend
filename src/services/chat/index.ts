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
  BulkReactionResponse,
  AddMembersRequest,
  AddMembersResponse,
  RemoveMemberResponse,
  LeaveConversationResponse,
  ConversationMemberDto
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
  private readonly CONNECTION_TIMEOUT = 60000;

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.disconnect();
      });
    }
  }

  // ==================== PRIVATE UTILITY METHODS ====================

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

  // ==================== WEBSOCKET METHODS ====================

  connect(userId: number): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (this.connected) {
        resolve();
        return;
      }

      try {
        this.userId = userId;

        console.log('=== CHAT SERVICE DEBUG ===');
        console.log('User ID:', userId);
        console.log('App uses HTTP-only cookie authentication, connecting directly to backend WebSocket...');

        // Since the WebSocket token endpoint doesn't exist, connect directly to backend
        // using session-based authentication
        console.log('Attempting to connect to WebSocket...');

        // Get backend URL from environment
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        // SockJS expects HTTP URL, not WebSocket URL - it handles the upgrade internally
        const sockJsUrl = backendUrl + '/ws/chat';

        console.log('SockJS URL:', sockJsUrl);

        // Create SockJS connection to backend server
        // SockJS will automatically upgrade to WebSocket connection
        const socket = new SockJS(sockJsUrl);
        this.client = Stomp.over(socket);

        // Configure debug logging for development
        if (process.env.NODE_ENV === 'development') {
          this.client.debug = (str: string) => {
            console.log('STOMP: ' + str);
          };
        } else {
          this.client.debug = () => {}; // Disable in production
        }

        // Set connection timeout
        this.client.heartbeat.outgoing = 20000;
        this.client.heartbeat.incoming = 20000;

        // Prepare connection headers - backend should authenticate via session
        const connectHeaders: any = {
          'X-User-ID': userId.toString()
        };


        console.log('Connecting with headers:', Object.keys(connectHeaders));

        // Connect with authentication headers
        this.client.connect(
          connectHeaders,
          () => {
            console.log('WebSocket connected successfully');
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

            // Handle specific error cases
            if (error.headers && error.headers.message) {
              console.error('Server error message:', error.headers.message);
            }

            // Only schedule reconnect if it's not an auth error
            if (!error.toString().includes('401') && !error.toString().includes('Unauthorized')) {
              this.scheduleReconnect();
            } else {
              console.error('Authentication failed. User may need to log in again.');
              this.emit('auth-error');
            }

            reject(error);
          }
        );
      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        reject(error);
      }
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

  // ==================== MEMBER MANAGEMENT ====================

  /**
   * Get friends list for adding to group chat
   * Uses the endpoint /api/chat/friends/for-group-chat
   */
  async getFriendsForGroupChat(): Promise<FriendForGroupChat[]> {
    try {
      return await BaseApiClient.get<FriendForGroupChat[]>('/api/chat/friends/for-group-chat');
    } catch (error) {
      console.error('Failed to get friends for group chat:', error);
      throw error;
    }
  }

  /**
   * Add multiple members to a group conversation
   * Only admins/owners can add members
   * Automatically sends system notification messages
   */
  async addMembersToConversation(
    conversationId: number,
    request: AddMembersRequest
  ): Promise<AddMembersResponse> {
    try {
      // Validate input
      if (!request.userIds || request.userIds.length === 0) {
        throw new Error('At least one user ID is required');
      }

      // Remove duplicates
      const uniqueUserIds = [...new Set(request.userIds)];

      const response = await BaseApiClient.post<AddMembersResponse>(
        `/api/chat/conversations/${conversationId}/members`,
        { userIds: uniqueUserIds }
      );

      // Emit event for real-time UI updates
      this.emit('members-added', {
        conversationId,
        members: response.members,
        systemMessage: response.systemMessage
      });

      return response;
    } catch (error) {
      console.error('Failed to add members to conversation:', error);

      // Handle specific error cases
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = error.message as string;
        if (errorMessage.includes('permission denied') || errorMessage.includes('not authorized')) {
          throw new Error('You do not have permission to add members to this conversation. Only admins and owners can add members.');
        }
        if (errorMessage.includes('already a member')) {
          throw new Error('One or more users are already members of this conversation.');
        }
        if (errorMessage.includes('user not found')) {
          throw new Error('One or more users could not be found.');
        }
        if (errorMessage.includes('direct conversation')) {
          throw new Error('Cannot add members to a direct conversation.');
        }
      }

      throw error;
    }
  }

  /**
   * Remove a member from group conversation
   * Only admins/owners can remove members (except themselves)
   * Automatically sends system notification messages
   */
  async removeMemberFromConversation(
    conversationId: number,
    memberId: number
  ): Promise<RemoveMemberResponse> {
    try {
      const response = await BaseApiClient.delete<RemoveMemberResponse>(
        `/api/chat/conversations/${conversationId}/members/${memberId}`
      );

      // Emit event for real-time UI updates
      this.emit('member-removed', {
        conversationId,
        memberId,
        systemMessage: response.systemMessage
      });

      return response;
    } catch (error) {
      console.error('Failed to remove member from conversation:', error);

      // Handle specific error cases
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = error.message as string;
        if (errorMessage.includes('permission denied') || errorMessage.includes('not authorized')) {
          throw new Error('You do not have permission to remove members from this conversation. Only admins and owners can remove members.');
        }
        if (errorMessage.includes('cannot remove owner')) {
          throw new Error('Cannot remove the conversation owner. Transfer ownership first.');
        }
        if (errorMessage.includes('member not found')) {
          throw new Error('The specified member is not part of this conversation.');
        }
        if (errorMessage.includes('direct conversation')) {
          throw new Error('Cannot remove members from a direct conversation.');
        }
      }

      throw error;
    }
  }

  /**
   * Leave a group conversation
   * Any member can leave (except the last owner)
   * Automatically sends system notification message
   */
  async leaveConversation(conversationId: number): Promise<LeaveConversationResponse> {
    try {
      const response = await BaseApiClient.post<LeaveConversationResponse>(
        `/api/chat/conversations/${conversationId}/leave`
      );

      // Emit event for real-time UI updates
      this.emit('conversation-left', {
        conversationId,
        systemMessage: response.systemMessage
      });

      // Remove conversation from local state if needed
      this.emit('conversation-removed', { conversationId });

      return response;
    } catch (error) {
      console.error('Failed to leave conversation:', error);

      // Handle specific error cases
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = error.message as string;
        if (errorMessage.includes('cannot leave as owner')) {
          throw new Error('As the conversation owner, you cannot leave. Transfer ownership to another member first or delete the conversation.');
        }
        if (errorMessage.includes('not a member')) {
          throw new Error('You are not a member of this conversation.');
        }
        if (errorMessage.includes('direct conversation')) {
          throw new Error('Cannot leave a direct conversation.');
        }
      }

      throw error;
    }
  }

  /**
   * Get conversation members
   * Returns list of all members with their roles and details
   */
  async getConversationMembers(conversationId: number): Promise<ConversationMemberDto[]> {
    try {
      return await BaseApiClient.get<ConversationMemberDto[]>(
        `/api/chat/conversations/${conversationId}/members`
      );
    } catch (error) {
      console.error('Failed to get conversation members:', error);
      throw error;
    }
  }

  /**
   * Update member role in conversation
   * Only owners can change roles
   */
  async updateMemberRole(
    conversationId: number,
    memberId: number,
    role: 'ADMIN' | 'MEMBER'
  ): Promise<ConversationMemberDto> {
    try {
      const response = await BaseApiClient.put<ConversationMemberDto>(
        `/api/chat/conversations/${conversationId}/members/${memberId}/role`,
        { role }
      );

      // Emit event for real-time UI updates
      this.emit('member-role-updated', {
        conversationId,
        memberId,
        newRole: role,
        member: response
      });

      return response;
    } catch (error) {
      console.error('Failed to update member role:', error);

      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = error.message as string;
        if (errorMessage.includes('permission denied') || errorMessage.includes('not authorized')) {
          throw new Error('Only conversation owners can change member roles.');
        }
        if (errorMessage.includes('cannot change owner role')) {
          throw new Error('Cannot change the role of the conversation owner.');
        }
      }


      throw error;
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
    return BaseApiClient.post<ChatConversation>('/api/chat/conversations/group/from-friends', request);
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
        const uploads = await this.uploadFiles(request.conversationId, request.images);
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

  // ==================== STATIC METHODS ====================

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }
}

// Export singleton instance
export const chatService = ChatService.getInstance();
