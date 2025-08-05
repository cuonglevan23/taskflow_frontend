"use client";

import React, { useState } from "react";
import { PrivateLayout } from "@/layouts";
import { useTheme } from "@/layouts/hooks/useTheme";
import { 
  FaPlus, 
  FaCheckCircle, 
  FaUsers, 
  FaChevronDown,
  FaEllipsisV
} from "react-icons/fa";
import { 
  MdKeyboardArrowDown,
  MdMoreHoriz
} from "react-icons/md";
import { 
  HiSparkles 
} from "react-icons/hi";
import { 
  IoCheckbox,
  IoCheckboxOutline 
} from "react-icons/io5";
import { 
  BsCircle,
  BsCheckCircle 
} from "react-icons/bs";

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  return "Good evening";
};

// Header Component
const HomeHeader = () => {
  const { theme } = useTheme();
  
  return (
    <div className="mb-8">
      <h1 
        className="text-2xl font-semibold mb-6"
        style={{ color: theme.text.primary }}
      >
        Home
      </h1>
    </div>
  );
};

// Greeting Section
const GreetingSection = () => {
  const { theme } = useTheme();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="text-center mb-8">
      <p 
        className="text-sm mb-2"
        style={{ color: theme.text.secondary }}
      >
        {today}
      </p>
      <h2 
        className="text-2xl font-semibold"
        style={{ color: theme.text.primary }}
      >
        {getGreeting()}, levancuong
      </h2>
    </div>
  );
};

// Achievements Widget (Summary Bar)
const AchievementsWidget = () => {
  const { theme } = useTheme();
  
  return (
    <div className="flex justify-center mb-8">
      <div 
        className="flex items-center gap-8 px-8 py-4 rounded-2xl border"
        style={{
          backgroundColor: theme.background.primary,
          borderColor: theme.border.default,
        }}
      >
        {/* My Week */}
        <div className="flex items-center gap-2">
          <button 
            className="flex items-center gap-2 text-sm font-medium"
            style={{ color: theme.text.primary }}
          >
            My week
            <MdKeyboardArrowDown className="w-4 h-4" />
          </button>
        </div>

        {/* Task Completed */}
        <div className="flex items-center gap-2">
          <FaCheckCircle 
            className="w-4 h-4"
            style={{ color: "#10b981" }}
          />
          <span 
            className="text-sm"
            style={{ color: theme.text.primary }}
          >
            1 task completed
          </span>
        </div>

        {/* Collaborators */}
        <div className="flex items-center gap-2">
          <FaUsers 
            className="w-4 h-4"
            style={{ color: theme.text.secondary }}
          />
          <span 
            className="text-sm"
            style={{ color: theme.text.primary }}
          >
            0 collaborators
          </span>
        </div>
      </div>
    </div>
  );
};

// My Tasks Card - Senior Product Implementation
const MyTasksCard = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [taskStates, setTaskStates] = useState<Record<number, boolean>>({});
  const [showAllTasks, setShowAllTasks] = useState(false);
  
  // Professional tab configuration
  const tabs = [
    { key: "upcoming", label: "Upcoming", count: null },
    { key: "overdue", label: "Overdue", count: 5 },
    { key: "completed", label: "Completed", count: null }
  ];
  
  // Task data model
  const tasks = [
    { id: 1, title: "f", dueDate: "Today", completed: false, hasTag: false },
    { id: 2, title: "f", dueDate: "Today", completed: false, hasTag: false },
    { id: 3, title: "f", dueDate: "Tomorrow", completed: false, hasTag: false },
    { 
      id: 4, 
      title: "Remember to add discussion topics for the next meeting", 
      dueDate: "Tomorrow", 
      completed: false, 
      hasTag: true,
      tagText: "cuon..."
    },
    { id: 5, title: "f", dueDate: "Thursday", completed: false, hasTag: false },
    { id: 6, title: "ff", dueDate: "Thursday", completed: false, hasTag: false },
  ];

  // Business logic for due date styling
  const getDueDateColor = (dueDate: string): string => {
    const normalizedDate = dueDate.toLowerCase();
    switch (normalizedDate) {
      case 'today':
      case 'tomorrow':
        return '#10b981'; // Emerald green
      case 'thursday':
        return '#10b981'; // Emerald green
      default:
        return theme.text.secondary;
    }
  };

  // Task completion handler
  const handleTaskToggle = (taskId: number): void => {
    setTaskStates(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Show more handler
  const handleShowMore = (): void => {
    setShowAllTasks(true);
  };

  // Get tasks to display based on show more state
  const getDisplayedTasks = () => {
    const INITIAL_TASKS_COUNT = 4;
    return showAllTasks ? tasks : tasks.slice(0, INITIAL_TASKS_COUNT);
  };

  const hasMoreTasks = tasks.length > 4;

  // Tab Button Component
  const TabButton = ({ 
    tab, 
    isActive, 
    onClick 
  }: { 
    tab: typeof tabs[0]; 
    isActive: boolean; 
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className="relative pb-3 pr-6 text-sm font-medium transition-all duration-200 hover:opacity-80"
      style={{
        color: isActive ? theme.text.primary : theme.text.secondary,
      }}
    >
      <span className="whitespace-nowrap">
        {tab.label}
        {tab.count !== null && (
          <span className="ml-1">({tab.count})</span>
        )}
      </span>
      {isActive && (
        <div 
          className="absolute bottom-0 left-0 right-6 h-0.5 bg-orange-500"
          style={{ borderRadius: '2px' }}
        />
      )}
    </button>
  );

  // Task Item Component with Professional Styling
  const TaskItem = ({ 
    task 
  }: { 
    task: typeof tasks[0] 
  }) => {
    const isCompleted = taskStates[task.id] || false;
    
    return (
      <div 
        className="group flex items-center py-3 cursor-pointer transition-colors duration-150 border-b"
        style={{ 
          borderBottomColor: theme.text.secondary,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.background.secondary + '40';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        {/* Interactive Checkbox */}
        <button 
          className="flex-shrink-0 mr-3 p-1 -m-1 transition-all duration-200 hover:scale-110"
          onClick={() => handleTaskToggle(task.id)}
          aria-label={`Mark task "${task.title}" as ${isCompleted ? 'incomplete' : 'complete'}`}
        >
          {isCompleted ? (
            <BsCheckCircle 
              className="w-4 h-4 text-green-500"
            />
          ) : (
            <BsCircle 
              className="w-4 h-4 transition-colors duration-200"
              style={{ color: theme.text.secondary }}
            />
          )}
        </button>

        {/* Task Content Container */}
        <div className="flex-1 min-w-0 flex items-center justify-between">
          {/* Task Title */}
          <span 
            className={`text-sm mr-3 transition-all duration-200 ${
              isCompleted ? 'line-through opacity-60' : ''
            }`}
            style={{ color: theme.text.primary }}
          >
            {task.title}
          </span>
          
          {/* Right Side Content */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Project Tag */}
            {task.hasTag && task.tagText && (
              <span 
                className="px-2 py-1 text-xs rounded-md font-medium"
                style={{
                  backgroundColor: '#8b5cf6',
                  color: '#ffffff',
                }}
              >
                {task.tagText}
              </span>
            )}

            {/* Due Date */}
            <span 
              className="text-sm font-medium"
              style={{ color: getDueDateColor(task.dueDate) }}
            >
              {task.dueDate}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="rounded-2xl border h-full flex flex-col overflow-hidden"
      style={{
        backgroundColor: theme.background.primary,
        borderColor: theme.border.default,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      }}
    >
      {/* Professional Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center gap-3">
          {/* User Avatar with Dashed Border */}
          <div 
            className="w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center"
            style={{ borderColor: theme.text.secondary + '60' }}
          >
            <div 
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
              style={{ backgroundColor: theme.text.secondary + '20' }}
            >
              👤
            </div>
          </div>
          
          {/* Title Section */}
          <div className="flex items-center gap-2">
            <h3 
              className="text-lg font-semibold"
              style={{ color: theme.text.primary }}
            >
              My tasks
            </h3>
            <span 
              className="text-base opacity-70"
              style={{ color: theme.text.secondary }}
            >
              🔒
            </span>
          </div>
        </div>

        {/* Actions Menu */}
        <button 
          className="p-2 rounded-lg transition-colors duration-200"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.background.secondary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <MdMoreHoriz 
            className="w-5 h-5"
            style={{ color: theme.text.secondary }}
          />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="px-6">
        <div 
          className="flex border-b"
          style={{ borderBottomColor: theme.border.default }}
        >
          {tabs.map((tab) => (
            <TabButton
              key={tab.key}
              tab={tab}
              isActive={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
            />
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col px-6 py-4 min-h-0">
        {/* Create Task Action */}
        <button 
          className="flex items-center gap-3 text-sm py-2 px-2 -mx-2 rounded-lg transition-colors duration-200 mb-3 flex-shrink-0"
          style={{ color: theme.text.secondary }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.background.secondary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <FaPlus className="w-4 h-4" />
          <span>Create task</span>
        </button>

        {/* Tasks List Container */}
        <div className="flex-1 overflow-y-auto min-h-0 mb-3">
          <div className="space-y-0">
            {getDisplayedTasks().map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </div>

        {/* Show More Action - Only visible when there are more tasks */}
        {hasMoreTasks && !showAllTasks && (
          <div className="flex-shrink-0 border-t pt-3" style={{ borderColor: theme.border.default }}>
            <button 
              onClick={handleShowMore}
              className="text-sm py-2 px-2 -mx-2 text-left rounded-lg transition-colors duration-200 w-full"
              style={{ 
                color: theme.text.secondary,
                fontSize: '14px',
                fontWeight: '400'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.background.secondary;
                e.currentTarget.style.color = theme.text.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = theme.text.secondary;
              }}
            >
              Show more
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Projects Card
const ProjectsCard = () => {
  const { theme } = useTheme();
  
  const projects = [
    { name: "xxxxxxx", color: "#e91e63", icon: "📋" },
    { name: "xxxxxx", color: "#e91e63", icon: "📋" },
    { name: "x", color: "#e91e63", icon: "📋" },
    { name: "x", color: "#3f51b5", icon: "📋" },
    { name: "Request tracking", color: "#2196f3", icon: "📋" },
  ];

  return (
    <div 
      className="rounded-2xl border p-4 h-full flex flex-col shadow-sm hover:shadow-md transition-all duration-200"
      style={{
        backgroundColor: theme.background.primary,
        borderColor: theme.border.default,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 
            className="text-base font-semibold"
            style={{ color: theme.text.primary }}
          >
            Projects
          </h3>
          <button className="flex items-center gap-1">
            <span 
              className="text-xs"
              style={{ color: theme.text.secondary }}
            >
              Recents
            </span>
            <MdKeyboardArrowDown className="w-3 h-3" />
          </button>
        </div>
        <button>
          <MdMoreHoriz 
            className="w-4 h-4"
            style={{ color: theme.text.secondary }}
          />
        </button>
      </div>

      {/* Create Project */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button 
          className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl h-12 transition-colors"
          style={{
            borderColor: theme.border.default,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.background.secondary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <FaPlus 
            className="w-3 h-3 mb-1"
            style={{ color: theme.text.secondary }}
          />
          <span 
            className="text-xs"
            style={{ color: theme.text.secondary }}
          >
            Create project
          </span>
        </button>

        {/* Featured Project */}
        <div className="flex items-center gap-2 p-2 bg-purple-100 rounded-xl">
          <div className="w-5 h-5 bg-purple-600 rounded flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs">📋</span>
          </div>
          <div className="min-w-0">
            <div 
              className="font-medium text-xs truncate"
              style={{ color: theme.text.primary }}
            >
              xxxxxxx
            </div>
            <div 
              className="text-xs"
              style={{ color: theme.text.secondary }}
            >
              3 tasks due soon
            </div>
          </div>
        </div>
      </div>

      {/* Project List - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-1">
          {projects.map((project, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 p-1.5 rounded-lg transition-colors cursor-pointer"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.background.secondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div 
                className="w-3 h-3 rounded flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: project.color }}
              >
                <span className="text-white text-xs">📋</span>
              </div>
              <span 
                className="text-xs truncate"
                style={{ color: theme.text.primary }}
              >
                {project.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Show More */}
      <button 
        className="text-xs mt-2 w-full text-center py-1 rounded transition-colors"
        style={{ color: theme.text.secondary }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.background.secondary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        Show more
      </button>
    </div>
  );
};

// Tasks I've Assigned Card
const TasksAssignedCard = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("Upcoming");
  
  const tabs = ["Upcoming", "Overdue", "Completed"];

  return (
    <div 
      className="rounded-2xl border p-4 h-full flex flex-col shadow-sm hover:shadow-md transition-all duration-200"
      style={{
        backgroundColor: theme.background.primary,
        borderColor: theme.border.default,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 
          className="text-base font-semibold"
          style={{ color: theme.text.primary }}
        >
          Tasks I've assigned
        </h3>
        <button>
          <MdMoreHoriz 
            className="w-4 h-4"
            style={{ color: theme.text.secondary }}
          />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-3" style={{ borderColor: theme.border.default }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-2 py-1.5 text-xs font-medium border-b-2 ${
              activeTab === tab ? 'border-orange-500' : 'border-transparent'
            }`}
            style={{
              color: activeTab === tab ? theme.text.primary : theme.text.secondary,
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Assign Task Button */}
      <button 
        className="flex items-center gap-2 text-xs mb-3 w-full text-left p-1 rounded transition-colors"
        style={{ color: theme.text.secondary }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.background.secondary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <FaPlus className="w-3 h-3" />
        Assign task
      </button>

      {/* Task Items - Scrollable */}
      <div className="flex-1 overflow-y-auto space-y-1">
        <div 
          className="flex items-center gap-2 py-1.5 px-2 rounded transition-colors cursor-pointer"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.background.secondary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <div className="w-3 h-3 border border-gray-300 rounded flex-shrink-0"></div>
          <span 
            className="flex-1 text-xs truncate"
            style={{ color: theme.text.primary }}
          >
            Remember to add discussion topics for the next meeting
          </span>
          <span 
            className="px-1.5 py-0.5 text-xs rounded flex-shrink-0"
            style={{
              backgroundColor: "#f0f0f0",
              color: theme.text.secondary,
            }}
          >
            cuon...
          </span>
          <span 
            className="text-xs flex-shrink-0"
            style={{ color: "#10b981" }}
          >
            Today
          </span>
          <div className="w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs">👤</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Goals Card
const GoalsCard = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("My goals");
  
  const tabs = ["My goals", "Team"];
  
  const goals = [
    { name: "làm việc", progress: 0, period: "Q3 FY25 • My workspace" },
    { name: "jk", progress: 0, period: "" },
  ];

  return (
    <div 
      className="rounded-2xl border p-4 h-full flex flex-col shadow-sm hover:shadow-md transition-all duration-200"
      style={{
        backgroundColor: theme.background.primary,
        borderColor: theme.border.default,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 
            className="text-base font-semibold"
            style={{ color: theme.text.primary }}
          >
            Goals
          </h3>
          <button className="flex items-center gap-1">
            <span 
              className="text-xs"
              style={{ color: theme.text.secondary }}
            >
              Open goals
            </span>
            <MdKeyboardArrowDown className="w-3 h-3" />
          </button>
        </div>
        <button>
          <MdMoreHoriz 
            className="w-4 h-4"
            style={{ color: theme.text.secondary }}
          />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-3" style={{ borderColor: theme.border.default }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-2 py-1.5 text-xs font-medium border-b-2 ${
              activeTab === tab ? 'border-orange-500' : 'border-transparent'
            }`}
            style={{
              color: activeTab === tab ? theme.text.primary : theme.text.secondary,
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Create Goal Button */}
      <button 
        className="flex items-center gap-2 text-xs mb-3 w-full text-left p-1 rounded transition-colors"
        style={{ color: theme.text.secondary }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.background.secondary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <FaPlus className="w-3 h-3" />
        Create goal
      </button>

      {/* Goals List - Scrollable */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {goals.map((goal, index) => (
          <div 
            key={index} 
            className="p-2 rounded-lg transition-colors cursor-pointer"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.background.secondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span 
                className="font-medium text-xs truncate"
                style={{ color: theme.text.primary }}
              >
                {goal.name}
              </span>
              <span 
                className="text-xs flex-shrink-0 ml-2"
                style={{ color: theme.text.secondary }}
              >
                {goal.progress}%
              </span>
            </div>
            {goal.period && (
              <p 
                className="text-xs mb-2"
                style={{ color: theme.text.secondary }}
              >
                {goal.period}
              </p>
            )}
            <div 
              className="w-full rounded-full h-1.5 mb-1"
              style={{ backgroundColor: theme.background.muted }}
            >
              <div
                className="h-1.5 rounded-full bg-gray-300"
                style={{ width: `${goal.progress}%` }}
              ></div>
            </div>
            <span 
              className="text-xs block"
              style={{ color: "#10b981" }}
            >
              On track
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function HomeDashboard() {
  const { theme } = useTheme();

  return (
    <PrivateLayout>
      <div
        className="min-h-screen px-8 py-6"
        style={{
          backgroundColor: theme.background.secondary,
        }}
      >
        {/* Header */}
        <HomeHeader />

        {/* Greeting Section */}
        <GreetingSection />

        {/* Achievements Widget (Summary Bar) with Customize Button */}
        <div className="relative">
          <AchievementsWidget />
          
          {/* Customize Button - Positioned at top right */}
          <button 
            className="absolute top-0 right-8 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border"
            style={{
              backgroundColor: theme.background.primary,
              borderColor: theme.border.default,
              color: theme.text.primary,
            }}
          >
            <HiSparkles className="w-4 h-4" />
            Customize
          </button>
        </div>

        {/* Main Dashboard Grid - Equal sized compact cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-7xl mx-auto">
          {/* Top Row */}
          <div className="h-[400px]">
            <MyTasksCard />
          </div>
          <div className="h-[400px]">
            <ProjectsCard />
          </div>
          
          {/* Bottom Row */}
          <div className="h-[400px]">
            <TasksAssignedCard />
          </div>
          <div className="h-[400px]">
            <GoalsCard />
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
}
