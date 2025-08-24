"use client";


import { ProjectOverviewProvider } from './context/ProjectOverviewContext';
import { ProjectDescription } from './components/ProjectDescription';
import { ProjectRoles } from './components/ProjectRoles';
import { ConnectedGoals } from './components/ConnectedGoals';
import { ConnectedPortfolios } from './components/ConnectedPortfolios';
import { KeyResources } from './components/KeyResources';
import { ProjectMilestones } from './components/ProjectMilestones';
import { ProjectStatus } from './components/ProjectStatus';

import { useProject } from '../components/DynamicProjectProvider';
import { useTheme } from '@/layouts/hooks/useTheme';


interface OverviewProps {
  projectId: string;
}

function OverviewContent() {
  const { theme } = useTheme();
  
  return (
    <div 
      className="min-h-screen p-4"
      style={{ backgroundColor: theme.background.primary }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Panel */}
          <main className="lg:col-span-2 space-y-6">
            <section className="p-6 rounded-lg border" style={{ backgroundColor: theme.background.primary, borderColor: theme.border.default }}>
              <ProjectDescription />
            </section>

            
            <section className="p-6 rounded-lg border" style={{ backgroundColor: theme.background.primary, borderColor: theme.border.default }}>
              <ConnectedGoals />
            </section>
            

          </main>

          {/* Sidebar - Right Panel */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-lg border sticky top-4" style={{ backgroundColor: theme.background.primary, borderColor: theme.border.default }}>
              <ProjectStatus />
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
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
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



  return (
    <ProjectOverviewProvider>
      <OverviewContent />
    </ProjectOverviewProvider>
  );
}