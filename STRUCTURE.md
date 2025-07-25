# 🏗️ **Cấu trúc Dự án TaskManager - Production Ready**

## 📁 **Cấu trúc Thư mục Mới**

```
src/
├── app/                          # Next.js App Router pages
├── layouts/                      # Layout system (NEW)
│   ├── index.ts                 # Export tất cả layouts
│   ├── types.ts                 # Layout types riêng biệt
│   ├── RoleBasedLayout.tsx      # Main layout switcher
│   ├── public/                  # Public layout system
│   │   ├── PublicLayout.tsx
│   │   └── components/
│   │       ├── PublicHeader.tsx
│   │       └── PublicFooter.tsx
│   └── private/                 # Private layout system
│       ├── PrivateLayout.tsx
│       ├── context/
│       │   └── PrivateLayoutContext.tsx
│       ├── hooks/
│       │   └── usePrivateLayout.tsx
│       └── components/
│           ├── PrivateLayoutContent.tsx
│           ├── PrivateHeader.tsx
│           ├── PrivateSidebar.tsx
│           └── PrivateMain.tsx
├── types/                        # Type definitions theo domain
│   ├── index.ts                 # Export tất cả types
│   ├── auth.ts                  # Auth-related types
│   ├── layout.ts                # Layout types (moved)
│   ├── ui.ts                    # UI component types
│   ├── api.ts                   # API types
│   └── task.ts                  # Task types
├── hooks/                        # Custom hooks theo domain
│   ├── index.ts                 # Export tất cả hooks
│   ├── auth/
│   │   └── useAuth.tsx          # Authentication hooks
│   ├── api/
│   │   ├── useApi.tsx           # Generic API hook
│   │   └── useMutation.tsx      # Mutation hook
│   └── ui/
│       ├── useDisclosure.tsx    # Modal/dropdown state
│       ├── useLocalStorage.tsx  # LocalStorage hook
│       └── useDebounce.tsx      # Debounce hook
├── components/
│   ├── ui/                      # Shared UI components
│   │   ├── index.ts             # Export tất cả UI components
│   │   ├── Button/
│   │   │   └── Button.tsx       # Production-ready Button
│   │   ├── Input/
│   │   ├── Modal/
│   │   ├── Table/
│   │   └── ...
│   ├── atoms/                   # Atomic design components
│   ├── molecules/
│   ├── organisms/
│   └── templates/
└── ... (other folders)
```

## 🎯 **Nguyên tắc Tổ chức Mới**

### **1. Separation of Concerns**

- **`layouts/`**: Tất cả logic layout (public vs private)
- **`types/`**: Types theo domain, không trộn lẫn
- **`hooks/`**: Custom hooks theo chức năng cụ thể
- **`components/ui/`**: Shared components có thể tái sử dụng

### **2. Domain-Driven Structure**

```typescript
// ❌ BAD: Trộn lẫn types
types/layout.ts // Chứa cả auth, layout, UI types

// ✅ GOOD: Tách theo domain
types/
├── auth.ts      // Auth types only
├── layout.ts    // Layout types only
├── ui.ts        // UI component types only
└── api.ts       // API types only
```

### **3. Export Pattern**

```typescript
// Mỗi folder có index.ts để export
// types/index.ts
export * from "./auth";
export * from "./layout";
export * from "./ui";

// Usage
import { User, ButtonProps, ApiResponse } from "@/types";
```

## 🚀 **Cách Sử dụng Cấu trúc Mới**

### **1. Import Layouts**

```typescript
// ✅ Clean imports
import { PublicLayout, PrivateLayout } from "@/layouts";

// ✅ Layout types
import { PublicLayoutProps, PrivateLayoutProps } from "@/layouts/types";
```

### **2. Import Types**

```typescript
// ✅ Import types theo domain
import { User, AuthContextValue } from "@/types/auth";
import { ButtonProps, ModalProps } from "@/types/ui";
import { ApiResponse } from "@/types/api";

// ✅ Hoặc import tất cả từ index
import { User, ButtonProps, ApiResponse } from "@/types";
```

### **3. Import Hooks**

```typescript
// ✅ Import hooks theo domain
import { useAuth } from "@/hooks/auth/useAuth";
import { useDisclosure } from "@/hooks/ui/useDisclosure";
import { useApi } from "@/hooks/api/useApi";

// ✅ Hoặc từ index
import { useAuth, useDisclosure, useApi } from "@/hooks";
```

### **4. Import UI Components**

```typescript
// ✅ Import components
import { Button, Modal, Table } from "@/components/ui";
```

## 🎨 **Layout System Mới**

### **Public Layout**

```typescript
// Cho trang landing, login, register
<PublicLayout showHeader={true} showFooter={true} headerVariant="transparent">
  {children}
</PublicLayout>
```

### **Private Layout**

```typescript
// Cho trang dashboard, projects, tasks
<PrivateLayout
  showBreadcrumbs={true}
  enableSearch={true}
  enableNotifications={true}
  sidebarVariant="default"
>
  {children}
</PrivateLayout>
```

### **Context Usage**

```typescript
// Trong private layout components
import {
  useLayoutContext,
  useLayoutActions,
} from "@/layouts/private/context/PrivateLayoutContext";

function MyComponent() {
  const { user, navigation } = useLayoutContext();
  const { toggleSidebar } = useLayoutActions();
}
```

## 🔧 **Hook Patterns**

### **Auth Hook**

```typescript
function LoginPage() {
  const { login, isLoading, user } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      // User is now logged in
    } catch (error) {
      // Handle error
    }
  };
}
```

### **API Hook**

```typescript
function ProjectList() {
  const { data: projects, loading, error, refetch } = useApi<Project[]>('/api/projects');

  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return <div>{projects?.map(project => ...)}</div>;
}
```

### **UI Hook**

```typescript
function MyModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button onClick={onOpen}>Open Modal</Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        Modal content
      </Modal>
    </>
  );
}
```

## 📦 **Production Ready Features**

### **Type Safety**

- ✅ Strict TypeScript configuration
- ✅ Domain-specific type definitions
- ✅ Proper interface inheritance
- ✅ Generic type support

### **Performance**

- ✅ Lazy loading components
- ✅ Context optimization
- ✅ Memoized hooks
- ✅ Debounced inputs

### **Accessibility**

- ✅ ARIA attributes
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Screen reader support

### **Testing Ready**

- ✅ Component isolation
- ✅ Hook testing utilities
- ✅ Mock data structures
- ✅ Type-safe test helpers

## 🎯 **Best Practices**

### **1. Component Organization**

```typescript
// ✅ GOOD: Single responsibility
components/ui/Button/
├── Button.tsx
├── Button.types.ts
├── Button.test.tsx
└── index.ts

// ❌ BAD: Mixed concerns
components/Button.tsx (everything in one file)
```

### **2. Hook Naming**

```typescript
// ✅ GOOD: Clear purpose
useAuth(); // Authentication
useApi(); // API calls
useDisclosure(); // Modal/dropdown state

// ❌ BAD: Generic names
useData();
useState();
useUtils();
```

### **3. Type Imports**

```typescript
// ✅ GOOD: Type-only imports
import type { User } from "@/types/auth";
import type { ButtonProps } from "@/types/ui";

// ✅ GOOD: Runtime imports
import { Button } from "@/components/ui";
import { useAuth } from "@/hooks";
```

## 🚀 **Migration Guide**

### **Old → New Import Paths**

```typescript
// OLD
import { PrivateLayoutProps } from "@/types/layout";
import PrivateLayout from "@/components/layout/PrivateLayout";

// NEW
import { PrivateLayoutProps } from "@/layouts/types";
import { PrivateLayout } from "@/layouts";
```

### **Component Updates**

```typescript
// OLD: Complex prop drilling
<PrivateLayout user={user} navigation={nav} />

// NEW: Context-based
<PrivateLayout>
  {children} // Context provides user, navigation automatically
</PrivateLayout>
```

---

## 🎉 **Lợi ích Cấu trúc Mới**

✅ **Scalable**: Dễ mở rộng khi dự án lớn  
✅ **Maintainable**: Code dễ bảo trì và debug  
✅ **Type-safe**: TypeScript strict mode  
✅ **Reusable**: Components có thể tái sử dụng  
✅ **Testable**: Dễ viết unit tests  
✅ **Performance**: Optimized re-renders  
✅ **Developer Experience**: Autocomplete và IntelliSense tốt hơn

Cấu trúc này sẵn sàng cho production và có thể scale cho team lớn! 🚀
