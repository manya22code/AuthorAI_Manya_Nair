export enum AppState {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  CONFIGURATION = 'CONFIGURATION',
  EDITOR = 'EDITOR',
}

export enum DocumentType {
  WORD = 'docx',
  POWERPOINT = 'pptx',
}

export interface Feedback {
  liked?: boolean;
  comment?: string;
}

export interface Refinement {
  prompt: string;
  generatedContent: string;
  timestamp: string;
}

export interface DocumentSection {
  id: string;
  title: string;
  content: string;
  refinements: Refinement[];
  feedback: Feedback;
  status: 'pending' | 'generating' | 'done' | 'error';
}

export interface Project {
  id: string | number;
  title: string;
  mainTopic: string;
  docType: DocumentType;
  structure: DocumentSection[];
  owner_id?: number;
}