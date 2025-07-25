"use client";

import { PublicLayoutProps } from "../types";
import PublicHeader from "./components/PublicHeader";
import PublicFooter from "./components/PublicFooter";

export default function PublicLayout({
  children,
  showHeader = true,
  showFooter = true,
  headerVariant = "default",
  className = "",
}: PublicLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      {showHeader && <PublicHeader variant={headerVariant} />}

      <main className="flex-1">{children}</main>

      {showFooter && <PublicFooter />}
    </div>
  );
}
