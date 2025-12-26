'use client';

import { memo } from 'react';
import { Wand2 } from 'lucide-react';
import { Button, InfoTooltip } from '@/components/ui';

interface SectionEditorProps {
  title: string;
  description: string;
  children: React.ReactNode;
  onRephrase?: () => void;
}

export const SectionEditor = memo(function SectionEditor({
  title,
  description,
  children,
  onRephrase,
}: SectionEditorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <InfoTooltip content={description} position="right" />
        </div>
        {onRephrase && (
          <Button variant="ghost" size="sm" onClick={onRephrase}>
            <Wand2 className="mr-2 h-4 w-4" />
            AI Rephrase
          </Button>
        )}
      </div>
      {children}
    </div>
  );
});
