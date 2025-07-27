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
            <ul className="absolute mt-2 w-32 bg-white rounded shadow z-10">
              {options.map((option) => (
                <li
                  key={option}
                  onClick={() => {
                    setSelected(option);
                    setDropdownOpen(false);
                  }}
                  className={`px-3 py-2 cursor-pointer text-sm hover:bg-gray-100 whitespace-nowrap flex items-center justify-between ${
                    option === selected ? "bg-gray-100" : ""
                  }`}
                >
                  <span className="w-4 mr-2 flex justify-center">
                    {selected === option && (
                      <Check className="w-4 h-4 text-blue-500" />
                    )}
                  </span>
                  <span className="flex-1 text-left">{option}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-300" />

        {/* Task count */}
        <div className="text-sm text-gray-700">
          <Check className="inline w-4 h-4 mr-1" />
          <span className="font-semibold">{completedTasks}</span> tasks
          completed
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
