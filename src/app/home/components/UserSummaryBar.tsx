"use client";

import React, { useState } from "react";
import { Check, ChevronDown, Users } from "lucide-react";

const options = ["My week", "My month"];

export default function UserSummaryBar() {
  const [selected, setSelected] = useState("My week");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const completedTasks = 0;
  const collaborators = 0;

  return (
    <div className="flex items-center justify-center mt-4">
      <div className="bg-white shadow px-6 py-3 rounded-full flex items-center space-x-6 relative">
        {/* Dropdown */}
        <div className="relative">
          <button
            className="flex items-center text-sm font-medium text-gray-700"
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            {selected} <ChevronDown className="w-4 h-4 ml-1" />
          </button>
          {dropdownOpen && (
            <div className="absolute mt-2 w-32 bg-white rounded shadow z-10">
              {options.map((option) => (
                <div
                  key={option}
                  onClick={() => {
                    setSelected(option);
                    setDropdownOpen(false);
                  }}
                  className={`px-3 py-2 cursor-pointer text-sm hover:bg-gray-100 ${
                    option === selected ? "bg-gray-100 font-medium border-l-2 border-blue-500" : ""
                  }`}
                >
                  {option === selected && <Check className="w-4 h-4 inline mr-1 text-blue-500" />}
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-300" />

        {/* Task count */}
        <div className="text-sm text-gray-700">
          <Check className="inline w-4 h-4 mr-1" />
          <span className="font-semibold">{completedTasks}</span> tasks completed
        </div>

        {/* Collaborator count */}
        <div className="text-sm text-gray-700">
          <Users className="inline w-4 h-4 mr-1" />
          <span className="font-semibold">{collaborators}</span> collaborators
        </div>
      </div>
    </div>
  );
}
