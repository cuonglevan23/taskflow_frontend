"use client";

import { ProjectOverviewProvider } from './context/ProjectOverviewContext';
import { ProjectDescription } from './components/ProjectDescription';
import { ProjectRoles } from './components/ProjectRoles';
import { ConnectedGoals } from './components/ConnectedGoals';
import { ConnectedPortfolios } from './components/ConnectedPortfolios';
import { KeyResources } from './components/KeyResources';
import { ProjectMilestones } from './components/ProjectMilestones';
import { ProjectStatus } from './components/ProjectStatus';
import { ProjectSummary } from './components/ProjectSummary';
import { ActivityTimeline } from './components/ActivityTimeline';
import { useProject } from '../components/DynamicProjectProvider';
import { useTheme } from '@/layouts/hooks/useTheme';
import styles from './styles/OverviewLayout.module.css';

interface OverviewProps {
  projectId: string;
}

function OverviewContent() {
  const { theme } = useTheme();
  
  return (
    <div 
      className={styles.overviewContainer}
      style={{ backgroundColor: theme.background.secondary }}
    >
      <div className={styles.overviewWrapper}>
        <div className={styles.overviewGrid}>
          {/* Main Content - Left Panel */}
          <main className={styles.mainContent}>
            <section className={styles.contentSection} style={{ backgroundColor: theme.background.primary, borderColor: theme.border.default }}>
              <ProjectDescription />
            </section>
            
            <section className={styles.contentSection} style={{ backgroundColor: theme.background.primary, borderColor: theme.border.default }}>
              <ProjectRoles />
            </section>
            
            <section className={styles.contentSection} style={{ backgroundColor: theme.background.primary, borderColor: theme.border.default }}>
              <ConnectedGoals />
            </section>
            
            <section className={styles.contentSection} style={{ backgroundColor: theme.background.primary, borderColor: theme.border.default }}>
              <ConnectedPortfolios />
            </section>
            
            <section className={styles.contentSection} style={{ backgroundColor: theme.background.primary, borderColor: theme.border.default }}>
              <KeyResources />
            </section>
            
            <section className={styles.contentSection} style={{ backgroundColor: theme.background.primary, borderColor: theme.border.default }}>
              <ProjectMilestones />
            </section>
          </main>

          {/* Sidebar - Right Panel */}
          <aside className={styles.sidebar}>
            <div className={`${styles.sidebarCard} ${styles.statusCard}`} style={{ backgroundColor: theme.background.primary, borderColor: theme.border.default }}>
              <ProjectStatus />
            </div>
            
            <div className={`${styles.sidebarCard} ${styles.summaryCard}`} style={{ backgroundColor: theme.background.primary, borderColor: theme.border.default }}>
              <ProjectSummary />
            </div>
            
            <div className={`${styles.sidebarCard} ${styles.timelineCard}`} style={{ backgroundColor: theme.background.primary, borderColor: theme.border.default }}>
              <ActivityTimeline />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function Overview({ projectId }: OverviewProps) {
  const { project, loading, error } = useProject();

  if (loading) {
    return (
      <div className={styles.overviewContainer}>
        <div className={styles.overviewWrapper}>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-gray-500">Loading project overview...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className={styles.overviewContainer}>
        <div className={styles.overviewWrapper}>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 text-lg font-medium mb-2">
                {error || 'Project not found'}
              </div>
              <p className="text-gray-600">
                Please check the project ID and try again.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProjectOverviewProvider>
      <OverviewContent />
    </ProjectOverviewProvider>
  );
}