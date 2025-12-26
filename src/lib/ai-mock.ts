import type { AIFieldContext, AISuggestion, AISearchResponse, Proposal } from '@/types';
import { v4 as uuid } from 'uuid';
import { parseAutoFillValues, hasAutoFillValues } from './ai-utils';

export function getMockAIResponse(
  query: string,
  fieldContext: AIFieldContext,
  proposals: Proposal[],
  limit: number = 5
): AISearchResponse {
  const suggestions = generateMockSuggestions(query, fieldContext, proposals, limit);

  return {
    suggestions,
    source: 'mock',
  };
}

function generateMockSuggestions(
  query: string,
  fieldContext: AIFieldContext,
  proposals: Proposal[],
  limit: number
): AISuggestion[] {
  const lowerQuery = query.toLowerCase();
  const suggestions: AISuggestion[] = [];

  switch (fieldContext.fieldType) {
    case 'country':
    case 'market':
      suggestions.push(...generateCountrySuggestions(lowerQuery, proposals, limit));
      break;

    case 'sample_size':
    case 'number':
      suggestions.push(...generateSampleSizeSuggestions(lowerQuery, proposals, limit));
      break;

    case 'methodology':
      suggestions.push(...generateMethodologySuggestions(lowerQuery, limit));
      break;

    case 'audience':
      suggestions.push(...generateAudienceSuggestions(lowerQuery, limit));
      break;

    case 'criteria':
      suggestions.push(...generateCriteriaSuggestions(lowerQuery, limit));
      break;

    case 'notes':
      // For notes field, try to parse auto-fill values
      const autoFillValues = parseAutoFillValues(query);
      if (hasAutoFillValues(autoFillValues)) {
        suggestions.push({
          id: uuid(),
          text: 'Auto-fill detected fields',
          type: 'autofill',
          confidence: 0.85,
          metadata: autoFillValues as Record<string, unknown>,
        });
      }
      suggestions.push(...generateNotesSuggestions(lowerQuery, proposals, limit - suggestions.length));
      break;

    default:
      suggestions.push(...generateGenericSuggestions(lowerQuery, proposals, limit));
  }

  return suggestions.slice(0, limit);
}

function generateCountrySuggestions(query: string, proposals: Proposal[], limit: number): AISuggestion[] {
  const suggestions: AISuggestion[] = [];

  // Get countries from proposals
  const proposalCountries = proposals
    .flatMap(p => p.content.markets?.map(m => ({ country: m.country, proposalId: p.id, proposalTitle: p.content.title })) || [])
    .filter(Boolean);

  // Common countries
  const allCountries = [
    'USA', 'UK', 'Germany', 'France', 'Japan', 'Brazil', 'India', 'China', 'Turkey',
    'Spain', 'Italy', 'Canada', 'Australia', 'Mexico', 'South Korea', 'Netherlands',
  ];

  // Filter by query
  const matchingCountries = allCountries.filter(c => c.toLowerCase().includes(query));

  for (const country of matchingCountries.slice(0, limit)) {
    const fromProposal = proposalCountries.find(pc => pc.country === country);
    suggestions.push({
      id: uuid(),
      text: country,
      type: fromProposal ? 'reference' : 'value',
      confidence: fromProposal ? 0.95 : 0.8,
      sourceProposalId: fromProposal?.proposalId,
      sourceProposalTitle: fromProposal?.proposalTitle,
    });
  }

  return suggestions;
}

function generateSampleSizeSuggestions(query: string, proposals: Proposal[], limit: number): AISuggestion[] {
  const suggestions: AISuggestion[] = [];

  // Common sample sizes based on study type
  const sampleSizeRecommendations = [
    { keyword: 'brand', size: 500, desc: 'Brand Tracking standard' },
    { keyword: 'tracking', size: 500, desc: 'Tracking study' },
    { keyword: 'concept', size: 200, desc: 'Concept test (per concept)' },
    { keyword: 'large', size: 1000, desc: 'Large scale study' },
    { keyword: 'qual', size: 30, desc: 'Qualitative study' },
    { keyword: 'focus', size: 8, desc: 'Focus group (per group)' },
    { keyword: 'pilot', size: 100, desc: 'Pilot study' },
    { keyword: 'national', size: 1500, desc: 'Nationally representative' },
    { keyword: 'u&a', size: 800, desc: 'Usage & Attitude study' },
    { keyword: 'segment', size: 1000, desc: 'Segmentation study' },
  ];

  // Filter by query
  const matching = sampleSizeRecommendations.filter(r => query.includes(r.keyword));

  if (matching.length === 0) {
    // Show common defaults
    suggestions.push(
      { id: uuid(), text: '500', type: 'value', confidence: 0.85, metadata: { description: 'Standard sample size' } },
      { id: uuid(), text: '1000', type: 'value', confidence: 0.8, metadata: { description: 'Large sample' } },
      { id: uuid(), text: '300', type: 'value', confidence: 0.75, metadata: { description: 'Small to medium' } },
    );
  } else {
    for (const rec of matching.slice(0, limit)) {
      suggestions.push({
        id: uuid(),
        text: rec.size.toString(),
        type: 'value',
        confidence: 0.9,
        metadata: { description: rec.desc },
      });
    }
  }

  // Add suggestions from proposals
  const proposalSizes = proposals
    .filter(p => p.content.sampleSize)
    .map(p => ({ size: p.content.sampleSize!, proposalId: p.id, proposalTitle: p.content.title }));

  for (const ps of proposalSizes.slice(0, 2)) {
    if (!suggestions.some(s => s.text === ps.size.toString())) {
      suggestions.push({
        id: uuid(),
        text: ps.size.toString(),
        type: 'reference',
        confidence: 0.85,
        sourceProposalId: ps.proposalId,
        sourceProposalTitle: ps.proposalTitle,
      });
    }
  }

  return suggestions.slice(0, limit);
}

function generateMethodologySuggestions(query: string, limit: number): AISuggestion[] {
  const methodologies = [
    { value: 'online_survey', label: 'Online Survey (CAWI)', keywords: ['online', 'web', 'cawi', 'digital'] },
    { value: 'telephone', label: 'Telephone (CATI)', keywords: ['phone', 'telephone', 'cati', 'call'] },
    { value: 'face_to_face', label: 'Face-to-Face (CAPI)', keywords: ['face', 'f2f', 'person', 'capi'] },
    { value: 'mobile', label: 'Mobile Survey', keywords: ['mobile', 'app', 'sms'] },
    { value: 'qualitative_idi', label: 'In-Depth Interviews', keywords: ['qualitative', 'idi', 'interview', 'depth'] },
    { value: 'focus_groups', label: 'Focus Groups', keywords: ['focus', 'group', 'fgd', 'discussion'] },
  ];

  const matching = methodologies.filter(m => m.keywords.some(kw => query.includes(kw)));

  if (matching.length === 0) {
    return methodologies.slice(0, limit).map(m => ({
      id: uuid(),
      text: m.label,
      type: 'value' as const,
      confidence: 0.7,
      metadata: { value: m.value },
    }));
  }

  return matching.slice(0, limit).map(m => ({
    id: uuid(),
    text: m.label,
    type: 'value' as const,
    confidence: 0.9,
    metadata: { value: m.value },
  }));
}

function generateAudienceSuggestions(query: string, limit: number): AISuggestion[] {
  const audiences = [
    { value: 'general_population', label: 'General Population', keywords: ['general', 'pop', 'nat rep'] },
    { value: 'category_users', label: 'Category Users', keywords: ['category', 'user', 'buyer', 'purchaser'] },
    { value: 'brand_users', label: 'Brand Users', keywords: ['brand', 'loyal', 'customer'] },
    { value: 'lapsed_users', label: 'Lapsed Users', keywords: ['lapsed', 'former', 'ex', 'stopped'] },
    { value: 'non_users', label: 'Non-Users', keywords: ['non', 'never', 'aware'] },
    { value: 'b2b', label: 'B2B Decision Makers', keywords: ['b2b', 'business', 'decision', 'professional'] },
  ];

  const matching = audiences.filter(a => a.keywords.some(kw => query.includes(kw)));

  if (matching.length === 0) {
    return audiences.slice(0, limit).map(a => ({
      id: uuid(),
      text: a.label,
      type: 'value' as const,
      confidence: 0.7,
      metadata: { value: a.value },
    }));
  }

  return matching.slice(0, limit).map(a => ({
    id: uuid(),
    text: a.label,
    type: 'value' as const,
    confidence: 0.9,
    metadata: { value: a.value },
  }));
}

function generateCriteriaSuggestions(query: string, limit: number): AISuggestion[] {
  const suggestions: AISuggestion[] = [];

  // Gender
  if (query.includes('male')) {
    suggestions.push({ id: uuid(), text: 'Male', type: 'value', confidence: 0.95 });
  }
  if (query.includes('female')) {
    suggestions.push({ id: uuid(), text: 'Female', type: 'value', confidence: 0.95 });
  }

  // Income
  if (query.includes('income') || query.includes('affluent') || query.includes('wealthy')) {
    suggestions.push({ id: uuid(), text: 'High Income', type: 'value', confidence: 0.85 });
    suggestions.push({ id: uuid(), text: 'Upper Middle Income', type: 'value', confidence: 0.8 });
  }

  // Urban/Rural
  if (query.includes('urban') || query.includes('city')) {
    suggestions.push({ id: uuid(), text: 'Urban', type: 'value', confidence: 0.9 });
  }
  if (query.includes('rural') || query.includes('countryside')) {
    suggestions.push({ id: uuid(), text: 'Rural', type: 'value', confidence: 0.9 });
  }

  // Education
  if (query.includes('education') || query.includes('degree') || query.includes('graduate')) {
    suggestions.push({ id: uuid(), text: "Bachelor's Degree", type: 'value', confidence: 0.85 });
    suggestions.push({ id: uuid(), text: "Master's Degree", type: 'value', confidence: 0.8 });
  }

  // Employment
  if (query.includes('employ') || query.includes('work') || query.includes('job')) {
    suggestions.push({ id: uuid(), text: 'Full-time Employed', type: 'value', confidence: 0.85 });
  }

  return suggestions.slice(0, limit);
}

function generateNotesSuggestions(query: string, proposals: Proposal[], limit: number): AISuggestion[] {
  const suggestions: AISuggestion[] = [];

  // Find similar proposals based on keywords
  const keywords = query.split(/\s+/).filter(w => w.length > 3);

  for (const proposal of proposals.slice(0, 20)) {
    const content = [
      proposal.content.title,
      proposal.content.targetDefinition,
      proposal.content.background,
    ].filter(Boolean).join(' ').toLowerCase();

    const matchCount = keywords.filter(kw => content.includes(kw.toLowerCase())).length;

    if (matchCount > 0) {
      suggestions.push({
        id: uuid(),
        text: `Use settings from "${proposal.content.title}"`,
        type: 'reference',
        confidence: Math.min(0.9, 0.5 + matchCount * 0.1),
        sourceProposalId: proposal.id,
        sourceProposalTitle: proposal.content.title,
        metadata: {
          sampleSize: proposal.content.sampleSize,
          markets: proposal.content.markets?.map(m => m.country),
        },
      });
    }
  }

  return suggestions.slice(0, limit);
}

function generateGenericSuggestions(query: string, proposals: Proposal[], limit: number): AISuggestion[] {
  const suggestions: AISuggestion[] = [];

  // Search through proposal titles and clients
  for (const proposal of proposals) {
    const titleMatch = proposal.content.title?.toLowerCase().includes(query);
    const clientMatch = proposal.content.client?.toLowerCase().includes(query);

    if (titleMatch || clientMatch) {
      suggestions.push({
        id: uuid(),
        text: titleMatch ? proposal.content.title : proposal.content.client!,
        type: 'reference',
        confidence: titleMatch ? 0.9 : 0.85,
        sourceProposalId: proposal.id,
        sourceProposalTitle: proposal.content.title,
      });
    }
  }

  return suggestions.slice(0, limit);
}
