"use client";

import React, { useState, useEffect, useRef } from "react";
import { backgroundColors } from "../types/color-bg.types";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";

interface ToggleBackgroundPanelProps {
  colors?: string[];
  defaultColor?: string;
  onClose?: () => void;
  onColorChange?: (color: string) => void;
}

export default function ToggleBackgroundPanel({
  colors = backgroundColors,
  defaultColor = "#ffffff",
  onClose,
  onColorChange,
}: ToggleBackgroundPanelProps) {
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleSelect = (color: string) => {
    setSelectedColor(color);
    onColorChange?.(color);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        onClose?.();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      className="fixed top-1 right-0 h-[220px] w-[360px] shadow-lg p-6 overflow-y-auto z-50 rounded-md"
      style={{ backgroundColor: theme.background.secondary }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3
          className="text-lg font-semibold"
          style={{ color: theme.text.primary }}
        >
          {t("customizeHome")}
        </h3>
        <button
          onClick={onClose}
          className="text-lg font-bold transition-colors"
          style={{ color: theme.text.secondary }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = theme.text.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = theme.text.secondary;
          }}
        >
          ×
        </button>
      </div>
      <p
        className="text-sm font-medium mb-2"
        style={{ color: theme.text.secondary }}
      >
        {t("background")}
      </p>
      <div className="grid grid-cols-6 gap-3 ">
        {colors.map((color) => (
          <div
            key={color}
            onClick={() => handleSelect(color)}
            className="w-10 h-10 rounded-full cursor-pointer border-2 transition-colors"
            style={{
              backgroundColor: color,
              borderColor:
                selectedColor === color
                  ? theme.text.primary
                  : theme.border.default,
            }}
          />
        ))}
      </div>
    </div>
  );
}
