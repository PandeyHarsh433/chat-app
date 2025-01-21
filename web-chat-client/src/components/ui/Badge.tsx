import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      {
        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100': variant === 'default',
        'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100': variant === 'success',
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100': variant === 'warning',
        'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100': variant === 'error',
      }
    )}>
      {children}
    </span>
  );
}