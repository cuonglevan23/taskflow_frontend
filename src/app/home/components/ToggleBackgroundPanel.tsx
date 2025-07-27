"use client";

import React, { useState, useEffect, useRef } from "react";
import { backgroundColors } from "../types/color-bg.types";

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
      className="fixed top-1 right-0 h-[220px] w-[360px] bg-white shadow-lg p-6 overflow-y-auto z-50 rounded-md"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Customize home</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-black text-lg font-bold"
        >
          ×
        </button>
      </div>
      <p className="text-sm font-medium text-gray-700 mb-2">Background</p>
      <div className="grid grid-cols-6 gap-3 ">
        {colors.map((color) => (
          <div
            key={color}
            onClick={() => handleSelect(color)}
            className={`w-10 h-10 rounded-full cursor-pointer border-1 ${
              selectedColor === color ? "border-black" : "border border-gray-300"
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
}
