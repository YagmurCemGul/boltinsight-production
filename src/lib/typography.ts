/**
 * Typography System Tokens
 *
 * Reusable typography class combinations for consistent text styling.
 * Uses Tailwind classes mapped to the design system.
 */

export const typography = {
  // ========== Display & Headings ==========

  /** Display - Hero sections, landing pages (48px) */
  display: 'font-heading text-5xl font-bold leading-tight tracking-tight',

  /** H1 - Page titles (36px) */
  h1: 'font-heading text-4xl font-bold leading-tight',

  /** H2 - Section headers (30px) */
  h2: 'font-heading text-3xl font-semibold leading-snug',

  /** H3 - Card titles, subsections (24px) */
  h3: 'font-heading text-2xl font-semibold leading-snug',

  /** H4 - Component headers (20px) */
  h4: 'font-heading text-xl font-medium leading-snug',

  /** H5 - Small headers (18px) */
  h5: 'font-heading text-lg font-medium leading-snug',

  /** H6 - Micro headers (16px) */
  h6: 'font-heading text-base font-medium leading-snug',

  // ========== Body Text ==========

  /** Body Large - Lead paragraphs (18px) */
  bodyLarge: 'font-body text-lg leading-relaxed',

  /** Body - Default body text (16px) */
  body: 'font-body text-base leading-normal',

  /** Body Small - Secondary text (14px) */
  bodySmall: 'font-body text-sm leading-normal',

  // ========== Utility Text ==========

  /** Caption - Helper text, metadata (12px) */
  caption: 'font-body text-xs leading-loose',

  /** Label - Form labels, button text (14px) */
  label: 'font-body text-sm font-medium leading-normal',

  /** Overline - Section labels, categories (12px) */
  overline: 'font-body text-xs font-semibold uppercase tracking-wider',

  /** Link - Clickable text */
  link: 'font-body text-sm font-medium underline-offset-4 hover:underline',

  // ========== Code ==========

  /** Code Inline - Inline code snippets */
  code: 'font-mono text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded',

  /** Code Block - Multi-line code */
  codeBlock: 'font-mono text-sm leading-relaxed',

  // ========== Stats & Numbers ==========

  /** Stat Large - Dashboard large numbers (48px) */
  statLarge: 'font-heading text-5xl font-bold leading-none tracking-tight',

  /** Stat - Dashboard numbers (30px) */
  stat: 'font-heading text-3xl font-bold leading-none',

  /** Stat Small - Compact numbers (24px) */
  statSmall: 'font-heading text-2xl font-bold leading-none',
} as const;

/**
 * Typography color variants
 */
export const textColors = {
  default: 'text-gray-900 dark:text-white',
  muted: 'text-gray-500 dark:text-gray-400',
  subtle: 'text-gray-400 dark:text-gray-500',
  primary: 'text-[#5B50BD] dark:text-[#918AD3]',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-amber-600 dark:text-amber-400',
  danger: 'text-red-600 dark:text-red-400',
  info: 'text-blue-600 dark:text-blue-400',
} as const;

/**
 * Font weight utilities
 */
export const fontWeights = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
} as const;

export type TypographyVariant = keyof typeof typography;
export type TextColor = keyof typeof textColors;
export type FontWeight = keyof typeof fontWeights;
