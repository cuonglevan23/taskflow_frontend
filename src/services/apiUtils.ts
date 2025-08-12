// API Utilities - Error handling, retry logic, and fallbacks
import { api } from './api';

// Retry configuration
interface RetryConfig {
  maxAttempts: number;
  delay: number;
  backoffMultiplier: number;
  retryCondition?: (error: any) => boolean;
}

// Default retry configuration
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  delay: 1000, // 1 second
  backoffMultiplier: 2,
  retryCondition: (error: any) => {
    // Retry on network errors or 5xx server errors
    return !error.response || (error.response.status >= 500);
  }
};

// Sleep utility for retry delays
const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

// Retry wrapper for API calls
export async function withRetry<T>(
  apiCall: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: any;

  for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
    try {
      console.log(`🔄 API call attempt ${attempt}/${retryConfig.maxAttempts}`);
      const result = await apiCall();
      
      if (attempt > 1) {
        console.log(`✅ API call succeeded on attempt ${attempt}`);
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      // Check if we should retry
      const shouldRetry = attempt < retryConfig.maxAttempts && 
                         retryConfig.retryCondition!(error);
      
      if (shouldRetry) {
        const delay = retryConfig.delay * Math.pow(retryConfig.backoffMultiplier, attempt - 1);
        console.warn(`❌ API call failed (attempt ${attempt}/${retryConfig.maxAttempts}), retrying in ${delay}ms...`);
        console.warn('Error:', error.message);
        
        await sleep(delay);
      } else {
        console.error(`❌ API call failed permanently after ${attempt} attempts`);
        break;
      }
    }
  }

  throw lastError;
}

// Circuit breaker pattern
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
        console.log('🔄 Circuit breaker: HALF_OPEN - testing connection');
      } else {
        throw new Error('Circuit breaker is OPEN - service unavailable');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
    console.log('✅ Circuit breaker: CLOSED - service healthy');
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      console.error(`🚨 Circuit breaker: OPEN - service unavailable (${this.failures} failures)`);
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      threshold: this.threshold
    };
  }
}

// Global circuit breaker instance
const globalCircuitBreaker = new CircuitBreaker();

// Enhanced API wrapper with retry and circuit breaker
export const resilientApi = {
  get: async <T>(url: string, config?: any): Promise<T> => {
    return globalCircuitBreaker.execute(() => 
      withRetry(() => api.get<T>(url, config))
    );
  },

  post: async <T>(url: string, data?: any, config?: any): Promise<T> => {
    return globalCircuitBreaker.execute(() => 
      withRetry(() => api.post<T>(url, data, config))
    );
  },

  put: async <T>(url: string, data?: any, config?: any): Promise<T> => {
    return globalCircuitBreaker.execute(() => 
      withRetry(() => api.put<T>(url, data, config))
    );
  },

  patch: async <T>(url: string, data?: any, config?: any): Promise<T> => {
    return globalCircuitBreaker.execute(() => 
      withRetry(() => api.patch<T>(url, data, config))
    );
  },

  delete: async <T>(url: string, config?: any): Promise<T> => {
    return globalCircuitBreaker.execute(() => 
      withRetry(() => api.delete<T>(url, config))
    );
  }
};

// Fallback data for when API is unavailable
export const getFallbackData = {
  tasks: () => ({
    data: [],
    total: 0,
    page: 1,
    limit: 20
  }),

  taskStats: () => ({
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0,
    testing: 0,
    blocked: 0,
    review: 0,
    high: 0,
    medium: 0,
    low: 0,
    overdue: 0
  }),

  user: () => ({
    id: 'offline',
    email: 'offline@example.com',
    name: 'Offline User',
    role: 'MEMBER'
  })
};

// Safe API call with fallback
export async function safeApiCall<T>(
  apiCall: () => Promise<T>,
  fallback: () => T,
  options: {
    enableRetry?: boolean;
    enableCircuitBreaker?: boolean;
    logErrors?: boolean;
  } = {}
): Promise<T> {
  const { 
    enableRetry = true, 
    enableCircuitBreaker = true,
    logErrors = true 
  } = options;

  try {
    if (enableCircuitBreaker && enableRetry) {
      return await globalCircuitBreaker.execute(() => 
        withRetry(apiCall)
      );
    } else if (enableRetry) {
      return await withRetry(apiCall);
    } else if (enableCircuitBreaker) {
      return await globalCircuitBreaker.execute(apiCall);
    } else {
      return await apiCall();
    }
  } catch (error) {
    if (logErrors) {
      console.warn('🔄 API call failed, using fallback data:', error.message);
    }
    return fallback();
  }
}

// API health monitoring
export const apiHealth = {
  check: async (): Promise<boolean> => {
    try {
      await api.get('/actuator/health');
      return true;
    } catch (error) {
      return false;
    }
  },

  getCircuitBreakerState: () => globalCircuitBreaker.getState(),

  reset: () => {
    globalCircuitBreaker['failures'] = 0;
    globalCircuitBreaker['state'] = 'CLOSED';
    console.log('🔄 Circuit breaker reset');
  }
};