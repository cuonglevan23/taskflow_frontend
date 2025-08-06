// Example: How to integrate global context in your app
// Add this to your main layout or app.tsx

import React from "react";
import AppProvider from "@/contexts";
import { PrivateLayout } from "@/layouts";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <PrivateLayout>
        {children}
      </PrivateLayout>
    </AppProvider>
  );
}

// Example: How sidebar can now use the same data
import { useProjectsContext, useTasksContext } from "@/contexts";

const Sidebar = () => {
  const { projects, projectStats } = useProjectsContext();
  const { taskStats } = useTasksContext();

  return (
    <aside>
      <h3>Projects ({projectStats.active})</h3>
      {projects.slice(0, 5).map(project => (
        <div key={project.id}>
          {project.name} - {project.status}
        </div>
      ))}
      
      <h3>Tasks ({taskStats.pending})</h3>
      {/* Tasks list will be automatically synchronized */}
    </aside>
  );
};

// Example: How any component can now access and modify data
const AnyComponent = () => {
  const { addProject, updateProject } = useProjectsContext();
  const { addTask, toggleTaskComplete } = useTasksContext();

  const handleCreateProject = () => {
    addProject({
      name: "New Project",
      color: "#8b5cf6",
      status: 'active'
    });
    // This will automatically update ALL components using projects data
  };

  const handleCreateTask = () => {
    addTask({
      title: "New Task",
      dueDate: "Today",
      completed: false,
      priority: 'medium',
      status: 'pending'
    });
    // This will automatically update home cards, sidebar, etc.
  };

  return (
    <div>
      <button onClick={handleCreateProject}>Add Project</button>
      <button onClick={handleCreateTask}>Add Task</button>
    </div>
  );
};