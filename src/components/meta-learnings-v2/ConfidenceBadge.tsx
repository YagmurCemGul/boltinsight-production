'use client';

import { cn } from '@/lib/utils';
import { CONFIDENCE_CONFIG, SIZE_CONFIG } from './constants';
import type { ConfidenceBadgeProps, ConfidenceLevel } from './types';

function getConfidenceLevel(level: number): ConfidenceLevel {
  if (level >= CONFIDENCE_CONFIG.high.min) return 'high';
  if (level >= CONFIDENCE_CONFIG.medium.min) return 'medium';
  return 'low';
}

export function ConfidenceBadge({
  level,
  size = 'md',
  showPercentage = true,
  className,
}: ConfidenceBadgeProps) {
  const confidenceLevel = getConfidenceLevel(level);
  const config = CONFIDENCE_CONFIG[confidenceLevel];
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        sizeConfig.padding,
        sizeConfig.fontSize,
        config.bgColor,
        config.color,
        className
      )}
      title={`${level}% confidence`}
    >
      <span className="tracking-tight">{config.dots}</span>
      {showPercentage && <span>{level}%</span>}
    </span>
  );
}
