'use client';

import { useState, useCallback } from 'react';
import { Plus, FolderKanban, MoreVertical, Edit2, Trash2, ChevronRight, ChevronDown, GripVertical, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { Input, Modal, Button, Dropdown, DropdownItem, DropdownSeparator, AIEnabledInput, AIHelpGuide, toast } from '@/components/ui';
import type { NestedProject, Project } from '@/types';

interface ProjectItemProps {
  project: NestedProject;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onSelect: (projectId: string) => void;
  onDragStart: (e: React.DragEvent, projectId: string) => void;
  onDragOver: (e: React.DragEvent, projectId: string, position: 'before' | 'after' | 'inside') => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, projectId: string) => void;
  dragOverId: string | null;
  dragOverPosition: 'before' | 'after' | 'inside' | null;
  draggedId: string | null;
  expandedIds: Set<string>;
  toggleExpand: (projectId: string) => void;
}

function ProjectItem({
  project,
  onEdit,
  onDelete,
  onSelect,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  dragOverId,
  dragOverPosition,
  draggedId,
  expandedIds,
  toggleExpand,
}: ProjectItemProps) {
  const hasChildren = project.children.length > 0;
  const isExpanded = expandedIds.has(project.id);
  const isDragging = draggedId === project.id;
  const isDragOver = dragOverId === project.id;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    let position: 'before' | 'after' | 'inside';
    if (y < height * 0.25) {
      position = 'before';
    } else if (y > height * 0.75) {
      position = 'after';
    } else {
      position = 'inside';
    }

    onDragOver(e, project.id, position);
  };

  return (
    <div className="select-none relative">
      {/* Drop indicator - before */}
      {isDragOver && dragOverPosition === 'before' && (
        <div
          className="absolute left-0 right-0 top-0 h-0.5 bg-[#5B50BD] rounded-full z-20"
          style={{ marginLeft: `${project.depth * 16}px` }}
        />
      )}

      <div
        draggable={!project.isDefault}
        onDragStart={(e) => onDragStart(e, project.id)}
        onDragOver={handleDragOver}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, project.id)}
        className={cn(
          'group flex items-center justify-between rounded-lg px-2 py-1.5 transition-all cursor-pointer relative',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          isDragging && 'opacity-50 border-2 border-dashed border-[#5B50BD] bg-[#EDE9F9]/50 dark:bg-[#231E51]/50',
          isDragOver && dragOverPosition === 'inside' && 'bg-[#EDE9F9] dark:bg-[#231E51] ring-2 ring-[#5B50BD] scale-[1.02]'
        )}
        style={{ paddingLeft: `${project.depth * 16 + 8}px` }}
      >
        {/* Drag Handle - always visible for non-default projects */}
        {!project.isDefault ? (
          <div className="flex-shrink-0 cursor-grab active:cursor-grabbing mr-1 text-gray-400 hover:text-[#5B50BD] transition-colors">
            <GripVertical className="h-4 w-4" />
          </div>
        ) : (
          <div className="w-5 mr-1" />
        )}

        {/* Drop Zone Indicator - inside */}
        {isDragOver && dragOverPosition === 'inside' && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#5B50BD] text-white text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap z-10">
            Move inside
          </div>
        )}

        {/* Expand/Collapse */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(project.id);
            }}
            className="flex-shrink-0 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 mr-1"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3 text-gray-500" />
            ) : (
              <ChevronRight className="h-3 w-3 text-gray-500" />
            )}
          </button>
        ) : (
          <div className="w-4 mr-1" />
        )}

        {/* Project Button */}
        <button
          onClick={() => onSelect(project.id)}
          className="flex flex-1 items-center gap-2 text-left min-w-0"
        >
          {hasChildren && isExpanded ? (
            <FolderOpen className={cn(
              'h-4 w-4 flex-shrink-0',
              project.isDefault ? 'text-amber-500' : 'text-[#5B50BD] dark:text-[#918AD3]'
            )} />
          ) : (
            <FolderKanban className={cn(
              'h-4 w-4 flex-shrink-0',
              project.isDefault ? 'text-amber-500' : 'text-gray-400'
            )} />
          )}
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm text-gray-700 dark:text-gray-300">{project.name}</p>
            <p className="text-[10px] text-gray-400">
              {project.proposals.length} {project.proposals.length === 1 ? 'proposal' : 'proposals'}
              {hasChildren && ` · ${project.children.length} subfolder${project.children.length > 1 ? 's' : ''}`}
            </p>
          </div>
        </button>

        {/* Actions Menu */}
        {!project.isDefault && (
          <Dropdown
            trigger={
              <button className="rounded p-1 text-gray-400 opacity-0 transition-opacity hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-600 group-hover:opacity-100">
                <MoreVertical className="h-4 w-4" />
              </button>
            }
            align="right"
          >
            <DropdownItem onClick={() => onEdit(project)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem
              variant="destructive"
              onClick={() => onDelete(project.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownItem>
          </Dropdown>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-0.5">
          {project.children.map((child) => (
            <ProjectItem
              key={child.id}
              project={child}
              onEdit={onEdit}
              onDelete={onDelete}
              onSelect={onSelect}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              dragOverId={dragOverId}
              dragOverPosition={dragOverPosition}
              draggedId={draggedId}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}

      {/* Drop indicator - after */}
      {isDragOver && dragOverPosition === 'after' && (
        <div
          className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#5B50BD] rounded-full z-20"
          style={{ marginLeft: `${project.depth * 16}px` }}
        />
      )}
    </div>
  );
}

export function ProjectsList() {
  const { projects, addProject, updateProject, deleteProject, setActiveSection, reorderProjects, getNestedProjects } = useAppStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectPath, setNewProjectPath] = useState('');

  // Drag state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<'before' | 'after' | 'inside' | null>(null);

  // Expanded state
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const nestedProjects = getNestedProjects();

  const toggleExpand = useCallback((projectId: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, projectId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', projectId);
    setDraggedId(projectId);
    // Add a slight delay to show the drag ghost
    setTimeout(() => {
      const target = e.target as HTMLElement;
      target.style.opacity = '0.5';
    }, 0);
  }, []);

  // Helper to check if targetId is a descendant of parentId
  const isDescendant = useCallback((parentId: string, targetId: string): boolean => {
    const findInChildren = (project: NestedProject): boolean => {
      if (project.id === targetId) return true;
      return project.children.some(findInChildren);
    };
    const parent = nestedProjects.find(p => p.id === parentId) ||
      nestedProjects.flatMap(function flatten(p: NestedProject): NestedProject[] {
        return [p, ...p.children.flatMap(flatten)];
      }).find(p => p.id === parentId);
    return parent ? findInChildren(parent) : false;
  }, [nestedProjects]);

  const handleDragOver = useCallback((e: React.DragEvent, projectId: string, position: 'before' | 'after' | 'inside') => {
    e.preventDefault();
    if (draggedId === projectId) return;
    // Prevent dropping parent into its own child
    if (draggedId && position === 'inside' && isDescendant(draggedId, projectId)) return;
    setDragOverId(projectId);
    setDragOverPosition(position);
  }, [draggedId, isDescendant]);

  const handleDragLeave = useCallback(() => {
    setDragOverId(null);
    setDragOverPosition(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedId && draggedId !== dropId && dragOverPosition) {
      // Prevent dropping parent into its own child
      if (dragOverPosition === 'inside' && isDescendant(draggedId, dropId)) {
        toast.error('Cannot move folder', 'Cannot move a folder inside its own subfolder');
        setDraggedId(null);
        setDragOverId(null);
        setDragOverPosition(null);
        return;
      }

      // Find project names for the toast
      const draggedProject = projects.find(p => p.id === draggedId);
      const dropProject = projects.find(p => p.id === dropId);

      reorderProjects(draggedId, dropId, dragOverPosition);

      // Show success toast
      if (draggedProject && dropProject) {
        if (dragOverPosition === 'inside') {
          toast.success('Project moved', `"${draggedProject.name}" moved inside "${dropProject.name}"`);
        } else {
          toast.success('Project reordered', `"${draggedProject.name}" moved ${dragOverPosition} "${dropProject.name}"`);
        }
      }

      // Auto-expand parent if dropped inside
      if (dragOverPosition === 'inside') {
        setExpandedIds(prev => new Set([...prev, dropId]));
      }
    }
    setDraggedId(null);
    setDragOverId(null);
    setDragOverPosition(null);
  }, [draggedId, dragOverPosition, reorderProjects, isDescendant, projects]);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    target.style.opacity = '1';
    setDraggedId(null);
    setDragOverId(null);
    setDragOverPosition(null);
  }, []);

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;

    addProject({
      name: newProjectName.trim(),
      description: newProjectDescription.trim() || undefined,
      path: newProjectPath.trim() || undefined,
      proposals: [],
      order: 0,
    });

    setNewProjectName('');
    setNewProjectDescription('');
    setNewProjectPath('');
    setIsCreateModalOpen(false);
  };

  const handleEditProject = () => {
    if (!editingProject || !newProjectName.trim()) return;

    updateProject(editingProject.id, {
      name: newProjectName.trim(),
      description: newProjectDescription.trim() || undefined,
      path: newProjectPath.trim() || undefined,
    });

    setEditingProject(null);
    setNewProjectName('');
    setNewProjectDescription('');
    setNewProjectPath('');
    setIsEditModalOpen(false);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setNewProjectName(project.name);
    setNewProjectDescription(project.description || '');
    setNewProjectPath(project.path || '');
    setIsEditModalOpen(true);
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm('Are you sure you want to delete this project? Subfolders will also be deleted.')) {
      deleteProject(projectId);
    }
  };

  const handleSelectProject = (projectId: string) => {
    setActiveSection(`project-${projectId}`);
  };

  return (
    <div className="space-y-2 px-2" onDragEnd={(e) => handleDragEnd(e)}>
      {/* Project Tree */}
      <div className="space-y-0.5">
        {nestedProjects.map((project) => (
          <ProjectItem
            key={project.id}
            project={project}
            onEdit={openEditModal}
            onDelete={handleDeleteProject}
            onSelect={handleSelectProject}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            dragOverId={dragOverId}
            dragOverPosition={dragOverPosition}
            draggedId={draggedId}
            expandedIds={expandedIds}
            toggleExpand={toggleExpand}
          />
        ))}
      </div>

      {/* Create Project Button */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="flex w-full items-center gap-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 transition-colors hover:border-[#5B50BD] hover:bg-[#EDE9F9] hover:text-[#5B50BD] dark:hover:border-[#918AD3] dark:hover:bg-[#231E51] dark:hover:text-[#918AD3]"
      >
        <Plus className="h-4 w-4" />
        <span>Create Project</span>
      </button>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Project"
        size="sm"
      >
        <div className="space-y-4">
          <div className="relative">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Project Name <span className="text-red-500">*</span>
            </label>
            <AIEnabledInput
              placeholder="e.g., Coca-Cola 2025 or type @..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onValueChange={(value) => setNewProjectName(value)}
              fieldContext={{
                fieldName: 'projectName',
                fieldType: 'text',
                component: 'create_project',
              }}
              showHelpGuide={true}
              helpGuideKey="create-project-name"
              autoFocus
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Type @ to get AI suggestions based on client names and past projects
            </p>
          </div>
          <div className="relative">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <AIEnabledInput
              placeholder="Optional description or type @..."
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
              onValueChange={(value) => setNewProjectDescription(value)}
              fieldContext={{
                fieldName: 'projectDescription',
                fieldType: 'text',
                component: 'create_project',
              }}
              showHelpGuide={false}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Project Path
            </label>
            <Input
              placeholder="/Users/Documents/Projects/..."
              value={newProjectPath}
              onChange={(e) => setNewProjectPath(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              File system path where project files will be stored
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject} disabled={!newProjectName.trim()}>
              Create Project
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Project"
        size="sm"
      >
        <div className="space-y-4">
          <div className="relative">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Project Name <span className="text-red-500">*</span>
            </label>
            <AIEnabledInput
              placeholder="e.g., Coca-Cola 2025 or type @..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onValueChange={(value) => setNewProjectName(value)}
              fieldContext={{
                fieldName: 'projectName',
                fieldType: 'text',
                component: 'edit_project',
              }}
              showHelpGuide={false}
              autoFocus
            />
          </div>
          <div className="relative">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <AIEnabledInput
              placeholder="Optional description or type @..."
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
              onValueChange={(value) => setNewProjectDescription(value)}
              fieldContext={{
                fieldName: 'projectDescription',
                fieldType: 'text',
                component: 'edit_project',
              }}
              showHelpGuide={false}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Project Path
            </label>
            <Input
              placeholder="/Users/Documents/Projects/..."
              value={newProjectPath}
              onChange={(e) => setNewProjectPath(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              File system path where project files will be stored
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditProject} disabled={!newProjectName.trim()}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
