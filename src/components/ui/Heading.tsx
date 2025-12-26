'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
type HeadingSize = 'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** The HTML heading element to render */
  as?: HeadingLevel;
  /** Visual size of the heading (independent of semantic level) */
  size?: HeadingSize;
  /** Text color variant */
  color?: 'default' | 'muted' | 'primary';
  /** Additional class names */
  className?: string;
  children: React.ReactNode;
}

const sizeClasses: Record<HeadingSize, string> = {
  display: 'text-5xl font-bold leading-tight tracking-tight',
  h1: 'text-4xl font-bold leading-tight',
  h2: 'text-3xl font-semibold leading-snug',
  h3: 'text-2xl font-semibold leading-snug',
  h4: 'text-xl font-medium leading-snug',
  h5: 'text-lg font-medium leading-snug',
  h6: 'text-base font-medium leading-snug',
};

const colorClasses: Record<string, string> = {
  default: 'text-gray-900 dark:text-white',
  muted: 'text-gray-600 dark:text-gray-300',
  primary: 'text-[#5B50BD] dark:text-[#918AD3]',
};

/**
 * Heading Component
 *
 * A semantic heading component with consistent typography.
 * Supports both semantic HTML level (as) and visual size (size).
 *
 * @example
 * <Heading as="h1" size="display">Welcome</Heading>
 * <Heading as="h2">Section Title</Heading>
 * <Heading as="h3" color="muted">Subsection</Heading>
 */
export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ as = 'h2', size, color = 'default', className, children, ...props }, ref) => {
    const Component = as;
    const sizeClass = size ? sizeClasses[size] : sizeClasses[as];

    return (
      <Component
        ref={ref}
        className={cn(
          'font-heading',
          sizeClass,
          colorClasses[color],
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Heading.displayName = 'Heading';

export default Heading;
