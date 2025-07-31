"use client";

import { ReactNode } from "react";

interface PrivateMainProps {
  children: ReactNode;
}

export default function PrivateMain({ children }: PrivateMainProps) {
<<<<<<< HEAD
  return (
    <main className="flex-1 overflow-auto">
      <div className="max-w-full p-5">{children}</div>
=======
  const { theme } = useTheme();

  return (
    <main
      className="flex-1 overflow-auto"
      // style={{ backgroundColor: theme.background.primary }}
    >
      <div className="max-w-full">{children}</div>
>>>>>>> origin/anhduc
    </main>
  );
}
