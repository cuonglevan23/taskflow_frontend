"use client";

import React, { useState } from "react";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { X } from "lucide-react";
import ProfileSettingsTab from "./ProfileSettingsTab";
import DisplaySettingsTab from "./DisplaySettingsTab";
import { Z_INDEX } from "@/styles/z-index";

// Settings Tab Types
type SettingsTab = "profile" | "display";

interface SettingsContainerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function SettingsContainer({
  isOpen = true,
  onClose
}: SettingsContainerProps) {
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  // Helper function to get translated text
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const tabs = [
    { id: "profile", label: t("settings.profile") || "Profile" },
    { id: "display", label: t("settings.display") || "Display" },
  ] as const;

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSettingsTab />;
      case "display":
        return <DisplaySettingsTab />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: Z_INDEX.modal }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(66, 66, 68, 0.4)' }}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-6xl h-[90vh] mx-4 rounded-xl shadow-2xl flex overflow-hidden"
        style={{
          backgroundColor: theme.background.primary,
          zIndex: Z_INDEX.popover
        }}
      >
        {/* Header */}
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-between p-6 border-b"
          style={{
            backgroundColor: theme.background.primary,
            borderBottomColor: theme.border.default,
            zIndex: 10
          }}
        >
          <h1
            className="text-xl font-semibold"
            style={{ color: theme.text.primary }}
          >
            {t("settings.title") || "Settings"}
          </h1>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: theme.text.secondary }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.background.secondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex w-full pt-20">
          {/* Navigation Tabs */}
          <div
            className="w-64 border-r p-6 overflow-y-auto"
            style={{ borderRightColor: theme.border.default }}
          >
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id ? 'font-medium' : ''
                  }`}
                  style={{
                    backgroundColor: activeTab === tab.id ? theme.background.secondary : 'transparent',
                    color: activeTab === tab.id ? theme.text.primary : theme.text.secondary,
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Tab Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
