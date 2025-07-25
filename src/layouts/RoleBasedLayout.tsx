"use client";

import PublicLayout from "./public/PublicLayout";
import PrivateLayout from "./private/PrivateLayout";

interface RoleBasedLayoutProps {
  children: React.ReactNode;
  layoutType?: "public" | "private";
}

export default function RoleBasedLayout({
  children,
  layoutType = "public",
}: RoleBasedLayoutProps) {
  if (layoutType === "private") {
    return <PrivateLayout>{children}</PrivateLayout>;
  }

  return <PublicLayout>{children}</PublicLayout>;
}
