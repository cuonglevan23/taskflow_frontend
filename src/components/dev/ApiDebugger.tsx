"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui';

export const ApiDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    // Collect debug info
    const info = {
      nodeEnv: process.env.NODE_ENV,
      apiUrl: process.env.NEXT_PUBLIC_API_URL,
      googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      currentUrl: typeof window !== 'undefined' ? window.location.href : 'N/A',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'N/A',
    };
    setDebugInfo(info);
  }, []);

  const testBackendHealth = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    try {
      console.log('Testing backend health...');
      const response = await fetch(`${apiUrl}/actuator/health`, {
        method: 'GET',
        mode: 'cors',
      });
      
      const result = {
        test: 'Backend Health',
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        data: response.ok ? await response.json() : await response.text(),
        timestamp: new Date().toISOString(),
      };
      
      setTestResults(prev => [result, ...prev]);
      console.log('Health check result:', result);
    } catch (error) {
      const result = {
        test: 'Backend Health',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
      setTestResults(prev => [result, ...prev]);
      console.error('Health check failed:', error);
    }
  };

  const testGoogleOAuthUrl = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    try {
      console.log('Testing Google OAuth URL...');
      const response = await fetch(`${apiUrl}/api/auth/google/url`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      const result = {
        test: 'Google OAuth URL',
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        data: response.ok ? await response.json() : await response.text(),
        timestamp: new Date().toISOString(),
      };
      
      setTestResults(prev => [result, ...prev]);
      console.log('OAuth URL test result:', result);
    } catch (error) {
      const result = {
        test: 'Google OAuth URL',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
      setTestResults(prev => [result, ...prev]);
      console.error('OAuth URL test failed:', error);
    }
  };

  const testCorsPreflightOptions = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    try {
      console.log('Testing CORS preflight...');
      const response = await fetch(`${apiUrl}/api/auth/google/url`, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type',
        },
      });
      
      const result = {
        test: 'CORS Preflight',
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        timestamp: new Date().toISOString(),
      };
      
      setTestResults(prev => [result, ...prev]);
      console.log('CORS preflight result:', result);
    } catch (error) {
      const result = {
        test: 'CORS Preflight',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
      setTestResults(prev => [result, ...prev]);
      console.error('CORS preflight failed:', error);
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 w-96 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 max-h-[80vh] overflow-hidden flex flex-col z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          API Debugger
        </h3>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => setTestResults([])}
        >
          Clear
        </Button>
      </div>

      {/* Debug Info */}
      <div className="mb-4 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
        <div><strong>Environment:</strong> {debugInfo.nodeEnv}</div>
        <div><strong>API URL:</strong> {debugInfo.apiUrl || 'Not set'}</div>
        <div><strong>Google Client ID:</strong> {debugInfo.googleClientId ? 'Set' : 'Not set'}</div>
        <div><strong>Current URL:</strong> {debugInfo.currentUrl}</div>
      </div>

      {/* Test Buttons */}
      <div className="flex flex-wrap gap-2 mb-3">
        <Button
          variant="outline"
          size="xs"
          onClick={testBackendHealth}
        >
          Health Check
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={testGoogleOAuthUrl}
        >
          OAuth URL
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={testCorsPreflightOptions}
        >
          CORS Test
        </Button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {testResults.map((result, index) => (
          <div
            key={index}
            className={`p-2 rounded text-xs ${
              result.ok || (!result.error && result.status < 400)
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
            }`}
          >
            <div className="font-medium mb-1">{result.test}</div>
            {result.status && <div>Status: {result.status}</div>}
            {result.error && <div>Error: {result.error}</div>}
            {result.data && (
              <div className="mt-1 font-mono text-xs opacity-90 max-h-20 overflow-y-auto">
                {typeof result.data === 'object' 
                  ? JSON.stringify(result.data, null, 2)
                  : result.data
                }
              </div>
            )}
            {result.headers && Object.keys(result.headers).length > 0 && (
              <details className="mt-1">
                <summary className="cursor-pointer text-xs opacity-75">Headers</summary>
                <div className="font-mono text-xs opacity-90 mt-1">
                  {JSON.stringify(result.headers, null, 2)}
                </div>
              </details>
            )}
            <div className="text-xs opacity-50 mt-1">{result.timestamp}</div>
          </div>
        ))}
        
        {testResults.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 text-xs py-4">
            Click buttons above to test API endpoints
          </div>
        )}
      </div>
    </div>
  );
};