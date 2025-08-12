"use client";

import { useState } from 'react';
import { CookieAuth } from '@/utils/cookieAuth';

export default function CookieMigrationPage() {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const migrateToCookies = () => {
    setIsLoading(true);
    setResults([]);
    
    addLog('🔄 Starting migration from localStorage to cookies...');
    
    // Step 1: Check current localStorage
    const localStorageToken = localStorage.getItem('access_token');
    const localStorageRefresh = localStorage.getItem('refresh_token');
    
    addLog(`📋 LocalStorage check:`);
    addLog(`  - Access Token: ${localStorageToken ? `Present (${localStorageToken.length} chars)` : 'Missing'}`);
    addLog(`  - Refresh Token: ${localStorageRefresh ? `Present (${localStorageRefresh.length} chars)` : 'Missing'}`);
    
    // Step 2: Check current cookies
    const cookieToken = CookieAuth.getAccessToken();
    const cookieRefresh = CookieAuth.getRefreshToken();
    
    addLog(`🍪 Cookies check:`);
    addLog(`  - Access Token: ${cookieToken ? `Present (${cookieToken.length} chars)` : 'Missing'}`);
    addLog(`  - Refresh Token: ${cookieRefresh ? `Present (${cookieRefresh.length} chars)` : 'Missing'}`);
    
    // Step 3: Migrate if localStorage has tokens
    if (localStorageToken) {
      addLog('🔄 Migrating access token to cookies...');
      
      try {
        // Validate token first
        const payload = JSON.parse(atob(localStorageToken.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        
        if (isExpired) {
          addLog('❌ LocalStorage token is expired, not migrating');
        } else {
          CookieAuth.setAccessToken(localStorageToken);
          addLog('✅ Access token migrated to cookies');
          
          // Extract user info from token
          const userInfo = {
            id: payload.userId?.toString() || 'unknown',
            email: payload.email || 'unknown',
            role: payload.roles?.[0] || 'MEMBER'
          };
          
          CookieAuth.setUserInfo(userInfo);
          addLog(`👤 User info saved: ${userInfo.email} (${userInfo.role})`);
        }
      } catch (error) {
        addLog(`❌ Failed to migrate access token: ${error}`);
      }
    }
    
    if (localStorageRefresh) {
      addLog('🔄 Migrating refresh token to cookies...');
      CookieAuth.setRefreshToken(localStorageRefresh);
      addLog('✅ Refresh token migrated to cookies');
    }
    
    // Step 4: Clear localStorage
    if (localStorageToken || localStorageRefresh) {
      addLog('🧹 Clearing localStorage...');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      addLog('✅ LocalStorage cleared');
    }
    
    // Step 5: Verify migration
    addLog('🔍 Verifying migration...');
    const finalCookieToken = CookieAuth.getAccessToken();
    const isAuthenticated = CookieAuth.isAuthenticated();
    
    addLog(`📊 Migration results:`);
    addLog(`  - Cookie token: ${finalCookieToken ? 'Present' : 'Missing'}`);
    addLog(`  - Is authenticated: ${isAuthenticated ? '✅ YES' : '❌ NO'}`);
    
    if (isAuthenticated) {
      const payload = CookieAuth.getTokenPayload();
      const userInfo = CookieAuth.getUserInfo();
      
      addLog(`👤 User details:`);
      addLog(`  - User ID: ${payload?.userId}`);
      addLog(`  - Email: ${payload?.email}`);
      addLog(`  - Roles: ${JSON.stringify(payload?.roles)}`);
      addLog(`  - Expires: ${new Date(payload?.exp * 1000).toLocaleString()}`);
      
      addLog(`🍪 Cookie user info:`);
      addLog(`  - Stored ID: ${userInfo.id}`);
      addLog(`  - Stored Email: ${userInfo.email}`);
      addLog(`  - Stored Role: ${userInfo.role}`);
    }
    
    addLog('🏁 Migration completed!');
    setIsLoading(false);
  };

  const testCookieAuth = async () => {
    addLog('🧪 Testing cookie-based authentication...');
    
    // Test authentication status
    const isAuth = CookieAuth.isAuthenticated();
    addLog(`🔐 Authentication status: ${isAuth ? '✅ Authenticated' : '❌ Not authenticated'}`);
    
    if (isAuth) {
      // Test API call with cookies
      const token = CookieAuth.getAccessToken();
      
      try {
        const response = await fetch('http://localhost:8080/api/tasks', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        addLog(`🌐 API test result: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          addLog('🎉 Cookie authentication works!');
        } else {
          addLog('❌ API call failed - check backend configuration');
        }
      } catch (error) {
        addLog(`❌ API test error: ${error}`);
      }
    }
  };

  const clearAllAuth = () => {
    addLog('🧹 Clearing all authentication data...');
    
    // Clear cookies
    CookieAuth.clearAuth();
    
    // Clear localStorage as fallback
    localStorage.clear();
    
    addLog('✅ All authentication data cleared');
    addLog('🔄 Please login again to get fresh tokens');
  };

  const debugAuth = () => {
    addLog('🔍 Running comprehensive auth debug...');
    CookieAuth.debugAuth();
    addLog('📋 Check browser console for detailed debug information');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🍪 Cookie Migration & Management
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Migration Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={migrateToCookies}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
            >
              {isLoading ? '🔄 Migrating...' : '🔄 Migrate to Cookies'}
            </button>
            
            <button
              onClick={testCookieAuth}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              🧪 Test Cookie Auth
            </button>
            
            <button
              onClick={debugAuth}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
            >
              🔍 Debug Auth
            </button>
            
            <button
              onClick={clearAllAuth}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              🧹 Clear All Auth
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Migration Results</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
            {results.length === 0 ? (
              <p className="text-gray-500">Click "Migrate to Cookies" to start...</p>
            ) : (
              results.map((result, index) => (
                <div key={index} className="mb-1 whitespace-pre-wrap">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">🍪 Cookie Benefits</h3>
          <ul className="list-disc list-inside text-green-700 space-y-1">
            <li><strong>Security:</strong> HttpOnly cookies can't be accessed by JavaScript (XSS protection)</li>
            <li><strong>Automatic:</strong> Cookies are sent automatically with requests</li>
            <li><strong>Expiration:</strong> Built-in expiration handling</li>
            <li><strong>Domain Scoped:</strong> Limited to specific domains</li>
            <li><strong>Server-Side:</strong> Can be managed from backend</li>
          </ul>
        </div>
      </div>
    </div>
  );
}