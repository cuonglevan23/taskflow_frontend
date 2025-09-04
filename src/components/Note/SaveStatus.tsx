"use client";

import { DARK_THEME } from '@/constants/theme';

interface SaveStatusProps {
  isSaving: boolean;
  lastSaved: Date | null;
  formatLastSaved: () => string;
}

export default function SaveStatus({ isSaving, lastSaved, formatLastSaved }: SaveStatusProps) {
  return (
    <div className="text-sm" style={{ color: DARK_THEME.text.muted }}>
      {isSaving ? (
        <span className="flex items-center space-x-1">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span>Saving</span>
        </span>
      ) : lastSaved ? (
        <span>Saved • {formatLastSaved()}</span>
      ) : (
        <span>Ready to save</span>
      )}
    </div>
  );
}
