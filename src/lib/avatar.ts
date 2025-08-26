// Avatar utility functions

/**
 * Generate MD5 hash for Gravatar (simple implementation)
 */
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
};

/**
 * Generate a Gravatar URL based on email
 */
export const getGravatarUrl = (email: string, size: number = 96): string => {
  if (!email) return '';
  
  const hash = simpleHash(email.toLowerCase().trim());
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon&r=g`;
};

/**
 * Generate a UI Avatars URL based on name
 */
export const getUIAvatarUrl = (name: string, size: number = 96): string => {
  if (!name) return '';
  
  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
    
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${size}&background=6366f1&color=ffffff&format=png`;
};

/**
 * Generate a fallback avatar URL
 */
export const getFallbackAvatarUrl = (name: string, email?: string, size: number = 96): string => {
  // Always use UI Avatars for more reliable results
  return getUIAvatarUrl(name, size);
};

/**
 * Get the best avatar URL with fallbacks
 */
export const getAvatarUrl = (
  originalUrl?: string, 
  name?: string, 
  email?: string, 
  size: number = 96
): string => {
  // If original URL exists and doesn't look like it will fail, use it
  if (originalUrl && !originalUrl.includes('googleusercontent.com')) {
    return originalUrl;
  }
  
  // Use fallback
  return getFallbackAvatarUrl(name || email || 'User', email, size);
};
