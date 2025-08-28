// Icon Constants - Centralized icon management with Lucide React
import { CustomHomeIcon } from '@/components/icons/CustomHomeIcon';
import { CustomTaskIcon } from '@/components/icons/CustomTaskIcon';
import { CustomInboxIcon } from '@/components/icons/CustomInboxIcon';
import { CustomReportingIcon } from '@/components/icons/CustomReportingIcon';
import { CustomGoalIcon } from '@/components/icons/CustomGoalIcon';
import {
  // Navigation Icons
  Folder,
  FolderOpen,
  CheckSquare,
  
  // Action Icons
  Plus,
  Search,
  Bell,
  Settings,
  HelpCircle,
  Menu,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  
  // User & Team Icons
  User,
  Users,
  UserPlus,
  Crown,
  Shield,
  
  // Communication Icons
  MessageSquare,
  Mail,
  Phone,
  Video,
  Send,
  Rss, // Added for NewsFeed

  // Status Icons
  Check,
  AlertCircle,
  Info,
  AlertTriangle,
  XCircle,
  Clock,
  
  // File & Document Icons
  File,
  FileText,
  Image,
  Download,
  Upload,
  Paperclip,
  StickyNote,
  
  // Arrow & Navigation Icons
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  
  // Layout Icons
  Sidebar,
  Grid,
  List,
  Calendar,
  BarChart,
  Kanban,
  
  // Settings & Config Icons
  Cog,
  Palette,
  Moon,
  Sun,
  Monitor,
  
  // Project Management Icons
  GitBranch,
  Layers,
  Flag,
  Star,
  Heart,
  Bookmark,
  
  // Data Icons
  TrendingUp,
  PieChart,
  Activity,
  Database,
  
  // Miscellaneous Icons
  Zap,
  Coffee,
  Trash2,
  Edit,
  Copy,
  Share,
  Filter,
  ArrowUpDown,
} from 'lucide-react';

// Icon Size Presets
export const ICON_SIZES = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

export type IconSize = keyof typeof ICON_SIZES;

// Navigation Icons
export const NAVIGATION_ICONS = {
  home: CustomHomeIcon,
  projects: Folder,
  projectsOpen: FolderOpen,
  tasks: CustomTaskIcon,
  inbox: CustomInboxIcon,
  reporting: CustomReportingIcon,
  goals: CustomGoalIcon,
  teams: Users,
} as const;

// Action Icons  
export const ACTION_ICONS = {
  create: Plus,
  search: Search,
  notifications: Bell,
  settings: Settings,
  help: HelpCircle,
  menu: Menu,
  close: X,
  
  // Chevrons
  down: ChevronDown,
  right: ChevronRight,
  left: ChevronLeft,
  
  // Arrows
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  arrowUp: ArrowUp,
  arrowDown: ArrowDown,
  
  // File Actions
  download: Download,
  upload: Upload,
  attach: Paperclip,
  
  // General Actions
  edit: Edit,
  copy: Copy,
  share: Share,
  delete: Trash2,
  filter: Filter,
  sort: ArrowUpDown,
} as const;

// User & Team Icons
export const USER_ICONS = {
  user: User,
  users: Users,
  invite: UserPlus,
  owner: Crown,
  admin: Shield,
} as const;

// Communication Icons
export const COMMUNICATION_ICONS = {
  message: MessageSquare,
  email: Mail,
  phone: Phone,
  video: Video,
  send: Send,
} as const;

// Status Icons
export const STATUS_ICONS = {
  success: Check,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
  pending: Clock,
  alert: AlertCircle,
} as const;

// Layout Icons
export const LAYOUT_ICONS = {
  sidebar: Sidebar,
  grid: Grid,
  list: List,
  calendar: Calendar,
  timeline: BarChart,
  board: Kanban,
  notes: StickyNote,
} as const;

// Theme Icons
export const THEME_ICONS = {
  light: Sun,
  dark: Moon,
  system: Monitor,
  palette: Palette,
} as const;



// Data & Analytics Icons
export const DATA_ICONS = {
  trending: TrendingUp,
  chart: PieChart,
  activity: Activity,
  database: Database,
} as const;

// File Type Icons
export const FILE_ICONS = {
  file: File,
  document: FileText,
  image: Image,
} as const;

// Miscellaneous Icons
export const MISC_ICONS = {
  zap: Zap,
  coffee: Coffee,
  external: ExternalLink,
  settings: Cog,
} as const;

// Create Button Dropdown Icons (Semantic mapping)
export const CREATE_DROPDOWN_ICONS = {
  task: CheckSquare,
  project: Folder,
  message: MessageSquare,
  team: Users,
  goal: CustomGoalIcon,
  invite: UserPlus,
} as const;

// Sidebar Navigation Icons (Semantic mapping)
export const SIDEBAR_ICONS = {
  home: CustomHomeIcon,
  myTasks: CustomTaskIcon,
  inbox: CustomInboxIcon,
  newsfeed: Rss, // Added NewsFeed icon
  reporting: CustomReportingIcon,
  goals: CustomGoalIcon,
  projects: Folder,
  teams: Users,
  createProject: Plus,
  createTeam: Plus,
} as const;

// Header Icons (Semantic mapping)
export const HEADER_ICONS = {
  menu: Menu,
  sidebarCollapse: ChevronLeft,
  sidebarExpand: ChevronRight,
  search: Search,
  notifications: Bell,
  help: HelpCircle,
  settings: Settings,
  user: User,
  chevronDown: ChevronDown,
} as const;

// All Icons Combined
export const ALL_ICONS = {
  ...NAVIGATION_ICONS,
  ...ACTION_ICONS,
  ...USER_ICONS,
  ...COMMUNICATION_ICONS,
  ...STATUS_ICONS,
  ...LAYOUT_ICONS,
  ...THEME_ICONS,
  ...DATA_ICONS,
  ...FILE_ICONS,
  ...MISC_ICONS,
} as const;

// Icon Component Props Type
export interface IconProps {
  size?: IconSize | number;
  className?: string;
  color?: string;
  strokeWidth?: number;
}

// Helper function to get icon size in pixels
export const getIconSize = (size: IconSize | number): number => {
  if (typeof size === 'number') return size;
  return ICON_SIZES[size];
};

// Icon wrapper component props
export interface IconWrapperProps extends IconProps {
  icon: keyof typeof ALL_ICONS;
}

// Color mappings for semantic icons
export const ICON_COLORS = {
  task: '#3b82f6', // blue
  project: '#22c55e', // green
  message: '#8b5cf6', // purple
  team: '#6366f1', // indigo
  goal: '#eab308', // yellow
  invite: '#64748b', // slate
  
  // Status colors
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Default colors
  primary: '#ef4444',
  secondary: '#64748b',
  muted: '#94a3b8',
} as const;

export type IconColor = keyof typeof ICON_COLORS;

// Export default icon configurations
export const DEFAULT_ICON_CONFIG = {
  size: 'md' as IconSize,
  strokeWidth: 2,
  className: '',
} as const;
