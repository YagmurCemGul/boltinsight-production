'use client';

import { useState } from 'react';
import { X, Smile, BarChart3, Users, Lightbulb, FileText, Target, Sparkles } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { ChatProject } from '@/types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated?: (project: ChatProject) => void;
}

// Quick category presets for BoltInsight
const CATEGORY_PRESETS = [
  { id: 'brand', label: 'Brand Research', icon: BarChart3, color: '#5B50BD', instructions: 'Focus on brand health metrics, awareness, perception, and NPS tracking.' },
  { id: 'consumer', label: 'Consumer Insights', icon: Users, color: '#1ED6BB', instructions: 'Specialize in consumer segmentation, behavioral analysis, and targeting strategies.' },
  { id: 'concept', label: 'Concept Testing', icon: Lightbulb, color: '#F59E0B', instructions: 'Help design and analyze concept tests, packaging tests, and product evaluations.' },
  { id: 'proposal', label: 'Proposal Writing', icon: FileText, color: '#3B82F6', instructions: 'Assist with research proposal writing, methodology design, and client presentations.' },
  { id: 'tracker', label: 'Tracker Program', icon: Target, color: '#10B981', instructions: 'Support ongoing tracking studies with wave-over-wave analysis and trend monitoring.' },
];

// Color options for manual selection
const PROJECT_COLORS = [
  '#5B50BD', '#1ED6BB', '#EB3F5F', '#F59E0B', '#3B82F6',
  '#10B981', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
];

export function CreateProjectModal({ isOpen, onClose, onProjectCreated }: CreateProjectModalProps) {
  const { addChatProject } = useAppStore();

  const [name, setName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customColor, setCustomColor] = useState(PROJECT_COLORS[0]);
  const [customInstructions, setCustomInstructions] = useState('');

  const handleSelectPreset = (presetId: string) => {
    if (selectedPreset === presetId) {
      setSelectedPreset(null);
      setCustomColor(PROJECT_COLORS[0]);
      setCustomInstructions('');
    } else {
      setSelectedPreset(presetId);
      const preset = CATEGORY_PRESETS.find(p => p.id === presetId);
      if (preset) {
        setCustomColor(preset.color);
        setCustomInstructions(preset.instructions);
      }
    }
  };

  const handleCreate = () => {
    if (!name.trim()) return;

    const preset = selectedPreset ? CATEGORY_PRESETS.find(p => p.id === selectedPreset) : null;

    const newProject = addChatProject({
      name: name.trim(),
      description: undefined,
      color: preset?.color || customColor,
      icon: undefined,
      instructions: customInstructions || preset?.instructions || '',
      isPinned: false,
      isArchived: false,
      owner: { id: '', name: '', email: '', role: 'researcher' },
    });

    onProjectCreated?.(newProject);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setSelectedPreset(null);
    setCustomColor(PROJECT_COLORS[0]);
    setCustomInstructions('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      handleCreate();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between p-2.5 ps-4 select-none min-h-[56px]">
          <h2 className="text-lg font-normal text-gray-900 dark:text-white">
            Create project
          </h2>
          <button
            onClick={handleClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </header>

        {/* Content */}
        <div className="grow overflow-y-auto">
          <form
            id="project-modal-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleCreate();
            }}
          >
            <div className="flex-1 px-4 pt-1">
              {/* Project Name Input with emoji picker */}
              <div className="mb-2 grid grid-cols-[auto_minmax(0,1fr)]">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Q1 Brand Tracker Study"
                  className="col-span-full row-[1] w-full resize-none overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-600 px-2 py-2 ps-9 pe-9 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 focus:ring-0"
                  autoFocus
                  autoComplete="off"
                />
                {/* Emoji picker button */}
                <button
                  type="button"
                  className="col-[1] row-[1] relative group p-2"
                >
                  <Smile className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                </button>
              </div>

              {/* Category Presets - Horizontal scrollable */}
              <ul className="-ms-4 flex w-[calc(100%+32px)] gap-2 overflow-x-auto ps-4 pe-4 [scrollbar-width:none]">
                {CATEGORY_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  const isSelected = selectedPreset === preset.id;
                  return (
                    <li key={preset.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectPreset(preset.id)}
                        className={cn(
                          'btn relative flex items-center justify-center py-2 ps-2.5 pe-3 font-normal select-none border rounded-lg transition-colors',
                          isSelected
                            ? 'border-gray-400 dark:border-gray-500 bg-gray-100 dark:bg-gray-700'
                            : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        )}
                      >
                        <div className="flex items-center justify-center">
                          <div className="flex gap-1.5">
                            <div style={{ color: preset.color }}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                              {preset.label}
                            </span>
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* Info Box */}
              <aside className="bg-gray-100 dark:bg-gray-700/50 mt-4 flex items-center rounded-xl p-3">
                <div className="me-2 h-6 w-6">
                  <div className="text-gray-500 dark:text-gray-400 relative flex h-full items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-xs text-pretty">
                  Projects organize your research conversations, files, and AI instructions in one place. Perfect for managing ongoing studies and proposals.
                </p>
              </aside>
            </div>

            {/* Footer with Create Button */}
            <div className="flex items-center justify-end px-3 pb-3">
              <div className="flex flex-col gap-3 sm:flex-row-reverse mt-5 sm:mt-4">
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className={cn(
                    'btn relative px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    name.trim()
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  )}
                >
                  Create project
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
