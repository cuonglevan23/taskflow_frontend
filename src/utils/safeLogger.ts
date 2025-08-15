// Safe Logger - Crash-proof logging utility
export class SafeLogger {
  static error(message: string, ...args: any[]) {
    try {
      // Convert all arguments to safe strings
      const safeArgs = args.map(arg => {
        if (arg === null) return 'null';
        if (arg === undefined) return 'undefined';
        if (typeof arg === 'string') return arg;
        if (typeof arg === 'number') return arg.toString();
        if (typeof arg === 'boolean') return arg.toString();
        
        // For objects, use JSON.stringify safely
        try {
          return JSON.stringify(arg);
        } catch {
          return '[Object]';
        }
      });
      
      console.error(message, ...safeArgs);
    } catch (error) {
      // Ultimate fallback - basic message only
      console.error('❌ Error occurred (details unavailable)');
    }
  }
  
  static debug(message: string, ...args: any[]) {
    try {
      const safeArgs = args.map(arg => {
        try {
          return JSON.stringify(arg);
        } catch {
          return '[Object]';
        }
      });
      
      console.debug(message, ...safeArgs);
    } catch (error) {
      console.debug('🔍 Debug message (details unavailable)');
    }
  }
  
  static warn(message: string, ...args: any[]) {
    try {
      const safeArgs = args.map(arg => {
        if (arg === null) return 'null';
        if (arg === undefined) return 'undefined';
        if (typeof arg === 'string') return arg;
        if (typeof arg === 'number') return arg.toString();
        if (typeof arg === 'boolean') return arg.toString();
        
        try {
          return JSON.stringify(arg);
        } catch {
          return '[Object]';
        }
      });
      
      console.warn(message, ...safeArgs);
    } catch (error) {
      console.warn('⚠️ Warning occurred (details unavailable)');
    }
  }
  
  static log(message: string, ...args: any[]) {
    try {
      const safeArgs = args.map(arg => {
        if (arg === null) return 'null';
        if (arg === undefined) return 'undefined';
        if (typeof arg === 'string') return arg;
        if (typeof arg === 'number') return arg.toString();
        if (typeof arg === 'boolean') return arg.toString();
        
        try {
          return JSON.stringify(arg);
        } catch {
          return '[Object]';
        }
      });
      
      console.log(message, ...safeArgs);
    } catch (error) {
      console.log('ℹ️ Log occurred (details unavailable)');
    }
  }
}