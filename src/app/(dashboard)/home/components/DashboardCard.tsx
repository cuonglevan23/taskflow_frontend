"use client";

import React, { ReactNode, useState } from "react";
import { MoreHorizontal, ChevronDown, Check } from "lucide-react";
import { useTheme } from "@/layouts/hooks/useTheme";

interface CardProps {
  title: string;
  dropdownItems?: string[];
  menuCardItems?: string[];
  children?: ReactNode;
}

export default function DashboardCard({
  title,
  dropdownItems,
  menuCardItems,
  children,
}: CardProps) {
  const { theme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDropdown, setSelectedDropdown] = useState(
    dropdownItems?.[0] || ""
  );
  const [activeTab, setActiveTab] = useState(menuCardItems?.[0] || "");

  return (
    <div
      className="rounded-lg shadow p-4 min-h-[400px]"
      style={{ backgroundColor: theme.background.secondary }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <h2
            className="text-lg font-semibold"
            style={{ color: theme.text.primary }}
          >
            {title}
          </h2>
          {dropdownItems && dropdownItems.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowDropdown((prev) => !prev)}
                className="flex items-center text-sm px-2 py-1 rounded transition-colors"
                style={{
                  color: theme.text.secondary,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = theme.text.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = theme.text.secondary;
                }}
              >
                {selectedDropdown}
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
              {showDropdown && (
                <ul
                  className="absolute mt-1 shadow text-sm z-10"
                  style={{ backgroundColor: theme.background.primary }}
                >
                  {dropdownItems.map((item, index) => (
                    <li
                      key={index}
                      onClick={() => {
                        setSelectedDropdown(item);
                        setShowDropdown(false);
                      }}
                      className="px-4 py-2 cursor-pointer whitespace-nowrap flex items-center gap-2 transition-colors"
                      style={{
                        backgroundColor:
                          selectedDropdown === item
                            ? theme.background.secondary
                            : "transparent",
                        color: theme.text.primary,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          theme.background.secondary;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          selectedDropdown === item
                            ? theme.background.secondary
                            : "transparent";
                      }}
                    >
                      <span className="w-5">
                        {selectedDropdown === item && (
                          <Check
                            className="w-4 h-4"
                            style={{ color: theme.button.primary.background }}
                          />
                        )}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <MoreHorizontal
          className="w-5 h-5"
          style={{ color: theme.text.secondary }}
        />
      </div>

      {/* Menu Card Tabs */}
      {menuCardItems && menuCardItems.length > 0 && (
        <div
          className="flex space-x-4 border-b text-sm"
          style={{
            borderColor: theme.border.default,
            color: theme.text.secondary,
          }}
        >
          {menuCardItems.map((item) => (
            <button
              key={item}
              className="pb-1 transition-colors"
              style={{
                borderBottom:
                  activeTab === item
                    ? `2px solid ${theme.text.primary}`
                    : "none",
                color:
                  activeTab === item
                    ? theme.text.primary
                    : theme.text.secondary,
                fontWeight: activeTab === item ? "500" : "normal",
              }}
              onClick={() => setActiveTab(item)}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {/* Content area*/}
      <div
        className="mt-4 text-sm italic"
        style={{ color: theme.text.secondary }}
      >
        {children}
      </div>
    </div>
  );
}
