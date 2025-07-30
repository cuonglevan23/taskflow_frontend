"use client";

import { ReactNode } from "react";

interface PrivateMainProps {
  children: ReactNode;
}

export default function PrivateMain({ children }: PrivateMainProps) {
  return (
    <main className="flex-1 overflow-auto">
      <div className="max-w-full p-5">{children}</div>
    </main>
  );
}
