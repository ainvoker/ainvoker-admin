import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { StatCards } from './components/dashboard/StatCards';
import { UsersView } from './components/admin/UsersView';
import { ModelsView } from './components/admin/ModelsView';
import { InferenceLogsView } from './components/admin/InferenceLogsView';
import { ApiKeysView } from './components/admin/ApiKeysView';
import { SystemHealthView } from './components/admin/SystemHealthView';
import { SettingsView } from './components/admin/SettingsView';
import { CreateApiKeyModal } from './components/modals/CreateApiKeyModal';
import {
  TabType,
  UserAccount,
  ModelRoute,
  InferenceLog,
  ApiKeyItem,
} from './types';
import {
  sampleUsers,
  sampleModels,
  sampleLogs,
  sampleApiKeys,
} from './data/mockData';

export default function App() {
  // Navigation & dashboard state
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [environment, setEnvironment] = useState<'production' | 'staging'>('production');
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Toggle between Initial Empty State (matching exact screenshot) and Populated Live State
  const [useEmptyState, setUseEmptyState] = useState<boolean>(true);

  // Data Collections
  const [users, setUsers] = useState<UserAccount[]>(sampleUsers);
  const [models, setModels] = useState<ModelRoute[]>(sampleModels);
  const [logs, setLogs] = useState<InferenceLog[]>(sampleLogs);
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>(sampleApiKeys);

  // Modal States
  const [isCreateApiKeyOpen, setIsCreateApiKeyOpen] = useState(false);

  // Handlers
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const handleToggleStateMode = (empty: boolean) => {
    setUseEmptyState(empty);
  };

  const handleAddUser = (newUser: Partial<UserAccount>) => {
    const created: UserAccount = {
      id: `usr_${Date.now()}`,
      name: newUser.name || 'New User',
      email: newUser.email || 'user@ainvoker.io',
      avatarUrl: newUser.avatarUrl,
      role: newUser.role || 'Developer',
      plan: 'Pro',
      status: 'Invited',
      requestsMonth: 0,
      joinedDate: 'Just now',
    };
    setUsers((prev) => [created, ...prev]);
  };

  const handleUpdateRole = (userId: string, newRole: UserAccount['role']) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const handleToggleModelStatus = (modelId: string) => {
    setModels((prev) =>
      prev.map((m) => {
        if (m.id === modelId) {
          const next =
            m.status === 'operational' ? 'maintenance' : 'operational';
          return { ...m, status: next };
        }
        return m;
      })
    );
  };

  const handleAddApiKey = (newKey: Partial<ApiKeyItem>) => {
    const created: ApiKeyItem = {
      id: `key_${Date.now()}`,
      name: newKey.name || 'API Key',
      keyPrefix: newKey.keyPrefix || 'ainv_live_99x...',
      projectId: newKey.projectId || 'platform',
      projectName: newKey.projectName || 'Platform',
      rpmLimit: newKey.rpmLimit || 600,
      tpmLimit: newKey.tpmLimit || 100000,
      lastUsed: 'Never',
      createdAt: 'Just now',
      status: 'active',
    };
    setApiKeys((prev) => [created, ...prev]);
  };

  const handleRevokeApiKey = (keyId: string) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== keyId));
  };

  const handleTriggerSimulatedRequest = () => {
    const randomModels = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gpt-4o', 'claude-3-5-sonnet'];
    const selectedModel = randomModels[Math.floor(Math.random() * randomModels.length)];
    const pTokens = Math.floor(Math.random() * 800) + 120;
    const cTokens = Math.floor(Math.random() * 400) + 40;
    const newLog: InferenceLog = {
      id: `req_${Math.random().toString(16).substring(2, 10)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      projectId: 'proj_01',
      projectName: 'Customer Support Agent',
      model: selectedModel,
      statusCode: 200,
      latencyMs: Math.floor(Math.random() * 350) + 120,
      promptTokens: pTokens,
      completionTokens: cTokens,
      totalTokens: pTokens + cTokens,
      costUsd: (pTokens * 0.000075 + cTokens * 0.0003) / 1000,
      ipAddress: '192.168.1.42',
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex font-sans antialiased selection:bg-[#27272a] selection:text-[#fafafa]">
      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        userName="Eazy James"
        userEmail="patrickblando28@gmail.com"
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen overflow-y-auto bg-[#09090b]">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          environment={environment}
          setEnvironment={setEnvironment}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {/* View Content */}
        <div className="p-6 md:p-8 space-y-6 max-w-7xl">
          {/* State Mode Banner for Demo / Testing */}
          <div className="flex items-center justify-between bg-[#18181b] border border-[#27272a] rounded-lg px-4 py-2 text-xs text-[#a1a1aa]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-950" />
              <span className="font-semibold text-[#fafafa]">Layout Mode:</span>
              <span>{useEmptyState ? 'Screenshot Match (Empty State)' : 'Active Telemetry'}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleToggleStateMode(true)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  useEmptyState
                    ? 'bg-[#27272a] text-[#fafafa] border border-[#3f3f46]'
                    : 'text-[#a1a1aa] hover:text-[#fafafa]'
                }`}
              >
                Zero Usage (Screenshot)
              </button>
              <button
                onClick={() => handleToggleStateMode(false)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  !useEmptyState
                    ? 'bg-[#27272a] text-[#fafafa] border border-[#3f3f46]'
                    : 'text-[#a1a1aa] hover:text-[#fafafa]'
                }`}
              >
                Populated Sample Data
              </button>
            </div>
          </div>

          {/* Tab Routing */}
          {currentTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Stat Metric Cards */}
              <StatCards
                requestsCount={useEmptyState ? 0 : 17980}
                tokensCount={useEmptyState ? 0 : 8675000}
                successRate={useEmptyState ? '—' : '99.8%'}
                okCount={useEmptyState ? 0 : 17945}
                failedCount={useEmptyState ? 0 : 35}
              />
            </div>
          )}

          {currentTab === 'users' && (
            <UsersView
              users={users}
              onAddUser={handleAddUser}
              onUpdateRole={handleUpdateRole}
              onToggleStatus={handleToggleUserStatus}
            />
          )}

          {currentTab === 'models' && (
            <ModelsView
              models={models}
              onToggleModelStatus={handleToggleModelStatus}
            />
          )}

          {currentTab === 'logs' && (
            <InferenceLogsView
              logs={logs}
              onTriggerSimulatedRequest={handleTriggerSimulatedRequest}
            />
          )}

          {currentTab === 'apikeys' && (
            <ApiKeysView
              apiKeys={apiKeys}
              onCreateKey={() => setIsCreateApiKeyOpen(true)}
              onRevokeKey={handleRevokeApiKey}
            />
          )}

          {currentTab === 'health' && <SystemHealthView />}

          {currentTab === 'settings' && <SettingsView />}
        </div>
      </main>

      {/* Modals */}
      <CreateApiKeyModal
        isOpen={isCreateApiKeyOpen}
        onClose={() => setIsCreateApiKeyOpen(false)}
        onCreate={handleAddApiKey}
      />
    </div>
  );
}
