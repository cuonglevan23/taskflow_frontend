"use client";

import { useState } from 'react';
import { taskService } from '@/services/taskService';
import { api } from '@/services/api';

export default function SimpleTestPage() {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testSimplified = async () => {
    setIsLoading(true);
    setResults([]);
    
    addLog('🧪 Testing simplified error handling...');
    
    // Test 1: Simple task fetch
    addLog('\n📋 Testing getTasks()...');
    try {
      const tasks = await taskService.getTasks();
      addLog(`✅ Success: ${tasks.data.length} tasks, total: ${tasks.total}`);
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
    }
    
    // Test 2: Simple stats fetch
    addLog('\n📊 Testing getTaskStats()...');
    try {
      const stats = await taskService.getTaskStats();
      addLog(`✅ Success: Total: ${stats.total}, Done: ${stats.done}`);
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
    }
    
    // Test 3: Direct API call
    addLog('\n🌐 Testing direct API call...');
    try {
      const response = await api.get('/api/tasks');
      addLog(`✅ Success: ${response.data?.length || 0} items`);
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
    }
    
    // Test 4: Non-existent endpoint
    addLog('\n❓ Testing non-existent endpoint...');
    try {
      const response = await api.get('/api/nonexistent');
      addLog(`✅ Unexpected success: ${response.status}`);
    } catch (error: any) {
      addLog(`❌ Expected error: ${error.message}`);
    }
    
    addLog('\n🏁 Simple tests completed');
    setIsLoading(false);
  };

  const clearLogs = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🔧 Simplified Testing
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4">
            <button
              onClick={testSimplified}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg"
            >
              {isLoading ? '🔄 Testing...' : '🧪 Test Simplified API'}
            </button>
            
            <button
              onClick={clearLogs}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg"
            >
              🗑️ Clear Logs
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
            {results.length === 0 ? (
              <p className="text-gray-500">Click "Test Simplified API" to start...</p>
            ) : (
              results.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">✨ Simplified Approach</h3>
          <ul className="list-disc list-inside text-green-700 space-y-1">
            <li><strong>Simple Error Handling:</strong> Basic try/catch with fallback data</li>
            <li><strong>Clean Logging:</strong> No complex console objects that crash</li>
            <li><strong>Reliable Fallbacks:</strong> Always return valid data structure</li>
            <li><strong>No Over-Engineering:</strong> Removed retry/circuit breaker complexity</li>
            <li><strong>Maintainable:</strong> Easy to understand and debug</li>
          </ul>
        </div>
      </div>
    </div>
  );
}