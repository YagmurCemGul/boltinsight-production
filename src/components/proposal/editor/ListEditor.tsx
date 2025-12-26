'use client';

import { useState, memo, useCallback } from 'react';
import { Button, Input } from '@/components/ui';

interface ListEditorProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}

export const ListEditor = memo(function ListEditor({
  items,
  onChange,
  placeholder,
}: ListEditorProps) {
  const [newItem, setNewItem] = useState('');

  const addItem = useCallback(() => {
    if (newItem.trim()) {
      onChange([...items, newItem.trim()]);
      setNewItem('');
    }
  }, [newItem, items, onChange]);

  const removeItem = useCallback((index: number) => {
    onChange(items.filter((_, i) => i !== index));
  }, [items, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  }, [addItem]);

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={`${item}-${index}`} className="flex items-center gap-2">
          <span className="flex-1 rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
            {item}
          </span>
          <Button variant="ghost" size="sm" onClick={() => removeItem(index)}>
            Remove
          </Button>
        </div>
      ))}
      <div className="flex gap-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
        />
        <Button variant="outline" onClick={addItem}>
          Add
        </Button>
      </div>
    </div>
  );
});
