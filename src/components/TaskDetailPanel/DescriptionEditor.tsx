import React, { useState, useCallback, useEffect } from 'react';
import { Save, Edit, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MinimalTiptap } from '@/components/ui/shadcn-io/minimal-tiptap';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";

interface DescriptionEditorProps {
  taskId: string | null;
  description: string;
  onDescriptionChange: (description: string) => void;
  editable?: boolean;
}

const DescriptionEditor = ({
  taskId,
  description,
  onDescriptionChange,
  editable = true,
}: DescriptionEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempDescription, setTempDescription] = useState(description);

  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  // Helper function to get translated text
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === 'string' ? value : key;
  };

  // Update tempDescription when description prop changes
  useEffect(() => {
    if (!isEditing) {
      setTempDescription(description);
    }
  }, [description, isEditing]);

  const handleStartEdit = useCallback(() => {
    setIsEditing(true);
    setTempDescription(description);
  }, [description]);

  const handleSave = useCallback(() => {
    onDescriptionChange(tempDescription);
    setIsEditing(false);
  }, [tempDescription, onDescriptionChange]);

  const handleCancel = useCallback(() => {
    setTempDescription(description);
    setIsEditing(false);
  }, [description]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditing) {
        if (event.key === 'Escape') {
          handleCancel();
        }
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
          handleSave();
        }
      }
    };

    if (isEditing) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEditing, handleCancel, handleSave]);

  if (!editable && !description) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium" style={{ color: theme.text.primary }}>
          {t('descriptionEditor.title')}
        </h3>
        {editable && !isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStartEdit}
            className="text-gray-400 hover:text-gray-200"
            style={{ color: theme.text.muted }}
          >
            <Edit className="w-4 h-4" />
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div
            className="min-h-[120px] border rounded-lg overflow-hidden"
            style={{ borderColor: theme.border.default }}
          >
            <MinimalTiptap
              content={tempDescription}
              onChange={setTempDescription}
              placeholder={t('descriptionEditor.placeholder')}
            />
          </div>

          {/* Save/Cancel buttons */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              className="flex items-center gap-1.5"
              style={{
                backgroundColor: theme.button.primary.background,
                color: theme.button.primary.text
              }}
            >
              <Save className="w-3.5 h-3.5" />
              {t('descriptionEditor.save')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              className="flex items-center gap-1.5"
              style={{ color: theme.text.muted }}
            >
              <X className="w-3.5 h-3.5" />
              {t('descriptionEditor.cancel')}
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`min-h-[120px] border rounded-lg p-4 transition-colors duration-200 ${
            editable ? 'cursor-pointer' : ''
          }`}
          style={{
            borderColor: theme.border.default,
            backgroundColor: editable ? theme.background.weakHover : 'transparent'
          }}
          onClick={editable ? handleStartEdit : undefined}
        >
          {description ? (
            <div
              className="prose prose-invert max-w-none"
              style={{ color: theme.text.primary }}
              dangerouslySetInnerHTML={{ __html: description }}
            />
          ) : (
            <p className="italic" style={{ color: theme.text.muted }}>
              {editable ? t('descriptionEditor.clickToAdd') : t('descriptionEditor.noDescription')}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default DescriptionEditor;
