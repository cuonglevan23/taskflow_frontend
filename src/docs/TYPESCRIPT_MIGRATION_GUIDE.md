# 🔧 TypeScript Migration Guide - Fixing `any` Types and Build Errors

## 🎯 Overview

This guide helps fix TypeScript/ESLint build failures caused by:
- ❌ `any` types (rule: `@typescript-eslint/no-explicit-any`)
- ❌ Empty object props (`{}`)
- ❌ Unused imports and variables
- ❌ Missing type definitions

## 📁 New Type System Structure

```
src/
├── types/
│   ├── common.ts           # Generic interfaces (ApiResponse, EventInfo, etc.)
│   ├── components.ts       # Component props interfaces
│   ├── calendar.ts         # Calendar-specific types
│   └── task.ts            # Task-related types (existing)
├── utils/
│   └── typescript.ts       # Type guards and utilities
└── .eslintrc.js           # Strict ESLint configuration
```

## 🚀 Quick Fixes for Common Issues

### 1. Replace `any` with Proper Types

#### ❌ Before (Causes build error)
```typescript
const handleEvent = (event: any) => {
  console.log(event.target.value);
};

const apiCall = async (data: any): Promise<any> => {
  return await fetch('/api', { body: JSON.stringify(data) });
};
```

#### ✅ After (Build passes)
```typescript
import type { EventHandler } from '@/utils/typescript';
import type { ApiResponse } from '@/types/common';

const handleEvent: EventHandler<React.ChangeEvent<HTMLInputElement>> = (event) => {
  console.log(event.target.value);
};

const apiCall = async (data: Record<string, unknown>): Promise<ApiResponse> => {
  return await fetch('/api', { body: JSON.stringify(data) });
};
```

### 2. Fix Empty Object Props

#### ❌ Before
```typescript
interface ComponentProps {
  config: {};
  data: {};
}
```

#### ✅ After
```typescript
interface ComponentProps {
  config: Record<string, unknown>;
  data: Record<string, unknown>;
  // Or better - define specific interfaces
  config: {
    theme: string;
    size: 'sm' | 'md' | 'lg';
  };
}
```

### 3. Remove Unused Imports/Variables

#### ❌ Before
```typescript
import React, { useState, useEffect, useMemo } from 'react';
import { taskService } from '@/services';

const MyComponent = () => {
  const [data, setData] = useState([]); // unused
  const [loading, setLoading] = useState(false);
  
  return <div>Loading: {loading}</div>;
};
```

#### ✅ After
```typescript
import React, { useState } from 'react';

const MyComponent = () => {
  const [loading, setLoading] = useState(false);
  
  return <div>Loading: {loading}</div>;
};
```

## 🛠️ Using New Type System

### 1. Import Common Types
```typescript
import type {
  ApiResponse,
  EventInfo,
  DateClickInfo,
  DropInfo,
  SelectOption,
  ActionConfig
} from '@/types/common';
```

### 2. Import Component Types
```typescript
import type {
  ButtonProps,
  ModalProps,
  TableProps,
  FormProps
} from '@/types/components';
```

### 3. Import Calendar Types
```typescript
import type {
  CalendarEvent,
  CalendarProps,
  SimpleCalendarTask
} from '@/types/calendar';
```

### 4. Use TypeScript Utilities
```typescript
import {
  isDefined,
  isString,
  isNumber,
  safeGet,
  getErrorMessage,
  assertType
} from '@/utils/typescript';

// Type-safe error handling
const handleError = (error: unknown) => {
  const message = getErrorMessage(error);
  const status = getErrorStatus(error);
  console.error(`Error ${status}: ${message}`);
};

// Type guards
const processValue = (value: unknown) => {
  if (isString(value)) {
    return value.toUpperCase();
  }
  if (isNumber(value)) {
    return value.toString();
  }
  return 'Unknown';
};
```

## 🔧 Specific Migration Examples

### Calendar Components

#### ❌ Before
```typescript
const handleEventClick = (info: any) => {
  console.log(info.event.title);
};

const handleDateClick = (info: any) => {
  console.log(info.dateStr);
};
```

#### ✅ After
```typescript
import type { EventInfo, DateClickInfo } from '@/types/common';

const handleEventClick = (info: EventInfo) => {
  console.log(info.event.title);
};

const handleDateClick = (info: DateClickInfo) => {
  console.log(info.dateStr);
};
```

### API Calls

#### ❌ Before
```typescript
const fetchData = async (params: any): Promise<any> => {
  try {
    const response = await api.get('/api/tasks', { params });
    return response.data;
  } catch (error: any) {
    console.error(error.message);
    throw error;
  }
};
```

#### ✅ After
```typescript
import type { ApiResponse } from '@/types/common';
import { getErrorMessage } from '@/utils/typescript';

const fetchData = async (params: Record<string, unknown>): Promise<ApiResponse<Task[]>> => {
  try {
    const response = await api.get('/api/tasks', { params });
    return response.data;
  } catch (error: unknown) {
    console.error(getErrorMessage(error));
    throw error;
  }
};
```

### Component Props

#### ❌ Before
```typescript
interface MyComponentProps {
  data: any;
  config: {};
  onEvent: (event: any) => void;
}
```

#### ✅ After
```typescript
import type { EventHandler } from '@/utils/typescript';

interface MyComponentProps {
  data: Task[];
  config: {
    theme: 'light' | 'dark';
    size: 'sm' | 'md' | 'lg';
  };
  onEvent: EventHandler<CustomEvent>;
}
```

### Form Handling

#### ❌ Before
```typescript
const handleSubmit = (values: any) => {
  console.log(values);
};

const handleChange = (field: string, value: any) => {
  setFormData({ ...formData, [field]: value });
};
```

#### ✅ After
```typescript
interface FormValues {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
}

const handleSubmit = (values: FormValues) => {
  console.log(values);
};

const handleChange = (field: keyof FormValues, value: string) => {
  setFormData({ ...formData, [field]: value });
};
```

## 🚨 ESLint Configuration

The new `.eslintrc.js` provides:

### ✅ Strict Rules (Error Level)
- `@typescript-eslint/no-explicit-any: 'error'`
- `@typescript-eslint/no-unused-vars: 'error'`
- `@typescript-eslint/no-empty-interface: 'error'`

### ⚠️ Practical Rules (Warning Level)
- `@typescript-eslint/no-unsafe-assignment: 'warn'`
- `@typescript-eslint/no-unsafe-member-access: 'warn'`

### 🎯 Exceptions
- Test files: Relaxed rules for `*.test.ts`
- Config files: Relaxed rules for `*.config.js`
- Legacy files: Relaxed rules for `**/legacy/**/*`

## 🔍 Common Build Error Fixes

### Error: `Type 'any' is not allowed`

#### ❌ Problem
```typescript
const data: any = response.data;
```

#### ✅ Solutions
```typescript
// Option 1: Use unknown and type guards
const data: unknown = response.data;
if (isObject(data)) {
  // Now data is Record<string, unknown>
}

// Option 2: Define proper interface
interface ResponseData {
  id: string;
  name: string;
}
const data: ResponseData = response.data;

// Option 3: Use generic types
const data: ApiResponse<Task[]> = response.data;
```

### Error: `Unused variable/import`

#### ❌ Problem
```typescript
import React, { useState, useEffect } from 'react'; // useEffect unused
const [data, setData] = useState([]); // data unused
```

#### ✅ Solutions
```typescript
// Remove unused imports
import React, { useState } from 'react';

// Use underscore prefix for intentionally unused
const [_data, setData] = useState([]);

// Or remove completely if not needed
const [, setData] = useState([]);
```

### Error: `Empty interface`

#### ❌ Problem
```typescript
interface Props {}
```

#### ✅ Solutions
```typescript
// Option 1: Add properties
interface Props {
  className?: string;
  children?: React.ReactNode;
}

// Option 2: Use Record type
type Props = Record<string, never>;

// Option 3: Extend base interface
interface Props extends BaseComponentProps {}
```

## 🧪 Testing Your Fixes

### 1. Run TypeScript Check
```bash
npx tsc --noEmit
```

### 2. Run ESLint
```bash
npx eslint src/ --ext .ts,.tsx
```

### 3. Run Build
```bash
npm run build
```

### 4. Check Specific Files
```bash
npx eslint src/components/MyComponent.tsx
```

## 📋 Migration Checklist

### Phase 1: Critical Fixes
- [ ] Replace all `any` types in service files
- [ ] Fix empty object interfaces `{}`
- [ ] Remove unused imports in main components
- [ ] Add proper error handling types

### Phase 2: Component Props
- [ ] Define proper component prop interfaces
- [ ] Replace `any` in event handlers
- [ ] Add proper form value types
- [ ] Fix table column definitions

### Phase 3: API & Data
- [ ] Type all API response interfaces
- [ ] Add proper error handling
- [ ] Type all form data structures
- [ ] Add proper state management types

### Phase 4: Advanced Types
- [ ] Add generic type constraints
- [ ] Implement proper type guards
- [ ] Add utility type functions
- [ ] Optimize type inference

## 🎯 Best Practices

### ✅ DO
- Use `unknown` instead of `any` when type is truly unknown
- Create specific interfaces for component props
- Use type guards for runtime type checking
- Import types with `import type` syntax
- Use utility types from `@/utils/typescript`

### ❌ DON'T
- Use `any` type (causes build errors)
- Leave empty interfaces `{}`
- Keep unused imports/variables
- Ignore TypeScript errors
- Use `@ts-ignore` comments

## 🚀 Migration Tools

### Automated Fixes
```bash
# Fix unused imports
npx eslint src/ --ext .ts,.tsx --fix

# Remove unused variables (manual review needed)
npx tsc --noEmit --strict
```

### VS Code Extensions
- ESLint
- TypeScript Importer
- Auto Import - ES6, TS, JSX, TSX
- TypeScript Hero

## 📞 Troubleshooting

### Build Still Failing?

1. **Check ESLint output**:
   ```bash
   npx eslint src/ --ext .ts,.tsx --format=table
   ```

2. **Check TypeScript errors**:
   ```bash
   npx tsc --noEmit --pretty
   ```

3. **Clear cache and rebuild**:
   ```bash
   rm -rf .next node_modules/.cache
   npm install
   npm run build
   ```

4. **Check specific file**:
   ```bash
   npx tsc --noEmit src/path/to/problematic-file.tsx
   ```

This migration guide ensures your codebase passes strict TypeScript/ESLint checks while maintaining code quality and type safety! 🎉