/**
 * Sidebar Footer Component
 * Tách logic footer với role-based content
 */

import React from 'react';
import Link from 'next/link';
import { Crown, Shield, Settings, CreditCard } from 'lucide-react';
import { RBACGuard } from '@/components/guards/RBACGuard';
import { UserRole } from '@/constants/auth';

interface SidebarFooterProps {
  showLabels: boolean;
  rbac: any; // RBAC object from useRBAC hook
}

export default function SidebarFooter({ showLabels, rbac }: SidebarFooterProps) {
  return (
    <div className="">
    </div>
  );
}