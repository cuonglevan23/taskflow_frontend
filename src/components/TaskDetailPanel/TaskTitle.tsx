import React from 'react';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { TaskListItem } from '@/components/TaskList/types';

interface TaskTitleProps {
  task: TaskListItem | null;
  title: string;
  setTitle: (title: string) => void;
  onSave: () => void;
}

const TaskTitle: React.FC<TaskTitleProps> = ({
  task,
  title,
  setTitle,
  onSave
}) => {
  const { themeMode } = useThemeContext();
  const { messages } = useLanguageContext();

  // Helper function to get nested message value
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const isDark = themeMode === 'dark';

  return (
    <div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={onSave}
        className={`w-full text-2xl font-bold border border-transparent outline-none resize-none rounded-lg p-3 transition-all duration-200 focus:border-solid ${
          isDark 
            ? 'placeholder:text-gray-400 text-white bg-gray-900 focus:border-gray-400' 
            : 'placeholder:text-gray-500 text-gray-900 bg-white focus:border-gray-300'
        }`}
        style={{
          borderWidth: '1px'
        }}
        placeholder={task ? task.name : t('taskTitle.placeholder')}
      />
    </div>
  );
};

export default TaskTitle;
