"use client";

import { ReactNode } from "react";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";

interface PrivateMainProps {
  children: ReactNode;
}

export default function PrivateMain({ children }: PrivateMainProps) {
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  return (
    <main
      className="flex-1 overflow-auto"
      style={{ backgroundColor: theme.background.primary }}
    >
      <div className="max-w-full">{children}</div>
    </main>
  );
}
