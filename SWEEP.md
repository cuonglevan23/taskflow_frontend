# SWEEP.md - Development Commands & Configuration

## File Cleanup Commands

### Cleanup Deprecated Authentication Files
When optimizing authentication system, these legacy files were removed:

```bash
# Removed deprecated OAuth routes
rm -rf src/app/api/auth/oauth

# Removed deprecated hooks and services
rm src/hooks/useUserData.ts

# Removed temporary documentation
rm AUTHENTICATION_OPTIMIZATION.md

# Removed legacy exports
rm src/app/(dashboard)/home/components/Cards/index.ts
```

**Deprecated methods removed:**
- `authService.getCurrentUser()` → Use `UserContext.useUser()`
- `usersService.getCurrentUser()` → Use `UserContext.useUser()`
- `useUserData` hook → Use `UserContext.useUser()`

**Result:** Clean codebase with no deprecated authentication code.

### Remove Unnecessary Files
When cleaning up complex component structures:

```bash
# Remove multiple files at once
rm src/components/Calendar/CalendarDemo.tsx
rm src/components/Calendar/CalendarGrid.tsx
rm src/components/Calendar/CalendarApp.tsx
rm src/components/Calendar/CalendarCore.tsx
rm src/components/Calendar/CalendarHeader.tsx
rm src/components/Calendar/CreateEventModal.tsx
rm src/components/Calendar/CalendarFilters.tsx
rm src/components/Calendar/TeamCalendar.tsx
rm src/components/Calendar/ProjectCalendar.tsx
rm src/components/Calendar/PersonalCalendar.tsx
rm src/components/Calendar/CalendarWidget.tsx
rm src/components/Calendar/types.ts

# Remove entire directories
rm -rf src/components/Calendar/components
```

**Result:** Clean, maintainable structure with minimal files.

## Authentication OAuth Callback Fix

### Problem: Duplicate Callback Routes
Had both `/auth/callback` and `/callback` routes causing duplicate API calls.

### Solution: NextAuth Standard Flow with useSession Hook
```typescript
// src/app/auth/callback/page.tsx - Optimized with useSession hook
const { data: session, status: sessionStatus } = useSession();

// Smart authentication flow
if (sessionStatus === 'authenticated' && session) {
  router.push('/home'); // Already logged in
  return;
}

if (sessionStatus === 'loading') {
  return; // Wait for session
}

// Only process OAuth if not authenticated
const result = await signIn('backend-oauth', { ... });
```

### OAuth Flow:
```
Backend OAuth → /auth/callback → NextAuth signIn → /home
                     ↓              ↓               ↓
                 Parse params    Process auth    Redirect
```

### Result:
- ✅ Single OAuth route only
- ✅ Uses NextAuth standard hooks
- ✅ No duplicate processing
- ✅ Clean authentication flow

## Development Commands

### Fix Next.js Cache Issues
When encountering ENOENT build manifest errors (corrupted cache):

**For Development:**
```bash
rm -rf .next && npm run dev
```

**For Production Build:**
```bash
rm -rf .next && npm run build
```

**Common Symptoms:**
- `ENOENT: no such file or directory, open '.../_buildManifest.js.tmp...'`
- `ENOENT: no such file or directory, open '.../app-build-manifest.json'`
- `ENOENT: no such file or directory, open '.../app-paths-manifest.json'`

This clears corrupted Next.js cache and rebuilds the application. The issue commonly occurs after making significant changes to components or when switching between development and production builds.

### CSS Synchronization Between Machines
To ensure 100% CSS consistency across different development machines:

**After Cloning Repository:**
```bash
# 1. Clear any existing cache
rm -rf .next
rm -rf node_modules/.cache

# 2. Reinstall dependencies to ensure exact versions
npm ci

# 3. Start development server
npm run dev
```

**CSS Architecture:**
- Uses Tailwind CSS v4 with modern `@import "tailwindcss"` syntax
- CSS organized in proper `@layer` structure:
  - `@layer base` - Global resets and base styles
  - `@layer utilities` - Utility classes like scrollbar-hide
  - `@layer components` - Component-specific overrides
- All custom CSS uses `!important` to ensure consistency
- Dark theme forced globally for search/dropdown components

**Key Files:**
- `src/app/globals.css` - Main CSS file with @layer organization
- `src/app/layout.tsx` - Imports globals.css correctly
- `postcss.config.mjs` - PostCSS configuration for Tailwind v4

**Troubleshooting CSS Issues:**
1. Always clear `.next` cache first
2. Check that `globals.css` is imported in `layout.tsx`
3. Verify Tailwind v4 syntax is used (`@import "tailwindcss"`)
4. Ensure CSS is organized in proper `@layer` structure

### Fix Runtime Reference Errors
When encountering runtime errors like `ReferenceError: [Component] is not defined`:

**Clear Build Cache:**
```bash
rm -rf .next
```

**Common Symptoms:**
- `ReferenceError: Target is not defined`
- `ReferenceError: [IconName] is not defined`
- Runtime errors after refactoring imports

**Root Cause:** Stale build cache containing old compiled code with outdated imports/references.

**Solution:** Clear `.next` directory to force complete rebuild with latest code changes.

### Development Server
```bash
npm run dev
```
Starts development server (usually on port 3000, will use next available port if occupied).

## Package Installations

### FullCalendar Installation
```bash
npm install @fullcalendar/react @fullcalendar/core @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction @fullcalendar/list @fullcalendar/multimonth
```

This installs FullCalendar with all necessary plugins for:
- React integration
- Month/Day/Week grid views
- Time grid views
- Drag & drop interaction
- List view
- Multi-month year view

### FullCalendar Timeline Installation (for Gantt Charts)
```bash
npm install @fullcalendar/timeline @fullcalendar/resource-timeline @fullcalendar/resource-common
```

This installs additional FullCalendar timeline plugins for:
- Timeline views (Gantt chart style)
- Resource timeline (tasks grouped by resources/sections)
- Resource management functionality
- Professional timeline layouts with collapsible sections

**Usage Example:**
```tsx
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';

<FullCalendar
  plugins={[resourceTimelinePlugin, interactionPlugin]}
  initialView="resourceTimelineMonth"
  resources={sections}
  events={tasks}
  editable={true}
  eventDrop={(info) => handleTaskMove(info)}
/>
```

### React Icons Installation
```bash
npm install react-icons
```

This installs react-icons package for using professional icon sets like:
- `import { GiHamburgerMenu } from "react-icons/gi";` - Game Icons
- `import { FaUser } from "react-icons/fa";` - Font Awesome
- `import { MdEmail } from "react-icons/md";` - Material Design
- `import { AiOutlineHome } from "react-icons/ai";` - Ant Design

**Common Error:** `Module not found: Can't resolve 'react-icons/gi'`
**Solution:** Run the installation command above.

### SWR Installation and Setup
```bash
npm install swr
```

This installs SWR - the data fetching library for React with features like:
- **Caching** - Automatic request deduplication and caching
- **Revalidation** - Background updates and focus revalidation
- **Error Handling** - Built-in error retry and handling
- **Mutations** - Optimistic updates and cache invalidation
- **TypeScript** - Full TypeScript support

**Architecture Pattern:**
```typescript
// 1. Service Layer → Pure API calls
export const taskService = {
  getTasks: (params) => api.get('/tasks', { params }),
  createTask: (data) => api.post('/tasks', data),
};

// 2. SWR Hooks → Data fetching + caching
export const useTasks = (filter) => {
  return useSWR(['tasks', filter], () => taskService.getTasks(filter));
};

export const useCreateTask = () => {
  return useSWRMutation('tasks', taskService.createTask);
};

// 3. Context → UI state only (NOT data)
const AppContext = createContext({
  sidebarOpen: boolean,     // ✅ UI state
  selectedTaskId: string,   // ✅ UI state
  // ❌ NO tasks data here
});

// 4. Components → Use SWR hooks directly
const TaskList = () => {
  const { tasks, isLoading } = useTasks(filter);  // ✅ SWR hook
  const { sidebarOpen } = useAppContext();        // ✅ UI state
  
  return <div>{/* render tasks */}</div>;
};
```

**Key Benefits:**
- **Separation of Concerns** - Data fetching separate from UI state
- **Automatic Caching** - No manual cache management needed
- **Background Updates** - Data stays fresh automatically
- **Optimistic Updates** - Instant UI feedback with rollback on error
- **Error Boundaries** - Built-in error handling and retry logic

### React Flow Installation
```bash
npm install reactflow
npm install dagre
```

This installs React Flow - the professional workflow/dependency graph library for:
- **Node-based workflows** - Visual task connections with drag & drop
- **Dependency graphs** - Professional project management UI like MS Project, Asana
- **Custom nodes & edges** - Fully customizable task boxes and connection lines  
- **Auto-layout algorithms** - Automatic positioning with dagre library
- **Advanced features** - Zoom, pan, minimap, controls, background patterns

**Usage Example:**
```tsx
import ReactFlowWorkflow from '@/components/features/ReactFlowWorkflow';

<ReactFlowWorkflow
  tasks={tasks}
  sections={sections}
  onTaskUpdate={handleTaskUpdate}
  onTaskClick={handleTaskClick}
  onDependencyChange={handleDependencyChange}
  showMiniMap={true}
  showControls={true}
  height="600px"
/>
```

**Features:**
- **Professional UI** - Task nodes with progress bars, assignees, priorities
- **Dependency Types** - Finish-to-start, Start-to-start, Finish-to-finish, Start-to-finish  
- **Validation** - Circular dependency detection, conflict resolution
- **Layout Options** - Auto-layout, manual positioning, section grouping
- **Reusable Hooks** - useReactFlowWorkflow for easy integration

### Drag and Drop Installation
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities @dnd-kit/modifiers
```

This installs @dnd-kit - the professional drag and drop library used by modern products like Linear, Notion, and GitHub Projects.

## Simple Calendar System

### Simplified Architecture
**Single component solution for easy maintenance and updates.**

### Core Structure
```
src/
└── components/Calendar/
    ├── SimpleCalendar.tsx    # Main unified calendar component
    ├── index.ts              # Simple exports
    └── [legacy components]   # Deprecated complex components
```

### Key Features
- **Single Component**: All functionality in one maintainable file
- **Full Year View**: Scroll through 12 months seamlessly
- **Drag & Drop**: Move tasks between dates with visual feedback
- **Multi-day Tasks**: Tasks span across multiple days with connected styling
- **Dark Theme**: Professional dark theme with hover effects
- **Responsive**: Works on all screen sizes
- **Simple API**: Easy to use with minimal configuration

### Usage (Recommended)

#### Simple Calendar Implementation
```tsx
import { SimpleCalendar } from "@/components/Calendar";

// Basic usage - works out of the box
<SimpleCalendar />

// With event handlers
<SimpleCalendar
  onTaskClick={(task) => console.log('Task:', task)}
  onTaskDrop={(task, newDate) => console.log('Moved:', task.title, 'to', newDate)}
  onDateClick={(date) => console.log('Date:', date)}
  height="100vh"
/>

// With custom tasks
<SimpleCalendar
  initialTasks={myTasks}
  onTaskClick={handleTaskClick}
  onTaskDrop={handleTaskMove}
/>
```

### Task Data Structure
```tsx
interface Task {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  color: string;        // Hex color for task styling
  assignee?: string;    // Person assigned to task
  avatar?: string;      // Short text for avatar (e.g., "JD")
}
```

### Implementation Example
```tsx
// teams/calendar/page.tsx
"use client";

import SimpleCalendar from "@/components/Calendar/SimpleCalendar";

export default function CalendarPage() {
  const handleTaskClick = (task) => {
    // Open task details modal
    console.log('Task clicked:', task);
  };

  const handleTaskDrop = (task, newDate) => {
    // Update task date in database
    console.log('Task moved:', task.title, 'to', newDate);
  };

  const handleDateClick = (date) => {
    // Open create task modal
    console.log('Date clicked:', date);
  };

  return (
    <SimpleCalendar 
      onTaskClick={handleTaskClick}
      onTaskDrop={handleTaskDrop}
      onDateClick={handleDateClick}
    />
  );
}
```

### Benefits of Simplified Structure

#### 1. Easy Maintenance
- Single file to update for calendar changes
- No complex dependencies or contexts
- Clear, readable code structure

#### 2. Better Performance
- No unnecessary re-renders from complex state management
- Direct prop handling without context overhead
- Optimized for large datasets (full year view)

#### 3. Simple Debugging
- All logic in one place
- Easy to trace issues
- No complex component interactions

#### 4. Quick Updates
- Add features directly to SimpleCalendar.tsx
- No need to update multiple files
- Instant visual feedback

### Migration from Complex Calendar
**Old Pattern (Complex):**
```tsx
import { CalendarApp, CalendarProvider, useCalendar } from "@/components/Calendar";

<CalendarProvider teamId="team-123" userRole="admin">
  <CalendarApp showFilters={true} onEventClick={handleClick} />
</CalendarProvider>
```

**New Pattern (Simple):**
```tsx
import { SimpleCalendar } from "@/components/Calendar";

<SimpleCalendar 
  onTaskClick={handleClick}
  onTaskDrop={handleDrop}
  onDateClick={handleDateClick}
/>
```

### Customization
All styling and behavior can be customized directly in `SimpleCalendar.tsx`:
- Colors and themes
- Task rendering
- Event handlers
- Layout and spacing
- Animation effects

## Development Notes
- FullCalendar CSS is handled via styled-jsx global styles
- Events use ISO date format (YYYY-MM-DDTHH:mm:ss)
- All calendar logic is centralized in hooks for reusability
- TypeScript interfaces ensure type safety across components