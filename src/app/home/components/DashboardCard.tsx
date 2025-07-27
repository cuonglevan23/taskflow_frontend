"use client";

import React, { ReactNode, useState } from "react";
import { MoreHorizontal, ChevronDown, Check } from "lucide-react";

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
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDropdown, setSelectedDropdown] = useState(
    dropdownItems?.[0] || ""
  );
  const [activeTab, setActiveTab] = useState(menuCardItems?.[0] || "");

  return (
    <div className="bg-white rounded-lg shadow p-4 min-h-[400px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          {dropdownItems && dropdownItems.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowDropdown((prev) => !prev)}
                className="flex items-center text-sm text-gray-600 hover:text-black px-2 py-1 rounded"
              >
                {selectedDropdown}
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
              {showDropdown && (
                <ul className="absolute mt-1 bg-white shadow text-sm z-10">
                  {dropdownItems.map((item, index) => (
                    <li
                      key={index}
                      onClick={() => {
                        setSelectedDropdown(item);
                        setShowDropdown(false);
                      }}
                      className={`px-4 py-2 cursor-pointer whitespace-nowrap hover:bg-gray-100 flex items-center gap-2 ${
                        selectedDropdown === item ? "bg-gray-100" : ""
                      }`}
                    >
                      <span className="w-5">
                        {selectedDropdown === item && (
                          <Check className="w-4 h-4 text-blue-500" />
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

        <MoreHorizontal className="w-5 h-5 text-gray-500" />
      </div>

      {/* Menu Card Tabs */}
      {menuCardItems && menuCardItems.length > 0 && (
        <div className="flex space-x-4 border-b text-sm text-gray-600">
          {menuCardItems.map((item) => (
            <button
              key={item}
              className={`pb-1 ${
                activeTab === item
                  ? "border-b-2 border-gray-700 text-black font-medium"
                  : ""
              }`}
              onClick={() => setActiveTab(item)}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {/* Content area*/}
      <div className="mt-4 text-sm text-gray-500 italic">{children}</div>
    </div>
  );
}
