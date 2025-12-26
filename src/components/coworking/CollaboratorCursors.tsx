'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { SessionCollaborator } from '@/types';

interface CursorPosition {
  x: number;
  y: number;
  collaboratorId: string;
  timestamp: number;
}

interface CollaboratorCursorsProps {
  collaborators: SessionCollaborator[];
  currentUserId: string;
  containerRef?: React.RefObject<HTMLElement | null>;
  className?: string;
}

// Color palette for different collaborators
const CURSOR_COLORS = [
  { bg: '#5B50BD', text: 'white' },    // Purple
  { bg: '#10B981', text: 'white' },    // Green
  { bg: '#F59E0B', text: 'white' },    // Amber
  { bg: '#EF4444', text: 'white' },    // Red
  { bg: '#3B82F6', text: 'white' },    // Blue
  { bg: '#EC4899', text: 'white' },    // Pink
  { bg: '#8B5CF6', text: 'white' },    // Violet
  { bg: '#06B6D4', text: 'white' },    // Cyan
];

function getCollaboratorColor(index: number) {
  return CURSOR_COLORS[index % CURSOR_COLORS.length];
}

function CollaboratorCursor({
  collaborator,
  position,
  colorIndex,
}: {
  collaborator: SessionCollaborator;
  position: { x: number; y: number };
  colorIndex: number;
}) {
  const color = getCollaboratorColor(colorIndex);
  const firstName = collaborator.user.name.split(' ')[0];

  return (
    <div
      className="fixed pointer-events-none z-[9999] transition-all duration-75 ease-out"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-2px, -2px)',
      }}
    >
      {/* Modern Figma-style cursor */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <path
          d="M4 1L4 15L7.5 11.5L10.5 18L13 17L10 10L15 10L4 1Z"
          fill={color.bg}
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>

      {/* Name label */}
      <div
        className={cn(
          'absolute left-4 top-4',
          'px-2 py-0.5 rounded-md text-xs font-medium',
          'whitespace-nowrap shadow-md',
          'animate-in fade-in-0 zoom-in-95 duration-150'
        )}
        style={{
          backgroundColor: color.bg,
          color: color.text,
        }}
      >
        {firstName}
      </div>
    </div>
  );
}

export function CollaboratorCursors({
  collaborators,
  currentUserId,
  containerRef,
  className,
}: CollaboratorCursorsProps) {
  const [cursorPositions, setCursorPositions] = useState<Record<string, CursorPosition>>({});
  const [myPosition, setMyPosition] = useState<{ x: number; y: number } | null>(null);

  // Track own mouse position
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const container = containerRef?.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      // Calculate position relative to container
      setMyPosition({
        x: e.clientX,
        y: e.clientY,
      });
    } else {
      setMyPosition({
        x: e.clientX,
        y: e.clientY,
      });
    }
  }, [containerRef]);

  // Simulate receiving cursor updates from other collaborators
  // In a real implementation, this would come from WebSocket/real-time sync
  useEffect(() => {
    const simulateOtherCursors = () => {
      const otherCollaborators = collaborators.filter(
        c => c.user.id !== currentUserId && c.status === 'online'
      );

      const newPositions: Record<string, CursorPosition> = {};

      otherCollaborators.forEach((collaborator, index) => {
        // Simulate random but smooth cursor movements
        const existingPos = cursorPositions[collaborator.id];
        const baseX = existingPos?.x || 200 + index * 150;
        const baseY = existingPos?.y || 200 + index * 100;

        // Add slight random movement to simulate real cursor activity
        const newX = baseX + (Math.random() - 0.5) * 20;
        const newY = baseY + (Math.random() - 0.5) * 20;

        // Keep within reasonable bounds
        newPositions[collaborator.id] = {
          x: Math.max(50, Math.min(window.innerWidth - 100, newX)),
          y: Math.max(50, Math.min(window.innerHeight - 100, newY)),
          collaboratorId: collaborator.id,
          timestamp: Date.now(),
        };
      });

      setCursorPositions(prev => ({ ...prev, ...newPositions }));
    };

    // Initial positions
    simulateOtherCursors();

    // Update positions periodically to simulate activity
    const interval = setInterval(simulateOtherCursors, 2000);

    return () => clearInterval(interval);
  }, [collaborators, currentUserId]);

  // Set up mouse tracking
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // Get other online collaborators (not current user)
  const otherOnlineCollaborators = collaborators.filter(
    c => c.user.id !== currentUserId && c.status === 'online'
  );

  // No online collaborators, don't render cursors
  if (otherOnlineCollaborators.length === 0) {
    return null;
  }

  return (
    <div className={cn('fixed inset-0 pointer-events-none z-[9999]', className)}>
      {otherOnlineCollaborators.map((collaborator, index) => {
        const position = cursorPositions[collaborator.id];
        if (!position) return null;

        return (
          <CollaboratorCursor
            key={collaborator.id}
            collaborator={collaborator}
            position={{ x: position.x, y: position.y }}
            colorIndex={index}
          />
        );
      })}
    </div>
  );
}

// Hook for tracking and broadcasting cursor position
export function useCollaboratorCursor(
  sessionId: string | null,
  userId: string
) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      // In a real implementation, broadcast this position to other collaborators
      // via WebSocket or real-time database
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [sessionId, userId]);

  return position;
}

// Compact version for displaying in a list/indicator
export function CursorIndicator({
  collaborator,
  colorIndex,
}: {
  collaborator: SessionCollaborator;
  colorIndex: number;
}) {
  const color = getCollaboratorColor(colorIndex);

  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-3 h-3 rounded-full flex items-center justify-center"
        style={{ backgroundColor: color.bg }}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z"
            fill={color.text}
          />
        </svg>
      </div>
      <span className="text-xs text-gray-600 dark:text-gray-400">
        {collaborator.user.name.split(' ')[0]}
      </span>
    </div>
  );
}
