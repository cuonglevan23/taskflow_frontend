# SWEEP.md - Development Commands & Configuration

## File Cleanup Commands

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