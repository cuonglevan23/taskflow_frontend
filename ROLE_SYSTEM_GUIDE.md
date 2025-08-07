# 🔐 **Role-Based Access Control System - Complete Guide**

## 📋 **Overview**

Hệ thống RBAC hoàn chỉnh với 5 roles: **Admin**, **Owner**, **Project Manager**, **Leader**, **Member** và mock authentication để test frontend mà không cần backend.

## 🎯 **Quick Start**

### 1. **Truy cập Role Demo**
```
http://localhost:3001/role-demo
```

### 2. **Sử dụng DevRoleSwitcher**
- Component xuất hiện ở góc bottom-right trong development mode
- Click để mở panel chuyển đổi role
- Test ngay lập tức các permission khác nhau

### 3. **Import và sử dụng**
```tsx
import { usePermissions } from '@/hooks/usePermissions';
import { RoleGuard } from '@/components/auth/RoleGuard';
```

## 🏗️ **Architecture**

### **Role Hierarchy (Level System)**
```
Admin (100)           - Full system access
├── Owner (90)        - Organization management
├── Project Manager (70) - Project & team management  
├── Leader (50)       - Team leadership
└── Member (10)       - Basic task access
```

### **Permission System**
```typescript
// Resource-based permissions
RESOURCES: users, projects, tasks, teams, reports, settings, billing, portfolios, goals
ACTIONS: create, read, update, delete, manage, assign, approve, export, invite
```

## 🚀 **Usage Examples**

### **1. Component Guards**
```tsx
// Role-based rendering
<RoleGuard roles="admin" fallback={<div>Access Denied</div>}>
  <AdminPanel />
</RoleGuard>

// Minimum role level
<RoleGuard minimumRole="project_manager">
  <ManagementDashboard />
</RoleGuard>

// Permission-based
<RoleGuard resource="projects" action="create">
  <CreateProjectButton />
</RoleGuard>

// Multiple roles
<RoleGuard roles={['admin', 'owner']}>
  <ExecutiveDashboard />
</RoleGuard>
```

### **2. Convenience Components**
```tsx
import { AdminOnly, OwnerOnly, ManagerAndAbove, CanCreateProjects } from '@/components/auth/RoleGuard';

<AdminOnly>
  <AdminTools />
</AdminOnly>

<ManagerAndAbove>
  <ProjectManagement />
</ManagerAndAbove>

<CanCreateProjects>
  <CreateButton />
</CanCreateProjects>
```

### **3. Hook Usage**
```tsx
function MyComponent() {
  const { user, role, can, is } = usePermissions();

  // Permission checks
  if (can.createProjects) {
    // Show create project UI
  }

  // Role checks
  if (is.admin || is.owner) {
    // Show admin features
  }

  // Minimum role check
  if (is.atLeastProjectManager) {
    // Show management features
  }
}
```

### **4. Route Protection**
```tsx
import { ProtectedRoute, AdminRoute, ManagerRoute } from '@/components/auth/ProtectedRoute';

// Protect entire route
<ProtectedRoute roles="admin" redirectTo="/unauthorized">
  <AdminPage />
</ProtectedRoute>

// Convenience components
<AdminRoute>
  <AdminDashboard />
</AdminRoute>

<ManagerRoute>
  <ManagementTools />
</ManagerRoute>
```

## 🧪 **Mock Authentication System**

### **Mock Users Available**
```typescript
1. Admin User (admin@company.com) - Admin role
2. John Owner (owner@company.com) - Owner role  
3. Sarah Manager (pm@company.com) - Project Manager role
4. Mike Leader (leader@company.com) - Leader role
5. Anna Member (member@company.com) - Member role
```

### **Development Features**
```tsx
// Auto-login in development
<MockAuthProvider defaultRole="member" enableDevMode={true}>
  <App />
</MockAuthProvider>

// Role switcher component
<DevRoleSwitcher position="bottom-right" />

// Role indicator
<DevRoleIndicator />
```

### **API Simulation**
```tsx
const { login, logout, switchRole, switchUser } = useMockAuth();

// Login with specific role
await login('test@example.com', 'password', 'admin');

// Quick role switch (dev only)
switchRole('project_manager');

// Switch to different user
switchUser('2'); // Switch to Owner user
```

## 📊 **Permission Matrix**

| Feature | Admin | Owner | PM | Leader | Member |
|---------|-------|-------|----|---------| -------|
| Create Users | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage Projects | ✅ | ✅ | ✅ | ❌ | ❌ |
| Assign Tasks | ✅ | ✅ | ✅ | ✅ | ❌ |
| View Reports | ✅ | ✅ | ✅ | ✅ | ✅ |
| Export Reports | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manage Settings | ✅ | ✅ | ❌ | ❌ | ❌ |
| Billing Access | ✅ | ✅ | ❌ | ❌ | ❌ |

## 🎨 **UI Components**

### **Role-based Navigation**
```tsx
import { RoleBasedNavigation } from '@/components/layout/RoleBasedNavigation';

// Automatically shows/hides menu items based on permissions
<RoleBasedNavigation />
```

### **Role-based Buttons**
```tsx
import { RoleBasedButtons } from '@/components/examples/RoleBasedButtons';

// Buttons automatically enable/disable based on permissions
<RoleBasedButtons />
```

### **Role Display Utils**
```tsx
import { getRoleDisplayName, getRoleColor, getRoleIcon } from '@/utils/roleUtils';

const roleName = getRoleDisplayName('project_manager'); // "Project Manager"
const roleColor = getRoleColor('admin'); // "#dc2626"
const roleIcon = getRoleIcon('leader'); // "👥"
```

## 🔧 **Development Workflow**

### **1. Test Different Roles**
1. Go to `/role-demo`
2. Use DevRoleSwitcher to change roles
3. See how UI changes instantly
4. Test all permission combinations

### **2. Add New Permissions**
```typescript
// 1. Add to RESOURCES or ACTIONS in src/types/roles.ts
export const RESOURCES = {
  // ... existing
  NEW_RESOURCE: 'new_resource',
} as const;

// 2. Add to role configs
admin: {
  permissions: [
    // ... existing
    {
      resource: RESOURCES.NEW_RESOURCE,
      actions: [ACTIONS.MANAGE]
    }
  ]
}

// 3. Add to usePermissions hook
const can = useMemo(() => ({
  // ... existing
  manageNewResource: hasPermission(RESOURCES.NEW_RESOURCE, ACTIONS.MANAGE),
}), [hasPermission]);
```

### **3. Create New Role Guards**
```tsx
// Create convenience component
export const CanManageNewResource: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => (
  <RoleGuard resource="new_resource" action="manage">
    {children}
  </RoleGuard>
);
```

## 🚀 **Production Migration**

### **When Backend is Ready**
```typescript
// 1. Replace MockAuthProvider with real AuthProvider
<AuthProvider> // Instead of MockAuthProvider
  <App />
</AuthProvider>

// 2. Update usePermissions hook
const { user } = useAuthContext(); // Instead of useMockAuth()

// 3. All role guards and permissions work the same!
// No changes needed to components using RoleGuard, usePermissions, etc.
```

### **API Integration**
```typescript
// Real auth service
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data; // Should return { user: UserWithRole, token: string }
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data; // Should return UserWithRole
  }
};
```

## 📝 **Best Practices**

### **1. Use Semantic Guards**
```tsx
// ✅ Good - Clear intent
<CanCreateProjects>
  <CreateButton />
</CanCreateProjects>

// ❌ Avoid - Hard to understand
<RoleGuard resource="projects" action="create">
  <CreateButton />
</RoleGuard>
```

### **2. Provide Fallbacks**
```tsx
// ✅ Good - User knows why they can't see content
<RoleGuard roles="admin" fallback={<div>Admin access required</div>}>
  <AdminPanel />
</RoleGuard>

// ❌ Avoid - Content just disappears
<RoleGuard roles="admin">
  <AdminPanel />
</RoleGuard>
```

### **3. Use Minimum Role When Possible**
```tsx
// ✅ Good - Scales with role hierarchy
<RoleGuard minimumRole="project_manager">
  <ManagementTools />
</RoleGuard>

// ❌ Avoid - Need to update when adding roles
<RoleGuard roles={['admin', 'owner', 'project_manager']}>
  <ManagementTools />
</RoleGuard>
```

## 🎉 **Features**

✅ **5-tier role hierarchy** with level-based permissions  
✅ **Resource-action permission system** for granular control  
✅ **Mock authentication** for frontend development  
✅ **DevRoleSwitcher** for instant role testing  
✅ **Type-safe** with full TypeScript support  
✅ **React components** for easy integration  
✅ **Route protection** with automatic redirects  
✅ **Utility functions** for role management  
✅ **Production-ready** architecture  
✅ **Zero backend dependency** for development  

## 🔗 **Key Files**

- `src/types/roles.ts` - Role definitions and permissions
- `src/hooks/usePermissions.ts` - Permission management hook
- `src/components/auth/RoleGuard.tsx` - Component-level guards
- `src/components/auth/ProtectedRoute.tsx` - Route-level protection
- `src/providers/MockAuthProvider.tsx` - Mock authentication
- `src/components/dev/DevRoleSwitcher.tsx` - Development role switcher
- `src/utils/roleUtils.ts` - Role utility functions
- `src/app/(dashboard)/role-demo/page.tsx` - Demo page

**Ready to use! 🚀 Visit `/role-demo` to see it in action!**