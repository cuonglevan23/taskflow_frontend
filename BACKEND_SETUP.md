# Backend Setup Guide

## Spring Boot CORS Configuration

### 1. Add CORS Configuration Class

Create `src/main/java/com/example/taskmanagement_backend/config/CorsConfig.java`:

```java
package com.example.taskmanagement_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000") // Next.js frontend
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOrigin("http://localhost:3000");
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
```

### 2. Update TaskController with CORS

```java
package com.example.taskmanagement_backend.controllers;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:3000") // Add this line
public class TaskController {
    // ... your existing code
}
```

### 3. Check Application Properties

Make sure `application.properties` or `application.yml` has:

```properties
server.port=8080
spring.datasource.url=jdbc:h2:mem:testdb
spring.jpa.hibernate.ddl-auto=update
```

### 4. Test Backend Endpoints

Test your backend is working:

```bash
# Test GET all tasks
curl -X GET http://localhost:8080/api/tasks

# Test POST create task
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "description": "Test Description",
    "status": "PENDING",
    "priority": "MEDIUM",
    "deadline": "2024-01-15",
    "creatorId": 1
  }'
```

## Common Issues

### 403 Forbidden
- CORS not configured
- Authentication required
- Wrong HTTP method
- Wrong endpoint URL

### 404 Not Found
- Backend not running
- Wrong port (should be 8080)
- Wrong endpoint path

### 500 Internal Server Error
- Database connection issues
- Missing required fields
- Validation errors