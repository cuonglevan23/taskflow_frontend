// ChatBot Service - AI Agent API Integration
// Inherits from BaseApiClient for consistent error handling and auth

import { BaseApiClient } from '@/lib/baseApiClient';
import {
  ChatMessage,
  SendMessageRequest,
  SendMessageResponse,
  GetMessagesResponse,
  ConversationContext,
  ApiResponse
} from './types';

export class ChatBotService {
  private static readonly BASE_ENDPOINT = '/api/ai-agent';

  /**
   * Send a message to the AI agent
   * POST /api/ai-agent/messages
   */
  static async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      console.log('🤖 Sending message to AI agent:', request);

      const response = await BaseApiClient.post<SendMessageResponse>(
        `${this.BASE_ENDPOINT}/messages`,
        request
      );

      console.log('✅ AI agent response received:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to send message to AI agent:', error);
      throw error;
    }
  }

  /**
   * Get conversation messages
   * GET /api/ai-agent/messages
   */
  static async getMessages(conversationId?: string): Promise<GetMessagesResponse> {
    try {
      console.log('📨 Fetching conversation messages:', { conversationId });

      const params = conversationId ? { conversationId } : undefined;

      const response = await BaseApiClient.get<GetMessagesResponse>(
        `${this.BASE_ENDPOINT}/messages`,
        params
      );

      console.log('✅ Messages fetched successfully:', response.length, 'messages');
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch messages:', error);
      throw error;
    }
  }

  /**
   * Get conversation context/metadata
   * GET /api/ai-agent/conversations/{conversationId}
   */
  static async getConversationContext(conversationId: string): Promise<ConversationContext> {
    try {
      console.log('🔍 Fetching conversation context:', conversationId);

      const response = await BaseApiClient.get<ConversationContext>(
        `${this.BASE_ENDPOINT}/conversations/${conversationId}`
      );

      console.log('✅ Conversation context fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch conversation context:', error);
      throw error;
    }
  }

  /**
   * Start a new conversation
   * POST /api/ai-agent/conversations
   */
  static async startNewConversation(): Promise<ConversationContext> {
    try {
      console.log('🆕 Starting new conversation');

      const response = await BaseApiClient.post<ConversationContext>(
        `${this.BASE_ENDPOINT}/conversations`
      );

      console.log('✅ New conversation started:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to start new conversation:', error);
      throw error;
    }
  }

  /**
   * End/close a conversation
   * DELETE /api/ai-agent/conversations/{conversationId}
   */
  static async endConversation(conversationId: string): Promise<void> {
    try {
      console.log('🔚 Ending conversation:', conversationId);

      await BaseApiClient.delete<void>(
        `${this.BASE_ENDPOINT}/conversations/${conversationId}`
      );

      console.log('✅ Conversation ended successfully');
    } catch (error) {
      console.error('❌ Failed to end conversation:', error);
      throw error;
    }
  }

  /**
   * Mark message as read
   * PUT /api/ai-agent/messages/{messageId}/read
   */
  static async markMessageAsRead(messageId: string): Promise<void> {
    try {
      console.log('👁️ Marking message as read:', messageId);

      await BaseApiClient.put<void>(
        `${this.BASE_ENDPOINT}/messages/${messageId}/read`
      );

      console.log('✅ Message marked as read');
    } catch (error) {
      console.error('❌ Failed to mark message as read:', error);
      throw error;
    }
  }

  /**
   * Rate/feedback on AI response
   * POST /api/ai-agent/messages/{messageId}/feedback
   */
  static async provideFeedback(
    messageId: string,
    rating: number,
    feedback?: string
  ): Promise<void> {
    try {
      console.log('👍 Providing feedback for message:', messageId, { rating, feedback });

      await BaseApiClient.post<void>(
        `${this.BASE_ENDPOINT}/messages/${messageId}/feedback`,
        { rating, feedback }
      );

      console.log('✅ Feedback submitted successfully');
    } catch (error) {
      console.error('❌ Failed to submit feedback:', error);
      throw error;
    }
  }

  /**
   * Request admin escalation
   * POST /api/ai-agent/conversations/{conversationId}/escalate
   */
  static async escalateToAdmin(conversationId: string, reason?: string): Promise<void> {
    try {
      console.log('🚨 Escalating conversation to admin:', conversationId, { reason });

      await BaseApiClient.post<void>(
        `${this.BASE_ENDPOINT}/conversations/${conversationId}/escalate`,
        { reason }
      );

      console.log('✅ Conversation escalated to admin');
    } catch (error) {
      console.error('❌ Failed to escalate conversation:', error);
      throw error;
    }
  }

  /**
   * Get conversation history with pagination
   * GET /api/ai-agent/conversations
   */
  static async getConversationHistory(
    page: number = 1,
    limit: number = 20
  ): Promise<ConversationContext[]> {
    try {
      console.log('📚 Fetching conversation history:', { page, limit });

      const response = await BaseApiClient.get<ConversationContext[]>(
        `${this.BASE_ENDPOINT}/conversations`,
        { page, limit }
      );

      console.log('✅ Conversation history fetched:', response.length, 'conversations');
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch conversation history:', error);
      throw error;
    }
  }
}

export default ChatBotService;
