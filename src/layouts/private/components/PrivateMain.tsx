"use client";

import { ReactNode } from "react";
import { useTheme } from "@/layouts/hooks/useTheme";

interface PrivateMainProps {
  children: ReactNode;
}

export default function PrivateMain({ children }: PrivateMainProps) {
  const { theme } = useTheme();

<<<<<<< HEAD
    <main className="flex-1 overflow-auto">
=======
  return (
    <main
      className="flex-1 overflow-auto"
      style={{ backgroundColor: theme.background.primary }}
    >
>>>>>>> 7a61072f515649dd578722054c0df02cdb177acb
      <div className="max-w-full">{children}</div>
    </main>
  );
}
