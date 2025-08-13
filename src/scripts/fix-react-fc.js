// Script to fix all React.FC usage in codebase
// This script converts React.FC patterns to modern TypeScript patterns

const fs = require('fs');
const path = require('path');

// Files that need React.FC fixes (from search results)
const filesToFix = [
  'src/contexts/AppProvider.tsx',
  'src/contexts/NotificationContext.tsx', 
  'src/contexts/ProjectsContext.tsx',
  'src/contexts/tasks/Tasks.provider.tsx',
  'src/contexts/TasksContext.tsx',
  'src/layouts/page/components/NavigationAvatar.tsx',
  'src/layouts/private/components/UserMenu.tsx',
  'src/providers/ThemeProvider.tsx',
  'src/app/(dashboard)/goals/layout.tsx',
  'src/app/(dashboard)/goals/page.tsx',
  'src/app/(admin)/settings/page.tsx',
  'src/app/(dashboard)/my-tasks/layout.tsx',
  'src/app/(dashboard)/reporting/layout.tsx',
  'src/app/(dashboard)/reporting/page.tsx',
  'src/app/(dashboard)/my-tasks/page.tsx',
  'src/app/(dashboard)/goals/my-goals/page.tsx',
  'src/app/(dashboard)/inbox/components/UnifiedInboxList.tsx',
  'src/app/(dashboard)/inbox/components/InboxActionButtons.tsx',
  'src/app/(dashboard)/goals/strategy-map/page.tsx',
  'src/app/(dashboard)/inbox/components/FilterSortControls.tsx',
  'src/app/(dashboard)/inbox/components/InboxNotificationItem.tsx',
  'src/app/(dashboard)/inbox/components/UnifiedInboxNotificationItem.tsx',
  'src/app/(dashboard)/my-tasks/file/page.tsx',
  'src/app/(dashboard)/goals/team-goals/page.tsx',
  'src/app/(dashboard)/my-tasks/board/page.tsx',
  'src/app/(dashboard)/my-tasks/calendar/page.tsx',
  'src/app/(dashboard)/my-tasks/list/page.tsx',
  'src/app/(dashboard)/my-tasks/dashboard/page.tsx',
  'src/app/(dashboard)/reporting/components/CreateDashboardCard.tsx',
  'src/app/(dashboard)/reporting/dashboards/page.tsx',
  'src/app/(dashboard)/reporting/components/DashboardSection.tsx',
  'src/app/(dashboard)/reporting/components/DashboardCard.tsx',
  'src/components/layout/RoleBasedNavigation.tsx',
  'src/components/TimelineGantt/TimelineGantt.component.tsx',
  'src/components/TimelineGantt/components/WorkflowConnectionManager.tsx',
  'src/components/TimelineGantt/components/ConnectionLine.tsx',
  'src/components/TimelineGantt/components/ConnectionDot.tsx',
  'src/components/TimelineGantt/TimelineGantt.tsx',
  'src/components/TimelineGantt/components/TaskEventContent_new.tsx',
  'src/components/TimelineGantt/TimelineSection.tsx',
  'src/lib/calendar/context/CalendarContext.tsx',
  'src/components/TimelineGantt/components/TaskEventContent.tsx',
  'src/components/features/KanbanBoard/SortableTaskCard.tsx',
  'src/components/features/Settings/SettingsModal.tsx',
  'src/components/features/DetailPanel/DetailPanel.tsx',
  'src/components/features/KanbanBoard/DroppableColumn.tsx',
  'src/components/features/KanbanBoard/KanbanBoard.tsx',
  'src/components/features/Timeline/TimelineSection.tsx',
  'src/components/features/ReactFlowWorkflow/ReactFlowWorkflow.tsx',
  'src/components/features/Timeline/Timeline.tsx',
  'src/components/features/KanbanBoard/DragOverlayCard.tsx',
  'src/components/features/KanbanBoard/AddTaskModal.tsx',
  'src/components/auth/RoleGuard.tsx',
  'src/components/features/Timeline/ZoomControls.tsx',
  'src/components/auth/ProtectedRoute.tsx',
  'src/components/TaskList/TaskSection.tsx',
  'src/components/TaskList/TaskRow.tsx',
  'src/components/features/ReactFlowWorkflow/components/TaskNode.tsx',
  'src/components/TaskList/TaskCard.tsx',
  'src/components/features/ReactFlowWorkflow/components/DependencyEdge.tsx',
  'src/components/TaskList/TaskList.tsx',
  'src/components/TaskList/TaskTable.tsx',
  'src/components/features/KanbanBoard/DragAndDropContext.tsx',
  'src/components/TaskDetailPanel/TaskDetailPanel.tsx',
  'src/components/ui/SearchInput/SearchInput.tsx',
  'src/components/TaskList/TaskListHeader.tsx',
  'src/components/ui/SearchDropdown/SearchDropdown.tsx',
  'src/components/Calendar/FullCalendarView.tsx',
  'src/components/TaskList/EnhancedTaskSection.tsx',
  'src/components/TaskList/GroupedTaskList.tsx',
  'src/components/Calendar/CalendarHeader.tsx',
  'src/components/ui/CollaboratorSelector/CollaboratorSelector.tsx'
];

function fixReactFC(content) {
  // Pattern 1: const Component: React.FC<Props> = ({ ...props }) => {
  content = content.replace(
    /const\s+(\w+):\s*React\.FC<([^>]+)>\s*=\s*\(\{\s*([^}]*)\s*\}\)\s*=>/g,
    'const $1 = ({ $3 }: $2) =>'
  );
  
  // Pattern 2: const Component: React.FC<Props> = (props) => {
  content = content.replace(
    /const\s+(\w+):\s*React\.FC<([^>]+)>\s*=\s*\(([^)]+)\)\s*=>/g,
    'const $1 = ($3: $2) =>'
  );
  
  // Pattern 3: export const Component: React.FC<Props> = ({ ...props }) => {
  content = content.replace(
    /export\s+const\s+(\w+):\s*React\.FC<([^>]+)>\s*=\s*\(\{\s*([^}]*)\s*\}\)\s*=>/g,
    'export const $1 = ({ $3 }: $2) =>'
  );
  
  // Pattern 4: export const Component: React.FC<Props> = (props) => {
  content = content.replace(
    /export\s+const\s+(\w+):\s*React\.FC<([^>]+)>\s*=\s*\(([^)]+)\)\s*=>/g,
    'export const $1 = ($3: $2) =>'
  );
  
  // Pattern 5: const Component: React.FC = () => {
  content = content.replace(
    /const\s+(\w+):\s*React\.FC\s*=\s*\(\)\s*=>/g,
    'const $1 = () =>'
  );
  
  // Pattern 6: export const Component: React.FC = () => {
  content = content.replace(
    /export\s+const\s+(\w+):\s*React\.FC\s*=\s*\(\)\s*=>/g,
    'export const $1 = () =>'
  );

  // Pattern 7: Handle memo wrapped components
  content = content.replace(
    /const\s+(\w+):\s*React\.FC<([^>]+)>\s*=\s*memo\(\(\{\s*([^}]*)\s*\}\)\s*=>/g,
    'const $1 = memo(({ $3 }: $2) =>'
  );

  return content;
}

function processFile(filePath) {
  try {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    const fixedContent = fixReactFC(content);
    
    if (content !== fixedContent) {
      fs.writeFileSync(fullPath, fixedContent, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
    } else {
      console.log(`ℹ️  No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Process all files
console.log('🔧 Starting React.FC fixes...\n');

filesToFix.forEach(processFile);

console.log('\n🎉 React.FC fix completed!');
console.log('\n📋 Next steps:');
console.log('1. Run: npm run build');
console.log('2. Check for any remaining TypeScript errors');
console.log('3. Test components to ensure they still work correctly');