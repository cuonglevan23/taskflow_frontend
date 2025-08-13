// TypeScript utility functions and type guards to replace any usage

// Type guard to check if value is defined
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

// Type guard to check if value is a string
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// Type guard to check if value is a number
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

// Type guard to check if value is a boolean
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

// Type guard to check if value is an object
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Type guard to check if value is an array
export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value);
}

// Type guard to check if value is a function
export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}

// Type guard to check if value is a Date
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

// Type guard to check if value is a valid date string
export function isDateString(value: unknown): value is string {
  if (!isString(value)) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
}

// Safe property access with type checking
export function safeGet<T>(
  obj: Record<string, unknown>,
  key: string,
  defaultValue: T
): T {
  const value = obj[key];
  return isDefined(value) ? (value as T) : defaultValue;
}

// Safe array access with bounds checking
export function safeArrayGet<T>(
  array: T[],
  index: number,
  defaultValue: T
): T {
  return array[index] ?? defaultValue;
}

// Convert unknown to string safely
export function toString(value: unknown): string {
  if (isString(value)) return value;
  if (isNumber(value)) return value.toString();
  if (isBoolean(value)) return value.toString();
  if (isDate(value)) return value.toISOString();
  if (value === null) return '';
  if (value === undefined) return '';
  return String(value);
}

// Convert unknown to number safely
export function toNumber(value: unknown, defaultValue = 0): number {
  if (isNumber(value)) return value;
  if (isString(value)) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

// Convert unknown to boolean safely
export function toBoolean(value: unknown): boolean {
  if (isBoolean(value)) return value;
  if (isString(value)) {
    return value.toLowerCase() === 'true' || value === '1';
  }
  if (isNumber(value)) return value !== 0;
  return Boolean(value);
}

// Extract error message from unknown error
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (isString(error)) return error;
  if (isObject(error) && isString(error.message)) return error.message;
  return 'An unknown error occurred';
}

// Extract status code from error
export function getErrorStatus(error: unknown): number | undefined {
  if (isObject(error)) {
    if (isNumber(error.status)) return error.status;
    if (isNumber(error.statusCode)) return error.statusCode;
    if (isObject(error.response) && isNumber(error.response.status)) {
      return error.response.status;
    }
  }
  return undefined;
}

// Type-safe JSON parsing
export function safeJsonParse<T = unknown>(
  json: string,
  defaultValue: T
): T {
  try {
    const parsed = JSON.parse(json);
    return parsed as T;
  } catch {
    return defaultValue;
  }
}

// Type-safe localStorage operations
export function safeLocalStorageGet<T>(
  key: string,
  defaultValue: T
): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return safeJsonParse(item, defaultValue);
  } catch {
    return defaultValue;
  }
}

export function safeLocalStorageSet(
  key: string,
  value: unknown
): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// Debounce function with proper typing
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function with proper typing
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Deep clone with type safety
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T;
  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  return obj;
}

// Pick properties with type safety
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

// Omit properties with type safety
export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
}

// Type assertion with runtime check
export function assertType<T>(
  value: unknown,
  typeGuard: (value: unknown) => value is T,
  errorMessage?: string
): T {
  if (typeGuard(value)) {
    return value;
  }
  throw new Error(errorMessage || 'Type assertion failed');
}

// Utility type for making all properties optional recursively
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Record<string, unknown>
    ? DeepPartial<T[P]>
    : T[P];
};

// Utility type for making all properties required recursively
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends Record<string, unknown>
    ? DeepRequired<T[P]>
    : T[P];
};

// Utility type for nullable properties
export type Nullable<T> = T | null;

// Utility type for optional properties
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Utility type for required properties
export type Required<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Event handler type
export type EventHandler<T = unknown> = (event: T) => void;

// Async event handler type
export type AsyncEventHandler<T = unknown> = (event: T) => Promise<void>;

// Generic callback type
export type Callback<T = void> = () => T;

// Generic async callback type
export type AsyncCallback<T = void> = () => Promise<T>;