# Project Images Directory

This directory contains all images used across the project.

## Directory Structure

```
public/images/
├── icons/          # App icons, file type icons, UI icons
├── avatars/        # User profile pictures and default avatars
├── backgrounds/    # Background images, patterns, textures
├── logos/          # Company logos, brand assets
├── thumbnails/     # Generated thumbnails for files/content
└── placeholders/   # Placeholder images for empty states
```

## Usage Guidelines

### 1. File Naming Convention
- Use kebab-case: `user-profile-placeholder.png`
- Include size if multiple versions: `logo-256x256.png`, `logo-512x512.png`
- Use descriptive names: `file-icon-pdf.svg`, `background-gradient-blue.jpg`

### 2. Recommended Formats
- **Icons**: SVG (vector) or PNG with transparency
- **Photos**: JPG or WebP for smaller file sizes
- **Graphics**: PNG for transparency, SVG for scalable graphics
- **Backgrounds**: JPG or WebP, consider multiple resolutions

### 3. Optimization
- Compress images before adding to project
- Use WebP format when possible for better performance
- Provide multiple sizes for responsive images

### 4. Accessibility
- Always provide meaningful alt text when using images
- Ensure sufficient contrast for text overlays
- Consider dark mode alternatives where appropriate

## Example Usage

```tsx
// Direct path usage
<img src="/images/avatars/default-user.png" alt="Default user avatar" />

// With Next.js Image component
import Image from 'next/image';
<Image 
  src="/images/logos/company-logo.png" 
  alt="Company Logo"
  width={200}
  height={100}
/>

// Using the ImageAssets utility
import { ImageAssets } from '@/utils/imageAssets';
<img src={ImageAssets.avatars.defaultUser} alt="Default user avatar" />
```