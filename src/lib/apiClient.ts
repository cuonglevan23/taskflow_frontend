'use client';

// DEPRECATED: API Client - Replaced by unified auth-backend.ts
// This file is no longer used - we've switched to backend-only JWT authentication
// See /src/lib/auth-backend.ts and /src/lib/api.ts for the new API client

/*
 * MIGRATION NOTES:
 * - getSession từ NextAuth đã được loại bỏ
 * - Authentication giờ được handle bởi HTTP-only cookies
 * - Sử dụng ApiClient từ auth-backend.ts thay thế
 *
 * Migration guide:
 * OLD: import { apiClient } from '@/lib/apiClient';
 * NEW: import { ApiClient } from '@/lib/auth-backend';
 *      import { api } from '@/lib/api';
 */

export const apiClient = null; // Deprecated
export default null; // Deprecated
