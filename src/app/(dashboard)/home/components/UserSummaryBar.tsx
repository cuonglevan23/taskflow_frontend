"use client";

import React, { useState } from "react";
import { Check, ChevronDown, Users } from "lucide-react";
import { useTheme } from "@/layouts/hooks/useTheme";

const options = ["My week", "My month"];

export default function UserSummaryBar() {
  const { theme } = useTheme();
  const [selected, setSelected] = useState("My week");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const completedTasks = 0;
  const collaborators = 0;

  return (
    <div className="flex items-center justify-center mt-4">
      <div
        className="shadow px-6 py-3 rounded-full flex items-center space-x-6 relative"
        style={{ backgroundColor: theme.background.secondary }}
      >
        {/* Dropdown */}
        <div className="relative">
          <button
            className="flex items-center text-sm font-medium"
            style={{ color: theme.text.primary }}
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            {selected} <ChevronDown className="w-4 h-4 ml-1" />
          </button>
          {dropdownOpen && (
            <ul
              className="absolute mt-2 w-32 rounded shadow z-10"
              style={{ backgroundColor: theme.background.primary }}
            >
              {options.map((option) => (
                <li
                  key={option}
                  onClick={() => {
                    setSelected(option);
                    setDropdownOpen(false);
                  }}
                  className="px-3 py-2 cursor-pointer text-sm whitespace-nowrap flex items-center justify-between transition-colors"
                  style={{
                    backgroundColor:
                      option === selected
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
                      option === selected
                        ? theme.background.secondary
                        : "transparent";
                  }}
                >
                  <span className="w-4 mr-2 flex justify-center">
                    {selected === option && (
                      <Check
                        className="w-4 h-4"
                        style={{ color: theme.button.primary.background }}
                      />
                    )}
                  </span>
                  <span className="flex-1 text-left">{option}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Divider */}
        <div
          className="w-px h-5"
          style={{ backgroundColor: theme.border.default }}
        />

        {/* Task count */}
        <div className="text-sm" style={{ color: theme.text.primary }}>
          <Check className="inline w-4 h-4 mr-1" />
          <span className="font-semibold">{completedTasks}</span> tasks
          completed
        </div>

        {/* Collaborator count */}
        <div className="text-sm" style={{ color: theme.text.primary }}>
          <Users className="inline w-4 h-4 mr-1" />
          <span className="font-semibold">{collaborators}</span> collaborators
        </div>
      </div>
    </div>
  );
}
