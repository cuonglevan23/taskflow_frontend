/**
 * Performance Monitor - Session API Call Tracking
 * 
 * Thêm script này vào DevTools Console để monitor session calls
 * Giúp verify việc optimization có hiệu quả không
 */

console.log('🔍 Session Performance Monitor Activated');

// Track all fetch requests
const originalFetch = window.fetch;
const sessionCalls = [];
let sessionCallCount = 0;

window.fetch = function(...args) {
  const url = args[0];
  
  // Track session API calls
  if (typeof url === 'string' && url.includes('/api/auth/session')) {
    sessionCallCount++;
    const timestamp = new Date().toISOString();
    
    sessionCalls.push({
      count: sessionCallCount,
      timestamp,
      url,
      stack: new Error().stack
    });
    
    console.group(`🔴 Session Call #${sessionCallCount}`);
    console.log('📍 URL:', url);
    console.log('⏰ Time:', timestamp);
    console.log('📊 Total session calls so far:', sessionCallCount);
    
    // Warning if too many calls
    if (sessionCallCount > 3) {
      console.warn('⚠️ WARNING: Too many session calls detected!');
      console.warn('🎯 Expected: 1-2 calls max with optimization');
      console.warn('📈 Current count:', sessionCallCount);
    }
    
    console.groupEnd();
  }
  
  return originalFetch.apply(this, args);
};

// Monitor performance every 10 seconds
setInterval(() => {
  if (sessionCallCount > 0) {
    console.group('📊 Session Performance Report');
    console.log(`🔢 Total session calls: ${sessionCallCount}`);
    console.log('📝 Call timeline:', sessionCalls);
    
    if (sessionCallCount <= 2) {
      console.log('✅ EXCELLENT: Optimized session usage!');
    } else if (sessionCallCount <= 5) {
      console.log('⚠️ GOOD: Room for improvement');
    } else {
      console.log('🔴 NEEDS OPTIMIZATION: Too many session calls');
    }
    
    console.groupEnd();
  }
}, 10000);

// Summary report function
window.getSessionReport = () => {
  console.group('📋 Session Optimization Report');
  console.log(`🔢 Total session API calls: ${sessionCallCount}`);
  console.log(`📊 Optimization level: ${sessionCallCount <= 2 ? '✅ EXCELLENT' : sessionCallCount <= 5 ? '⚠️ GOOD' : '🔴 POOR'}`);
  console.log('📈 Call details:', sessionCalls);
  console.log('🎯 Target: 1-2 calls maximum');
  console.log('💡 Tip: Run this after navigating through the app');
  console.groupEnd();
  
  return {
    totalCalls: sessionCallCount,
    calls: sessionCalls,
    isOptimized: sessionCallCount <= 2
  };
};

// Instructions
console.group('📖 Instructions');
console.log('1. Navigate through the app normally');
console.log('2. Check console for session call tracking');
console.log('3. Run getSessionReport() for summary');
console.log('4. Expected: 1-2 session calls max with optimization');
console.groupEnd();
