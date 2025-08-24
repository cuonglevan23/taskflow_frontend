# Team Member Management

## Overview
This module provides functionality to add and remove members from teams using the backend API.

## API Specification

### Add Member to Team
```
POST /api/team-members
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

Request Body:
{
  "teamId": 123,
  "userEmail": "user@example.com"
}

Success Response (201):
{
  "id": 1,
  "teamId": 123,
  "userId": 456,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "joinedAt": "2024-01-15T10:30:00"
}
```

### Remove Member from Team
```
DELETE /api/team-members/{memberId}
Authorization: Bearer <JWT_TOKEN>

Query Parameters:
- teamId: number (required)
```

## Usage

### Inviting Members
```typescript
import TeamMemberService from '@/services/teamMemberService';

// Single member invite
const result = await TeamMemberService.inviteMember({
  teamId: 123,
  userEmail: "user@example.com"
});

// Multiple members invite
const { successful, failed } = await TeamMemberService.inviteMultipleMembers(
  123, 
  ["user1@example.com", "user2@example.com"]
);
```

### Removing Members
```typescript
await TeamMemberService.removeMember({
  teamId: 123,
  memberId: 456
});
```

## Features

### ✅ Email Validation
- Basic email format validation
- Domain matching (optional)
- Duplicate email prevention

### ✅ Bulk Operations
- Multiple member invitations
- Detailed success/failure reporting
- Individual error handling

### ✅ Error Handling
- Network error handling
- API error responses
- User-friendly error messages

### ✅ Authentication
- JWT token handling via interceptors
- Automatic token refresh (if configured)

## Integration

The service is integrated into the Team Overview page:
- **InviteModal**: Uses `TeamMemberService.inviteMultipleMembers()`
- **Member Actions**: Uses `TeamMemberService.removeMember()`
- **Real-time Updates**: Triggers member list refresh after operations

## Error Handling

All operations include comprehensive error handling:
```typescript
try {
  const result = await TeamMemberService.inviteMember(request);
  // Handle success
} catch (error) {
  // Handle error - show user notification
  console.error('Failed to invite member:', error);
}
```
