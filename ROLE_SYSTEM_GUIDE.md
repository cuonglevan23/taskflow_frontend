# 🔐 Role-Based Access Control (RBAC) System Guide

## Tổng quan hệ thống

Hệ thống RBAC được thiết kế để quản lý quyền truy cập chặt chẽ dựa trên role từ backend. Backend trả về JWT với role trong payload, frontend parse và render UI tương ứng.

## 📋 Backend Integration

### JWT Token Structure
```json
{
  "roles": ["OWNER"],
  "userId": 22,
  "email": "user@gmail.com",
  "sub": "user@gmail.com",
  "iat": 1754840552,
  "exp": 1754841452
}
```

### Role Hierarchy (Từ thấp đến cao)
```
GUEST (10) < MEMBER (30) < LEADER (50) < PM (70) < OWNER (80) < ADMIN (90) < SUPER_ADMIN (100)
```

## 🏗️ Cấu trúc hệ thống

### 1. AuthProvider (`src/providers/AuthProvider.tsx`)
- Đọc role từ cookie `userRole` 
- Parse thành UserWithRole object
- Cung cấp context cho toàn app

### 2. RBAC Utilities (`src/utils/rbac.ts`)
- `normalizeRole()`: Convert backend role string → UserRole enum
- `hasPermission()`: Kiểm tra permission
- `canAccessRoute()`: Kiểm tra quyền truy cập route
- `RBACHelper`: Class helper với các method tiện lợi

### 3. RBAC Hooks (`src/hooks/useRBAC.ts`)
- `useRBAC()`: Hook chính để sử dụng trong components
- `usePermission()`: Kiểm tra permission cụ thể
- `useRole()`: Kiểm tra role cụ thể

### 4. RBAC Guards (`src/components/guards/RBACGuard.tsx`)
- `RBACGuard`: Guard tổng quát
- `OwnerGuard`: Chỉ cho Owner+
- `AdminGuard`: Chỉ cho Admin+
- `ManagerGuard`: Chỉ cho PM+

## 🎯 Sidebar Rendering Logic

### Navigation Config (`src/config/rbac-navigation.ts`)

```typescript
// Cấu trúc navigation item với RBAC
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  // RBAC properties
  allowedRoles?: UserRole[];          // Danh sách roles được phép
  requiredPermissions?: Permission[];  // Permissions cần thiết
  minimumRole?: UserRole;             // Role tối thiểu
}
```

### PrivateSidebar Rendering (`src/layouts/private/components/PrivateSidebar.tsx`)

```typescript
const rbac = useRBAC();

// 1. Lấy navigation sections dựa trên role
const navigationSections = useMemo(() => {
  const baseSections = getVisibleNavigationSections(rbac.user);
  
  // Cập nhật với dynamic data
  return baseSections.map(section => {
    // Update task count, projects list, etc.
    return section;
  });
}, [rbac.user, projects, taskStats]);

// 2. Render với guards
<RBACGuard
  roles={item.allowedRoles}
  minimumRole={item.minimumRole}
  permissions={item.requiredPermissions}
  showFallback={false}
>
  <NavigationItem {...item} />
</RBACGuard>
```

## 📝 Role-specific Navigation Items

### OWNER Role có quyền truy cập:

```typescript
// Main Navigation (Tất cả users)
✅ Home
✅ My Tasks  
✅ Inbox

// Owner-specific sections
✅ Portfolios (PM+)
✅ Goals (Leader+)  
✅ Projects (All users, filtered by role)
✅ Reporting (PM+)
✅ Teams (Leader+)
✅ Administration (Owner+)
✅ Owner Panel (Owner only)

// Quick actions
✅ Create Project
✅ Create Team  
✅ Invite Users

// Footer
✅ Billing/Upgrade links
✅ Role indicator with Crown icon
```

### Navigation filtering logic:

```typescript
export function getVisibleNavigationSections(user: UserWithRole | null): NavigationSection[] {
  return RBAC_NAVIGATION_SECTIONS.filter(section => {
    // Check section level permissions
    if (section.allowedRoles && !canAccessRoute(user, section.allowedRoles)) {
      return false;
    }
    
    if (section.minimumRole && !canAccessRoute(user, [section.minimumRole])) {
      return false;
    }
    
    // Filter items trong section
    const visibleItems = section.items.filter(item => {
      // Check item permissions
      return canAccessItem(user, item);
    });
    
    return visibleItems.length > 0;
  });
}
```

## 🐛 Debug & Troubleshooting

### 1. Kiểm tra Backend JWT
```bash
# Trong browser dev tools
# Application → Cookies → localhost → access_token
# Copy token và decode tại jwt.io
```

### 2. Debug Frontend Role Parsing
```typescript
// Sử dụng debug page
http://localhost:3000/debug-rbac

// Hoặc console debug
const rbac = useRBAC();
rbac.debug(); // In ra thông tin chi tiết
```

### 3. Common Issues và Solutions

#### Issue: Sidebar không hiển thị Owner sections
**Nguyên nhân:** Role không được parse đúng từ JWT
**Solution:**
```typescript
// Check OAuth callback đã decode JWT chưa
const jwtPayload = decodeJWT(finalToken);
const backendRole = jwtPayload?.roles?.[0]; // "OWNER"

// Check RBAC mapping
const normalizedRole = normalizeRole(backendRole); // UserRole.OWNER
```

#### Issue: Các guards không hoạt động
**Nguyên nhân:** Role mapping không đúng
**Solution:**
```typescript
// Update LEGACY_ROLE_MAPPING
export const LEGACY_ROLE_MAPPING = {
  'OWNER': UserRole.OWNER,  // Backend trả về uppercase
  'owner': UserRole.OWNER,  // Support lowercase
  // ... other mappings
};
```

#### Issue: Navigation items không render
**Nguyên nhân:** Icon components không đúng format
**Solution:**
```typescript
// Sử dụng React.createElement
icon: React.createElement(Crown, { size: 20, className: "text-gray-300" })

// Thay vì function reference
icon: Crown // ❌ Sẽ gây lỗi "Objects are not valid as React child"
```

## 🔄 Development Workflow

### 1. Test Role System
```bash
# 1. Login với OAuth
# 2. Check JWT payload trong dev tools
# 3. Verify role trong cookie userRole
# 4. Visit debug page để check parsing
http://localhost:3000/debug-rbac
```

### 2. Add New Role
```typescript
// 1. Add to UserRole enum (src/constants/auth.ts)
export enum UserRole {
  NEW_ROLE = 'NEW_ROLE',
}

// 2. Add permissions (src/constants/auth.ts)
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.NEW_ROLE]: [Permission.SOME_PERMISSION],
};

// 3. Add to hierarchy (src/utils/rbac.ts)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.NEW_ROLE]: 60,
};

// 4. Add to navigation (src/config/rbac-navigation.ts)
allowedRoles: [UserRole.NEW_ROLE],
```

### 3. Add New Permission
```typescript
// 1. Add to Permission enum
export enum Permission {
  NEW_PERMISSION = 'NEW_PERMISSION',
}

// 2. Assign to roles
[UserRole.OWNER]: [Permission.NEW_PERMISSION],

// 3. Use in guards
<RBACGuard permissions={[Permission.NEW_PERMISSION]}>
  Content
</RBACGuard>
```

## 📊 Current OWNER Role Expected Behavior

### ✅ Sidebar sections OWNER nên thấy:
```
📊 Home
✅ My Task
📥 Inbox
📈 Insights
  ├── 🎯 Goals (toàn org)
  ├── 📈 Reports (toàn org)
  └── 💼 Portfolios (toàn org)
📁 Projects (toàn org)
  ├── Project A
  ├── Project B
  └── Project C...
⚙️ Managements
  ├── 📁 Project Management
  ├── 👥 Team Management
  └── 👤 User Management
```

**Chi tiết các sections:**
1. **Main**: Home, My Task, Inbox (always visible)
2. **Insights**: Goals (toàn org), Reports (toàn org), Portfolios (toàn org)  
3. **Projects (toàn org)**: Dynamic list of all projects + Create project button
4. **Managements**: Project Management, Team Management, User Management
5. **Footer**: Crown icon, role indicator, upgrade links (for OWNER)

### ✅ Permissions OWNER nên có:
- MANAGE_WORKSPACE ✅
- MANAGE_USERS ✅  
- CREATE_PROJECT ✅
- MANAGE_TEAM ✅
- VIEW_REPORTS ✅
- MANAGE_BILLING ✅
- INVITE_USERS ✅
- DELETE_PROJECT ✅

### 🔧 Debug Steps for OWNER Role

1. **Check JWT Decode:**
   ```javascript
   // In browser console after login
   const token = document.cookie.split('access_token=')[1]?.split(';')[0];
   const payload = JSON.parse(atob(token.split('.')[1]));
   console.log('JWT Role:', payload.roles[0]); // Should be "OWNER"
   ```

2. **Check Cookie Storage:**
   ```javascript
   // Check userRole cookie
   const userRole = document.cookie.split('userRole=')[1]?.split(';')[0];
   console.log('Cookie Role:', decodeURIComponent(userRole)); // Should be "OWNER"
   ```

3. **Check Frontend Parsing:**
   ```javascript
   // In React component
   const rbac = useRBAC();
   console.log('Frontend Role:', rbac.role); // Should be "OWNER"  
   console.log('Is Owner:', rbac.isOwner); // Should be true
   ```

4. **Check Sidebar Sections:**
   ```javascript
   // Should show 8+ navigation sections
   const sections = getVisibleNavigationSections(rbac.user);
   console.log('Visible sections:', sections.length); // Should be 8+
   console.log('Section IDs:', sections.map(s => s.id));
   ```

## 🎯 Expected Result cho OWNER

Khi user login với OWNER role từ backend, sidebar sẽ hiển thị **đầy đủ các sections** với:
- Crown icon ở footer  
- Upgrade/billing links
- All navigation items có permission
- Quick action buttons (Create project, Create team, Invite users)
- Role indicator hiển thị "Owner"

Nếu không đúng, check theo debug steps ở trên! 🔍