"use client";

import { ReactNode } from "react";

interface PrivateMainProps {
  children: ReactNode;
}

export default function PrivateMain({ children }: PrivateMainProps) {
  return (
    <main className="flex-1 overflow-auto bg-gray-50">
      <div className="p-4">{children}</div>
    </main>
  );
}
