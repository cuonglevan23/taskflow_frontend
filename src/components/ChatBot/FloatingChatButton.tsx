"use client";

import React from 'react';
import { MessageCircle, X } from 'lucide-react';

interface FloatingChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export default function FloatingChatButton({ isOpen, onClick, className = '' }: FloatingChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-6 right-6 z-50
        w-14 h-14 
        bg-gradient-to-r from-blue-500 to-purple-600 
        hover:from-blue-600 hover:to-purple-700
        text-white rounded-full shadow-lg 
        flex items-center justify-center
        transition-all duration-300 ease-in-out
        hover:scale-110 hover:shadow-xl
        focus:outline-none focus:ring-4 focus:ring-blue-300
        ${isOpen ? 'rotate-180' : 'rotate-0'}
        ${className}
      `}
      aria-label={isOpen ? "Đóng chat" : "Mở chat"}
    >
      <div className="relative">
        {isOpen ? (
          <X className="w-6 h-6 transition-transform duration-200" />
        ) : (
          <MessageCircle className="w-6 h-6 transition-transform duration-200" />
        )}
        
        {/* Notification dot (có thể bật/tắt khi có tin nhắn mới) */}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        )}
      </div>
    </button>
  );
}