import React from 'react';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";

interface TipItem {
  icon: React.ReactNode;
  text: string;
  color: string;
}

interface MessagesTipsProps {
  customTips?: TipItem[];
}

export const MessagesTips = ({ customTips }: MessagesTipsProps) => {
  // Theme and Language Context
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  const defaultTips: TipItem[] = [
    {
      icon: (
        <svg className="w-4 h-4 mr-2" style={{ color: theme.status.info }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      text: messages?.chat?.tips?.realTime || "Real-time messaging",
      color: theme.status.info
    },
    {
      icon: (
        <svg className="w-4 h-4 mr-2" style={{ color: theme.status.success }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      text: messages?.chat?.tips?.secure || "Secure & private",
      color: theme.status.success
    },
    {
      icon: (
        <svg className="w-4 h-4 mr-2" style={{ color: theme.status.info }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-2-2V10a2 2 0 012-2h8z" />
        </svg>
      ),
      text: messages?.chat?.tips?.fileSharing || "File sharing",
      color: theme.status.info
    }
  ];

  const tips = customTips || defaultTips;

  return (
    <div
      className="flex-shrink-0 border-t px-6 py-4"
      style={{
        backgroundColor: theme.header.background,
        borderColor: theme.border.default
      }}
    >
      <div className="flex items-center justify-center space-x-8 text-sm">
        {tips.map((tip, index) => (
          <div key={index} className="flex items-center" style={{ color: theme.text.muted }}>
            {tip.icon}
            {tip.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessagesTips;
