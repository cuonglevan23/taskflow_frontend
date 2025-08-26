# 📋 My Tasks API Documentation (v2)

## Overview
This API allows users to manage their personal tasks ("my-tasks") and now returns full user profile information for both the task creator and all assignees. This enables the frontend to display avatars, names, and other profile details for both the person who assigned the task and those who received it, without extra API calls.

---

## Endpoints

### 1. Get All My Tasks
**GET** `/api/tasks/my-tasks`

#### Query Parameters
- `page` (int, default: 0): Page number
- `size` (int, default: 10): Page size
- `sortBy` (string, default: "updatedAt"): Sort field
- `sortDir` (string, default: "desc"): Sort direction

#### Response Example
```json
{
  "content": [
    {
      "id": 123,
      "title": "Design Homepage",
      "description": "Create the homepage UI",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "startDate": "2025-08-20",
      "deadline": "2025-08-30",
      "createdAt": "2025-08-19T10:00:00",
      "updatedAt": "2025-08-21T12:00:00",
      "assignedToIds": [2, 3],
      "assignedToEmails": ["user2@example.com", "user3@example.com"],
      "comment": "Initial draft done.",
      "urlFile": "https://.../homepage.pdf",
      "creatorId": 1,
      "projectId": 10,
      "groupId": 5,
      "checklists": [],
      "creatorProfile": {
        "userId": 1,
        "email": "admin@example.com",
        "firstName": "Admin",
        "lastName": "User",
        "username": "admin",
        "jobTitle": "Project Manager",
        "department": "Product",
        "aboutMe": "Experienced PM",
        "status": "Active",
        "avatarUrl": "https://.../avatar1.png",
        "isUpgraded": true,
        "displayName": "Admin User",
        "initials": "AU"
      },
      "assigneeProfiles": [
        {
          "userId": 2,
          "email": "user2@example.com",
          "firstName": "John",
          "lastName": "Doe",
          "username": "johndoe",
          "jobTitle": "Developer",
          "department": "Engineering",
          "aboutMe": "Frontend dev",
          "status": "Active",
          "avatarUrl": "https://.../avatar2.png",
          "isUpgraded": false,
          "displayName": "John Doe",
          "initials": "JD"
        },
        {
          "userId": 3,
          "email": "user3@example.com",
          "firstName": "Jane",
          "lastName": "Smith",
          "username": "janesmith",
          "jobTitle": "Designer",
          "department": "Design",
          "aboutMe": "UI/UX specialist",
          "status": "Active",
          "avatarUrl": "https://.../avatar3.png",
          "isUpgraded": false,
          "displayName": "Jane Smith",
          "initials": "JS"
        }
      ]
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "number": 0,
  "size": 10
}
```

---

### 2. Get Task By ID
**GET** `/api/tasks/{id}`

Returns a single task with full profile info for creator and assignees.

---

### 3. Create My Task
**POST** `/api/tasks/my-tasks`

#### Request Body Example
```json
{
  "title": "Design Homepage",
  "description": "Create the homepage UI",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "startDate": "2025-08-20",
  "deadline": "2025-08-30",
  "assignedToIds": [2, 3],
  "assignedToEmails": ["user2@example.com", "user3@example.com"],
  "comment": "Initial draft done.",
  "urlFile": "https://.../homepage.pdf",
  "creatorId": 1,
  "projectId": 10,
  "groupId": 5
}
```

---

### 4. Update My Task
**PUT** `/api/tasks/my-tasks/{id}`

---

### 5. Delete My Task
**DELETE** `/api/tasks/my-tasks/{id}`

---

## Data Types

### UserProfileDto
```json
{
  "userId": 1,
  "email": "admin@example.com",
  "firstName": "Admin",
  "lastName": "User",
  "username": "admin",
  "jobTitle": "Project Manager",
  "department": "Product",
  "aboutMe": "Experienced PM",
  "status": "Active",
  "avatarUrl": "https://.../avatar1.png",
  "isUpgraded": true,
  "displayName": "Admin User",
  "initials": "AU"
}
```

### TaskResponseDto (key fields)
- `creatorProfile`: UserProfileDto
- `assigneeProfiles`: List<UserProfileDto>
- Other fields: see above response example

---

## Frontend Integration Notes
- Use `creatorProfile` and `assigneeProfiles` to display avatars, names, and job info for both the person who assigned the task and those who received it.
- No extra API calls needed for user info.
- All endpoints are secured; user must be authenticated.

---

## Changelog
- **2025-08-25**: Added `creatorProfile` and `assigneeProfiles` to all my-tasks responses.
- Improved frontend support for displaying user info in task lists and details.

---

## Contact
For questions or issues, contact the backend team.

