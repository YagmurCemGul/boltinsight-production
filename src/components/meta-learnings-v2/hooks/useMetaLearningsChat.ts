'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import {
  generateMockResponse,
  getWelcomeMessage,
  generateProactiveAlerts,
  extractContextFromQuery,
} from '../mock-data';
import type {
  MetaLearningMessage,
  MessageAttachment,
  FilterChip,
  ProactiveAlert,
  ConversationContext,
  UseMetaLearningsChatReturn,
} from '../types';
import type { NotificationType } from '@/types';

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 11);

// Initial conversation context
const initialContext: ConversationContext = {
  mentionedClients: [],
  mentionedProposals: [],
};

// Map alert type to notification type
const alertTypeToNotificationType: Record<string, NotificationType> = {
  warning: 'meta_warning',
  opportunity: 'meta_opportunity',
  insight: 'meta_insight',
  reminder: 'meta_reminder',
};

export function useMetaLearningsChat(): UseMetaLearningsChatReturn {
  const { proposals, addNotification, notifications } = useAppStore();
  const [messages, setMessages] = useState<MetaLearningMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [alerts, setAlerts] = useState<ProactiveAlert[]>([]);
  const [conversationContext, setConversationContext] = useState<ConversationContext>(initialContext);
  const addedAlertIds = useRef<Set<string>>(new Set());

  // Initialize welcome message on client side only to avoid hydration mismatch
  useEffect(() => {
    if (!isInitialized) {
      setMessages([getWelcomeMessage()]);
      setIsInitialized(true);
    }
  }, [isInitialized]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterChip[]>([]);

  // Calculate analytics from proposals
  const analytics = useMemo(() => {
    const filteredProposals = proposals.filter(p => {
      if (p.status === 'deleted') return false;

      // Apply filters
      for (const filter of activeFilters) {
        if (filter.type === 'customer' && p.content.client !== filter.value) return false;
        if (filter.type === 'status' && p.status !== filter.value) return false;
        if (filter.type === 'author' && p.author.id !== filter.value) return false;
      }
      return true;
    });

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
  }, [proposals, activeFilters]);

  // Generate proactive alerts when analytics change and add to notifications
  useEffect(() => {
    if (analytics.total > 0) {
      const newAlerts = generateProactiveAlerts(analytics);
      setAlerts(newAlerts);

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

  // Send a message
  const sendMessage = useCallback((content: string, attachments?: MessageAttachment[]) => {
    if ((!content.trim() && (!attachments || attachments.length === 0)) || isStreaming) return;

    // Update conversation context with new query
    const updatedContext = extractContextFromQuery(content, conversationContext);
    setConversationContext(updatedContext);

    // Add user message with attachments
    const userMessage: MetaLearningMessage = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
      attachments: attachments,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);

    // Simulate AI processing
    setTimeout(() => {
      const mockResponse = generateMockResponse(content, analytics, updatedContext);

      // Add AI message with streaming flag
      const aiMessage: MetaLearningMessage = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        isStreaming: true,
        ...mockResponse,
      };

      setMessages(prev => [...prev, aiMessage]);

      // Simulate streaming completion
      setTimeout(() => {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessage.id ? { ...msg, isStreaming: false } : msg
          )
        );
        setIsStreaming(false);
      }, 1500 + Math.random() * 1000);
    }, 500 + Math.random() * 500);
  }, [isStreaming, analytics, conversationContext]);

  // Add a filter
  const addFilter = useCallback((filter: Omit<FilterChip, 'id'>) => {
    const newFilter: FilterChip = {
      id: generateId(),
      ...filter,
    };
    setActiveFilters(prev => [...prev.filter(f => f.type !== filter.type), newFilter]);
  }, []);

  // Remove a filter
  const removeFilter = useCallback((filterId: string) => {
    setActiveFilters(prev => prev.filter(f => f.id !== filterId));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setActiveFilters([]);
  }, []);

  // Clear chat
  const clearChat = useCallback(() => {
    setMessages([getWelcomeMessage()]);
    setIsStreaming(false);
    setConversationContext(initialContext);
  }, []);

  // Dismiss a single alert
  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  // Dismiss all alerts
  const dismissAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  return {
    messages,
    isStreaming,
    activeFilters,
    alerts,
    conversationContext,
    sendMessage,
    addFilter,
    removeFilter,
    clearFilters,
    clearChat,
    dismissAlert,
    dismissAllAlerts,
  };
}
