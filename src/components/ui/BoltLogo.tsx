'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BoltLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'auto';
}

export function BoltLogo({ className, variant = 'light' }: BoltLogoProps) {
  return (
    <Image
      src="/Logo.png"
      alt="BoltInsight"
      width={241}
      height={136}
      className={cn(
        'object-contain',
        variant === 'dark' && 'brightness-0 invert opacity-90',
        variant === 'auto' && 'dark:brightness-0 dark:invert dark:opacity-90',
        className
      )}
      priority
    />
  );
}

export function BoltLogoIcon({ className, variant = 'light' }: BoltLogoProps) {
  return <BoltLogo className={className} variant={variant} />;
}
