"use client";

import { useState } from 'react';
import { taskService } from '@/services/taskService';
import { api } from '@/services/api';
import { apiHealth } from '@/services/apiUtils';

export default function ErrorTestPage() {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testErrorHandling = async () => {
    setIsLoading(true);
    setResults([]);
    
    addLog('🧪 Testing enhanced error handling...');
    
    // Test 1: API Health Check
    addLog('\n🏥 Testing API health...');
    try {
      const isHealthy = await apiHealth.check();
      addLog(`  Backend health: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
      
      const circuitState = apiHealth.getCircuitState();
      addLog(`  Circuit breaker: ${circuitState.state} (${circuitState.failures}/${circuitState.threshold} failures)`);
    } catch (error) {
      addLog(`  Health check error: ${error}`);
    }
    
    // Test 2: Test different endpoints
    const testEndpoints = [
      { name: 'Tasks', method: () => taskService.getTasks() },
      { name: 'Task Stats', method: () => taskService.getTaskStats() },
      { name: 'Invalid Task', method: () => taskService.getTask('999999') },
      { name: 'Direct API Call', method: () => api.get('/api/nonexistent') },
      { name: 'Network Error Test', method: () => api.get('/timeout-test') }
    ];
    
    for (const test of testEndpoints) {
      addLog(`\n🔍 Testing ${test.name}...`);
      try {
        const result = await test.method();
        
        if (test.name === 'Tasks' && result?.data) {
          addLog(`  ✅ ${test.name}: Success - ${result.data.length} tasks`);
        } else if (test.name === 'Task Stats' && result) {
          addLog(`  ✅ ${test.name}: Success - Total: ${result.total}, Done: ${result.done}`);
        } else {
          addLog(`  ✅ ${test.name}: Success`);
        }
      } catch (error: any) {
        addLog(`  ❌ ${test.name}: ${error.message}`);
        
        if (error.errorInfo) {
          addLog(`    → Status: ${error.errorInfo.status}`);
          addLog(`    → Type: ${error.isNetworkError ? 'Network' : error.isServerError ? 'Server' : error.isClientError ? 'Client' : 'Unknown'}`);
        }
      }
    }
    
    // Test 3: Circuit breaker state after tests
    addLog('\n🔄 Circuit breaker state after tests:');
    const finalState = apiHealth.getCircuitState();
    addLog(`  State: ${finalState.state}`);
    addLog(`  Failures: ${finalState.failures}/${finalState.threshold}`);
    
    addLog('\n🏁 Error handling tests completed!');
    setIsLoading(false);
  };

  const testFallbackData = () => {
    addLog('🔄 Testing fallback data...');
    
    // Import fallback data
    import('@/services/apiUtils').then(({ getFallbackData }) => {
      addLog('\n📊 Fallback task stats:');
      const stats = getFallbackData.taskStats();
      addLog(`  Total: ${stats.total}, Done: ${stats.done}`);
      
      addLog('\n📋 Fallback tasks:');
      const tasks = getFallbackData.tasks();
      addLog(`  Tasks: ${tasks.data.length}, Page: ${tasks.page}`);
      
      addLog('\n👤 Fallback user:');
      const user = getFallbackData.user();
      addLog(`  User: ${user.name} (${user.email})`);
    });
  };

  const resetCircuitBreaker = () => {
    addLog('🔄 Resetting circuit breaker...');
    apiHealth.reset();
    addLog('✅ Circuit breaker reset to CLOSED state');
  };

  const simulateErrors = async () => {
    addLog('🚨 Simulating various error scenarios...');
    
    const errorTests = [
      {
        name: 'Network Error',
        test: () => api.get('http://localhost:9999/nonexistent')
      },
      {
        name: '404 Not Found',
        test: () => api.get('/api/nonexistent-endpoint')
      },
      {
        name: '403 Forbidden',
        test: () => api.get('/api/admin-only')
      },
      {
        name: 'Invalid JSON',
        test: () => api.get('/api/invalid-response')
      }
    ];
    
    for (const errorTest of errorTests) {
      try {
        addLog(`\n🧪 Testing ${errorTest.name}...`);
        await errorTest.test();
        addLog(`  ✅ ${errorTest.name}: Unexpected success`);
      } catch (error: any) {
        addLog(`  ❌ ${errorTest.name}: ${error.message}`);
        if (error.errorInfo) {
          addLog(`    → Enhanced error info available`);
          addLog(`    → Network Error: ${error.isNetworkError}`);
          addLog(`    → Server Error: ${error.isServerError}`);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🚨 Error Handling Testing
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Error Tests</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={testErrorHandling}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
            >
              {isLoading ? '🔄 Testing...' : '🧪 Test Error Handling'}
            </button>
            
            <button
              onClick={testFallbackData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              📊 Test Fallback Data
            </button>
            
            <button
              onClick={simulateErrors}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg"
            >
              🚨 Simulate Errors
            </button>
            
            <button
              onClick={resetCircuitBreaker}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              🔄 Reset Circuit Breaker
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
            {results.length === 0 ? (
              <p className="text-gray-500">Click "Test Error Handling" to start...</p>
            ) : (
              results.map((result, index) => (
                <div key={index} className="mb-1 whitespace-pre-wrap">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">🛡️ Enhanced Error Handling Features</h3>
          <ul className="list-disc list-inside text-red-700 space-y-1">
            <li><strong>Safe Error Extraction:</strong> Prevents crashes when error objects are malformed</li>
            <li><strong>Detailed Error Logging:</strong> Structured console groups with full error context</li>
            <li><strong>Circuit Breaker:</strong> Prevents cascading failures by temporarily blocking requests</li>
            <li><strong>Retry Logic:</strong> Automatic retries with exponential backoff for transient errors</li>
            <li><strong>Fallback Data:</strong> Graceful degradation with fallback responses</li>
            <li><strong>Error Classification:</strong> Network, server, client, and auth error types</li>
          </ul>
        </div>
      </div>
    </div>
  );
}