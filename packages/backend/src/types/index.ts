export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
  role: 'user' | 'admin' | 'moderator';
  subscriptionPlan: 'free' | 'pro' | 'business' | 'enterprise';
  creditsBalance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Prompt {
  id: string;
  userId: string;
  title: string;
  description?: string;
  content: string;
  aiModel: 'chatgpt' | 'gemini' | 'claude' | 'grok' | 'deepseek' | 'llama' | 'mistral';
  category?: string;
  tags?: string[];
  clarityScore?: number;
  contextScore?: number;
  completenessScore?: number;
  structureScore?: number;
  aiCompatibilityScore?: number;
  overallScore?: number;
  isPublic: boolean;
  isFavorite: boolean;
  viewsCount: number;
  usesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PromptTemplate {
  id: string;
  title: string;
  description?: string;
  content: string;
  category: string;
  aiModels: string[];
  tags?: string[];
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  isFeatured: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PromptHistory {
  id: string;
  userId: string;
  promptId?: string;
  content: string;
  aiModel: string;
  action: 'create' | 'update' | 'delete' | 'generate' | 'optimize';
  createdAt: Date;
}

export interface AuthRequest {
  email?: string;
  username?: string;
  password?: string;
  token?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: number;
}
