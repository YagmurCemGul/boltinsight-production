import type {
  MentionEntity,
  MentionEntityType,
  ProposalContext,
  ClientContext,
  ProjectContext,
  CalculatorAutoFill,
  CalculatorType,
  Methodology,
  ProposalRef,
} from '@/types/calculator';
import type { Proposal, Project } from '@/types';

// Extract unique clients from proposals
export function extractClientsFromProposals(proposals: Proposal[]): ClientContext[] {
  const clientMap = new Map<string, ClientContext>();

  proposals.forEach((proposal) => {
    const clientName = proposal.content.client;
    if (!clientName) return;

    const clientId = clientName.toLowerCase().replace(/\s+/g, '-');

    if (!clientMap.has(clientId)) {
      clientMap.set(clientId, {
        id: clientId,
        name: clientName,
        recentProposals: [],
        totalProjects: 0,
        commonCountries: [],
      });
    }

    const client = clientMap.get(clientId)!;
    client.totalProjects = (client.totalProjects || 0) + 1;

    // Add to recent proposals (max 5)
    if (client.recentProposals.length < 5) {
      client.recentProposals.push({
        id: proposal.id,
        title: proposal.content.title || 'Untitled',
        code: proposal.code,
        date: proposal.createdAt,
      });
    }

    // Track methodology
    if (proposal.content.methodology?.type) {
      client.typicalMethodology = proposal.content.methodology.type as Methodology;
    }

    // Track sample sizes
    if (proposal.content.sampleSize) {
      if (!client.averageSampleSize) {
        client.averageSampleSize = proposal.content.sampleSize;
      } else {
        client.averageSampleSize = Math.round(
          (client.averageSampleSize + proposal.content.sampleSize) / 2
        );
      }
    }

    // Track countries
    const countries = proposal.content.markets?.map((m) => m.country) || [];
    countries.forEach((country) => {
      if (country && !client.commonCountries?.includes(country)) {
        client.commonCountries = [...(client.commonCountries || []), country];
      }
    });

    // Update last project date
    const proposalDate = proposal.createdAt;
    if (!client.lastProjectDate || proposalDate > client.lastProjectDate) {
      client.lastProjectDate = proposalDate;
    }
  });

  return Array.from(clientMap.values()).sort((a, b) => {
    // Sort by most recent project
    if (a.lastProjectDate && b.lastProjectDate) {
      return b.lastProjectDate.localeCompare(a.lastProjectDate);
    }
    return (b.totalProjects || 0) - (a.totalProjects || 0);
  });
}

// Convert projects to project contexts
export function extractProjectContexts(projects: Project[], proposals: Proposal[]): ProjectContext[] {
  return projects.map((project) => {
    const projectProposals = proposals.filter((p) => {
      // Match by project reference if available
      return p.projectId === project.id;
    });

    return {
      id: project.id,
      name: project.name,
      client: projectProposals[0]?.content.client,
      proposals: projectProposals.map((p) => ({
        id: p.id,
        title: p.content.title || 'Untitled',
        code: p.code,
        date: p.createdAt,
      })),
      status: 'active' as const,
      methodology: projectProposals[0]?.content.methodology?.type as Methodology,
      targetSampleSize: projectProposals[0]?.content.sampleSize,
      targetCountries: projectProposals[0]?.content.markets?.map((m) => m.country),
    };
  });
}

// Convert proposal to mention entity
export function proposalToMentionEntity(proposal: Proposal): MentionEntity {
  const countries = proposal.content.markets?.map((m) => m.country) || [];

  return {
    id: proposal.id,
    type: 'proposal',
    label: proposal.content.title || 'Untitled',
    subLabel: proposal.code,
    metadata: {
      id: proposal.id,
      title: proposal.content.title || 'Untitled',
      code: proposal.code,
      methodology: proposal.content.methodology?.type,
      sampleSize: proposal.content.sampleSize,
      countries: countries.length > 0 ? countries : undefined,
      loi: proposal.content.loi,
    } as ProposalContext,
  };
}

// Convert client context to mention entity
export function clientToMentionEntity(client: ClientContext): MentionEntity {
  return {
    id: client.id,
    type: 'client',
    label: client.name,
    subLabel: `${client.totalProjects || 0} projects`,
    metadata: client,
  };
}

// Convert project context to mention entity
export function projectToMentionEntity(project: ProjectContext): MentionEntity {
  return {
    id: project.id,
    type: 'project',
    label: project.name,
    subLabel: project.client,
    metadata: project,
  };
}

// Search entities by query
export function searchEntities(
  query: string,
  proposals: Proposal[],
  projects: Project[],
  entityTypes: MentionEntityType[] = ['proposal', 'client', 'project']
): MentionEntity[] {
  const results: MentionEntity[] = [];
  const searchTerm = query.toLowerCase().trim();

  // Search proposals
  if (entityTypes.includes('proposal')) {
    const matchingProposals = proposals
      .filter((p) => p.status !== 'deleted')
      .filter((p) => {
        const title = p.content.title?.toLowerCase() || '';
        const code = p.code?.toLowerCase() || '';
        const client = p.content.client?.toLowerCase() || '';
        return (
          title.includes(searchTerm) ||
          code.includes(searchTerm) ||
          client.includes(searchTerm)
        );
      })
      .slice(0, 5);

    results.push(...matchingProposals.map(proposalToMentionEntity));
  }

  // Search clients
  if (entityTypes.includes('client')) {
    const clients = extractClientsFromProposals(proposals);
    const matchingClients = clients
      .filter((c) => c.name.toLowerCase().includes(searchTerm))
      .slice(0, 3);

    results.push(...matchingClients.map(clientToMentionEntity));
  }

  // Search projects
  if (entityTypes.includes('project')) {
    const matchingProjects = projects
      .filter((p) => p.name.toLowerCase().includes(searchTerm))
      .slice(0, 3);

    const projectContexts = extractProjectContexts(matchingProjects, proposals);
    results.push(...projectContexts.map(projectToMentionEntity));
  }

  return results;
}

// Generate auto-fill values from entity
export function getAutoFillFromEntity(
  entity: MentionEntity,
  calculatorType: CalculatorType
): CalculatorAutoFill {
  const autoFill: CalculatorAutoFill = {};

  switch (entity.type) {
    case 'proposal': {
      const ctx = entity.metadata as ProposalContext;
      autoFill.sampleSize = ctx.sampleSize;
      autoFill.countries = ctx.countries;
      autoFill.loi = ctx.loi;
      if (ctx.methodology) {
        autoFill.methodology = ctx.methodology as Methodology;
      }
      break;
    }

    case 'client': {
      const ctx = entity.metadata as ClientContext;
      autoFill.sampleSize = ctx.averageSampleSize;
      autoFill.countries = ctx.commonCountries;
      autoFill.methodology = ctx.typicalMethodology;
      break;
    }

    case 'project': {
      const ctx = entity.metadata as ProjectContext;
      autoFill.sampleSize = ctx.targetSampleSize;
      autoFill.countries = ctx.targetCountries;
      autoFill.methodology = ctx.methodology;
      break;
    }
  }

  // Add calculator-specific defaults
  switch (calculatorType) {
    case 'sample':
      autoFill.confidenceLevel = autoFill.confidenceLevel || 95;
      autoFill.marginOfError = autoFill.marginOfError || 5;
      break;

    case 'moe':
      autoFill.confidenceLevel = autoFill.confidenceLevel || 95;
      break;

    case 'feasibility':
      autoFill.timeline = autoFill.timeline || 14;
      autoFill.incidenceRate = autoFill.incidenceRate || 30;
      break;

    case 'demographics':
      // Default to Turkey if no countries specified
      if (!autoFill.countries || autoFill.countries.length === 0) {
        autoFill.countries = ['Turkey'];
      }
      break;
  }

  return autoFill;
}

// Get entity type icon/color config
export function getEntityTypeConfig(type: MentionEntityType) {
  const configs = {
    proposal: {
      icon: 'FileText',
      color: 'text-[#5B50BD]',
      bgColor: 'bg-[#EDE9F9]',
      label: 'Proposal',
    },
    client: {
      icon: 'Building2',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      label: 'Client',
    },
    project: {
      icon: 'FolderOpen',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      label: 'Project',
    },
  };

  return configs[type];
}

// Format entity display info
export function formatEntityInfo(entity: MentionEntity): string[] {
  const info: string[] = [];

  switch (entity.type) {
    case 'proposal': {
      const ctx = entity.metadata as ProposalContext;
      if (ctx.sampleSize) info.push(`n=${ctx.sampleSize}`);
      if (ctx.methodology) info.push(ctx.methodology);
      if (ctx.countries?.length) info.push(ctx.countries.slice(0, 2).join(', '));
      if (ctx.loi) info.push(`${ctx.loi} min`);
      break;
    }

    case 'client': {
      const ctx = entity.metadata as ClientContext;
      if (ctx.totalProjects) info.push(`${ctx.totalProjects} projects`);
      if (ctx.averageSampleSize) info.push(`avg n=${ctx.averageSampleSize}`);
      if (ctx.typicalMethodology) info.push(ctx.typicalMethodology);
      break;
    }

    case 'project': {
      const ctx = entity.metadata as ProjectContext;
      if (ctx.client) info.push(ctx.client);
      info.push(`${ctx.proposals.length} proposals`);
      info.push(ctx.status);
      break;
    }
  }

  return info;
}
