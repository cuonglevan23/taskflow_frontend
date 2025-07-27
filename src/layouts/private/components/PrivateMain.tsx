"use client";

import { ReactNode } from "react";

interface PrivateMainProps {
  children: ReactNode;
}

export default function PrivateMain({ children }: PrivateMainProps) {
  return (
<<<<<<< HEAD
    <main className="flex-1 overflow-auto bg-gray-50">
      <div className="p-4">{children}</div>
=======
    <main className="flex-1 overflow-auto ">
      <div className="max-w-full">{children}</div>
>>>>>>> origin/alien
    </main>
  );
}
