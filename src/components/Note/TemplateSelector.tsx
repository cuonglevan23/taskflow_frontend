"use client";

import { useCallback } from 'react';
import { Plus } from 'lucide-react';
import { DARK_THEME } from '@/constants/theme';

interface TemplateOption {
  icon: string;
  label: string;
}

interface TemplateSelectorProps {
  onTemplateSelect: (template: TemplateOption) => void;
  show: boolean;
}

export default function TemplateSelector({ onTemplateSelect, show }: TemplateSelectorProps) {
  const templateSuggestions: TemplateOption[] = [
    { icon: '📝', label: 'My scratchpad' },
    { icon: '📅', label: 'Weekly planning' },
    { icon: '📋', label: 'My meeting notes' },
    { icon: '🔗', label: 'Quick links' },
    { icon: '📄', label: 'Blank note' }
  ];

  const handleTemplateClick = useCallback((template: TemplateOption) => {
    onTemplateSelect(template);
  }, [onTemplateSelect]);

  if (!show) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center space-x-2 mb-4">
        <Plus className="h-4 w-4" style={{ color: DARK_THEME.text.muted }} />
        <span className="text-sm" style={{ color: DARK_THEME.text.muted }}>
          Start typing or type / for menu
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {templateSuggestions.map((template, index) => (
          <button
            key={index}
            onClick={() => handleTemplateClick(template)}
            className="px-3 py-2 text-sm rounded-md border border-opacity-30 hover:bg-opacity-10 hover:bg-white transition-colors"
            style={{
              color: DARK_THEME.text.primary,
              borderColor: DARK_THEME.border.default,
              backgroundColor: DARK_THEME.background.primary
            }}
          >
            <span className="mr-2">{template.icon}</span>
            {template.label}
          </button>
        ))}
      </div>
    </div>
  );
}
