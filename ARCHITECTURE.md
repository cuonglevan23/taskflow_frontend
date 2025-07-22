# TaskManager - Architecture Guide

## 📚 Table of Contents
- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Component Architecture](#component-architecture)
- [Development Guidelines](#development-guidelines)
- [State Management](#state-management)
- [Routing & Authentication](#routing--authentication)
- [Best Practices](#best-practices)

## 🎯 Project Overview

TaskManager is a task management application inspired by Asana, built with modern web technologies. The project follows Atomic Design principles and feature-based architecture to ensure scalability and maintainability.

## 💻 Technology Stack

- **Framework:** Next.js 13+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Context + React Query
- **Authentication:** NextAuth.js
- **Database:** (Your database choice)
- **Testing:** Jest + React Testing Library
- **Documentation:** Storybook

## 📂 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (routes)/          # Route groups
│   │   ├── (public)/      # Public routes
│   │   ├── (auth)/        # Authentication routes
│   │   └── (admin)/       # Admin routes
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
│
├── components/            # UI Components (Atomic Design)
│   ├── atoms/            # Basic components
│   │   ├── forms/        # Form elements
│   │   ├── typography/   # Text elements
│   │   └── data-display/ # Display elements
│   │
│   ├── molecules/        # Composite components
│   │   ├── task/        # Task-related components
│   │   └── project/     # Project-related components
│   │
│   ├── organisms/       # Complex components
│   │   ├── navigation/  # Navigation components
│   │   └── task-management/
│   │
│   └── templates/       # Page layouts
│       └── layouts/     # Layout templates
│
├── features/            # Feature-based code organization
│   ├── tasks/          # Task management feature
│   │   ├── api/        # API functions
│   │   ├── hooks/      # Custom hooks
│   │   └── context/    # Context providers
│   ├── projects/       # Project management
│   └── workspace/      # Workspace management
│
├── lib/                # Shared utilities
│   ├── auth/          # Authentication utilities
│   ├── api/           # API utilities
│   └── utils/         # Helper functions
│
├── constants/          # Application constants
├── types/             # TypeScript types
└── config/            # Configuration files
```

## 🎨 Component Architecture

### Atomic Design Pattern

1. **Atoms** (Basic building blocks)
   ```tsx
   // Button.tsx
   interface ButtonProps {
     variant: 'primary' | 'secondary';
     size?: 'sm' | 'md' | 'lg';
     children: React.ReactNode;
   }
   ```

2. **Molecules** (Groups of atoms)
   ```tsx
   // TaskCard.tsx
   interface TaskCardProps {
     task: Task;
     onStatusChange: (status: TaskStatus) => void;
   }
   ```

3. **Organisms** (Complex components)
   ```tsx
   // TaskBoard.tsx
   interface TaskBoardProps {
     projectId: string;
     layout: 'list' | 'board';
   }
   ```

### Feature-based Organization

```typescript
// features/tasks/api/taskApi.ts
export const taskApi = {
  getTasks: () => axios.get('/api/tasks'),
  createTask: (data: CreateTaskDTO) => axios.post('/api/tasks', data),
};

// features/tasks/hooks/useTask.ts
export const useTask = (taskId: string) => {
  return useQuery(['task', taskId], () => taskApi.getTask(taskId));
};
```

## 👨‍💻 Development Guidelines

### 1. Component Creation Rules

- Clear TypeScript interfaces
- Proper prop types
- Error boundaries when needed
- Loading states
- Error states

### 2. Code Organization

- Group related components
- Shared utils in lib/
- Feature-specific code in features/
- Clear import paths

### 3. State Management

```typescript
// Local State
const [isOpen, setIsOpen] = useState(false);

// Context State
const { tasks, dispatch } = useTaskContext();

// Server State
const { data: tasks } = useQuery('tasks', fetchTasks);
```

### 4. Routing Structure

```typescript
// app/(routes)/(auth)/login/page.tsx
export default function LoginPage() {
  // Implementation
}

// app/(routes)/(admin)/dashboard/page.tsx
export default function DashboardPage() {
  // Implementation
}
```

## ✅ Best Practices

### 1. Component Best Practices

- Single Responsibility
- Props Interface First
- Error Handling
- Loading States
- Accessibility

### 2. Performance Considerations

- Component Memoization
- Proper Key Usage
- Image Optimization
- Code Splitting

### 3. Testing Strategy

- Unit Tests for Utils
- Component Tests
- Integration Tests
- E2E Tests for Flows

### 4. Code Style

```typescript
// Good
interface UserProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

export const UserProfile = ({ user, onUpdate }: UserProfileProps) => {
  // Implementation
};

// Bad
export const UserProfile = (props: any) => {
  // Implementation
};
```

## 🚀 Development Workflow

1. Create Feature Branch
2. Implement Changes
3. Write Tests
4. Update Documentation
5. Create Pull Request

## 📝 Documentation Requirements

1. Component Documentation
   ```typescript
   /**
    * Button component with different variants and sizes.
    * @param variant - The style variant of the button
    * @param size - The size of the button
    * @param children - The content of the button
    */
   ```

2. Feature Documentation
   - Purpose
   - Components
   - Data Flow
   - API Integration

## 🔍 Code Review Guidelines

1. Code Quality
   - TypeScript types
   - Error handling
   - Performance
   - Testing

2. Documentation
   - Component docs
   - Function docs
   - Complex logic explanation

3. Best Practices
   - Atomic Design principles
   - Feature organization
   - State management
   - Error boundaries

## 🤝 Team Collaboration

1. Branch Strategy
   - feature/
   - bugfix/
   - hotfix/

2. PR Template
   - Description
   - Changes
   - Testing
   - Screenshots

3. Code Review Process
   - Technical review
   - UX review
   - Testing verification

## 🎯 Development Process

1. Task Assignment
2. Feature Branch Creation
3. Implementation
4. Testing
5. Documentation
6. Code Review
7. Merge


Reference: https://medium.com/@janelle.wg/atomic-design-pattern-how-to-structure-your-react-application-2bb4d9ca5f97
