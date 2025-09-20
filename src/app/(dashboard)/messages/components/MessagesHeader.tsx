import React from 'react';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";


export const MessagesHeader = () => {
  // Theme and Language Context
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  return (
    <div
      className="flex-shrink-0 border-b px-6 py-4"
      style={{
        backgroundColor: theme.header.background,
        borderColor: theme.border.default
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold" style={{ color: theme.text.primary }}>
              {messages?.chat?.title || 'Messages'}
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesHeader;
