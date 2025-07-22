import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered';
}

export default function Card({ 
  children, 
  className = '', 
  variant = 'default',
  ...props 
}: CardProps) {
  return (
    <div
      className={`
        rounded-lg bg-white
        ${variant === 'bordered' ? 'border border-gray-200' : 'shadow-lg'}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
