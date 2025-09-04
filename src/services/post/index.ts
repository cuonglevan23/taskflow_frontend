/**
 * Post Service Module - Barrel exports for clean imports
 */

export { PostApiClient } from './apiClient';
export { PostDataTransformer } from './transformer';
export { default as PostsService } from './PostsService';

// Re-export types for convenience
export * from '../../types/post';
