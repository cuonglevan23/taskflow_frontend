import React, { useState, useRef } from 'react';
import { Share, Paperclip, ExternalLink, CheckCircle, Upload, ChevronDown, FolderOpen, Cloud, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskListItem } from '@/components/TaskList/types';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { useSWRFileUpload } from '@/hooks/useSWRFileUpload'; // Use new SWR hook

interface TaskDetailHeaderProps {
  task: TaskListItem | null;
  onClose: () => void;
  onMarkComplete?: () => void;
  onFileUploadComplete?: (result: any) => void;
}

const TaskDetailHeader = ({
  task,
  onClose,
  onMarkComplete,
  onFileUploadComplete
}: TaskDetailHeaderProps) => {
  const [showUploadDropdown, setShowUploadDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // 🔥 NEW: Use SWR hook for consistent cache management
  const {
    uploadSingleFile,
    uploadFiles,
  } = useSWRFileUpload(task?.id ? parseInt(task.id) : 0);

  // Helper function to check if task is completed
  const isTaskCompleted = (task: TaskListItem): boolean => {
    return task.completed || 
           task.status === 'DONE';
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0 && task?.id) {
      try {
        const taskId = parseInt(task.id);

        if (files.length === 1) {
          // 🔥 Upload using SWR hook - auto mutates cache
          const result = await uploadSingleFile(files[0], taskId);
          console.log('🎉 Single file upload result:', result);
          onFileUploadComplete?.(result);
        } else {
          // 🔥 Upload multiple using SWR hook - auto mutates cache
          const results = await uploadFiles(Array.from(files), taskId);
          console.log('🎉 Multiple upload completed:', results);
          onFileUploadComplete?.(results);
        }
      } catch (error) {
        console.error('💥 Upload error:', error);
      }
    }

    // Reset input and close dropdown
    event.target.value = '';
    setShowUploadDropdown(false);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'upload' && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const uploadTabs = [
    { id: 'upload', label: t('taskDetailHeader.upload'), icon: Upload },
    { id: 'google-drive', label: t('taskDetailHeader.googleDrive'), icon: FolderOpen },
    { id: 'onedrive', label: t('taskDetailHeader.oneDrive'), icon: Cloud },
  ];

  return (
    <>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: theme.border.default }}
      >
        <div className="flex items-center gap-3">
          {task && (
            <Button
              type="button"
              onClick={onMarkComplete}
              className="flex items-center gap-2 text-sm font-medium border transition-all duration-200"
              style={{
                backgroundColor: isTaskCompleted(task)
                  ? theme.status.success
                  : `${theme.background.weakHover}80`,
                borderColor: isTaskCompleted(task)
                  ? theme.status.success
                  : theme.border.default,
                color: isTaskCompleted(task)
                  ? 'white'
                  : theme.text.secondary
              }}
              onMouseEnter={(e) => {
                if (isTaskCompleted(task)) {
                  e.currentTarget.style.opacity = '0.9';
                } else {
                  e.currentTarget.style.color = theme.status.success;
                  e.currentTarget.style.borderColor = theme.status.success;
                }
              }}
              onMouseLeave={(e) => {
                if (isTaskCompleted(task)) {
                  e.currentTarget.style.opacity = '1';
                } else {
                  e.currentTarget.style.color = theme.text.secondary;
                  e.currentTarget.style.borderColor = theme.border.default;
                }
              }}
            >
              <CheckCircle 
                className="w-4 h-4" 
                style={{
                  color: isTaskCompleted(task) ? 'white' : 'currentColor'
                }}
              />
              {isTaskCompleted(task) ? t('taskDetailHeader.completed') : t('taskDetailHeader.markComplete')}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 hover:opacity-80"
            style={{ color: theme.text.muted }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.background.weakHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Share className="w-4 h-4" />
          </Button>

          {/* Upload File Dropdown */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:opacity-80 flex items-center gap-1"
              style={{ color: theme.text.muted }}
              onClick={() => setShowUploadDropdown(!showUploadDropdown)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.background.weakHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Paperclip className="w-4 h-4" />
              <ChevronDown className="w-3 h-3" />
            </Button>

            {showUploadDropdown && (
              <div
                className="absolute right-0 top-full mt-2 w-96 rounded-lg shadow-xl border z-50"
                style={{
                  backgroundColor: theme.background.primary,
                  borderColor: theme.border.default,
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
                }}
              >
                {/* Tabs */}
                <div className="flex border-b" style={{ borderColor: theme.border.default }}>
                  {uploadTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`flex-1 px-3 py-3 text-sm font-medium transition-colors ${
                        activeTab === tab.id ? 'border-b-2' : ''
                      }`}
                      style={{
                        color: activeTab === tab.id ? theme.text.primary : theme.text.muted,
                        borderBottomColor: activeTab === tab.id ? theme.button.primary.background : 'transparent',
                        backgroundColor: activeTab === tab.id ? theme.background.weakHover : 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (activeTab !== tab.id) {
                          e.currentTarget.style.backgroundColor = theme.background.weakHover;
                          e.currentTarget.style.color = theme.text.secondary;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (activeTab !== tab.id) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = theme.text.muted;
                        }
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Content */}
                <div className="p-6">
                  {activeTab === 'upload' && (
                    <div className="text-center">
                      <div className="mb-4">
                        <h3
                          className="text-lg font-medium mb-2"
                          style={{ color: theme.text.primary }}
                        >
                          {t('taskDetailHeader.selectOrDragFiles')}
                        </h3>
                      </div>

                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-3 rounded-lg border-2 border-dashed transition-all duration-200 hover:scale-105"
                        style={{
                          backgroundColor: 'transparent',
                          borderColor: theme.border.default,
                          color: theme.text.primary
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = theme.button.primary.background;
                          e.currentTarget.style.backgroundColor = `${theme.button.primary.background}10`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = theme.border.default;
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        {t('taskDetailHeader.chooseFile')}
                      </Button>

                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileSelect}
                        multiple
                      />
                    </div>
                  )}

                  {activeTab === 'google-drive' && (
                    <div className="text-center">
                      <p className="text-sm mb-4" style={{ color: theme.text.muted }}>
                        {t('taskDetailHeader.connectGoogleDriveDescription')}
                      </p>
                      <Button
                        variant="outline"
                        className="px-6 py-3 rounded-lg border transition-all duration-200"
                      >
                        <img src="/images/google-logo.svg" alt="Google Logo" className="w-4 h-4 mr-2" />
                        {t('taskDetailHeader.connectGoogleDrive')}
                      </Button>
                    </div>
                  )}

                  {activeTab === 'onedrive' && (
                    <div className="text-center">
                      <p className="text-sm mb-4" style={{ color: theme.text.muted }}>
                        {t('taskDetailHeader.connectOneDriveDescription')}
                      </p>
                      <Button
                        variant="outline"
                        className="px-6 py-3 rounded-lg border transition-all duration-200"
                      >
                        <img src="/images/onedrive-logo.svg" alt="OneDrive Logo" className="w-4 h-4 mr-2" />
                        {t('taskDetailHeader.connectOneDrive')}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Backdrop to close dropdown */}
            {showUploadDropdown && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUploadDropdown(false)}
              />
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 hover:opacity-80"
            style={{ color: theme.text.muted }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.background.weakHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Task visibility notice */}
      <div>
        <div
          className="flex items-start gap-3 p-4"
          style={{ backgroundColor: theme.background.secondary }}
        >
          <Lock
            className="w-4 h-4"
            style={{ color: theme.text.secondary }}
          />
          <div className="text-sm" style={{ color: theme.text.secondary }}>
            {t('taskDetailHeader.taskIsPrivate')}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-sm ml-auto"
            style={{ color: theme.button.primary.background }}
          >
            {t('taskDetailHeader.changePrivacy')}
          </Button>
        </div>
      </div>
    </>
  );
};

export default TaskDetailHeader;
