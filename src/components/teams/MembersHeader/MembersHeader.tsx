"use client";

import React from "react";
import { Button } from "@/components/ui";
import { DARK_THEME } from "@/constants/theme";

export interface MembersHeaderProps {
  onAddMember: () => void;
  onSendFeedback?: () => void;
  onSearch?: () => void;
}

export default function MembersHeader({ 
  onAddMember, 
  onSendFeedback,
  onSearch 
}: MembersHeaderProps) {
  return (
    <div className="flex items-center justify-between p-6">
      {/* Left side - Add Member Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={onAddMember}
          className="flex items-center gap-2 px-4 py-2 rounded-md font-medium bg-gray-800 hover:bg-gray-700 text-white border-gray-600"
        >
          <span className="text-sm">+</span>
          <span>Add member</span>
        </Button>
      </div>

    
    </div>
  );
}