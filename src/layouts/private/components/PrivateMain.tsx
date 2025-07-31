"use client";

import { ReactNode } from "react";
import { useTheme } from "@/layouts/hooks/useTheme";

interface PrivateMainProps {
  children: ReactNode;
}

export default function PrivateMain({ children }: PrivateMainProps) {
  const { theme } = useTheme();


  return (
    <main
      className="flex-1 overflow-auto"
      style={{ backgroundColor: theme.background.primary }}
    >
      <div className="max-w-full">{children}</div>
    </main>
  );
}
