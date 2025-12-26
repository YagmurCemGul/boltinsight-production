import type { AIFieldContext, AISearchResponse, Proposal } from '@/types';
import { getMockAIResponse } from './ai-mock';

// Re-export utilities from ai-utils to maintain backwards compatibility
export { parseAutoFillValues, hasAutoFillValues } from './ai-utils';

const USE_MOCK_AI = process.env.NEXT_PUBLIC_USE_MOCK_AI !== 'false';

export async function searchAI(
  query: string,
  fieldContext: AIFieldContext,
  proposals: Proposal[],
  limit: number = 5
): Promise<AISearchResponse> {
  // Remove @ prefix if present
  const cleanQuery = query.startsWith('@') ? query.slice(1).trim() : query.trim();

  if (!cleanQuery) {
    return { suggestions: [], source: 'mock' };
  }

  if (USE_MOCK_AI) {
    return getMockAIResponse(cleanQuery, fieldContext, proposals, limit);
  }

  try {
    const response = await fetch('/api/ai-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: cleanQuery,
        fieldContext,
        proposalContext: extractProposalContext(proposals),
        limit,
      }),
    });

    if (!response.ok) {
      console.error('AI API error, falling back to mock');
      return getMockAIResponse(cleanQuery, fieldContext, proposals, limit);
    }

    const data = await response.json();
    return {
      suggestions: data.suggestions || [],
      source: 'openai',
    };
  } catch (error) {
    console.error('AI search error:', error);
    return getMockAIResponse(cleanQuery, fieldContext, proposals, limit);
  }
}

function extractProposalContext(proposals: Proposal[]) {
  const approvedProposals = proposals.filter(p => p.status === 'client_approved' || p.status === 'manager_approved');

  return {
    titles: approvedProposals.map(p => p.content.title).filter(Boolean),
    clients: [...new Set(approvedProposals.map(p => p.content.client).filter(Boolean))],
    markets: [...new Set(approvedProposals.flatMap(p => p.content.markets?.map(m => m.country) || []).filter(Boolean))],
    sampleSizes: approvedProposals.map(p => p.content.sampleSize).filter(Boolean),
    targetDefinitions: approvedProposals.map(p => p.content.targetDefinition).filter(Boolean),
  };
}

