"use client";

import React from "react";
import { Check } from "lucide-react";
import { THEME_COLORS } from "@/constants/theme";

interface SelectionBadgeProps {
  isSelected: boolean;
  className?: string;
}

const SelectionBadge = ({
  isSelected,
  className = ""
}: SelectionBadgeProps) => {
  if (!isSelected) return null;
  
  return (
    <div 
      className={`absolute top-0 right-0 w-6 h-6 flex items-center justify-center rounded-bl-md ${className}`}
      style={{ backgroundColor: THEME_COLORS.info[500] }}
    >
      <Check size={14} className="text-white" />
    </div>
  );
};

export default SelectionBadge;
