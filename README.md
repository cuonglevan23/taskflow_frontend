# TaskManager - Route Management System

A comprehensive Next.js 14 project management application with advanced role-based route management, dynamic layouts, and permission-based access control.

## 🚀 Route Management Features

### Core Components

- **📁 Config-based Routes** - Centralized route definitions with metadata
- **🛡️ Enhanced Middleware** - Dynamic route protection and API authorization
- **🎨 Role-based Layouts** - Automatic layout switching based on user roles
- **🔐 Route Guards** - Client-side access control hooks and components
- **🧭 Smart Navigation** - Dynamic navigation generation and breadcrumbs

## 📋 Architecture Overview

```
src/
├── config/
│   └── routes.ts              # Central ROUTES configuration object
├── middleware/
│   └── auth.ts               # Enhanced middleware with route-based protection
├── hooks/
│   ├── useAuth.tsx           # Authentication context and hooks
│   └── useRouteGuard.tsx     # Route protection and permission hooks
├── components/
│   └── layout/
│       ├── RoleBasedLayout.tsx    # Dynamic layout switcher
│       ├── PublicLayout.tsx       # Public pages layout
│       ├── AdminLayout.tsx        # Admin dashboard layout
│       └── AuthLayout.tsx         # Authentication pages layout
├── lib/
│   └── navigation.ts         # Navigation utilities and helpers
└── constants/
    └── auth.ts              # Roles, permissions, and mappings
```

## 🛠️ Implementation

### 1. ROUTES Configuration

Central configuration object defining all application routes:

```typescript
export const ROUTES: Record<string, RouteConfig> = {
  PROJECTS: {
    path: "/owner/project",
    title: "Projects",
    layout: "dashboard",
    accessRoles: [
      UserRole.OWNER,
      UserRole.PM,
      UserRole.LEADER,
      UserRole.MEMBER,
    ],
    requiredPermissions: [Permission.VIEW_PROJECT],
    requiresAuth: true,
    isNavItem: true,
    icon: "folder",
  },
  ADMIN_DASHBOARD: {
    path: "/admin",
    title: "Admin Dashboard",
    layout: "admin",
    accessRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    requiresAuth: true,
    isNavItem: true,
    icon: "shield",
  },
  // ... more routes
};
```

### 2. Enhanced Middleware

Dynamic middleware that uses the ROUTES config for protection:

```typescript
// src/middleware/auth.ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userContext = getUserContext(request);
  const routeConfig = getRouteByPath(pathname);

  // Automatic route protection based on config
  if (routeConfig && userContext) {
    const hasAccess = hasRouteAccess(
      routeConfig,
      userContext.role,
      userContext.permissions
    );
    if (!hasAccess) {
      return NextResponse.redirect(
        new URL(getFallbackRoute(userContext.role, pathname), request.url)
      );
    }
  }

  return NextResponse.next();
}
```

### 3. Role-based Layouts

Automatic layout switching based on route configuration:

```typescript
// src/components/layout/RoleBasedLayout.tsx
export default function RoleBasedLayout({ children }) {
  const routeConfig = getRouteByPath(pathname);
  const layoutType = routeConfig?.layout || "public";

  switch (layoutType) {
    case "admin":
      return <AdminLayout>{children}</AdminLayout>;
    case "dashboard":
      return <DashboardLayout>{children}</DashboardLayout>;
    case "auth":
      return <AuthLayout>{children}</AuthLayout>;
    default:
      return <PublicLayout>{children}</PublicLayout>;
  }
}
```

### 4. Route Guards & Permissions

Client-side protection with hooks and components:

```typescript
// Route protection hook
const { hasAccess, isLoading } = useRouteGuard({
  requiredRoles: [UserRole.ADMIN],
  requiredPermissions: [Permission.MANAGE_USERS]
});

// Component protection
<RouteGuard requiredRoles={[UserRole.ADMIN]}>
  <AdminPanel />
</RouteGuard>

// Conditional rendering
<PermissionGate permissions={[Permission.CREATE_PROJECT]}>
  <CreateProjectButton />
</PermissionGate>
```

### 5. Dynamic Navigation

Smart navigation generation based on user permissions:

```typescript
// Generate navigation for current user
const navigation = generateNavigation(userRole, userPermissions, currentPath);

// Generate breadcrumbs
const breadcrumbs = generateBreadcrumbs(currentPath);

// Get contextual quick actions
const quickActions = getQuickActions(userRole, userPermissions, "dashboard");
```

## 🔐 User Roles & Permissions

### Roles Hierarchy

- **SUPER_ADMIN** - Full system access
- **ADMIN** - System administration
- **OWNER** - Workspace ownership
- **PM** - Project management
- **LEADER** - Team leadership
- **MEMBER** - Basic member access
- **GUEST** - Limited read-only access

### Permission Categories

- **System Management** - MANAGE_SYSTEM, VIEW_ANALYTICS
- **Workspace Management** - CREATE_WORKSPACE, MANAGE_WORKSPACE, DELETE_WORKSPACE
- **User Management** - INVITE_USERS, MANAGE_USERS, MANAGE_ROLES
- **Project Management** - CREATE_PROJECT, UPDATE_PROJECT, DELETE_PROJECT, VIEW_PROJECT
- **Task Management** - CREATE_TASK, ASSIGN_TASK, UPDATE_TASK, DELETE_TASK, VIEW_TASK
- **Resource Management** - MANAGE_RESOURCES, VIEW_RESOURCES
- **Reporting** - GENERATE_REPORTS, VIEW_REPORTS
- **Billing** - MANAGE_BILLING, VIEW_BILLING

## 🧭 Navigation Features

### Automatic Navigation Generation

- Role-based menu items
- Permission-filtered routes
- Contextual navigation
- Dynamic breadcrumbs
- Quick action buttons

### Programmatic Navigation

```typescript
// Navigate to specific routes
NavigationManager.goToRoute("PROJECTS");
NavigationManager.goToDefaultRoute(userRole);

// Check route access
if (
  NavigationManager.canAccessRoute("ADMIN_DASHBOARD", userRole, permissions)
) {
  // Navigate to admin
}
```

## 🚦 Usage Examples

### Basic Route Protection

```typescript
// Protect entire page
export default withRouteGuard(ProjectsPage, {
  requiredRoles: [UserRole.PM, UserRole.OWNER],
  requiredPermissions: [Permission.VIEW_PROJECT],
});
```

### Conditional Feature Display

```typescript
// Show/hide features based on permissions
<PermissionGate permissions={[Permission.DELETE_PROJECT]}>
  <DeleteProjectButton />
</PermissionGate>

<PermissionGate
  roles={[UserRole.ADMIN]}
  fallback={<p>Admin access required</p>}
>
  <AdminControls />
</PermissionGate>
```

### Dynamic Navigation

```typescript
// In your layout component
const navigation = generateNavigation(user.role, user.permissions, pathname);
const breadcrumbs = generateBreadcrumbs(pathname);

return (
  <div>
    <Sidebar sections={navigation} />
    <Breadcrumbs items={breadcrumbs} />
    <main>{children}</main>
  </div>
);
```

## 🎨 Layout System

### Automatic Layout Selection

- **Public Layout** - Marketing pages, landing page
- **Auth Layout** - Login, register, forgot password
- **Dashboard Layout** - Standard user dashboard
- **Admin Layout** - Administrative interface

### Layout Features

- Responsive design
- Role-specific navigation
- Contextual headers
- Permission-based menus
- Dynamic breadcrumbs

## 🛡️ Security Features

### Middleware Protection

- Route-level access control
- API endpoint protection
- Role-based redirects
- Permission validation
- Security headers

### Client-side Guards

- Component-level protection
- Permission-based rendering
- Route access hooks
- Fallback components
- Loading states

## 📊 Demo Component

View the complete implementation with the demo component:

```typescript
import RouteManagementDemo from "@/components/examples/RouteManagementDemo";

// Shows live examples of:
// - Role-based navigation
// - Permission checking
// - Dynamic breadcrumbs
// - Route access indicators
// - Component usage examples
```

## 🚀 Getting Started

1. **Configure Routes** - Define your routes in `src/config/routes.ts`
2. **Set up Middleware** - The middleware will automatically protect routes
3. **Add Layouts** - Create role-specific layouts as needed
4. **Use Guards** - Protect components with `RouteGuard` and `PermissionGate`
5. **Generate Navigation** - Use navigation utilities for dynamic menus

## 📈 Benefits

- **Scalable** - Easy to add new routes and permissions
- **Maintainable** - Centralized route configuration
- **Secure** - Multiple layers of protection
- **Flexible** - Supports complex permission hierarchies
- **Developer-friendly** - Type-safe with excellent IntelliSense

This route management system provides enterprise-grade access control while remaining developer-friendly and highly maintainable.
