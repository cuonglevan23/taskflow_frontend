"use client";

import { useState } from 'react';
import { api, healthCheck, testAuthentication, getApiConfig } from '@/services/api';
import { taskService } from '@/services/taskService';

export default function ApiTestPage() {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testApiLayer = async () => {
    setIsLoading(true);
    setResults([]);
    
    addLog('🚀 Testing new API layer architecture...');
    
    // Test 1: API Configuration
    addLog('\n📋 API Configuration:');
    const config = getApiConfig();
    addLog(`  Base URL: ${config.baseURL}`);
    addLog(`  Timeout: ${config.timeout}ms`);
    addLog(`  Headers: ${JSON.stringify(config.headers.common || {})}`);
    
    // Test 2: Health Check
    addLog('\n🏥 Testing health check...');
    try {
      const isHealthy = await healthCheck();
      addLog(`  Health status: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
    } catch (error) {
      addLog(`  Health check error: ${error}`);
    }
    
    // Test 3: Authentication Test
    addLog('\n🔐 Testing authentication...');
    try {
      const authResult = await testAuthentication();
      addLog(`  Authentication: ${authResult ? '✅ Success' : '❌ Failed'}`);
    } catch (error) {
      addLog(`  Auth test error: ${error}`);
    }
    
    // Test 4: Direct API calls
    addLog('\n🌐 Testing direct API calls...');
    const endpoints = [
      { method: 'GET', url: '/api/tasks', name: 'Get Tasks' },
      { method: 'GET', url: '/api/user/me', name: 'Get User Profile' },
      { method: 'GET', url: '/actuator/health', name: 'Health Endpoint' },
    ];
    
    for (const endpoint of endpoints) {
      try {
        addLog(`  Testing ${endpoint.name}...`);
        let response;
        
        if (endpoint.method === 'GET') {
          response = await api.get(endpoint.url);
        }
        
        addLog(`    ✅ ${endpoint.name}: ${response?.status} ${response?.statusText}`);
        
        if (endpoint.url === '/api/tasks' && response?.data) {
          addLog(`    📊 Tasks count: ${Array.isArray(response.data) ? response.data.length : 'Not array'}`);
        }
      } catch (error: any) {
        addLog(`    ❌ ${endpoint.name}: ${error.response?.status || 'Network Error'} ${error.message}`);
      }
    }
    
    // Test 5: TaskService Layer
    addLog('\n📋 Testing TaskService layer...');
    try {
      addLog('  Testing taskService.testAuth()...');
      const serviceAuthResult = await taskService.testAuth();
      addLog(`    TaskService auth: ${serviceAuthResult ? '✅ Success' : '❌ Failed'}`);
      
      addLog('  Testing taskService.getTasks()...');
      const tasksResponse = await taskService.getTasks();
      addLog(`    Tasks response: ✅ ${tasksResponse.total} tasks, page ${tasksResponse.page}`);
      
      addLog('  Testing taskService.getTaskStats()...');
      const stats = await taskService.getTaskStats();
      addLog(`    Task stats: ✅ Total: ${stats.total}, Done: ${stats.done}, In Progress: ${stats.inProgress}`);
      
    } catch (error: any) {
      addLog(`    ❌ TaskService error: ${error.message}`);
    }
    
    addLog('\n🏁 API layer testing completed!');
    setIsLoading(false);
  };

  const testCookieIntegration = async () => {
    addLog('🍪 Testing cookie integration with API layer...');
    
    // Import CookieAuth
    const { CookieAuth } = await import('@/utils/cookieAuth');
    
    addLog('📋 Cookie auth status:');
    addLog(`  Has access token: ${!!CookieAuth.getAccessToken()}`);
    addLog(`  Is authenticated: ${CookieAuth.isAuthenticated()}`);
    
    const userInfo = CookieAuth.getUserInfo();
    addLog(`  User ID: ${userInfo.id}`);
    addLog(`  User email: ${userInfo.email}`);
    addLog(`  User role: ${userInfo.role}`);
    
    const payload = CookieAuth.getTokenPayload();
    if (payload) {
      addLog(`  Token roles: ${JSON.stringify(payload.roles)}`);
      addLog(`  Token expires: ${new Date(payload.exp * 1000).toLocaleString()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🌐 API Layer Testing
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">API Architecture Tests</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={testApiLayer}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
            >
              {isLoading ? '🔄 Testing...' : '🧪 Test API Layer'}
            </button>
            
            <button
              onClick={testCookieIntegration}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              🍪 Test Cookie Integration
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
            {results.length === 0 ? (
              <p className="text-gray-500">Click "Test API Layer" to start...</p>
            ) : (
              results.map((result, index) => (
                <div key={index} className="mb-1 whitespace-pre-wrap">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">🏗️ Architecture Benefits</h3>
          <ul className="list-disc list-inside text-blue-700 space-y-1">
            <li><strong>Separation of Concerns:</strong> API layer handles HTTP, TaskService handles business logic</li>
            <li><strong>Centralized Configuration:</strong> Single place to manage base URL, timeouts, interceptors</li>
            <li><strong>Reusable Interceptors:</strong> Authentication, logging, error handling shared across all services</li>
            <li><strong>Easy Testing:</strong> Can mock API layer independently of business logic</li>
            <li><strong>Maintainable:</strong> Changes to API configuration don't affect business logic</li>
          </ul>
        </div>
      </div>
    </div>
  );
}