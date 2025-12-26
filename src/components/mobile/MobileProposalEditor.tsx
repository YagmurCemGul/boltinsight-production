'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Save,
  Send,
  Download,
  Trash2,
  Plus,
  X,
  Check,
  FileText,
  Target,
  Users,
  Globe,
  BarChart3,
  Clock,
  DollarSign,
  HelpCircle,
  Building2,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { Button, Input, Textarea, Select, Badge, Modal, toast } from '@/components/ui';
import type { Proposal, Market, Quota } from '@/types';

interface SectionConfig {
  id: string;
  title: string;
  icon: React.ElementType;
}

const SECTIONS: SectionConfig[] = [
  { id: 'basic', title: 'Basic Info', icon: FileText },
  { id: 'background', title: 'Background', icon: Building2 },
  { id: 'objectives', title: 'Objectives', icon: Target },
  { id: 'questions', title: 'Burning Questions', icon: HelpCircle },
  { id: 'audience', title: 'Target Audience', icon: Users },
  { id: 'markets', title: 'Markets & Quotas', icon: Globe },
  { id: 'methodology', title: 'Methodology', icon: BarChart3 },
  { id: 'timeline', title: 'Timeline & Budget', icon: Clock },
];

export function MobileProposalEditor() {
  const {
    currentProposal,
    currentUser,
    updateProposal,
    deleteProposal,
    submitForApproval,
    setCurrentProposal,
    setActiveSection,
  } = useAppStore();

  const [expandedSections, setExpandedSections] = useState<string[]>(['basic']);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!currentProposal) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <FileText className="h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Proposal Selected
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Create a new proposal or select one from the library
        </p>
        <Button onClick={() => setActiveSection('new-proposal')}>
          <Plus className="mr-2 h-4 w-4" />
          New Proposal
        </Button>
      </div>
    );
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      toast.success('Proposal saved');
      setIsSaving(false);
    }, 500);
  };

  const handleSubmit = () => {
    submitForApproval(currentProposal.id, currentUser);
    toast.success('Submitted for approval');
  };

  const handleDelete = () => {
    deleteProposal(currentProposal.id);
    setCurrentProposal(null);
    setActiveSection('library');
    setDeleteModalOpen(false);
    toast.success('Proposal deleted');
  };

  const updateContent = (field: string, value: any) => {
    updateProposal(currentProposal.id, {
      content: { ...currentProposal.content, [field]: value },
    });
  };

  const addArrayItem = (field: string, defaultValue: string = '') => {
    const current = currentProposal.content[field as keyof typeof currentProposal.content] as string[] || [];
    updateContent(field, [...current, defaultValue]);
  };

  const removeArrayItem = (field: string, index: number) => {
    const current = currentProposal.content[field as keyof typeof currentProposal.content] as string[] || [];
    updateContent(field, current.filter((_, i) => i !== index));
  };

  const updateArrayItem = (field: string, index: number, value: string) => {
    const current = currentProposal.content[field as keyof typeof currentProposal.content] as string[] || [];
    updateContent(field, current.map((item, i) => (i === index ? value : item)));
  };

  const statusColor: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    pending_approval: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    on_hold: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          {currentProposal.code && (
            <span className="text-sm font-medium text-blue-600">{currentProposal.code}</span>
          )}
          <Badge className={cn('text-xs', statusColor[currentProposal.status])}>
            {currentProposal.status.replace('_', ' ')}
          </Badge>
        </div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
          {currentProposal.content.title || 'Untitled Proposal'}
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isExpanded = expandedSections.includes(section.id);

          return (
            <div key={section.id} className="border-b border-gray-200 dark:border-gray-800">
              <button
                onClick={() => toggleSection(section.id)}
                className="flex w-full items-center justify-between px-4 py-4 bg-white dark:bg-gray-800"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">{section.title}</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
              </button>

              {isExpanded && (
                <div className="bg-white dark:bg-gray-800 px-4 pb-4">
                  {section.id === 'basic' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Title
                        </label>
                        <Input
                          value={currentProposal.content.title || ''}
                          onChange={(e) => updateContent('title', e.target.value)}
                          placeholder="Proposal title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Client
                        </label>
                        <Input
                          value={currentProposal.content.client || ''}
                          onChange={(e) => updateContent('client', e.target.value)}
                          placeholder="Client name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Contact
                        </label>
                        <Input
                          value={currentProposal.content.contact || ''}
                          onChange={(e) => updateContent('contact', e.target.value)}
                          placeholder="Client contact person"
                        />
                      </div>
                    </div>
                  )}

                  {section.id === 'background' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Project Background
                      </label>
                      <Textarea
                        value={currentProposal.content.background || ''}
                        onChange={(e) => updateContent('background', e.target.value)}
                        placeholder="Describe the context and background..."
                        rows={4}
                      />
                    </div>
                  )}

                  {section.id === 'objectives' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Business Objectives
                        </label>
                        <div className="space-y-2">
                          {(currentProposal.content.businessObjectives || []).map((obj, i) => (
                            <div key={i} className="flex gap-2">
                              <Input
                                value={obj}
                                onChange={(e) => updateArrayItem('businessObjectives', i, e.target.value)}
                                placeholder="Business objective"
                                className="flex-1"
                              />
                              <button
                                onClick={() => removeArrayItem('businessObjectives', i)}
                                className="p-2 text-red-500"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addArrayItem('businessObjectives')}
                            className="w-full"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Objective
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Research Objectives
                        </label>
                        <div className="space-y-2">
                          {(currentProposal.content.researchObjectives || []).map((obj, i) => (
                            <div key={i} className="flex gap-2">
                              <Input
                                value={obj}
                                onChange={(e) => updateArrayItem('researchObjectives', i, e.target.value)}
                                placeholder="Research objective"
                                className="flex-1"
                              />
                              <button
                                onClick={() => removeArrayItem('researchObjectives', i)}
                                className="p-2 text-red-500"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addArrayItem('researchObjectives')}
                            className="w-full"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Objective
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {section.id === 'questions' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Burning Questions
                      </label>
                      <div className="space-y-2">
                        {(currentProposal.content.burningQuestions || []).map((q, i) => (
                          <div key={i} className="flex gap-2">
                            <Textarea
                              value={q}
                              onChange={(e) => updateArrayItem('burningQuestions', i, e.target.value)}
                              placeholder="What do you want to learn?"
                              rows={2}
                              className="flex-1"
                            />
                            <button
                              onClick={() => removeArrayItem('burningQuestions', i)}
                              className="p-2 text-red-500"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addArrayItem('burningQuestions')}
                          className="w-full"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Question
                        </Button>
                      </div>
                    </div>
                  )}

                  {section.id === 'audience' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Target Definition
                        </label>
                        <Textarea
                          value={currentProposal.content.targetDefinition || ''}
                          onChange={(e) => updateContent('targetDefinition', e.target.value)}
                          placeholder="Describe your target audience..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Sample Size
                        </label>
                        <Input
                          type="number"
                          value={currentProposal.content.sampleSize || ''}
                          onChange={(e) => updateContent('sampleSize', parseInt(e.target.value) || 0)}
                          placeholder="Total sample size"
                        />
                      </div>
                    </div>
                  )}

                  {section.id === 'markets' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Markets
                        </label>
                        <div className="space-y-3">
                          {(currentProposal.content.markets || []).map((market, i) => (
                            <div key={i} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {market.country || 'New Market'}
                                </span>
                                <button
                                  onClick={() => {
                                    const markets = [...(currentProposal.content.markets || [])];
                                    markets.splice(i, 1);
                                    updateContent('markets', markets);
                                  }}
                                  className="p-1 text-red-500"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <Input
                                  value={market.country || ''}
                                  onChange={(e) => {
                                    const markets = [...(currentProposal.content.markets || [])];
                                    markets[i] = { ...markets[i], country: e.target.value };
                                    updateContent('markets', markets);
                                  }}
                                  placeholder="Country"
                                  className="text-sm"
                                />
                                <Input
                                  value={market.language || ''}
                                  onChange={(e) => {
                                    const markets = [...(currentProposal.content.markets || [])];
                                    markets[i] = { ...markets[i], language: e.target.value };
                                    updateContent('markets', markets);
                                  }}
                                  placeholder="Language"
                                  className="text-sm"
                                />
                              </div>
                              <div className="mt-2">
                                <Input
                                  type="number"
                                  value={market.sampleSize || ''}
                                  onChange={(e) => {
                                    const markets = [...(currentProposal.content.markets || [])];
                                    markets[i] = { ...markets[i], sampleSize: parseInt(e.target.value) || 0 };
                                    updateContent('markets', markets);
                                  }}
                                  placeholder="Sample Size"
                                  className="text-sm"
                                />
                              </div>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const markets = [...(currentProposal.content.markets || [])];
                              markets.push({ country: '', language: '', sampleSize: 0 });
                              updateContent('markets', markets);
                            }}
                            className="w-full"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Market
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Quotas
                        </label>
                        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3">
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Quota recommendations will be generated based on your target definition and markets.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {section.id === 'methodology' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Advanced Analysis
                        </label>
                        <div className="space-y-2">
                          {(currentProposal.content.advancedAnalysis || []).map((a, i) => (
                            <div key={i} className="flex gap-2">
                              <Input
                                value={a}
                                onChange={(e) => updateArrayItem('advancedAnalysis', i, e.target.value)}
                                placeholder="e.g., MaxDiff, Conjoint"
                                className="flex-1"
                              />
                              <button
                                onClick={() => removeArrayItem('advancedAnalysis', i)}
                                className="p-2 text-red-500"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addArrayItem('advancedAnalysis')}
                            className="w-full"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Analysis
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {section.id === 'timeline' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Start Date
                          </label>
                          <Input
                            type="date"
                            value={currentProposal.content.timeline?.startDate || ''}
                            onChange={(e) =>
                              updateContent('timeline', {
                                ...currentProposal.content.timeline,
                                startDate: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            End Date
                          </label>
                          <Input
                            type="date"
                            value={currentProposal.content.timeline?.endDate || ''}
                            onChange={(e) =>
                              updateContent('timeline', {
                                ...currentProposal.content.timeline,
                                endDate: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex gap-3 z-40 mt-auto">
        <Button
          variant="outline"
          onClick={() => setDeleteModalOpen(true)}
          className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={handleSave} disabled={isSaving} className="flex-1">
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
        {currentProposal.status === 'draft' && (
          <Button onClick={handleSubmit} className="flex-1">
            <Send className="mr-2 h-4 w-4" />
            Submit
          </Button>
        )}
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Proposal"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Are you sure you want to delete this proposal? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-700">
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
