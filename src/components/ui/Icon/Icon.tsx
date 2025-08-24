"use client";

import React from "react";
import {
  CheckSquare,
  Folder,
  MessageSquare,
  Users,
  Briefcase,
  Target,
  UserPlus,
  Check,
  AlertTriangle,
  XCircle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ICON_COLORS } from "@/constants/icons";

// Icon Size Type
export type IconSize = "xs" | "sm" | "md" | "lg" | "xl";

const iconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

// Base Icon Props
interface BaseIconProps {
  size?: IconSize;
  className?: string;
  strokeWidth?: number;
}

// Predefined Icon Components
export function TaskIcon({
  size = "md",
  className,
  strokeWidth = 2,
}: BaseIconProps) {
  return (
    <CheckSquare
      size={iconSizes[size]}
      strokeWidth={strokeWidth}
      className={cn("inline-block", className)}
      style={{ color: ICON_COLORS.task }}
    />
  );
}

export function ProjectIcon({
  size = "md",
  className,
  strokeWidth = 2,
}: BaseIconProps) {
  return (
    <Folder
      size={iconSizes[size]}
      strokeWidth={strokeWidth}
      className={cn("inline-block", className)}
      style={{ color: ICON_COLORS.project }}
    />
  );
}

export function MessageIcon({
  size = "md",
  className,
  strokeWidth = 2,
}: BaseIconProps) {
  return (
    <MessageSquare
      size={iconSizes[size]}
      strokeWidth={strokeWidth}
      className={cn("inline-block", className)}
      style={{ color: ICON_COLORS.message }}
    />
  );
}

export function TeamIcon({
  size = "md",
  className,
  strokeWidth = 2,
}: BaseIconProps) {
  return (
    <Users
      size={iconSizes[size]}
      strokeWidth={strokeWidth}
      className={cn("inline-block", className)}
      style={{ color: ICON_COLORS.team }}
    />
  );
}

export function GoalIcon({
  size = "md",
  className,
  strokeWidth = 2,
}: BaseIconProps) {
  return (
    <Target
      size={iconSizes[size]}
      strokeWidth={strokeWidth}
      className={cn("inline-block", className)}
      style={{ color: ICON_COLORS.goal }}
    />
  );
}

export function InviteIcon({
  size = "md",
  className,
  strokeWidth = 2,
}: BaseIconProps) {
  return (
    <UserPlus
      size={iconSizes[size]}
      strokeWidth={strokeWidth}
      className={cn("inline-block", className)}
      style={{ color: ICON_COLORS.invite }}
    />
  );
}

// Status Icons
export function SuccessIcon({
  size = "md",
  className,
  strokeWidth = 2,
}: BaseIconProps) {
  return (
    <Check
      size={iconSizes[size]}
      strokeWidth={strokeWidth}
      className={cn("inline-block", className)}
      style={{ color: ICON_COLORS.success }}
    />
  );
}

export function WarningIcon({
  size = "md",
  className,
  strokeWidth = 2,
}: BaseIconProps) {
  return (
    <AlertTriangle
      size={iconSizes[size]}
      strokeWidth={strokeWidth}
      className={cn("inline-block", className)}
      style={{ color: ICON_COLORS.warning }}
    />
  );
}

export function ErrorIcon({
  size = "md",
  className,
  strokeWidth = 2,
}: BaseIconProps) {
  return (
    <XCircle
      size={iconSizes[size]}
      strokeWidth={strokeWidth}
      className={cn("inline-block", className)}
      style={{ color: ICON_COLORS.error }}
    />
  );
}

export function InfoIcon({
  size = "md",
  className,
  strokeWidth = 2,
}: BaseIconProps) {
  return (
    <Info
      size={iconSizes[size]}
      strokeWidth={strokeWidth}
      className={cn("inline-block", className)}
      style={{ color: ICON_COLORS.info }}
    />
  );
}

// Export types
export type { BaseIconProps };
