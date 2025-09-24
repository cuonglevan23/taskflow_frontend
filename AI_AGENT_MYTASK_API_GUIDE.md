# AI Agent - MyTask API Integration Guide

## 📋 Overview
This guide provides comprehensive instructions for AI agents to interact with the MyTask API system. The AI agent must follow strict validation rules and provide intelligent defaults when users don't provide complete information.

## 🔑 Core API Endpoints

### 1. Create My Task
**Endpoint**: `POST /api/tasks/my-tasks`
**Purpose**: Create a new personal task for the authenticated user

#### Required Fields (MUST ask user if missing):
- ✅ **title** (String) - Task title/name
  - **Validation**: Cannot be null or empty
  - **AI Action**: If missing, MUST ask: "What would you like to name this task?"

#### Optional Fields with Smart Defaults:
- **description** (String) - Detailed task description
  - **Default**: null (can be empty)
  - **AI Action**: Can proceed without asking

- **deadline** (LocalDate) - Task due date
  - **Default**: Current date if not provided
  - **AI Action**: If missing, set to today and inform user: "I've set the deadline to today. You can change it later if needed."

- **priority** (TaskPriority enum) - Task importance level
  - **Options**: LOW, MEDIUM, HIGH, URGENT
  - **Default**: MEDIUM
  - **AI Action**: If missing, use MEDIUM and inform user: "I've set the priority to MEDIUM. You can adjust it if needed."

- **assignee** (User) - Who is responsible for the task
  - **Default**: Current authenticated user
  - **AI Action**: Automatically assign to current user

- **startDate** (LocalDate) - When to start the task
  - **Default**: null (can start anytime)
  - **AI Action**: Can proceed without asking

- **comment** (String) - Additional notes
  - **Default**: null
  - **AI Action**: Can proceed without asking

- **isPublic** (Boolean) - Visibility on profile page
  - **Default**: false
  - **AI Action**: Keep private by default

#### Request Example:
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation for the new features",
  "deadline": "2025-09-30",
  "priority": "HIGH",
  "startDate": "2025-09-24",
  "comment": "Focus on user-facing APIs first",
  "isPublic": false
}
```

#### Success Response (200 OK):
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": 123,
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation for the new features",
    "status": "TODO",
    "priority": "HIGH",
    "deadline": "2025-09-30",
    "createdAt": "2025-09-24T10:30:00",
    "creator": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

#### Error Responses:
```json
// Missing required title
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "title": "Task title is required"
  }
}

// Invalid priority
{
  "success": false,
  "message": "Invalid priority value",
  "errors": {
    "priority": "Priority must be one of: LOW, MEDIUM, HIGH, URGENT"
  }
}

// Invalid date format
{
  "success": false,
  "message": "Invalid date format",
  "errors": {
    "deadline": "Date must be in format YYYY-MM-DD"
  }
}
```

### 2. Get My Tasks (Paginated)
**Endpoint**: `GET /api/tasks/my-tasks`
**Purpose**: Retrieve all tasks for the current user with pagination

#### Query Parameters:
- **page** (int, default: 0) - Pagination page number
- **size** (int, default: 10) - Items per page
- **sortBy** (String, default: "updatedAt") - Sort field
- **sortDir** (String, default: "desc") - Sort direction (asc/desc)

#### Success Response (200 OK):
```json
{
  "content": [
    {
      "id": 123,
      "title": "Complete project documentation",
      "description": "Write comprehensive API documentation",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "deadline": "2025-09-30",
      "createdAt": "2025-09-24T10:30:00",
      "updatedAt": "2025-09-24T14:15:00"
    }
  ],
  "pageable": {
    "sort": {
      "sorted": true,
      "unsorted": false
    },
    "pageNumber": 0,
    "pageSize": 10
  },
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "last": true,
  "numberOfElements": 1
}
```

### 3. Get My Tasks Summary
**Endpoint**: `GET /api/tasks/my-tasks/summary`
**Purpose**: Get summarized view of user's tasks

#### Query Parameters:
- **page** (int, default: 0) - Pagination page number
- **size** (int, default: 20) - Items per page
- **sortBy** (String, default: "updatedAt") - Sort field
- **sortDir** (String, default: "desc") - Sort direction

#### Success Response (200 OK):
```json
{
  "content": [
    {
      "id": 123,
      "title": "Complete project documentation",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "deadline": "2025-09-30",
      "progress": 65
    }
  ],
  "totalElements": 1,
  "totalPages": 1
}
```

### 4. Get My Tasks Statistics
**Endpoint**: `GET /api/tasks/my-tasks/stats`
**Purpose**: Get statistical overview of user's tasks

#### Success Response (200 OK):
```json
{
  "totalTasks": 15,
  "completedTasks": 8,
  "inProgressTasks": 4,
  "todoTasks": 2,
  "overdueTasks": 1,
  "completionRate": 53.3,
  "averageCompletionTime": 5.2,
  "tasksByPriority": {
    "HIGH": 3,
    "MEDIUM": 8,
    "LOW": 4
  },
  "upcomingDeadlines": [
    {
      "id": 123,
      "title": "Complete project documentation",
      "deadline": "2025-09-30",
      "daysLeft": 6
    }
  ]
}
```

### 5. Update My Task
**Endpoint**: `PUT /api/tasks/my-tasks/{id}`
**Purpose**: Update an existing personal task

#### AI Validation Rules:
- **title**: If user wants to change title, MUST provide new title
- **deadline**: Can be updated to future dates, warn if setting to past date
- **priority**: Validate against enum values
- **status**: Validate against available status values

#### Request Example:
```json
{
  "title": "Complete project documentation - Updated",
  "priority": "URGENT",
  "status": "IN_PROGRESS",
  "deadline": "2025-09-25"
}
```

### 6. Update My Task with Files
**Endpoint**: `PUT /api/tasks/my-tasks/{id}/with-files`
**Content-Type**: `multipart/form-data`
**Purpose**: Update task with file upload support

#### Form Parameters:
- **title** (String, optional) - Updated task title
- **description** (String, optional) - Updated description
- **status** (String, optional) - Updated status
- **priority** (String, optional) - Updated priority
- **comment** (String, optional) - Updated comment
- **fileKeys** (List<String>, optional) - S3 file keys to attach
- **filesToDelete** (List<String>, optional) - File keys to delete
- **files** (List<MultipartFile>, optional) - New files to upload

### 7. Delete My Task
**Endpoint**: `DELETE /api/tasks/my-tasks/{id}`
**Purpose**: Delete a specific personal task

#### AI Confirmation Rule:
- MUST ask for confirmation: "Are you sure you want to delete the task '[Task Title]'? This action cannot be undone."

#### Success Response (200 OK):
```json
{
  "message": "My task deleted successfully."
}
```

### 8. Get Combined My Tasks
**Endpoint**: `GET /api/tasks/my-tasks/combined`
**Purpose**: Get personal tasks combined with project tasks assigned to user

#### Query Parameters:
- **page** (int, default: 0) - Pagination page number
- **size** (int, default: 10) - Items per page
- **sortBy** (String, default: "updatedAt") - Sort field
- **sortDir** (String, default: "desc") - Sort direction

### 9. Get Combined My Tasks Summary
**Endpoint**: `GET /api/tasks/my-tasks/combined-summary`
**Purpose**: Get summarized view of all user's tasks (personal + assigned)

#### Query Parameters:
- **page** (int, default: 0) - Pagination page number
- **size** (int, default: 20) - Items per page
- **sortBy** (String, default: "updatedAt") - Sort field
- **sortDir** (String, default: "desc") - Sort direction

## 🤖 AI Agent Behavior Rules

### Data Validation & User Interaction

#### When User Provides Incomplete Information:

1. **Missing Title**: 
   ```
   AI: "I need a title for your task. What would you like to call it?"
   User: "Write documentation"
   AI: ✅ Proceeds with title = "Write documentation"
   ```

2. **Missing Deadline**:
   ```
   AI: "I've set the deadline to today (2025-09-24). Would you like to change it to a different date?"
   User: "No, that's fine" OR "Change it to next Friday"
   AI: ✅ Proceeds with appropriate deadline
   ```

3. **Unclear Priority**:
   ```
   User: "Create an important task"
   AI: "I've set the priority to HIGH based on 'important'. The options are LOW, MEDIUM, HIGH, or URGENT."
   ```

### Smart Default Application:

```javascript
// AI Agent Logic Example
function processTaskCreation(userInput) {
  const taskData = {
    title: extractTitle(userInput) || askForTitle(),
    description: extractDescription(userInput) || null,
    deadline: extractDeadline(userInput) || new Date(),
    priority: extractPriority(userInput) || 'MEDIUM',
    // assignee is always current user for MyTasks
    isPublic: false // Always private for personal tasks
  };
  
  // Inform user about applied defaults
  informUserAboutDefaults(taskData);
  
  return createMyTask(taskData);
}
```

### Error Handling Responses:

#### Validation Errors:
```
AI: "I couldn't create the task because the title is required. Please provide a title for your task."
```

#### Server Errors:
```
AI: "I encountered an issue creating your task. Please try again in a moment. If the problem persists, you may need to check your internet connection."
```

#### Permission Errors:
```
AI: "You don't have permission to perform this action. Please make sure you're logged in correctly."
```

### Proactive Task Management:

1. **Deadline Warnings**:
   ```
   AI: "I notice you're setting a deadline for yesterday. Did you mean to set it for tomorrow instead?"
   ```

2. **Priority Suggestions**:
   ```
   User: "Create a task for the board meeting presentation"
   AI: "I've created your task with HIGH priority since board meetings are typically important. Is that correct?"
   ```

3. **Task Organization**:
   ```
   AI: "You now have 12 tasks. Would you like me to show you a summary organized by priority or deadline?"
   ```

## 📊 Task Status & Priority Enums

### TaskStatus Options:
- `TODO` - Not started
- `IN_PROGRESS` - Currently working on
- `REVIEW` - Waiting for review
- `DONE` - Completed
- `CANCELLED` - Cancelled/abandoned

### TaskPriority Options:
- `LOW` - Nice to have, no rush
- `MEDIUM` - Standard priority (default)
- `HIGH` - Important, should be done soon
- `URGENT` - Critical, needs immediate attention

## 🔍 Advanced Features

### Task Statistics Intelligence:
```
User: "How am I doing with my tasks?"
AI: Makes request to GET /api/tasks/my-tasks/stats
Response: "You have 15 total tasks with a 53% completion rate. You have 1 overdue task and 3 high-priority items due this week."
```

### Combined Task Management:
```
User: "Show me all my work"
AI: Makes request to GET /api/tasks/my-tasks/combined
Response: "Here are all your tasks including personal tasks and project assignments..."
```

### File Management:
```
User: "Add this document to my task"
AI: Uses PUT /api/tasks/my-tasks/{id}/with-files with multipart/form-data
```

### Natural Language Processing:
```
User: "Remind me to call the client about the project update tomorrow"
AI: Creates task with:
- title: "Call client about project update"
- deadline: tomorrow's date
- priority: MEDIUM (default)
```

## 🚨 Critical Error Scenarios

### 1. Database Connection Issues:
```json
{
  "success": false,
  "message": "Service temporarily unavailable",
  "code": "DATABASE_ERROR"
}
```
**AI Response**: "I'm having trouble connecting to the task system right now. Please try again in a few minutes."

### 2. Authentication Failures:
```json
{
  "success": false,
  "message": "Authentication required",
  "code": "UNAUTHORIZED"
}
```
**AI Response**: "You need to be logged in to manage tasks. Please sign in and try again."

### 3. Task Not Found:
```json
{
  "success": false,
  "message": "Task not found",
  "code": "TASK_NOT_FOUND"
}
```
**AI Response**: "I couldn't find that task. It may have been deleted or you may not have access to it."

## 📝 Best Practices for AI Agents

1. **Always confirm destructive actions** (delete, cancel)
2. **Provide context** about applied defaults
3. **Offer alternatives** when validation fails
4. **Be proactive** about task organization and reminders
5. **Use natural language** to explain technical errors
6. **Prioritize user experience** over strict API adherence
7. **Learn from user patterns** to suggest better defaults
8. **Use statistics API** to provide insights and motivation
9. **Handle file uploads** intelligently through multipart endpoints

## 🔄 Integration Examples

### Complete Task Creation Flow:
```
User: "I need to finish the quarterly report"
AI: "I'll create a task for you. What's the deadline for the quarterly report?"
User: "End of this month"
AI: [Calls POST /api/tasks/my-tasks]
    "Perfect! I've created your task 'Finish quarterly report' with deadline 2025-09-30 and MEDIUM priority. Would you like to add any additional details or change the priority?"
```

### Task Management Conversation:
```
User: "What do I need to do today?"
AI: [Calls GET /api/tasks/my-tasks with date filtering]
    "You have 3 tasks for today:
    1. HIGH: Board presentation (due today)
    2. MEDIUM: Code review (due today) 
    3. LOW: Update documentation (due today)
    
    I also notice from your stats that you have 1 overdue task. Would you like me to show you that as well?"
```

### Statistics-Based Insights:
```
User: "How productive have I been?"
AI: [Calls GET /api/tasks/my-tasks/stats]
    "You have a 53% completion rate with 15 total tasks. Your average completion time is 5.2 days. You have 3 high-priority tasks and 1 overdue task that needs attention. Would you like me to help prioritize your workload?"
```

## 🎯 RAG Integration Instructions

This guide should be processed and stored in Pinecone vector database for RAG (Retrieval-Augmented Generation) with the following metadata:

- **Category**: `API_DOCUMENTATION`
- **Source Type**: `MARKDOWN_FILE`
- **Language**: `en`
- **Topics**: `["task_management", "api_endpoints", "ai_agent", "validation_rules", "error_handling"]`
- **Keywords**: `"mytask api, task creation, task management, ai agent, validation, endpoints, priority, deadline"`
- **Content Type**: `TECHNICAL_GUIDE`
- **Access Level**: `AGENT_KNOWLEDGE`

This guide ensures AI agents can effectively manage user tasks while providing an excellent user experience through intelligent defaults, comprehensive error handling, and proactive assistance.
