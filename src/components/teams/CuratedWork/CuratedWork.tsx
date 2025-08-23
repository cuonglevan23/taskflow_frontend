"use client";

import React from "react";
import { FILE_ICONS, LAYOUT_ICONS, ACTION_ICONS } from "@/constants/icons";
import { DARK_THEME } from "@/constants/theme";

export interface WorkItem {
  id: string;
  type: "file" | "project" | "placeholder";
  name: string;
  fileType?: string;
  onClick?: () => void;
}

export interface WorkSection {
  id: string;
  title: string;
  items: WorkItem[];
}

interface CuratedWorkProps {
  sections?: WorkSection[];
  onViewAllWork?: () => void;
  onItemClick?: (item: WorkItem) => void;
  onAddSection?: () => void;
}

const defaultSections: WorkSection[] = [
  {
    id: "1",
    title: "ảnh dùng cho team",
    items: [
      {
        id: "1",
        type: "file",
        name: "Ảnh màn hình 2025-08-21 lúc 11.19.20.png",
        fileType: "PNG"
      }
    ]
  },
  {
    id: "2", 
    title: "link làm việc",
    items: [
      {
        id: "1",
        type: "placeholder",
        name: "Add important work for your team"
      }
    ]
  },
  {
    id: "3",
    title: "Untitled section",
    items: [
      {
        id: "1",
        type: "project",
        name: "các projects"
      }
    ]
  }
];

const WorkItemComponent = ({ item, onClick }: { item: WorkItem; onClick?: (item: WorkItem) => void }) => {
  const getIcon = () => {
    switch (item.type) {
      case 'file':
        return <FILE_ICONS.document className="w-5 h-5 text-gray-400" />;
      case 'project':
        return <LAYOUT_ICONS.list className="w-5 h-5 text-blue-500" />;
      case 'placeholder':
        return <ACTION_ICONS.create className="w-5 h-5 text-gray-400" />;
      default:
        return <FILE_ICONS.document className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div 
      className="p-3 rounded-md border cursor-pointer hover:bg-gray-700/30 transition-colors"
      style={{ 
        backgroundColor: DARK_THEME.background.secondary,
        borderColor: DARK_THEME.border.default 
      }}
      onClick={() => onClick?.(item)}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p 
            className="text-sm font-medium truncate"
            style={{ color: DARK_THEME.text.primary }}
          >
            {item.name}
          </p>
          {item.fileType && (
            <p 
              className="text-xs mt-0.5"
              style={{ color: DARK_THEME.text.secondary }}
            >
              {item.fileType}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const CuratedWork = ({ 
  sections = defaultSections, 
  onViewAllWork, 
  onItemClick,
  onAddSection 
}: CuratedWorkProps) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 
          className="text-lg font-semibold"
          style={{ color: DARK_THEME.text.primary }}
        >
          Curated work
        </h2>
        <button 
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          onClick={onViewAllWork}
        >
          View all work
        </button>
      </div>

      {/* Sections - More compact */}
      {sections.map((section) => (
        <div key={section.id} className="space-y-2">
          <h3 
            className="text-sm font-medium text-gray-300 mb-1"
            style={{ color: DARK_THEME.text.primary }}
          >
            {section.title}
          </h3>
          
          <div className="space-y-1">
            {section.items.map((item) => (
              <WorkItemComponent 
                key={item.id} 
                item={item} 
                onClick={onItemClick}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Bottom instructional area */}
      <div 
        className="mt-8 p-6 rounded-lg border-2 border-dashed text-center"
        style={{ 
          borderColor: DARK_THEME.border.default,
          backgroundColor: 'transparent'
        }}
      >
        <p 
          className="text-sm mb-4"
          style={{ color: DARK_THEME.text.secondary }}
        >
          Organize links to important work such as portfolios, projects,
        </p>
        <p 
          className="text-sm mb-4"
          style={{ color: DARK_THEME.text.secondary }}
        >
          templates, etc, for your team members to find easily.
        </p>
        <button 
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            backgroundColor: '#3B82F6',
            color: 'white'
          }}
          onClick={onAddSection}
        >
          Add work
        </button>
      </div>

      {/* Add Section Button */}
      <button 
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors mt-4"
        onClick={onAddSection}
      >
        <ACTION_ICONS.create className="w-4 h-4" />
        Add section
      </button>
    </div>
  );
};

export default CuratedWork;