/**
 * Centralized image assets management
 * Provides type-safe access to all projects images
 */

// Base paths for different image categories
const BASE_PATHS = {
  icons: '/images/icons',
  avatars: '/images/avatars', 
  backgrounds: '/images/backgrounds',
  logos: '/images/logos',
  thumbnails: '/images/thumbnails',
  placeholders: '/images/placeholders',
} as const;

// Icon assets
export const IconAssets = {
  // File type icons
  fileTypes: {
    pdf: `${BASE_PATHS.icons}/file-pdf.svg`,
    doc: `${BASE_PATHS.icons}/file-doc.svg`,
    xls: `${BASE_PATHS.icons}/file-xls.svg`,
    zip: `${BASE_PATHS.icons}/file-zip.svg`,
    image: `${BASE_PATHS.icons}/file-image.svg`,
    video: `${BASE_PATHS.icons}/file-video.svg`,
    audio: `${BASE_PATHS.icons}/file-audio.svg`,
    code: `${BASE_PATHS.icons}/file-code.svg`,
    text: `${BASE_PATHS.icons}/file-text.svg`,
    default: `${BASE_PATHS.icons}/file-default.svg`,
  },
  
  // UI icons
  ui: {
    upload: `${BASE_PATHS.icons}/upload.svg`,
    download: `${BASE_PATHS.icons}/download.svg`,
    share: `${BASE_PATHS.icons}/share.svg`,
    delete: `${BASE_PATHS.icons}/delete.svg`,
    edit: `${BASE_PATHS.icons}/edit.svg`,
    folder: `${BASE_PATHS.icons}/folder.svg`,
    search: `${BASE_PATHS.icons}/search.svg`,
    filter: `${BASE_PATHS.icons}/filter.svg`,
    menu: `${BASE_PATHS.icons}/menu.svg`,
    close: `${BASE_PATHS.icons}/close.svg`,
  },
  
  // Status icons
  status: {
    success: `${BASE_PATHS.icons}/success.svg`,
    error: `${BASE_PATHS.icons}/error.svg`,
    warning: `${BASE_PATHS.icons}/warning.svg`,
    info: `${BASE_PATHS.icons}/info.svg`,
    loading: `${BASE_PATHS.icons}/loading.svg`,
  },
} as const;

// Avatar assets
export const AvatarAssets = {
  default: `${BASE_PATHS.avatars}/default-user.png`,
  placeholder: `${BASE_PATHS.avatars}/placeholder.svg`,
  team: `${BASE_PATHS.avatars}/team-avatar.png`,
  
  // Default avatars by role
  roles: {
    admin: `${BASE_PATHS.avatars}/admin-default.png`,
    manager: `${BASE_PATHS.avatars}/manager-default.png`,
    developer: `${BASE_PATHS.avatars}/developer-default.png`,
    designer: `${BASE_PATHS.avatars}/designer-default.png`,
    user: `${BASE_PATHS.avatars}/user-default.png`,
  },
} as const;

// Background assets
export const BackgroundAssets = {
  gradients: {
    blue: `${BASE_PATHS.backgrounds}/gradient-blue.jpg`,
    purple: `${BASE_PATHS.backgrounds}/gradient-purple.jpg`,
    green: `${BASE_PATHS.backgrounds}/gradient-green.jpg`,
    orange: `${BASE_PATHS.backgrounds}/gradient-orange.jpg`,
  },
  
  patterns: {
    grid: `${BASE_PATHS.backgrounds}/pattern-grid.svg`,
    dots: `${BASE_PATHS.backgrounds}/pattern-dots.svg`,
    waves: `${BASE_PATHS.backgrounds}/pattern-waves.svg`,
  },
  
  // Hero sections
  hero: {
    dashboard: `${BASE_PATHS.backgrounds}/hero-dashboard.jpg`,
    projects: `${BASE_PATHS.backgrounds}/hero-projects.jpg`,
    team: `${BASE_PATHS.backgrounds}/hero-team.jpg`,
  },
} as const;

// Logo assets
export const LogoAssets = {
  main: `${BASE_PATHS.logos}/logo.svg`,
  mainDark: `${BASE_PATHS.logos}/logo-dark.svg`,
  icon: `${BASE_PATHS.logos}/logo-icon.svg`,
  iconDark: `${BASE_PATHS.logos}/logo-icon-dark.svg`,
  
  // Different sizes
  sizes: {
    small: `${BASE_PATHS.logos}/logo-small.png`,      // 32x32
    medium: `${BASE_PATHS.logos}/logo-medium.png`,    // 64x64
    large: `${BASE_PATHS.logos}/logo-large.png`,      // 128x128
    xlarge: `${BASE_PATHS.logos}/logo-xlarge.png`,    // 256x256
  },
} as const;

// Placeholder assets
export const PlaceholderAssets = {
  // Empty states
  emptyState: {
    noData: `${BASE_PATHS.placeholders}/no-data.svg`,
    noFiles: `${BASE_PATHS.placeholders}/no-files.svg`,
    noTasks: `${BASE_PATHS.placeholders}/no-tasks.svg`,
    noProjects: `${BASE_PATHS.placeholders}/no-projects.svg`,
    noTeam: `${BASE_PATHS.placeholders}/no-team.svg`,
    search: `${BASE_PATHS.placeholders}/search-empty.svg`,
  },
  
  // Loading states
  loading: {
    image: `${BASE_PATHS.placeholders}/loading-image.svg`,
    content: `${BASE_PATHS.placeholders}/loading-content.svg`,
    card: `${BASE_PATHS.placeholders}/loading-card.svg`,
  },
  
  // Content placeholders
  content: {
    imagePlaceholder: `${BASE_PATHS.placeholders}/image-placeholder.svg`,
    videoPlaceholder: `${BASE_PATHS.placeholders}/video-placeholder.svg`,
    documentPlaceholder: `${BASE_PATHS.placeholders}/document-placeholder.svg`,
  },
} as const;

// Thumbnail assets (for generated thumbnails)
export const ThumbnailAssets = {
  // Generate thumbnail path for files
  generatePath: (fileId: string, size: 'sm' | 'md' | 'lg' = 'md') => 
    `${BASE_PATHS.thumbnails}/${fileId}-${size}.jpg`,
  
  // Default thumbnails by file type
  defaults: {
    pdf: `${BASE_PATHS.thumbnails}/default-pdf.jpg`,
    doc: `${BASE_PATHS.thumbnails}/default-doc.jpg`,
    xls: `${BASE_PATHS.thumbnails}/default-xls.jpg`,
    image: `${BASE_PATHS.thumbnails}/default-image.jpg`,
    video: `${BASE_PATHS.thumbnails}/default-video.jpg`,
    folder: `${BASE_PATHS.thumbnails}/default-folder.jpg`,
  },
} as const;

// Combined export for easy access
export const ImageAssets = {
  icons: IconAssets,
  avatars: AvatarAssets,
  backgrounds: BackgroundAssets,
  logos: LogoAssets,
  placeholders: PlaceholderAssets,
  thumbnails: ThumbnailAssets,
  
  // Helper functions
  helpers: {
    // Get file type icon
    getFileIcon: (fileType: string) => {
      const type = fileType.toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(type)) return IconAssets.fileTypes.image;
      if (['pdf'].includes(type)) return IconAssets.fileTypes.pdf;
      if (['doc', 'docx'].includes(type)) return IconAssets.fileTypes.doc;
      if (['xls', 'xlsx'].includes(type)) return IconAssets.fileTypes.xls;
      if (['zip', 'rar', '7z'].includes(type)) return IconAssets.fileTypes.zip;
      if (['mp4', 'avi', 'mov'].includes(type)) return IconAssets.fileTypes.video;
      if (['mp3', 'wav', 'flac'].includes(type)) return IconAssets.fileTypes.audio;
      if (['js', 'ts', 'tsx', 'jsx', 'html', 'css'].includes(type)) return IconAssets.fileTypes.code;
      if (['txt', 'md'].includes(type)) return IconAssets.fileTypes.text;
      return IconAssets.fileTypes.default;
    },
    
    // Get user avatar with fallback
    getUserAvatar: (avatarUrl?: string, role?: string) => {
      if (avatarUrl) return avatarUrl;
      if (role && role in AvatarAssets.roles) {
        return AvatarAssets.roles[role as keyof typeof AvatarAssets.roles];
      }
      return AvatarAssets.default;
    },
    
    // Get responsive logo
    getLogoByTheme: (isDark: boolean) => isDark ? LogoAssets.mainDark : LogoAssets.main,
  },
} as const;

// Type exports for TypeScript support
export type IconType = keyof typeof IconAssets.fileTypes;
export type UIIconType = keyof typeof IconAssets.ui;
export type StatusIconType = keyof typeof IconAssets.status;
export type AvatarRoleType = keyof typeof AvatarAssets.roles;
export type LogoSizeType = keyof typeof LogoAssets.sizes;