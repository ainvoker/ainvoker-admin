import React from 'react';
import { RefreshCw } from 'lucide-react';
import { TabType } from '../../types';

interface HeaderProps {
  currentTab: TabType;
  environment: 'production' | 'staging';
  setEnvironment: (env: 'production' | 'staging') => void;
  timeRange: string;
  setTimeRange: (range: string) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  environment,
  setEnvironment,
  timeRange,
  setTimeRange,
  onRefresh,
  isRefreshing = false,
}) => {
  const getTabDetails = () => {
    switch (currentTab) {
      case 'dashboard':
        return {
          title: 'Dashboard',
          subtitle: 'Monitor inference traffic, model health, and platform telemetry.',
        };
      case 'users':
        return {
          title: 'User & Tenant Management',
          subtitle: 'Provision accounts, assign role-based access control (RBAC), and oversee quotas.',
        };
      case 'models':
        return {
          title: 'Model Routing & Provider Health',
          subtitle: 'Real-time telemetry, fallback failovers, and cost matrix per provider.',
        };
      case 'logs':
        return {
          title: 'Inference & Audit Logs',
          subtitle: 'Real-time gateway request stream, token telemetry, latency, and status codes.',
        };
      case 'apikeys':
        return {
          title: 'API Keys & Rate Limits',
          subtitle: 'Issue master keys, configure RPM/TPM thresholds, and inspect key usage.',
        };
      case 'health':
        return {
          title: 'System Health & Node Status',
          subtitle: 'Ingress proxy load, Redis cache hit ratio, and edge gateway latency.',
        };
      case 'settings':
        return {
          title: 'System Settings',
          subtitle: 'Configure global proxy parameters, webhook destinations, and security policies.',
        };
      default:
        return {
          title: 'AInvoker Console',
          subtitle: 'Admin control plane',
        };
    }
  };

  const { title, subtitle } = getTabDetails();

  return (
    <header
      id="main-header"
      className="px-6 md:px-8 pt-6 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#27272a] bg-[#09090b]"
    >
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-bold text-[#fafafa] tracking-tight">
            {title}
          </h1>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Gateway Live
          </span>
        </div>
        <p className="text-xs text-[#a1a1aa] mt-0.5 max-w-2xl">
          {subtitle}
        </p>
      </div>

      {/* Control Actions Bar */}
      <div className="flex items-center flex-wrap gap-2">
        {/* Environment Toggle */}
        <div className="flex items-center bg-[#18181b] p-0.5 rounded-md border border-[#27272a]">
          <button
            onClick={() => setEnvironment('production')}
            className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${
              environment === 'production'
                ? 'bg-[#27272a] text-[#fafafa]'
                : 'text-[#a1a1aa] hover:text-[#fafafa]'
            }`}
          >
            Production
          </button>
          <button
            onClick={() => setEnvironment('staging')}
            className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${
              environment === 'staging'
                ? 'bg-[#27272a] text-[#fafafa]'
                : 'text-[#a1a1aa] hover:text-[#fafafa]'
            }`}
          >
            Staging
          </button>
        </div>

        {/* Time Range Filter */}
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-[#18181b] text-xs font-medium text-[#fafafa] border border-[#27272a] rounded-md px-2.5 py-1 focus:outline-none focus:border-[#3f3f46] cursor-pointer"
        >
          <option value="24h">Past 24 Hours</option>
          <option value="7d">Past 7 Days</option>
          <option value="30d">This Month</option>
          <option value="90d">Past 90 Days</option>
        </select>

        {/* Refresh Button */}
        <button
          id="refresh-telemetry-btn"
          onClick={onRefresh}
          className="p-1.5 bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-[#fafafa] rounded-md border border-[#27272a] transition-colors flex items-center justify-center"
          title="Refresh Data"
        >
          <RefreshCw
            size={13}
            className={isRefreshing ? 'animate-spin text-[#fafafa]' : ''}
          />
        </button>
      </div>
    </header>
  );
};
