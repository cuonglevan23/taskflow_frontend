# Hướng Dẫn Triển Khai Authentication Bảo Mật

## Bỏ NextAuth.js - Chỉ Dùng Backend JWT với HTTP-Only Cookies

### ⚠️ Tại Sao Không Dùng localStorage?
- **XSS Attack**: JavaScript có thể đọc localStorage
- **Cross-site scripting**: Malicious script có thể steal token
- **No expiration control**: Token có thể tồn tại mãi mãi

### ✅ Giải Pháp Bảo Mật: HTTP-Only Cookies
- **XSS Protection**: JavaScript không thể đọc HTTP-only cookies
- **Auto expiration**: Cookie tự động expire
- **CSRF Protection**: Có thể kết hợp với CSRF token

## 1. Backend Implementation - Cập nhật để sử dụng Cookies

### Cập nhật GoogleOAuth2Controller để set cookies:

```java
@GetMapping("/callback")
public void handleGoogleCallback(
        @RequestParam("code") String code,
        @RequestParam("state") String state,
        HttpServletRequest request,
        HttpServletResponse response) throws IOException {
    
    try {
        log.info("Processing Google OAuth2 callback for state: {}", state);
        
        String deviceInfo = extractDeviceInfo(request);
        TokenResponseDto tokenResponse = googleOAuth2Service.handleCallback(code, state, deviceInfo);
        
        // Set HTTP-only cookies thay vì redirect với token trong URL
        setAuthCookies(response, tokenResponse);
        
        log.info("Successfully authenticated user via Google OAuth2: {}", tokenResponse.getUserInfo().getEmail());
        
        // Redirect về frontend mà không expose token
        String frontendUrl = this.frontendUrl + "/auth/success";
        response.sendRedirect(frontendUrl);
        
    } catch (Exception e) {
        log.error("OAuth2 callback failed: {}", e.getMessage(), e);
        String errorUrl = frontendUrl + "/auth/error?message=" + URLEncoder.encode(e.getMessage(), StandardCharsets.UTF_8);
        response.sendRedirect(errorUrl);
    }
}

private void setAuthCookies(HttpServletResponse response, TokenResponseDto tokenResponse) {
    // Access Token Cookie (HTTP-only, Secure, Short expiration)
    Cookie accessTokenCookie = new Cookie("accessToken", tokenResponse.getAccessToken());
    accessTokenCookie.setHttpOnly(true);  // Prevent XSS
    accessTokenCookie.setSecure(true);    // HTTPS only
    accessTokenCookie.setPath("/");
    accessTokenCookie.setMaxAge(15 * 60); // 15 minutes
    accessTokenCookie.setSameSite(Cookie.SameSite.STRICT); // CSRF protection
    response.addCookie(accessTokenCookie);
    
    // Refresh Token Cookie (HTTP-only, Secure, Longer expiration)  
    Cookie refreshTokenCookie = new Cookie("refreshToken", tokenResponse.getRefreshToken());
    refreshTokenCookie.setHttpOnly(true);
    refreshTokenCookie.setSecure(true);
    refreshTokenCookie.setPath("/api/auth/refresh"); // Only sent to refresh endpoint
    refreshTokenCookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
    refreshTokenCookie.setSameSite(Cookie.SameSite.STRICT);
    response.addCookie(refreshTokenCookie);
}
```

### Cập nhật JwtAuthenticationFilter để đọc từ cookies:

```java
@Override
protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {
    
    String requestPath = request.getRequestURI();
    if (isPublicEndpoint(requestPath)) {
        filterChain.doFilter(request, response);
        return;
    }
    
    String jwt = null;
    String email = null;

    // Đọc JWT từ cookie thay vì Authorization header
    Cookie[] cookies = request.getCookies();
    if (cookies != null) {
        for (Cookie cookie : cookies) {
            if ("accessToken".equals(cookie.getName())) {
                jwt = cookie.getValue();
                break;
            }
        }
    }
    
    // Fallback: vẫn support Authorization header cho API clients
    if (jwt == null) {
        final String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
        }
    }

    if (jwt != null) {
        email = this.jwtService.extractEmail(jwt);
    }

    if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
        try {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(email);

            if (jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } catch (Exception e) {
            log.error("Cannot set user authentication: {}", e.getMessage());
            
            // Clear invalid cookie
            if (jwt != null) {
                clearAuthCookies(response);
            }
        }
    }

    filterChain.doFilter(request, response);
}

private void clearAuthCookies(HttpServletResponse response) {
    Cookie accessTokenCookie = new Cookie("accessToken", "");
    accessTokenCookie.setMaxAge(0);
    accessTokenCookie.setPath("/");
    response.addCookie(accessTokenCookie);
    
    Cookie refreshTokenCookie = new Cookie("refreshToken", "");
    refreshTokenCookie.setMaxAge(0);
    refreshTokenCookie.setPath("/api/auth/refresh");
    response.addCookie(refreshTokenCookie);
}
```

### Cập nhật AuthController để xử lý cookie-based auth:

```java
@PostMapping("/refresh")
public ResponseEntity<Void> refreshToken(HttpServletRequest request, HttpServletResponse response) {
    try {
        // Đọc refresh token từ cookie
        String refreshToken = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refreshToken".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }
        
        if (refreshToken == null) {
            return ResponseEntity.unauthorized().build();
        }
        
        String deviceInfo = extractDeviceInfo(request);
        TokenResponseDto tokenResponse = tokenRefreshService.refreshAccessToken(refreshToken, deviceInfo);
        
        // Set new access token cookie
        setAuthCookies(response, tokenResponse);
        
        return ResponseEntity.ok().build();
        
    } catch (Exception e) {
        log.error("Token refresh failed: {}", e.getMessage());
        clearAuthCookies(response);
        return ResponseEntity.unauthorized().build();
    }
}

@PostMapping("/logout")
public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
    try {
        // Đọc refresh token từ cookie để revoke
        String refreshToken = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refreshToken".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }
        
        if (refreshToken != null) {
            tokenRefreshService.revokeRefreshToken(refreshToken);
        }
        
        // Clear cookies
        clearAuthCookies(response);
        
        return ResponseEntity.ok().build();
        
    } catch (Exception e) {
        log.error("Logout failed: {}", e.getMessage());
        clearAuthCookies(response);
        return ResponseEntity.ok().build();
    }
}

@GetMapping("/check")
@Operation(summary = "Check authentication status")
public ResponseEntity<Map<String, Object>> checkAuth(Authentication authentication) {
    if (authentication != null && authentication.isAuthenticated()) {
        Map<String, Object> response = new HashMap<>();
        response.put("authenticated", true);
        response.put("user", authentication.getName());
        return ResponseEntity.ok(response);
    }
    return ResponseEntity.unauthorized().build();
}

private void setAuthCookies(HttpServletResponse response, TokenResponseDto tokenResponse) {
    // Access Token Cookie
    Cookie accessTokenCookie = new Cookie("accessToken", tokenResponse.getAccessToken());
    accessTokenCookie.setHttpOnly(true);
    accessTokenCookie.setSecure(true);
    accessTokenCookie.setPath("/");
    accessTokenCookie.setMaxAge(15 * 60); // 15 minutes
    response.addCookie(accessTokenCookie);
    
    // Refresh Token Cookie
    Cookie refreshTokenCookie = new Cookie("refreshToken", tokenResponse.getRefreshToken());
    refreshTokenCookie.setHttpOnly(true);
    refreshTokenCookie.setSecure(true);
    refreshTokenCookie.setPath("/api/auth/refresh");
    refreshTokenCookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
    response.addCookie(refreshTokenCookie);
}

private void clearAuthCookies(HttpServletResponse response) {
    Cookie accessTokenCookie = new Cookie("accessToken", "");
    accessTokenCookie.setMaxAge(0);
    accessTokenCookie.setPath("/");
    response.addCookie(accessTokenCookie);
    
    Cookie refreshTokenCookie = new Cookie("refreshToken", "");
    refreshTokenCookie.setMaxAge(0);
    refreshTokenCookie.setPath("/api/auth/refresh");
    response.addCookie(refreshTokenCookie);
}
```

## 2. Frontend Implementation - Cookie-based

### AuthService (không cần localStorage):

```typescript
// auth.ts - Secure cookie-based authentication
export class AuthService {
  
  // Google Login
  static async loginWithGoogle() {
    try {
      const response = await fetch('/api/auth/google/url');
      const { authUrl } = await response.json();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Google login failed:', error);
    }
  }

  // Check authentication status
  static async checkAuth(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/check', {
        method: 'GET',
        credentials: 'include', // Important: include cookies
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Get user info (từ backend)
  static async getUserInfo() {
    try {
      const response = await fetch('/api/auth/check', {
        credentials: 'include',
      });
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // Logout
  static async logout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Include cookies
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      window.location.href = '/login';
    }
  }

  // Auto refresh token (optional - browser tự động handle)
  static async refreshToken() {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// API Client với auto cookies
export class ApiClient {
  private static async request(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Automatically include cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Handle token expiration
    if (response.status === 401) {
      // Try to refresh token
      const refreshed = await AuthService.refreshToken();
      if (!refreshed) {
        // Refresh failed, redirect to login
        window.location.href = '/login';
        return;
      }
      
      // Retry original request
      return fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
    }

    return response;
  }

  // Tasks API
  static async getTasks() {
    const response = await this.request('/api/tasks');
    return response?.json();
  }

  static async createTask(task: any) {
    const response = await this.request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
    return response?.json();
  }

  // Projects API
  static async getProjects() {
    const response = await this.request('/api/projects');
    return response?.json();
  }

  static async createProject(project: any) {
    const response = await this.request('/api/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
    return response?.json();
  }
}
```

### React Components:

```tsx
// LoginPage.tsx
import React from 'react';
import { AuthService } from './auth';

const LoginPage = () => {
  return (
    <div className="login-container">
      <h1>Đăng Nhập</h1>
      <button 
        onClick={AuthService.loginWithGoogle}
        className="google-login-btn"
      >
        🔑 Đăng nhập với Google
      </button>
    </div>
  );
};

// AuthSuccess.tsx - Xử lý sau khi callback thành công
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from './auth';

const AuthSuccessPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      const isAuthenticated = await AuthService.checkAuth();
      if (isAuthenticated) {
        navigate('/dashboard');
      } else {
        navigate('/login?error=auth_failed');
      }
    };

    verifyAuth();
  }, [navigate]);

  return <div>Đang xử lý đăng nhập...</div>;
};

// ProtectedRoute.tsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthService } from './auth';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await AuthService.checkAuth();
      setIsAuthenticated(authenticated);
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

// TasksPage.tsx
import React, { useEffect, useState } from 'react';
import { ApiClient } from './auth';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await ApiClient.getTasks();
        setTasks(data || []);
      } catch (error) {
        console.error('Failed to load tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  if (loading) return <div>Loading tasks...</div>;

  return (
    <div>
      <h1>Nhiệm Vụ</h1>
      {tasks.map(task => (
        <div key={task.id}>{task.title}</div>
      ))}
    </div>
  );
};
```

### Route Setup:

```tsx
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/success" element={<AuthSuccessPage />} />
        <Route path="/auth/error" element={<AuthErrorPage />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/tasks" element={
          <ProtectedRoute>
            <TasksPage />
          </ProtectedRoute>
        } />
        
        <Route path="/projects" element={
          <ProtectedRoute>
            <ProjectsPage />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
```

## 3. CORS Configuration

### Cập nhật CORS để support credentials:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOriginPatterns(List.of("http://localhost:3000", "https://yourdomain.com"));
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(List.of("*"));
    configuration.setAllowCredentials(true); // Important: Allow cookies
    configuration.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

## ✅ Lợi Ích Của Cookie-based Authentication

🔒 **Bảo mật cao**: 
- HTTP-only cookies không thể đọc từ JavaScript
- CSRF protection với SameSite=Strict
- Auto expiration

⚡ **Tự động hóa**:
- Browser tự động gửi cookies
- Không cần manually manage tokens
- Auto refresh token

🛡️ **XSS Protection**:
- Malicious scripts không thể steal tokens
- Secure flag chỉ gửi qua HTTPS

## 📝 Migration Steps

1. ✅ Cập nhật backend: GoogleOAuth2Controller, JwtAuthenticationFilter, AuthController
2. ✅ Cập nhật CORS config để allow credentials  
3. ✅ Implement frontend AuthService và ApiClient mới
4. ✅ Test login flow: Google → Cookies → API calls
5. ✅ Remove NextAuth.js dependency

Với approach này, bạn sẽ có authentication system vừa đơn giản vừa bảo mật cao! 🚀
