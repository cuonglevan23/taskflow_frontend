"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { apiClient } from '@/lib/api';

export const BackendTestPanel: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test: string, success: boolean, data: any) => {
    const result = {
      test,
      success,
      data,
      timestamp: new Date().toLocaleTimeString()
    };
    setResults(prev => [result, ...prev]);
  };

  const testBackendConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/health`);
      if (response.ok) {
        const data = await response.text();
        addResult('Backend Health Check', true, data);
      } else {
        addResult('Backend Health Check', false, `Status: ${response.status}`);
      }
    } catch (error) {
      addResult('Backend Health Check', false, error.message);
    }
    setLoading(false);
  };

  const testGoogleOAuthUrl = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/url`);
      if (response.ok) {
        const data = await response.json();
        addResult('Google OAuth URL', true, data);
      } else {
        addResult('Google OAuth URL', false, `Status: ${response.status}`);
      }
    } catch (error) {
      addResult('Google OAuth URL', false, error.message);
    }
    setLoading(false);
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await apiClient.login('test@example.com', 'password123');
      addResult('Login Test', true, response);
    } catch (error) {
      addResult('Login Test', false, error.message);
    }
    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 max-h-96 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Backend Integration Test
        </h3>
        <Button
          variant="ghost"
          size="xs"
          onClick={clearResults}
          className="text-gray-500 hover:text-gray-700"
        >
          Clear
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <Button
          variant="outline"
          size="xs"
          onClick={testBackendConnection}
          disabled={loading}
        >
          Health Check
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={testGoogleOAuthUrl}
          disabled={loading}
        >
          OAuth URL
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={testLogin}
          disabled={loading}
        >
          Test Login
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {results.map((result, index) => (
          <div
            key={index}
            className={`p-2 rounded text-xs ${
              result.success
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium">{result.test}</span>
              <span className="text-xs opacity-75">{result.timestamp}</span>
            </div>
            <div className="font-mono text-xs opacity-90">
              {typeof result.data === 'object' 
                ? JSON.stringify(result.data, null, 2)
                : result.data
              }
            </div>
          </div>
        ))}
        
        {results.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 text-xs py-4">
            Click buttons above to test backend integration
          </div>
        )}
      </div>

      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Backend: {process.env.NEXT_PUBLIC_API_URL || 'Not configured'}
        </div>
      </div>
    </div>
  );
};