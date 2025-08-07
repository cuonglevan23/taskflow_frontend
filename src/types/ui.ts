import { ReactNode, MouseEvent } from 'react';

// Common UI props
export interface BaseProps {
  className?: string;
  children?: ReactNode;
}

// Button variants and sizes
export type ButtonVariant = 
  // Primary variants
  | 'primary' 
  | 'primary-gradient'
  // Secondary variants  
  | 'secondary'
  | 'secondary-solid'
  // Color variants
  | 'success'
  | 'success-gradient'
  | 'danger'
  | 'destructive'
  | 'danger-gradient'
  | 'warning'
  | 'warning-gradient'
  | 'info'
  | 'info-gradient'
  // Ghost variants
  | 'ghost'
  | 'ghost-colored'
  // Outline variants
  | 'outline'
  | 'outline-primary'
  | 'outline-success'
  | 'outline-danger'
  | 'outline-warning'
  // Soft variants
  | 'soft-primary'
  | 'soft-success'
  | 'soft-danger'
  | 'soft-warning'
  // Special variants
  | 'link';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type ButtonShape = 'default' | 'rounded' | 'square' | 'pill';
export type ButtonState = 'default' | 'selected' | 'active' | 'loading';

export interface ButtonProps extends BaseProps {
  // Core button props
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  state?: ButtonState;
  
  // Behavior props
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  
  // Event handlers
  onClick?: (event?: MouseEvent<HTMLButtonElement>) => void;
  
  // Button attributes
  type?: 'button' | 'submit' | 'reset';
  
  // Icon props
  icon?: ReactNode;          // Legacy support
  leftIcon?: ReactNode;      // Left side icon
  rightIcon?: ReactNode;     // Right side icon
}

// Input types
export interface InputProps extends BaseProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

// Modal types
export interface ModalProps extends BaseProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

// Loading state
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

// Error state
export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}

// Pagination
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

// Table types
export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex: string;
  render?: (value: any, record: T, index: number) => ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T = any> extends BaseProps {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: PaginationProps;
  selectedRowKeys?: string[];
  onRowSelect?: (selectedKeys: string[]) => void;
  onRowClick?: (record: T, index: number) => void;
} 