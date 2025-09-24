"use client";
import PremiumBanner from "@/components/Banner";
import React, { useState } from "react";
import { usePremiumBannerVisibility } from "@/hooks/usePremiumBannerVisibility";
import { useRouter } from "next/navigation";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { useAuth } from '@/components/auth/AuthProvider';
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

// Import Refactored Cards using BaseCard
import RefactoredMyTasksCard from "./components/Cards/MyTasksCard";
import RefactoredProjectsCard from "./components/Cards/ProjectsCard";
import RefactoredTasksAssignedCard from "./components/Cards/TasksAssignedCard";
import RefactoredGoalsCard from "./components/Cards/GoalsCard";

// Import Global Context
import { useTasksContext } from "@/contexts";
import { useMyTasksSummary } from "@/hooks/tasks";

// Base Card Types & Interfaces
interface TabConfig {
    key: string;
    label: string;
    count?: number | null;
}

interface ActionButtonConfig {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    onClick: () => void;
}

interface BaseCardProps {
    title: string;
    icon?: React.ReactNode;
    avatar?: React.ReactNode;
    tabs?: TabConfig[];
    activeTab?: string;
    onTabChange?: (tabKey: string) => void;
    createAction?: ActionButtonConfig;
    children: React.ReactNode;
    showMoreButton?: {
        show: boolean;
        onClick: () => void;
        onHide?: () => void; // Add optional hide callback
    };
    className?: string;
    t: (key: string) => string; // Add translation function prop
}

// Professional Base Card Component
const BaseCard = ({
                      title,
                      icon,
                      avatar,
                      tabs,
                      activeTab,
                      onTabChange,
                      createAction,
                      children,
                      showMoreButton,
                      className = "",
                      t // Destructure translation function
                  }: BaseCardProps) => {
    const { theme } = useThemeContext();
    const [isExpanded, setIsExpanded] = useState(false);

    const TabButton = ({
                           tab,
                           isActive,
                           onClick
                       }: {
        tab: TabConfig;
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
          {tab.count !== null && tab.count !== undefined && (
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

    const handleToggleShowMore = () => {
        if (!isExpanded) {
            // If not expanded, call the onClick handler and expand
            showMoreButton?.onClick();
            setIsExpanded(true);
        } else {
            // If expanded, call the onHide handler (if provided) and collapse
            showMoreButton?.onHide?.();
            setIsExpanded(false);
        }
    };

    return (
        <div
            className={`rounded-2xl border h-full flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ${className}`}
            style={{
                backgroundColor: theme.background.primary,
                borderColor: theme.border.default,
            }}
        >
            {/* Professional Header */}
            <div className="flex items-center justify-between p-6 pb-4">
                <div className="flex items-center gap-3">
                    {/* Avatar or Icon */}
                    {avatar && (
                        <div
                            className="w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center"
                            style={{ borderColor: theme.text.secondary + '60' }}
                        >
                            <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
                                style={{ backgroundColor: theme.text.secondary + '20' }}
                            >
                                {avatar}
                            </div>
                        </div>
                    )}
                    {icon && !avatar && (
                        <div className="flex-shrink-0">
                            {icon}
                        </div>
                    )}

                    {/* Title Section */}
                    <div className="flex items-center gap-2">
                        <h3
                            className="text-lg font-semibold"
                            style={{ color: theme.text.primary }}
                        >
                            {title}
                        </h3>
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
            {tabs && tabs.length > 0 && (
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
                                onClick={() => onTabChange?.(tab.key)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col px-6 py-4 min-h-0">
                {/* Create/Add Action */}
                {createAction && (
                    <button
                        onClick={createAction.onClick}
                        className="flex items-center gap-3 text-sm py-2 px-2 -mx-2 rounded-lg transition-colors duration-200 mb-3 flex-shrink-0"
                        style={{ color: theme.text.secondary }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = theme.background.secondary;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        <createAction.icon className="w-4 h-4" />
                        <span>{createAction.label}</span>
                    </button>
                )}

                {/* Dynamic Content */}
                <div className="flex-1 overflow-y-auto min-h-0 mb-3">
                    {children}
                </div>

                {/* Show More/Show Less Toggle Button */}
                {showMoreButton?.show && (
                    <div className="flex-shrink-0 border-t pt-3" style={{ borderColor: theme.border.default }}>
                        <button
                            onClick={handleToggleShowMore}
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
                            {isExpanded ? t('home.showLess') : t('home.showMore')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const getGreeting = (t: (key: string) => string): string => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return t('home.greeting.morning');
    if (hour >= 12 && hour < 18) return t('home.greeting.afternoon');
    return t('home.greeting.evening');
};

// Header Component
const HomeHeader = () => {
    const { theme } = useThemeContext();
    const { messages } = useLanguageContext();

    const t = (key: string): string => {
        const keys = key.split('.');
        let value: any = messages;
        for (const k of keys) {
            value = value?.[k];
        }
        return value || key;
    };

    return (
        <div className="mb-8">
            <h1
                className="text-2xl font-semibold mb-6"
                style={{ color: theme.text.primary }}
            >
                {t('home.title')}
            </h1>
        </div>
    );
};

// Greeting Section
const GreetingSection = ({ user }: { user: any }) => {
    const { theme } = useThemeContext();
    const { messages } = useLanguageContext();

    const t = (key: string): string => {
        const keys = key.split('.');
        let value: any = messages;
        for (const k of keys) {
            value = value?.[k];
        }
        return value || key;
    };

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
                {getGreeting(t)}, {user?.name || t('home.defaultUser')}
            </h2>
        </div>
    );
};

// Achievements Widget (Summary Bar) - Dynamic with Real Data
const AchievementsWidget = () => {
    const { theme } = useThemeContext();
    const { messages } = useLanguageContext();

    const t = (key: string): string => {
        const keys = key.split('.');
        let value: any = messages;
        for (const k of keys) {
            value = value?.[k];
        }
        return value || key;
    };

    // Use cached global data - no API calls
    // ✅ FIX: Use same SWR data source as sidebar for consistency
    const { tasks, isLoading, error } = useMyTasksSummary({
        page: 0,
        size: 1000,
        sortBy: 'startDate',
        sortDir: 'desc'
    });

    const { optimisticTaskStates } = useTasksContext();

    // Calculate completed tasks same way as MyTasksCard
    const completedTasksCount = React.useMemo(() => {
        if (!tasks || !Array.isArray(tasks)) return 0;

        return tasks.filter(task => {
            const optimisticState = optimisticTaskStates[task.id.toString()];
            const actualCompleted = task.completed || task.status === 'completed' || task.status === 'DONE';
            const finalCompleted = optimisticState !== undefined ? optimisticState : actualCompleted;
            return finalCompleted;
        }).length;
    }, [tasks, optimisticTaskStates]);

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
                        {t('home.myWeek')}
                        <MdKeyboardArrowDown className="w-4 h-4" />
                    </button>
                </div>

                {/* Task Completed - Dynamic from Global Context */}
                <div className="flex items-center gap-2">
                    <FaCheckCircle
                        className="w-4 h-4"
                        style={{ color: "#10b981" }}
                    />
                    <span
                        className="text-sm"
                        style={{ color: theme.text.primary }}
                    >
                        {completedTasksCount || 0} {t('home.tasksCompleted')}
                    </span>
                </div>

                {/* Collaborators - Could be dynamic in future */}
                <div className="flex items-center gap-2">
                    <FaUsers
                        className="w-4 h-4"
                        style={{ color: theme.text.secondary }}
                    />
                    <span
                        className="text-sm"
                        style={{ color: theme.text.primary }}
                    >
                        0 {t('home.collaborators')}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default function HomeDashboard() {
    const { theme } = useThemeContext();
    const { messages } = useLanguageContext();
    const { user } = useAuth();
    const router = useRouter();

    // Premium Banner Visibility Hook
    const {
        shouldShowBanner,
        isLoading: bannerLoading,
        dismissBanner
    } = usePremiumBannerVisibility({
        userId: user?.id?.toString()
    });

    // Helper function to convert User to UserInfo for PremiumBanner
    const convertUserToUserInfo = (user: any) => {
        if (!user) return null;

        return {
            userId: parseInt(user.id) || 0,
            firstName: user.name?.split(' ')[0] || '',
            lastName: user.name?.split(' ').slice(1).join(' ') || '',
            email: user.email || '',
            avatar: user.avatar || '',
            onlineStatus: 'online',
            isOnline: true,
            lastSeen: new Date().toISOString(),
            isPremium: false, // Default to false, will be checked by PremiumBanner
            premiumExpiry: undefined,
            premiumPlanType: undefined,
            profile: user
        };
    };

    // Helper function to get translated text
    const t = (key: string): string => {
        const keys = key.split('.');
        let value: any = messages;
        for (const k of keys) {
            value = value?.[k];
        }
        return value || key;
    };


    return (
        <div className="p-6">
            {/* Page Title */}
            <div className="mb-8">
                <h1
                    className="text-2xl font-semibold"
                    style={{ color: theme.text.primary }}
                >
                    {t('home.title')}
                </h1>
            </div>

            {/* Greeting Section */}
            <GreetingSection user={user} />

            {/* Achievements Widget (Summary Bar) with Customize Button */}
            <div className="relative mb-8">
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
                    {t('home.customize')}
                </button>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-7xl mx-auto w-full">
                {/* Top Row */}
                <div className="min-h-[400px]">
                    <RefactoredMyTasksCard />
                </div>
                <div className="min-h-[400px]">
                    <RefactoredProjectsCard />
                </div>

                {/* Bottom Row */}
                <div className="min-h-[400px]">
                    <RefactoredTasksAssignedCard />
                </div>
                <div className="min-h-[400px]">
                    <RefactoredGoalsCard />
                </div>
            </div>

            {/* Premium Banner for non-premium users - Only show once per day */}
            {!bannerLoading && shouldShowBanner && user && convertUserToUserInfo(user) && (
                <PremiumBanner
                    userInfo={convertUserToUserInfo(user)!} // Use converter function and non-null assertion
                    onUpgrade={() => {
                        // Logic xử lý upgrade
                        window.location.href = "/pricing";
                    }}
                    onDismiss={dismissBanner} // Add dismiss functionality
                />
            )}
        </div>
    );
}