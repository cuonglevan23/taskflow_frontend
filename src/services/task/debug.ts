// Task Service Debug Utilities
import { CookieAuth } from '@/utils/cookieAuth';
import { taskService } from './service';

// Debug helper function - Enhanced debugging
export const debugAuth = () => {
  console.log('🔍 TaskService Debug - Checking cookies...');
  const isAuth = CookieAuth.isAuthenticated();
  const userInfo = CookieAuth.getUserInfo();
  const token = CookieAuth.getAccessToken();
  
  console.log('Authentication Status:', isAuth);
  console.log('User Info:', userInfo);
  console.log('Has Token:', !!token);
  
  if (token) {
    try {
      const payload = CookieAuth.getTokenPayload();
      console.log('Token Payload:', payload);
      console.log('Token Expired:', payload ? Date.now() >= payload.exp * 1000 : 'unknown');
    } catch (error) {
      console.error('Failed to decode token:', error);
    }
  }
  
  // Test API call
  taskService.testAuth().then(success => {
    console.log('API Test Result:', success);
  });
};