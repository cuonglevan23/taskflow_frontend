/**
 * Sidebar Footer Component
 * Tách logic footer với role-based content
 */

import React from 'react';


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