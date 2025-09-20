"use client";

import PrivateLayoutContent from "./components/PrivateLayoutContent";

interface PrivateLayoutProps {
  children: React.ReactNode;
}

export default function PrivateLayout({ children }: PrivateLayoutProps) {
  // ✅ FIX: Loại bỏ PrivateLayoutProvider không cần thiết
  // AuthProvider đã có trong root layout, không cần provider thêm
  return <PrivateLayoutContent>{children}</PrivateLayoutContent>;
}
