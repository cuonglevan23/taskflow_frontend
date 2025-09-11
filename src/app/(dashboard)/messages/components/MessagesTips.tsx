import React from 'react';
import { DARK_THEME, THEME_COLORS } from '@/constants/theme';

interface TipItem {
  icon: React.ReactNode;
  text: string;
  color: string;
}

interface MessagesTipsProps {
  customTips?: TipItem[];
}

export const MessagesTips = ({ customTips }: MessagesTipsProps) => {
  const defaultTips: TipItem[] = [
    {
      icon: (
        <svg className="w-4 h-4 mr-2" style={{ color: THEME_COLORS.info[500] }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      text: "Real-time messaging",
      color: THEME_COLORS.info[500]
    },
    {
      icon: (
        <svg className="w-4 h-4 mr-2" style={{ color: THEME_COLORS.success[500] }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      text: "Secure & private",
      color: THEME_COLORS.success[500]
    },
    {
      icon: (
        <svg className="w-4 h-4 mr-2" style={{ color: '#8b5cf6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-2-2V10a2 2 0 012-2h8z" />
        </svg>
      ),
      text: "File sharing",
      color: '#8b5cf6'
    }
  ];

  const tips = customTips || defaultTips;

  return (
    <div
      className="flex-shrink-0 border-t px-6 py-4"
      style={{
        backgroundColor: DARK_THEME.header.background,
        borderColor: DARK_THEME.border.default
      }}
    >
      <div className="flex items-center justify-center space-x-8 text-sm">
        {tips.map((tip, index) => (
          <div key={index} className="flex items-center" style={{ color: DARK_THEME.text.muted }}>
            {tip.icon}
            {tip.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessagesTips;
