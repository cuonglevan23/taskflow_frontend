# 🚀 **Production Migration Guide - Spring Boot + JWT + Google OAuth**

## 📋 **Tổng quan thay đổi**

### **Hiện tại (Development):**
```
MockAuthProvider → Mock users → Test UI
```

### **Production (Real Backend):**
```
RealAuthProvider → Spring Boot API → JWT + Google OAuth → Real users
```

## 🔄 **Các bước migration:**

### **1. Backend Setup (Spring Boot)**

#### **Dependencies cần thêm:**
```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-client</artifactId>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.11.5</version>
</dependency>
```

#### **API Endpoints cần implement:**
```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleAuth(@RequestBody GoogleAuthRequest request) {
        // 1. Exchange code for Google user info
        // 2. Create/update user in database
        // 3. Generate JWT tokens
        // 4. Return user + tokens
    }
    
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Authentication auth) {
        // Return current authenticated user
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refreshToken(@RequestBody RefreshRequest request) {
        // Refresh JWT token
    }
    
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody LogoutRequest request) {
        // Invalidate refresh token
    }
}
```

### **2. Frontend Changes**

#### **A. Thay đổi Provider trong layout.tsx:**
```tsx
// BEFORE (Development)
<MockAuthProvider defaultRole="member" enableDevMode={true}>
  {children}
</MockAuthProvider>

// AFTER (Production)
<RealAuthProvider>
  {children}
</RealAuthProvider>
```

#### **B. Cập nhật usePermissions hook:**
```tsx
// BEFORE
import { useMockAuth } from '@/providers/MockAuthProvider';
const { user } = useMockAuth();

// AFTER  
import { useRealAuth } from '@/providers/RealAuthProvider';
const { user } = useRealAuth();
```

#### **C. Environment Variables:**
```bash
# .env.local
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### **3. Google OAuth Setup**

#### **Google Cloud Console:**
1. Tạo project mới hoặc chọn existing project
2. Enable Google+ API
3. Tạo OAuth 2.0 credentials
4. Thêm authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)

#### **Authorized JavaScript origins:**
- `http://localhost:3000` (development)
- `https://yourdomain.com` (production)

### **4. Database Schema**

#### **User Table:**
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    google_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    role ENUM('admin', 'owner', 'project_manager', 'leader', 'member') DEFAULT 'member',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE refresh_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🔧 **Implementation Steps**

### **Step 1: Setup Google OAuth**
```bash
# 1. Go to Google Cloud Console
# 2. Create OAuth 2.0 credentials
# 3. Add to .env.local
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here
```

### **Step 2: Update Frontend**
```tsx
// src/app/layout.tsx
import { RealAuthProvider } from '@/providers/RealAuthProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <RealAuthProvider>  {/* Changed from MockAuthProvider */}
          {children}
        </RealAuthProvider>
      </body>
    </html>
  );
}
```

### **Step 3: Update Permission Hook**
```tsx
// src/hooks/usePermissions.ts
import { useRealAuth } from '@/providers/RealAuthProvider';  // Changed

export const usePermissions = ({ contextType, contextId }: UsePermissionsProps = {}) => {
  const { user } = useRealAuth();  // Changed from useMockAuth
  // Rest of the code remains the same
};
```

### **Step 4: Test Authentication Flow**
1. User clicks "Login with Google"
2. Redirects to Google OAuth
3. User authorizes app
4. Google redirects to `/auth/callback?code=...`
5. Frontend sends code to backend `/api/auth/google`
6. Backend exchanges code for user info
7. Backend creates/updates user and generates JWT
8. Frontend receives JWT and user data
9. Frontend stores tokens and redirects to dashboard

## 🎯 **Key Benefits**

### **Seamless Migration:**
- ✅ All existing role-based components work unchanged
- ✅ All permission checks remain the same
- ✅ Only provider and auth service change
- ✅ UI components require no modifications

### **Production Ready:**
- ✅ Real JWT authentication
- ✅ Google OAuth integration
- ✅ Automatic token refresh
- ✅ Secure token storage
- ✅ Route protection middleware

### **Development Friendly:**
- ✅ Easy to switch between mock and real auth
- ✅ Environment-based configuration
- ✅ Comprehensive error handling
- ✅ TypeScript support

## 📝 **Migration Checklist**

### **Backend (Spring Boot):**
- [ ] Add OAuth2 and JWT dependencies
- [ ] Implement `/api/auth/google` endpoint
- [ ] Implement `/api/auth/me` endpoint  
- [ ] Implement `/api/auth/refresh` endpoint
- [ ] Implement `/api/auth/logout` endpoint
- [ ] Setup Google OAuth configuration
- [ ] Create user and refresh_tokens tables
- [ ] Add JWT token generation/validation
- [ ] Add CORS configuration for frontend

### **Frontend (Next.js):**
- [ ] Add Google OAuth environment variables
- [ ] Replace MockAuthProvider with RealAuthProvider
- [ ] Update usePermissions hook to use useRealAuth
- [ ] Add middleware.ts for route protection
- [ ] Test OAuth flow end-to-end
- [ ] Test token refresh functionality
- [ ] Test logout functionality
- [ ] Update login page with GoogleLoginButton

### **Google Cloud:**
- [ ] Create Google Cloud project
- [ ] Enable Google+ API
- [ ] Create OAuth 2.0 credentials
- [ ] Configure authorized redirect URIs
- [ ] Configure authorized JavaScript origins

## 🚀 **Result**

After migration, you'll have:
- **Real authentication** with Google OAuth
- **JWT-based** session management
- **Automatic token refresh**
- **All existing role-based UI** working unchanged
- **Production-ready** security

**The beauty is: All your existing role-based components, guards, and permissions will work exactly the same! 🎉**