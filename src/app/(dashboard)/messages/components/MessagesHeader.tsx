import React from 'react';
import { DARK_THEME} from '@/constants/theme';


export const MessagesHeader = () => {
  return (
    <div
      className="flex-shrink-0 border-b px-6 py-4"
      style={{
        backgroundColor: DARK_THEME.header.background,
        borderColor: DARK_THEME.border.default
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold" style={{ color: DARK_THEME.text.primary }}>
              Messages
            </h1>

          </div>

        </div>
      </div>
    </div>
  );
};

export default MessagesHeader;
