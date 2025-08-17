"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Maximize2, Minimize2, Copy, ThumbsUp, ThumbsDown, Check, ArrowLeft, History, Trash2, Settings, Zap, Brain, Sparkles } from 'lucide-react';
import { ButtonIcon } from '@/components/ui/Button';
import { 
  AIInput, 
  AIInputTextarea, 
  AIInputSubmit, 
  AIInputToolbar, 
  AIInputTools, 
  AIInputButton 
} from '@/components/ui/shadcn-io/ai/input';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  lastUpdated: Date;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatPanel({ isOpen, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Xin chào! Tôi là trợ lý AI TaskManager. Tôi có thể giúp bạn quản lý task, tìm kiếm thông tin dự án, hoặc trả lời các câu hỏi về hệ thống.',
      isBot: true,
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [likedMessages, setLikedMessages] = useState<Set<string>>(new Set());
  const [dislikedMessages, setDislikedMessages] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'chat' | 'history'>('chat');
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('current');
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Available AI models
  const aiModels = [
    { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model', icon: Brain },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient', icon: Zap },
    { id: 'claude-3', name: 'Claude 3', description: 'Anthropic AI', icon: Sparkles },
  ];

  // AI Suggestions for quick actions
  const suggestions = [
    'Tạo task mới cho dự án hiện tại',
    'Hiển thị các task cần hoàn thành hôm nay',
    'Thống kê tiến độ dự án',
    'Tìm kiếm task theo từ khóa',
    'Gán task cho thành viên team',
    'Xem lịch họp tuần này',
    'Báo cáo tình trạng dự án',
    'Hướng dẫn sử dụng hệ thống',
  ];

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('chatbot-sessions');
    if (savedSessions) {
      try {
        const sessions = JSON.parse(savedSessions).map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          lastUpdated: new Date(session.lastUpdated),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setChatSessions(sessions);
      } catch (error) {
        console.error('Failed to load chat sessions:', error);
      }
    }
  }, []);

  // Save current session when messages change
  useEffect(() => {
    if (messages.length > 1) { // Only save if there are actual conversations
      saveCurrentSession();
    }
  }, [messages]);

  // Simulate bot response
  const simulateBotResponse = async (userMessage: string) => {
    setIsTyping(true);
    setShowSuggestions(false);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    // Smart responses based on user input
    let response = '';
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('task') || lowerMessage.includes('công việc')) {
      response = 'Tôi có thể giúp bạn:\n• Tạo task mới\n• Cập nhật trạng thái task\n• Gán task cho thành viên\n• Xem danh sách task theo filter\n\nBạn muốn thực hiện điều gì?';
    } else if (lowerMessage.includes('dự án') || lowerMessage.includes('project')) {
      response = 'Về quản lý dự án, tôi có thể:\n• Tạo dự án mới\n• Xem tiến độ dự án\n• Thống kê báo cáo\n• Quản lý thành viên dự án\n\nBạn cần hỗ trợ gì cụ thể?';
    } else if (lowerMessage.includes('team') || lowerMessage.includes('nhóm')) {
      response = 'Tính năng quản lý team:\n• Thêm/xóa thành viên\n• Phân quyền vai trò\n• Xem hoạt động team\n• Giao tiếp nội bộ\n\nBạn muốn làm gì với team?';
    } else if (lowerMessage.includes('thống kê') || lowerMessage.includes('báo cáo')) {
      response = 'Báo cáo và thống kê có sẵn:\n• Dashboard tổng quan\n• Tiến độ theo thời gian\n• Hiệu suất thành viên\n• Phân tích xu hướng\n\nLoại báo cáo nào bạn quan tâm?';
    } else if (lowerMessage.includes('hướng dẫn') || lowerMessage.includes('help')) {
      response = 'Tôi có thể hướng dẫn bạn:\n• Cách sử dụng các tính năng\n• Thiết lập dự án mới\n• Quản lý workflow\n• Tips & tricks\n\nBạn cần hướng dẫn về phần nào?';
    } else {
      const generalResponses = [
        'Cảm ơn bạn đã nhắn tin! Tôi đang học hỏi để hỗ trợ bạn tốt hơn.',
        'Tôi hiểu bạn đang quan tâm đến: "' + userMessage + '". Có thể bạn thử các gợi ý bên dưới?',
        'Đây là trợ lý AI TaskManager. Tôi có thể giúp bạn quản lý task, dự án và team hiệu quả hơn.',
        'Bạn có thể hỏi tôi về bất kỳ tính năng nào trong hệ thống. Tôi sẽ cố gắng hỗ trợ tối đa!'
      ];
      response = generalResponses[Math.floor(Math.random() * generalResponses.length)];
    }
    
    const botMessage: Message = {
      id: Date.now().toString(),
      text: response,
      isBot: true,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
  };

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputMessage.trim();
    if (!messageToSend) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageToSend,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    if (!message) setInputMessage(''); // Only clear if not from suggestion

    // Simulate bot response
    await simulateBotResponse(messageToSend);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Submit on Enter (without Shift) or Cmd/Ctrl + Enter
    const isSubmitShortcut = (e.key === 'Enter' && !e.shiftKey) || 
                           (e.key === 'Enter' && (e.metaKey || e.ctrlKey));
    
    if (isSubmitShortcut) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSubmit = () => {
    if (!inputMessage.trim() || isTyping) return;
    handleSendMessage();
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const copyMessage = async (messageId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const likeMessage = (messageId: string) => {
    const newLiked = new Set(likedMessages);
    const newDisliked = new Set(dislikedMessages);
    
    if (likedMessages.has(messageId)) {
      newLiked.delete(messageId);
    } else {
      newLiked.add(messageId);
      newDisliked.delete(messageId); // Remove dislike if exists
    }
    
    setLikedMessages(newLiked);
    setDislikedMessages(newDisliked);
  };

  const dislikeMessage = (messageId: string) => {
    const newLiked = new Set(likedMessages);
    const newDisliked = new Set(dislikedMessages);
    
    if (dislikedMessages.has(messageId)) {
      newDisliked.delete(messageId);
    } else {
      newDisliked.add(messageId);
      newLiked.delete(messageId); // Remove like if exists
    }
    
    setLikedMessages(newLiked);
    setDislikedMessages(newDisliked);
  };

  const saveCurrentSession = () => {
    if (messages.length <= 1) return;
    
    const sessionTitle = messages[1]?.text.substring(0, 50) + (messages[1]?.text.length > 50 ? '...' : '') || 'Cuộc trò chuyện';
    const now = new Date();
    
    const newSession: ChatSession = {
      id: currentSessionId === 'current' ? `session-${Date.now()}` : currentSessionId,
      title: sessionTitle,
      messages: [...messages],
      createdAt: currentSessionId === 'current' ? now : chatSessions.find(s => s.id === currentSessionId)?.createdAt || now,
      lastUpdated: now
    };

    const updatedSessions = chatSessions.filter(s => s.id !== newSession.id);
    updatedSessions.unshift(newSession);
    
    // Keep only last 20 sessions
    const limitedSessions = updatedSessions.slice(0, 20);
    
    setChatSessions(limitedSessions);
    setCurrentSessionId(newSession.id);
    
    // Save to localStorage
    try {
      localStorage.setItem('chatbot-sessions', JSON.stringify(limitedSessions));
    } catch (error) {
      console.error('Failed to save chat sessions:', error);
    }
  };

  const loadChatSession = (session: ChatSession) => {
    setMessages(session.messages);
    setCurrentSessionId(session.id);
    setViewMode('chat');
    setShowSuggestions(false);
  };

  const startNewChat = () => {
    setMessages([
      {
        id: '1',
        text: 'Xin chào! Tôi là trợ lý AI TaskManager. Tôi có thể giúp bạn quản lý task, tìm kiếm thông tin dự án, hoặc trả lời các câu hỏi về hệ thống.',
        isBot: true,
        timestamp: new Date(),
      }
    ]);
    setCurrentSessionId('current');
    setViewMode('chat');
    setShowSuggestions(true);
  };

  const deleteChatSession = (sessionId: string) => {
    const updatedSessions = chatSessions.filter(s => s.id !== sessionId);
    setChatSessions(updatedSessions);
    
    try {
      localStorage.setItem('chatbot-sessions', JSON.stringify(updatedSessions));
    } catch (error) {
      console.error('Failed to save chat sessions:', error);
    }
  };

  if (!isOpen) return null;

  return (
      <div
          className={`fixed bottom-20 right-6 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-40 animate-in slide-in-from-bottom-5 duration-300 transition-all ${
              isExpanded
                  ? 'w-[650px] h-[720px]'
                  : 'w-[450px] h-[550px]'
          }`}>
        {/* Header */}
        <div
            className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-transparent text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            {viewMode === 'history' && (
              <ButtonIcon
                icon={ArrowLeft}
                onClick={() => setViewMode('chat')}
                aria-label="Quay lại chat"
                size="md"
                variant="default"
                className="text-lg font-light"
              />
            )}
            <Bot className="w-5 h-5"/>
            <span className="font-semibold">
              {viewMode === 'chat' ? 'TASKFOLW AI' : 'Lịch sử chat'}
            </span>
            {viewMode === 'chat' && (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            )}
          </div>

          <div className="flex items-center space-x-1">
            {viewMode === 'chat' && (
              <ButtonIcon
                icon={History}
                onClick={() => setViewMode('history')}
                aria-label="Xem lịch sử"
                size="md"
                variant="default"
                className="text-lg font-light"
                iconClassName="hover:rotate-12"
              />
            )}

            <ButtonIcon
              icon={isExpanded ? Minimize2 : Maximize2}
              onClick={toggleExpanded}
              aria-label={isExpanded ? 'Thu nhỏ' : 'Phóng to'}
              size="md"
              variant="default"
              className="text-lg font-light"
              iconClassName={isExpanded ? "hover:rotate-180" : "hover:rotate-12"}
            />

            <ButtonIcon
              icon={ArrowLeft}
              onClick={onClose}
              aria-label="Đóng chat"
              size="md"
              variant="danger"
              className="text-lg font-light"
            >
              <span className="text-lg font-light">×</span>
            </ButtonIcon>
          </div>
        </div>


        {/* Content Area */}
        {viewMode === 'chat' ? (
            /* Chat Messages */
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
              <div className="space-y-4">
                {messages.map((message) => (
                    <div key={message.id}
                         className={`flex items-start space-x-3 ${message.isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.isBot
                              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                              : 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
                      }`}>
                        {message.isBot ? <Bot className="w-4 h-4"/> : <User className="w-4 h-4"/>}
                      </div>

                      {/* Message Content */}
                      <div className={`group ${isExpanded ? 'max-w-[80%]' : 'max-w-[75%]'} rounded-lg px-4 py-2 ${
                          message.isBot
                              ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600'
                              : 'bg-blue-500 text-white'
                      }`}>
                        <div className="whitespace-pre-wrap text-sm">{message.text}</div>

                        {/* Message Actions - Only for bot messages */}
                        {message.isBot && (
                            <div
                                className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => copyMessage(message.id, message.text)}
                                    className="p-1.5 bg-transparent hover:bg-gray-500/10 dark:hover:bg-gray-400/20 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 backdrop-blur-sm"
                                    aria-label="Copy message"
                                >
                                  {copiedMessageId === message.id ? (
                                      <Check className="w-3 h-3 text-green-500 transition-transform duration-200"/>
                                  ) : (
                                      <Copy
                                          className="w-3 h-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"/>
                                  )}
                                </button>

                                <button
                                    onClick={() => likeMessage(message.id)}
                                    className={`p-1.5 bg-transparent rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 backdrop-blur-sm ${
                                        likedMessages.has(message.id)
                                            ? 'text-green-500 hover:bg-green-500/10 dark:hover:bg-green-400/20'
                                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-500/10 dark:hover:bg-gray-400/20 hover:text-green-500 dark:hover:text-green-400'
                                    }`}
                                    aria-label="Like message"
                                >
                                  <ThumbsUp className="w-3 h-3 transition-transform duration-200"/>
                                </button>

                                <button
                                    onClick={() => dislikeMessage(message.id)}
                                    className={`p-1.5 bg-transparent rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 backdrop-blur-sm ${
                                        dislikedMessages.has(message.id)
                                            ? 'text-red-500 hover:bg-red-500/10 dark:hover:bg-red-400/20'
                                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-500/10 dark:hover:bg-gray-400/20 hover:text-red-500 dark:hover:text-red-400'
                                    }`}
                                    aria-label="Dislike message"
                                >
                                  <ThumbsDown className="w-3 h-3 transition-transform duration-200"/>
                                </button>
                              </div>

                              <div className={`text-xs opacity-70 ${
                                  message.isBot ? 'text-gray-500 dark:text-gray-400' : 'text-blue-100'
                              }`}>
                                {message.timestamp.toLocaleTimeString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                        )}

                        {/* Timestamp for user messages */}
                        {!message.isBot && (
                            <div className={`text-xs mt-1 opacity-70 ${
                                message.isBot ? 'text-gray-500 dark:text-gray-400' : 'text-blue-100'
                            }`}>
                              {message.timestamp.toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                        )}
                      </div>
                    </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                    <div className="flex items-start space-x-3">
                      <div
                          className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4"/>
                      </div>
                      <div
                          className="bg-white dark:bg-gray-700 rounded-lg px-4 py-2 border border-gray-200 dark:border-gray-600">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                               style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                               style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                )}

                <div ref={messagesEndRef}/>
              </div>
            </div>
        ) : (
            /* History Panel */
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Cuộc trò chuyện gần đây</h3>
                  <button
                      onClick={startNewChat}
                      className="px-3 py-1 text-xs bg-transparent text-blue-500 dark:text-blue-400 border border-blue-500/20 dark:border-blue-400/20 rounded-lg hover:bg-blue-500/10 dark:hover:bg-blue-400/20 hover:border-blue-500/40 dark:hover:border-blue-400/40 transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-sm"
                  >
                    Chat mới
                  </button>
                </div>

                {chatSessions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <History className="w-8 h-8 mx-auto mb-2 opacity-50"/>
                      <p className="text-sm">Chưa có lịch sử chat nào</p>
                      <button
                          onClick={startNewChat}
                          className="mt-2 px-3 py-1.5 bg-transparent text-blue-500 dark:text-blue-400 text-sm border border-blue-500/20 dark:border-blue-400/20 rounded-lg hover:bg-blue-500/10 dark:hover:bg-blue-400/20 hover:border-blue-500/40 dark:hover:border-blue-400/40 transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-sm"
                      >
                        Bắt đầu cuộc trò chuyện đầu tiên
                      </button>
                    </div>
                ) : (
                    chatSessions.map((session) => (
                        <div
                            key={session.id}
                            className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow cursor-pointer group"
                            onClick={() => loadChatSession(session)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                {session.title}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {session.messages.length - 1} tin nhắn
                                • {session.lastUpdated.toLocaleDateString('vi-VN')}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
                                {session.messages[session.messages.length - 1]?.text}
                              </p>
                            </div>
                            <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteChatSession(session.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 bg-transparent hover:bg-red-500/10 dark:hover:bg-red-400/20 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 backdrop-blur-sm hover:text-red-500 dark:hover:text-red-400"
                                aria-label="Xóa cuộc trò chuyện"
                            >
                              <Trash2 className="w-4 h-4 text-red-500"/>
                            </button>
                          </div>
                        </div>
                    ))
                )}
              </div>
            </div>
        )}

        {/* AI Suggestions - Only show in chat mode */}
        {viewMode === 'chat' && showSuggestions && messages.length <= 1 && (
            <div className="px-4 pb-2 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 pt-2">Gợi ý nhanh:</div>
              <div className="flex flex-wrap gap-1">
                {suggestions.slice(0, 4).map((suggestion, index) => (
                    <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs px-2 py-1 bg-transparent text-gray-600 dark:text-gray-400 border border-gray-200/60 dark:border-gray-600/60 rounded-lg hover:bg-gray-500/10 dark:hover:bg-gray-400/20 hover:text-gray-800 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-sm"
                    >
                      {suggestion}
                    </button>
                ))}
              </div>
            </div>
        )}

        {/* Enhanced AI Input - Only show in chat mode */}
        {viewMode === 'chat' && (
            <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              {/* Toolbar */}
              {showToolbar && (
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {/* Model Selection */}
                        <div className="relative">
                          <button
                              onClick={() => setShowModelDropdown(!showModelDropdown)}
                              className="flex items-center space-x-2 px-3 py-1 bg-transparent border border-gray-200/60 dark:border-gray-600/60 rounded-lg hover:bg-gray-500/10 dark:hover:bg-gray-400/20 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-300 text-sm hover:scale-105 active:scale-95 backdrop-blur-sm"
                          >
                            {(() => {
                              const model = aiModels.find(m => m.id === selectedModel);
                              const IconComponent = model?.icon || Brain;
                              return (
                                  <>
                                    <IconComponent className="w-4 h-4"/>
                                    <span>{model?.name || 'Select Model'}</span>
                                  </>
                              );
                            })()}
                          </button>

                          {showModelDropdown && (
                              <div
                                  className="absolute bottom-full left-0 mb-1 w-64 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50">
                                {aiModels.map((model) => {
                                  const IconComponent = model.icon;
                                  return (
                                      <button
                                          key={model.id}
                                          onClick={() => {
                                            setSelectedModel(model.id);
                                            setShowModelDropdown(false);
                                          }}
                                          className={`w-full flex items-start space-x-3 px-3 py-2 hover:bg-gray-500/10 dark:hover:bg-gray-400/20 transition-all duration-300 text-left rounded-lg hover:scale-105 active:scale-95 ${
                                              selectedModel === model.id ? 'bg-blue-500/10 dark:bg-blue-400/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 dark:border-blue-400/20 backdrop-blur-sm' : 'bg-transparent border border-transparent'
                                          }`}
                                      >
                                        <IconComponent className="w-5 h-5 mt-0.5 flex-shrink-0"/>
                                        <div>
                                          <div className="font-medium text-sm">{model.name}</div>
                                          <div
                                              className="text-xs text-gray-500 dark:text-gray-400">{model.description}</div>
                                        </div>
                                      </button>
                                  );
                                })}
                              </div>
                          )}
                        </div>

                        {/* Additional Tools */}
                        <button
                            className="p-1.5 bg-transparent hover:bg-gray-500/10 dark:hover:bg-gray-400/20 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 backdrop-blur-sm hover:text-gray-700 dark:hover:text-gray-300">
                          <Settings className="w-4 h-4 transition-transform duration-200 hover:rotate-45"/>
                        </button>
                      </div>

                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {isExpanded ? 'Cmd/Ctrl + Enter' : 'Enter'} để gửi
                      </div>
                    </div>
                  </div>
              )}

              {/* Compact Input Area */}
              <div className="px-3 py-2">
                <div className="flex items-center space-x-2">
                  {/* Compact Toolbar Toggle */}
                  <button
                      onClick={() => setShowToolbar(!showToolbar)}
                      className={`p-1.5 rounded-lg transition-all duration-300 flex-shrink-0 h-9 ${
                          showToolbar
                              ? 'bg-blue-500/10 dark:bg-blue-400/20 text-blue-600 dark:text-blue-400 backdrop-blur-sm'
                              : 'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-500/10 dark:hover:bg-gray-400/20 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                      aria-label="Toggle toolbar"
                  >
                    <Settings className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-45"/>
                  </button>

                  {/* Compact Inline Input */}
                  <div className="flex-1 relative">
                    <AIInput
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSubmit();
                        }}
                        className="border border-gray-200/60 dark:border-gray-600/60 rounded-lg shadow-sm hover:shadow-md focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400/60 transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm h-9 hover:bg-white dark:hover:bg-gray-800"
                    >
                      <div className="relative h-full">
                        <AIInputTextarea
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder={`Hỏi ${aiModels.find(m => m.id === selectedModel)?.name || 'AI'}...`}
                            disabled={isTyping}
                            minHeight={36}
                            maxHeight={isExpanded ? 100 : 64}
                            className="text-sm leading-4 py-1.5 pl-3 pr-10 placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none border-0 focus:ring-0 bg-transparent w-full h-full"
                        />

                        {/* Inline Send Button */}
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={!inputMessage.trim() || isTyping}
                            className={`absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all duration-300 h-7 w-7 flex items-center justify-center ${
                                !inputMessage.trim() || isTyping
                                    ? 'bg-transparent text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50'
                                    : 'bg-transparent text-blue-500 dark:text-blue-400 hover:bg-blue-500/10 dark:hover:bg-blue-400/20 hover:text-blue-600 dark:hover:text-blue-300 hover:scale-110 active:scale-95'
                            }`}
                            aria-label={isTyping ? "AI đang trả lời..." : "Gửi tin nhắn"}
                        >
                          {isTyping ? (
                              <div
                                  className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"/>
                          ) : (
                              <Send className="w-3.5 h-3.5 transition-transform duration-200"/>
                          )}
                        </button>
                      </div>
                    </AIInput>

                    {/* Character count overlay for long messages */}
                    {inputMessage.length > 100 && (
                        <div
                            className="absolute -top-4 right-0 text-xs text-orange-500 dark:text-orange-400 bg-white dark:bg-gray-800 px-1 rounded text-right">
                          {inputMessage.length}
                        </div>
                    )}
                  </div>
                </div>

                {/* Compact Helper Text - Only show when needed */}
                {(showToolbar || inputMessage.length > 100) && (
                    <div className="flex items-center justify-between mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                      <div className="flex items-center space-x-2">
                  <span className="flex items-center space-x-1">
                    {(() => {
                      const model = aiModels.find(m => m.id === selectedModel);
                      const IconComponent = model?.icon || Brain;
                      return (
                          <>
                            <IconComponent className="w-3 h-3"/>
                            <span>{model?.name}</span>
                          </>
                      );
                    })()}
                  </span>
                        {inputMessage.length > 100 && (
                            <span className="text-orange-500 dark:text-orange-400">
                      {inputMessage.length} chars
                    </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 opacity-70">
                        <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">
                          {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}↵
                        </kbd>
                      </div>
                    </div>
                )}
              </div>
            </div>
        )}
      </div>
  );
}