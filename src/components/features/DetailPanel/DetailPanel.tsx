"use client";

import React from "react";
import { X } from "lucide-react";
import { useTheme } from "@/layouts/hooks/useTheme";
import { useDetailPanel } from "@/contexts/DetailPanelContext";
import { NotificationDetailData, TaskDetailData } from "@/types/detail-panel";

interface DetailPanelProps {
  className?: string;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ className = "" }) => {
  const { isOpen, data, closePanel } = useDetailPanel();
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-y-0 right-0 w-[600px] transform transition-transform duration-300 ease-in-out shadow-2xl ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } ${className}`}
      style={{
        backgroundColor: theme.background.primary,
        borderLeft: `1px solid ${theme.border.default}`,
      }}
    >
      {/* Header */}
      <div
        className="h-16 flex items-center justify-between px-6 border-b"
        style={{ borderColor: theme.border.default }}
      >
        <h2
          className="text-lg font-semibold"
          style={{ color: theme.text.primary }}
        >
          {data?.title || "Details"}
        </h2>
        <button
          onClick={closePanel}
          className="p-2 rounded-lg transition-colors hover:opacity-80"
          style={{ color: theme.text.secondary }}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 h-[calc(100vh-64px)] overflow-y-auto">
        {/* Render different content based on data type */}
        {data?.type === "notification" && <NotificationDetail data={data} />}
        {data?.type === "task" && <TaskDetail data={data} />}
        {/* Add more content types as needed */}
      </div>
    </div>
  );
};

// Notification Detail Component
const NotificationDetail: React.FC<{ data: NotificationDetailData }> = ({
  data,
}) => {
  const { theme } = useTheme();

  return (
    <div>
      <div className="text-sm mb-4" style={{ color: theme.text.secondary }}>
        {data.time}
      </div>
      <div className="text-base" style={{ color: theme.text.primary }}>
        {data.content}
      </div>
    </div>
  );
};

// Task Detail Component
const TaskDetail: React.FC<{ data: TaskDetailData }> = ({ data }) => {
  const { theme } = useTheme();

  return (
    <div className="space-y-6">
      {/* Status and Priority */}
      <div className="flex items-center gap-4">
        <div
          className="px-3 py-1 rounded-full text-sm"
          style={{
            backgroundColor: theme.button.primary.background + "20",
            color: theme.button.primary.background,
          }}
        >
          {data.status}
        </div>
        <div
          className="px-3 py-1 rounded-full text-sm"
          style={{
            backgroundColor: theme.background.secondary,
            color: theme.text.secondary,
          }}
        >
          {data.priority}
        </div>
      </div>

      {/* Due Date */}
      <div>
        <div className="text-sm mb-1" style={{ color: theme.text.secondary }}>
          Due Date
        </div>
        <div className="text-base" style={{ color: theme.text.primary }}>
          {data.dueDate}
        </div>
      </div>

      {/* Description */}
      <div>
        <div className="text-sm mb-1" style={{ color: theme.text.secondary }}>
          Description
        </div>
        <div className="text-base" style={{ color: theme.text.primary }}>
          {data.description || "No description"}
        </div>
      </div>
    </div>
  );
};

export default DetailPanel;
