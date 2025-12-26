# BoltInsight - Proposal Management System

A comprehensive AI-powered research proposal management and creation platform built with Next.js, TypeScript, and Tailwind CSS.

## Features

### Sidebar Navigation
- **New Proposal**: Create new proposals using chat-based AI interface or direct editor
- **Search My Proposals**: Search within your own proposals with advanced filters
- **Search All Proposals**: Search across all team proposals with filters (status, date, client)
- **Meta Learnings**: Analytics and insights across all proposals
- **Tools**: Built-in calculators and utilities
- **Library**: Resource management for external links, videos, templates, and methodologies
- **Projects**: Organize proposals into projects (e.g., by client or research type)
- **History**: View and manage all proposals with quick actions

### Proposal Creation
- Chat-based AI interface for guided proposal creation
- Template selection for different research types:
  - Concept Testing
  - Brand Tracking
  - Segmentation Study
  - Usage & Attitude (U&A)
- Direct editor mode with all proposal sections
- File upload support (briefs, images, documents)

### Proposal Content Sections
1. **Title** (Proposal name)
2. **Client & Contact** information
3. **Background / Context**
4. **Business Objectives** (bullet list)
5. **Research Objectives** ("To..." statements)
6. **Burning Questions**
7. **Target Definition**
8. **Sample Size**
9. **Markets** (with language specification)
10. **Quota Recommendations** (AI-assisted)
11. **Advanced Analysis** (AI-recommended)
12. **Reference Projects**

### Workflow Features
- **Save Draft**: Save work in progress
- **Send to Approval**: Submit for review with approver selection
- **Export**: Export to Word/PDF formats
- **Coworking**: Invite collaborators to work together
- **Feasibility Check**: Validate research parameters
- **Versions**: Track and restore previous versions
- **AI Rephrase**: AI-powered content improvement

### Approval System
- Automatic proposal code generation on first submission
- Status tracking: Draft, Pending Approval, Approved, Rejected, On Hold
- Approval history logging
- Comments and feedback system
- Machine learning data collection for improvements

### Meta Learnings & Analytics
- Filter by: Client, Region, Country, Research Type, Status, Author
- Performance metrics by author
- Client analysis
- Trend identification
- AI-powered insights chat

### Tools
1. **Margin of Error Calculator**
   - Calculate MOE from sample size
   - Calculate required sample size from desired MOE
   - Support for finite population correction
   - Quick reference for common scenarios

2. **Demographic Distribution Calculator**
   - Census-based quota calculations
   - Country-specific demographic data
   - Age and gender distribution
   - Export functionality

3. **Feasibility Check**
   - Incidence rate estimation
   - Timeline projection
   - Cost estimation
   - Risk assessment
   - Recommendations

### Library
- External links management
- Video resources
- Methodology guides
- Template storage
- Tag-based organization
- Search and filter capabilities

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand with persistence
- **UI Components**: Custom component library with Radix UI primitives
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # Reusable UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── modal.tsx
│   │   └── ...
│   ├── sidebar/           # Sidebar navigation components
│   │   ├── Sidebar.tsx
│   │   ├── SearchSection.tsx
│   │   ├── ProjectsList.tsx
│   │   └── HistoryList.tsx
│   ├── chat/              # Chat interface for AI interaction
│   │   └── ChatInterface.tsx
│   ├── proposal/          # Proposal editor components
│   │   └── ProposalEditor.tsx
│   ├── meta-learnings/    # Analytics components
│   │   └── MetaLearnings.tsx
│   ├── tools/             # Calculator and utility tools
│   │   ├── MarginOfErrorCalculator.tsx
│   │   ├── DemographicDistribution.tsx
│   │   └── FeasibilityCheck.tsx
│   ├── library/           # Resource library
│   │   └── Library.tsx
│   └── MainContent.tsx    # Main content area controller
├── lib/
│   ├── utils.ts           # Utility functions
│   └── store.ts           # Zustand store
└── types/
    └── index.ts           # TypeScript type definitions
```

## Key Features Details

### Proposal Code Generation
- Format: `BI-YYMM-XXXX` (e.g., BI-2412-0001)
- Generated automatically on first approval submission
- Used for tracking and referencing proposals

### Status Flow
```
Draft → Pending Approval → Approved/Rejected/On Hold
```

### Required Fields for Submission
1. Target Definition
2. Markets (with sample sizes)
3. Sample Size
Exception: BoltChatAI Credit Sales (uses different flow)

### Pricing and Timeline
- Must be added after scope completion
- System calculates based on sample sizes and markets
- Timeline generated in specified format

## License

This project is proprietary software. All rights reserved.
