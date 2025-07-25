"use client";

import { ReactNode } from "react";
import PublicLayout from "./public/PublicLayout";
import PrivateLayout from "./private/PrivateLayout";

interface RoleBasedLayoutProps {
  children: ReactNode;
  layoutType?: "public" | "private";
}

export default function RoleBasedLayout({
  children,
  layoutType = "public",
}: RoleBasedLayoutProps) {
  // For now, use layoutType prop to determine which layout to show
  // Later this can be replaced with actual authentication logic

  if (layoutType === "private") {
    return <PrivateLayout>{children}</PrivateLayout>;
  }

  return <PublicLayout>{children}</PublicLayout>;
}
