export type TabType =
  | 'dashboard'
  | 'users'
  | 'models'
  | 'logs'
  | 'apikeys'
  | 'health'
  | 'settings';

export interface WorkspaceInfo {
  id: string;
  name: string;
  role: 'Owner' | 'Admin' | 'Member';
  plan: 'free' | 'pro' | 'enterprise';
  status: 'ACTIVE' | 'WARNING' | 'SUSPENDED';
}

export interface MetricCardData {
  title: string;
  value: string | number;
  subtext: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export interface ProjectItem {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  requestCount: number;
  tokenCount: number;
  status: 'active' | 'archived';
  apiKeysCount: number;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'Super Admin' | 'Admin' | 'Developer' | 'Viewer';
  plan: 'Free' | 'Pro' | 'Enterprise';
  status: 'Active' | 'Invited' | 'Suspended';
  requestsMonth: number;
  joinedDate: string;
}

export interface ModelRoute {
  id: string;
  name: string;
  provider: 'Google' | 'OpenAI' | 'Anthropic' | 'DeepSeek' | 'Meta';
  modelId: string;
  status: 'operational' | 'degraded' | 'maintenance';
  avgLatencyMs: number;
  successRate: number;
  totalCallsMonth: number;
  costPer1kInput: number;
  costPer1kOutput: number;
}

export interface InferenceLog {
  id: string;
  timestamp: string;
  projectId: string;
  projectName: string;
  model: string;
  statusCode: number;
  latencyMs: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
  ipAddress: string;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  projectId: string;
  projectName: string;
  rpmLimit: number;
  tpmLimit: number;
  lastUsed: string;
  createdAt: string;
  status: 'active' | 'revoked';
}
