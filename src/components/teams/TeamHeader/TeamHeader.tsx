"use client";

import React, { useState } from "react";
import { USER_ICONS, ACTION_ICONS } from "@/constants/icons";
import { DARK_THEME } from "@/constants/theme";

interface TeamHeaderProps {
  teamId: string;
  teamName?: string;
  description?: string;
  coverImageUrl?: string;
  onDescriptionChange?: (description: string) => void;
  onCreateWork?: () => void;
}

const TeamHeader = ({ 
  teamId, 
  teamName = "My workspace",
  description: initialDescription = "Click to add team description...",
  coverImageUrl,
  onDescriptionChange,
  onCreateWork
}: TeamHeaderProps) => {
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState(initialDescription);

  const handleDescriptionSave = () => {
    setIsEditingDescription(false);
    onDescriptionChange?.(description);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleDescriptionSave();
    if (e.key === 'Escape') {
      setDescription(initialDescription);
      setIsEditingDescription(false);
    }
  };

  return (
    <div className="relative">
      {/* Cover Image Background - Clean without avatar */}
      <div 
        className="h-32 w-full relative overflow-hidden"
        style={{
          backgroundImage: coverImageUrl 
            ? `url(${coverImageUrl})` 
            : `linear-gradient(135deg, #4F8A8B 0%, #5A9A8B 100%)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/10"></div>
      </div>
    </div>
  );
};

export default TeamHeader;