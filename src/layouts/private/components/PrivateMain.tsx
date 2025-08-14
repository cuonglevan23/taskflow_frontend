"use client";

import { ReactNode } from "react";
import { DARK_THEME } from "@/constants/theme";

interface PrivateMainProps {
  children: ReactNode;
}

export default function PrivateMain({ children }: PrivateMainProps) {
  return (
    <main
      className="flex-1 overflow-auto"
      style={{ backgroundColor: DARK_THEME.background.primary }}
    >
      <div className="max-w-full">{children}</div>
    </main>
  );
}
