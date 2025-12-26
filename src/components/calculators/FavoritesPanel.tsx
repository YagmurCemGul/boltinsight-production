'use client';

import { useState } from 'react';
import {
  Star,
  StarOff,
  X,
  Play,
  Edit2,
  Trash2,
  Plus,
  Users,
  Percent,
  Clock,
  BarChart3,
  PieChart,
  ClipboardCheck,
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useCalculatorStore } from '@/lib/calculators/store';
import type { CalculatorConfig, CalculatorType } from '@/types/calculator';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const CALCULATOR_ICONS: Record<CalculatorType, typeof Users> = {
  sample: Users,
  moe: Percent,
  loi: Clock,
  maxdiff: BarChart3,
  demographics: PieChart,
  feasibility: ClipboardCheck,
};

const CALCULATOR_LABELS: Record<CalculatorType, string> = {
  sample: 'Sample Size',
  moe: 'Margin of Error',
  loi: 'LOI',
  maxdiff: 'MaxDiff',
  demographics: 'Demographics',
  feasibility: 'Feasibility',
};

const CALCULATOR_COLORS: Record<CalculatorType, string> = {
  sample: 'text-blue-600',
  moe: 'text-blue-600',
  loi: 'text-green-600',
  maxdiff: 'text-[#5B50BD]',
  demographics: 'text-teal-600',
  feasibility: 'text-amber-600',
};

interface FavoritesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFavorite: (config: CalculatorConfig) => void;
  position?: 'left' | 'right';
}

export function FavoritesPanel({
  isOpen,
  onClose,
  onSelectFavorite,
  position = 'right',
}: FavoritesPanelProps) {
  const { favorites, removeFavorite } = useCalculatorStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleStartEdit = (config: CalculatorConfig) => {
    setEditingId(config.id);
    setEditName(config.name);
  };

  const handleSaveEdit = (id: string) => {
    // In a real implementation, you'd update the favorite name
    // For now, we'll just close the edit mode
    setEditingId(null);
    setEditName('');
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed inset-y-0 w-80 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-xl z-40 flex flex-col',
        position === 'right' ? 'right-0 border-l' : 'left-0 border-r'
      )}
    >
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Favorites</h2>
            <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400">
              {favorites.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Save calculator configurations for quick access
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center">
            <StarOff className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">No favorites yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
              Save a calculation to add it to your favorites
            </p>
          </div>
        ) : (
          <div className="py-2 space-y-1">
            {favorites.map((config) => (
              <FavoriteItem
                key={config.id}
                config={config}
                isEditing={editingId === config.id}
                editName={editName}
                onEditNameChange={setEditName}
                onStartEdit={() => handleStartEdit(config)}
                onSaveEdit={() => handleSaveEdit(config.id)}
                onCancelEdit={() => setEditingId(null)}
                onSelect={() => onSelectFavorite(config)}
                onDelete={() => removeFavorite(config.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer with tip */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-[#EDE9F9] dark:bg-[#231E51]">
        <p className="text-xs text-[#5B50BD] dark:text-[#918AD3] flex items-center gap-2">
          <Star className="w-4 h-4" />
          <span>Click the star icon in any calculator result to save it as a favorite</span>
        </p>
      </div>
    </div>
  );
}

interface FavoriteItemProps {
  config: CalculatorConfig;
  isEditing: boolean;
  editName: string;
  onEditNameChange: (name: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onSelect: () => void;
  onDelete: () => void;
}

function FavoriteItem({
  config,
  isEditing,
  editName,
  onEditNameChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onSelect,
  onDelete,
}: FavoriteItemProps) {
  const Icon = CALCULATOR_ICONS[config.type];
  const color = CALCULATOR_COLORS[config.type];
  const label = CALCULATOR_LABELS[config.type];

  const getInputsSummary = (): string[] => {
    const inputs = config.inputs;
    const summary: string[] = [];

    if (inputs.confidenceLevel) summary.push(`${inputs.confidenceLevel}% CI`);
    if (inputs.marginOfError) summary.push(`±${inputs.marginOfError}%`);
    if (inputs.sampleSize) summary.push(`n=${inputs.sampleSize}`);
    if (inputs.country) summary.push(String(inputs.country));
    if (inputs.totalItems) summary.push(`${inputs.totalItems} items`);

    return summary.slice(0, 3);
  };

  const date = config.createdAt instanceof Date
    ? config.createdAt
    : new Date(config.createdAt as unknown as string);

  return (
    <div className="group px-2">
      <div
        className={cn(
          'flex items-start gap-3 px-3 py-3 rounded-lg transition-colors',
          isEditing
            ? 'bg-[#EDE9F9] dark:bg-[#231E51]'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        )}
      >
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800', color)}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={editName}
                onChange={(e) => onEditNameChange(e.target.value)}
                className="text-sm"
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={onSaveEdit}>Save</Button>
                <Button size="sm" variant="outline" onClick={onCancelEdit}>Cancel</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                  {config.name}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {label}
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {getInputsSummary().map((item, i) => (
                  <span
                    key={i}
                    className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                Saved {format(date, 'MMM d, yyyy')}
              </div>
            </>
          )}
        </div>

        {!isEditing && (
          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onSelect}
              className="p-1.5 hover:bg-[#5B50BD]/10 rounded transition-colors"
              title="Run with these settings"
            >
              <Play className="w-4 h-4 text-[#5B50BD]" />
            </button>
            <button
              onClick={onStartEdit}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              title="Edit name"
            >
              <Edit2 className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-950/30 rounded transition-colors"
              title="Remove from favorites"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Save to favorites button component
interface SaveToFavoritesButtonProps {
  calculatorType: CalculatorType;
  inputs: Record<string, unknown>;
  disabled?: boolean;
}

export function SaveToFavoritesButton({
  calculatorType,
  inputs,
  disabled = false,
}: SaveToFavoritesButtonProps) {
  const { addFavorite, favorites } = useCalculatorStore();
  const [showNameInput, setShowNameInput] = useState(false);
  const [name, setName] = useState('');

  const isSaved = favorites.some(
    (f) => f.type === calculatorType && JSON.stringify(f.inputs) === JSON.stringify(inputs)
  );

  const handleSave = () => {
    if (!name.trim()) return;

    addFavorite({
      id: `fav-${Date.now()}`,
      name: name.trim(),
      type: calculatorType,
      inputs,
      createdAt: new Date(),
    });

    setShowNameInput(false);
    setName('');
  };

  if (showNameInput) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter a name..."
          className="text-sm flex-1"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') setShowNameInput(false);
          }}
        />
        <Button size="sm" onClick={handleSave} disabled={!name.trim()}>
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={() => setShowNameInput(false)}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowNameInput(true)}
      disabled={disabled || isSaved}
      className={cn(isSaved && 'text-yellow-600')}
    >
      <Star className={cn('w-4 h-4 mr-1', isSaved && 'fill-yellow-500')} />
      {isSaved ? 'Saved' : 'Save to Favorites'}
    </Button>
  );
}
