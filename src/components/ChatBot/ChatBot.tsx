"use client";

import React, { useState } from 'react';
import FloatingChatButton from './FloatingChatButton';
import ChatPanel from './ChatPanel';

interface ChatBotProps {
  className?: string;
}

export default function ChatBot({ className = '' }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  return (
    <div className={`${className}`}>
      {/* Floating Chat Button */}
      <FloatingChatButton 
        isOpen={isOpen} 
        onClick={toggleChat}
      />
      
      {/* Chat Panel */}
      <ChatPanel 
        isOpen={isOpen} 
        onClose={closeChat}
      />
    </div>
  );
}