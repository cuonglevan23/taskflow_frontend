# Session Optimization - Hướng dẫn sử dụng

## ❌ BEFORE (Duplicated Session Calls)

```typescript
// ❌ Mỗi hook/component gọi session riêng - tạo ra duplicate requests
import { useSession } from 'next-auth/react';
import { useSessionSWR } from '@/hooks/useSessionSWR';

// Component A
const { data: session } = useSession(); // Call 1: /api/auth/session

// Component B  
const { data: session } = useSessionSWR(); // Call 2: /api/auth/session

// Component C
fetch('/api/auth/session'); // Call 3: /api/auth/session
```

## ✅ AFTER (Single Session Source)

```typescript
// ✅ Chỉ 1 source duy nhất cho session
import { useSession } from '@/contexts/SessionContext';

// Tất cả components sử dụng cùng 1 hook
const { data: session, status, isLoading } = useSession();
```

## 🔧 Migration Guide

### 1. Thay thế imports

```typescript
// ❌ Old way
import { useSession } from 'next-auth/react';
import { useSessionSWR } from '@/hooks/useSessionSWR';

// ✅ New way
import { useSession } from '@/contexts/SessionContext';
// hoặc sử dụng optimized hook
import { useOptimizedSession } from '@/hooks/useOptimizedSession';
```

### 2. Cập nhật usage

```typescript
// ✅ Standard usage
const { data: session, status, isLoading } = useSession();

// ✅ Access user data safely
const user = sessionUtils.getUser(session);
const accessToken = sessionUtils.getAccessToken(session);
const isAuthenticated = sessionUtils.isAuthenticated(session);
```

### 3. Provider Setup

```typescript
// App được wrap với SessionProvider ở root level
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SessionProvider>
          <GlobalDataProvider>
            {children}
          </GlobalDataProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
```

## 📊 Performance Benefits

### Before
- 🔴 **10+ session API calls** trên mỗi page load
- 🔴 **No caching** giữa các components
- 🔴 **Duplicate requests** khi switch page
- 🔴 **Server overload** do excessive calls

### After  
- 🟢 **1 session API call** duy nhất với aggressive caching
- 🟢 **5 minute cache** - giảm 95% requests
- 🟢 **SWR deduplication** cho toàn bộ app
- 🟢 **Optimized provider hierarchy**

## 🛠 Utils Available

```typescript
import { sessionUtils } from '@/services/sessionService';

// Check authentication
const isAuth = sessionUtils.isAuthenticated(session);

// Get user safely
const user = sessionUtils.getUser(session);

// Get access token
const token = sessionUtils.getAccessToken(session);
```

## 🚫 Deprecated Patterns

### ❌ Don't use these anymore:

```typescript
// ❌ Direct fetch calls
fetch('/api/auth/session');

// ❌ NextAuth useSession for session data
import { useSession } from 'next-auth/react';

// ❌ useSessionSWR hook
import { useSessionSWR } from '@/hooks/useSessionSWR';

// ❌ Multiple context providers for same data
<UserContext>
  <SessionContext>
    <AuthContext> // Too many overlapping contexts
```

### ✅ Use these instead:

```typescript
// ✅ Unified session hook
import { useSession } from '@/contexts/SessionContext';

// ✅ Utility functions
import { sessionUtils } from '@/services/sessionService';

// ✅ For authentication actions only
import { signIn, signOut } from 'next-auth/react';
```

## 📝 Key Principles

1. **Single Source of Truth**: Chỉ SessionProvider làm source cho session data
2. **Aggressive Caching**: 5 minute cache với SWR deduplication  
3. **Centralized Logic**: SessionService handle tất cả session operations
4. **Type Safety**: Proper TypeScript với utility functions
5. **Performance First**: Minimize API calls, maximize cache usage

## 🔍 Monitoring

Check browser DevTools Network tab:
- ✅ Chỉ thấy 1 request `/api/auth/session` khi vào app
- ✅ Không có duplicate requests khi navigate
- ✅ Cache hit khi switch giữa các pages

## 🆘 Troubleshooting

### Session không update?
```typescript
// Force refresh session
const { mutate } = useSession();
await mutate();
```

### Need to access session in non-React code?
```typescript
import { sessionService } from '@/services/sessionService';

const session = await sessionService.getCachedSession();
```
