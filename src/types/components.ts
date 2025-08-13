// Component-specific TypeScript interfaces to replace any types

import type { ReactNode } from 'react';
import type { SelectOption, ActionConfig, LoadingState, ErrorState } from './common';

// Generic component props
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  id?: string;
  'data-testid'?: string;
}

// Button component props
export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

// Input component props
export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  maxLength?: number;
  minLength?: number;
}

// Select component props
export interface SelectProps extends BaseComponentProps {
  options: SelectOption[];
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
}

// Modal component props
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  maskClosable?: boolean;
  footer?: ReactNode;
  centered?: boolean;
}

// Table component props
export interface TableProps<T = Record<string, unknown>> extends BaseComponentProps {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  selection?: {
    selectedRowKeys: string[];
    onChange: (selectedRowKeys: string[], selectedRows: T[]) => void;
  };
  onRow?: (record: T, index: number) => {
    onClick?: () => void;
    onDoubleClick?: () => void;
    onContextMenu?: () => void;
  };
  scroll?: {
    x?: number | string;
    y?: number | string;
  };
}

export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  width?: number | string;
  fixed?: 'left' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: unknown, record: T, index: number) => ReactNode;
  sorter?: (a: T, b: T) => number;
  filters?: { text: string; value: string }[];
  onFilter?: (value: string, record: T) => boolean;
}

// Form component props
export interface FormProps extends BaseComponentProps {
  onSubmit?: (values: Record<string, unknown>) => void;
  initialValues?: Record<string, unknown>;
  loading?: boolean;
  disabled?: boolean;
  layout?: 'horizontal' | 'vertical' | 'inline';
  labelCol?: { span: number };
  wrapperCol?: { span: number };
}

// Card component props
export interface CardProps extends BaseComponentProps {
  title?: ReactNode;
  extra?: ReactNode;
  cover?: ReactNode;
  actions?: ActionConfig[];
  bordered?: boolean;
  hoverable?: boolean;
  loading?: boolean;
  size?: 'default' | 'small';
}

// Tabs component props
export interface TabsProps extends BaseComponentProps {
  items: TabItem[];
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
  type?: 'line' | 'card' | 'editable-card';
  size?: 'large' | 'default' | 'small';
  position?: 'top' | 'right' | 'bottom' | 'left';
}

export interface TabItem {
  key: string;
  label: ReactNode;
  children: ReactNode;
  disabled?: boolean;
  closable?: boolean;
  icon?: ReactNode;
}

// Dropdown component props
export interface DropdownProps extends BaseComponentProps {
  trigger?: ('click' | 'hover' | 'contextMenu')[];
  placement?: 'bottom' | 'bottomLeft' | 'bottomRight' | 'top' | 'topLeft' | 'topRight';
  overlay: ReactNode;
  disabled?: boolean;
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
}

// Tooltip component props
export interface TooltipProps extends BaseComponentProps {
  title: ReactNode;
  placement?: 'top' | 'left' | 'right' | 'bottom' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom';
  trigger?: 'hover' | 'focus' | 'click' | 'contextMenu';
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  color?: string;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
}

// Notification component props
export interface NotificationProps {
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  description?: string;
  duration?: number;
  placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  onClose?: () => void;
  icon?: ReactNode;
  btn?: ReactNode;
  key?: string;
}

// Loading component props
export interface LoadingProps extends BaseComponentProps {
  spinning?: boolean;
  size?: 'small' | 'default' | 'large';
  tip?: string;
  delay?: number;
  indicator?: ReactNode;
}

// Empty component props
export interface EmptyProps extends BaseComponentProps {
  image?: ReactNode;
  imageStyle?: React.CSSProperties;
  description?: ReactNode;
}

// Pagination component props
export interface PaginationProps extends BaseComponentProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number, pageSize: number) => void;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: [number, number]) => ReactNode;
  size?: 'default' | 'small';
  simple?: boolean;
  disabled?: boolean;
  hideOnSinglePage?: boolean;
}

// Breadcrumb component props
export interface BreadcrumbProps extends BaseComponentProps {
  items: BreadcrumbItem[];
  separator?: ReactNode;
}

export interface BreadcrumbItem {
  title: ReactNode;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
}

// Steps component props
export interface StepsProps extends BaseComponentProps {
  current: number;
  items: StepItem[];
  direction?: 'horizontal' | 'vertical';
  size?: 'default' | 'small';
  status?: 'wait' | 'process' | 'finish' | 'error';
  onChange?: (current: number) => void;
}

export interface StepItem {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  status?: 'wait' | 'process' | 'finish' | 'error';
  disabled?: boolean;
}

// Layout component props
export interface LayoutProps extends BaseComponentProps {
  hasSider?: boolean;
}

export interface SiderProps extends BaseComponentProps {
  collapsed?: boolean;
  collapsible?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  width?: number | string;
  collapsedWidth?: number | string;
  breakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  onBreakpoint?: (broken: boolean) => void;
  theme?: 'light' | 'dark';
  trigger?: ReactNode;
  reverseArrow?: boolean;
  zeroWidthTriggerStyle?: React.CSSProperties;
}

export interface HeaderProps extends BaseComponentProps {
  style?: React.CSSProperties;
}

export interface ContentProps extends BaseComponentProps {
  style?: React.CSSProperties;
}

export interface FooterProps extends BaseComponentProps {
  style?: React.CSSProperties;
}