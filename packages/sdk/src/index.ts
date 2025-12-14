// Aurora Scholar SDK - Shared types and utilities

// ===========================================
// Article Types
// ===========================================

export interface Article {
  id: string;
  title: string;
  abstract?: string;
  content: string;
  authorWallet: string;
  arweaveId?: string;
  solanaTxId?: string;
  contentHash: string;
  isPublic: boolean;
  status: ArticleStatus;
  createdAt: Date;
  publishedAt?: Date;
}

export type ArticleStatus = 'DRAFT' | 'PUBLISHED';

export interface CreateArticleRequest {
  title: string;
  content: string;
  abstract?: string;
  isPublic: boolean;
  expiresIn?: AccessExpiration;
}

export interface PublishArticleResponse {
  success: boolean;
  articleId: string;
  arweaveId: string;
  solanaTxId: string;
  contentHash: string;
  explorerUrl: string;
  arweaveUrl: string;
  privateLink?: string;
}

// ===========================================
// Access Control Types
// ===========================================

export type AccessExpiration = '24h' | '7d' | '30d' | 'unlimited';

export interface AccessToken {
  id: string;
  articleId: string;
  token: string;
  expiresAt?: Date;
  createdAt: Date;
}

export interface GenerateAccessTokenRequest {
  articleId: string;
  expiresIn: AccessExpiration;
}

// ===========================================
// AI Assistant Types
// ===========================================

export interface AIAnalysisRequest {
  text: string;
  sources: Source[];
  cursorPosition?: number;
  agentConfig?: AgentConfig;
}

export interface AIAnalysisResponse {
  suggestions: Suggestion[];
  corrections: Correction[];
  references: Reference[];
  warnings: Warning[];
  authenticityAlerts: AuthenticityAlert[];
  timestamp: number;
}

export interface AIChatRequest {
  question: string;
  text: string;
  cursorPosition?: number;
  sources: Source[];
  chatHistory?: ChatMessage[];
  agentConfig?: AgentConfig;
}

export interface AIChatResponse {
  answer: string;
  suggestions?: string[];
  references?: Reference[];
  timestamp: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Suggestion {
  id: string;
  type: 'structure' | 'content' | 'style' | 'reference';
  text: string;
  position?: { start: number; end: number };
  priority: 'low' | 'medium' | 'high';
}

export interface Correction {
  id: string;
  original: string;
  suggested: string;
  reason: string;
  position: { start: number; end: number };
}

export interface Reference {
  id: string;
  sourceId: string;
  text: string;
  relevance: number;
}

export interface Warning {
  id: string;
  type: 'ethics' | 'plagiarism' | 'structure';
  message: string;
  severity: 'info' | 'warning' | 'error';
}

export interface AuthenticityAlert {
  id: string;
  message: string;
  confidence: number;
  suggestion: string;
}

// ===========================================
// Source Types
// ===========================================

export interface Source {
  id: string;
  name: string;
  type: SourceType;
  content?: string;
  url?: string;
  uploadedAt: Date;
}

export type SourceType = 'pdf' | 'text' | 'image' | 'video' | 'audio';

// ===========================================
// Agent Configuration Types
// ===========================================

export interface AgentConfig {
  id: string;
  name: string;
  type: AgentType;
  prompt: string;
  rules: string[];
  style?: string;
  tone?: AgentTone;
  knowledgeAreas?: string[];
  ethicalLimits?: string[];
  sourceId?: string;
  authorName?: string;
}

export type AgentType = 'DEFAULT' | 'AUTHOR_BASED' | 'SOURCE_BASED' | 'DATA_BASED';
export type AgentTone = 'formal' | 'informal' | 'critical' | 'neutral';

// ===========================================
// Blockchain Types
// ===========================================

export interface OnChainArticle {
  author: string;
  arweaveId: string;
  contentHash: string;
  title: string;
  isPublic: boolean;
  timestamp: number;
}

// ===========================================
// API Response Types
// ===========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ===========================================
// Utility Functions
// ===========================================

export function shortenWallet(wallet: string, chars = 4): string {
  if (!wallet || wallet.length < chars * 2) return wallet;
  return `${wallet.slice(0, chars)}...${wallet.slice(-chars)}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function calculateExpirationDate(expiresIn: AccessExpiration): Date | null {
  if (expiresIn === 'unlimited') return null;

  const now = new Date();
  switch (expiresIn) {
    case '24h':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}
