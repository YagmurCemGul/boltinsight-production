'use client';

import { useEffect, useRef, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { generateProactiveAlerts } from './mock-data';
import type { NotificationType } from '@/types';

// Map alert type to notification type
const alertTypeToNotificationType: Record<string, NotificationType> = {
  warning: 'meta_warning',
  opportunity: 'meta_opportunity',
  insight: 'meta_insight',
  reminder: 'meta_reminder',
};

/**
 * This component runs at the app level to generate Meta Learnings alerts
 * and add them to the global notification system
 */
export function MetaLearningsAlertProvider() {
  const { proposals, addNotification, notifications } = useAppStore();
  const addedAlertIds = useRef<Set<string>>(new Set());
  const hasInitialized = useRef(false);

  // Calculate analytics from proposals
  const analytics = useMemo(() => {
    const filteredProposals = proposals.filter(p => p.status !== 'deleted');

    const total = filteredProposals.length;
    const approved = filteredProposals.filter(p => p.status === 'client_approved' || p.status === 'manager_approved').length;
    const rejected = filteredProposals.filter(p => p.status === 'manager_rejected' || p.status === 'client_rejected').length;
    const pending = filteredProposals.filter(p => p.status === 'pending_manager' || p.status === 'pending_client').length;

    // Group by client
    const clientMap = new Map<string, { count: number; approved: number }>();
    filteredProposals.forEach(p => {
      const client = p.content.client || 'Unknown';
      const existing = clientMap.get(client) || { count: 0, approved: 0 };
      existing.count++;
      if (p.status === 'client_approved' || p.status === 'manager_approved') existing.approved++;
      clientMap.set(client, existing);
    });

    const topClients = Array.from(clientMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Group by author
    const authorMap = new Map<string, { count: number; approved: number }>();
    filteredProposals.forEach(p => {
      const name = p.author.name;
      const existing = authorMap.get(name) || { count: 0, approved: 0 };
      existing.count++;
      if (p.status === 'client_approved' || p.status === 'manager_approved') existing.approved++;
      authorMap.set(name, existing);
    });

    const topAuthors = Array.from(authorMap.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        rate: data.count > 0 ? Math.round((data.approved / data.count) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return { total, approved, rejected, pending, topClients, topAuthors };
  }, [proposals]);

  // Generate proactive alerts when analytics change and add to notifications
  useEffect(() => {
    // Only run once on initial mount with data
    if (analytics.total > 0 && !hasInitialized.current) {
      hasInitialized.current = true;

      const newAlerts = generateProactiveAlerts(analytics);

      // Add alerts as notifications (only new ones)
      newAlerts.forEach(alert => {
        // Create a stable key based on alert content to prevent duplicates
        const alertKey = `${alert.type}-${alert.title}`;

        // Check if this alert type already exists in notifications
        const existingNotification = notifications.find(
          n => n.title === alert.title &&
               (n.type === 'meta_warning' || n.type === 'meta_opportunity' ||
                n.type === 'meta_insight' || n.type === 'meta_reminder')
        );

        if (!existingNotification && !addedAlertIds.current.has(alertKey)) {
          addedAlertIds.current.add(alertKey);
          addNotification({
            type: alertTypeToNotificationType[alert.type] || 'meta_insight',
            title: alert.title,
            message: alert.description,
            read: false,
            priority: alert.priority,
            actionId: alert.actions[0]?.id,
          });
        }
      });
    }
  }, [analytics, addNotification, notifications]);

  // This component doesn't render anything
  return null;
}
