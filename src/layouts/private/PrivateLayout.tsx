"use client";

import { PrivateLayoutProvider } from "./context/PrivateLayoutContext";
import PrivateLayoutContent from "./components/PrivateLayoutContent";

interface PrivateLayoutProps {
  children: React.ReactNode;
}

export default function PrivateLayout({ children }: PrivateLayoutProps) {
  return (
    <PrivateLayoutProvider>
      <PrivateLayoutContent>{children}</PrivateLayoutContent>
    </PrivateLayoutProvider>
  );
}
