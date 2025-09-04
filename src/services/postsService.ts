/**
 * @deprecated - This file is deprecated. Please use the new modular structure:
 * - Types: import from 'src/types/post'
 * - Service: import from 'src/services/post'
 *
 * This file maintains backward compatibility but will be removed in future versions.
 */

// Re-export everything from the new modular structure for backward compatibility
export * from '../types/post';
export { default } from './post/PostsService';

// Also export the service as a named export for different import patterns
export { default as PostsService } from './post/PostsService';
