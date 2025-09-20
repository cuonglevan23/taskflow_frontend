"use client";

import { ReactNode } from "react";
import PrivateLayout from "@/layouts/private/PrivateLayout";

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Dashboard layout - Pure layout wrapper without authentication
 * Authentication is handled by Root Layout (AuthProvider)
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // No authentication check needed - handled by AuthProvider in root layout
  return <PrivateLayout>{children}</PrivateLayout>;
}
