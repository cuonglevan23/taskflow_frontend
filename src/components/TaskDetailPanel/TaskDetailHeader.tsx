import React, { useState, useRef } from 'react';
import { Share, Paperclip, ExternalLink, CheckCircle, Upload, ChevronDown, FolderOpen, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TaskListItem } from '@/components/TaskList/types';
import { DARK_THEME } from '@/constants/theme';

interface TaskDetailHeaderProps {
  task: TaskListItem | null;
  onClose: () => void;
  onMarkComplete?: () => void;
  onFileUpload?: (files: FileList, source: string) => void;
}

const TaskDetailHeader = ({
  task,
  onClose,
  onMarkComplete,
  onFileUpload
}: TaskDetailHeaderProps) => {
  const [showUploadDropdown, setShowUploadDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper function to check if task is completed
  const isTaskCompleted = (task: TaskListItem): boolean => {
    return task.completed || 
           task.status === 'DONE' || 
           (task.status as string) === 'COMPLETED' ||
           (task.status as string) === 'completed';
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0 && onFileUpload) {
      onFileUpload(files, activeTab);
    }
    setShowUploadDropdown(false);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'upload' && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const uploadTabs = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'google-drive', label: 'Google Drive', icon: FolderOpen },
    { id: 'onedrive', label: 'OneDrive/SharePoint', icon: Cloud },
  ];

  return (
    <>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: DARK_THEME.border.default }}
      >
        <div className="flex items-center gap-3">
          {task && (
            <Button
              type="button"
              onClick={onMarkComplete}
              className="flex items-center gap-2 text-sm font-medium border transition-all duration-200"
              style={{
                backgroundColor: isTaskCompleted(task)
                  ? DARK_THEME.button.success.background
                  : `${DARK_THEME.background.weakHover}80`,
                borderColor: isTaskCompleted(task)
                  ? DARK_THEME.button.success.border
                  : DARK_THEME.border.default,
                color: isTaskCompleted(task)
                  ? DARK_THEME.button.success.textStrong
                  : DARK_THEME.text.secondary
              }}
              onMouseEnter={(e) => {
                if (isTaskCompleted(task)) {
                  e.currentTarget.style.backgroundColor = DARK_THEME.button.success.hover;
                  e.currentTarget.style.borderColor = DARK_THEME.button.success.borderHover || DARK_THEME.button.success.border;
                  e.currentTarget.style.color = DARK_THEME.button.success.textStrong || DARK_THEME.button.success.text;
                } else {
                  e.currentTarget.style.color = DARK_THEME.button.success.text;
                  e.currentTarget.style.borderColor = DARK_THEME.button.success.border;
                }
              }}
              onMouseLeave={(e) => {
                if (isTaskCompleted(task)) {
                  e.currentTarget.style.backgroundColor = DARK_THEME.button.success.background;
                  e.currentTarget.style.borderColor = DARK_THEME.button.success.border;
                  e.currentTarget.style.color = DARK_THEME.button.success.textStrong || DARK_THEME.button.success.text;
                } else {
                  e.currentTarget.style.color = DARK_THEME.text.secondary;
                  e.currentTarget.style.borderColor = DARK_THEME.border.default;
                }
              }}
            >
              <CheckCircle 
                className="w-4 h-4" 
                style={{
                  color: isTaskCompleted(task)
                    ? DARK_THEME.button.success.iconHover || DARK_THEME.button.success.icon
                    : 'currentColor'
                }}
              />
              {isTaskCompleted(task) ? 'Completed' : 'Mark complete'}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 text-gray-400 hover:text-gray-200"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = DARK_THEME.background.weakHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Share className="w-4 h-4" />
          </Button>

          {/* Upload File Dropdown */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 text-gray-400 hover:text-gray-200 flex items-center gap-1"
              onClick={() => setShowUploadDropdown(!showUploadDropdown)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = DARK_THEME.background.weakHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Paperclip className="w-4 h-4" />
              <ChevronDown className="w-3 h-3" />
            </Button>

            {showUploadDropdown && (
              <div
                className="absolute right-0 top-full mt-2 w-96 rounded-lg shadow-xl border z-50"
                style={{
                  backgroundColor: DARK_THEME.background.primary,
                  borderColor: DARK_THEME.border.default,
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
                }}
              >
                {/* Tabs */}
                <div className="flex border-b" style={{ borderColor: DARK_THEME.border.default }}>
                  {uploadTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`flex-1 px-3 py-3 text-sm font-medium transition-colors ${
                        activeTab === tab.id ? 'border-b-2' : ''
                      }`}
                      style={{
                        color: activeTab === tab.id ? DARK_THEME.text.primary : DARK_THEME.text.muted,
                        borderBottomColor: activeTab === tab.id ? DARK_THEME.button.primary.background : 'transparent',
                        backgroundColor: activeTab === tab.id ? DARK_THEME.background.weakHover : 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (activeTab !== tab.id) {
                          e.currentTarget.style.backgroundColor = DARK_THEME.background.weakHover;
                          e.currentTarget.style.color = DARK_THEME.text.secondary;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (activeTab !== tab.id) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = DARK_THEME.text.muted;
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
                          style={{ color: DARK_THEME.text.primary }}
                        >
                          Select or drag files from your computer
                        </h3>
                      </div>

                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-3 rounded-lg border-2 border-dashed transition-all duration-200 hover:scale-105"
                        style={{
                          backgroundColor: 'transparent',
                          borderColor: DARK_THEME.border.default,
                          color: DARK_THEME.text.primary
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = DARK_THEME.button.primary.background;
                          e.currentTarget.style.backgroundColor = `${DARK_THEME.button.primary.background}10`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = DARK_THEME.border.default;
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        Choose a file
                      </Button>

                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </div>
                  )}

                  {activeTab !== 'upload' && (
                    <div className="text-center py-8">
                      <div className="mb-4">
                        <Cloud
                          className="w-12 h-12 mx-auto mb-3"
                          style={{ color: DARK_THEME.text.muted }}
                        />
                        <h3
                          className="text-lg font-medium mb-2"
                          style={{ color: DARK_THEME.text.primary }}
                        >
                          {uploadTabs.find(tab => tab.id === activeTab)?.label} Integration
                        </h3>
                        <p
                          className="text-sm"
                          style={{ color: DARK_THEME.text.muted }}
                        >
                          Connect to {uploadTabs.find(tab => tab.id === activeTab)?.label} to access your files
                        </p>
                      </div>

                      <Button
                        className="px-6 py-2 rounded-lg transition-all duration-200"
                        style={{
                          backgroundColor: DARK_THEME.button.primary.background,
                          color: DARK_THEME.button.primary.text
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = DARK_THEME.button.primary.hover;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = DARK_THEME.button.primary.background;
                        }}
                        onClick={() => {
                          console.log(`Connect to ${activeTab}`);
                          // Implement cloud service connection
                        }}
                      >
                        Connect to {uploadTabs.find(tab => tab.id === activeTab)?.label}
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
            className="p-2 text-gray-400 hover:text-gray-200"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = DARK_THEME.background.weakHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </>
  );
};

export default TaskDetailHeader;
