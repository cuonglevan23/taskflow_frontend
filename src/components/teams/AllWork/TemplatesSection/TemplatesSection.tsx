"use client";

import React from "react";
import { Button } from "@/components/ui";
import { DARK_THEME } from "@/constants/theme";
import { NAVIGATION_ICONS, ACTION_ICONS } from "@/constants/icons";

export interface Template {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface TemplatesSectionProps {
  onNewTemplate: () => void;
  onExploreTemplates: () => void;
  onTemplateClick: (templateId: string) => void;
}

// Mock template data
const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'd',
    icon: 'file-text',
    color: '#6b7280'
  }
];

export default function TemplatesSection({ 
  onNewTemplate, 
  onExploreTemplates, 
  onTemplateClick 
}: TemplatesSectionProps) {
  return (
    <div 
      className="rounded-lg border p-6"
      style={{ 
        backgroundColor: DARK_THEME.background.secondary,
        borderColor: DARK_THEME.border.default 
      }}
    >
      {/* Header */}
      <div className="mb-6">
        <h2 
          className="text-lg font-semibold mb-4"
          style={{ color: DARK_THEME.text.primary }}
        >
          Templates
        </h2>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* New Template Button */}
          <button
            onClick={onNewTemplate}
            className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-dashed transition-colors hover:bg-opacity-50"
            style={{ 
              borderColor: DARK_THEME.border.default,
              backgroundColor: 'transparent' 
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = DARK_THEME.background.weakHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div className="w-8 h-8 rounded-lg border-2 border-dashed flex items-center justify-center"
              style={{ borderColor: DARK_THEME.border.default }}
            >
              {React.createElement(ACTION_ICONS.create, { size: 16, color: DARK_THEME.text.muted })}
            </div>
            <span 
              className="text-sm font-medium"
              style={{ color: DARK_THEME.text.primary }}
            >
              New Template
            </span>
          </button>

          {/* Explore Templates Button */}
          <button
            onClick={onExploreTemplates}
            className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-dashed transition-colors hover:bg-opacity-50"
            style={{ 
              borderColor: DARK_THEME.border.default,
              backgroundColor: 'transparent' 
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = DARK_THEME.background.weakHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div className="w-8 h-8 rounded-lg border-2 border-dashed flex items-center justify-center"
              style={{ borderColor: DARK_THEME.border.default }}
            >
              {React.createElement(NAVIGATION_ICONS.projects, { size: 16, color: DARK_THEME.text.muted })}
            </div>
            <span 
              className="text-sm font-medium"
              style={{ color: DARK_THEME.text.primary }}
            >
              Explore all templates
            </span>
          </button>
        </div>
      </div>

      {/* Templates List */}
      {mockTemplates.length > 0 && (
        <div className="space-y-3">
          {mockTemplates.map((template) => (
            <div
              key={template.id}
              className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-opacity-50"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = DARK_THEME.background.weakHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              onClick={() => onTemplateClick(template.id)}
            >
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: template.color }}
              >
                {React.createElement(NAVIGATION_ICONS.projects, { size: 16 })}
              </div>
              <span 
                className="text-sm font-medium"
                style={{ color: DARK_THEME.text.primary }}
              >
                {template.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}