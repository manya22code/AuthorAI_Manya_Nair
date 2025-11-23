
import { Project, DocumentType } from './types';

export const initialProjects: Project[] = [
  {
    id: 'proj-1',
    title: 'Q3 Marketing Strategy',
    mainTopic: 'A comprehensive marketing strategy for the launch of our new product line in Q3.',
    docType: DocumentType.POWERPOINT,
    structure: [
      { id: 's1', title: 'Introduction & Agenda', content: '### Welcome\n- Overview of today\'s discussion\n- Key objectives for Q3', refinements: [], feedback: {}, status: 'done' },
      { id: 's2', title: 'Market Analysis', content: '#### Competitor Landscape\n- **Competitor A:** Strengths, Weaknesses\n- **Competitor B:** Market Share, Recent Moves', refinements: [], feedback: { liked: true }, status: 'done' },
      { id: 's3', title: 'Target Audience', content: 'Defining our ideal customer profile and segmentation.', refinements: [], feedback: {}, status: 'pending' },
    ],
  },
    {
    id: 'proj-2',
    title: 'Annual Performance Review',
    mainTopic: 'An internal report summarizing the company\'s performance over the last fiscal year.',
    docType: DocumentType.WORD,
    structure: [
      { id: 's1', title: 'Executive Summary', content: 'A high-level overview of the key findings and results from the past year.', refinements: [], feedback: {}, status: 'done' },
      { id: 's2', title: 'Financial Performance', content: 'Detailed analysis of revenue, profit margins, and ROI.', refinements: [], feedback: {}, status: 'pending' },
    ],
  },
];
