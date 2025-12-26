'use client';

import { useState } from 'react';
import { FolderKanban, Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { Modal } from './modal';
import { Button } from './button';
import { Input } from './input';
import { toast } from './toast';

interface MoveToProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId: string;
  proposalTitle: string;
}

export function MoveToProjectModal({ isOpen, onClose, proposalId, proposalTitle }: MoveToProjectModalProps) {
  const { projects, moveProposalToProject, addProject } = useAppStore();
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const handleMoveToProject = (projectId: string, projectName: string) => {
    moveProposalToProject(proposalId, projectId);
    toast.success(`Moved to "${projectName}"`);
    onClose();
  };

  const handleCreateAndMove = () => {
    if (!newProjectName.trim()) return;

    const newProject = addProject({
      name: newProjectName.trim(),
      proposals: [],
    });

    moveProposalToProject(proposalId, newProject.id);
    toast.success(`Created "${newProjectName}" and moved proposal`);
    setNewProjectName('');
    setShowNewProject(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Move to Project"
      size="sm"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Select a project folder for <span className="font-medium text-gray-900 dark:text-white">"{proposalTitle}"</span>
        </p>

        {/* Project List */}
        <div className="max-h-60 overflow-y-auto space-y-1">
          {projects.map((project) => {
            const isCurrentProject = project.proposals.includes(proposalId);
            return (
              <button
                key={project.id}
                onClick={() => !isCurrentProject && handleMoveToProject(project.id, project.name)}
                disabled={isCurrentProject}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                  isCurrentProject
                    ? 'bg-[#EDE9F9] dark:bg-[#231E51] text-[#5B50BD] dark:text-[#918AD3] cursor-default'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                )}
              >
                <FolderKanban className="h-5 w-5 flex-shrink-0" />
                <span className="flex-1 truncate font-medium">{project.name}</span>
                {isCurrentProject && <Check className="h-4 w-4 text-[#5B50BD] dark:text-[#918AD3]" />}
                <span className="text-xs text-gray-400">{project.proposals.length} proposals</span>
              </button>
            );
          })}

          {projects.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-400">
              No projects yet. Create one below.
            </p>
          )}
        </div>

        {/* Create New Project */}
        {showNewProject ? (
          <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <Input
              placeholder="New project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowNewProject(false);
                  setNewProjectName('');
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreateAndMove}
                disabled={!newProjectName.trim()}
              >
                Create & Move
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowNewProject(true)}
            className="flex w-full items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 px-3 py-2.5 text-gray-500 dark:text-gray-400 hover:border-[#5B50BD] hover:text-[#5B50BD] dark:hover:border-[#918AD3] dark:hover:text-[#918AD3] transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span className="font-medium">Create New Project</span>
          </button>
        )}
      </div>
    </Modal>
  );
}
