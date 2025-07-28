# PageLayout & usePageNavigation

## Mô tả

PageLayout là một layout component chung có thể được sử dụng cho nhiều trang khác nhau. Component này sử dụng hook `usePageNavigation` để tự động render navigation items phù hợp cho từng trang, đồng thời tuân thủ chuẩn icons và theme của project.

## Cách sử dụng

### 1. Sử dụng layout có sẵn

Đối với các trang đã được config sẵn (inbox, mytask), chỉ cần wrap children với PageLayout:

```tsx
// src/app/example/layout.tsx
import React from "react";
import { PageLayout } from "@/layouts/page";

const ExampleLayout = ({ children }: { children: React.ReactNode }) => {
  return <PageLayout>{children}</PageLayout>;
};

export default ExampleLayout;
```

### 2. Thêm page mới với header sections

Để thêm page mới với navigation và header sections riêng:

```tsx
// src/layouts/page/hooks/usePageNavigation.tsx
import {
  ACTION_ICONS,
  LAYOUT_ICONS,
  NAVIGATION_ICONS,
} from "@/constants/icons";
import { THEME_COLORS } from "@/constants/theme";

// Thêm vào hook
if (pathname.startsWith("/projects")) {
  return {
    title: "Projects",
    navItems: [
      {
        label: "Overview",
        href: "/projects",
        icon: <LAYOUT_ICONS.grid className="w-4 h-4" />,
      },
      {
        label: "Tasks",
        href: "/projects/tasks",
      },
    ],
    actions: [
      {
        label: "Filter",
        icon: <ACTION_ICONS.filter className="w-4 h-4" />,
        variant: "ghost",
      },
      {
        label: "New Project",
        icon: <ACTION_ICONS.create className="w-4 h-4" />,
        variant: "primary",
      },
    ],
    headerSections: [
      {
        id: "project-stats",
        position: "top",
        content: <ProjectStatsWidget />,
        className: "mb-4",
      },
    ],
    headerInfo: {
      breadcrumbs: [
        {
          label: "Home",
          href: "/",
          icon: <NAVIGATION_ICONS.home className="w-4 h-4" />,
        },
        { label: "Projects" },
      ],
    },
  };
}
```

## Icon & Theme Usage

### Sử dụng Icons từ Constants

Luôn sử dụng icons từ `@/constants/icons` thay vì import trực tiếp từ lucide-react:

```tsx
import { ACTION_ICONS, STATUS_ICONS, LAYOUT_ICONS } from "@/constants/icons";

// ✅ Đúng
<ACTION_ICONS.filter className="w-4 h-4" />
<STATUS_ICONS.success className="w-4 h-4" />

// ❌ Sai
import { Filter } from "lucide-react";
<Filter className="w-4 h-4" />
```

### Sử dụng Theme Colors

Sử dụng colors từ `@/constants/theme` để maintain consistency:

```tsx
import { THEME_COLORS } from "@/constants/theme";

// ✅ Đúng
<div style={{ backgroundColor: THEME_COLORS.primary[500] }}>
<button style={{ color: THEME_COLORS.info[600] }}>

// ❌ Sai
<div className="bg-blue-500">
<button className="text-blue-600">
```

### Icon Categories Available

- **ACTION_ICONS**: create, filter, sort, search, edit, delete, etc.
- **STATUS_ICONS**: success, error, warning, info, pending, etc.
- **LAYOUT_ICONS**: grid, list, calendar, board, timeline, etc.
- **NAVIGATION_ICONS**: home, projects, tasks, inbox, etc.
- **USER_ICONS**: user, users, invite, owner, admin, etc.

## Interface

### NavigationItem

```tsx
interface NavigationItem {
  label: string;
  href: string;
  icon?: ReactNode;
}
```

### HeaderAction

```tsx
interface HeaderAction {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  variant?: "default" | "primary" | "ghost";
}
```

### BreadcrumbItem

```tsx
interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
}
```

### PageHeaderInfo

```tsx
interface PageHeaderInfo {
  avatar?: ReactNode;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  customContent?: ReactNode;
}
```

### HeaderSection

```tsx
interface HeaderSection {
  id: string;
  content: ReactNode;
  position?: "top" | "middle" | "bottom";
  className?: string;
}
```

### PageNavigationConfig

```tsx
interface PageNavigationConfig {
  title: string;
  navItems: NavigationItem[];
  actions: HeaderAction[];
  headerInfo?: PageHeaderInfo;
  showTabsPlus?: boolean;
  headerSections?: HeaderSection[];
}
```

## Header Sections

Header sections cho phép bạn render content tùy chỉnh ở các vị trí khác nhau:

- **top**: Render trên header chính (như inbox summary)
- **middle**: Render giữa title và navigation tabs
- **bottom**: Render dưới navigation tabs

## Styling

PageLayout tự động detect style và áp dụng:

- **Unified style**: Cả inbox và mytask đều sử dụng consistent layout
- **Responsive**: Tự động adapt cho mobile và desktop
- **Theme-aware**: Sử dụng theme colors từ constants

Style được áp dụng tự động dựa trên pathname và configuration.

## Best Practices

1. **Icons**: Luôn sử dụng từ constants, không import trực tiếp
2. **Colors**: Sử dụng THEME_COLORS thay vì hardcode values
3. **Consistency**: Follow semantic naming từ icon categories
4. **Performance**: Icons đã được optimized và cached
5. **Maintenance**: Centralized management giúp dễ update
