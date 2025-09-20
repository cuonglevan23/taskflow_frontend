"use client";


import {ProjectOverviewProvider} from './context/ProjectOverviewContext';
import {ProjectDescription} from './components/ProjectDescription';
import ConnectedGoals from './components/ConnectedGoals';
import {ProjectMembers} from './components';
import {ProjectStatus} from './components/ProjectStatus';
import {ProjectTimeline} from './components/ProjectTimeline';
import {useProject} from '../components/DynamicProjectProvider';
import {useThemeContext} from '@/providers/ThemeProvider';
import {useLanguageContext} from '@/providers/LanguageProvider';


function OverviewContent() {
    const {theme, isLoading: themeLoading} = useThemeContext();
    const {messages} = useLanguageContext();
    const {project} = useProject();

    // Safe theme color access with fallbacks
    const getThemeColor = (colorPath: string, fallback: string = '') => {
        if (!theme) return fallback;
        const keys = colorPath.split('.');
        let value: any = theme;
        for (const key of keys) {
            value = value?.[key];
            if (!value) return fallback;
        }
        return value;
    };

    // Show loading state while theme is loading
    if (themeLoading) {
        return (
            <div className="min-h-screen animate-pulse">
                <div className="h-full bg-gray-200"></div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen"
            style={{backgroundColor: getThemeColor('background.primary', '#ffffff')}}
        >
            <div className="flex">
                {/* Main Content - Left Panel with proper spacing */}
                <main className="flex-1 p-6 pr-96 flex justify-center">
                    <div className="max-w-4xl w-full space-y-6">
                        <section className="p-6 rounded-lg border"
                                 style={{
                                     backgroundColor: getThemeColor('background.primary', '#ffffff'),
                                     borderColor: getThemeColor('border.default', '#e2e8f0')
                                 }}>
                            <ProjectDescription/>
                        </section>

                        <section className="p-6 rounded-lg border"
                                 style={{
                                     backgroundColor: getThemeColor('background.primary', '#ffffff'),
                                     borderColor: getThemeColor('border.default', '#e2e8f0')
                                 }}>
                            <ConnectedGoals projectId={project?.id || 0} />
                        </section>

                        <section className="p-6 rounded-lg border"
                                 style={{
                                     backgroundColor: getThemeColor('background.primary', '#ffffff'),
                                     borderColor: getThemeColor('border.default', '#e2e8f0')
                                 }}>
                            <ProjectMembers projectId={project?.id || 0} />
                        </section>
                    </div>
                </main>

                {/* Sidebar - Right Panel flush to edge */}
                <aside className="w-96 h-screen border-l overflow-y-auto fixed right-0"
                       style={{
                           backgroundColor: getThemeColor('background.primary', '#ffffff'),
                           borderColor: getThemeColor('border.default', '#e2e8f0')
                       }}>
                    <div className="h-full flex flex-col">
                        {/* Project Status - Always at top */}
                        <div className="flex-shrink-0 p-6 border-b"
                             style={{
                                 backgroundColor: getThemeColor('background.primary', '#ffffff'),
                                 borderColor: getThemeColor('border.default', '#e2e8f0')
                             }}>
                            <div className="p-6 rounded-lg border shadow-sm"
                                 style={{
                                     backgroundColor: getThemeColor('background.primary', '#ffffff'),
                                     borderColor: getThemeColor('border.default', '#e2e8f0')
                                 }}>
                                <ProjectStatus/>
                            </div>
                        </div>

                        {/* Project Timeline - Scrollable content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="p-6 rounded-lg border shadow-sm"
                                 style={{
                                     backgroundColor: getThemeColor('background.primary', '#ffffff'),
                                     borderColor: getThemeColor('border.default', '#e2e8f0')
                                 }}>
                                <ProjectTimeline/>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}


export default function Overview() {
    const {theme, isLoading: themeLoading} = useThemeContext();
    const {messages} = useLanguageContext();
    const {loading, error} = useProject();

    // Safe theme color access with fallbacks
    const getThemeColor = (colorPath: string, fallback: string = '') => {
        if (!theme) return fallback;
        const keys = colorPath.split('.');
        let value: any = theme;
        for (const key of keys) {
            value = value?.[key];
            if (!value) return fallback;
        }
        return value;
    };

    // Get translated messages from config/i18n/messages
    const overviewMessages = messages?.projectOverview || {};

    if (themeLoading) {
        return (
            <div className="min-h-screen animate-pulse">
                <div className="h-full bg-gray-200"></div>
            </div>
        );
    }

    if (loading) {
        return (
            <div
                className="min-h-screen p-4"
                style={{backgroundColor: getThemeColor('background.primary', '#ffffff')}}
            >
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div
                                className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
                                style={{borderColor: getThemeColor('status.info', '#3b82f6')}}
                            ></div>
                            <div
                                style={{color: getThemeColor('text.muted', '#64748b')}}
                            >
                                {overviewMessages.loading || 'Đang tải tổng quan dự án...'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div
                className="min-h-screen p-4"
                style={{backgroundColor: getThemeColor('background.primary', '#ffffff')}}
            >
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div
                                className="text-6xl mb-4"
                                style={{color: getThemeColor('status.error', '#ef4444')}}
                            >
                                ⚠️
                            </div>
                            <div
                                className="text-lg mb-2"
                                style={{color: getThemeColor('status.error', '#ef4444')}}
                            >
                                {overviewMessages.errorLoading || 'Không thể tải tổng quan dự án'}
                            </div>
                            <div
                                className="text-sm"
                                style={{color: getThemeColor('text.muted', '#64748b')}}
                            >
                                {error}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <ProjectOverviewProvider>
            <OverviewContent/>
        </ProjectOverviewProvider>
    );
}