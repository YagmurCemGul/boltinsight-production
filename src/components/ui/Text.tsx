'use client';

import { cn } from '@/lib/utils';

type TextSize = 'lg' | 'base' | 'sm' | 'xs';
type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
type TextColor = 'default' | 'muted' | 'subtle' | 'primary' | 'success' | 'warning' | 'danger';

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  /** Text element to render */
  as?: 'p' | 'span' | 'div' | 'label';
  /** Size variant */
  size?: TextSize;
  /** Font weight */
  weight?: TextWeight;
  /** Color variant */
  color?: TextColor;
  /** Leading (line-height) */
  leading?: 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';
  /** Additional class names */
  className?: string;
  children: React.ReactNode;
}

const sizeClasses: Record<TextSize, string> = {
  lg: 'text-lg',
  base: 'text-base',
  sm: 'text-sm',
  xs: 'text-xs',
};

const weightClasses: Record<TextWeight, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const colorClasses: Record<TextColor, string> = {
  default: 'text-gray-900 dark:text-white',
  muted: 'text-gray-500 dark:text-gray-400',
  subtle: 'text-gray-400 dark:text-gray-500',
  primary: 'text-[#5B50BD] dark:text-[#918AD3]',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-amber-600 dark:text-amber-400',
  danger: 'text-red-600 dark:text-red-400',
};

const leadingClasses: Record<string, string> = {
  tight: 'leading-tight',
  snug: 'leading-snug',
  normal: 'leading-normal',
  relaxed: 'leading-relaxed',
  loose: 'leading-loose',
};

/**
 * Text Component
 *
 * A versatile text component with consistent typography.
 *
 * @example
 * <Text>Default body text</Text>
 * <Text size="sm" color="muted">Secondary text</Text>
 * <Text size="lg" weight="semibold">Lead paragraph</Text>
 * <Text as="span" size="xs" color="subtle">Caption</Text>
 */
export function Text({
  as = 'p',
  size = 'base',
  weight = 'normal',
  color = 'default',
  leading = 'normal',
  className,
  children,
  ...props
}: TextProps) {
  const Component = as;

  return (
    <Component
      className={cn(
        'font-body',
        sizeClasses[size],
        weightClasses[weight],
        colorClasses[color],
        leadingClasses[leading],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * Caption Component - Shorthand for small muted text
 */
export function Caption({
  className,
  children,
  ...props
}: Omit<TextProps, 'size' | 'color' | 'as'>) {
  return (
    <Text
      as="span"
      size="xs"
      color="muted"
      leading="loose"
      className={className}
      {...props}
    >
      {children}
    </Text>
  );
}

/**
 * Label Component - Shorthand for form labels
 */
export function Label({
  className,
  children,
  ...props
}: Omit<TextProps, 'as' | 'size' | 'weight'>) {
  return (
    <Text
      as="label"
      size="sm"
      weight="medium"
      className={className}
      {...props}
    >
      {children}
    </Text>
  );
}

/**
 * Overline Component - Uppercase category labels
 */
export function Overline({
  className,
  children,
  ...props
}: Omit<TextProps, 'size' | 'as'>) {
  return (
    <Text
      as="span"
      size="xs"
      weight="semibold"
      className={cn('uppercase tracking-wider', className)}
      {...props}
    >
      {children}
    </Text>
  );
}

export default Text;
